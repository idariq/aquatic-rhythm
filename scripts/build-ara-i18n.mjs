/**
 * Builds localized HTML for the ARA framework series — a page template
 * (ara-art-* and ara-hub-* classes) distinct from the regular article
 * template that build-i18n.mjs handles, so it gets its own build script.
 * Source JSON lives
 * in translations/<lang>/ara-*.json (same directory as regular articles,
 * just a different, richer schema — see extract shape below).
 *
 * Usage:
 *   node scripts/build-ara-i18n.mjs --lang ms [--slug ara-s1-foundation]
 *   node scripts/build-ara-i18n.mjs --lang ms          (builds all 7: hub + s1..s6)
 *   node scripts/build-ara-i18n.mjs --all              (builds all languages)
 *
 * Output:
 *   /<lang>/articles/ara-full-framework.html
 *   /<lang>/articles/ara-s1-foundation.html ... ara-s6-ethics.html
 *   /<lang>/articles/four-principles-of-ara.html   (redirect stub)
 *   /<lang>/articles/reading-the-five-rhythms.html (redirect stub)
 */
import fs from 'fs';
import path from 'path';

const ROOT      = path.join(import.meta.dirname, '..');
const ART_DIR   = path.join(ROOT, 'articles');
const TRANS_DIR = path.join(ROOT, 'translations');
const BASE_URL  = 'https://aquaticrhythm.com';
const LANGUAGES = ['ms', 'id', 'ja'];

const args    = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
const slugIdx = args.indexOf('--slug');
const langArg = langIdx !== -1 ? args[langIdx + 1] : undefined;
const slugArg = slugIdx !== -1 ? args[slugIdx + 1] : undefined;
const doAll   = args.includes('--all');

const S_FILES = [
  'ara-s1-foundation', 'ara-s2-five-rhythms', 'ara-s3-phases',
  'ara-s4-alignment', 'ara-s5-observation', 'ara-s6-ethics'
];
const ALL_SLUGS = ['ara-full-framework', ...S_FILES];

// ── Shared site nav chrome (same labels build-i18n.mjs uses for regular
// articles — kept in sync manually since these are two separate scripts by
// design, mirroring the two distinct page templates they build). ──────────
const NAV_LABELS = {
  ms: {
    logoAria: 'Aquatic Rhythm — penjagaan ekologi untuk akuarium kecil',
    home: 'Laman Utama', reading: 'Panduan', companion: 'Rakan', companionMobile: 'Rakan AI',
    tools: 'Alat', toolsMobile: 'Makmal &amp; Alat', log: 'Catatan', about: 'Tentang',
    privacy: 'Dasar Privasi', terms: 'Terma Penggunaan', menu: 'Menu'
  },
  id: {
    logoAria: 'Aquatic Rhythm — perawatan ekologis untuk akuarium kecil',
    home: 'Beranda', reading: 'Panduan', companion: 'Pendamping', companionMobile: 'Pendamping AI',
    tools: 'Alat', toolsMobile: 'Lab &amp; Alat', log: 'Catatan', about: 'Tentang',
    privacy: 'Kebijakan Privasi', terms: 'Syarat Penggunaan', menu: 'Menu'
  },
  ja: {
    logoAria: 'Aquatic Rhythm — 小型水槽のための生態学的なケア',
    home: 'ホーム', reading: 'ガイド', companion: 'コンパニオン', companionMobile: 'AIコンパニオン',
    tools: 'ツール', toolsMobile: 'ラボ&amp;ツール', log: '記録', about: 'サイトについて',
    privacy: 'プライバシーポリシー', terms: '利用規約', menu: 'メニュー'
  }
};

// bnav (bottom PWA nav) — Home/Reading/Tools/Log — shared across every page.
const BNAV_LABELS = {
  ms: { home: 'Laman Utama', reading: 'Panduan', tools: 'Alat', log: 'Catatan', logAria: 'Catatan Penjaga' },
  id: { home: 'Beranda', reading: 'Panduan', tools: 'Alat', log: 'Catatan', logAria: 'Catatan Penjaga' },
  ja: { home: 'ホーム', reading: 'ガイド', tools: 'ツール', log: '記録', logAria: 'キーパーの記録' }
};

// Rhyssa chat sheet chrome — reused verbatim from translations/homepage/<lang>.json's
// "companion" section values (already shipped, PR #296) so this stays in sync with
// the homepage companion page automatically as long as that file is the source of truth.
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

function buildHreflangTags(slug, currentLang) {
  const lines = [];
  lines.push(`<link rel="alternate" hreflang="en" href="${BASE_URL}/articles/${slug}">`);
  for (const lang of LANGUAGES) {
    const tPath = path.join(TRANS_DIR, lang, `${slug}.json`);
    if (!fs.existsSync(tPath)) continue;
    try {
      const t = JSON.parse(fs.readFileSync(tPath, 'utf8'));
      if (t._meta && t._meta.status === 'ready') {
        lines.push(`<link rel="alternate" hreflang="${lang}" href="${BASE_URL}/${lang}/articles/${slug}">`);
      }
    } catch { /* skip */ }
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/articles/${slug}">`);
  return lines.join('\n');
}

function buildJsonLd(t, lang, slug, dates) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: t.head.ldHeadline || t.head.title, description: t.head.ldDescription || t.head.description,
    url: `${BASE_URL}/${lang}/articles/${slug}`,
    author: { '@type': 'Organization', name: 'Aquatic Rhythm' },
    publisher: { '@type': 'Organization', name: 'Aquatic Rhythm', url: BASE_URL },
    image: `${BASE_URL}/og-image.png`, datePublished: dates.pub, dateModified: dates.mod
  });
}

// ── Shared head/nav/bnav patching, applied to both templates ──────────────

function patchHead(h, t, lang, slug) {
  h = h.replace(/(<html[^>]*\slang=")[^"]*(")/, (_, a, b) => `${a}${lang}${b}`);

  h = replaceOnce(h, /<title>[^<]*<\/title>/, () => `<title>${t.head.title}</title>`);
  h = replaceOnce(h, /(<meta name="description" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.description}${b}`);
  h = replaceOnce(h, /(<meta property="og:title" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.ogTitle || t.head.title}${b}`);
  h = replaceOnce(h, /(<meta property="og:description" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.ogDescription || t.head.description}${b}`);
  if (t.head.twitterTitle) h = replaceOnce(h, /(<meta name="twitter:title" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.twitterTitle}${b}`);
  if (t.head.twitterDescription) h = replaceOnce(h, /(<meta name="twitter:description" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.twitterDescription}${b}`);
  h = h.replace(/(<meta property="og:image" content=")[^"]*(")/, (_, a, b) => `${a}${BASE_URL}/og/articles/${slug}-${lang}.png${b}`);

  const localUrl = `${BASE_URL}/${lang}/articles/${slug}`;
  h = replaceOnce(h, /(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);
  h = replaceOnce(h, /(<meta property="og:url" content=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);
  h = replaceOnce(h, /(<meta name="twitter:url" content=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);

  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags(slug, lang);
  h = replaceOnce(h, /(<link rel="canonical"[^>]*>)/, (_, canon) => `${canon}\n${hreflang}`);

  const srcLdMatch = h.match(/"datePublished"\s*:\s*"([^"]+)"/);
  const srcModMatch = h.match(/"dateModified"\s*:\s*"([^"]+)"/);
  const dates = { pub: srcLdMatch ? srcLdMatch[1] : '', mod: srcModMatch ? srcModMatch[1] : '' };
  h = replaceOnce(h, /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    () => `<script type="application/ld+json">${buildJsonLd(t, lang, slug, dates)}</script>`);

  if (lang === 'ja') {
    const notoLink = `\n<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" onload="this.onload=null;this.rel='stylesheet'">\n<noscript><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" rel="stylesheet"></noscript>`;
    h = h.replace(/(<\/style>)/, `$1${notoLink}`);
    h = h.replace(/(--sans:'DM Sans',system-ui,sans-serif)/, "--sans:'DM Sans','Noto Sans JP',system-ui,sans-serif");
  }
  return h;
}

function patchTopNav(h, lang) {
  const nav = NAV_LABELS[lang];
  if (!/<ul class="nlinks">/.test(h)) return h; // ara-full-framework has no top nav
  h = replaceOnce(h, /(<a href="\/" class="nl" aria-label=")[^"]*(")/, (_, a, b) => `${a}${nav.logoAria}${b}`);
  h = replaceOnce(h, /(<ul class="nlinks">)[\s\S]*?(<\/ul>)/, (_, a, b) => `${a}
    <li><a href="/">${nav.home}</a></li>
    <li><a href="/${lang}/reading">${nav.reading}</a></li>
    <li><a href="/companion">${nav.companion}</a></li>
    <li><a href="/tools">${nav.tools}</a></li>
    <li><a href="/journal">${nav.log}</a></li>
    <li><a href="/about">${nav.about}</a></li>
  ${b}`);
  h = replaceOnce(h, /(<button class="nbg" id="burger" aria-label=")[^"]*(")/, (_, a, b) => `${a}${nav.menu}${b}`);
  h = replaceOnce(h, /(<div class="nmob" id="nmob"[^>]*>\s*<ul>)[\s\S]*?(<\/ul>)/, (_, a, b) => `${a}
    <li><a href="/">${nav.home}</a></li>
    <li><a href="/${lang}/reading">${nav.reading}</a></li>
    <li><a href="/companion">${nav.companionMobile}</a></li>
    <li><a href="/tools">${nav.toolsMobile}</a></li>
    <li><a href="/journal">${nav.log}</a></li>
    <li><a href="/about">${nav.about}</a></li>
    <li><a href="/privacy">${nav.privacy}</a></li>
    <li><a href="/terms">${nav.terms}</a></li>
  ${b}`);
  return h;
}

function patchBnav(h, lang) {
  const b = BNAV_LABELS[lang];
  h = replaceOnce(h, /(<a href="\/" class="bnav-item" aria-label=")[^"]*(">[\s\S]*?<span>)[^<]*(<\/span>)/,
    (_, a, mid, z) => `${a}${b.home}${mid}${b.home}${z}`);
  h = replaceOnce(h, /(<a href="\/reading" class="bnav-item[^"]*" aria-current="page" aria-label=")[^"]*(">[\s\S]*?<span>)[^<]*(<\/span>)/,
    (_, a, mid, z) => `${a}${b.reading}${mid}${b.reading}${z}`);
  h = replaceOnce(h, /(<a href="\/tools" class="bnav-item" aria-label=")[^"]*(">[\s\S]*?<span>)[^<]*(<\/span>)/,
    (_, a, mid, z) => `${a}${b.tools}${mid}${b.tools}${z}`);
  h = replaceOnce(h, /(<a href="\/journal" class="bnav-item" aria-label=")[^"]*(">[\s\S]*?<span>)[^<]*(<\/span>)/,
    (_, a, mid, z) => `${a}${b.logAria}${mid}${b.log}${z}`);
  return h;
}

function patchRhyssaSheet(h, lang) {
  if (!/id="rh-sheet"/.test(h)) return h;
  const c = loadCompanionChrome(lang);
  h = replaceOnce(h, /(<button id="rh-fab" class="rh-fab" aria-label=")[^"]*(")/, (_, a, b) => `${a}Rhyssa${b}`);
  h = replaceOnce(h, /(<div id="rh-sheet"[^>]*aria-label=")[^"]*(")/, (_, a, b) => `${a}Rhyssa${b}`);
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

// ── ara-art-* (s1..s6) module block rendering ──────────────────────────────

function renderBlock(b) {
  switch (b.type) {
    case 'body':
      return `<div class="mod-body">\n${b.paragraphs.map(p => `        <p>${p}</p>`).join('\n')}\n      </div>`;
    case 'pq':
      return `<div class="pq"><p>${b.text}</p></div>`;
    case 'hn':
      return `<div class="hn">\n        <span class="hn-label">${b.label}</span>\n${b.paragraphs.map(p => `        <p>${p}</p>`).join('\n')}\n      </div>`;
    case 'rhythm-signals':
      return `<div class="rhythm-signals">\n${b.items.map(it =>
        `        <div class="rs-item"><span class="rs-item-label">${it.label}</span><span class="rs-item-text">${it.text}</span></div>`
      ).join('\n')}\n      </div>`;
    case 'domain-grid':
      return `<div class="domain-grid" role="list">\n${b.cells.map(c =>
        `        <div class="domain-cell" role="listitem"><div class="domain-cell-name">${c.name}</div><div class="domain-cell-q">${c.q}</div></div>`
      ).join('\n')}\n      </div>`;
    case 'signal-list':
      return `<div class="signal-list">\n${b.items.map(it => `        <div class="signal-item">
          <div class="signal-name">${it.name}</div>
          <div class="signal-body">${it.body}</div>${it.read ? `\n          <div class="signal-read">${it.read}</div>` : ''}
        </div>`).join('\n')}\n      </div>`;
    default:
      throw new Error(`unknown block type: ${b.type}`);
  }
}

function renderModule(mod, isFirst) {
  const eyebrow = `<div class="ara-art-mod-eyebrow">
        ${mod.pos ? `<span class="ara-art-mod-pos">${mod.pos}</span>\n        ` : ''}<span class="ara-art-mod-tag">${mod.tag}</span>
      </div>`;
  const hTag = isFirst ? 'h2' : 'h2'; // both use h2 in this template (h1 already used for page title)
  const blocksHtml = mod.blocks.map(renderBlock).join('\n      ');
  return `    <div class="ara-art-mod">
      ${eyebrow}
      <${hTag} class="mod-title">${mod.titleHtml}</${hTag}>
      ${blocksHtml}
    </div>`;
}

function buildAraS(slug, lang, t) {
  const srcPath = path.join(ART_DIR, `${slug}.html`);
  let h = fs.readFileSync(srcPath, 'utf8');

  h = patchHead(h, t, lang, slug);
  h = patchTopNav(h, lang);
  h = patchBnav(h, lang);

  // back-link ("← ARA Framework")
  h = replaceOnce(h, /(<a href="\/articles\/ara-full-framework" class="ara-art-back-link">)[^<]*(<\/a>)/,
    (_, a, b) => `${a}${t.backLinkText || '← ARA Framework'}${b}`);
  h = h.replace(/href="\/articles\/ara-full-framework"/g, `href="/${lang}/articles/ara-full-framework"`);

  // header
  h = replaceOnce(h, /(<span class="ara-art-eyebrow">)[^<]*(<\/span>)/, (_, a, b) => `${a}${t.header.eyebrow}${b}`);
  h = replaceOnce(h, /(<h1 class="ara-art-title">)[\s\S]*?(<\/h1>)/, (_, a, b) => `${a}${t.header.titleHtml}${b}`);
  h = replaceOnce(h, /(<p class="ara-art-desc">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${t.header.desc}${b}`);

  // body — regenerate entire module list from translated JSON
  const newBody = t.modules.map((m, i) => renderModule(m, i === 0)).join('\n\n');
  h = replaceOnce(h, /(<div class="ara-art-body">)([\s\S]*?)(<\/div><!-- \/ara-art-body -->)/,
    (_, open, _inner, close) => `${open}\n\n${newBody}\n\n  ${close}`);

  // secnav (prev/next)
  h = replaceOnce(h, /(<nav class="ara-art-secnav">)([\s\S]*?)(<\/nav>)/, (_, open, _inner, close) => {
    const links = t.secnav.map(l => {
      const href = l.href.startsWith('/articles/') ? `/${lang}${l.href}` : l.href;
      return `<a href="${href}">${l.text}</a>`;
    }).join('\n    ');
    const empty = t.secnav.length < 2 ? '<div class="ara-art-secnav-empty"></div>\n    ' : '';
    // preserve original ordering: prev link (if any) comes first, so if only one
    // link and it's a "next" link (page 1), keep the empty placeholder first.
    const hasPrevOriginally = /ara-art-secnav-empty/.test(_inner) === false && t.secnav.length === 2;
    if (t.secnav.length === 1 && /ara-art-secnav-empty/.test(h)) {
      return `${open}\n    <div class="ara-art-secnav-empty"></div>\n    ${links}\n  ${close}`;
    }
    return `${open}\n    ${links}\n  ${close}`;
  });

  // hub-cta (same text on every s-file)
  h = replaceOnce(h, /(<span class="ara-art-hub-cta-eyebrow">)[^<]*(<\/span>)/, (_, a, b) => `${a}${t.hubCta.eyebrow}${b}`);
  h = replaceOnce(h, /(<span class="ara-art-hub-cta-body">)[^<]*(<\/span>)/, (_, a, b) => `${a}${t.hubCta.body}${b}`);

  return h;
}

function buildAraHub(lang, t) {
  const srcPath = path.join(ART_DIR, 'ara-full-framework.html');
  let h = fs.readFileSync(srcPath, 'utf8');

  h = patchHead(h, t, lang, 'ara-full-framework');
  h = patchBnav(h, lang);
  h = patchRhyssaSheet(h, lang);

  h = replaceOnce(h, /(<span class="ara-hub-eyebrow">)[^<]*(<\/span>)/, (_, a, b) => `${a}${t.header.eyebrow}${b}`);
  h = replaceOnce(h, /(<h1 class="ara-hub-title">)[\s\S]*?(<\/h1>)/, (_, a, b) => `${a}${t.header.titleHtml}${b}`);
  h = replaceOnce(h, /(<p class="ara-hub-sub">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${t.header.sub}${b}`);

  let cardIdx = 0;
  h = h.replace(
    /(<a href=")([^"]*)(" class="ara-hub-card"[^>]*>\s*<span class="ara-hub-card-num">)([^<]*)(<\/span>\s*<div class="ara-hub-card-body">\s*<span class="ara-hub-card-label">)([^<]*)(<\/span>\s*<span class="ara-hub-card-desc">)([^<]*)(<\/span>\s*<span class="ara-hub-card-meta">)([^<]*)(<\/span>)/g,
    (match, p1, href, p3, num, p5, label, p7, desc, p9, meta, p11) => {
      if (cardIdx >= t.cards.length) return match;
      const c = t.cards[cardIdx++];
      const localHref = `/${lang}${href}`;
      return `${p1}${localHref}${p3}${num}${p5}${c.label}${p7}${c.desc}${p9}${c.meta}${p11}`;
    }
  );

  return h;
}

const REDIRECT_FALLBACK = {
  ms: { redirecting: 'Mengalihkan ke', linkText: 'Kerangka ARA: Rujukan Penuh' },
  id: { redirecting: 'Mengalihkan ke', linkText: 'Kerangka ARA: Referensi Lengkap' },
  ja: { redirecting: 'リダイレクト中：', linkText: 'ARAフレームワーク：完全版リファレンス' }
};

function buildRedirectStub(slug, lang, title, description) {
  const srcPath = path.join(ART_DIR, `${slug}.html`);
  let h = fs.readFileSync(srcPath, 'utf8');
  h = h.replace(/(<html[^>]*\slang=")[^"]*(")/, (_, a, b) => `${a}${lang}${b}`);
  h = replaceOnce(h, /<title>[^<]*<\/title>/, () => `<title>${title}</title>`);
  h = replaceOnce(h, /(<meta name="description" content=")[^"]*(")/, (_, a, b) => `${a}${description}${b}`);
  h = h.replace(/\/articles\/ara-full-framework/g, `/${lang}/articles/ara-full-framework`);
  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags(slug, lang);
  h = replaceOnce(h, /(<link rel="canonical"[^>]*>)/, (_, canon) => `${canon}\n${hreflang}`);
  const fb = REDIRECT_FALLBACK[lang];
  h = replaceOnce(h, /(<p>)Redirecting to (<a[^>]*>)[^<]*(<\/a>)…(<\/p>)/,
    (_, p, a, aClose, pClose) => `${p}${fb.redirecting} ${a}${fb.linkText}${aClose}…${pClose}`);
  return h;
}

// ── Main ─────────────────────────────────────────────────────────────────

function buildLang(lang) {
  const outDir = path.join(ROOT, lang, 'articles');
  fs.mkdirSync(outDir, { recursive: true });

  const slugs = slugArg ? [slugArg] : ALL_SLUGS;
  let builtHub = false;
  for (const slug of slugs) {
    const tPath = path.join(TRANS_DIR, lang, `${slug}.json`);
    if (!fs.existsSync(tPath)) { console.log(`  no translation: ${tPath}`); continue; }
    let t;
    try { t = JSON.parse(fs.readFileSync(tPath, 'utf8')); }
    catch (e) { console.error(`  JSON parse error in ${tPath}: ${e.message}`); continue; }

    const html = slug === 'ara-full-framework' ? buildAraHub(lang, t) : buildAraS(slug, lang, t);
    fs.writeFileSync(path.join(outDir, `${slug}.html`), html, 'utf8');
    console.log(`  → ${lang}/articles/${slug}.html`);
    if (slug === 'ara-full-framework') builtHub = true;
  }

  // Redirect stubs — only once ara-full-framework itself is built for this lang.
  if (builtHub || fs.existsSync(path.join(outDir, 'ara-full-framework.html'))) {
    const stubs = {
      'four-principles-of-ara': {
        ms: ['Empat Prinsip ARA — Aquatic Rhythm', 'Empat prinsip ARA kini sebahagian drpd rujukan penuh kerangka ARA.'],
        id: ['Empat Prinsip ARA — Aquatic Rhythm', 'Empat prinsip ARA kini menjadi bagian dari referensi lengkap kerangka ARA.'],
        ja: ['ARAの4つの原則 — Aquatic Rhythm', 'ARAの4つの原則は、現在ARAフレームワークの完全版リファレンスの一部です。']
      },
      'reading-the-five-rhythms': {
        ms: ['Membaca Lima Ritma — Aquatic Rhythm', 'Lima ritma ekologi ARA kini sebahagian drpd rujukan penuh kerangka ARA.'],
        id: ['Membaca Lima Ritme — Aquatic Rhythm', 'Lima ritme ekologis ARA kini menjadi bagian dari referensi lengkap kerangka ARA.'],
        ja: ['5つのリズムを読む — Aquatic Rhythm', 'ARAの5つの生態学的リズムは、現在ARAフレームワークの完全版リファレンスの一部です。']
      }
    };
    for (const [slug, byLang] of Object.entries(stubs)) {
      const [title, desc] = byLang[lang];
      const html = buildRedirectStub(slug, lang, title, desc);
      fs.writeFileSync(path.join(outDir, `${slug}.html`), html, 'utf8');
      console.log(`  → ${lang}/articles/${slug}.html (redirect stub)`);
    }
  }
}

if (doAll) {
  for (const lang of LANGUAGES) buildLang(lang);
  console.log('Done.');
} else if (langArg) {
  buildLang(langArg);
  console.log('Done.');
} else {
  console.error('Usage:\n  node scripts/build-ara-i18n.mjs --lang ms [--slug <slug>]\n  node scripts/build-ara-i18n.mjs --all');
  process.exit(1);
}
