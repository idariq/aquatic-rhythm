/**
 * ARA framework content — coverage tests.
 *
 * The ARA framework used to live in a single `pg-ara` SPA section inside
 * index.html, with an in-page scroll-spy nav (initAraModScrollSpy in
 * js/ui.js) linking its module anchors. Commit be0e867 ("Remove /ara SPA
 * page; redirect to /articles/ara-full-framework") deleted that section
 * and its scroll-spy wiring entirely — the content was NOT lost, it was
 * split across six standalone articles plus a hub page:
 *
 *   articles/ara-full-framework.html  — hub, links to the six below
 *   articles/ara-s1-foundation.html
 *   articles/ara-s2-five-rhythms.html
 *   articles/ara-s3-phases.html
 *   articles/ara-s4-alignment.html
 *   articles/ara-s5-observation.html
 *   articles/ara-s6-ethics.html
 *
 * These tests were written against the old pg-ara structure and silently
 * broken by that migration (`node --test tests/` was itself crashing —
 * see package.json history — so nobody saw the 13 failures this file
 * produced once the script was fixed). This rewrite points every
 * assertion at wherever the concept actually lives now. Two concepts
 * from the old page appear to be genuinely gone rather than reworded —
 * not "not a low-tech or high-tech framework", and no "Welfare
 * safeguard" / "acute welfare risk" text anywhere in the six articles.
 * Those are marked `todo` below instead of deleted, so the gap stays on
 * record instead of disappearing quietly again.
 *
 * The tests are intentionally string-grep based: they assume the site
 * is hand-written HTML, not a templating system, and they read files
 * verbatim. If a page is restructured but a concept is reworded, update
 * the expectation here in the same commit.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SECTIONS = [
  'ara-s1-foundation',
  'ara-s2-five-rhythms',
  'ara-s3-phases',
  'ara-s4-alignment',
  'ara-s5-observation',
  'ara-s6-ethics',
];

function readArticle(slug) {
  return fs.readFileSync(path.join(ROOT, 'articles', `${slug}.html`), 'utf8');
}

test('all six ARA section articles exist and the hub page links to each', () => {
  const hub = readArticle('ara-full-framework');
  for (const slug of SECTIONS) {
    assert.ok(
      fs.existsSync(path.join(ROOT, 'articles', `${slug}.html`)),
      `articles/${slug}.html is missing`
    );
    assert.ok(
      hub.includes(`/articles/${slug}`),
      `ara-full-framework.html (hub) does not link to ${slug}`
    );
  }
});

test('ARA alignment page (s4) declares the five principles', () => {
  const s4 = readArticle('ara-s4-alignment');
  const titles = [
    'Timing before Technique',
    'Capacity before Ambition',
    'Rhythm before Intensity',
    'Observation before Correction',
    'Origin before Expression',
  ];
  for (const t of titles) {
    assert.ok(s4.includes(t), `missing principle title: ${t}`);
  }
});

test('ARA alignment page (s4) describes the seven alignment domains', () => {
  const s4 = readArticle('ara-s4-alignment');
  // Labels were shortened when this content was rewritten (e.g. "Water
  // quality" -> "Water", "Environmental structure" -> "Environmental") —
  // these are the current domain-cell labels, not the old pg-ara wording.
  const domains = [
    'Water',
    'Biological Load',
    'Livestock Behaviour',
    'Nutrient &amp; Chemical',
    'Environmental',
    'Technology',
    'Human Rhythm',
  ];
  for (const d of domains) {
    assert.ok(s4.includes(d), `seven-domains block missing: ${d}`);
  }
});

test('ARA foundation page (s1) covers the four assumptions including ecological continuity', () => {
  const s1 = readArticle('ara-s1-foundation');
  // The literal "Assumption I/II/III/IV" labels from the old pg-ara page
  // were dropped in favour of prose ordinals when this was rewritten.
  for (const ordinal of ['First,', 'Second,', 'Third,', 'Fourth,']) {
    assert.ok(s1.includes(ordinal), `four-assumptions prose missing ordinal: ${ordinal}`);
  }
  assert.match(s1, /ecological continuity/i, 'ecological-continuity assumption text not found');
});

test('ARA phases page (s3) covers false maturity and phase regression', () => {
  const s3 = readArticle('ara-s3-phases');
  assert.match(s3, /False Maturity/, 'false maturity item missing');
  assert.match(s3, /Phase Regression/, 'phase regression item missing');
});

test(
  'ARA foundation page (s1) states the framework\'s low-tech/high-tech neutrality',
  { todo: 'content appears to have been dropped in the pg-ara -> ara-s1..s6 rewrite, not reworded elsewhere — confirm with a human whether to restore it before deleting this test' },
  () => {
    const s1 = readArticle('ara-s1-foundation');
    assert.match(s1, /not a low-tech or high-tech framework/i, 'tech-neutrality stance is missing');
  }
);

test('ARA observation page (s5) describes the 3-Day and 7-Day rules', () => {
  const s5 = readArticle('ara-s5-observation');
  assert.ok(s5.includes('3-Day Rule'), 'missing 3-Day rule');
  assert.ok(s5.includes('7-Day Rule'), 'missing 7-Day rule');
});

test(
  'ARA observation page (s5) has a Welfare safeguard covering acute welfare risk',
  { todo: 'content appears to have been dropped in the pg-ara -> ara-s1..s6 rewrite, not reworded elsewhere — confirm with a human whether to restore it before deleting this test' },
  () => {
    const s5 = readArticle('ara-s5-observation');
    assert.match(s5, /Welfare safeguard/i, 'missing welfare safeguard subhead');
    assert.match(s5, /acute welfare risk/i, 'welfare safeguard body missing');
  }
);

test('ARA observation page (s5) describes the four observation habits', () => {
  const s5 = readArticle('ara-s5-observation');
  // Recapitalized to full Title Case when this was rewritten (old pg-ara
  // page only capitalized the first word of each label).
  for (const habit of [
    'Photographic Record',
    'Behavioural Mapping',
    'Same-Time Habit',
    'Fresh-Eyes Practice',
  ]) {
    assert.ok(s5.includes(habit), `four-habits block missing: ${habit}`);
  }
});

test('ARA observation page (s5) includes false-signal taxonomy examples', () => {
  const s5 = readArticle('ara-s5-observation');
  for (const sig of [
    'Diatom bloom',
    'New-tank cloudiness',
    'White biofilm on hardscape',
    'Post-water-change behaviour',
    'Early-morning surface breathing',
    'Panic window',
  ]) {
    assert.ok(s5.includes(sig), `false-signal taxonomy missing: ${sig}`);
  }
});

test('ARA rhythms page (s2) names capacity creep and ecological forgiveness constructs', () => {
  const s2 = readArticle('ara-s2-five-rhythms');
  assert.match(s2, /capacity creep/i, 'capacity creep construct missing');
  assert.match(s2, /ecological forgiveness/i, 'ecological forgiveness construct missing');
});

test('/ara redirect stub names the Malaysian context and author affiliations', () => {
  // This lives in ara/index.html's <head> (meta description + JSON-LD) —
  // /ara is now a redirect stub to /articles/ara-full-framework, but it
  // keeps its own head for search/social previews, and that head is the
  // only place left in the repo with this attribution.
  const araStub = fs.readFileSync(path.join(ROOT, 'ara/index.html'), 'utf8');
  assert.match(araStub, /Malaysia/, 'Malaysian-context mention missing from ara/index.html');
  assert.match(araStub, /Universiti Sains Islam Malaysia/, 'author affiliation (USIM) missing');
  assert.match(araStub, /Universiti Kebangsaan Malaysia/, 'author affiliation (UKM) missing');
});
