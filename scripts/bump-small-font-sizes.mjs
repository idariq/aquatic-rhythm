/**
 * Raises every font-size below a floor across the site: css/style.css,
 * css/ar-page.css, and every .html file (index.html, articles/**,
 * {ms,id,ja,es}/articles/**, about/privacy/terms/reading/ara/**, tool
 * pages) — a mobile-readability pass. The two CSS files alone had
 * 100+ distinct sub-0.65rem declarations (8-11px at this site's 17px
 * root), and the same pattern repeats in each article's own inline
 * <style> block and in a handful of inline style="" attributes —
 * mostly uppercase/letter-spaced small-caps labels and badges, but
 * genuinely too small to read comfortably on a phone.
 *
 * Rule: for any `font-size:.NNrem` where NN < FLOOR (.65), new =
 * max(old+.1, FLOOR). A flat +.1rem (~1.7px) bump preserves relative
 * hierarchy between existing sizes that were already close to the
 * floor (a .6rem label ends up a bit bigger than a .58rem one still),
 * while clamping the MINIMUM output to the floor itself — not some
 * smaller floor like .6 — is what makes this idempotent: every value
 * this touches becomes >=FLOOR, so a second run finds nothing left
 * below the threshold to re-bump. (An earlier version of this script
 * used a separate, smaller minimum floor than the re-processing
 * threshold — that meant a value could land below the threshold after
 * one bump and get bumped AGAIN on a second run. Caught by running it
 * twice by accident and seeing it report file changes both times
 * instead of the second run reporting zero.) Values at or above FLOOR
 * (already ~11px+) are left untouched. The regex only matches the
 * `font-size:.Nrem` text pattern itself, so it applies identically
 * whether that text sits inside a CSS rule, a <style> block, or an
 * inline style="" attribute.
 *
 * This is a blunt, mechanical pass — line-height/letter-spacing/layout
 * are NOT touched, only the font-size number. Some tightly-fit elements
 * (fixed-width badges, nowrap labels in narrow containers) may need a
 * manual follow-up if a slightly bigger label doesn't fit — check
 * screenshots after running this, don't assume it's risk-free.
 *
 * Run: node scripts/bump-small-font-sizes.mjs
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.join(import.meta.dirname, '..');
const CSS_FILES = ['css/style.css', 'css/ar-page.css'];
const HTML_DIRS = [
  '.', 'articles', 'ms/articles', 'id/articles', 'ja/articles', 'es/articles',
  'about', 'privacy', 'terms', 'reading', 'ara',
];
const FLOOR = 0.65; // rem — values >= this are left alone
const BUMP = 0.1;
const MIN_RESULT = FLOOR; // must be >= FLOOR for idempotency — see comment above

// clamp() bump uses a separate, slightly higher floor (.85rem, ~14.5px):
// clamp() min/max bounds here are almost always used for actual
// headings/titles that are already reasonably sized (checked: 27 of 29
// clamp() font-sizes in css/style.css have min >=.85rem) — only ones
// below that are genuinely small caption/subtitle text in disguise
// (e.g. .rd-hit-sub at .7rem/.8rem, the reading-card italic subtitle).
// Bumps both the min and max bound by the same flat amount; the
// vw-based preferred value in the middle is left untouched, since
// proportional viewport scaling isn't itself a readability problem —
// only the absolute floor/ceiling it's clamped between is.
const CLAMP_FLOOR = 0.85;
const CLAMP_MIN_RESULT = CLAMP_FLOOR;

function formatRem(n) {
  return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace(/^0\./, '.');
}

function bumpFile(relPath) {
  const filePath = path.join(ROOT, relPath);
  const src = fs.readFileSync(filePath, 'utf8');
  let changed = 0;

  let patched = src.replace(/font-size:\.(\d+)rem/g, (full, digits) => {
    const old = parseFloat('.' + digits);
    if (old >= FLOOR) return full;
    const next = Math.max(old + BUMP, MIN_RESULT);
    changed++;
    return `font-size:${formatRem(next)}rem`;
  });

  patched = patched.replace(
    /font-size:clamp\((\.?\d+(?:\.\d+)?)rem,([^,]+),(\.?\d+(?:\.\d+)?)rem\)/g,
    (full, minStr, pref, maxStr) => {
      const min = parseFloat(minStr);
      if (min >= CLAMP_FLOOR) return full;
      const max = parseFloat(maxStr);
      const nextMin = Math.max(min + BUMP, CLAMP_MIN_RESULT);
      const nextMax = max + BUMP;
      changed++;
      return `font-size:clamp(${formatRem(nextMin)}rem,${pref},${formatRem(nextMax)}rem)`;
    }
  );

  if (changed > 0) {
    fs.writeFileSync(filePath, patched, 'utf8');
    console.log(`  ${relPath}: ${changed} font-size declarations bumped`);
  }
  return changed;
}

let totalFiles = 0, totalDecls = 0;
for (const f of CSS_FILES) {
  const n = bumpFile(f);
  if (n > 0) { totalFiles++; totalDecls += n; }
}
for (const dir of HTML_DIRS) {
  const dirPath = path.join(ROOT, dir);
  if (!fs.existsSync(dirPath)) continue;
  for (const f of fs.readdirSync(dirPath).filter((f) => f.endsWith('.html'))) {
    const n = bumpFile(path.join(dir, f));
    if (n > 0) { totalFiles++; totalDecls += n; }
  }
}

console.log(`\n${totalFiles} files changed, ${totalDecls} font-size declarations bumped.`);
console.log('Review the diff and check screenshots before committing — this is a mechanical bump, not a design review.');
