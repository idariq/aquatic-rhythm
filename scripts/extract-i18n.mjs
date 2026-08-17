/**
 * Inverse of build-i18n.mjs's buildArticle(): extracts translation JSON
 * fields back out of an already-localized article HTML file.
 *
 * Usage:
 *   node scripts/extract-i18n.mjs --lang ms --slug adding-new-fish
 *   node scripts/extract-i18n.mjs --lang ms --all
 *   node scripts/extract-i18n.mjs --all-langs
 */
import fs from 'fs';
import path from 'path';

const ROOT      = path.join(import.meta.dirname, '..');
const TRANS_DIR = path.join(ROOT, 'translations');
const LANGUAGES = ['ms', 'id', 'ja'];

const args    = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
const slugIdx = args.indexOf('--slug');
const langArg = langIdx !== -1 ? args[langIdx + 1] : undefined;
const slugArg = slugIdx !== -1 ? args[slugIdx + 1] : undefined;
const doAll   = args.includes('--all');
const allLangs = args.includes('--all-langs');

function getTranslatedSlugs(lang) {
  const dir = path.join(TRANS_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .filter(slug => {
      try {
        const t = JSON.parse(fs.readFileSync(path.join(dir, `${slug}.json`), 'utf8'));
        return t._meta && t._meta.status === 'ready';
      } catch { return false; }
    });
}

function firstMatch(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractArticle(html) {
  const t = {};

  // ── head ──
  t.head = {
    title:          firstMatch(html, /<title>([^<]*)<\/title>/),
    description:    firstMatch(html, /<meta name="description" content="([^"]*)"/),
    ogTitle:        firstMatch(html, /<meta property="og:title" content="([^"]*)"/),
    ogDescription:  firstMatch(html, /<meta property="og:description" content="([^"]*)"/),
  };

  // ── intro ──
  const intro = {};
  intro.eyebrow  = firstMatch(html, /<span class="art-eyebrow">([^<]*)<\/span>/);
  intro.titleHtml = firstMatch(html, /<h1 class="art-main-title">([\s\S]*?)<\/h1>/);
  intro.subtitle  = firstMatch(html, /<p class="art-intro-subtitle">([\s\S]*?)<\/p>/);

  intro.texts = [...html.matchAll(/<p class="art-intro-text">([\s\S]*?)<\/p>/g)].map(m => m[1]);

  const metaBlock = firstMatch(html, /<div class="art-intro-meta">([\s\S]*?)<\/div>/);
  if (metaBlock) {
    const spans = [...metaBlock.matchAll(/<span>([^<]*)<\/span>/g)].map(m => m[1]);
    intro.metaModules = spans[0] || null;
    intro.metaTime     = spans[1] || null;
    intro.metaLevel    = spans[2] || null;
  }

  const ctaMatch = html.match(/<button class="art-begin-btn"[^>]*>([^<]*)<span/);
  intro.cta = ctaMatch ? ctaMatch[1].trim() : null;

  t.intro = intro;

  // ── modules ──
  const modules = [];
  const moduleRe = /<section class="module" id="(mod-\d+)"[^>]*>([\s\S]*?)<\/section>/g;
  let mm;
  while ((mm = moduleRe.exec(html)) !== null) {
    const [, id, content] = mm;
    const mod = { id };

    mod.tag = firstMatch(content, /<span class="mod-tag">([^<]*)<\/span>/);
    mod.titleHtml = firstMatch(content, /<h[12] class="mod-title">([\s\S]*?)<\/h[12]>/);

    // mod-body paragraphs — a module may contain MULTIPLE mod-body divs (e.g. split
    // around a rhythm-grid or a canvas visual). Extract <p> from EVERY mod-body div in
    // the module, in document order, into one flat array — mirrors build-i18n.mjs's
    // per-div redistribution logic (which refills each div by its own paragraph count).
    mod.body = [];
    {
      let rest = content;
      while (rest.length > 0) {
        const mbOpenMatch = rest.match(/<div class="mod-body"[^>]*>/);
        const mbIdx = mbOpenMatch ? mbOpenMatch.index : -1;
        if (mbIdx === -1) break;
        let depth = 0, i = mbIdx, endIdx = -1;
        while (i < rest.length) {
          if (rest[i] === '<') {
            if (rest.slice(i, i + 4) === '<div') depth++;
            else if (rest.slice(i, i + 6) === '</div>') {
              depth--;
              if (depth === 0) { endIdx = i + 6; break; }
            }
          }
          i++;
        }
        const mbContent = endIdx !== -1 ? rest.slice(mbIdx, endIdx) : rest.slice(mbIdx);
        mod.body.push(...[...mbContent.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => m[1]));
        if (endIdx === -1) break;
        rest = rest.slice(endIdx);
      }
    }

    // pull quotes — all <div class="pq"...><p>...</p></div>
    const pqs = [...content.matchAll(/<div class="pq"[^>]*>\s*<p>([\s\S]*?)<\/p>/g)].map(m => m[1]);
    if (pqs.length) {
      mod.pullQuote = pqs[0];
      if (pqs.length > 1) mod.additionalPullQuotes = pqs.slice(1);
    }

    // simulator link text
    const simMatch = content.match(/href="\/articles\/tank-simulator"[^>]*>([^<]*)/);
    if (simMatch) mod.simulatorLinkText = simMatch[1];

    // hint boxes — up to 5
    const hintRe = /<div class="hn[^"]*">([\s\S]*?)(<span[^>]*>)([^<]*)(<\/span>)([\s\S]*?)<\/div>/g;
    const hints = [];
    let hMatch;
    while ((hMatch = hintRe.exec(content)) !== null) {
      const label = hMatch[3];
      const body = hMatch[5];
      const paras = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => m[1]);
      hints.push({ label, text: paras });
    }
    hints.forEach((h, idx) => {
      const n = idx === 0 ? '' : String(idx + 1);
      mod[`hintLabel${n}`] = h.label;
      mod[`hintText${n}`] = h.text;
    });

    // rhythm grid
    const names = [...content.matchAll(/<div class="rhythm-cell-name">([^<]*)<\/div>/g)].map(m => m[1]);
    const descs = [...content.matchAll(/<div class="rhythm-cell-desc">([^<]*)<\/div>/g)].map(m => m[1]);
    if (names.length) {
      mod.rhythmGrid = names.map((name, idx) => ({ name, desc: descs[idx] || '' }));
    }

    // final CTA
    const finalCtaMatch = content.match(/<div class="final-cta">[\s\S]*?<p>([\s\S]*?)<\/p>/);
    if (finalCtaMatch) mod.finalCtaText = finalCtaMatch[1];
    const ctaBtns = [...content.matchAll(/<a [^>]*class="btn-reading"[^>]*>([^<]*)/g)].map(m => m[1]);
    if (ctaBtns[0]) mod.finalCtaBtn1 = ctaBtns[0];
    if (ctaBtns[1]) mod.finalCtaBtn2 = ctaBtns[1];

    // prev/next buttons
    const prevMatch = content.match(/<button class="btn-prev"[^>]*>([^<]*)<\/button>/);
    if (prevMatch) mod.prevBtn = prevMatch[1];
    const nextMatch = content.match(/<button class="btn-next"[^>]*>([^<]*)<span/);
    if (nextMatch) mod.nextBtn = nextMatch[1].trim();

    modules.push(mod);
  }
  t.modules = modules;

  // ── related links ──
  const relLinks = [...html.matchAll(/<a href="([^"]*)" class="btn-ar"[^>]*>([^<]*)/g)]
    .map(m => ({ text: m[2] }));
  if (relLinks.length) t.relatedLinks = relLinks;

  // ── footer ──
  const footerBlock = firstMatch(html, /<div class="art-footer">([\s\S]*?)<\/div>\s*<\/div>\s*<\/footer>/) ||
                       firstMatch(html, /<div class="art-footer">([\s\S]*?)<\/div>/);
  if (footerBlock) {
    const footer = {};
    const allArt = footerBlock.match(/<a href="\/reading">([^<]*)<\/a>/);
    if (allArt) footer.allArticles = allArt[1];
    const araLink = footerBlock.match(/<a href="\/articles\/ara-full-framework">([^<]*)<\/a>/);
    if (araLink) footer.araLink = araLink[1];
    if (Object.keys(footer).length) t.footer = footer;
  }

  return t;
}

function processFile(lang, slug) {
  const htmlPath = path.join(ROOT, lang, 'articles', `${slug}.html`);
  const jsonPath = path.join(TRANS_DIR, lang, `${slug}.json`);
  if (!fs.existsSync(htmlPath)) {
    console.log(`  skip (no html): ${lang}/${slug}`);
    return;
  }
  if (!fs.existsSync(jsonPath)) {
    console.log(`  skip (no json): ${lang}/${slug}`);
    return;
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const oldJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const extracted = extractArticle(html);
  const newJson = { _meta: oldJson._meta, ...extracted };
  fs.writeFileSync(jsonPath, JSON.stringify(newJson, null, 4) + '\n', 'utf8');
  console.log(`  → ${lang}/${slug}.json`);
}

function run(lang) {
  const slugs = slugArg ? [slugArg] : getTranslatedSlugs(lang);
  console.log(`Extracting ${slugs.length} article(s) for lang=${lang}…`);
  for (const slug of slugs) processFile(lang, slug);
}

if (allLangs) {
  for (const lang of LANGUAGES) run(lang);
} else if (langArg && (doAll || slugArg)) {
  run(langArg);
} else {
  console.error('Usage:\n  node scripts/extract-i18n.mjs --lang ms --slug <slug>\n  node scripts/extract-i18n.mjs --lang ms --all\n  node scripts/extract-i18n.mjs --all-langs');
  process.exit(1);
}
