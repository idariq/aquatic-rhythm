/**
 * check-worker-knowledge.mjs
 *
 * Guards the one sync in this repo that has no pipeline behind it.
 *
 * ARA content lives in three places (CLAUDE.md, "Pengetahuan Rhyssa"):
 *   1. articles/ara-*.html          — what readers actually read
 *   2. docs/ARA-*.md                — the internal reference documents
 *   3. worker/knowledge.js          — what Rhyssa is told, baked at deploy time
 *
 * Layer 3 is a verbatim copy of layer 2, kept in step by hand. That has now
 * drifted twice: the marine/reef scope paragraph (found 2026-08-21), and again
 * when PR #483 and #484 edited the psychology doc on 2026-08-28 without
 * touching the worker — nine days during which Rhyssa answered real users from
 * a stale copy, with nothing to notice it.
 *
 * The failure is silent by nature: the worker still builds, still deploys, and
 * still answers. Only a comparison catches it, so this makes the comparison
 * part of `npm run check`.
 *
 * Usage:
 *   node scripts/check-worker-knowledge.mjs        # verify, exit 1 on drift
 *   node scripts/check-worker-knowledge.mjs --fix  # rewrite constants from docs
 *
 * Note this checks layers 2 and 3 only. Keeping layer 1 in step with layer 2
 * remains a human judgement — the site prose is written for readers, not
 * copied — so a green result here does not mean the site and the docs agree.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'worker', 'knowledge.js');

/* Each constant in worker/knowledge.js and the doc it must equal. */
const PAIRS = [
  { constant: 'ARA_FRAMEWORK', doc: 'docs/ARA-framework-v2.md' },
  { constant: 'ARA_PSYCHOLOGY', doc: 'docs/ARA-psychology-foundations.md' },
];

const fix = process.argv.includes('--fix');

/* Template-literal escaping is the only transform between doc and constant. */
const escapeForTemplate = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
const unescapeFromTemplate = (s) => s.replace(/\\`/g, '`').replace(/\\\$\{/g, '${').replace(/\\\\/g, '\\');

/* Trailing-newline differences between a file and an embedded literal are not
   drift, so compare trimmed. */
const norm = (s) => s.replace(/\s+$/, '');

function constantRegex(name) {
  return new RegExp('(export const ' + name + ' = `)([\\s\\S]*?)(`;)');
}

let source = fs.readFileSync(KNOWLEDGE, 'utf8');
const problems = [];
let fixedCount = 0;

for (const { constant, doc } of PAIRS) {
  const docPath = path.join(ROOT, doc);
  if (!fs.existsSync(docPath)) {
    problems.push(`${doc} — missing; ${constant} cannot be verified`);
    continue;
  }
  const docText = fs.readFileSync(docPath, 'utf8');
  const m = source.match(constantRegex(constant));
  if (!m) {
    problems.push(`${constant} — not found in worker/knowledge.js (renamed or reformatted?)`);
    continue;
  }

  const embedded = norm(unescapeFromTemplate(m[2]));
  const expected = norm(docText);
  if (embedded === expected) continue;

  if (fix) {
    source = source.replace(constantRegex(constant), (_, open, __, close) =>
      open + escapeForTemplate(norm(docText)) + '\n' + close);
    fixedCount++;
    continue;
  }

  /* Report the first differing line — enough to see what drifted without
     printing a whole document into the terminal. */
  const a = embedded.split('\n');
  const b = expected.split('\n');
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  problems.push(
    `${constant} is stale against ${doc}\n` +
    `      worker has ${a.length} lines, doc has ${b.length}\n` +
    `      first difference at line ${i + 1}:\n` +
    `        worker: ${(a[i] ?? '(end of constant)').slice(0, 100)}\n` +
    `        doc   : ${(b[i] ?? '(end of doc)').slice(0, 100)}`
  );
}

if (fix) {
  if (fixedCount) {
    fs.writeFileSync(KNOWLEDGE, source, 'utf8');
    console.log(`✓ Synced ${fixedCount} constant(s) in worker/knowledge.js from docs/.`);
    console.log('  Rhyssa serves this at deploy time — worker/** changes auto-deploy.');
  } else {
    console.log('✓ worker/knowledge.js already matches docs/ — nothing to fix.');
  }
  process.exit(0);
}

if (problems.length) {
  console.error('✗ worker/knowledge.js is out of sync with docs/:\n');
  for (const p of problems) console.error('  • ' + p + '\n');
  console.error('  Rhyssa answers users from this file, so drift here means stale');
  console.error('  answers in production until the worker is redeployed.');
  console.error('  Fix: node scripts/check-worker-knowledge.mjs --fix\n');
  process.exit(1);
}

console.log(`✓ worker/knowledge.js matches docs/ (${PAIRS.length} constants checked).`);
