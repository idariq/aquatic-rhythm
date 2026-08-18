/**
 * Builds localized HTML for the Community Stress Lab interactive tool page —
 * a self-contained single-file app page (briefing modal, topbar, csl sections,
 * bnav, Rhyssa sheet) that doesn't fit build-i18n.mjs's article template or
 * build-ara-i18n.mjs's ara-art / ara-hub template, so it gets its own small
 * script. Source: translations/<lang>/community-stress-lab.json ("html"
 * section only — JS-runtime strings live directly in
 * js/community-stress-lab.js's CSL_STRINGS table, not here).
 *
 * Usage:
 *   node scripts/build-csl-i18n.mjs --lang id
 *   node scripts/build-csl-i18n.mjs --all
 *
 * Output: /<lang>/articles/community-stress-lab.html
 */
import fs from 'fs';
import path from 'path';

const ROOT      = path.join(import.meta.dirname, '..');
const ART_DIR   = path.join(ROOT, 'articles');
const TRANS_DIR = path.join(ROOT, 'translations');
const BASE_URL  = 'https://aquaticrhythm.com';
const LANGUAGES = ['id', 'ja'];
const SLUG      = 'community-stress-lab';

const args    = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
const langArg = langIdx !== -1 ? args[langIdx + 1] : undefined;
const doAll   = args.includes('--all');

// bnav (bottom PWA nav) — Home/Reading/Tools/Log — shared across every page
// (kept in sync manually with build-ara-i18n.mjs's BNAV_LABELS by design).
const BNAV_LABELS = {
  id: { home: 'Beranda', reading: 'Panduan', tools: 'Lab &amp; Alat', toolsAria: 'Lab &amp; Alat', tools_label: 'Alat', log: 'Catatan', logAria: 'Catatan Penjaga' },
  ja: { home: 'ホーム', reading: 'ガイド', tools: 'ラボ&amp;ツール', toolsAria: 'ラボ&amp;ツール', tools_label: 'ツール', log: '記録', logAria: 'キーパーの記録' }
};

function loadCompanionChrome(lang) {
  const p = path.join(TRANS_DIR, 'homepage', `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  return j.companion;
}

function replaceOnce(html, pattern, fn) {
  let done = false;
  return html.replace(pattern, (...m) => {
    if (done) return m[0];
    done = true;
    return fn(...m);
  });
}

function buildHreflangTags(lang) {
  const lines = [];
  lines.push(`<link rel="alternate" hreflang="en" href="${BASE_URL}/articles/${SLUG}">`);
  for (const l of LANGUAGES) {
    const tPath = path.join(TRANS_DIR, l, `${SLUG}.json`);
    if (!fs.existsSync(tPath)) continue;
    lines.push(`<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/articles/${SLUG}">`);
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/articles/${SLUG}">`);
  return lines.join('\n');
}

function patchHead(h, t, lang) {
  h = h.replace(/(<html[^>]*\slang=")[^"]*(")/, (_, a, b) => `${a}${lang}${b}`);
  h = replaceOnce(h, /<title>[^<]*<\/title>/, () => `<title>${t.meta_title}</title>`);
  h = replaceOnce(h, /(<meta name="description" content=")[^"]*(")/, (_, a, b) => `${a}${t.meta_description}${b}`);
  h = replaceOnce(h, /(<meta property="og:title" content=")[^"]*(")/, (_, a, b) => `${a}${t.meta_title}${b}`);
  h = replaceOnce(h, /(<meta property="og:description" content=")[^"]*(")/, (_, a, b) => `${a}${t.og_description}${b}`);

  const localUrl = `${BASE_URL}/${lang}/articles/${SLUG}`;
  h = replaceOnce(h, /(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);
  h = replaceOnce(h, /(<meta property="og:url" content=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);

  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags(lang);
  h = replaceOnce(h, /(<link rel="canonical"[^>]*>)/, (_, canon) => `${canon}\n${hreflang}`);

  if (lang === 'ja') {
    const notoLink = `\n<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" onload="this.onload=null;this.rel='stylesheet'">\n<noscript><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" rel="stylesheet"></noscript>`;
    h = h.replace(/(<\/style>)/, `$1${notoLink}`);
    h = h.replace(/(--sans:'Work Sans',system-ui,sans-serif)/, "--sans:'Work Sans','Noto Sans JP',system-ui,sans-serif");
  }
  return h;
}

function patchBriefing(h, t) {
  h = replaceOnce(h, /(<span class="brief-eyebrow">)[^<]*(<\/span>)/, (_, a, b) => `${a}${t.brief_eyebrow}${b}`);
  h = replaceOnce(h, /(<h1 class="brief-title">)[\s\S]*?(<\/h1>)/, (_, a, b) => `${a}${t.brief_title}${b}`);
  h = replaceOnce(h, /(<p class="brief-body">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${t.brief_body}${b}`);

  const rhythmKeys = ['thermal', 'chemistry', 'space', 'predation', 'social', 'inverts'];
  let ri = 0;
  h = h.replace(/(<span class="brief-rhy-name"[^>]*>)[^<]*(<\/span><span class="brief-rhy-desc">)[^<]*(<\/span>)/g,
    (_, a, mid, z) => {
      const k = rhythmKeys[ri++];
      return `${a}${t['brief_rhy_' + k + '_name']}${mid}${t['brief_rhy_' + k + '_desc']}${z}`;
    });

  h = replaceOnce(h, /(<p class="brief-note">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${t.brief_note}${b}`);
  h = replaceOnce(h, /(<button class="brief-btn" id="btn-enter">)[^<]*(<\/button>)/, (_, a, b) => `${a}${t.brief_btn}${b}`);
  return h;
}

function patchTopbar(h) {
  // logo aria-label / settings button title/aria-label reuse NAV_LABELS-style
  // strings already established in build-ara-i18n.mjs — kept minimal here
  // since this page has no full top nav, just a logo + settings button.
  return h;
}

function patchBody(h, t) {
  h = replaceOnce(h, /(<span class="ib-lbl">)[^<]*(<\/span>)/, (_, a, b) => `${a}${t.insight_label}${b}`);
  h = replaceOnce(h, /(<p class="ib-txt">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${t.insight_text}${b}`);

  h = replaceOnce(h, /(<div class="setup-note" role="note">\s*<p>)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${t.setup_note}${b}`);

  h = replaceOnce(h, /(<summary>)How this lab works(<\/summary>)/, (_, a, b) => `${a}${t.disclosure_summary}${b}`);
  h = replaceOnce(h, /(<div class="ar-disclosure-body">\s*<p>)[\s\S]*?(<\/p>\s*<p>)[\s\S]*?(<\/p>\s*<p>)[\s\S]*?(<\/p>)/,
    (_, a, mid1, mid2, z) => `${a}${t.disclosure_p1}${mid1}${t.disclosure_p2}${mid2}${t.disclosure_p3}${z}`);

  h = replaceOnce(h, /(<span class="csl-sh">)Tank context(<\/span>)/, (_, a, b) => `${a}${t.tank_context_label}${b}`);
  h = replaceOnce(h, /(<label for="csl-volume">)[^<]*(<\/label>)/, (_, a, b) => `${a}${t.volume_label}${b}`);

  h = replaceOnce(h, /(<span class="csl-sh">)Species(<\/span>)/, (_, a, b) => `${a}${t.species_label}${b}`);
  h = replaceOnce(h, /(<p class="csl-hint">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${t.species_hint}${b}`);
  h = replaceOnce(h, /(<input type="search" id="csl-search"[^>]*placeholder=")[^"]*("[^>]*aria-label=")[^"]*(")/,
    (_, a, mid, z) => `${a}${t.search_placeholder}${mid}${t.search_aria}${z}`);
  h = replaceOnce(h, /(<button type="button" id="csl-add">)[^<]*(<\/button>)/, (_, a, b) => `${a}${t.add_btn}${b}`);

  h = replaceOnce(h, /(<span class="csl-sh">)Pressure map(<\/span>)/, (_, a, b) => `${a}${t.pressure_map_label}${b}`);
  h = replaceOnce(h, /(<span class="csl-sh">)Findings(<\/span>)/, (_, a, b) => `${a}${t.findings_label}${b}`);
  h = replaceOnce(h, /(<span class="csl-sh">)Observation checklist(<\/span>)/, (_, a, b) => `${a}${t.checklist_label}${b}`);

  h = replaceOnce(h, /(<p class="csl-foot">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${t.foot_note}${b}`);
  return h;
}

function patchBnav(h, lang) {
  const b = BNAV_LABELS[lang];
  h = replaceOnce(h, /(<a href="\/" class="bnav-item" aria-label=")[^"]*(">[\s\S]*?<span class="bnav-label">)[^<]*(<\/span>)/,
    (_, a, mid, z) => `${a}${b.home}${mid}${b.home}${z}`);
  h = replaceOnce(h, /(<a href="\/reading" class="bnav-item" aria-label=")[^"]*(">[\s\S]*?<span class="bnav-label">)[^<]*(<\/span>)/,
    (_, a, mid, z) => `${a}${b.reading}${mid}${b.reading}${z}`);
  h = replaceOnce(h, /(<a href="\/tools" class="bnav-item active" aria-current="page" aria-label=")[^"]*(">[\s\S]*?<span class="bnav-label">)[^<]*(<\/span>)/,
    (_, a, mid, z) => `${a}${b.toolsAria}${mid}${b.tools_label}${z}`);
  h = replaceOnce(h, /(<a href="\/journal" class="bnav-item" aria-label=")[^"]*(">[\s\S]*?<span class="bnav-label">)[^<]*(<\/span>)/,
    (_, a, mid, z) => `${a}${b.logAria}${mid}${b.log}${z}`);
  return h;
}

function patchRhyssaSheet(h, lang) {
  const c = loadCompanionChrome(lang);
  h = replaceOnce(h, /(id="rh-sheet-cls" aria-label=")[^"]*(")/, (_, a, b) => `${a}${c.back_aria}${b}`);
  h = replaceOnce(h, /(<span class="rh-sheet-sub">)[^<]*(<\/span>)/, (_, a, b) => `${a}${c.sub}${b}`);
  h = replaceOnce(h, /(id="rh-sheet-clear" aria-label=")[^"]*(" title=")[^"]*(")/, (_, a, mid, z) => `${a}${c.new_aria}${mid}${c.new_aria}${z}`);
  h = replaceOnce(h, /(<p class="rh-sheet-welcome-txt">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${c.welcome}${b}`);
  h = replaceOnce(h, /(<textarea id="rh-sheet-inp"[^>]*placeholder=")[^"]*("[^>]*aria-label=")[^"]*(")/,
    (_, a, mid, z) => `${a}${c.placeholder}${mid}Rhyssa${z}`);
  h = replaceOnce(h, /(id="rh-sheet-send" aria-label=")[^"]*(")/, (_, a, b) => `${a}${c.send_aria}${b}`);
  h = replaceOnce(h, /(<p class="rh-sheet-note">)[^<]*(<\/p>)/, (_, a, b) => `${a}${c.note}${b}`);
  return h;
}

function buildLang(lang) {
  const tPath = path.join(TRANS_DIR, lang, `${SLUG}.json`);
  const t = JSON.parse(fs.readFileSync(tPath, 'utf8')).html;
  const srcPath = path.join(ART_DIR, `${SLUG}.html`);
  let h = fs.readFileSync(srcPath, 'utf8');

  h = patchHead(h, t, lang);
  h = patchBriefing(h, t);
  h = patchTopbar(h);
  h = patchBody(h, t);
  h = patchBnav(h, lang);
  h = patchRhyssaSheet(h, lang);
  h = localizeArticleLinks(h, lang);

  const outDir = path.join(ROOT, lang, 'articles');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${SLUG}.html`), h);
  console.log(`Built ${lang}/articles/${SLUG}.html`);
}

let readySlugsCache = {};
function getReadySlugsForLang(lang) {
  if (readySlugsCache[lang]) return readySlugsCache[lang];
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
  readySlugsCache[lang] = ready;
  return ready;
}

function localizeArticleLinks(h, lang) {
  const ready = getReadySlugsForLang(lang);
  return h.replace(/href="\/articles\/([a-z0-9-]+)"/g, (m, slug) =>
    ready.has(slug) ? `href="/${lang}/articles/${slug}"` : m);
}

function patchEnglishHreflang() {
  const srcPath = path.join(ART_DIR, `${SLUG}.html`);
  let h = fs.readFileSync(srcPath, 'utf8');
  const before = h;
  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags('en');
  h = replaceOnce(h, /(<link rel="canonical"[^>]*>)/, (_, canon) => `${canon}\n${hreflang}`);
  if (h !== before) {
    fs.writeFileSync(srcPath, h, 'utf8');
    console.log(`  patched: articles/${SLUG}.html`);
  }
}

const patchEn = args.includes('--patch-english');

if (patchEn) {
  console.log('Patching English source file with hreflang…');
  patchEnglishHreflang();
  console.log('Done.');
} else if (doAll) {
  for (const lang of LANGUAGES) buildLang(lang);
} else if (langArg) {
  buildLang(langArg);
} else {
  console.error('Usage: node scripts/build-csl-i18n.mjs --lang <id|ja> | --all | --patch-english');
  process.exit(1);
}
