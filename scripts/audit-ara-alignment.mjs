/**
 * Audit voice & jargon exposure across regular (non-framework) article HTML files.
 *
 * The ARA Framework module (ara-s1..s6, ara-full-framework) is the one place on the
 * site where readers have opted in to learn ARA's vocabulary — full jargon belongs
 * there and is skipped by this audit. Regular practical articles (nitrate, algae,
 * water changes, etc.) should stand on their own: a reader should get useful advice
 * without needing to learn named ARA constructs first. A branded "ARA · [Term]"
 * callout box in a regular article is a jargon leak, not a feature — this audit
 * flags it as an issue instead of requiring it (the previous version of this script
 * did the opposite: it required at least one "ARA · [Rhythm]" label per article).
 *
 * Also flags prescriptive/authority-toned phrasing (the site's voice is meant to be
 * observational, not commanding) and the "Chemical Rhythm" naming typo (the correct
 * term, where it's used at all, is "Water Rhythm").
 *
 * Run: node scripts/audit-ara-alignment.mjs
 */

import fs from 'fs';
import path from 'path';

const ROOT    = path.join(import.meta.dirname, '..');
const ART_DIR = path.join(ROOT, 'articles');

// Redirect stubs — no real body content to audit.
const REDIRECT_STUBS = new Set(['four-principles-of-ara.html', 'reading-the-five-rhythms.html']);

// The ARA Framework module itself — full jargon is expected and appropriate here.
const FRAMEWORK_MODULE = new Set([
  'ara-s1-foundation.html', 'ara-s2-five-rhythms.html', 'ara-s3-phases.html',
  'ara-s4-alignment.html', 'ara-s5-observation.html', 'ara-s6-ethics.html',
  'ara-full-framework.html',
]);

const SKIP = new Set([...REDIRECT_STUBS, ...FRAMEWORK_MODULE]);

// Checks
const JARGON_BOX_RE  = /ARA\s*·\s*[A-Z]/g; // branded "ARA · [Term]" callout label pattern
const PRESCRIPTIVE   = ['never replace', 'you must', 'you need to', 'you should always', 'beginners often', 'the correct approach', "the mistake is", 'proper way', 'right way', 'always do'];
const AUTHORITY_TONE = ['beginners often make', 'the correct response is', 'the mistake is', 'you should know', 'proper way to', 'right way to', 'you need to understand'];

function audit(filePath) {
  const raw  = fs.readFileSync(filePath, 'utf8');
  const html = raw.toLowerCase();

  const jargonBoxes = (raw.match(JARGON_BOX_RE) || []);

  // Terminology typo
  const chemRhythmCount = (html.match(/chemical rhythm/g) || []).length;

  // Prescriptive / authority-toned phrases
  const prescriptiveFound = PRESCRIPTIVE.filter(p => html.includes(p));
  const authorityFound = AUTHORITY_TONE.filter(a => html.includes(a));

  return {
    jargonBoxes,
    chemRhythmCount,
    prescriptiveFound,
    authorityFound,
  };
}

const files = fs.readdirSync(ART_DIR)
  .filter(f => f.endsWith('.html') && !SKIP.has(f))
  .sort();

const COL = { jargon: 8, chem: 6, prescr: 8, authority: 10 };
function pad(s, n) { return String(s).padEnd(n); }

console.log('\nArticle Voice & Jargon Audit (regular articles only — framework module skipped)\n' + '═'.repeat(80));
console.log(
  pad('Article', 38) +
  pad('Jargon', COL.jargon) +
  pad('Chem', COL.chem) +
  pad('Prescr', COL.prescr) +
  pad('Authority', COL.authority)
);
console.log('─'.repeat(80));

let issues = 0;

for (const file of files) {
  const fp = path.join(ART_DIR, file);
  const r  = audit(fp);
  const name = file.replace('.html', '').substring(0, 37);

  const jargonFlag = r.jargonBoxes.length > 0 ? `⚠${r.jargonBoxes.length}` : '✓';
  const chemFlag   = r.chemRhythmCount > 0 ? `⚠${r.chemRhythmCount}` : '✓';
  const prescrFlag = r.prescriptiveFound.length > 0 ? `⚠${r.prescriptiveFound.length}` : '✓';
  const authorFlag = r.authorityFound.length > 0 ? `⚠${r.authorityFound.length}` : '✓';

  if (r.jargonBoxes.length > 0 || r.chemRhythmCount > 0 || r.prescriptiveFound.length > 0 || r.authorityFound.length > 0) {
    issues++;
  }

  console.log(
    pad(name, 38) +
    pad(jargonFlag, COL.jargon) +
    pad(chemFlag, COL.chem) +
    pad(prescrFlag, COL.prescr) +
    pad(authorFlag, COL.authority)
  );

  if (r.jargonBoxes.length > 0) {
    console.log('  Branded ARA boxes: ' + r.jargonBoxes.join(', '));
  }
  if (r.prescriptiveFound.length > 0) {
    console.log('  Prescriptive: ' + r.prescriptiveFound.join(', '));
  }
  if (r.authorityFound.length > 0) {
    console.log('  Authority tone: ' + r.authorityFound.join(', '));
  }
  if (r.chemRhythmCount > 0) {
    console.log('  ⚠ "Chemical Rhythm" found — should be Water Rhythm');
  }
}

console.log('─'.repeat(80));
console.log(`Total files: ${files.length}  |  Files with issues: ${issues}\n`);
console.log('Legend: ✓ pass  ⚠N = N issues found. A regular article should score all ✓.');
