/**
 * build-reading-index.mjs
 *
 * Generates a localized /reading index page for each language that has
 * at least one article with status: "ready".
 *
 * Usage:
 *   node scripts/build-reading-index.mjs
 *   node scripts/build-reading-index.mjs --lang id
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');
const TRANS_DIR = path.join(ROOT, 'translations');
const BASE_URL  = 'https://aquaticrhythm.com';
const TODAY     = new Date().toISOString().slice(0, 10);

const args     = process.argv.slice(2);
const langArg  = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
const LANGS    = langArg ? [langArg] : ['id', 'ja'];

// Preferred article order for the reading index
const SLUG_ORDER = [
  'new-tank-syndrome',
  'cycled-tank-problems',
  'why-is-my-aquarium-water-cloudy',
  'how-often-water-changes',
  'fish-hiding-what-does-it-mean',
  'adding-new-fish',
  'betta-fish-behaviour',
  'shrimp-dying-aquarium',
  'algae-in-aquarium',
  'overfeeding-aquarium',
  'aquarium-filter-maintenance',
  'fish-gasping-surface',
  'nitrate-keeps-rising',
  'fish-keep-dying-new-tank',
  'perfect-parameters-fish-dying',
  'ich-keeps-coming-back',
  'tank-crash-recovery',
  'aquarium-plants-not-growing',
  'low-tech-planted-tank',
  'community-fish-tank',
  'aquarium-travel-vacation',
  'aquarium-maintenance-routine',
  'aquarium-not-a-project',
  'capacity-creep',
  'life-change-protocols',
  'false-maturity',
  'just-one-more-tank',
  'social-comparison',
  'asking-for-help',
  'hard-to-quit',
  'keeper-your-tank-needs',
  'what-the-tank-gives-you',
  'grief-without-a-mistake',
  'learning-to-read-not-fix',
  'the-tank-you-didnt-start',
  'when-is-tank-ready-for-fish',
  'know-your-rhythm',
  'four-principles-of-ara',
  'reading-the-five-rhythms',
  'when-hobby-stops-feeling-good',
  'caring-without-guilt',
];

// UI strings per language
const UI = {
  id: {
    lang:        'id',
    htmlLang:    'id',
    pageTitle:   'Panduan Akuarium — Aquatic Rhythm',
    metaDesc:    'Panduan ekologi akuarium dalam Bahasa Indonesia — siklus nitrogen, ritme perawatan, dan pendekatan ARA. Nyaman dibaca di ponsel.',
    ogTitle:     'Panduan Akuarium — Aquatic Rhythm',
    eyebrow:     'Aquatic Rhythm',
    heading:     'Panduan ekologi<br><em>yang bisa dibaca di mana saja.</em>',
    intro:       'Artikel singkat tentang ekosistem akuarium tertutup — disajikan dalam modul pendek untuk ponsel dan malam yang tenang. Biologi dan kimia lebih dulu; hype tidak ada.',
    backToEn:    'Lihat semua artikel dalam bahasa Inggris →',
    backHome:    '← Kembali ke Aquatic Rhythm',
    notoFont:    false,
  },
  ja: {
    lang:        'ja',
    htmlLang:    'ja',
    pageTitle:   '水槽ガイド — Aquatic Rhythm',
    metaDesc:    '日本語で読める水槽生態学ガイド — 窒素サイクル、ケアのリズム、ARAフレームワーク。スマートフォンで読みやすいモジュール形式。',
    ogTitle:     '水槽ガイド — Aquatic Rhythm',
    eyebrow:     'Aquatic Rhythm',
    heading:     'どこでも読める<br><em>水槽生態学ガイド</em>',
    intro:       '閉鎖系水槽の生物学と化学を、スマートフォンで読みやすいモジュール形式で解説します。生物学と化学から始めます。誇大広告はありません。',
    backToEn:    'すべての記事を英語で見る →',
    backHome:    '← Aquatic Rhythmに戻る',
    notoFont:    true,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getReadyArticles(lang) {
  const dir = path.join(TRANS_DIR, lang);
  if (!fs.existsSync(dir)) return [];

  const articles = [];
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (j._meta?.status !== 'ready' || !j._meta?.slug) continue;
      articles.push({
        slug:       j._meta.slug,
        titleHtml:  j.intro?.titleHtml  || '',
        subtitle:   j.intro?.subtitle   || '',
        modules:    j.intro?.metaModules || '',
        time:       j.intro?.metaTime   || '',
        level:      j.intro?.metaLevel  || '',
      });
    } catch { /* skip malformed */ }
  }

  // Sort by preferred order, then alphabetically
  articles.sort((a, b) => {
    const ia = SLUG_ORDER.indexOf(a.slug);
    const ib = SLUG_ORDER.indexOf(b.slug);
    if (ia === -1 && ib === -1) return a.slug.localeCompare(b.slug);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return articles;
}

const ALL_READING_LANGS = ['id', 'ja'];

// Language switching lives in the Settings panel (matches articles), not a
// per-page dropdown. This just tells that panel which locales actually have
// a reading index — any other locale falls back to the English /reading hub.
function buildI18nDataScript() {
  const avail = ALL_READING_LANGS.filter(l => getReadyArticles(l).length > 0);
  return `<script>window.__arI18n={basePath:'reading',avail:${JSON.stringify(avail)}};</script>`;
}

function buildHreflang(lang) {
  const lines = [];
  lines.push(`<link rel="alternate" hreflang="en" href="${BASE_URL}/reading">`);
  for (const l of ALL_READING_LANGS) {
    if (getReadyArticles(l).length > 0) {
      lines.push(`<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/reading">`);
    }
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/reading">`);
  return lines.join('\n');
}

function buildCard(article, lang) {
  const metaParts = [article.modules, article.time, article.level].filter(Boolean);
  const metaStr   = metaParts.join(' &nbsp;·&nbsp; ');
  return `
    <a href="${BASE_URL}/${lang}/articles/${article.slug}" class="card">
      <div class="card-meta">${metaStr}</div>
      <h2>${article.titleHtml}</h2>
      <p>${article.subtitle}</p>
    </a>`;
}

function buildPage(lang, articles, ui) {
  const hreflang    = buildHreflang(lang);
  const cards       = articles.map(a => buildCard(a, lang)).join('\n');
  const canonicalUrl = `${BASE_URL}/${lang}/reading`;
  const notoLink    = ui.notoFont
    ? `\n<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" onload="this.onload=null;this.rel='stylesheet'">\n<noscript><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" rel="stylesheet"></noscript>`
    : '';
  const sansStack   = ui.notoFont
    ? "'Work Sans','Noto Sans JP',system-ui,sans-serif"
    : "'Work Sans',system-ui,sans-serif";

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: ui.pageTitle,
    description: ui.metaDesc,
    url: canonicalUrl,
    inLanguage: lang,
    isPartOf: { '@type': 'WebSite', name: 'Aquatic Rhythm', url: BASE_URL },
    hasPart: articles.map(a => ({
      '@type': 'Article',
      name: a.titleHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      url: `${BASE_URL}/${lang}/articles/${a.slug}`,
    })),
  };

  return `<!DOCTYPE html>
<html lang="${ui.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${ui.pageTitle}</title>
<meta name="description" content="${ui.metaDesc}">
<link rel="canonical" href="${canonicalUrl}">
${hreflang}
<link rel="icon" type="image/png" sizes="48x48" href="/favicon.png">
<meta name="theme-color" content="#e9f0e4">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${ui.ogTitle}">
<meta property="og:description" content="${ui.metaDesc}">
<meta property="og:image" content="${BASE_URL}/og-image.png">
<meta property="og:site_name" content="Aquatic Rhythm">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8MDN065WNW"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-8MDN065WNW');</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet"></noscript>${notoLink}
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
body{font-family:${sansStack};background:#f4f7f2;color:rgba(22,28,24,.88);line-height:1.85}
body::before{content:'';position:fixed;inset:0;z-index:-1;background:linear-gradient(180deg,#f5f8f3 0%,#e9f0e4 55%,#e3ebe0 100%)}
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:.9rem clamp(1rem,4vw,2.5rem);background:rgba(244,247,242,.92);backdrop-filter:blur(8px);border-bottom:1px solid rgba(22,28,24,.07)}
.nl{display:flex;align-items:center;gap:.5rem;text-decoration:none;font-size:.8rem;font-weight:500;color:rgba(22,28,24,.82);letter-spacing:.04em}
.nl svg{width:22px;height:22px;opacity:.7}
.ar-settings-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:none;border:none;border-radius:50%;cursor:pointer;padding:0;color:rgba(22,28,24,.5);opacity:.72;transition:background .25s,opacity .3s;-webkit-tap-highlight-color:transparent;flex-shrink:0}
.ar-settings-btn:hover{background:rgba(22,28,24,.07);opacity:1}
.ar-settings-backdrop{position:fixed;inset:0;z-index:1040;background:rgba(2,8,6,.65);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);opacity:0;pointer-events:none;transition:opacity .32s}
.ar-settings-backdrop.open{opacity:1;pointer-events:all}
.ar-settings-panel{position:fixed;top:0;right:0;bottom:0;z-index:1050;width:min(360px,88vw);background:rgba(4,12,9,.99);border-left:1px solid rgba(61,214,232,.1);transform:translateX(100%);transition:transform .42s cubic-bezier(0.22,1,0.36,1);overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;display:flex;flex-direction:column;will-change:transform}
.ar-settings-panel.open{transform:translateX(0)}
.ar-stg-head{display:flex;align-items:center;justify-content:space-between;padding:calc(.9rem + env(safe-area-inset-top)) 1.2rem .9rem;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;position:sticky;top:0;z-index:2;background:rgba(4,12,9,.98);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.ar-stg-head-left{display:flex;align-items:center;gap:.55rem}
.ar-stg-head-icon{color:rgba(61,214,232,.4)}
.ar-stg-title{font-size:.7rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.62)}
.ar-stg-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:rgba(255,255,255,.28);cursor:pointer;border-radius:8px;transition:color .2s,background .2s;line-height:1;font-size:.85rem;font-family:inherit}
.ar-stg-close:hover{color:rgba(255,255,255,.75);background:rgba(255,255,255,.07)}
.ar-stg-body{padding:.4rem 0 env(safe-area-inset-bottom);flex:1;min-height:0}
.ar-stg-section{padding:.9rem 1.2rem 0}
.ar-stg-label{display:block;font-size:.7rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(163,196,162,.44);margin-bottom:.7rem}
.ar-stg-divider{margin:.45rem 1.2rem;height:1px;background:linear-gradient(to right,transparent,rgba(139,189,210,.1),transparent)}
.ar-stg-lang-list{display:flex;flex-direction:column;gap:.35rem}
.ar-stg-lang-opt{display:flex;align-items:center;justify-content:space-between;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:rgba(235,240,236,.78);font-family:inherit;font-size:.85rem;font-weight:400;padding:.6rem .85rem;cursor:pointer;text-align:left;text-decoration:none;transition:background .2s,border-color .2s,color .2s;line-height:1.3}
.ar-stg-lang-opt:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.16);color:rgba(255,255,255,.9)}
.ar-stg-lang-opt.active{background:rgba(61,214,232,.1);border-color:rgba(61,214,232,.34);color:rgba(61,214,232,.92);cursor:default}
.ar-stg-lang-fallback{font-size:.65rem;color:rgba(255,255,255,.32);font-weight:400;letter-spacing:.02em}
main{max-width:680px;margin:0 auto;padding:7rem clamp(1.25rem,5vw,2rem) 5rem}
.eyebrow{display:block;font-size:.65rem;font-weight:500;letter-spacing:.26em;text-transform:uppercase;color:rgba(45,107,82,.82);margin-bottom:1.4rem}
h1{font-family:'Fraunces',Georgia,serif;font-weight:300;font-size:clamp(2rem,5vw,3.2rem);color:rgba(22,28,24,.92);line-height:1.1;margin-bottom:1.5rem}
h1 em{font-style:italic;color:rgba(45,107,82,.82)}
.intro{font-size:1.1rem;font-weight:400;color:rgba(22,28,24,.58);line-height:1.9;margin-bottom:3rem}
.articles{display:flex;flex-direction:column;gap:1rem}
.card{display:block;padding:1.5rem 1.65rem;border:1px solid rgba(22,28,24,.08);background:rgba(255,255,255,.92);border-radius:14px;box-shadow:0 8px 28px rgba(22,48,32,.08),inset 0 1px 0 rgba(255,255,255,.06);text-decoration:none;transition:border-color .25s,transform .28s cubic-bezier(0.22,1,0.36,1)}
.card:hover{border-color:rgba(45,107,82,.28);transform:translateY(-2px)}
.card-meta{font-size:.65rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(22,28,24,.38);margin-bottom:.55rem}
.card h2{font-family:'Fraunces',Georgia,serif;font-weight:300;font-size:1.35rem;color:rgba(22,28,24,.88);line-height:1.25;margin-bottom:.5rem}
.card h2 em{font-style:italic;color:rgba(45,107,82,.72)}
.card p{font-size:.85rem;font-weight:400;color:rgba(22,28,24,.58);line-height:1.85;margin:0}
.more{margin-top:2rem;padding:1.2rem 1.4rem;border:1px solid rgba(22,28,24,.08);background:rgba(255,255,255,.65);border-radius:8px}
.more p{font-size:.85rem;color:rgba(22,28,24,.54);line-height:1.7;margin-bottom:.6rem}
.more a{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(45,107,82,.82);text-decoration:none}
.more a:hover{color:rgba(45,107,82,.95)}
.back{display:inline-block;margin-top:2.4rem;font-size:.65rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(45,107,82,.72);text-decoration:none}
.back:hover{color:rgba(45,107,82,.92)}
</style>
</head>
<body>

<nav>
  <a href="/" class="nl" aria-label="Aquatic Rhythm">
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="11" cy="11" r="9" stroke="rgba(45,107,82,0.4)" stroke-width="1" fill="none"/>
      <ellipse cx="10.5" cy="11" rx="3.2" ry="1.9" fill="rgba(45,107,82,0.7)"/>
      <path d="M7.5 11 L5.8 9.2 L5.8 12.8 Z" fill="rgba(45,107,82,0.6)"/>
      <path d="M3 11 C5.5 7 8 7 10.5 11 C13 15 15.5 15 18 11" stroke="rgba(45,107,82,0.9)" stroke-width="1" fill="none" stroke-linecap="round"/>
    </svg>
    Aquatic Rhythm
  </a>
  <button class="ar-settings-btn" id="ar-settings-btn" aria-label="Settings" aria-expanded="false" title="Settings">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>
    </svg>
  </button>
</nav>

<div class="ar-settings-backdrop" id="ar-settings-backdrop" aria-hidden="true"></div>
<aside class="ar-settings-panel" id="ar-settings-panel" role="dialog" aria-modal="true" aria-label="Settings" aria-hidden="true">
  <div class="ar-stg-head">
    <div class="ar-stg-head-left">
      <svg class="ar-stg-head-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>
      </svg>
      <span class="ar-stg-title">Settings</span>
    </div>
    <button class="ar-stg-close" id="ar-settings-close" aria-label="Close settings"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m6 6 12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
  </div>
  <div class="ar-stg-body">
    <div class="ar-stg-section">
      <span class="ar-stg-label">Language</span>
      <div class="ar-stg-lang-list" id="ar-stg-lang-list"></div>
    </div>
  </div>
</aside>
${buildI18nDataScript()}
<script>
(function () {
  var panel = document.getElementById('ar-settings-panel');
  var backdrop = document.getElementById('ar-settings-backdrop');
  var openBtn = document.getElementById('ar-settings-btn');
  var closeBtn = document.getElementById('ar-settings-close');
  if (!panel || !openBtn) return;

  var AR_LANGS = [
    { code: 'en', label: 'English' },
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'ja', label: '日本語' }
  ];
  function renderLangSection() {
    var list = document.getElementById('ar-stg-lang-list');
    if (!list) return;
    var cur = (document.documentElement.getAttribute('lang') || 'en').split('-')[0];
    var info = window.__arI18n || {};
    var basePath = typeof info.basePath === 'string' ? info.basePath : '';
    var avail = info.avail || [];
    list.innerHTML = AR_LANGS.map(function (l) {
      if (l.code === cur) {
        return '<span class="ar-stg-lang-opt active" aria-current="page">' + l.label + '</span>';
      }
      var hasTranslation = l.code === 'en' || avail.indexOf(l.code) !== -1;
      var url = hasTranslation && l.code !== 'en' ? '/' + l.code + '/' + basePath : '/' + basePath;
      var suffix = hasTranslation ? '' : ' <span class="ar-stg-lang-fallback">(EN)</span>';
      return '<a class="ar-stg-lang-opt" href="' + url + '">' + l.label + suffix + '</a>';
    }).join('');
  }
  renderLangSection();

  var scrollLockY = 0;
  function lockBodyScroll() {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.width = '100%';
  }
  function unlockBodyScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollLockY);
  }
  function openPanel() {
    panel.classList.add('open');
    panel.removeAttribute('aria-hidden');
    if (backdrop) { backdrop.classList.add('open'); backdrop.removeAttribute('aria-hidden'); }
    openBtn.setAttribute('aria-expanded', 'true');
    lockBodyScroll();
  }
  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (backdrop) { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true'); }
    openBtn.setAttribute('aria-expanded', 'false');
    unlockBodyScroll();
  }
  openBtn.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (backdrop) backdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });
})();
</script>

<main>
  <span class="eyebrow">${ui.eyebrow}</span>
  <h1>${ui.heading}</h1>
  <p class="intro">${ui.intro}</p>

  <div class="articles">
${cards}
  </div>

  <div class="more">
    <p>${ui.backToEn.replace(' →', '')}</p>
    <a href="${BASE_URL}/reading">${ui.backToEn}</a>
  </div>

  <a href="/" class="back">${ui.backHome}</a>
</main>

</body>
</html>
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('Building localized reading index pages…');

for (const lang of LANGS) {
  const ui = UI[lang];
  if (!ui) { console.log(`  skip ${lang} (no UI strings defined)`); continue; }

  const articles = getReadyArticles(lang);
  if (articles.length === 0) { console.log(`  skip ${lang} (no ready articles)`); continue; }

  const outDir = path.join(ROOT, lang, 'reading');
  fs.mkdirSync(outDir, { recursive: true });

  const html = buildPage(lang, articles, ui);
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log(`  → ${lang}/reading/index.html (${articles.length} articles)`);
}

console.log('Done.');
