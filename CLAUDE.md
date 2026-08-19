# Aquatic Rhythm — Panduan Agen

Laman statik (HTML/CSS/JS vanilla, tiada framework/build step JS runtime —
skrip `scripts/*.mjs`/`*.py` HANYA jana fail statik, tak jalan di
pelayar) utk `aquaticrhythm.com`. Deploy via GitHub Pages terus drpd
cabang `main` (fail `CNAME` root). Cloudflare Worker berasingan
(`worker/index.js`, auto-deploy via `.github/workflows/deploy-worker.yml`
bila `worker/**` berubah) — kemungkinan proksi backend Rhyssa AI. Rujuk
`README.md` utk falsafah produk (ARA — Aquatic Rhythm Alignment) & ciri
penuh; fail ni fokus pada apa yg AGEN perlu tahu supaya tak tersalah
anggap/patah balik keputusan sedia ada.

## Cawangan & PR

**Satu cabang produksi (`main`)** — tiada aliran staging/main berasingan
spt projek Vercel dlm ekosistem Idariq yg lain. Alur kerja: commit pd
cabang kerja → push → `mcp__github__create_pull_request` (base `main`)
→ `mcp__github__merge_pull_request` (`merge_method: "squash"`) →
resync cabang kerja (`git fetch origin main && git reset --hard
origin/main && git push --force-with-lease origin <cabang-kerja>`).

**Tak perlu tunggu/semak CI sebelum merge** (arahan eksplisit user,
2026-08-18 — sama pola dgn repo `zymnotes` dlm ekosistem sama). Lepas
pengesahan tempatan lulus (`npm run check` + `npm run i18n:check`
idempoten, ikut §"Semakan Sebelum Commit" di bawah), squash-merge PR
TERUS tanpa `send_later`/tunggu keputusan check GitHub Actions
(`Syntax, lint, and tests`) — pengesahan tempatan dah cukup, CI cuma
lapisan kedua/rekod, bukan get merge.

## Bahasa

Tulis commit message, huraian PR, & balasan dlm **Bahasa Melayu**
(konvensyen sesi, bukan pilihan sekali sahaja) — kandungan laman
sendiri (artikel, UI) kekal en/id/ja spt biasa, ni khusus meta
(commit/PR/dokumentasi agen).

## i18n — HANYA en/id/ja (BUKAN ms — dibuang 2026-08-18)

**Bahasa Melayu (`ms`) DIBUANG sepenuhnya drpd laman ni** (PR #303,
2026-08-18) — keputusan produk EKSPLISIT: aquarist Malaysia biasanya
cari maklumat hobi akuarium dlm English, bukan BM, jadi `ms` jadi
overhead penyelenggaraan (naturalness fix, semakan register berulang
setiap fasa terjemahan) tanpa audience sebenar — beza drpd `id`/`ja` yg
pasaran mereka memang cari dlm bahasa sendiri utk hobi ni. **JANGAN
cadang/bina semula sokongan `ms`** kecuali user nyatakan keputusan ni
dah berubah secara eksplisit. Sejarah git (`git log --oneline | grep -i
"terjemah\|ARA\|ms"`) masih ada rekod penuh kerja `ms` lama (~35
artikel + siri ARA + Community Stress Lab) kalau perlu rujukan/rollback
di masa depan.

**3 bahasa disokong: `en` (sumber, root), `id`, `ja`.** Setiap
skrip build (`LANGUAGES`/`LANGS` array) & setiap `NAV_LABELS`/
`BNAV_LABELS`/`AR_LANGS` dict merentas fail di bawah MESTI kekal
selaras 2-bahasa ni — kalau tambah bahasa baharu di masa depan,
kemas kini SEMUA tempat ni serentak (senarai penuh dlm §"Pipeline
Build" di bawah), bukan sebahagian.

### Senibina — TIGA templat halaman berasingan, TIGA skrip build

Laman ni ada 3 "bentuk" HTML struktur berbeza, masing² skrip build
sendiri (JANGAN cuba guna satu skrip utk templat lain — regex/kelas
CSS tak sepadan):

1. **Artikel biasa** (`art-*`/`module`/`mod-*` kelas) —
   `scripts/build-i18n.mjs`. Sumber: `translations/<lang>/<slug>.json`
   (schema per-modul: head/intro/modules[]/footer). Usage:
   `node scripts/build-i18n.mjs --lang id [--slug <slug>]` /
   `--all` / `--patch-english` (tambah hreflang kpd sumber Inggeris).
2. **Siri kerangka ARA** (`ara-art-*`/`ara-hub-*` kelas — 7 fail:
   `ara-full-framework` + `ara-s1-foundation`..`ara-s6-ethics`) —
   `scripts/build-ara-i18n.mjs`. Sumber: `translations/<lang>/ara-*.json`
   (schema blok: `blocks[]` dgn `type: body/pq/hn/rhythm-signals/
   domain-grid/signal-list`, kekalkan susunan dokumen). **PENGECUALIAN
   PENTING**: 2 redirect stub (`four-principles-of-ara`,
   `reading-the-five-rhythms`) yg redirect KE `ara-full-framework`
   guna templat ARTIKEL BIASA (tiada markup `ara-art-*`), jadi dibina
   oleh `build-i18n.mjs`, BUKAN `build-ara-i18n.mjs` — sasaran redirect
   dilokalkan terus dlm `build-i18n.mjs`'s `buildArticle()` (step 11,
   khusus 2 slug ni).
3. **Alat interaktif mandiri** (satu fail HTML lengkap, bukan sebahagian
   templat artikel — cth. `community-stress-lab.html`) —
   `scripts/build-csl-i18n.mjs` (contoh sedia ada; alat interaktif
   BAHARU akan perlukan skrip serupa sendiri, model ikut fail ni).
   Sumber: `translations/<lang>/<slug>.json` (bahagian `"html"` sahaja
   — string UI statik/modal/label). **String runtime JS** (label
   dinamik, mesej enjin peraturan, dsb.) TIDAK dlm `translations/` —
   ditanam terus dlm fail JS kongsi (`js/<alat>.js`) sbg jadual
   `<PREFIX>_STRINGS`/fungsi `T(key, subs)`, dipilih ikut
   `document.documentElement.lang` runtime — pola sama `JN_STRINGS`/
   `T()` dlm `js/ui-journal.js`. SATU fail JS dikongsi SEMUA bahasa
   (tiada salinan per-bahasa) — bila tambah bahasa/alat baharu, thread
   `T()` call site demi call site, sahkan struktur (kunci sepadan,
   placeholder `{...}` verbatim) via skrip perbandingan automatik,
   BUKAN percaya laporan agen terjemah sahaja.

**Halaman utama (`index.html`)** — templat KEEMPAT, berasingan lagi
(SPA hab, bukan artikel/alat): `scripts/build-homepage-i18n.py`
(Python, bukan `.mjs`). Sumber: `translations/homepage/<lang>.json`.
**Bukan sebahagian pipeline berulang** (komen dlm fail: "Re-run this
script only if index.html's structure changes and the localized copies
need resyncing") — jalankan MANUAL bila `index.html` (sumber Inggeris)
disunting, BUKAN automatik. **AWAS drift regex**: skrip ni guna regex
literal (cth. `font-size:\.94rem`) yg boleh lapuk bila CSS token tema
disunting (cth. ditukar ke `var(--fs-md)`) — regex GAGAL SENYAP
(`replace_once` cetak amaran "pattern not found" ke console tapi skrip
TAK gagal/exit), hasilnya bahagian tu KEKAL English pd halaman id/ja
walau translations JSON betul. **SENTIASA baca output console utk
amaran "pattern not found" lepas jalankan skrip ni** — kalau ada,
regex tu dah lapuk berbanding `index.html` semasa, kena dikemas kini
(bandingkan literal dlm regex vs teks sebenar dlm `index.html`)
SEBELUM percaya output. Bug ni ditemui & dibetulkan sekali (PR #303,
"tools closing note") — corak yg sama boleh berulang kat regex lain
dlm fail ni bila CSS/HTML sumber disunting di masa depan tanpa
regenerate homepage serentak.

**`localizeArticleLinks(h, lang)`** — fungsi kecil (duplikat dgn
sengaja kpd kesemua 4 skrip build, sama pola "kekal segerak scr
manual") yg jadi LANGKAH TERAKHIR setiap fungsi `buildLang()`/
`buildArticle()`/`buildAraS()`/`buildAraHub()` — scan SELURUH HTML
dijana utk `href="/articles/<slug>"` & naik taraf ke
`/<lang>/articles/<slug>` HANYA jika `translations/<lang>/<slug>.json`
wujud dgn `_meta.status:"ready"` (cache sekali per bahasa). **WAJIB
panggil ni sbg langkah TERAKHIR dlm mana-mana skrip build baharu**
(alat interaktif akan datang, templat baharu, dll.) — tanpanya, mana²
pautan `<a href="/articles/...">` yg terselit dlm kandungan (disalin
verbatim drpd sumber Inggeris semasa terjemah — perenggan, pull
quote, related-article button, dsb.) akan sentiasa tersasar ke
English walau artikel sasaran dah diterjemah. Bug ni ditemui 2026-08-18
(laporan user: navigasi ja/id "auto ke English" bila klik pautan
dlm artikel) — 68+ pautan terjejas merentas 26+ fail sebelum
dibetulkan. Pautan ke artikel yg MEMANG belum diterjemah (cth.
`tank-simulator`/`tank-builder` sblm siap) BETUL kekal fallback ke
English — jangan cuba "betulkan" tu.

**`scripts/check-i18n-sync.mjs`** (`npm run i18n:check`) — regenerate
SEMUA artikel (`build-i18n.mjs --all`) & diff drpd apa yg di working
tree. **Sentiasa akan "gagal" (tunjuk diff) bila ada kerja belum
commit** — ni BUKAN bug, `git diff` bandingkan working tree vs HEAD
(commit terakhir), jadi kerja aktif SEMESTINYA nampak "out of sync"
sehingga di-commit. Cara sah pengesahan: jalankan **DUA kali** &
bandingkan diff-stat — SAMA = regenerasi deterministik/idempoten
(betul), BEZA = ada masalah sebenar. Lepas commit, jalan sekali lagi
patut tunjuk "in sync" (diff kosong).

### Tempat "'ms'"/senarai bahasa perlu SELARAS bila tambah bahasa baharu

(Senarai lengkap 15 tempat dikemas kini bila `ms` dibuang — rujukan
kalau tambah bahasa baharu di masa depan, bukan sebaliknya):
`scripts/build-i18n.mjs` (`LANGUAGES` + `NAV_LABELS`),
`scripts/build-ara-i18n.mjs` (`LANGUAGES` + `NAV_LABELS` + `BNAV_LABELS`),
`scripts/build-csl-i18n.mjs` (`LANGUAGES` + `BNAV_LABELS`),
`scripts/build-reading-index.mjs` (`LANGS` + `ALL_READING_LANGS` +
`UI` dict + `AR_LANGS` switcher list),
`scripts/build-homepage-i18n.py` (`LANGUAGES` + `LANG_LABEL` + ~8 dict
per-field),
`scripts/extract-i18n.mjs` (`LANGUAGES`),
`scripts/gen-og-images.mjs` (`LANGS`),
`scripts/update-sitemap.mjs` (`LANGS`),
`scripts/check-i18n-sync.mjs` (`WATCHED_DIRS`),
`js/ui-settings.js` (`AR_LANGS` — togol tetapan halaman utama),
`js/ar-page.js` (`AR_LANGS` + `arInferBasePath()` array — togol
tetapan artikel/alat),
`js/ui.js` (`titleMapByLang`/`descMapByLang` — tajuk/meta dinamik SPA),
`js/ui-journal.js` (`JN_STRINGS.<lang>`),
`js/community-stress-lab.js` (`CSL_STRINGS.<lang>`) — & mana-mana
`<PREFIX>_STRINGS.<lang>` fail JS alat interaktif lain yg wujud kelak.

## Konvensyen Istilah Terjemahan (disahkan merentas ~35 artikel + siri ARA)

- **"ARA"**, **"Aquatic Rhythm"**, **"Aquatic Rhythm Alignment"**,
  **"Rhyssa"** — KEKAL Bahasa Inggeris/roman semua bahasa (nama
  produk/jenama).
- **"Water/Biological/Environmental/Livestock/Keeper Rhythm"** (nama
  konsep 5 irama ARA, huruf besar) — kekal English dlm id; dlm ja,
  English + gloss Jepun dlm kurungan pd sebutan PERTAMA/definisi tiap
  fail (cth. "Water Rhythm（水質リズム）"), sebutan seterusnya dlm fail
  sama boleh gugur gloss.
- **"Early Phase"/"Developing Phase"/"Mature Phase"** (sistem 3-fasa
  ARA) — kekal English SEMUA bahasa (dominan merentas kandungan
  sedia ada; JANGAN terjemah spt satu artikel lama tersasar buat).
  **BEZA** drpd sistem 4-fasa Keeper's Log
  ("Establishing/Stabilising/Optimising/Sustaining") — jangan
  campur/keliru dua sistem ni.
- **"Keeper's Log"** (rujuk ciri `/journal`) — **id: "Catatan
  Penjaga"**, **ja: "キーパーの記録"** — istilah PRODUK yg dah
  ditetapkan (padan label bottom-nav), BUKAN terjemah literal
  perkataan demi perkataan.
- Nama spesies ikan/tumbuhan (cth. dlm pek data spesies alat
  interaktif) — kekal English (data rujukan sains), KECUALI medan
  kandungan boleh-terjemah sebenar (cth. `citationNote` per-spesies)
  yg dipetakan berasingan drpd nama spesies itu sendiri.
- Istilah konsep baharu ARA (capacity creep, ecological forgiveness,
  false maturity, dll.) — terjemah semula jadi id, English+gloss ja.
- **Daftar (register)**: JANGAN kontrak "ini"/"itu" → "ni"/"tu" dlm id
  — semak sendiri sebelum hantar/terima kerja terjemah agen.

## Skop Sengaja Ditinggalkan (JANGAN cuba terjemah tanpa tanya user dulu)

- **Kandungan prompt AI** dlm `js/ui-journal.js` (mesej `rhMsg`,
  templat insight mingguan dihantar ke backend AI Rhyssa) — terjemah
  ni akan UBAH TINGKAH LAKU AI, bukan sekadar tukar teks UI.
  Keputusan skop eksplisit user, bukan andaian ejen.
- **`js/tank-data.js`'s `AR_BRAND_INFO`** (126 entri peralatan,
  ~11.5k patah perkataan prosa panduan beli) — tugas besar berasingan,
  belum dimulakan.

## Status Terjemahan Semasa (kemas kini 2026-08-18)

**Siap**: ~35 artikel biasa, siri kerangka ARA penuh (7 fail), halaman
utama (SEMUA tab SPA — pg-home/pg-reading/pg-tools/pg-journal/
pg-tank-log/pg-companion/pg-terms/pg-privacy/pg-about — diterjemah
penuh id/ja, disahkan via Playwright 2026-08-18; nota lama fail ni
yg kata pg-reading/pg-tools/pg-journal/pg-tank-log "kekal English"
dah LAPUK, dibetulkan), panel Settings (laman utama & artikel/ARA,
30+ label), sembang Rhyssa (semua templat + laman utama), footer
"About this content" (`js/content-trust.js`, mekanisme CT_STRINGS/
CT() baharu) — `community-stress-lab` (alat interaktif rintis pertama,
JS kongsi + `CSL_STRINGS`/`T()`), kuiz **Know Your Rhythm**
(`know-your-rhythm.html` — 7 soalan + enjin refleksi, kandungan
ditanam sbg literal JS inline per-fail, BUKAN JS kongsi; skrip
`scripts/build-kyr-i18n.mjs` regenerate `var Q=[...]` drpd data &
gantikan string dlm `reflect()` IKUT KEDUDUKAN, bukan padanan teks),
**Tank Cycle Simulator** (`tank-simulator.html` — briefing/setup/
pra-permainan/gameplay + enjin JS ~1400 baris, 150+ string tertanam,
skrip `scripts/build-tsim-i18n.mjs`, padanan exact-substring
`subOnce`/`subAll` bukan regex-by-posisi, PR #318 2026-08-18).

**AWAS — susunan tatabahasa TIDAK universal merentas templat
konkatenasi dinamik**, ditemui bina `tank-simulator` (turut menjejaskan
`id` sendiri, bukan khusus `ja`): templat "N minggu"/"N hari" yg
konkatenasi literal Inggeris/Indonesia perkataan-DULU ("Hari "+N) PECAH
SENYAP utk ja (perlu nombor-DULU "N日目") — juga ayat "with X and Y"
(susunan adjektif-nama Inggeris "small tank" ≠ nama-adjektif Indonesia
betul "akuarium kecil" ≠ tiada partikel eksplisit ja). Jangan andaikan
SATU templat konkatenasi (`ex.prefix+'<strong>'+var+ex.suffix...`)
akan betul merentas bahasa bila tambah alat interaktif baharu dgn teks
dinamik-tersusun (bukan sekadar swap perkataan) — bercabang ikut bahasa
(`if(lang==='ja'){...}else{...}`) dlm skrip build, model
`expectedStatic()`/`expectedDynamic()`/`dayConcat()` dlm
`build-tsim-i18n.mjs` (sendiri model `QNUM_TEMPLATE`/`STATIC_QNUM`
`build-kyr-i18n.mjs`) — JANGAN cuba paksa satu templat sejagat.

**Berbaki**: alat **`tank-builder`** (~19k patah perkataan, terbesar).
Pola kerja utk alat interaktif baharu: kalau logik JS-nya dikongsi
merentas bahasa (satu fail `js/<alat>.js`, spt community-stress-lab)
rujuk `scripts/build-csl-i18n.mjs` + `CSL_STRINGS`/`T()` sbg templat;
kalau logiknya ditanam inline per-fail (spt know-your-rhythm/
tank-simulator) rujuk `scripts/build-kyr-i18n.mjs`/`build-tsim-i18n.mjs`
sbg templat (yg kedua lagi sesuai utk fail besar/kompleks dgn byk
variasi bentuk string — ternary, array mesej, penjana laporan
berbilang cabang — drpd corak `Q[]`/`reflect()` kyr yg lebih seragam)
— semak struktur `tank-builder.html` dulu, & INGAT amaran tatabahasa
di atas semasa rangka templat dinamik apa-apa pun.

**Tempat tambahan perlu dikemas kini bila tambah slug templat bespoke
baharu** (selain 15 tempat `LANGUAGES`/`NAV_LABELS` biasa di atas):
`scripts/build-i18n.mjs`'s `BESPOKE_SLUGS` — skema
`translations/<lang>/<slug>.json` templat bespoke (kyr/tsim/csl/ara)
BERBEZA drpd skema artikel biasa (`head.titleHtml`/`intro`/`modules`),
`buildJsonLd()` akan crash (`Cannot read properties of undefined`)
tanpa pengecualian ni — ditemui via `npm run i18n:check` (build
`--all` cuba proses slug bespoke sbg artikel biasa).

## Panduan Kualiti ja (elak bug audit 2026-08-19 berulang, PR #350-356)

Audit kualiti ja (2026-08-19, susulan pertanyaan user "adakah dah
berkualiti utk pembaca Jepun?") jumpa 6 kategori bug merentas
kandungan ja SEDIA ADA (bukan hanya "belum terjemah" — kandungan yg
DAH diterjemah pun silap). Semak SEMUA 6 checklist ni bila tulis
kandungan ja BAHARU (artikel, modul ARA, alat interaktif, UI chrome)
supaya bug yg sama tak berulang:

1. **Daftar (register) — です/ます, BUKAN だ/である.** Rangka ARA
   (7 fail `ara-s*.json`) & halaman utama ialah standard laman —
   badan teks (`body`/`pullQuote`/`hintText`) MESTI です/ます sopan,
   BUKAN だ/である plain/literary. **Pengecualian**: medan pendek
   punchy (`tag`/`titleHtml`/`nextBtn`/`hintLabel`) BOLEH kekal
   casual/plain-form (cth. tag "これはあなたのせいじゃない") — ni
   konvensyen berasingan drpd daftar badan teks, bukan salah. Rujuk
   `translations/ja/ara-s1-foundation.json` sbg kalibrasi daftar.

2. **"Alignment"/"aligned" → 整合, BUKAN katakana.** Istilah rasmi
   kerangka ARA (rujuk `translations/ja/ara-s4-alignment.json`) ialah
   整合 (整合した[noun], 不整合 utk "misalignment", 整合している utk
   "is aligned"). JANGAN guna katakana loanword — ada 2 varian silap
   ditemui: アライメント (PR #351, 8 fail) & アラインメント (varian
   ejaan lain, PR #355, 1 fail terlepas drpd grep asal sbb beza ejaan
   katakana). Semak KEDUA-DUA ejaan bila grep verifikasi istilah
   katakana yg patut jadi native-Japanese term.

3. **Jangan cipta semula perkataan utk konsep rasmi kerangka ARA
   sedia ada.** Bug PR #354: halaman utama guna "Rhythm before
   Intensity" sbg salah satu 4 prinsip, padahal nama rasmi prinsip
   tu (rujuk `articles/four-principles-of-ara.html` &
   `articles/ara-s4-alignment.html`) ialah "**Consistency** before
   Intensity" — overload istilah "Rhythm" (nama produk + salah satu
   5 Rhythms) buat pembaca keliru. Bila kandungan baharu rujuk/
   parafrasa konsep rasmi ARA (4 prinsip, 5 Rhythms, 3 fasa), SEMAK
   nama rasmi dlm artikel sumber dulu — jangan agak/parafrasa drpd
   ingatan.

4. **Boilerplate UI/nav TAK BOLEH tinggal perkataan English separa.**
   Bug PR #356: butang/pautan "kembali" dlm 5 artikel papar
   "Readingに戻る"/"Kembali ke Reading" — "Reading" ditinggalkan
   English walau konteks Jepun/Indonesia sekeliling, tak konsisten
   dgn label nav sedia ada (ガイド/Panduan) & pautan "记事一覧"/
   "Semua artikel" yg dah betul di fail lain. Bila tambah
   butang/pautan nav baharu (termasuk dlm `scripts/build-i18n.mjs`
   punya boilerplate dict cth. `BACK_LINK`/`NAV_LABELS`), terjemah
   PENUH ke istilah sedia ada — jangan translit separa sebahagian
   perkataan Inggeris. Kenal pasti dahulu APA fungsi sebenar
   butang/pautan tu (navigasi luar ke `/reading` vs navigasi dalam
   halaman cth. `goIntro()`) sblm pilih istilah — dua fungsi beza
   patut istilah beza (rujuk PR #356: "記事一覧に戻る" utk pautan
   `/reading` sebenar, "イントロに戻る" utk butang `goIntro()`).

5. **Elak overuse em dash "——" dlm prosa ja.** Rangka ARA (kualiti
   emas, 7 fail `ara-s*.json`) ialah **SIFAR** guna "——" — guna
   struktur ayat/tanda baca Jepun asli sepenuhnya sebaliknya. Byk
   artikel biasa & halaman utama masih guna corak "——" gaya Inggeris
   secara pervasive (audit 2026-08-19 jumpa 20 fail + halaman utama,
   kiraan 2-75 setiap fail) — tanda kandungan kurang "asli" berbanding
   rangka ARA. Bila tulis/terjemah prosa ja baharu, ELAK "——" —
   susun ayat balik ikut struktur Jepun asli (、。 atau frasa
   berasingan), jangan salin struktur ayat Inggeris literal (subject
   — clause — clause) terus ke ja.

6. **Widget interaktif tertanam (`<canvas>`/JS dinamik) MESTI guna
   jadual string runtime, BUKAN translations JSON.** Pipeline
   `build-i18n.mjs` salin blok `<script>` inline VERBATIM drpd sumber
   EN — apa² teks tertanam dlm JS (label butang canvas, mesej hasil,
   dll.) TAK diproses templat i18n, kekal English walau pd build
   id/ja (bug PR #353, 2 fail, 112 string). Fix: tanam jadual
   `<PREFIX>_STRINGS` (en/id/ja) + fungsi `T(key,subs)` yg baca
   `document.documentElement.lang` runtime terus dlm EN source (ikut
   pola `CSL_STRINGS`/`T()` drpd `js/community-stress-lab.js`, atau
   `NTS_STRINGS`/`ntsT()` drpd `articles/new-tank-syndrome.html`
   sbg contoh baharu). **Ingat susunan nombor-perkataan Jepun**
   ("N日目" nombor-dulu) beza drpd en/id ("Day N"/"Hari N"
   perkataan-dulu) bila templat teks dinamik ada nombor — rujuk
   `ntsDay()`/`ctpWeekLabel()`/`dayConcat()` (§i18n "AWAS — susunan
   tatabahasa" di atas utk butiran penuh).

## Semakan Sebelum Commit

- `npm run check` (`check:syntax` + `test` [Node test runner,
  `tests/*.test.mjs`] + `lint` [ESLint `js/`/`scripts/`/`worker/`/
  `tests/`]) — mesti 0 ralat (amaran `no-unused-vars` dsb. ditoleransi,
  byk pre-existing).
- `npm run i18n:check` — jalankan DUA kali, diff-stat mesti SAMA
  (idempoten) sblm commit; selepas commit patut kosong.
- Playwright (`node_modules/.bin/playwright`, guna
  `executablePath: '/opt/pw-browsers/chromium'` dlm sandbox agen — CDN
  luar cth. `fonts.googleapis.com`/analitik disekat, `ERR_TUNNEL_
  CONNECTION_FAILED` dijangka & selamat diabaikan dlm log ralat JS,
  bukan bug sebenar) — uji fungsian merentas SEMUA bahasa (termasuk
  `en` sbg semakan regresi, sbb fail JS alat interaktif DIKONGSI semua
  bahasa) lepas apa-apa perubahan JS/HTML i18n.
