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

### EN sumber KEBENARAN, BUKAN sumber STRUKTUR (keputusan user, 2026-08-27)

`en` kekal sumber kebenaran utk **fakta/skop/maklumat produk** (apa yg
disebut, angka, nama konsep rasmi ARA) — id/ja MESTI sepadan fakta ni,
& `subOnce`/`subAll` (padanan exact-substring drpd EN sumber ke fail
build) kekal senibina asas, BUKAN dibuang. TAPI `en` **BUKAN** sumber
struktur ayat — id/ja **WAJIB restruktur bebas** (susunan ayat/klausa,
pemisahan/gabungan perenggan, penekanan, gaya kolokial semula jadi
bahasa masing²) drpd apa yg terjemahan literal frasa-demi-frasa drpd
EN akan hasilkan. Terjemah literal struktur EN (subjek — klausa —
klausa, urutan senarai bertitik, dll.) ke id/ja kedengaran janggal
walau setiap perkataan betul — pendekatan "pertengahan" ni ditolak
drpd 2 alternatif ekstrem: (a) terjemah literal penuh (janggal, spt
bug di bawah), (b) 3 bahasa dicipta serentak tanpa EN sbg sumber
langsung (ditolak sbb kos senibina — akan pecahkan mekanisme
`subOnce`/`subAll`, ~35 artikel + 4 templat build sedia ada bergantung
padanya, & hilang keupayaan kesan-drift automatik `check-i18n-sync.mjs`
antara EN & id/ja).

Bug konkrit yg justifikasi peraturan ni (dibetulkan PR #462,
2026-08-27): perenggan Reading tab halaman utama (`.bt.sr.d1`/`.bt.sr.d2`)
sebelum ni terjemah id/ja frasa-demi-frasa ikut struktur ayat EN
(termasuk butiran "Latin name only when they help" yg tak perlu
dinyatakan langsung dlm id/ja) — dikenal pasti janggal oleh user &
diperbetulkan dgn restruktur ayat, bukan tukar perkataan sahaja.
**Ni SAMA prinsip** dgn §"AWAS — susunan tatabahasa TIDAK universal
merentas templat konkatenasi dinamik" & bug Prefix/Suffix Tank Builder
dlm §"Status Terjemahan Semasa" di bawah (nombor-dulu ja vs
perkataan-dulu en/id, prefix id vs suffix en/ja utk label enum) — bug²
tu khusus templat konkatenasi dinamik JS; peraturan ni lanjutkan
prinsip yg sama ke SEMUA kandungan id/ja (prosa artikel, UI copy,
tajuk/perenggan statik), bukan setakat templat berubah-ubah. Bila
terjemah/semak kandungan id/ja baharu, tanya "adakah ayat ni akan
ditulis begini oleh penutur natif id/ja, atau ia kedengaran spt EN
diterjemah?" — kalau jawapannya yg kedua, restruktur, jangan sekadar
tukar istilah.

### AWAS — ejen terjemah boleh tulis dlm BAHASA SESI, bukan bahasa sasaran (PR #512, 2026-08-30)

**Kegagalan sebenar, 3 fail tersiar ke laman langsung sblm dikesan.**
Terjemahan `id` utk 3 artikel terbaharu (PR #507/#509/#510) bukan Bahasa
Indonesia langsung — ia **Bahasa Melayu dgn singkatan gaya sembang**
(`yg`, `dgn`, `utk`, `dlm`, `sbg`, `pd`, `ttg`, `thd`, `scr`, `org`,
`&`, `benar²`) — sbb ejen terjemah menulis ikut konvensyen bahasa SESI
(§"Bahasa" di atas: commit/PR/balasan dlm BM, ikut gaya bersingkatan
fail CLAUDE.md ni sendiri) & bukan ikut bahasa SASARAN fail. Skala:
113/106/95 hit setiap fail. Pengesahan sedia ada **lulus** sbb ia semak
STRUKTUR (bilangan kunci, panjang array) & bukan BAHASA.

**Bukan sekadar singkatan** — ada perkataan BM tulen yg perlu padanan
Indonesia sebenar: `berbeza`→`berbeda`, `kemahiran`→`keterampilan`,
`haiwan`→`hewan`, `kelajuan`→`kecepatan`, `pemboleh ubah`→`variabel`,
`keamatan`→`intensitas`, `siling`→`plafon`, `jadual`→`jadwal`,
`kapasiti`→`kapasitas`, `kos`→`biaya`, `soalan`→`pertanyaan`,
`sama ada`→`apakah`, `kedua-duanya`→`keduanya`, `tarikh akhir`→`tenggat`,
`laman ni`→`situs ini`, `tanpa kira`→`terlepas dari`, `fasa`→`fase`,
`berkongsi`→`berbagi`, `keperluan`→`kebutuhan`, `kerap`→`sering`,
`pantas`→`cepat`, `penyelenggaraan`→`perawatan`, `julat`→`rentang`,
`lestari`→`berkelanjutan`, `dijejak`→`dilacak`, `kraf`→`keahlian`.

**WAJIB lepas mana-mana kerja terjemah id** (sendiri atau ejen), grep
senarai singkatan + BM di atas merentas `translations/id/*.json`. Murah
& menangkap kegagalan ni terus. **Positif palsu yg SAH & jangan
"dibetulkan"**: `wujud` (Indonesia betul dlm "itu wujud kepedulian"),
`org` dlm URL (`rspca.org.au`), `²` dlm unit saintifik (`umol/m²/s`).
Semak konteks setiap hit sblm ubah.

### AWAS — `json.dump(indent=2)` MEROSAKKAN fail translations lama (indent BERCAMPUR dlm repo)

Fail dlm `translations/<lang>/` **tidak seragam indentasinya** — sebahagian
`indent=2`, sebahagian `indent=4`. Menyunting via `json.load` →
`json.dumps(..., indent=2)` akan **reformat SELURUH fail** yg asalnya
indent=4 (ditemui PR #512: pembetulan **satu perkataan** dlm
`ich-keeps-coming-back.json` jadi diff **242 baris**). Menyahkan
round-trip pd SATU fail & anggap ia sejagat **tidak memadai** — itu
tepat silap yg dibuat dlm PR #512 & terpaksa dipatah balik.

**Kaedah selamat utk suntingan kecil**: gantian teks **MENTAH** pd
kandungan fail (`raw.replace(a, b)`), diikuti `json.loads(raw)` sbg
pengesahan JSON kekal sah — JANGAN round-trip. Utk penulisan semula
besar (banyak medan), sahkan dulu round-trip fail ITU sendiri
(`json.dumps(d, ensure_ascii=False, indent=N)+'\n' == raw_asal`) & guna
`N` yg padan. Corak SAMA dgn amaran `translations/homepage/*.json`
sedia ada (§"Pipeline Build"), cuma di direktori berbeza — sekarang
terpakai kpd **kedua-dua** direktori.

**Pengesahan struktur WAJIB lepas apa-apa suntingan translations**:
bilangan modul, panjang `body[]`, kewujudan `pullQuote`, panjang
`hintText[]` MESTI sama dgn HEAD — build id/ja isi slot `<p>` ikut
KEDUDUKAN, jadi tambah/buang perenggan merosakkan terjemahan
senyap-senyap tanpa sebarang ralat.

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

**AWAS KEDUA — SENARAI KERAS dlm skrip ni pun boleh hanyut, & ia GAGAL
LEBIH SENYAP drpd regex** (ditemui PR #517). `fix_asset_paths()` dulu
simpan senarai keras nama fail aset utk ditukar kpd laluan absolut.
`index.html` guna laluan RELATIF (`src="js/x.js"`) yg betul drpd root,
tapi salinan terjemahan duduk di `/id/` & `/ja/` — jadi laluan relatif
menyelesai ke `/id/js/x.js` & **404**. Bila `js/ui-calm-mode.js`
ditambah kpd `index.html`, ia tak pernah ditambah kpd senarai tu, jadi
**calm mode MATI SENYAP pd KEDUA-DUA halaman utama terjemahan** —
tiada amaran console drpd skrip, EN berfungsi normal, & ia hanya
ditemui bila Playwright memantau respons 404 (bukan sekadar ralat JS).
Dibetulkan dgn regex TERBITAN (`(src|href)="(js|css|og|img)/` →
absolut) supaya aset SETERUSNYA dikendali tanpa sentuh skrip ni.

**Pengajaran am**: mana-mana SENARAI KERAS dlm skrip build (nama fail,
slug, kunci) ialah titik hanyut. Bila boleh, terbitkan drpd sumber.
Bila tak boleh, senaraikan tempat tu dlm CLAUDE.md (spt §"15 tempat
`LANGUAGES`" di bawah). **Dan semasa Playwright, pantau respons 404 —
bukan setakat ralat JS** — sbb aset hilang tak semestinya lempar ralat.

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
- **`js/tank-data.js`'s `AR_BRAND_INFO`** (211 entri peralatan drpd
  2026-08-25, naik drpd 126 asal PR #405 — 61 jenama baharu ditambah
  merentas 3 PR susulan #436-#438, rujuk paragraf di bawah) — DAH
  diterjemah (PR #405, 2026-08-24, & setiap PR susulan yg tambah
  jenama baharu), rujuk §"Status Terjemahan Semasa"
  bawah utk senibina. **JANGAN keliru dgn `tank-builder.html`'s `var
  ECOSYSTEM`** (pangkalan data spesies ikan/tumbuhan/hardscape, skop
  BERBEZA & bersaiz serupa, turut DAH diterjemah tapi via senibina
  BERBEZA — rujuk bawah) — dua pangkalan data BERASINGAN dlm fail
  BERBEZA, semak yg mana sebelum anggap "data spesies/peralatan"
  bermaksud sama.

## Status Terjemahan Semasa (kemas kini 2026-08-25)

**Siap**: ~35 artikel biasa, siri kerangka ARA penuh (7 fail), halaman
utama (SEMUA tab SPA — pg-home/pg-reading/pg-tools/pg-journal/
pg-tank-log/pg-companion/pg-terms/pg-privacy/pg-about — diterjemah
penuh id/ja, disahkan via Playwright 2026-08-18; nota lama fail ni
yg kata pg-reading/pg-tools/pg-journal/pg-tank-log "kekal English"
dah LAPUK, dibetulkan), panel Settings (laman utama & artikel/ARA,
30+ label), sembang Rhyssa (semua templat + laman utama), footer
"About this content" (`js/content-trust.js`, mekanisme CT_STRINGS/
CT() baharu) — `community-stress-lab` (alat interaktif rintis pertama,
JS kongsi + `CSL_STRINGS`/`T()`), kuiz **Keeper Readiness Check**
(`keeper-readiness-check.html` — 7 soalan + enjin refleksi, kandungan
ditanam sbg literal JS inline per-fail, BUKAN JS kongsi; skrip
`scripts/build-kyr-i18n.mjs` regenerate `var Q=[...]` drpd data &
gantikan string dlm `reflect()` IKUT KEDUDUKAN, bukan padanan teks),
**Tank Cycle Simulator** (`tank-simulator.html` — briefing/setup/
pra-permainan/gameplay + enjin JS ~1400 baris, 150+ string tertanam,
skrip `scripts/build-tsim-i18n.mjs`, padanan exact-substring
`subOnce`/`subAll` bukan regex-by-posisi, PR #318 2026-08-18), **Rhythm
Tracker** (`rhythm-tracker.html` — soal-selidik reflektif merentas
5 Irama ARA, satu-per-satu atau kesemuanya, radar chart SVG papar
kemajuan, opt-in hantar hasil anonymous ke Formspree via
`respondent_id` (`crypto.randomUUID()`+localStorage, JOIN merentas
hantaran TANPA PII) — konsen 2-langkah (checkbox default OFF + butang
berasingan, TIADA auto-submit); skrip `scripts/build-ryr-i18n.mjs`,
sama pola `subOnce`/`subAll` spt tank-simulator. **Rhythm Tracker**
& **Keeper Readiness Check** DUA tool BERPASANGAN sengaja (nama
ditukar serentak PR ni drpd "Read Your Rhythm"/"Know Your Rhythm"
2026-09-04 — nama asal tak unik berbanding lab lain, & slug turut
ditukar sbb belum diindex enjin carian; setiap satu ada pautan
silang ke satu sama lain dlm `intro.body1`).

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

**`tank-builder`** (~2000 baris JS enjin + pangkalan data `var
ECOSYSTEM={...}` — 88 ikan + 19 invertebrata + 49 tumbuhan + 34
hardscape (kemas kini 2026-08-25, naik drpd 75/15/35/26 asal) + 9 gaya
persediaan, ~145KB satu baris — skrip `scripts/build-tb-i18n.mjs`,
PR #318 & susulan, terjemahan id/ja kekal terkini merentas semua
tambahan spesies/tumbuhan/hardscape susulan — rujuk "Kemas kini
tank-builder susulan sesi 2026-08-25" di bawah).
**BERBEZA drpd `tank-simulator`** dlm dua cara penting:

1. **Skop pangkalan data spesies TERMASUK dlm terjemahan ni** (keputusan
   eksplisit user selepas ditanya — `js/tank-data.js`'s `AR_BRAND_INFO`
   pun DAH diterjemah kemudian, PR #405, tapi via senibina berbeza,
   rujuk bawah). Medan prosa sahaja diterjemah
   (`diet`/`substrate_pref`/`notes_detail`/`caution` ikan-invertebrata,
   `about`/`notes` tumbuhan-hardscape, `label`/`desc` gaya persediaan)
   — nama spesies/Latin/nilai enum berstruktur (`care_level`/`bioload`/
   `hardness`/dll., dibaca terus oleh logik JS spt
   `item.care_level==='Beginner'`) KEKAL English/berangka, ikut
   konvensyen "nama spesies kekal English" sedia ada.
2. **Blob JSON gergasi (`ECOSYSTEM`/`TB_ENUM_LABELS`) dibina semula via
   `JSON.parse`/gabung/`JSON.stringify`, BUKAN `subOnce`/`subAll`
   substring** — terlalu besar & padat utk regex selamat. Skema
   `translations/<lang>/tank-builder.json`'s `ecosystem{}` cermin
   struktur `ECOSYSTEM` (kunci slug SAMA, hanya medan prosa diganti).

**`AR_BRAND_INFO`** (`js/tank-data.js`, 211 jenama peralatan drpd
2026-08-25 — naik drpd 126 asal, ~10k+ patah perkataan panduan beli —
summary/pros/cons/best_for/tier_note/avoid_if — diterjemah PR #405,
2026-08-24, & setiap PR susulan) guna senibina KETIGA,
BERBEZA drpd ECOSYSTEM/`build-tb-i18n.mjs` di atas: `js/tank-data.js`
ialah **SATU fail dikongsi SEMUA build bahasa** (`<script
src="/js/tank-data.js">` sama drpd `articles/`, `id/articles/`,
`ja/articles/tank-builder.html` — tiada 3 salinan HTML berasingan spt
ECOSYSTEM yg dibina-semula per-bahasa), jadi tak boleh guna corak
"regenerate HTML per bahasa". Sebaliknya medan prosa direstruktur
terus dlm data ke bentuk `{en:'...', id:'...', ja:'...'}` (array
`pros`/`cons` turut jadi `{en:[...],id:[...],ja:[...]}`), dipilih pd
**runtime** via `biLoc(v)` (fungsi baharu, `articles/tank-builder.html`
dkt `var BRAND_INFO=window.AR_BRAND_INFO;`) yg baca
`document.documentElement.lang` — model SAMA dgn `CSL_STRINGS`/`T()`
(`js/community-stress-lab.js`) drpd §i18n checklist #6 di atas, cuma
di sini bukan widget canvas tapi pangkalan data prosa. `tier` (enum
pendek Budget/Mid/Premium/dll., 5 nilai) KEKAL raw string tunggal
(bukan `{en,id,ja}`) — dipetakan papar via `enumLabel('tier',...)` +
`TB_ENUM_LABELS.tier`, ikut pola enum sedia ada (§2 atas), BUKAN
direstruktur spt medan prosa. **Kandungan diterjemah oleh 6 agen
subtask (3 batch × id/ja) selari**, disahkan struktur secara program
lepas tu (bilangan kunci jenama & panjang array pros/cons dibandingkan
byte-demi-byte drpd EN sumber, BUKAN sekadar terima laporan
"validation lulus" agen sendiri) — ikut prinsip §i18n checklist "SATU
fail JS dikongsi ... disahkan struktur ... via skrip perbandingan
automatik, BUKAN percaya laporan agen terjemah sahaja" yg sama. Turut
ditemui semasa kerja ni: 2 entri typo `tier` ("Budget-Mid" hyphen vs
18 entri "Budget–Mid" en dash majoriti) dinormalisasi, & medan
`disclaimer` (33 entri, duplikat teks statik yg dah dipaparkan sedia
ada, tak pernah dibaca kod) dibuang — corak "medan data mati/tak
disambung" yg sama dgn `requiresOne`/`warnWithout` (PR #404).

### Kemas kini tank-builder susulan sesi 2026-08-25 (PR #421-#438)

Satu sesi berterusan (18 PR) memperluas `tank-builder` merentas
spesies, tumbuhan, hardscape, UI penapis, & jenama peralatan. Ringkasan
supaya sesi/ejen akan datang tak anggap fail ni (yg ditulis 2026-08-18)
masih cerminkan keadaan semasa:

- **ECOSYSTEM**: FISH 75→88 (+13, tumpuan spesies liar/relevan
  Indonesia-Jepun — Medaka, Asian Arowana, *Betta* liar
  albimarginata/macrostoma/channoides/coccina/imbellis, *Channa*
  andrao/maruliodes/pulchra/lucius/bleheri; Koi/Kap sengaja
  DIKECUALIKAN — luar skop saiz 20-500L/air tawar tangki kecil).
  INVERTEBRATES 15→19 (+4, udang tasik Sulawesi — *Caridina*
  dennerli/spongicola/woltereckae/glaubrechti, niche kimia air
  berbeza drpd udang biasa). PLANTS 35→49 (+15, & 2 duplikat
  spesies dibetulkan — `pennywort`/`hydrocotyle-leucocephala` &
  `dwarf-hairgrass`/`eleocharis-parvulus` same-species, tag
  `Blackwater` mati (0 tumbuhan) dibetulkan). HARDSCAPE 26→34 (+9, &
  1 duplikat — `dragon-stone`/`ohko-stone` same-rock — dibetulkan;
  batu baharu termasuk Hakkai, Elephant Skin, Fossil Wood, Frodo,
  Unzan, Rainbow Slate ikut permintaan eksplisit user utk nama batu
  aquascape popular yg tertinggal). Setiap tambahan turut medan
  `group` (taksonomi 13-kumpulan baharu, rujuk bawah).

- **Penapis Livestock/Plants/Hardscape ditulis semula (PR #430)**:
  drpd 1 baris chip gaya-setup (`.ph2-chips`) kpd **2 dropdown
  berasingan** (`#ph2-setup-select` "Setup Style" + `#ph2-group-select`
  "Animal Group", GROUPS 13-kategori baharu — tetra-characin,
  rasbora-barb-danio, livebearer, catfish-pleco, loach-algae-eater,
  betta-gourami, cichlid, snakehead, rainbow-killifish,
  oddball-specialty, shrimp, snail, crab-crayfish). Kedua-dua default
  "All", **kekal dipilih (persist) sepanjang sesi pengguna** dlm lab
  (bukan reset bila tukar tab), & carian teks (`_ph2Query`) **abaikan
  kedua-dua filter serta susun hasil ikut abjad** — 3 keperluan
  eksplisit user, bukan andaian. `buildAllGrids()` guna `.filter()`+
  `.sort()` opsyenal drpd corak lama `.forEach()`+skip.

- **Saiz tangki max 300L→500L (PR #431)**: dropdown `#tank-size`
  tambah 400L/500L, sepadan skop ARA framework sendiri (rujuk
  `docs/ARA-framework-v2.docx`, dilaporkan skop 20-500L).

- **2 kategori peralatan BAHARU — `fish-food` & `medication` (PR
  #437)**: sebelum ni TIADA LANGSUNG dlm ~32 kategori EQ (bukan
  sekadar kurang jenama dlm kategori sedia ada — kategori itu sendiri
  tiada). Disahkan kena dgn kerangka 5 Irama ARA sblm implementasi
  (soalan eksplisit user "adakah makanan dan ubat termasuk dalam 5
  rhythm?"): **Fish Food** → Livestock (nutrisi terus) + Keeper
  (kemahiran/rutin memberi makan) primer, Water (overfeeding punca
  #1 masalah kualiti air) + Biological (baki makanan tambah bioload)
  sekunder. **Medication** → Livestock (rawatan penyakit) + Keeper
  (kemahiran diagnosis/dos) primer, Biological (byk ubat, terutama
  antibiotik/kuprum, bunuh bakteria nitrifikasi) + Water (sesetengah
  ubat ubah kimia) sekunder. Nilai `water/bio/env/live/human` dlm EQ
  dict ikut mapping ni. `ENGLISH_RACK_ITEMS` (`build-tb-i18n.mjs`) +
  `rack.items.fish-food`/`rack.items.medication` (translations JSON
  id/ja) ditambah — corak generik sedia ada (satu entri jadual, tiada
  kod per-item hardcode), tiada perubahan lain diperlukan.

- **Jenama peralatan +85 (126→211 dlm `AR_BRAND_INFO`)**: PR #436
  (5 jenama budget/mid popular Asia tapi bukan jenama besar global —
  AZOO, Ista, GEX, Nisso, Sobo, ikut kriteria eksplisit user "bukan
  besar tapi popular kalangan pengguna pertengahan/budget & di Asia"),
  PR #437 (10 jenama utk `fish-food`/`medication` baharu di atas), PR
  #438 (8 jenama utk 3 kategori paling nipis dikenal pasti — `light-basic`/
  `cooling-fan`/`siphon`, masing² cuma 4 contoh sblm ni, drpd audit
  kiraan contoh merentas kesemua 36 kategori).

- **Disiplin verifikasi kelengkapan i18n utk `AR_BRAND_INFO`
  (WAJIB utk tambahan akan datang)**: PR #437 pd mulanya TERLEPAS
  terjemahan id/ja pd medan `pros`/`cons` (10 entri, hanya `en` diisi)
  — ditemui sendiri via skrip Python semakan `set(entry[field].keys())
  == {'en','id','ja'}` + parity panjang array pros/cons, dijalankan
  SEBELUM commit. Skrip yg sama dijalankan PROAKTIF (bukan reaktif)
  dlm PR #438 & lulus bersih first-try. **Jalankan skrip verifikasi
  ni SEBELUM commit setiap kali tambah entri `AR_BRAND_INFO` baharu**
  — jangan percaya semakan visual sahaja.

- **Bug persekitaran berulang — checkout git tempatan tersadai
  (stale)**: berlaku 3× sepanjang sesi ni (punca alam sekitar/tak
  diketahui, BUKAN disebabkan arahan git sendiri) — `git log` tempatan
  tiba² kembali ke commit lama (`555a0e7`, PR #407) merentas giliran
  perbualan/selepas tempoh diam. Kesan: edit disunting atas asas data
  lapuk (cth. spesies/jenama yg dah wujud di upstream hilang secara
  senyap drpd tempatan). Cara kesan: `git log --oneline -3` tak
  sepadan jangkaan, ATAU `git push` ditolak "fetch first"/403. Cara
  betul: `git fetch origin <cabang>` → bandingkan SHA → `git reset
  --hard origin/<cabang>` (BUKAN `git cherry-pick` komit yg hilang —
  dicuba sekali, conflict tak terurus dlm blob JSON satu-baris,
  `--abort`) → sunting semula kerja yg hilang segar drpd asas betul.
  **SENTIASA jalankan `git fetch` + `git log --oneline -3` sbg
  semakan waras SEBELUM mula sunting** bila mula sesi/giliran baharu
  dlm repo ni, terutama lepas jeda masa.

**Corak baharu — kamus label-paparan utk medan data berenum
(`TB_ENUM_LABELS` + fungsi `enumLabel(field,value)`, ditambah terus ke
`articles/tank-builder.html`'s enjin)**: bila medan data (`item.bioload`,
`item.care_level`, dll.) dipaparkan LANGSUNG sbg teks kpd pengguna (cth.
`cl.textContent=item.care_level`) TAPI turut dibaca oleh logik
perbandingan string (`.indexOf('Beginner')`, `!=='peaceful'`) di tempat
LAIN, JANGAN terjemah nilai data itu sendiri (akan pecahkan logik) —
tambah lapisan pemetaan (nilai mentah → label bahasa) yg skrip build
tukar SAHAJA nilainya (kunci KEKAL), panggilan paparan dibalut
`enumLabel('field',item.field)` manakala semakan logik kekal baca
`item.field` mentah terus. Model ni bila tambah alat interaktif baharu
dgn sebarang medan data yg dipaparkan DAN diperiksa serentak.

**AWAS — susunan Prefix/Suffix boleh pecah tatabahasa bila digabung
dgn nilai enum yg SUDAH diterjemah**, bukan sekadar konkatenasi
nombor/kata nama (kes `tank-simulator` di atas): cth. `item.bioload+'
load'` (suffix Inggeris) diterjemah ja betul (nilai enum bentuk め +
suffix "の負荷" — sesuai tatabahasa), TAPI id: suffix sahaja tak boleh
hasilkan "Beban Tinggi" (nama-dulu) drpd nilai enum "Tinggi" sedia ada
— perlu tukar ke PREFIX ("Beban "+nilai) khusus id dlm skrip build
(bukan sekadar tukar teks suffix→prefix dlm JSON, PERLU cabang
`if(lang==='id'){...}` code, ikut pola `expectedStatic`/`dayConcat`).
Agen terjemah yg jujur laporkan isu ni bila diminta (rujuk arahan
"SENARAIKAN medan PERLU SUSUNAN BERBEZA" dlm brief agen) — JANGAN
terima cadangan tampalan kurungan/helah visual drpd agen sbg
penyelesaian muktamad, betulkan punca (kod build) macam kes ni.

**Konvensyen "5 Irama ARA" (`Water`/`Biological`/`Environmental`/
`Livestock`/`Keeper` Rhythm, rujuk §"Konvensyen Istilah Terjemahan" di
atas) turut terpakai pd label PENDEK tanpa perkataan "Rhythm" literal**
(cth. `tank-builder`'s `briefing.rhythms[].name`="Water"/"Biological"/
dll, tanpa suffix "Rhythm") — bukan sekadar bila teks penuh "Water
Rhythm" muncul verbatim. `tank-builder` guna "**Keeper**" sbg label
dimensi ke-5 (3 tempat: `briefing.rhythms[4].name`, `topBand.rhyLabels
.human`, `report.rhythmLabels.human` — kunci JS/JSON KEKAL `human`
sbg nama medan dalaman, cuma label PAPARAN yg tukar), sepadan `docs/
ARA-framework-v2.docx` (manuskrip akademik sumber DOI OSF) — abstrak &
§3.6 tajuk seksyen eksplisit guna "Keeper" (11×) sbg nama RHYTHM
ke-5 rasmi ("The Keeper Rhythm is the fifth ecological rhythm").
**SEBELUM PR #395 (2026-08-24) label ni tersilap "Human"** — justifikasi
lama (kononnya sepadan Domain 7 "Human Rhythm" drpd 7 Alignment
Domains) silap percampur DUA lapisan berbeza dlm kertas sumber (5
Rhythms vs 7 Domains, dua senarai berasingan) — "Human Rhythm" ialah
nama Domain 7 (lapisan operasi/praktikal, muncul 2× je dlm manuskrip),
BUKAN sinonim Rhythm ke-5. Gloss ja "（飼育者）" (Keeper) kekal
digunakan pd sebutan pertama (`briefing.rhythms[4].name`="Keeper（
飼育者）") — kini SELARAS antara istilah English & gloss sendiri
(sebelum ni "Human（飼育者）" janggal sbb glosnya sendiri dah
dedahkan konsep sebenar ialah "keeper", bukan "human"). Sentiasa SEMAK
CLAUDE.md bahagian ni SEBELUM hantar draf terjemahan agen bila alat
baharu ada label ringkas rujuk konsep 5-irama — mudah terlepas pandang
sbb tiada perkataan "Rhythm" literal dlm label pendek, & sentiasa
SAHKAN nama rasmi terus drpd manuskrip sumber (`docs/ARA-framework
-v2.docx`) kalau ada keraguan lapisan Rhythm vs Domain — jangan
percaya ingatan/tafsiran drpd nota lama fail ni tanpa semak balik
sumber, spt yg terlepas pandang di sini.

**Tempat tambahan perlu dikemas kini bila tambah slug templat bespoke
baharu** (selain 15 tempat `LANGUAGES`/`NAV_LABELS` biasa di atas):
`scripts/build-i18n.mjs`'s `BESPOKE_SLUGS` — skema
`translations/<lang>/<slug>.json` templat bespoke (kyr/tsim/tb/csl/ara)
BERBEZA drpd skema artikel biasa (`head.titleHtml`/`intro`/`modules`),
`buildJsonLd()` akan crash (`Cannot read properties of undefined`)
tanpa pengecualian ni — ditemui via `npm run i18n:check` (build
`--all` cuba proses slug bespoke sbg artikel biasa). **AWAS — skrip
build BESPOKE lain (`build-kyr-i18n.mjs`, `build-tsim-i18n.mjs`,
`build-tb-i18n.mjs`) TIDAK saling menggantikan** — masing-masing
templat halaman berbeza, guna skrip SALAH pd fail SALAH (cth.
`build-i18n.mjs --slug keeper-readiness-check`, bukan `build-kyr-i18n.mjs`)
akan "berjaya" tanpa ralat TAPI hasilkan output CORRUPT (buildArticle()
proses skema bespoke sbg skema artikel biasa secara senyap-senyap
salah, bukan crash) — SENTIASA semak `git diff --stat` lepas regenerate
fail rujukan-silang (cth. artikel lain yg pautkan ke alat bespoke) utk
pastikan bilangan baris berubah MASUK AKAL (~1-2 baris utk pautan
sahaja), bukan ratusan baris (tanda skrip salah dipakai).

## Panduan Kualiti Prosa EN (elak bug PR #470/#471 berulang, dibetulkan PR #477/#478)

**Bila kurangkan/buang em-dash "—" berlebihan drpd prosa EN, JANGAN
gantikan tanda dash tu terus dgn koma/kolon di TEMPAT YG SAMA.**
Kaedah tu nampak selamat (buang dash, kekalkan struktur ayat) tapi
sebenarnya **cantumkan 2 klausa yg asalnya dipisah jeda visual (dash,
hampir spt noktah) jadi SATU ayat panjang bersambung koma/kolon** —
punca corak "ayat panjang + kolon bertindih + koma banyak" yg
ditemui user (2026-08-28) merentas ~39 artikel lama, disebabkan
tepat oleh kaedah swap-di-tempat ni semasa audit "kualiti prosa EN"
awal sesi (PR #467-470 pd 8 artikel terpadat + PR #471 pd 5 fail
siri ARA + halaman utama). Contoh bug sebenar:

```
- "The parameters look fine — and yet something is not quite right."
+ "The parameters look fine, and yet something is not quite right."
```

**Kaedah BETUL bila em-dash tu memisahkan 2 klausa lengkap (bukan
label pendek/senarai ringkas)**: pecah kpd 2 ayat berasingan guna
noktah, bukan gantikan dash dgn koma/kolon di tempat yg sama —
```
+ "The parameters look fine. And yet something is not quite right."
```
(atau restruktur ayat sepenuhnya kalau noktah mentah janggal). Dash
yg memisahkan LABEL pendek drpd penerangan ringkas (cth. "Reducing
photoperiod — the most common aligned response...") BOLEH kekal
sbg "Label: penerangan" (kolon) — tu bukan run-on, ia corak
label-definisi berfungsi, bukan cantuman 2 klausa panjang. Beza
antara dua kes ni: kalau kedua-dua belah dash boleh berdiri sbg ayat
lengkap sendiri (subjek + kata kerja), ia MESTI dipecah ke 2 ayat,
bukan disambung koma/kolon.

**Sentiasa sahkan pembetulan em-dash/tanda baca dgn skrip audit
kuantitatif** (purata patah perkataan/ayat, bilangan ayat ≥30 patah
perkataan, bilangan kolon/koma per ayat — pola Python guna
`re.split(r'(?<=[.!?])\s+(?=[A-Z"])', text)` pd kandungan
`mod-body`/`.hn`/`.pq`, dijalankan sesi ni), BUKAN cuma kira bilangan
em-dash dibuang. Kiraan em-dash turun boleh nampak spt kejayaan
(cth. commit log PR #470: "cycled-tank-problems: 51→29") walhal
purata panjang ayat & kepadatan kolon/koma sebenarnya NAIK pd fail
yg sama — dua metrik ni bercanggah, kiraan dash sahaja BUKAN ukuran
kualiti yg mencukupi. Jalankan skrip audit SEBELUM & SELEPAS
pembetulan em-dash/tanda baca utk pastikan purata patah
perkataan/ayat & bilangan ayat panjang turun jugak, bukan setakat
kiraan dash.

**TAPI purata rendah + sedikit ayat panjang MASIH belum memadai —
ukur VARIASI irama jugak (PR #511, 2026-08-30).** Pembetulan ayat
run-on dlm PR #511 (8 artikel) menurunkan purata dlm kesemua fail
& hapuskan semua ayat ≥30 patah perkataan, lulus setiap semakan yg
disenaraikan di atas — tapi **meratakan irama dlm kesemua 8 fail**
sbb memecah ayat 40-patah jadi dua ayat 16-patah menghasilkan lebih
banyak ayat bersaiz SEDERHANA, bukan ayat PELBAGAI:

```
the-fish-that-sell-the-tank   purata 23.3→16.6  TAPI  CV 0.53→0.35
the-relief-youre-not-...      purata 20.8→16.0  TAPI  CV 0.60→0.38
the-tank-nobody-else-sees     purata 21.8→17.4  TAPI  CV 0.55→0.40
(CV = sisihan piawai panjang ayat ÷ purata; rendah = semua ayat sama panjang)
```

Prosa manusia berselang-seli — ayat 30 patah perkataan, kemudian
ayat 4 patah perkataan yg menghentak. Prosa mesin tidak. **Sasaran
sebenar bukan "ayat pendek" tetapi "ayat PELBAGAI"**: CV ≥ 0.55 dgn
≥15% ayat ≤6 patah perkataan. Ayat 35 patah perkataan TIDAK salah
kalau ayat selepasnya 5 patah perkataan. Tambah CV & peratus ayat
pendek kpd skrip audit — tanpanya, "pembetulan" boleh lulus semua
semakan sambil memburukkan bacaan.

## Lima Keluarga Nada — TAKLIMAT sebelum tulis, BUKAN rubrik selepas (audit 2026-08-30)

**Penemuan yg justifikasi bahagian ni**: audit stilometrik 62 artikel
prosa EN (67k patah perkataan) jumpa hanyutan suara seragam — dlm
**setiap** keluarga nada tanpa pengecualian, artikel terbaik ialah
tulisan awal laman & yg terjauh ialah tulisan terbaharu. Artikel lama
bercakap **KEPADA** seorang penjaga ("You come home to find fish on
the surface."); artikel baharu menulis **TENTANG** penjaga. Kadar
sapaan jatuh drpd 14–30 per 1k patah perkataan kpd 5.1 — **7 artikel
kini SIFAR sapaan** (`false-maturity`, `grief-without-a-mistake`,
`light-schedule-drift`, `snails-suddenly-everywhere`,
`the-honest-cost-of-going-high-tech`,
`the-relief-youre-not-supposed-to-feel`, `the-tank-you-didnt-start`).
Ini BUKAN masalah kecerdasan/ketepatan — artikel baharu berhujah lebih
rapi. Yg hilang ialah **sapaan**.

**PERATURAN: pilih keluarga nada SEBELUM tulis artikel baharu**, & tulis
pembukaannya ikut gerakan wajib keluarga tu. Suara jauh lebih murah
ditulis drpd ditampal balik.

### Keluarga & artikel rujukannya

1. **Diagnostik segera** (23 artikel — gejala di depan mata, pembaca
   RISAU SEKARANG & sedang mengimbas, bukan membaca). Buka dlm adegan,
   orang kedua, kala kini. **Jawapan dlm perenggan PERTAMA**, bukan
   selepas 3 modul konteks. Nombor sebenar (ppm, hari, darjah).
   Rujuk: `perfect-parameters-fish-dying`, `fish-hiding-what-does-it-mean`.
2. **Penjelas sabar** (11 — pembaca INGIN TAHU, tiada krisis, mahu model
   mental). Nafas lebih panjang dibenarkan, analogi & mekanisme, boleh
   bina hujah merentas 4 modul. Rujuk: `how-often-water-changes`,
   `new-tank-syndrome`. *(Keluarga paling sihat dlm korpus.)*
3. **Rakan praktikal** (8 — pembaca RASA BERSALAH SIKIT: terlepas
   penukaran air, lampu tak berjadual. Mahu kelegaan + satu nombor).
   Pantas, tidak berlagak, sedikit jenaka kering. Sapaan TERTINGGI
   antara semua keluarga. **Beri kebenaran awal**, jangan suruh baca
   esei dulu. Rujuk: `aquarium-maintenance-routine`.
4. **Teman reflektif** (19 — pembaca LETIH, MALU, atau BERKABUNG).
   Kelompok paling banyak ditulis kebelakangan & paling teruk terjejas.
   Kehangatan & sapaan WAJIB. Konkrit boleh rendah (ini bukan tentang
   ppm) tapi **tidak boleh sifar** — perlu sekurang-kurangnya satu imej
   yg boleh DILIHAT. Namakan perasaan dlm perkataan pembaca sendiri
   SEBELUM menganalisisnya. Rujuk: `caring-without-guilt` (masih
   terbaik di laman ni: sapaan 22.1, 24.7% ayat pendek).
5. **Pembela pembaca** (1 — pembaca mahu SESEORANG MENYEBUTNYA
   KUAT-KUAT: kritikan iklan, amalan industri, apa yg dijual kpd
   pemula). Dibenarkan lebih tajam drpd 4 keluarga lain — kata kerja
   kuat, sasaran dinamakan, ayat pendek yg menghentak. Satu-satunya
   tempat di laman ni yg kemarahan terkawal sesuai. Rujuk (percubaan
   pertama, masih terlalu berhati-hati): `the-fish-that-sell-the-tank`.

### Gerakan pembukaan — 2 formula yg SUDAH berulang, elakkan

23 artikel buka dgn adegan yg pembaca sedang berdiri di dalamnya. Tu
kekuatan sebenar laman ni. Tapi 13 lagi kini buka dgn salah satu drpd
dua cop ni:

- **Generalisasi populasi** (8 artikel) — "Almost nobody gets into this
  hobby through…", "Most keepers can describe their ideal routine…",
  "Nobody decides to neglect a tank." Berkesan SEKALI; 8 kali jadi cop.
  Ia jugak letak pembaca dlm kumpulan statistik sblm letak dia dlm
  biliknya sendiri.
- **Mengkritik penulisan lain** (5 artikel) — "Almost every care guide
  is written for a single 'you'…", "Most of what's written about losing
  fish assumes…". Lebih membimbangkan: artikel yg buka dgn mengkritik
  genre panduan akuarium sedang bercakap dgn KESUSASTERAAN, bukan dgn
  PEMBACA. Pembaca tak datang utk perbincangan tentang panduan lain —
  dia datang sbb ada sesuatu berlaku pd tangkinya.

### Tik yg perlu dijaring & dibuang

`actually` ×227 merentas korpus (3.4 per 1k), `genuinely` ×79,
`quietly` ×61, `exactly` ×58 — terburuk 8× `actually` dlm 900 patah
perkataan. Hampir kesemuanya boleh dibuang tanpa ubah makna, & setiap
satunya melembutkan ayat yg patut berdiri sendiri. Sama utk `worth`
sbg isyarat kepentingan (×68 dlm prosa; `hard-to-quit` guna 7× dlm
1,100 patah perkataan: *worth separating, worth understanding, worth
saying plainly, worth checking*) — tu penulis MEMBERITAHU pembaca
sesuatu itu penting, bukan MENUNJUKKANNYA. Ayat pembuka spt "It's
worth naming plainly." ialah bunyi berdeham; buang terus.

Corak berkait: ayat bermula subjek kosong (`It's` / `That's` /
`This is` / `There's`). **Skop ukuran: `.mod-body`/`.pq`/`.hn` sahaja**
(tanpa `.art-intro-text`) — purata korpus **11.0%**; kelompok reflektif
purata **16.8%** (sehingga 23.9% — hampir satu drpd empat ayat),
diagnostik purata 7.8%. Kesannya prosa yg berpusing sekeliling
subjeknya & bukan bergerak melaluinya. **Nota: hanyutan ni bukan
eksklusif kelompok reflektif** — artikel diagnostik BAHARU pun terjejas
(`white-fuzz-driftwood` 22.2%, lebih tinggi drpd majoriti reflektif),
manakala diagnostik lama duduk 2–6%. Punca sebenar ialah TARIKH tulis,
bukan topik.

### Ambang = TRIPWIRE, BUKAN sasaran (Goodhart — bukti dlm repo ni sendiri)

| Semakan | Baca semula kalau |
|---|---|
| sapaan `you`/1k | < 8 (reflektif/diagnostik/praktikal) |
| ayat ≤6 patah perkataan | < 15% |
| CV panjang ayat | < 0.50 |
| pembuka subjek kosong | > 12% |
| tik adverba /1k | > 12 |

**Angka ni menjerit "BACA artikel ni", & TAK PERNAH "tambah 4 lagi
you".** Kalau ia jadi rubrik pemarkahan, hasilnya artikel yg menabur
"you" utk capai ambang — lebih teruk drpd sekarang. Buktinya ada dlm
repo ni: PR #511 optimumkan satu metrik (ayat panjang), lulus setiap
semakan, & meratakan irama dlm kesemua 8 fail (§"Panduan Kualiti Prosa
EN" di atas).

**Ujian terbaik bukan metrik — BACA KUAT.** Irama rata kedengaran dlm
20 saat; skrip audit ambil 20 minit & masih boleh tertipu. Stilometri
kesan sapaan hilang & irama rata; ia TAK BOLEH kesan sama ada satu
perenggan bergerak atau tidak.

**Contoh konkrit bila ambang SALAH & mesti diabaikan** (ditemui PR #517,
& PR #516 utk kes kedua):

1. **`pembuka kosong` tinggi boleh jadi BAIK.** `two-years-one-tank`
   trip 12.8% (ambang ≤12) — tapi kesemua pembukanya ayat pendek yg
   menghentak: "It's the tank working." (4 patah perkataan) · "That's
   the cycle." (3) · "That's the buffer month eight didn't have." Tu
   irama, bukan prosa berpusing. Kadar tinggi drpd ayat PANJANG yg
   berligar = buruk; drpd ayat PENDEK yg menghentak = baik. **Skrip tak
   boleh bezakan dua kes ni; manusia boleh.** Baca sebelum ubah.
2. **Tik boleh jadi TESIS.** Dlm `two-people-one-tank`, "structurally
   different one" ialah tesis artikel & "exactly one extra requirement"
   bilangannya penting — kedua-duanya dikekalkan walau ia naikkan
   kiraan tik. Periksa SETIAP tik dlm konteks; jaring buta akan buang
   perkataan yg memikul makna.

Peraturan am: bila artikel trip ambang, **cari sebab prosa dulu**. Kalau
sebabnya bagus, biarkan & jangan laras. Melaras ayat semata-mata utk
lepas ambang ialah tepat tingkah laku yg seluruh sistem ni dibina utk
elak.

### Keluarga KEENAM — Naratif (dibuka PR #517, `two-years-one-tank`)

Audit 2026-08-30 jumpa lompang: imbasan 62 artikel utk penanda naratif
(satu tangki dijejaki merentas masa, satu keputusan & akibatnya) =
hampir sifar. Semua analisis atau diagnosis; tiada satu pun kisah.
Ini bertepatan dgn matlamat pembezaan user: forum penuh soal-jawab
pantas, YouTube penuh tangki siap — yg hampir tiada ialah **rekod jujur
satu tangki merentas masa**, termasuk bulan yg teruk & keputusan salah.
Lorong ni dibuka PR #517. Rujuk: `two-years-one-tank`.

**KEKANGAN KEJUJURAN — baca ni SEBELUM tulis apa-apa naratif.**
Lorong naratif secara semula jadi menjemput "kisah tangki saya" orang
pertama. **JANGAN tulis itu.** Kita tiada rekod tangki sebenar user, &
mereka-reka testimoni peribadi lalu menerbitkannya sbg benar
bertentangan TERUS dgn postur kejujuran laman — footer
`js/content-trust.js` sendiri kata kandungan berasaskan "hobby
consensus and field observation", & Rhyssa disclaimer kata "can be
wrong". Testimoni palsu memusnahkan tepat perkara yg laman ni jual.
Kredibiliti USER yg tergadai, bukan ejen.

**Bentuk yg dibenarkan**: naratif **ORANG KEDUA** yg mengikut satu
tangki merentas masa dgn bulan/angka/kejadian konkrit. Naratif betul
drpd segi bentuk (masa berlalu, keputusan ada akibat, bahagian teruk
dimasukkan) tanpa mendakwa ia diari sesiapa. **Kerangka WAJIB
dinyatakan terus terang dlm intro** — model ayat sedia ada:
"This isn't one particular tank's diary. It's the shape those two years
usually take, assembled from what typically happens and roughly when."
Kejujuran ni TIDAK melemahkan artikel; ia membebaskan penulisan drpd
perlu berpura-pura.

**Apa yg buat naratif berbaloi (bukan sekadar artikel tambahan)**:
setiap peristiwa MESTI memetakan konsep yg laman dah ajar, supaya
artikel jadi tulang belakang yg menyambung katalog, bukan cerita
terapung. Peta dlm `two-years-one-tank`: diatom minggu 3 → new tank
syndrome; bulan 8 "nampak siap" → false maturity; bulan 10-12 hanyut →
capacity creep; bulan 18 tahan 9 hari tanpa penjaga → ecological
forgiveness. **Dan MESTI masukkan bahagian yg tak pernah dipos** —
bulan yg melencong, kehilangan tanpa sebab dramatik, pengakuan bahawa
tangki dah slip 8 minggu sambil ditatap tiap hari. Tu tepat kandungan
yg `asking-for-help` sendiri kata penjaga tak pernah kongsi; laman ni
menerbitkan rekod yg ia sendiri namakan sbg tiada. Naratif tanpa
bahagian teruk = katalog produk, bukan rekod.

**Nada**: hibrid Penjelas sabar + Teman reflektif. Sapaan tinggi scr
semula jadi (orang kedua), konkrit MESTI tinggi (bulan, angka ujian,
peristiwa) — `two-years-one-tank` lahir pd sapaan 23.4/1k, CV 0.57,
konkrit 42.5/1k tanpa lulusan pembetulan. Kalau draf naratif keluar
rendah konkrit, ia belum jadi naratif; ia masih esei bersamaran.

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

## Pengetahuan Rhyssa (`worker/knowledge.js`) — TIGA lapisan sync MANUAL, tiada pipeline auto

Kandungan kerangka ARA wujud di **TIGA tempat berasingan**, tiada skrip build
yg hubungkan mereka automatik (beza drpd `translations/*.json` → HTML
biasa, yg ada pipeline `build-*-i18n.mjs`):

1. **Halaman laman sebenar** — `articles/ara-*.html` (+ `id`/`ja` setara) —
   apa yg pengguna sebenar baca.
2. **`docs/ARA-framework-v2.md`** (+ `docs/ARA-psychology-foundations.md`) —
   dokumen rujukan dalaman, sepatutnya cerminkan (1).
3. **`worker/knowledge.js`** — pengetahuan Rhyssa (AI chat backend),
   diimport terus sbg *string statik* ke `worker/index.js`
   (`import { ARA_FRAMEWORK, ARA_PSYCHOLOGY } from './knowledge.js'`,
   disuntik ke system prompt) & **dibakar masa deploy Worker** — BUKAN
   dibaca "live" drpd laman semasa pengguna chat. Nota kepala fail tu
   sendiri kata "sourced from docs/ at build time... update these
   constants if the docs change" — arahan MANUAL utk manusia/ejen,
   bukan skrip yg jalan sendiri (beza drpd `worker/article-index.js`
   yg DIJANA oleh `scripts/build-worker-knowledge.mjs`).

**WAJIB**: lepas ubah kandungan ARA di (1), semak & selaraskan (2) DAN
(3) dlm PR/commit yg SAMA — jangan anggap salah satu akan "ikut sendiri".
Disahkan drift boleh berlaku sunyi (ditemui 2026-08-21: paragraf skop
marine/reef dikemas kini di (1) tapi tertinggal di (2)/(3) sehingga
disemak khusus) — Rhyssa akan terus bagi jawapan berdasarkan pengetahuan
LAPUK kpd pengguna walau laman sendiri dah betul, sehingga (3) turut
dikemas kini & Worker di-deploy semula (`worker/**` berubah → auto-deploy
via `.github/workflows/deploy-worker.yml`).

## Semakan Sebelum Commit

- `npm run check` (`check:syntax` + `test` [Node test runner,
  `tests/*.test.mjs`] + `lint` [ESLint `js/`/`scripts/`/`worker/`/
  `tests/`] + `check-prose.mjs --errors`) — mesti 0 ralat (amaran
  `no-unused-vars` dsb. ditoleransi, byk pre-existing).
- `npm run i18n:check` — jalankan DUA kali, diff-stat mesti SAMA
  (idempoten) sblm commit; selepas commit patut kosong.
- `npm run prose:check` (`scripts/check-prose.mjs`) — **DUA tahap
  keterukan, sengaja diasingkan**:
  - **RALAT (exit 1, tersemat dlm `npm run check` via `--errors`)** —
    singkatan gaya sembang dlm prosa terjemahan tersiar (`yg`/`dgn`/
    `utk`/`&`/`benar²`) & istilah ja yg hanyut (`低床`/`低テク` →
    `ローテク`, katakana alignment → `整合`). Objektif salah, kini SIFAR,
    mesti kekal sifar. Ni yg melindungi kerja PR #512 drpd regresi
    senyap. URL & unit saintifik (`m²`) dikecualikan automatik.
  - **AMARAN (exit 0, cuma dlm `npm run prose:check` penuh)** —
    tripwire nada (sapaan, ayat pendek, variasi irama, pembuka kosong,
    tik). Dipaparkan hanya bila artikel trip **≥3 ambang serentak**
    (satu ambang = variasi biasa; tiga serentak = tandatangan suara
    esei yg hanyut). Kini 32/62 artikel — itu memang penemuan audit,
    bukan bug skrip.

  **SEBAB diasingkan**: kalau tripwire nada gagalkan build, ia gagal
  setiap hari & terus diabaikan; kalau ia dicetak pd setiap
  `npm run check`, 32 baris amaran mengubur output lint. Ralat = gate,
  amaran = atas permintaan masa buat kerja nada. Amaran TAK PERNAH
  bermaksud "tambah 4 lagi you" — rujuk §"Lima Keluarga Nada"
  (Goodhart).
- Playwright (`node_modules/.bin/playwright`, guna
  `executablePath: '/opt/pw-browsers/chromium'` dlm sandbox agen — CDN
  luar cth. `fonts.googleapis.com`/analitik disekat, `ERR_TUNNEL_
  CONNECTION_FAILED` dijangka & selamat diabaikan dlm log ralat JS,
  bukan bug sebenar) — uji fungsian merentas SEMUA bahasa (termasuk
  `en` sbg semakan regresi, sbb fail JS alat interaktif DIKONGSI semua
  bahasa) lepas apa-apa perubahan JS/HTML i18n.

  **PANTAU RESPONS 404, bukan setakat ralat JS** (`page.on('response',
  r => r.status()===404)`). Aset hilang tak semestinya lempar ralat JS
  — `js/ui-calm-mode.js` 404 pd halaman utama id/ja utk tempoh yg tak
  diketahui & tiada semakan sedia ada menangkapnya sehingga jejak 404
  ditambah (PR #517, rujuk §"AWAS KEDUA — SENARAI KERAS" di atas).
  **Uji halaman utama id/ja juga**, bukan setakat halaman artikel:
  laluan aset relatif berkelakuan berbeza pd `/id/` berbanding root.
