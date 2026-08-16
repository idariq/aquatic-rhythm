/**
 * Compacts each article's .art-intro landing card on mobile.
 *
 * .art-intro is the full-screen "title card" every article opens with —
 * min-height:100vh, vertically centered via flexbox, padding-top:8rem.
 * On a phone this means a reader has to scroll (or wait through) a full
 * screen of mostly-empty space before reaching anything they clicked
 * through to read. .module-wrap (the paginated reading modules further
 * down) was fixed separately — this is the actual thing visible on
 * first load, and was left alone until now on purpose (see git history)
 * since collapsing a 100+-article "full-screen intro" pattern is a
 * bigger call than a padding tweak.
 *
 * The nav bar stays position:fixed (68px) at every breakpoint — this
 * fix accounts for that rather than assuming it's gone. On mobile only:
 *   - min-height:auto — the card now sizes to its own content instead
 *     of always forcing a full 100vh
 *   - align-items:flex-start — content sits near the top instead of
 *     being vertically centered (which is what caused a big top gap
 *     when the box was forced to 100vh)
 *   - padding-top reduced to just clear the fixed nav + a little
 *     breathing room, instead of the original 8rem
 * padding-bottom, horizontal padding, and the ::after fade-to-background
 * gradient are untouched — those aren't part of the "gap before content"
 * problem and carry their own (not fully understood) visual intent.
 *
 * Idempotent — skips any file that already has the override, safe to
 * re-run for new articles.
 *
 * Run: node scripts/fix-art-intro-mobile-height.mjs
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.join(import.meta.dirname, '..');
const DIRS = ['articles', 'ms/articles', 'id/articles', 'ja/articles', 'es/articles'];

const MARKER = '/* mobile art-intro height override (fix-art-intro-mobile-height.mjs) */';
// Most articles have this rule on one compact line; a handful (e.g.
// new-tank-syndrome.html) are pretty-printed across several lines
// instead. `[^}]*` matches either — there's nothing nested inside this
// rule, so the first `}` reliably closes it regardless of formatting.
const RULE_RE = /\.art-intro\{[^}]*\}/;

function patchFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  if (html.includes(MARKER)) return 'skip (already patched)';

  const match = html.match(RULE_RE);
  if (!match) return 'skip (no matching .art-intro rule)';
  if (!match[0].includes('min-height:100vh') || !match[0].includes('align-items:center')) {
    return `skip (unexpected .art-intro rule shape — left untouched: ${match[0].slice(0, 80)}...)`;
  }

  const override = `\n${MARKER}\n@media(max-width:720px){.art-intro{min-height:auto;align-items:flex-start;padding-top:calc(68px + 1.75rem)}}`;
  const patched = html.replace(match[0], match[0] + override);

  fs.writeFileSync(filePath, patched, 'utf8');
  return 'patched';
}

let patched = 0, skipped = 0, missing = 0;
for (const dir of DIRS) {
  const dirPath = path.join(ROOT, dir);
  if (!fs.existsSync(dirPath)) continue;
  for (const f of fs.readdirSync(dirPath).filter((f) => f.endsWith('.html'))) {
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
console.log(`\n${patched} patched, ${skipped} already up to date, ${missing} had no .art-intro rule to patch.`);
