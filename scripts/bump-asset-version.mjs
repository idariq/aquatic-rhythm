/**
 * Bumps the site's cache-busting asset version everywhere it appears.
 *
 * scripts/patch-asset-versions.mjs only ADDS a `?v=N` string to refs
 * that don't have one yet (for brand-new article files) — it has no way
 * to actually increment an existing version, so shipping a CSS/JS change
 * meant hand-editing every `?v=25` to `?v=26` across ~117 files by hand.
 * This script does that bump in one pass:
 *
 *   - `?v=N` query strings on local /css/*.css and /js/*.js references,
 *     across every .html file in the repo (index.html, articles/**,
 *     {ms,id,ja,es}/articles/**, etc.)
 *   - sw.js's SHELL_CACHE / ARTICLE_CACHE cache names (`ar-shell-vN`,
 *     `ar-articles-vN`)
 *   - scripts/patch-asset-versions.mjs's own `const V`, so future
 *     new-file backfills pick up the bumped version too
 *
 * The current version is auto-detected from sw.js's SHELL_CACHE name
 * (the single most authoritative source — it's what actually gates
 * service-worker cache invalidation) and bumped by exactly 1. If any
 * file has a DIFFERENT version number than that (drift from a previous
 * incomplete manual bump), it's reported but left untouched — re-run
 * after resolving the drift, don't silently overwrite something that
 * might have been intentional.
 *
 * Run: node scripts/bump-asset-version.mjs
 * Then commit the diff. This changes correctness-relevant cache keys —
 * review the diff before committing, same as any other change.
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.join(import.meta.dirname, '..');
const SW_PATH = path.join(ROOT, 'sw.js');
const PATCH_SCRIPT_PATH = path.join(ROOT, 'scripts', 'patch-asset-versions.mjs');

const SHELL_CACHE_RE = /SHELL_CACHE\s*=\s*'ar-shell-v(\d+)'/;

function findHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtmlFiles(full, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

const swSrc = fs.readFileSync(SW_PATH, 'utf8');
const shellMatch = swSrc.match(SHELL_CACHE_RE);
if (!shellMatch) {
  console.error('Could not find SHELL_CACHE version in sw.js — aborting.');
  process.exit(1);
}
const CURRENT = shellMatch[1];
const NEXT = String(Number(CURRENT) + 1);

console.log(`Current version (from sw.js SHELL_CACHE): ${CURRENT}`);
console.log(`Bumping to: ${NEXT}\n`);

const qsRe = new RegExp(`\\?v=${CURRENT}\\b`, 'g');
const driftRe = /\?v=(\d+)/g;

let filesChanged = 0;
let refsChanged = 0;
const driftFiles = [];

const htmlFiles = [...findHtmlFiles(ROOT), SW_PATH];
for (const filePath of htmlFiles) {
  const src = fs.readFileSync(filePath, 'utf8');

  // Flag any version number in this file that doesn't match CURRENT —
  // don't touch it, just surface it so drift isn't bumped-over silently.
  for (const m of src.matchAll(driftRe)) {
    if (m[1] !== CURRENT) {
      driftFiles.push(`${path.relative(ROOT, filePath)} (found ?v=${m[1]})`);
      break;
    }
  }

  const matches = src.match(qsRe);
  if (!matches) continue;

  let patched = src.replace(qsRe, `?v=${NEXT}`);

  if (filePath === SW_PATH) {
    patched = patched
      .replace(`'ar-shell-v${CURRENT}'`, `'ar-shell-v${NEXT}'`)
      .replace(`'ar-articles-v${CURRENT}'`, `'ar-articles-v${NEXT}'`);
  }

  fs.writeFileSync(filePath, patched, 'utf8');
  filesChanged++;
  refsChanged += matches.length;
  console.log(`  bumped: ${path.relative(ROOT, filePath)} (${matches.length} ref${matches.length === 1 ? '' : 's'})`);
}

// Keep the backfill script's own version constant in sync.
const patchSrc = fs.readFileSync(PATCH_SCRIPT_PATH, 'utf8');
const vConstRe = new RegExp(`const V = '${CURRENT}';`);
if (vConstRe.test(patchSrc)) {
  fs.writeFileSync(PATCH_SCRIPT_PATH, patchSrc.replace(vConstRe, `const V = '${NEXT}';`), 'utf8');
  console.log(`  bumped: scripts/patch-asset-versions.mjs (const V)`);
  filesChanged++;
} else {
  console.warn(`  scripts/patch-asset-versions.mjs's const V didn't match '${CURRENT}' — left untouched, check it by hand.`);
}

console.log(`\n${filesChanged} files changed, ${refsChanged} query-string refs bumped ${CURRENT} -> ${NEXT}.`);

if (driftFiles.length) {
  console.warn(`\nWARNING: ${driftFiles.length} file(s) had a DIFFERENT version than ${CURRENT} and were left untouched:`);
  for (const f of driftFiles) console.warn(`  - ${f}`);
  console.warn('Investigate before assuming the bump above is complete.');
}
