/**
 * Generates localized HTML for articles/rhythm-tracker.html (bespoke
 * 5-rhythm interactive tool — NOT the normal head/intro/modules[] article
 * schema, so build-i18n.mjs cannot process it; see BESPOKE_SLUGS there).
 *
 * The EN source keeps every rhythm's questions + reflect() branching logic
 * as one inline <script> object literal (RHYTHMS{}). Rather than hand-copy
 * every English string into a swap table (error-prone across ~380 strings),
 * this script executes the EN RHYTHMS object in a sandbox (Node vm) and
 * calls each rhythm's real reflect() with crafted answer combinations to
 * extract the *exact* shipped English string for every branch — the same
 * text is then subOnce/subAll-replaced with its translations/<lang>/
 * rhythm-tracker.json counterpart. This guarantees byte-exact EN
 * matching (no risk of a transcription slip breaking a substitution).
 *
 * Usage: node scripts/build-ryr-i18n.mjs [--lang id|ja]
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT      = path.join(import.meta.dirname, '..');
const TRANS_DIR = path.join(ROOT, 'translations');
const BASE_URL  = 'https://aquaticrhythm.com';
const LANGUAGES = ['id', 'ja'];
const SLUG      = 'rhythm-tracker';
const SRC_PATH  = path.join(ROOT, 'articles', `${SLUG}.html`);

const args    = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
const langArg = langIdx !== -1 ? args[langIdx + 1] : undefined;
const targetLangs = langArg ? [langArg] : LANGUAGES;

// ── Shared sitewide chrome (duplicated deliberately from build-i18n.mjs —
// same convention as every other build-*-i18n.mjs script) ──────────────────
const NAV_LABELS = {
  id: {
    logoAria: 'Aquatic Rhythm — perawatan ekologis untuk akuarium kecil',
    home: 'Beranda', reading: 'Panduan', companion: 'Pendamping', companionMobile: 'Pendamping AI',
    tools: 'Alat', toolsMobile: 'Lab &amp; Alat', log: 'Catatan', about: 'Tentang',
    privacy: 'Kebijakan Privasi', terms: 'Syarat Penggunaan', menu: 'Menu', bnavLog: 'Log Penjaga'
  },
  ja: {
    logoAria: 'Aquatic Rhythm — 小型水槽のための生態学的なケア',
    home: 'ホーム', reading: 'ガイド', companion: 'コンパニオン', companionMobile: 'AIコンパニオン',
    tools: 'ツール', toolsMobile: 'ラボ&amp;ツール', log: '記録', about: 'サイトについて',
    privacy: 'プライバシーポリシー', terms: '利用規約', menu: 'メニュー', bnavLog: 'キーパーの記録'
  }
};

const RH_SHEET = {
  id: {
    dialogAria: 'Chat dengan Rhyssa', closeAria: 'Tutup obrolan', sub: 'Pendamping Akuarium',
    resetAria: 'Atur ulang percakapan', threadAria: 'Percakapan dengan Rhyssa',
    welcome: 'Ceritakan apa yang Anda lihat — air, perilaku, apa pun yang berubah — dan kita bisa memahaminya bersama sebelum memperbaiki apa pun.',
    alsoPre: 'Rhyssa yang sama — juga ada di ', alsoPost: ' jika Anda lebih suka.',
    inputPlaceholder: 'Tanyakan tentang akuarium Anda…', inputAria: 'Pesan untuk Rhyssa',
    sendAria: 'Kirim',
    note: 'AI bisa saja salah — untuk keadaan darurat pada ikan, konsultasikan dengan spesialis'
  },
  ja: {
    dialogAria: 'Rhyssaとチャット', closeAria: 'チャットを閉じる', sub: 'アクアリウムコンパニオン',
    resetAria: '会話をリセット', threadAria: 'Rhyssaとの会話',
    welcome: '見えているものを教えてください。水、行動、変わったことなら何でも構いません。何かを直す前に、一緒に読み解いていきましょう。',
    alsoPre: '同じRhyssaは、', alsoPost: 'でもご利用いただけます。',
    inputPlaceholder: '水槽について質問する…', inputAria: 'Rhyssaへのメッセージ',
    sendAria: '送信',
    note: 'AIは間違えることがあります。魚の緊急事態では、専門家に相談してください'
  }
};

function replaceOnce(html, pattern, fn) { return html.replace(pattern, fn); }

function getReadySlugsForLang(lang) {
  const dir = path.join(TRANS_DIR, lang);
  const ready = new Set();
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      try {
        const t = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (t._meta && t._meta.status === 'ready') ready.add(f.replace('.json', ''));
      } catch { /* skip */ }
    }
  }
  return ready;
}

function localizeArticleLinks(h, lang) {
  const ready = getReadySlugsForLang(lang);
  return h.replace(/href="\/articles\/([a-z0-9-]+)(#[^"]*)?"/g, (m, slug, frag) =>
    ready.has(slug) ? `href="/${lang}/articles/${slug}${frag || ''}"` : m);
}

function buildHreflangTags(currentLang) {
  const lines = [`<link rel="alternate" hreflang="en" href="${BASE_URL}/articles/${SLUG}">`];
  for (const lang of LANGUAGES) {
    if (fs.existsSync(path.join(TRANS_DIR, lang, `${SLUG}.json`))) {
      lines.push(`<link rel="alternate" hreflang="${lang}" href="${BASE_URL}/${lang}/articles/${SLUG}">`);
    }
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/articles/${SLUG}">`);
  return lines.join('\n');
}

// ── Extract every EN leaf string by executing the real RHYTHMS object ──────
function extractEnglish(enHtml) {
  const startMarker = '/* ═══ RHYTHMS ═══ */';
  const endMarker   = '/* ═══ FLOW ═══ */';
  const si = enHtml.indexOf(startMarker);
  const ei = enHtml.indexOf(endMarker);
  if (si === -1 || ei === -1) throw new Error('RHYTHMS markers not found in source');
  const rhythmsSrc = enHtml.slice(si + startMarker.length, ei);

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(rhythmsSrc, sandbox);
  const RHYTHMS = sandbox.RHYTHMS;
  if (!RHYTHMS || !RHYTHMS.water) throw new Error('RHYTHMS extraction failed');

  const en = { rhythms: {} };

  function waterAns(o) {
    return Object.assign({
      'cycle-status': 'established', 'testing-habit': 'routine', 'trend-read': 'history',
      'stable-response': 'leave-stable', 'oxygen-read': 'oxygen-aware'
    }, o);
  }
  const w = RHYTHMS.water;
  const wDefault = w.reflect(waterAns({}));
  en.rhythms.water = {
    questions: w.questions,
    reflect: {
      titles: {
        'still-cycling': w.reflect(waterAns({ 'cycle-status': 'still-cycling' })).title,
        'not-sure': w.reflect(waterAns({ 'cycle-status': 'not-sure' })).title,
        'mature': wDefault.title,
        'established-not-mature': w.reflect(waterAns({ 'cycle-status': 'established', 'testing-habit': 'rarely', 'trend-read': 'gut-feeling', 'stable-response': 'multiple-fixes', 'oxygen-read': 'no-idea' })).title,
        'default-developing': w.reflect(waterAns({ 'cycle-status': 'recently-done' })).title
      },
      cyc: {
        'still-cycling': w.reflect(waterAns({ 'cycle-status': 'still-cycling' })).paras[0],
        'not-sure': w.reflect(waterAns({ 'cycle-status': 'not-sure' })).paras[0],
        'recently-done': w.reflect(waterAns({ 'cycle-status': 'recently-done' })).paras[0],
        'established': wDefault.paras[0]
      },
      testTrend: {
        'routine-history': wDefault.paras[1],
        'routine-other': w.reflect(waterAns({ 'trend-read': 'ideal-number' })).paras[1],
        'reactive': w.reflect(waterAns({ 'testing-habit': 'reactive' })).paras[1],
        'rarely': w.reflect(waterAns({ 'testing-habit': 'rarely' })).paras[1],
        'too-new': w.reflect(waterAns({ 'testing-habit': 'too-new' })).paras[1]
      },
      resp: {
        'leave-stable': wDefault.paras[2],
        'nudge-toward-ideal': w.reflect(waterAns({ 'stable-response': 'nudge-toward-ideal' })).paras[2],
        'multiple-fixes': w.reflect(waterAns({ 'stable-response': 'multiple-fixes' })).paras[2],
        'would-research': w.reflect(waterAns({ 'stable-response': 'would-research' })).paras[2]
      },
      o2: {
        'oxygen-aware': wDefault.paras[3],
        'disease-or-ammonia': w.reflect(waterAns({ 'oxygen-read': 'disease-assume' })).paras[3],
        'no-idea': w.reflect(waterAns({ 'oxygen-read': 'no-idea' })).paras[3]
      },
      closing: {
        'still-cycling': w.reflect(waterAns({ 'cycle-status': 'still-cycling' })).closing,
        'not-sure': w.reflect(waterAns({ 'cycle-status': 'not-sure' })).closing,
        'mature': wDefault.closing,
        'developing': w.reflect(waterAns({ 'cycle-status': 'recently-done' })).closing
      },
      phaseText: {
        'Early': w.reflect(waterAns({ 'cycle-status': 'still-cycling' })).phase,
        'Developing': w.reflect(waterAns({ 'cycle-status': 'recently-done' })).phase,
        'Mature': wDefault.phase
      }
    }
  };

  function extractGeneric(rhythmKey, axisIds, axisShortKeys, comboMatureVals, comboSpecialTitleVals, comboDevVals, comboEarlyVals, specialTitleKey, devRepresentativeVals) {
    const r = RHYTHMS[rhythmKey];
    function ansFrom(vals) {
      const a = {};
      axisIds.forEach((id, i) => { a[id] = vals[i]; });
      return a;
    }
    const matureRes = r.reflect(ansFrom(comboMatureVals));
    const specialRes = r.reflect(ansFrom(comboSpecialTitleVals));
    const devRes = r.reflect(ansFrom(devRepresentativeVals || comboDevVals));
    const earlyRes = r.reflect(ansFrom(comboEarlyVals));
    if (!devRes.phase.includes('Developing')) throw new Error(`${rhythmKey}: dev combo landed in ${devRes.phase}`);
    if (!earlyRes.phase.includes('Early')) throw new Error(`${rhythmKey}: early combo landed in ${earlyRes.phase}`);
    if (!matureRes.phase.includes('Mature')) throw new Error(`${rhythmKey}: mature combo landed in ${matureRes.phase}`);

    const result = { questions: r.questions, reflect: { titles: {}, closing: {}, phaseText: {} } };
    axisShortKeys.forEach((k) => { result.reflect[k] = {}; });

    r.questions.forEach((q, axisIdx) => {
      const shortKey = axisShortKeys[axisIdx];
      q.opts.forEach((opt) => {
        for (const vals of [comboMatureVals, comboSpecialTitleVals, comboDevVals, comboEarlyVals]) {
          if (vals[axisIdx] === opt.v) {
            result.reflect[shortKey][opt.v] = r.reflect(ansFrom(vals)).paras[axisIdx];
            return;
          }
        }
        throw new Error(`${rhythmKey}: no combo covers ${shortKey}.${opt.v}`);
      });
    });

    result.reflect.titles[specialTitleKey] = specialRes.title;
    result.reflect.titles['mature'] = matureRes.title;
    result.reflect.titles['developing'] = devRes.title;
    result.reflect.titles['early'] = earlyRes.title;
    result.reflect.closing['early'] = earlyRes.closing;
    result.reflect.closing['developing'] = devRes.closing;
    result.reflect.closing['mature'] = matureRes.closing;
    result.reflect.phaseText['Early'] = earlyRes.phase;
    result.reflect.phaseText['Developing'] = devRes.phase;
    result.reflect.phaseText['Mature'] = matureRes.phase;
    return result;
  }

  en.rhythms.biological = extractGeneric('biological',
    ['biofilm-read', 'substrate-clean', 'recovery-awareness', 'maturity-marker', 'filter-media'],
    ['bio', 'sub', 'rec', 'mat', 'med'],
    ['leave-it', 'spot-clean', 'ease-back', 'resilience', 'rinse-tank-water'],
    ['never-noticed', 'not-applicable', 'never-happened', 'zero-readings', 'rarely-touch'],
    ['worried-contamination', 'never-touch', 'push-forward', 'time-elapsed', 'replace-regularly'],
    ['wipe-immediately', 'full-clean-routine', 'back-to-normal', 'unsure-marker', 'tap-water-rinse'],
    'zero-readings-not-mature');

  en.rhythms.environmental = extractGeneric('environmental',
    ['light-schedule', 'light-consequence', 'hardscape-moves', 'flow-deadspots', 'temp-stability'],
    ['lit', 'con', 'hsc', 'flw', 'tmp'],
    ['timer', 'chronic-stress-aware', 'rarely-once-set', 'checks-regularly', 'stable-monitored'],
    ['by-feel-consistent', 'algae-only', 'frequent-aesthetic', 'notices-eventually', 'stable-assumed'],
    ['by-feel-variable', 'no-real-effect', 'occasional-reason', 'rarely-looks', 'noticeable-swings'],
    ['rarely-tracked', 'not-sure', 'no-hardscape', 'never-considered', 'unsure-swings'],
    'frequent-aesthetic-not-mature',
    ['timer', 'algae-only', 'occasional-reason', 'notices-eventually', 'stable-assumed']);

  en.rhythms.livestock = extractGeneric('livestock',
    ['observation-baseline', 'preclinical-signs', 'stress-accumulation', 'new-addition-disruption', 'behaviour-vs-chemistry'],
    ['obs', 'pre', 'acc', 'add', 'beh'],
    ['yes-know-baseline', 'watch-pattern', 'chronic-cumulative', 'expects-disruption', 'watch-animals-first'],
    ['dont-know-individuals', 'immediate-treatment', 'unsure-cumulative', 'havent-considered', 'wait-and-see'],
    ['maybe-eventually', 'dismiss-single', 'fine-if-no-symptom', 'no-real-disruption', 'test-water-first'],
    ['only-dramatic', 'wouldnt-notice', 'one-cause-only', 'only-newcomer-stressed', 'check-equipment-first'],
    'immediate-treatment-not-mature');

  en.rhythms.keeper = extractGeneric('keeper',
    ['wc-interval-awareness', 'filter-check-date', 'feeding-precision', 'observation-quality', 'automation-reliance'],
    ['wc', 'fc', 'fd', 'obq', 'auto'],
    ['same-or-decided', 'recent-known', 'measured', 'reading', 'trust-but-verify'],
    ['drifted-unnoticed', 'know-but-a-while', 'estimated-variable', 'glancing', 'unsure-checking'],
    ['drifted-aware', 'new-tank', 'estimated-consistent', 'checking', 'no-automation'],
    ['not-sure', 'no-idea', 'not-tracked', 'rarely-look', 'set-and-forget'],
    'drifted-unnoticed-not-mature');

  return en;
}

// ── Build a sorted (longest-first) list of [enString, translatedString] pairs ──
function buildSubstitutionPairs(enRhythms, tRhythms) {
  const pairs = [];
  function addLeaf(enVal, tVal) {
    if (typeof enVal !== 'string' || typeof tVal !== 'string') return;
    if (enVal === tVal) return; // no-op, e.g. accidental identical string
    pairs.push([enVal, tVal]);
  }
  for (const rk of Object.keys(enRhythms)) {
    const enR = enRhythms[rk], tR = tRhythms[rk];
    enR.questions.forEach((q, qi) => {
      const tq = tR.questions[qi];
      addLeaf(q.text, tq.text);
      addLeaf(q.sub, tq.sub);
      q.opts.forEach((o, oi) => {
        addLeaf(o.l, tq.opts[oi].l);
        addLeaf(o.d, tq.opts[oi].d);
      });
    });
    for (const axis of Object.keys(enR.reflect)) {
      const enAxis = enR.reflect[axis], tAxis = tR.reflect[axis];
      for (const key of Object.keys(enAxis)) {
        addLeaf(enAxis[key], tAxis[key]);
      }
    }
  }
  pairs.sort((a, b) => b[0].length - a[0].length);
  return pairs;
}

// The RHYTHMS block's questions/reflect strings live inside single-quoted JS
// string literals in the source file. vm-evaluating them (extractEnglish)
// yields the clean runtime value (e.g. a real apostrophe), but the raw HTML
// text still has it backslash-escaped ("isn\'t"). Both the search key and
// the inserted replacement must be re-escaped the same way, or the raw-text
// substring search misses and/or the output file's JS becomes invalid.
function escapeForSingleQuoteJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function applySubstitutions(html, pairs) {
  for (const [en, translated] of pairs) {
    const enEscaped = escapeForSingleQuoteJs(en);
    const translatedEscaped = escapeForSingleQuoteJs(translated);
    if (!html.includes(enEscaped)) {
      throw new Error(`substitution source not found in HTML (first 80 chars): ${enEscaped.slice(0, 80)}`);
    }
    html = html.split(enEscaped).join(translatedEscaped);
  }
  return html;
}

// ── Main ─────────────────────────────────────────────────────────────────
const enHtml = fs.readFileSync(SRC_PATH, 'utf8');
const enExtracted = extractEnglish(enHtml);

for (const lang of targetLangs) {
  const tPath = path.join(TRANS_DIR, lang, `${SLUG}.json`);
  if (!fs.existsSync(tPath)) { console.log(`  no translation file for lang=${lang}`); continue; }
  const t = JSON.parse(fs.readFileSync(tPath, 'utf8'));
  const missing = ['water', 'biological', 'environmental', 'livestock', 'keeper'].filter(k => !t.rhythms[k]);
  if (missing.length) { console.log(`  ${lang}: rhythms not yet translated: ${missing.join(', ')} — skipping`); continue; }

  let h = enHtml;

  // 1. <html lang="">
  h = h.replace(/(<html[^>]*\slang=")[^"]*(")/, (_, a, b) => `${a}${lang}${b}`);

  // 2. Head meta
  h = replaceOnce(h, /<title>[^<]*<\/title>/, () => `<title>${t.head.title}</title>`);
  h = replaceOnce(h, /(<meta name="description" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.description}${b}`);
  h = replaceOnce(h, /(<meta property="og:title" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.ogTitle}${b}`);
  h = replaceOnce(h, /(<meta property="og:description" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.ogDescription}${b}`);
  h = replaceOnce(h, /(<meta name="twitter:title" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.twitterTitle}${b}`);
  h = replaceOnce(h, /(<meta name="twitter:description" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.twitterDescription}${b}`);

  // 3. Canonical + OG/Twitter URL
  const localUrl = `${BASE_URL}/${lang}/articles/${SLUG}`;
  h = replaceOnce(h, /(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);
  h = replaceOnce(h, /(<meta property="og:url" content=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);
  h = replaceOnce(h, /(<meta name="twitter:url" content=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);

  // 4. hreflang (strip existing, inject fresh)
  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  h = replaceOnce(h, /(<link rel="canonical"[^>]*>)/, (_, canon) => `${canon}\n${buildHreflangTags(lang)}`);

  // 5. window.__arI18n (both langs now available for the settings switcher)
  h = h.replace(/window\.__arI18n=\{basePath:'articles\/rhythm-tracker',avail:\[\]\};/,
    `window.__arI18n={basePath:'articles/${SLUG}',avail:${JSON.stringify(LANGUAGES)}};`);

  // 6. JSON-LD
  h = replaceOnce(h, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => {
    const headline = t.head.jsonLdHeadline;
    const schema = {
      '@context': 'https://schema.org', '@type': 'Article',
      'headline': headline, 'description': t.head.jsonLdDescription,
      'url': localUrl, 'inLanguage': lang,
      'image': `${BASE_URL}/og-image.png`,
      'author': { '@type': 'Organization', 'name': 'Aquatic Rhythm' },
      'publisher': { '@type': 'Organization', 'name': 'Aquatic Rhythm', 'url': BASE_URL, 'logo': { '@type': 'ImageObject', 'url': `${BASE_URL}/og-image.png` } },
      'datePublished': '2026-09-04', 'dateModified': '2026-09-04'
    };
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  });

  // 7. Japanese font stack
  if (lang === 'ja') {
    const notoLink = `\n<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" onload="this.onload=null;this.rel='stylesheet'">\n<noscript><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" rel="stylesheet"></noscript>`;
    h = h.replace(/(<\/style>)/, `$1${notoLink}`);
    h = h.replace(/(--sans:'Work Sans',system-ui,sans-serif)/, "--sans:'Work Sans','Noto Sans JP',system-ui,sans-serif");
  }

  // 8. Nav chrome
  const nav = NAV_LABELS[lang];
  h = replaceOnce(h, /(<a href="\/" class="nl" aria-label=")[^"]*(")/, (_, a, b) => `${a}${nav.logoAria}${b}`);
  h = replaceOnce(h, /(<ul class="nlinks">)[\s\S]*?(<\/ul>)/, (_, a, b) => `${a}
    <li><a href="/${lang}/">${nav.home}</a></li>
    <li><a href="/${lang}/reading">${nav.reading}</a></li>
    <li><a href="/${lang}/?p=companion">${nav.companion}</a></li>
    <li><a href="/${lang}/?p=tools">${nav.tools}</a></li>
    <li><a href="/${lang}/?p=journal">${nav.log}</a></li>
    <li><a href="/${lang}/?p=about">${nav.about}</a></li>
  ${b}`);
  h = replaceOnce(h, /(<button class="nbg" id="burger" aria-label=")[^"]*(")/, (_, a, b) => `${a}${nav.menu}${b}`);
  h = replaceOnce(h, /(<div class="nmob" id="nmob"[^>]*>\s*<ul>)[\s\S]*?(<\/ul>)/, (_, a, b) => `${a}
    <li><a href="/${lang}/">${nav.home}</a></li>
    <li><a href="/${lang}/reading">${nav.reading}</a></li>
    <li><a href="/${lang}/?p=companion">${nav.companionMobile}</a></li>
    <li><a href="/${lang}/?p=tools">${nav.toolsMobile}</a></li>
    <li><a href="/${lang}/?p=journal">${nav.log}</a></li>
    <li><a href="/${lang}/?p=about">${nav.about}</a></li>
    <li><a href="/${lang}/?p=privacy">${nav.privacy}</a></li>
    <li><a href="/${lang}/?p=terms">${nav.terms}</a></li>
  ${b}`);

  // window.__arI18n script sits right before the burger button already
  // (matches build-i18n.mjs's injection slot) — already lang-generic (step 5).

  // Script tag: window.__arI18n={basePath:'articles/rhythm-tracker',...}
  // is set at the top of <nav> (already substituted in step 5).

  h = replaceOnce(h, /(<nav class="bnav" id="bnav"[^>]*>)([\s\S]*?)(<\/nav>)/, (_, open, inner, close) => {
    let bn = inner;
    bn = bn.replace('href="/" class="bnav-item" aria-label="Home"', `href="/${lang}/" class="bnav-item" aria-label="${nav.home}"`);
    bn = bn.replace('href="/reading" class="bnav-item" aria-label="Reading"', `href="/${lang}/reading" class="bnav-item" aria-label="${nav.reading}"`);
    bn = bn.replace('href="/tools" class="bnav-item active" aria-current="page" aria-label="Tools"',
      `href="/${lang}/?p=tools" class="bnav-item active" aria-current="page" aria-label="${nav.toolsMobile}"`);
    bn = bn.replace('href="/journal" class="bnav-item" aria-label="Keeper\'s Log"', `href="/${lang}/?p=journal" class="bnav-item" aria-label="${nav.bnavLog}"`);
    const bnavSpanLabels = [nav.home, nav.reading, nav.tools, nav.log];
    let bnavIdx = 0;
    bn = bn.replace(/(<span>)[^<]*(<\/span>)/g, (m2, a, c) => bnavIdx < bnavSpanLabels.length ? `${a}${bnavSpanLabels[bnavIdx++]}${c}` : m2);
    return `${open}${bn}${close}`;
  });

  // 9. Rhyssa chat sheet
  const rh = RH_SHEET[lang];
  h = h.replace(/aria-label="Chat with Rhyssa"/g, `aria-label="${rh.dialogAria}"`);
  h = replaceOnce(h, /(<button class="rh-sheet-back" id="rh-sheet-cls" aria-label=")[^"]*(")/, (_, a, b) => `${a}${rh.closeAria}${b}`);
  h = replaceOnce(h, /(<span class="rh-sheet-sub">)[^<]*(<\/span>)/, (_, a, b) => `${a}${rh.sub}${b}`);
  h = replaceOnce(h, /(<button class="rh-sheet-back" id="rh-sheet-clear" aria-label=")[^"]*(" title=")[^"]*(")/, (_, a, b, c) => `${a}${rh.resetAria}${b}${rh.resetAria}${c}`);
  h = replaceOnce(h, /(<div class="rh-sheet-thread" id="rh-sheet-thread" role="log" aria-live="polite" aria-label=")[^"]*(")/, (_, a, b) => `${a}${rh.threadAria}${b}`);
  h = replaceOnce(h, /(<p class="rh-sheet-welcome-txt">)[^<]*(<\/p>)/, (_, a, b) => `${a}${rh.welcome}${b}`);
  h = replaceOnce(h, /(>)Same Rhyssa — also on\s*(<a href="https:\/\/chatgpt\.com[^"]*"[^>]*>)ChatGPT ↗(<\/a>) if you prefer\./,
    (_, a, link, close) => `${a}${rh.alsoPre}${link}ChatGPT ↗${close}${rh.alsoPost}`);
  h = replaceOnce(h, /(<textarea id="rh-sheet-inp" class="rh-sheet-inp" placeholder=")[^"]*("[^>]*aria-label=")[^"]*(")/, (_, a, b, c) => `${a}${rh.inputPlaceholder}${b}${rh.inputAria}${c}`);
  h = replaceOnce(h, /(<button type="submit" class="rh-sheet-send" id="rh-sheet-send" aria-label=")[^"]*(")/, (_, a, b) => `${a}${rh.sendAria}${b}`);
  h = replaceOnce(h, /(<p class="rh-sheet-note">)[^<]*(<\/p>)/, (_, a, b) => `${a}${rh.note}${b}`);

  // 10. Intro block
  const intro = t.intro;
  h = replaceOnce(h, /(<span class="ryr-eyebrow">)[^<]*(<\/span>)/, (_, a, b) => `${a}${intro.eyebrow}${b}`);
  h = replaceOnce(h, /(<h1 class="ryr-title">)[\s\S]*?(<\/h1>)/, (_, a, b) => `${a}${intro.titleHtml}${b}`);
  h = replaceOnce(h, /(<p class="ryr-subtitle">)[^<]*(<\/p>)/, (_, a, b) => `${a}${intro.subtitle}${b}`);
  h = replaceOnce(h, /(<p class="ryr-body">)This tool reads[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${intro.body1}${b}`);
  h = replaceOnce(h, /(<span class="ryr-dim-desc" id="ryr-dim-desc-water">)[^<]*(<\/span>)/, (_, a, b) => `${a}${intro.dimWater}${b}`);
  h = replaceOnce(h, /(<span class="ryr-dim-desc" id="ryr-dim-desc-biological">)[^<]*(<\/span>)/, (_, a, b) => `${a}${intro.dimBiological}${b}`);
  h = replaceOnce(h, /(<span class="ryr-dim-desc" id="ryr-dim-desc-environmental">)[^<]*(<\/span>)/, (_, a, b) => `${a}${intro.dimEnvironmental}${b}`);
  h = replaceOnce(h, /(<span class="ryr-dim-desc" id="ryr-dim-desc-livestock">)[^<]*(<\/span>)/, (_, a, b) => `${a}${intro.dimLivestock}${b}`);
  h = replaceOnce(h, /(<span class="ryr-dim-desc" id="ryr-dim-desc-keeper">)[^<]*(<\/span>)/, (_, a, b) => `${a}${intro.dimKeeper}${b}`);
  h = replaceOnce(h, /(<p class="ryr-body" id="ryr-body-2">)Each rhythm can sit[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${intro.body2}${b}`);
  h = replaceOnce(h, /(<p class="ryr-note">)[^<]*(<\/p>)/, (_, a, b) => `${a}${intro.note}${b}`);
  h = replaceOnce(h, /(<span class="ryr-picker-label">)[^<]*(<\/span>)/, (_, a, b) => `${a}${intro.pickerLabel}${b}`);
  h = h.replace(/(<span class="ryr-rcard-tag">)5 questions →(<\/span>)/g, (_, a, b) => `${a}${intro.cardTagQuestions}${b}`);

  // 11. Question screen + result screen chrome
  h = replaceOnce(h, /(<button class="ryr-btn-back" id="ryr-btn-back">)[^<]*(<\/button>)/, (_, a, b) => `${a}${t.chrome.backBtn}${b}`);
  h = replaceOnce(h, /(<button class="ryr-btn-next" id="ryr-btn-next">)[^<]*(<\/button>)/, (_, a, b) => `${a}${t.chrome.nextBtn}${b}`);
  // Runtime JS also rewrites this button's text every time a question
  // renders (showQ()'s ternary) — same class of bug as the eyebrow above:
  // the static swap only covers the pre-JS markup.
  h = h.replace("nb.textContent=i<Q.length-1?'Next →':'See reflection →';",
    `nb.textContent=i<Q.length-1?${JSON.stringify(t.chrome.nextBtn)}:${JSON.stringify(t.chrome.seeReflectionBtn)};`);
  h = replaceOnce(h, /(<span class="ryr-result-eyebrow" id="ryr-result-eyebrow">)Water Rhythm — your reflection(<\/span>)/,
    (_, a, b) => `${a}Water Rhythm${t.chrome.resultEyebrowSuffix}${b}`);
  h = replaceOnce(h, /(<span class="ryr-chart-eyebrow" id="ryr-chart-eyebrow">)[^<]*(<\/span>)/, (_, a, b) => `${a}${t.chrome.chartEyebrow}${b}`);
  h = replaceOnce(h, /(<p class="ryr-chart-hint" id="ryr-chart-hint">)[^<]*(<\/p>)/, (_, a, b) => `${a}${t.chrome.chartHint}${b}`);
  // Runtime JS also rebuilds this eyebrow on every showResult() call
  // (RHYTHMS[curRhythm].name+' — your reflection') — the static HTML swap
  // above only fixes the pre-JS initial markup, so the suffix must be
  // patched in the script too or it reverts to English the moment a rhythm
  // is completed. Found via Playwright smoke test (2026-09-04).
  h = h.replace("+' — your reflection';", `+${JSON.stringify(t.chrome.resultEyebrowSuffix)};`);
  h = replaceOnce(h, /(<span class="ryr-q-close-label">)A question to sit with(<\/span>)/, (_, a, b) => `${a}${t.chrome.questionCloseLabel}${b}`);
  h = replaceOnce(h, /(<span class="ryr-q-close-label">)Where this rhythm reads(<\/span>)/, (_, a, b) => `${a}${t.chrome.phaseNoteLabel}${b}`);
  h = replaceOnce(h, /(<p class="ryr-note-end">)[^<]*(<\/p>)/, (_, a, b) => `${a}${t.chrome.noteEnd}${b}`);
  h = replaceOnce(h, /(<button class="ryr-btn-restart" id="ryr-btn-restart">)[^<]*(<\/button>)/, (_, a, b) => `${a}${t.chrome.restartBtn}${b}`);
  h = replaceOnce(h, /(data-cta="water_rhythm_to_five_rhythms">)Read about all five rhythms →(<\/a>)/, (_, a, b) => `${a}${t.chrome.ctaFiveRhythms}${b}`);
  h = replaceOnce(h, /(<a href="\/tools" class="ryr-link-reading">)← Back to Labs &amp; Tools(<\/a>)/, (_, a, b) => `${a}${t.chrome.ctaBackToTools}${b}`);

  // 11b. Share/consent block (opt-in reflection data — Formspree). Button
  // text has 3 states set only via JS at runtime (initial/sending/sent),
  // and the reset-on-restart line in showResult() also writes the initial
  // state — same "static swap isn't enough" class of bug as nextBtn/
  // resultEyebrowSuffix above, so every JS string literal is patched too.
  h = replaceOnce(h, /(<p class="ryr-share-text" id="ryr-share-text">)[^<]*(<\/p>)/, (_, a, b) => `${a}${t.chrome.shareText}${b}`);
  h = replaceOnce(h, /(<span id="ryr-share-consent-label">)[^<]*(<\/span>)/, (_, a, b) => `${a}${t.chrome.shareConsentLabel}${b}`);
  h = replaceOnce(h, /(<button class="ryr-share-btn" id="ryr-share-btn" disabled>)[^<]*(<\/button>)/, (_, a, b) => `${a}${t.chrome.shareBtn}${b}`);
  h = h.replace(/textContent='Share this reflection'/g, () => `textContent=${JSON.stringify(t.chrome.shareBtn)}`);
  h = h.replace("btn.textContent='Sending…';", `btn.textContent=${JSON.stringify(t.chrome.shareBtnSending)};`);
  h = h.replace("btn.textContent='Shared';", `btn.textContent=${JSON.stringify(t.chrome.shareBtnSent)};`);
  h = h.replace("statusEl.textContent='Thank you — this helps shape what gets asked next.';",
    `statusEl.textContent=${JSON.stringify(t.chrome.shareSuccessMsg)};`);
  h = h.replace(/statusEl\.textContent='Couldn\\'t send that — check your connection and try again\.';/g,
    () => `statusEl.textContent=${JSON.stringify(t.chrome.shareErrorMsg)};`);

  // 12. RHYTHMS content (questions + reflect strings) — subOnce/subAll on the
  // exact EN strings extracted from the live source via vm execution.
  const pairs = buildSubstitutionPairs(enExtracted.rhythms, t.rhythms);
  h = applySubstitutions(h, pairs);

  // 13. "Question N of Total" concatenation — grammar differs by language,
  // not just vocabulary (see CLAUDE.md "AWAS — susunan tatabahasa").
  if (lang === 'id') {
    h = h.replace(
      "document.getElementById('ryr-q-num').textContent='Question '+(i+1)+' of '+Q.length;",
      `document.getElementById('ryr-q-num').textContent='${t.chrome.questionOfWord1} '+(i+1)+' ${t.chrome.questionOfWord2} '+Q.length;`
    );
  } else if (lang === 'ja') {
    h = h.replace(
      "document.getElementById('ryr-q-num').textContent='Question '+(i+1)+' of '+Q.length;",
      `document.getElementById('ryr-q-num').textContent='${t.chrome.questionOfPrefix} '+(i+1)+'/'+Q.length;`
    );
  }

  // 14. Localize outbound /articles/<slug> links to ready translations
  h = localizeArticleLinks(h, lang);

  const outDir = path.join(ROOT, lang, 'articles');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${SLUG}.html`);
  fs.writeFileSync(outPath, h);
  console.log(`  wrote ${path.relative(ROOT, outPath)} (${pairs.length} content substitutions)`);
}
