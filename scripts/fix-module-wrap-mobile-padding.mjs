/**
 * Reduces .module-wrap's top padding on mobile across every article page.
 *
 * Each article's inline <style> sizes .module-wrap's top padding (6rem or
 * 7rem, depending on the page) to clear the top nav bar, which used to
 * stay position:fixed at every breakpoint. css/ar-page.css now un-fixes
 * that nav on mobile (<=720px) so it scrolls away with the page instead —
 * which means this padding is now pure unnecessary gap on phones, sized
 * for a bar that's no longer pinned there.
 *
 * Adds one small @media(max-width:720px) override right after each
 * .module-wrap rule, reducing just the top padding value; the desktop
 * value (and everything else about the rule) is untouched.
 *
 * Idempotent — skips any file that already has the override, so it's
 * safe to re-run (e.g. after a new article is added).
 *
 * Run: node scripts/fix-module-wrap-mobile-padding.mjs
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.join(import.meta.dirname, '..');
const DIRS = ['articles', 'ms/articles', 'id/articles', 'ja/articles', 'es/articles'];

const MOBILE_PADDING = 'clamp(1.5rem,6vh,2.5rem)';
const RULE_RE = /\.module-wrap\{([^}]*padding:)(\d)rem( clamp\(1\.5rem,5vw,3rem\) 6rem;display:none)\}/;
const MARKER = '/* mobile module-wrap padding override (fix-module-wrap-mobile-padding.mjs) */';

function patchFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');

  if (html.includes(MARKER)) return 'skip (already patched)';

  const match = html.match(RULE_RE);
  if (!match) return 'skip (no matching .module-wrap rule)';

  const fullRule = match[0];
  const override = `\n${MARKER}\n@media(max-width:720px){.module-wrap{padding-top:${MOBILE_PADDING}}}`;
  const patched = html.replace(fullRule, fullRule + override);

  fs.writeFileSync(filePath, patched, 'utf8');
  return 'patched';
}

let patched = 0, skipped = 0, missing = 0;
for (const dir of DIRS) {
  const dirPath = path.join(ROOT, dir);
  if (!fs.existsSync(dirPath)) continue;
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.html'));
  for (const f of files) {
    const filePath = path.join(dirPath, f);
    const result = patchFile(filePath);
    if (result === 'patched') {
      patched++;
      console.log(`  patched: ${path.relative(ROOT, filePath)}`);
    } else if (result.startsWith('skip (already')) {
      skipped++;
    } else {
      missing++;
    }
  }
}

console.log(`\n${patched} patched, ${skipped} already up to date, ${missing} had no .module-wrap rule to patch.`);
