/**
 * Prose & translation-language gate.
 *
 * Guards two distinct failure modes found in the 2026-08-30 language audit.
 * They need different severities, because mixing them produces a gate that
 * fails on every run and therefore gets ignored:
 *
 *   ERRORS (exit 1) — objectively wrong, currently zero, must stay zero.
 *     · Chat abbreviations in published translation prose ("yg", "dgn",
 *       "utk"). Found in 3 live id files (PR #512) because the translating
 *       agent wrote in the SESSION's language convention (Bahasa Melayu,
 *       abbreviated like CLAUDE.md itself) instead of the TARGET language.
 *       Structure validation passed it: it checked key counts, not language.
 *       Abbreviations are never acceptable in published article prose in
 *       any language, so this is a safe hard gate.
 *     · ja terminology that drifted from the established term (低床/低テク
 *       for "low-tech" instead of ローテク; katakana "alignment" instead of
 *       整合).
 *
 *   WARNINGS (exit 0) — voice tripwires. These say "READ this article",
 *     never "add four more 'you'". Several existing articles trip them by
 *     design; see CLAUDE.md §"Lima Keluarga Nada" on why they must never
 *     become a scoring rubric (Goodhart — PR #511 optimised one metric,
 *     passed every check, and flattened sentence rhythm in all 8 files).
 *
 * Usage:
 *   node scripts/check-prose.mjs            # both, exit 1 only on errors
 *   node scripts/check-prose.mjs --errors   # skip the voice tripwires
 *
 * Exit code 0 = no errors. Exit code 1 = at least one error.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(import.meta.dirname, '..');
const errorsOnly = process.argv.includes('--errors');

/* Article templates that aren't standard prose (own build scripts, embedded
   JS strings, framework files) — same exclusion list the audit used. */
const SKIP_SLUGS = new Set([
  'tank-builder', 'tank-simulator', 'community-stress-lab', 'know-your-rhythm',
  'ara-full-framework', 'ara-s1-foundation', 'ara-s2-five-rhythms',
  'ara-s3-phases', 'ara-s4-alignment', 'ara-s5-observation', 'ara-s6-ethics',
  'four-principles-of-ara', 'reading-the-five-rhythms',
]);

/* Abbreviations that are wrong in published prose in EVERY language we ship.
   Deliberately excludes forms that are valid Indonesian ("tak", "dah") or
   valid in some other reading — those belong in the warning list, not here. */
const ABBREV = [
  'yg', 'dgn', 'sbg', 'utk', 'dlm', 'drpd', 'sbb', 'kpd', 'byk', 'spt',
  'krn', 'bkn', 'ttg', 'thd', 'scr', 'sdh', 'hrs', 'tdk', 'msh', 'bhw',
  'tsb', 'sblm', 'pd', 'dr', 'jgn', 'blh', 'sgt',
];

/* Bahasa Melayu words with a different correct Indonesian form. Warning
   only: several near-misses ("kerap", "pantas", "lestari",
   "penyelenggaraan") are perfectly valid Indonesian, so this list guides a
   human read rather than blocking a commit. */
const BM_WORDS = {
  berbeza: 'berbeda', jadual: 'jadwal', kapasiti: 'kapasitas',
  fasa: 'fase', soalan: 'pertanyaan', haiwan: 'hewan',
  kelajuan: 'kecepatan', keamatan: 'intensitas', siling: 'plafon',
  berkongsi: 'berbagi', 'kedua-duanya': 'keduanya', kemahiran: 'keterampilan',
  dijejak: 'dilacak', kraf: 'keahlian',
};

/* ja terms that drifted from the established form. */
const JA_TERMS = [
  ['低床', 'ローテク', 'bermaksud "substrat rendah", bukan "low-tech"'],
  ['低テク', 'ローテク', 'hibrid tak standard'],
  ['アライメント', '整合', 'alignment mesti istilah Jepun asli'],
  ['アラインメント', '整合', 'alignment mesti istilah Jepun asli'],
];

const errors = [];
const warnings = [];

/* ── helpers ──────────────────────────────────────────────────────────── */

// URLs and href attributes carry legitimate "org", "dr" etc. Strip them
// before scanning so rspca.org.au never reads as a Malay abbreviation.
function stripUrls(s) {
  return s.replace(/https?:\/\/\S+/g, ' ').replace(/href="[^"]*"/g, ' ');
}

// Reduplication shorthand ("benar²", "masing²") is wrong; scientific units
// ("m²", "cm²", "umol/m²/s") are correct. Word length separates them.
const REDUP = /[A-Za-zÀ-ÿ]{3,}²/g;

function proseStrings(json) {
  const out = [];
  const push = (v) => { if (typeof v === 'string' && v.trim()) out.push(v); };
  for (const m of json.modules || []) {
    (m.body || []).forEach(push);
    (m.hintText || []).forEach(push);
    push(m.pullQuote); push(m.tag); push(m.titleHtml);
    push(m.prevBtn); push(m.nextBtn); push(m.hintLabel);
  }
  const i = json.intro || {};
  (i.texts || []).forEach(push);
  push(i.subtitle); push(i.titleHtml); push(i.cta);
  for (const r of json.relatedLinks || []) push(r.text);
  return out;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ── ERROR 1: chat abbreviations in translation prose ─────────────────── */

for (const lang of ['id', 'ja']) {
  const dir = path.join(ROOT, 'translations', lang);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    } catch {
      errors.push(`translations/${lang}/${file} — JSON tak sah`);
      continue;
    }
    const text = stripUrls(proseStrings(json).join(' \n '));
    const hits = [];
    for (const w of ABBREV) {
      const n = (text.match(new RegExp(`\\b${w}\\b`, 'g')) || []).length;
      if (n) hits.push(`${w}×${n}`);
    }
    const amp = (text.match(/\s&\s/g) || []).length;
    if (amp) hits.push(`bare-&×${amp}`);
    const redup = (text.match(REDUP) || []).length;
    if (redup) hits.push(`²×${redup}`);
    if (hits.length) {
      errors.push(
        `translations/${lang}/${file} — singkatan gaya sembang dlm prosa tersiar: ${hits.join(' ')}`,
      );
    }
  }
}

/* ── ERROR 2: ja terminology drift ────────────────────────────────────── */

const jaDir = path.join(ROOT, 'translations', 'ja');
if (fs.existsSync(jaDir)) {
  for (const file of fs.readdirSync(jaDir).filter((f) => f.endsWith('.json'))) {
    const raw = fs.readFileSync(path.join(jaDir, file), 'utf8');
    for (const [bad, good, why] of JA_TERMS) {
      const n = (raw.split(bad).length - 1);
      if (n) {
        errors.push(
          `translations/ja/${file} — "${bad}"×${n} → guna "${good}" (${why})`,
        );
      }
    }
  }
}

/* ── WARNING 1: Bahasa Melayu word choice in id ───────────────────────── */

if (!errorsOnly) {
  const idDir = path.join(ROOT, 'translations', 'id');
  if (fs.existsSync(idDir)) {
    for (const file of fs.readdirSync(idDir).filter((f) => f.endsWith('.json'))) {
      let json;
      try {
        json = JSON.parse(fs.readFileSync(path.join(idDir, file), 'utf8'));
      } catch { continue; }
      const text = stripUrls(proseStrings(json).join(' \n ')).toLowerCase();
      const hits = [];
      for (const [bm, id] of Object.entries(BM_WORDS)) {
        const n = (text.match(new RegExp(`\\b${bm}\\b`, 'g')) || []).length;
        if (n) hits.push(`${bm}→${id}×${n}`);
      }
      if (hits.length) {
        warnings.push(`translations/id/${file} — perkataan BM: ${hits.join(' ')}`);
      }
    }
  }
}

/* ── WARNING 2: EN voice tripwires ────────────────────────────────────── */

const DUMMY = /^(It's|It is|That's|That is|This is|This isn't|There's|There is|There are|It isn't|That isn't)\b/i;
const TICS = ['actually', 'genuinely', 'specifically', 'quietly', 'structurally', 'exactly'];

if (!errorsOnly) {
  const artDir = path.join(ROOT, 'articles');
  for (const file of fs.readdirSync(artDir).filter((f) => f.endsWith('.html'))) {
    const slug = file.slice(0, -5);
    if (SKIP_SLUGS.has(slug)) continue;
    const html = fs.readFileSync(path.join(artDir, file), 'utf8');

    // Reader-visible prose only: mod-body / pq / hn paragraphs. Matches the
    // measurement scope documented in CLAUDE.md so numbers are comparable.
    const paras = [];
    for (const c of html.matchAll(/<div class="(?:mod-body|pq|hn)"[^>]*>([\s\S]*?)<\/div>/g)) {
      for (const p of c[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
        const t = stripTags(p[1]);
        if (t) paras.push(t);
      }
    }
    if (!paras.length) continue;

    const full = paras.join(' ');
    const words = full.split(/\s+/).length;
    const sents = paras.flatMap((p) => p.split(/(?<=[.!?])\s+(?=[A-Z"'])/)).filter((s) => s.trim());
    const lens = sents.map((s) => s.split(/\s+/).length);
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);

    const cv = sd / mean;
    const shortPct = (lens.filter((l) => l <= 6).length * 100) / lens.length;
    const dummyPct = (sents.filter((s) => DUMMY.test(s)).length * 100) / sents.length;
    const you = (full.toLowerCase().match(/\b(you|your|you're|you've|yours)\b/g) || []).length;
    const youPer1k = (you * 1000) / words;
    const tic = TICS.reduce(
      (a, t) => a + (full.toLowerCase().match(new RegExp(`\\b${t}\\b`, 'g')) || []).length, 0,
    );
    const ticPer1k = (tic * 1000) / words;

    const trips = [];
    if (youPer1k < 8) trips.push(`sapaan ${youPer1k.toFixed(1)}/1k`);
    if (shortPct < 15) trips.push(`ayat pendek ${shortPct.toFixed(0)}%`);
    if (cv < 0.50) trips.push(`variasi irama ${cv.toFixed(2)}`);
    if (dummyPct > 12) trips.push(`pembuka kosong ${dummyPct.toFixed(0)}%`);
    if (ticPer1k > 12) trips.push(`tik ${ticPer1k.toFixed(0)}/1k`);

    // One tripped threshold is normal variation; three or more together is
    // the signature of the drifted essayistic voice the audit identified.
    if (trips.length >= 3) {
      warnings.push(`articles/${file} — ${trips.length} tripwire: ${trips.join(', ')}`);
    }
  }
}

/* ── report ───────────────────────────────────────────────────────────── */

if (errors.length) {
  console.error(`\nprose:check — ${errors.length} RALAT (mesti sifar):\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(
    '\n  Rujuk CLAUDE.md §"AWAS — ejen terjemah boleh tulis dlm BAHASA SESI".',
  );
}

if (warnings.length) {
  console.log(`\nprose:check — ${warnings.length} amaran (baca, jangan optimum):\n`);
  for (const w of warnings) console.log(`  · ${w}`);
  console.log(
    '\n  Amaran = "BACA artikel ni", BUKAN "tambah 4 lagi you".\n' +
    '  Rujuk CLAUDE.md §"Lima Keluarga Nada" — ambang ni tripwire, bukan rubrik.',
  );
}

if (errors.length) {
  // already reported above
} else if (errorsOnly) {
  console.log('prose:check — 0 ralat. (Jalankan `npm run prose:check` utk tripwire nada.)');
} else if (warnings.length) {
  console.log('\nprose:check — 0 ralat.');
} else {
  console.log('prose:check — tiada ralat, tiada amaran.');
}

process.exit(errors.length ? 1 : 0);
