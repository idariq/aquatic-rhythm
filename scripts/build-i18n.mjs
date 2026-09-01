/**
 * Generates localized HTML files from English source articles + translation JSON.
 *
 * Usage:
 *   node scripts/build-i18n.mjs --lang id [--slug adding-new-fish]
 *   node scripts/build-i18n.mjs --lang id          (builds all translated articles)
 *   node scripts/build-i18n.mjs --all              (builds all languages)
 *   node scripts/build-i18n.mjs --patch-english    (adds hreflang to English source files)
 *
 * Output:
 *   /<lang>/articles/<slug>.html   — localized article
 *   /articles/<slug>.html          — patched with hreflang (when --patch-english)
 */

import fs from 'fs';
import path from 'path';

const ROOT       = path.join(import.meta.dirname, '..');
const ART_DIR    = path.join(ROOT, 'articles');
const TRANS_DIR  = path.join(ROOT, 'translations');
const BASE_URL   = 'https://aquaticrhythm.com';
const LANGUAGES  = ['id', 'ja'];

const args      = process.argv.slice(2);
const langIdx   = args.indexOf('--lang');
const slugIdx   = args.indexOf('--slug');
const langArg   = langIdx !== -1 ? args[langIdx + 1] : undefined;
const slugArg   = slugIdx !== -1 ? args[slugIdx + 1] : undefined;
const doAll     = args.includes('--all');
const patchEn   = args.includes('--patch-english');

// ── Site nav chrome (shared across every article in a language — not sourced
// from translations/*.json since it's fixed sitewide UI, not per-article
// content). Applied uniformly by buildArticle() below. ─────────────────────

const NAV_LABELS = {
  id: {
    logoAria: 'Aquatic Rhythm — perawatan ekologis untuk akuarium kecil',
    home: 'Beranda',
    reading: 'Panduan',
    companion: 'Pendamping',
    companionMobile: 'Pendamping AI',
    tools: 'Alat',
    toolsMobile: 'Lab &amp; Alat',
    log: 'Catatan',
    about: 'Tentang',
    privacy: 'Kebijakan Privasi',
    terms: 'Syarat Penggunaan',
    menu: 'Menu',
    bnavLog: 'Log Penjaga'
  },
  ja: {
    logoAria: 'Aquatic Rhythm — 小型水槽のための生態学的なケア',
    home: 'ホーム',
    reading: 'ガイド',
    companion: 'コンパニオン',
    companionMobile: 'AIコンパニオン',
    tools: 'ツール',
    toolsMobile: 'ラボ&amp;ツール',
    log: '記録',
    about: 'サイトについて',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    menu: 'メニュー',
    bnavLog: 'キーパーの記録'
  }
};

// mod-progress-label JS ("Module N / Total") — shared boilerplate script
// duplicated verbatim across every article that has a multi-module reading
// progress bar (23 files as of 2026-08-24). Not part of the modules[]
// translation schema (it's inline engine JS, not module HTML content), so
// it was left fully English on id/ja same as BACK_LINK/RH_SHEET below —
// harmless no-op via h.replace() for any article without this exact line.
const MOD_PROGRESS_WORD = { id: 'Modul', ja: 'モジュール' };

// One-off "Back to Reading →" back-link (.art-back-link) — only
// new-tank-syndrome.html uses this exact standalone link outside the
// normal .art-footer/mod-next patchers, so it stayed fully English on
// id/ja (bug found 2026-08-18, same audit as the /reading href sweep
// above). Harmless no-op for every other article since the text won't match.
const BACK_LINK = {
  id: 'Kembali ke Semua artikel →',
  ja: '記事一覧に戻る →'
};

// Rhyssa chat sliding sheet (.rh-sheet) — shared sitewide UI injected on
// every article, same convention as NAV_LABELS. Was left fully English on
// id/ja (bug found 2026-08-18, user video) even though the separate full
// Companion page's chat shell (pg-companion, build-homepage-i18n.py) was
// already translated — welcome/note text below reuses that exact phrasing
// for consistency.
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

// Language switching now lives in one place — the shared Settings panel
// (js/ar-page.js) — instead of a per-article dropdown. This just tells that
// panel which locales have a ready translation for this slug; any locale
// not listed here falls back to the English article in the UI.
function buildI18nDataScript(slug) {
  const avail = LANGUAGES.filter(lang => {
    const tPath = path.join(TRANS_DIR, lang, `${slug}.json`);
    if (!fs.existsSync(tPath)) return false;
    try {
      const t = JSON.parse(fs.readFileSync(tPath, 'utf8'));
      return !!(t._meta && t._meta.status === 'ready');
    } catch { return false; }
  });
  return `<script>window.__arI18n={basePath:'articles/${slug}',avail:${JSON.stringify(avail)}};</script>`;
}

// ── SEO helpers ───────────────────────────────────────────────────────────────

/** Return hreflang <link> tags for all available language versions of a slug. */
function buildHreflangTags(slug, currentLang) {
  const lines = [];

  // Always include English canonical
  lines.push(`<link rel="alternate" hreflang="en" href="${BASE_URL}/articles/${slug}">`);

  // Include each language that has a translation file
  for (const lang of LANGUAGES) {
    const tPath = path.join(TRANS_DIR, lang, `${slug}.json`);
    if (fs.existsSync(tPath)) {
      lines.push(`<link rel="alternate" hreflang="${lang}" href="${BASE_URL}/${lang}/articles/${slug}">`);
    }
  }

  // x-default always points to English
  lines.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/articles/${slug}">`);

  return lines.join('\n');
}

// Articles whose JSON-LD 'image' should point to their real in-content hero
// photo (.art-hero-figure) instead of the generated OG card — e.g.
// new-tank-syndrome, so Google's Article rich-result image is the actual
// tank photo rather than the text-only social-share card.
const HERO_IMAGE_SLUGS = {
  'new-tank-syndrome': 'hero-1200w.webp',
  'cycled-tank-problems': 'hero-1200w.webp',
  'why-is-my-aquarium-water-cloudy': 'hero-1200w.webp',
  'how-often-water-changes': 'hero-1200w.webp',
  'fish-hiding-what-does-it-mean': 'hero-1200w.webp',
  'fish-keep-dying-new-tank': 'hero-1200w.webp',
  'algae-in-aquarium': 'hero-1200w.webp',
  'perfect-parameters-fish-dying': 'hero-1200w.webp',
  'betta-fish-behaviour': 'hero-1200w.webp',
  'aquarium-plants-not-growing': 'hero-1200w.webp',
  'shrimp-dying-aquarium': 'hero-1200w.webp',
  'low-tech-planted-tank': 'hero-1200w.webp',
  'community-fish-tank': 'hero-1200w.webp',
  'when-is-tank-ready-for-fish': 'hero-1200w.webp',
  'ich-keeps-coming-back': 'hero-1200w.webp',
  'overfeeding-aquarium': 'hero-1200w.webp',
  'aquarium-filter-maintenance': 'hero-1200w.webp',
  'fish-gasping-surface': 'hero-1200w.webp',
  'adding-new-fish': 'hero-1200w.webp',
  'nitrate-keeps-rising': 'hero-1200w.webp',
  'fish-flashing-scratching': 'hero-1200w.webp',
  'ph-keeps-crashing': 'hero-1200w.webp',
  'clamped-fins-fin-rot': 'hero-1200w.webp',
  'white-fuzz-driftwood': 'hero-1200w.webp',
  'sudden-colour-loss-fish': 'hero-1200w.webp',
  'snails-suddenly-everywhere': 'hero-1200w.webp',
  'understanding-gh-and-kh': 'hero-1200w.webp',
  'smell-from-your-substrate': 'hero-1200w.webp',
  'cloudy-eyes-fish': 'hero-1200w.webp',
  'ich-vs-velvet': 'hero-1200w.webp',
  'dropsy-when-treatment-isnt-working': 'hero-1200w.webp',
  'the-fish-that-sell-the-tank': 'hero-1200w.webp',
  'the-honest-cost-of-going-high-tech': 'hero-1200w.webp',
  'aquarium-maintenance-routine': 'hero-1200w.webp',
  'capacity-creep': 'hero-1200w.webp',
  'life-change-protocols': 'hero-1200w.webp',
  'aquarium-travel-vacation': 'hero-1200w.webp',
  'tank-crash-recovery': 'hero-1200w.webp',
  'missed-water-change': 'hero-1200w.webp',
  'is-your-setup-too-demanding': 'hero-1200w.webp',
  'missed-fertiliser-dosing': 'hero-1200w.webp',
  'minimum-viable-care': 'hero-1200w.webp',
  'topping-off-vs-water-change': 'hero-1200w.webp',
  'light-schedule-drift': 'hero-1200w.webp'
};

function buildJsonLd(t, lang, slug, dates) {
  const headline = t.intro.titleHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const heroFile = HERO_IMAGE_SLUGS[slug];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': headline,
    'description': t.head.description,
    'url': `${BASE_URL}/${lang}/articles/${slug}`,
    'inLanguage': lang,
    'image': heroFile
      ? `${BASE_URL}/img/articles/${slug}/${heroFile}`
      : `${BASE_URL}/og/articles/${slug}-${lang}.png`,
    'author': { '@type': 'Organization', 'name': 'Aquatic Rhythm' },
    'publisher': { '@type': 'Organization', 'name': 'Aquatic Rhythm', 'url': BASE_URL }
  };
  if (dates.pub) schema['datePublished'] = dates.pub;
  if (dates.mod) schema['dateModified'] = dates.mod;
  return JSON.stringify(schema);
}

// ── Safe string replacement ───────────────────────────────────────────────────
// Using a function as replacement prevents '$' in replacement strings from being
// interpreted as special backreferences.

function replaceOnce(html, pattern, fn) {
  return html.replace(pattern, fn);
}

// ── Build one article ─────────────────────────────────────────────────────────

function buildArticle(slug, lang, t) {
  const srcPath = path.join(ART_DIR, `${slug}.html`);
  if (!fs.existsSync(srcPath)) {
    console.error(`  source not found: ${srcPath}`);
    return;
  }

  let h = fs.readFileSync(srcPath, 'utf8');

  // ── 1. HTML lang attribute ────────────────────────────────────────────────
  h = h.replace(/(<html[^>]*\slang=")[^"]*(")/,
    (_, a, b) => `${a}${lang}${b}`);

  // ── 2. Head meta ──────────────────────────────────────────────────────────
  h = replaceOnce(h, /<title>[^<]*<\/title>/,
    () => `<title>${t.head.title}</title>`);

  h = replaceOnce(h, /(<meta name="description" content=")[^"]*(")/,
    (_, a, b) => `${a}${t.head.description}${b}`);

  h = replaceOnce(h, /(<meta property="og:title" content=")[^"]*(")/,
    (_, a, b) => `${a}${t.head.ogTitle}${b}`);

  h = replaceOnce(h, /(<meta property="og:description" content=")[^"]*(")/,
    (_, a, b) => `${a}${t.head.ogDescription}${b}`);

  h = replaceOnce(h, /(<meta property="og:image" content=")[^"]*(")/,
    (_, a, b) => `${a}${BASE_URL}/og/articles/${slug}-${lang}.png${b}`);

  // ── 3. Canonical + OG URL ─────────────────────────────────────────────────
  const localUrl = `${BASE_URL}/${lang}/articles/${slug}`;

  h = replaceOnce(h, /(<link rel="canonical" href=")[^"]*(")/,
    (_, a, b) => `${a}${localUrl}${b}`);

  h = replaceOnce(h, /(<meta property="og:url" content=")[^"]*(")/,
    (_, a, b) => `${a}${localUrl}${b}`);

  // ── 4. hreflang tags (inject after canonical) ─────────────────────────────
  // Strip any existing hreflang tags before injecting fresh ones.
  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags(slug, lang);
  h = replaceOnce(h, /(<link rel="canonical"[^>]*>)/,
    (_, canon) => `${canon}\n${hreflang}`);

  // ── 4b. Language data for the shared Settings panel (inject before burger
  // button in nav — same slot the old per-article lang-sw dropdown used) ────
  // Strip anything injected by a previous patch/build run first (the legacy
  // lang-sw dropdown, and any earlier __arI18n script) so reruns stay clean.
  h = h.replace(/<details class="lang-sw"[\s\S]*?<\/details>\n?/g, '');
  h = h.replace(/<div class="lang-sw"[^>]*>.*?<\/div>\n?/g, '');
  h = h.replace(/<script>if\(!window\._lswH\)[\s\S]*?<\/script>\n?/g, '');
  h = h.replace(/<script>window\.__arI18n=[\s\S]*?<\/script>\n?/g, '');
  h = replaceOnce(h, /(<button class="nbg")/,
    (_, btn) => `${buildI18nDataScript(slug)}\n${btn}`);

  // ── 4c. Site nav chrome (desktop nav, mobile nav, burger + logo aria-labels) ─
  // Shared sitewide UI, not per-article content — translated from NAV_LABELS,
  // not from t (the translations/*.json for this article). Home/Companion/
  // Tools/Journal/About/Privacy/Terms all live as pg-* sections INSIDE the
  // localized homepage SPA shell (<lang>/index.html), not as separate
  // top-level routes — so from an article page (a real navigation, not
  // SPA-internal routing) they must point at "/<lang>/" or "/<lang>/?p=<page>"
  // to land on that shell. Bug found 2026-08-18 (user video): these were
  // pointing at the bare English path (e.g. "/tools"), which 404s and
  // redirects to the English "/?p=tools" — so tapping any nav item other
  // than Reading silently dropped the reader back into English.
  const nav = NAV_LABELS[lang];
  if (nav) {
    h = replaceOnce(h, /(<a href="\/" class="nl" aria-label=")[^"]*(")/,
      (_, a, b) => `${a}${nav.logoAria}${b}`);

    h = replaceOnce(h, /(<ul class="nlinks">)[\s\S]*?(<\/ul>)/,
      (_, a, b) => `${a}
    <li><a href="/${lang}/">${nav.home}</a></li>
    <li><a href="/${lang}/reading">${nav.reading}</a></li>
    <li><a href="/${lang}/?p=companion">${nav.companion}</a></li>
    <li><a href="/${lang}/?p=tools">${nav.tools}</a></li>
    <li><a href="/${lang}/?p=journal">${nav.log}</a></li>
    <li><a href="/${lang}/?p=about">${nav.about}</a></li>
  ${b}`);

    h = replaceOnce(h, /(<button class="nbg" id="burger" aria-label=")[^"]*(")/,
      (_, a, b) => `${a}${nav.menu}${b}`);

    h = replaceOnce(h, /(<div class="nmob" id="nmob"[^>]*>\s*<ul>)[\s\S]*?(<\/ul>)/,
      (_, a, b) => `${a}
    <li><a href="/${lang}/">${nav.home}</a></li>
    <li><a href="/${lang}/reading">${nav.reading}</a></li>
    <li><a href="/${lang}/?p=companion">${nav.companionMobile}</a></li>
    <li><a href="/${lang}/?p=tools">${nav.toolsMobile}</a></li>
    <li><a href="/${lang}/?p=journal">${nav.log}</a></li>
    <li><a href="/${lang}/?p=about">${nav.about}</a></li>
    <li><a href="/${lang}/?p=privacy">${nav.privacy}</a></li>
    <li><a href="/${lang}/?p=terms">${nav.terms}</a></li>
  ${b}`);

    // Bottom nav (.bnav) — was left fully English (labels, aria-labels, and
    // the Reading href) even on translated articles, so the primary mobile
    // nav visibly flipped language the moment a reader opened an article.
    // Scoped to the <nav class="bnav">...</nav> block itself so the bare
    // <span>text</span> substitution below can't touch unrelated markup.
    h = replaceOnce(h, /(<nav class="bnav" id="bnav"[^>]*>)([\s\S]*?)(<\/nav>)/,
      (_, open, inner, close) => {
        let bn = inner;
        bn = bn.replace('href="/reading" class="bnav-item active" aria-current="page" aria-label="Reading"',
          `href="/${lang}/reading" class="bnav-item active" aria-current="page" aria-label="${nav.reading}"`);
        bn = bn.replace('href="/" class="bnav-item" aria-label="Home"',
          `href="/${lang}/" class="bnav-item" aria-label="${nav.home}"`);
        bn = bn.replace('href="/tools" class="bnav-item" aria-label="Tools"',
          `href="/${lang}/?p=tools" class="bnav-item" aria-label="${nav.toolsMobile}"`);
        bn = bn.replace('href="/journal" class="bnav-item" aria-label="Keeper\'s Log"',
          `href="/${lang}/?p=journal" class="bnav-item" aria-label="${nav.bnavLog}"`);
        const bnavSpanLabels = [nav.home, nav.reading, nav.tools, nav.log];
        let bnavIdx = 0;
        bn = bn.replace(/(<span>)[^<]*(<\/span>)/g, (m2, a, c) =>
          bnavIdx < bnavSpanLabels.length ? `${a}${bnavSpanLabels[bnavIdx++]}${c}` : m2);
        return `${open}${bn}${close}`;
      });
  }

  // ── 4d. Rhyssa chat sliding sheet (.rh-sheet) ────────────────────────────
  const rh = RH_SHEET[lang];
  if (rh) {
    h = h.replace(/aria-label="Chat with Rhyssa"/g, `aria-label="${rh.dialogAria}"`);
    h = replaceOnce(h, /(<button class="rh-sheet-back" id="rh-sheet-cls" aria-label=")[^"]*(")/,
      (_, a, b) => `${a}${rh.closeAria}${b}`);
    h = replaceOnce(h, /(<span class="rh-sheet-sub">)[^<]*(<\/span>)/,
      (_, a, b) => `${a}${rh.sub}${b}`);
    h = replaceOnce(h, /(<button class="rh-sheet-back" id="rh-sheet-clear" aria-label=")[^"]*(" title=")[^"]*(")/,
      (_, a, b, c) => `${a}${rh.resetAria}${b}${rh.resetAria}${c}`);
    h = replaceOnce(h, /(<div class="rh-sheet-thread" id="rh-sheet-thread" role="log" aria-live="polite" aria-label=")[^"]*(")/,
      (_, a, b) => `${a}${rh.threadAria}${b}`);
    h = replaceOnce(h, /(<p class="rh-sheet-welcome-txt">)[^<]*(<\/p>)/,
      (_, a, b) => `${a}${rh.welcome}${b}`);
    h = replaceOnce(h, /(>)Same Rhyssa — also on\s*(<a href="https:\/\/chatgpt\.com[^"]*"[^>]*>)ChatGPT ↗(<\/a>) if you prefer\./,
      (_, a, link, close) => `${a}${rh.alsoPre}${link}ChatGPT ↗${close}${rh.alsoPost}`);
    h = replaceOnce(h, /(<textarea id="rh-sheet-inp" class="rh-sheet-inp" placeholder=")[^"]*("[^>]*aria-label=")[^"]*(")/,
      (_, a, b, c) => `${a}${rh.inputPlaceholder}${b}${rh.inputAria}${c}`);
    h = replaceOnce(h, /(<button type="submit" class="rh-sheet-send" id="rh-sheet-send" aria-label=")[^"]*(")/,
      (_, a, b) => `${a}${rh.sendAria}${b}`);
    h = replaceOnce(h, /(<p class="rh-sheet-note">)[^<]*(<\/p>)/,
      (_, a, b) => `${a}${rh.note}${b}`);
  }

  // ── 4e. mod-progress-label JS ("Module N / Total") ───────────────────────
  h = h.replace("lbl.textContent = 'Module ' + currentMod + ' / ' + totalMods;",
    `lbl.textContent = '${MOD_PROGRESS_WORD[lang]} ' + currentMod + ' / ' + totalMods;`);

  // ── 5. JSON-LD ────────────────────────────────────────────────────────────
  // Extract dates from English source JSON-LD (already populated by patch-article-seo.mjs)
  const srcLdMatch = h.match(/"datePublished"\s*:\s*"([^"]+)"/);
  const srcModMatch = h.match(/"dateModified"\s*:\s*"([^"]+)"/);
  const dates = {
    pub: srcLdMatch ? srcLdMatch[1] : '',
    mod: srcModMatch ? srcModMatch[1] : ''
  };
  h = replaceOnce(h, /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    () => `<script type="application/ld+json">${buildJsonLd(t, lang, slug, dates)}</script>`);

  // ── 6. Japanese font (Noto Sans JP) ──────────────────────────────────────
  if (lang === 'ja') {
    const notoLink = `\n<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" onload="this.onload=null;this.rel='stylesheet'">\n<noscript><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" rel="stylesheet"></noscript>`;
    h = h.replace(/(<\/style>)/, `$1${notoLink}`);
    // Override sans-serif stack to include Noto Sans JP
    h = h.replace(
      /(--sans:'Work Sans',system-ui,sans-serif)/,
      "--sans:'Work Sans','Noto Sans JP',system-ui,sans-serif"
    );
  }

  // ── 7. Intro section ─────────────────────────────────────────────────────
  const intro = t.intro;

  // Optional hero image alt text (only present on articles with an
  // .art-hero-figure intro image, e.g. new-tank-syndrome) — no-op elsewhere.
  if (intro.heroAlt) {
    h = replaceOnce(h, /(<figure class="art-hero-figure">[\s\S]*?<img[^>]*\balt=")[^"]*(")/,
      (_, a, b) => `${a}${intro.heroAlt}${b}`);
  }

  h = replaceOnce(h, /(<span class="art-eyebrow">)[^<]*(<\/span>)/,
    (_, a, b) => `${a}${intro.eyebrow}${b}`);

  h = replaceOnce(h, /(<h1 class="art-main-title">)[\s\S]*?(<\/h1>)/,
    (_, a, b) => `${a}${intro.titleHtml}${b}`);

  h = replaceOnce(h, /(<p class="art-intro-subtitle">)[\s\S]*?(<\/p>)/,
    (_, a, b) => `${a}${intro.subtitle}${b}`);

  // Replace art-intro-text paragraphs in order
  let textIdx = 0;
  const texts = intro.texts || [];
  h = h.replace(/(<p class="art-intro-text">)[\s\S]*?(<\/p>)/g, (match, a, b) => {
    if (textIdx < texts.length) return `${a}${texts[textIdx++]}${b}`;
    return match;
  });

  // Replace the three plain <span> in art-intro-meta (not meta-dot spans)
  const metaVals = [intro.metaModules, intro.metaTime, intro.metaLevel].filter(Boolean);
  let metaIdx = 0;
  h = replaceOnce(h, /(<div class="art-intro-meta">)([\s\S]*?)(<\/div>)/,
    (_, open, inner, close) => {
      const newInner = inner.replace(/<span>([^<]*)<\/span>/g, (m) => {
        if (metaIdx < metaVals.length) return `<span>${metaVals[metaIdx++]}</span>`;
        return m;
      });
      return `${open}${newInner}${close}`;
    });

  // CTA button text (before the <span>→</span>)
  h = replaceOnce(h, /(<button class="art-begin-btn"[^>]*>)[^<]*(<span)/,
    (_, btn, arrow) => `${btn}${intro.cta} ${arrow}`);

  // ── 8. Module sections ────────────────────────────────────────────────────
  const modules = t.modules || [];
  h = h.replace(/<section class="module" id="(mod-\d+)"[^>]*>([\s\S]*?)<\/section>/g,
    (match, id, content) => {
      const idx = parseInt(id.replace('mod-', ''), 10) - 1;
      const mod = modules[idx];
      if (!mod) return match;

      let c = content;

      // mod-tag
      c = replaceOnce(c, /(<span class="mod-tag">)[^<]*(<\/span>)/,
        (_, a, b) => `${a}${mod.tag}${b}`);

      // mod-title — mod-1 uses <h1>, others use <h2>
      c = replaceOnce(c, /(<h[12] class="mod-title">)[\s\S]*?(<\/h[12]>)/,
        (_, a, b) => `${a}${mod.titleHtml}${b}`);

      // mod-body paragraphs — a module may contain MULTIPLE mod-body divs (e.g. split
      // around a rhythm-grid or a canvas visual). mod.body[] holds ALL paragraphs across
      // every mod-body div in the module, in document order; each div is refilled with
      // the next N paragraphs matching its ORIGINAL (English template) paragraph count,
      // preserving the div's own opening tag (incl. any inline style/attrs) and position.
      // Uses depth-aware div tracking so nested divs inside mod-body (e.g. pq, hn, rhythm-grid)
      // are handled correctly and don't cause a lazy-regex to stop early.
      // Any pq/hn elements found INSIDE a mod-body are rescued and re-injected after it
      // so the subsequent pq/hn replacement steps can still find and translate them.
      if (mod.body && mod.body.length) {
        let result = '';
        let rest = c;
        let bodyIdx = 0;
        while (rest.length > 0) {
          const mbOpenMatch = rest.match(/<div class="mod-body"[^>]*>/);
          const mbIdx = mbOpenMatch ? mbOpenMatch.index : -1;
          if (mbIdx === -1) { result += rest; break; }
          result += rest.slice(0, mbIdx);
          let depth = 0, i = mbIdx, endIdx = -1;
          while (i < rest.length) {
            if (rest[i] === '<') {
              if (rest.slice(i, i + 4) === '<div') { depth++; }
              else if (rest.slice(i, i + 6) === '</div>') {
                depth--;
                if (depth === 0) { endIdx = i + 6; break; }
              }
            }
            i++;
          }
          if (endIdx === -1) { result += rest.slice(mbIdx); break; }

          const mbContent = rest.slice(mbIdx, endIdx);
          const openTag = mbOpenMatch[0];

          // A rhythm-grid may be nested inside mod-body (e.g. caring-without-guilt).
          // Its own <p> tags are handled later by the dedicated rhythm-grid step, so
          // split the mod-body content around it and count/fill paragraphs on each
          // side separately — the grid block itself passes through untouched.
          const rgMatch = mbContent.match(/<div class="rhythm-grid">[\s\S]*?<\/div>\s*<\/div>/);
          let innerHtml;
          if (rgMatch) {
            const before = mbContent.slice(0, rgMatch.index);
            const after = mbContent.slice(rgMatch.index + rgMatch[0].length);
            const beforeCount = (before.match(/<p>/g) || []).length;
            const afterCount = (after.match(/<p>/g) || []).length;
            const beforeParas = mod.body.slice(bodyIdx, bodyIdx + beforeCount)
              .map(p => `\n      <p>${p}</p>`).join('');
            bodyIdx += beforeCount;
            const afterParas = mod.body.slice(bodyIdx, bodyIdx + afterCount)
              .map(p => `\n      <p>${p}</p>`).join('');
            bodyIdx += afterCount;
            innerHtml = `${beforeParas}\n      ${rgMatch[0]}${afterParas}`;
          } else {
            const origParaCount = (mbContent.match(/<p>/g) || []).length;
            innerHtml = mod.body.slice(bodyIdx, bodyIdx + origParaCount)
              .map(p => `\n      <p>${p}</p>`).join('');
            bodyIdx += origParaCount;
          }

          // Rescue any pq/hn elements nested inside this mod-body so the
          // later replacement steps can still translate them.
          const rescued = [...mbContent.matchAll(/<div class="(?:pq[^"]*|hn[^"]*)">[\s\S]*?<\/div>/g)]
            .map(m => m[0]).join('\n    ');
          result += `${openTag}${innerHtml}\n    </div>` + (rescued ? '\n    ' + rescued : '');
          rest = rest.slice(endIdx);
        }
        c = result;
      }

      // Pull quotes — pullQuote for first block, additionalPullQuotes for the rest.
      // Regex matches <div class="pq"> with or without inline style/attrs.
      {
        const allPq = [];
        if (mod.pullQuote) allPq.push(mod.pullQuote);
        if (mod.additionalPullQuotes && mod.additionalPullQuotes.length) allPq.push(...mod.additionalPullQuotes);
        if (allPq.length) {
          let pqIdx = 0;
          c = c.replace(/(<div class="pq"[^>]*>\s*<p>)([\s\S]*?)(<\/p>)/g, (m, open, _inner, close) => {
            if (pqIdx < allPq.length) return `${open}${allPq[pqIdx++]}${close}`;
            return m;
          });
        }
      }

      // Simulator / CTA link text inside a pq block (optional)
      if (mod.simulatorLinkText) {
        c = c.replace(/(href="\/articles\/tank-simulator"[^>]*>)[^<]*/,
          (m, prefix) => `${prefix}${mod.simulatorLinkText}`);
      }

      // Hint boxes — supports up to 5 per module.
      {
        const hints = [];
        if (mod.hintLabel)  hints.push({ label: mod.hintLabel,  text: mod.hintText  || [] });
        if (mod.hintLabel2) hints.push({ label: mod.hintLabel2, text: mod.hintText2 || [] });
        if (mod.hintLabel3) hints.push({ label: mod.hintLabel3, text: mod.hintText3 || [] });
        if (mod.hintLabel4) hints.push({ label: mod.hintLabel4, text: mod.hintText4 || [] });
        if (mod.hintLabel5) hints.push({ label: mod.hintLabel5, text: mod.hintText5 || [] });
        if (hints.length) {
          let hIdx = 0;
          c = c.replace(
            /(<div class="hn[^"]*">)([\s\S]*?)(<span[^>]*>)[^<]*(<\/span>)([\s\S]*?)(<\/div>)/g,
            (full, divOpen, preSpan, spanOpen, spanClose, _body, divClose) => {
              if (hIdx < hints.length) {
                const hint = hints[hIdx++];
                const paras = hint.text.map(p => `\n      <p>${p}</p>`).join('');
                return `${divOpen}${preSpan}${spanOpen}${hint.label}${spanClose}${paras}\n    ${divClose}`;
              }
              return full;
            }
          );
        }
      }

      // Rhythm grid cell names/descriptions (optional — used in cycled-tank-problems
      // and caring-without-guilt). Two HTML shapes exist in the wild:
      //   (a) <div class="rhythm-cell-name">/<div class="rhythm-cell-desc">
      //   (b) <div class="rhythm-cell"><h4>Name</h4><p>Desc</p></div>
      if (mod.rhythmGrid && mod.rhythmGrid.length) {
        if (/<div class="rhythm-cell-name">/.test(c)) {
          let nameIdx = 0, descIdx = 0;
          c = c.replace(/(<div class="rhythm-cell-name">)[^<]*(<\/div>)/g, (_, a, b) => {
            if (nameIdx < mod.rhythmGrid.length) return `${a}${mod.rhythmGrid[nameIdx++].name}${b}`;
            return _;
          });
          c = c.replace(/(<div class="rhythm-cell-desc">)[^<]*(<\/div>)/g, (_, a, b) => {
            if (descIdx < mod.rhythmGrid.length) return `${a}${mod.rhythmGrid[descIdx++].desc}${b}`;
            return _;
          });
        } else {
          let cellIdx = 0;
          c = c.replace(/(<div class="rhythm-cell">\s*<h4>)[^<]*(<\/h4>\s*<p>)[\s\S]*?(<\/p>)/g, (_, a, mid, z) => {
            if (cellIdx < mod.rhythmGrid.length) {
              const cell = mod.rhythmGrid[cellIdx++];
              return `${a}${cell.name}${mid}${cell.desc}${z}`;
            }
            return _;
          });
        }
      }

      // Final CTA block (optional — e.g. mod-6 in cycled-tank-problems).
      if (mod.finalCtaText) {
        c = c.replace(/(<div class="final-cta">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/,
          (_, pre, _body, close) => `${pre}${mod.finalCtaText}${close}`);
      }
      if (mod.finalCtaBtn1 || mod.finalCtaBtn2) {
        let btnIdx = 0;
        c = c.replace(/(<a [^>]*class="btn-reading"[^>]*>)([^<]*)/g, (match, open, _text) => {
          if (btnIdx === 0 && mod.finalCtaBtn1) { btnIdx++; return `${open}${mod.finalCtaBtn1}`; }
          if (btnIdx === 1 && mod.finalCtaBtn2) { btnIdx++; return `${open}${mod.finalCtaBtn2}`; }
          btnIdx++;
          return match;
        });
      }

      // prev button
      if (mod.prevBtn) {
        c = replaceOnce(c, /(<button class="btn-prev"[^>]*>)[^<]*(<\/button>)/,
          (_, a, b) => `${a}${mod.prevBtn}${b}`);
      }

      // next button
      if (mod.nextBtn) {
        c = replaceOnce(c, /(<button class="btn-next"[^>]*>)[^<]*(<span)/,
          (_, a, arrow) => `${a}${mod.nextBtn} ${arrow}`);
      }

      return match.replace(content, () => c);
    });

  // ── 9. Related article link text ─────────────────────────────────────────
  const relatedLinks = t.relatedLinks || [];
  let relIdx = 0;
  h = h.replace(/<a href="([^"]*)" class="btn-ar"[^>]*>([^<]*)/g, (match, href, _origText) => {
    if (relIdx < relatedLinks.length) {
      const rel = relatedLinks[relIdx++];
      return match.replace(_origText, () => rel.text);
    }
    return match;
  });

  // ── 10. Article footer — scoped to art-footer to avoid touching nav links ──
  // Some articles repeat an art-footer block per module, so replace ALL occurrences.
  if (t.footer) {
    h = h.replace(/(<div class="art-footer">)([\s\S]*?)(<\/div>)/g,
      (_, open, inner, close) => {
        let f = inner;
        if (t.footer.allArticles) {
          f = f.replace(/<a href="\/reading">[^<]*<\/a>/,
            () => `<a href="/${lang}/reading">${t.footer.allArticles}</a>`);
        }
        if (t.footer.araLink) {
          f = f.replace(/<a href="\/articles\/ara-full-framework">([^<]*)<\/a>/,
            (__, text) => `<a href="/${lang}/articles/ara-full-framework">${t.footer.araLink || text}</a>`);
        }
        return `${open}${f}${close}`;
      });
  }

  // ── 11. Redirect-stub target (four-principles-of-ara, reading-the-five-
  // rhythms — both permanently redirect to the ARA framework hub, which now
  // has localized versions too; point the redirect at those instead of EN) ──
  if (slug === 'four-principles-of-ara' || slug === 'reading-the-five-rhythms') {
    h = h.replace(/\/articles\/ara-full-framework/g, `/${lang}/articles/ara-full-framework`);
  }

  // ── 11b. Safety net: any remaining bare href="/reading" that survived
  // translation verbatim (e.g. one-off CTA/back-links inside module bodies
  // not covered by the .art-footer/nav/bnav patchers above — bug found
  // 2026-08-18, e.g. new-tank-syndrome's mod-7 back-link and cycled-tank-
  // problems' final-cta second button). Anything already lang-prefixed is
  // untouched since the regex requires "/reading" immediately after the
  // opening quote. ─────────────────────────────────────────────────────
  h = h.replace(/href="\/reading"/g, `href="/${lang}/reading"`);
  h = h.replace(/(class="art-back-link"[^>]*>)Back to Reading →(<\/a>)/,
    (_, open, close) => `${open}${BACK_LINK[lang]}${close}`);

  // ── 12. Localize cross-links to OTHER articles (related-article buttons,
  // and any other inline <a href="/articles/<slug>"> link that survived
  // translation verbatim from the English source) — bug found 2026-08-18:
  // these all silently pointed at the English version even when the target
  // slug had a ready translation in THIS language, so reading a ja article
  // and following a related-article link would unexpectedly drop the reader
  // back into English. Anything already lang-prefixed (/${lang}/articles/…,
  // patched by earlier steps) is untouched since the regex requires
  // "/articles/" immediately after the opening quote. ─────────────────────
  h = localizeArticleLinks(h, lang);

  return h;
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
  // Optional #fragment suffix so same-article anchor jumps (e.g.
  // cycled-tank-problems' final-cta linking to its own #mod-5) get
  // localized too, not just bare slug links — bug found 2026-08-18.
  return h.replace(/href="\/articles\/([a-z0-9-]+)(#[^"]*)?"/g, (m, slug, frag) =>
    ready.has(slug) ? `href="/${lang}/articles/${slug}${frag || ''}"` : m);
}

// ── Patch English source files with hreflang ──────────────────────────────────

function patchEnglishArticle(slug) {
  const srcPath = path.join(ART_DIR, `${slug}.html`);
  if (!fs.existsSync(srcPath)) return;

  let h = fs.readFileSync(srcPath, 'utf8');
  let changed = false;

  // Always strip and re-inject hreflang so new languages are picked up.
  const hreflangBefore = h;
  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags(slug, 'en');
  h = replaceOnce(h, /(<link rel="canonical"[^>]*>)/,
    (_, canon) => `${canon}\n${hreflang}`);
  if (h !== hreflangBefore) changed = true;

  // Strip and re-inject the Settings panel's language data so newly added
  // translations are picked up.
  h = h.replace(/<details class="lang-sw"[\s\S]*?<\/details>\n?/g, '');
  h = h.replace(/<div class="lang-sw"[^>]*>.*?<\/div>\n?/g, '');
  h = h.replace(/<script>if\(!window\._lswH\)[\s\S]*?<\/script>\n?/g, '');
  h = h.replace(/<script>window\.__arI18n=[\s\S]*?<\/script>\n?/g, '');
  const dataBefore = h;
  h = replaceOnce(h, /(<button class="nbg")/,
    (_, btn) => `${buildI18nDataScript(slug)}\n${btn}`);
  if (h !== dataBefore) changed = true;

  if (changed) {
    fs.writeFileSync(srcPath, h, 'utf8');
    console.log(`  patched: articles/${slug}.html`);
  } else {
    console.log(`  up to date: articles/${slug}.html`);
  }
}

// ── Discover translated slugs for a language ─────────────────────────────────

/** Return slugs whose translation JSON has _meta.status === "ready" */
// ARA framework series (ara-full-framework + ara-s1..s6) uses a different page
// template (ara-art-*/ara-hub-* classes) and its own build script
// (build-ara-i18n.mjs) — its translations/<lang>/ara-*.json files share this
// same directory but MUST be skipped here, or buildArticle() below (which
// expects the regular article schema: intro/modules/section.module) crashes.
// Bespoke-template slugs — built by their own dedicated scripts
// (build-ara-i18n.mjs, build-csl-i18n.mjs, build-kyr-i18n.mjs) whose
// translations/<lang>/<slug>.json use a schema this file's buildArticle()
// does NOT understand (no head/intro/modules). MUST be excluded here or
// buildArticle() crashes (or, for community-stress-lab specifically —
// which happens to lack a _meta.status field — gets silently skipped by
// the 'ready' filter below by accident rather than by design; explicit
// exclusion here removes that fragile reliance).
const BESPOKE_SLUGS = new Set([
  'ara-full-framework', 'ara-s1-foundation', 'ara-s2-five-rhythms', 'ara-s3-phases',
  'ara-s4-alignment', 'ara-s5-observation', 'ara-s6-ethics',
  'community-stress-lab', 'know-your-rhythm', 'tank-simulator', 'tank-builder'
]);

function getTranslatedSlugs(lang) {
  const dir = path.join(TRANS_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .filter(slug => !BESPOKE_SLUGS.has(slug))
    .filter(slug => {
      try {
        const t = JSON.parse(fs.readFileSync(path.join(dir, `${slug}.json`), 'utf8'));
        return t._meta && t._meta.status === 'ready';
      } catch { return false; }
    });
}

// ── Main ──────────────────────────────────────────────────────────────────────

function buildLang(lang) {
  const slugs = slugArg ? [slugArg] : getTranslatedSlugs(lang);
  if (!slugs.length) {
    console.log(`  no translations found for lang=${lang}`);
    return;
  }

  console.log(`Building ${slugs.length} article(s) for lang=${lang}…`);
  const outDir = path.join(ROOT, lang, 'articles');
  fs.mkdirSync(outDir, { recursive: true });

  for (const slug of slugs) {
    const tPath = path.join(TRANS_DIR, lang, `${slug}.json`);
    if (!fs.existsSync(tPath)) {
      console.log(`  no translation: ${tPath}`);
      continue;
    }

    let t;
    try {
      t = JSON.parse(fs.readFileSync(tPath, 'utf8'));
    } catch (e) {
      console.error(`  JSON parse error in ${tPath}: ${e.message}`);
      continue;
    }

    const html = buildArticle(slug, lang, t);
    if (!html) continue;

    const outPath = path.join(outDir, `${slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`  → ${lang}/articles/${slug}.html`);
  }
}

if (patchEn) {
  // Patch all English articles that have at least one translation
  const allSlugs = new Set();
  for (const lang of LANGUAGES) {
    for (const s of getTranslatedSlugs(lang)) allSlugs.add(s);
  }
  console.log(`Patching ${allSlugs.size} English article(s) with hreflang…`);
  for (const slug of allSlugs) patchEnglishArticle(slug);
  console.log('Done.');
} else if (doAll) {
  for (const lang of LANGUAGES) buildLang(lang);
  console.log('Done.');
} else if (langArg) {
  buildLang(langArg);
  console.log('Done.');
} else {
  console.error('Usage:\n  node scripts/build-i18n.mjs --lang id [--slug <slug>]\n  node scripts/build-i18n.mjs --all\n  node scripts/build-i18n.mjs --patch-english');
  process.exit(1);
}
