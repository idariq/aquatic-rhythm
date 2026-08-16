# WAF Baseline di Depan Origin GitHub Pages

Dokumen ini menetapkan baseline **Cloud WAF** (Cloudflare WAF / Sucuri WAF / setara) untuk domain yang diarahkan ke origin GitHub Pages (`*.github.io`).

## Tujuan

- Mengurangi serangan umum aplikasi web (OWASP/common exploit).
- Menurunkan trafik bot berbahaya dan scraping agresif.
- Menahan abuse trafik burst dengan rate limiting.
- Menjaga proteksi DDoS selalu aktif tanpa menunggu insiden.

## Arsitektur target

```text
Visitor -> Cloud WAF (Proxy/CDN) -> GitHub Pages origin
```

> Catatan: GitHub Pages tidak menyediakan WAF native pada level origin. Karena itu WAF harus ditempatkan di layer DNS/proxy (orange-cloud/proxied untuk Cloudflare, atau DNS firewall reverse proxy setara).

---

## Implementasi Cloudflare (direkomendasikan)

### 1) Pastikan domain lewat Cloudflare proxy

1. Pindahkan nameserver domain ke Cloudflare.
2. Pastikan record DNS website bersifat **Proxied** (ikon awan oranye).
3. Pertahankan target origin GitHub Pages sesuai konfigurasi domain saat ini (`CNAME` repo).

### 2) Aktifkan Managed Ruleset (OWASP/common exploit)

Masuk ke **Security -> WAF -> Managed rules**:

- Aktifkan **Cloudflare Managed Ruleset**.
- Aktifkan **OWASP Core Ruleset**.
- Default action awal: **Managed Challenge** (bukan block keras) untuk mengurangi false positive di awal rollout.

### 3) Aktifkan bot mitigation

Masuk ke **Security -> Bots**:

- Aktifkan **Bot Fight Mode** (minimal).
- Jika plan memungkinkan, aktifkan **Super Bot Fight Mode**:
  - Definitely automated -> Block / Managed Challenge.
  - Verified bots (Googlebot, Bingbot) -> Allow.

### 4) Rate limiting untuk jalur sensitif

Masuk ke **Security -> WAF -> Rate limiting rules**.

Buat baseline rule berikut:

- `POST` ke endpoint form (jika ada):
  - Contoh path: `/api/contact`, `/forms/*`, `/subscribe`.
  - Threshold awal: `> 10 request / 1 menit / IP`.
  - Action: **Managed Challenge** selama 10 menit.

- `GET` agresif ke jalur sensitif:
  - Contoh path: `/wp-login.php`, `/xmlrpc.php`, `/admin`, `/login` (meski tidak dipakai, sering jadi target spray).
  - Threshold awal: `> 30 request / 1 menit / IP`.
  - Action: **Block** atau **Managed Challenge**.

- `POST` ke Rhyssa AI chat proxy (`worker/index.js`, endpoint AI **berbayar** — setiap
  request yang lolos rate-limit worker akan memicu panggilan Anthropic API sungguhan,
  beda dari form gratis biasa di atas):
  - Path: `api.aquaticrhythm.com/chat`.
  - Threshold awal: `> 15 request / 1 menit / IP`.
  - Action: **Block** (bukan Managed Challenge — ini endpoint JSON API dipanggil
    oleh JS di browser, bukan form yang diisi manusia langsung, jadi challenge
    interaktif tidak relevan/tidak bisa diselesaikan client di baliknya).
  - Rule WAF ini WAJIB, bukan opsional — `worker/index.js` sendiri sudah punya
    rate limit lunak (12 request/menit/IP, in-memory per-isolate) sebagai lapisan
    pertama, tapi state itu tidak dibagi lintas semua lokasi edge Cloudflare
    (colo lain / isolate baru = counter mulai dari nol lagi). Rule WAF di level
    akun inilah satu-satunya lapisan yang benar-benar global per-IP merentas
    seluruh edge.

> Untuk jalur form/admin generik di atas yang belum dipakai, siapkan rule sebagai
> template dan aktifkan saat endpoint dipublikasikan. Jalur `/chat` di atas
> **sudah live** — rule-nya harus dipasang sekarang, bukan ditunda.

### 5) DDoS protection always-on

Masuk ke **Security -> DDoS**:

- Pastikan proteksi L3/L4 dan HTTP DDoS pada mode **Automatically Mitigate**.
- Aktifkan **Under Attack Mode** hanya saat insiden besar (tidak untuk mode normal harian).

---

## Implementasi Sucuri (alternatif)

Jika memakai Sucuri WAF:

- Set DNS ke proxy Sucuri.
- Aktifkan policy hardening + virtual patching (OWASP/common exploit).
- Aktifkan bot mitigation / bad bot blocking.
- Buat rate limit untuk endpoint form/login.
- Pastikan DDoS mitigation mode selalu aktif.

---

## Monitoring false-positive (1-2 minggu)

Durasi tuning awal: **7-14 hari**.

### Checklist harian/mingguan

1. Pantau log WAF event (challenge/block).
2. Identifikasi URL yang paling sering terpicu.
3. Cek user-agent, ASN, negara, dan pola jam kejadian.
4. Verifikasi apakah request tersebut user legit (analytics/serverless logs).

### Pola tuning yang direkomendasikan

- Ubah action dari `Block` -> `Managed Challenge` jika FP tinggi.
- Tambahkan exception scoped sempit (path + method + cookie/session) untuk trafik valid.
- Naikkan threshold rate limit bertahap (mis. 10 -> 20 req/min) untuk endpoint yang validly bursty.
- Jangan whitelist global IP/UA tanpa scope ketat.

### Exit criteria setelah 2 minggu

- Tidak ada keluhan akses legit terblokir berulang.
- Rasio challenge lolos wajar untuk user manusia.
- Volume bot/abuse menurun, tanpa lonjakan 4xx pada trafik manusia.

---

## Runbook insiden singkat

1. Deteksi lonjakan 4xx/5xx atau traffic anomali.
2. Naikkan sensitivity WAF sementara (atau Under Attack Mode jika perlu).
3. Review top offending IP/ASN/path.
4. Terapkan rule sementara berbasis indikator serangan.
5. Setelah stabil, rollback rule agresif bertahap untuk cegah overblocking.
