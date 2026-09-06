# Rhythm Tracker — Cognitive Pretest Protocol

## Internal Working Document — Aquatic Rhythm

**For:** Rhythm Tracker v1.4
**Companions:** `docs/rhythm-tracker-instrument.md`, `docs/rhythm-tracker-hypothesis-inventory.md`
**Written:** 2026-09-06 · **Not yet run**

---

## S1: What This Is For

Every check run on this instrument so far has been structural — does the data
arrive, does the scoring behave, do the translations land. None of it can tell
you whether **a respondent understood the question the way it was meant**.

That is what this protocol tests, and it is the one thing no amount of later
analysis can recover. If people systematically misread an item, the answers to
it are answers to a different question, and the resulting picture is a picture
of misreading. No sample size fixes that.

It is also the only step available that reduces the single-author problem: every
item was written by one source, derived from a framework by the same source,
with no outside check. Eight strangers reading them aloud is the cheapest
independent check there is.

**What this is not.** Not usability testing — you are not asking whether the
site is nice to use. Not opinion gathering — you are not asking whether people
like ARA. Not validation — eight people cannot validate anything. This tests
comprehension only.

---

## S2: Who to Recruit

**Five to eight people.** Fewer than five and you will miss patterns; more than
eight and you will stop learning anything new. This is a well-established
working range for comprehension testing, not a statistical sample size.

**Must have:** a running tank. The instrument asks about a tank they already
have; someone without one cannot answer honestly.

**Aim for a spread of:**
- experience (at least two under a year, at least two over three years)
- setup type (at least one low-tech, at least one with automation or CO₂)
- language, if you can — one id and one ja respondent would test the
  translations, which have never been read by a native speaker outside this repo

**Avoid, deliberately:** people already familiar with ARA. They will read the
intended meaning into an ambiguous item because they already know the framework,
which is exactly the blindness being tested for. If you can only find such
people, note it in the record — it weakens the findings and should be stated.

---

## S3: Setup

- 30–40 minutes each, one at a time.
- Screen share or in person. Record audio if they agree; otherwise take notes.
- They use their own phone or laptop, on the real site.
- Tell them plainly: **"I am testing the questions, not you. There are no wrong
  answers. If something is confusing, that is the tool's fault and exactly what
  I need to hear."**

**The hardest rule, and the one most often broken: do not explain anything.**
When someone asks "does this mean X or Y?" the useful answer is *"what would you
take it to mean?"* An explanation destroys that data point permanently. Every
explanation you give is a misreading you will never find out about.

---

## S4: The Method

Two passes over each rhythm.

**Pass 1 — think aloud.** They answer normally, saying whatever goes through
their head. Stay quiet. If they fall silent for a while, prompt only with
*"what are you thinking?"*

**Pass 2 — probes.** After each rhythm (not after each question, which breaks
their flow), go back to two or three items and ask the four standard probes:

| Probe | Ask | Catches |
|---|---|---|
| Comprehension | "In your own words, what was that question asking?" | items read as a different question |
| Retrieval | "How did you work out your answer?" | items asking for something they cannot actually recall |
| Judgement | "How did you choose between those two options?" | options that are not really distinct |
| Response fit | "Was there an answer that fit you better that wasn't there?" | missing options, forced-choice distortion |

---

## S5: Items to Probe Specifically

These are not random. Each was flagged as a risk in the instrument record or the
hypothesis inventory, and each has a specific thing to listen for.

| Item | Listen for |
|---|---|
| `maturity-marker` | Do they answer what they *believe* marks maturity, or what *their tank* does? The inventory names belief-for-behaviour substitution as the instrument's most common defect. |
| `outcome_slip` | Are they reconstructing a recovery after the fact, and confidently? §S5.7 of the framework warns that forgiveness judged retrospectively can never be contradicted by evidence. Listen for how much they are inventing. |
| `stocking_change` | Can a person actually tell *grown-and-I-knew* from *grown-more-than-I-realised*? The whole item rests on that being answerable from the inside. |
| `care_intent` | Does "a deliberately intensive phase" read as intended — competition, breeding, quarantine — or as an excuse for drift? |
| The NA options | Do "not applicable" and "I don't know" read as genuinely different? v1.1 separated them in the data; this checks whether respondents separate them in their heads. |
| `observation-quality` | Is *reading* vs *checking* vs *glancing* a distinction they recognise, or one only the framework makes? |
| `oxygen-read` | Does it feel like a quiz with a right answer? If so, social-desirability pressure is distorting it — an open limitation (#11). |
| Consent copy | Do they know what they are agreeing to? Ask them to say it back. Specifically: does anything reach a third party, could it be published, can they withdraw? |
| `temp-check-freq` *(added v2.0)* | Does "how often do you check" read as clearly distinct from "how stable is it" (the item it replaced)? The split (`docs/rhythm-tracker-instrument.md` §S9/§S11) assumes people can separate a monitoring habit from a tank-state belief — check that assumption holds. |
| `temp_swing` *(added v2.0)* | Since this one is unscored and asked once in the share modal rather than per rhythm, do respondents notice it's a different kind of question from the five-per-rhythm flow, or does it blur together with `tank_volume`/`tank_age`? |

---

## S6: What to Record

One row per person per probed item. Keep it plain — a spreadsheet is fine.

| Field | |
|---|---|
| Participant | P1–P8 |
| Item id | e.g. `maturity-marker` |
| What they said it was asking | their words, not your summary |
| Read as intended? | yes / partly / no |
| Answer changed after probing? | yes / no — **the strongest single signal** |
| Option they wanted but didn't have | |
| Notes | |

Also record once per participant: experience level, setup type, language,
whether they already knew ARA, and how long the whole thing took.

**Record what they said, not what you concluded.** Your interpretation can be
revisited later only if their words are still there.

---

## S7: What Counts as a Finding

Rough thresholds, meant as prompts to look closer rather than as rules:

- **2 or more of 8 misread an item** → the item needs rewriting, not clarifying.
  At that rate it is the wording, not the person.
- **Anyone changes their answer after a probe** → the item was ambiguous enough
  that their first answer was not what they meant. This is the strongest signal
  in the whole method, and one instance is worth attending to.
- **Nobody can explain a distinction back to you** → the distinction exists only
  in the framework, not in keepers' heads.
- **An option nobody ever picks, across all participants** → dead option; either
  it is unreachable or it is wrongly worded.
- **Anyone is unclear about what the consent covers** → fix that before anything
  else. It is the only finding here with an ethical dimension rather than a
  quality one.

---

## S8: What to Do With Findings

1. Write them up in one place, participant words included.
2. Record them in the instrument record's change log — including findings you
   decide **not** to act on, and why. An unrecorded decision not to act is
   indistinguishable from an oversight later.
3. Item rewrites triggered by pretesting **do** bump the instrument version
   (§S8 of the instrument record), and pre-pretest data is then not directly
   comparable. That is the correct outcome, not a problem to avoid.

---

## S9: Honest Limits

- Eight people is not a sample. Findings are about *these* items being
  *comprehensible*, not about keepers in general.
- People behave differently when observed. Someone who normally skims will read
  carefully with you watching, so this cannot tell you how the tool is used
  unattended.
- Recruiting through the site's own audience selects for people already
  sympathetic to the framework — the same self-selection limitation that applies
  to the submitted data (instrument record, S7 #5).
- This tests comprehension. It says nothing about whether the items measure
  anything real.

---

## S10: Status

**Not run. Deferred by the owner, 2026-09-06, for capacity reasons.**

Recorded here rather than left silent, because this protocol asks the same of
its own findings: an unrecorded decision not to act is indistinguishable from an
oversight later.

**What deferring costs, stated plainly.** Every other gap found in this
instrument was fixable going forward — version stamps, missing-data coding,
covariates, outcome items were all added in v1.1–v1.4 and improved the data from
that point on. This one is different: if respondents systematically misread an
item, their answers are answers to a different question, and no later analysis
recovers that. Data collected from now on carries that risk, and the risk grows
with the amount collected.

**What that does not mean.** It does not invalidate the data, and it does not
block the exploratory use the instrument is for (instrument record, S10 purpose
note). It is a limitation of the same kind as the others already recorded in S7
of that document — it belongs in any write-up, alongside self-report and
self-selection.

**If capacity appears later, the cheapest useful version** is three English
participants covering the eight items in S5, plus the consent comprehension
check. Two afternoons. The consent check in particular has an ethical rather
than methodological character, since data is being collected under that consent
now, and it is a single question that can be asked of two or three people in ten
minutes each. A language strategy for id/ja was discussed and is not yet written
into S2 — those translations have never been read by a native speaker outside
this repo, and PR #512 is a documented instance of that exact gap producing
published errors that structural checks passed.
