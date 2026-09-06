# Rhythm Tracker — Instrument Development Record

## Internal Reference Document — Aquatic Rhythm

**Instrument:** Rhythm Tracker (`articles/rhythm-tracker.html`)
**Instrument version:** v1
**Status:** Published and collecting opt-in data. Not validated.
**Record started:** 2026-09-06

---

## Purpose of This Document

This document records how the Rhythm Tracker instrument was produced, what it
measures, how it scores, and what is known to be wrong with it. It exists so
that any future write-up can describe the instrument accurately without
reconstructing its history from memory.

That reconstruction risk is the reason this file exists. A sentence like
*"items were developed from the ARA framework and refined through iterative
review"* would be technically defensible and materially misleading. Writing the
provenance down while it is still verifiable in the repository is both easier
and more honest.

This is a methods record, not a validation report. Nothing here should be read
as evidence that the instrument works.

---

## S1: Scope of Claims

### What the instrument does

It collects self-reported keeper practice, interpretation, and knowledge across
the five ARA rhythms, and assigns each rhythm one of three ARA phase labels
(Early / Developing / Mature) using a fixed, author-specified scoring rule.

### What the instrument does not do

- **It does not diagnose tank condition.** No measurement of the tank itself is
  taken. Every input is self-report.
- **It cannot validate ARA.** The instrument was derived from the ARA framework
  and scores respondents on their alignment with it. It presupposes the
  framework; it cannot test it. This circularity is structural and is not
  removable by improving the items.
- **It is not a psychometric scale in its current form.** See S4 and S7.

Any claim built on this data must stay inside the boundary: *self-reported
keeper practice mapped onto ARA constructs*. Not tank state, not outcomes, not
evidence that alignment produces better tanks.

---

## S2: Construct Basis

The instrument operationalises two existing structures from
`docs/ARA-framework-v2.md`. It did not introduce new constructs.

| Scale | Framework source | Notes |
|---|---|---|
| Water Rhythm | §S3.1 | trajectory over snapshot; stable-suboptimal over unstable-optimal; dissolved oxygen awareness |
| Biological Rhythm | §S3.2, §S5.5 | biofilm as positive indicator; substrate biology; recovery interval after disturbance; False Maturity |
| Environmental Rhythm | §S3.3 | photoperiod consistency; hardscape rearrangement and social geometry; dead flow zones; temperature stability |
| Livestock Rhythm | §S3.4 | pre-clinical behavioural indicators; chronic sub-threshold stress accumulation; disruption on new additions |
| Keeper Rhythm | §S4.2, §S4.3, §S4.5 | Capacity Creep indicators; Minimum Viable Care; ARA automation principle |

Phase labels are taken from §S5: Early (§S5.1, cycle incomplete), Developing
(§S5.2, cycle complete but ecological depth not yet built), Mature (§S5.3,
genuine ecological depth).

### Known gap: no operational construct definitions

The framework defines each rhythm **conceptually**. It does not define what
would count as *evidence* that a given tank sits at a given phase within a
given rhythm. The instrument's items therefore define the constructs
**implicitly** — the score is whatever the items happen to measure.

This is backwards for measurement purposes. A construct definition per rhythm
(one paragraph: what the phase means, what observable facets indicate it) is a
prerequisite for any principled item revision, and does not yet exist.

### Known tension: §S4.5 disclaims the scoring the instrument applies

The Keeper Rhythm scale operationalises the five self-assessment questions in
§S4.5 (four of the five are used almost verbatim: water-change interval,
filter-check date, measured vs estimated feeding, observing vs glancing).

The framework introduces those questions with:

> These questions do not have correct answers — they have honest answers.

The instrument scores them 0/1/2 against author-keyed preferred responses. The
scoring contradicts the stated intent of the source. This is not a transcription
error; it is what happens when reflective prompts are reused as scale items
without re-deriving them for that purpose. It should be resolved deliberately —
either the Keeper items stop being scored, or they are rewritten as scale items
that §S4.5 does not disclaim.

---

## S3: Item Inventory

25 items: 5 per rhythm, 4 forced-choice options each.

The canonical item bank is the `RHYTHMS` object in
`articles/rhythm-tracker.html` (from ~line 323). It is **not duplicated here**,
deliberately: a hand-copied option list in a document is a drift point, and
would silently diverge from what respondents actually saw. Cite the file at a
specific commit when the exact wording matters.

What this section records instead is each item's **measurement type**, which is
the property that matters methodologically and is not visible from the item
wording alone.

| Scale | Item id | Measurement type |
|---|---|---|
| Water | `cycle-status` | factual system state *(gate; unscored — see S4)* |
| Water | `testing-habit` | behavioural frequency |
| Water | `trend-read` | interpretive strategy |
| Water | `stable-response` | situational judgment (vignette) |
| Water | `oxygen-read` | domain knowledge (single keyed answer) |
| Biological | `biofilm-read` | situational judgment + knowledge |
| Biological | `substrate-clean` | behavioural practice |
| Biological | `recovery-awareness` | situational judgment |
| Biological | `maturity-marker` | conceptual knowledge |
| Biological | `filter-media` | behavioural practice |
| Environmental | `light-schedule` | behavioural practice |
| Environmental | `light-consequence` | domain knowledge |
| Environmental | `hardscape-moves` | behavioural frequency |
| Environmental | `flow-deadspots` | attention practice |
| Environmental | `temp-stability` | monitoring practice |
| Livestock | `observation-baseline` | self-reported capability |
| Livestock | `preclinical-signs` | situational judgment |
| Livestock | `stress-accumulation` | conceptual knowledge |
| Livestock | `new-addition-disruption` | expectation / knowledge |
| Livestock | `behaviour-vs-chemistry` | prioritisation strategy |
| Keeper | `wc-interval-awareness` | self-monitoring / recall |
| Keeper | `filter-check-date` | self-monitoring / recall |
| Keeper | `feeding-precision` | behavioural practice |
| Keeper | `observation-quality` | self-reported attention quality |
| Keeper | `automation-reliance` | practice + stance |

**Consequence:** each scale sums across at least three different measurement
types. Knowledge items, habit items, and self-reported capability items are not
interchangeable indicators of one latent variable, so the summed score is not a
scale score in the psychometric sense. No internal-consistency statistic
(Cronbach's α, McDonald's ω) computed on these items would be interpretable.

---

## S4: Scoring Model (v1, as implemented)

Scoring lives in each rhythm's `reflect()` function. Weights are keyed to option
values: a preferred response scores 2, a partially-aligned response scores 1,
and **every option not named in the scoring expression scores 0**.

### Four rhythms (Biological, Environmental, Livestock, Keeper)

- All 5 items scored, 0–2 each. Maximum 10.
- Phase: `>=7` Mature; `4–6` Developing; `<4` Early.

### Water Rhythm — structurally different

- `cycle-status` is **not scored**. It acts as a hard gate applied before the
  score is consulted:
  - `still-cycling` or `not-sure` → Early, regardless of score
  - `recently-done` → Developing, regardless of score
  - `established` → Mature if score `>=6`, otherwise Developing
- Only the remaining 4 items are scored. Maximum 8, Mature cutoff 6.

The gate itself is theory-derived and defensible: §S5.1 defines Early Phase as
ending when the nitrogen cycle completes, so cycle status *should* dominate the
phase assignment. But its consequence is that Water Rhythm uses a different
scale length (max 8 vs 10) and a different Mature cutoff (75% vs 70%) from the
other four. Phase labels are therefore **not produced by a uniform rule across
rhythms**, and the radar chart presents them as if they were.

### Weight and threshold provenance

The 2/1/0 weights and the `>=7` / `>=4` cutoffs were set by the item author at
authoring time. They are neither derived from theory nor estimated from data,
and no rationale was recorded for the specific numeric values. They should be
treated as untested authoring conventions.

### "Don't know" and "not applicable" are scored inconsistently

Responses expressing absence of knowledge or non-applicability score **0 in
Water Rhythm** but **1 in the other four rhythms**:

| Scored 0 (Water) | Scored 1 (other rhythms) |
|---|---|
| `testing-habit: too-new` | `biofilm-read: never-noticed` |
| `trend-read: unsure` | `substrate-clean: not-applicable` |
| `oxygen-read: no-idea` | `recovery-awareness: never-happened` |
| | `hardscape-moves: no-hardscape` |
| | `filter-check-date: new-tank` |
| | `automation-reliance: no-automation` |

Two separate problems are visible here. First, the inconsistency itself. Second
and more important: **missing data is being encoded as low ability**. "I have
never tested for this" and "I would do the wrong thing" are different states,
and in v1 they are indistinguishable in the stored response and in the score.
Any analysis of v1 data must treat these response values as missing, not as
zeroes, and the affected items must be flagged as such at analysis time because
the data itself does not carry the distinction.

### Response-option order

In several items the keyed-preferred option is presented **first**, and option
descriptions signal which response is valued. Item sub-text attempts to
counteract social-desirability responding (e.g. *"Not how often you're supposed
to — how often you really do"*), but the option ordering and description
framing work against it. Order was not randomised or counterbalanced.

---

## S5: Development Provenance

All 25 items were authored on **2026-09-04** and published the same day. The
full record is in git history; the summary below is verifiable from commit
messages and diffs.

| PR | Date | What happened |
|---|---|---|
| #541 | 2026-09-04 | Prototype. Water Rhythm only (5 items), derived from §S3.1 and §S5. Deliberately not wired into navigation, sitemap, or i18n — held for content review. |
| #542 | 2026-09-04 | Remaining four rhythms (20 items) added, derived from §S3.2, §S3.3, §S3.4, §S4.2–4.3. Scoring convention (0–2 per item, `>=7`/`>=4` cutoffs) established here. |
| #549 | 2026-09-04 | Published: wired into Labs & Tools, sitemap, and id/ja build pipeline. |
| #551 | 2026-09-04 | Opt-in data collection added (Formspree). |
| #552 | 2026-09-04 | Anonymous `respondent_id` added to join rhythms across sessions. |
| #553–#599 | 2026-09-04 → 09-06 | Radar chart, visual identity, rename to "Rhythm Tracker", screen-flow and navigation fixes. **No item wording or scoring changes.** |

### Authorship

Items were drafted by an AI assistant (Claude, via Claude Code) working from
`docs/ARA-framework-v2.md`, in the sessions recorded above. Every commit carries
`Co-authored-by: Claude <noreply@anthropic.com>`, so authorship is attributable
per-item through git blame.

This is disclosed for the same reason the site already discloses AI-generated
imagery in `js/content-trust.js`: the provenance of published material is stated
rather than left to be assumed.

### Review

The commit record shows items were derived from named framework sections rather
than written freely, and that the prototype was deliberately withheld from
publication pending content review by the framework author (PR #541, #542 scope
notes). That review is the only review the record shows.

The following did **not** occur, and no record of them exists:

- external or independent expert review of item content
- content-validity assessment by anyone other than the framework author
- cognitive interviewing or think-aloud pretesting with aquarists
- pilot administration prior to publication (items went live the day they were written)
- any psychometric analysis — no factor structure, no reliability estimate, no item analysis
- institutional ethics review (see S6)

The framework author and the item author are the same source. There is no
independent check anywhere in the chain.

> If any informal review, testing, or consultation did take place and is simply
> not in the repository, record it here with its date and nature. An unrecorded
> review cannot be claimed later.

---

## S6: Data Collection, Consent, and Ethics Posture

### Trigger and consent flow

The share prompt appears **only after all five rhythms are completed**, once per
browser (`localStorage.ryr_share_prompted`). Consent is two-step and defaults to
off: an unchecked checkbox plus a separate send button. There is no auto-submit.
Dismissal ("Maybe later") leaves the option available at the bottom of the
picker screen indefinitely.

### Participant-facing text (verbatim, v1, EN)

> All five rhythms, read.
>
> That took real attention. Thank you for staying with it. If you're willing,
> sharing what you found here — your answers and the phase readings above —
> helps ARA research move forward, and helps this tool ask better questions for
> whoever reads next. It goes through Formspree, a third-party form service,
> with nothing else attached: no name, no email, just a random code so your five
> answers can be read as one set. This is early, honest groundwork — not a
> formal dataset, and not proof of anything yet.

Checkbox label: *"I'd like to share my answers and phase readings anonymously
for this purpose."*

### What is transmitted

POST to `https://formspree.io/f/xoeqleyo` with four fields:

| Field | Content |
|---|---|
| `phases` | phase label per rhythm |
| `answers` | raw option value per item, per rhythm |
| `lang` | `en` / `id` / `ja` |
| `respondent_id` | `crypto.randomUUID()`, persisted in `localStorage` |

Item-level raw responses are retained, which is correct and is what makes any
future rescoring possible.

### What is not transmitted

**No instrument version. No timestamp. No covariates.**

- **Version.** v1 data carries no marker identifying it as v1. The moment items
  or weights change, prior and subsequent submissions become non-comparable with
  no field distinguishing them. Records submitted before an
  `instrument_version` field ships can only be identified by Formspree's own
  received-date, and must be treated as v1 by inference rather than by record.
- **Covariates.** Tank volume and tank age are not collected. A Mature reading
  at six weeks and at three years mean different things; without these, the most
  obvious confound cannot be controlled. `cycle-status` captures tank age only
  very coarsely, and only for Water Rhythm.

### Anonymity

No name, email, IP-linked identifier, or free text is collected. `respondent_id`
is a random UUID generated client-side and stored only in the respondent's own
browser; it links that browser's submissions to each other and to nothing else.

Two consequences follow. First, the identifier is **not recoverable by us** — if
a respondent clears site data, their prior submissions cannot be linked to any
new ones. Second, where `localStorage` is unavailable (private browsing, blocked
storage), the fallback identifier is regenerated per call and is not stable.

### Withdrawal

**There is no withdrawal mechanism.** A respondent cannot retract a submission,
and no route to request deletion is offered in the consent text. In principle a
respondent holds their own `respondent_id` and could supply it to request
removal, but this is neither stated to them nor implemented.

### Ethics posture

No institutional ethics review (IRB/REC) was obtained. The work is conducted
independently of any institution, so no IRB was available — this is stated
rather than omitted, and it must be stated in any write-up. The consent text
tells participants their data supports research, which places this within
research-ethics scope regardless of institutional affiliation.

---

## S7: Known Limitations

Ordered by how much they constrain what the data can support.

1. **Circularity.** The instrument is derived from ARA and scores alignment with
   ARA. It cannot provide evidence for ARA. (Structural — not fixable by item
   revision.)
2. **Heterogeneous items summed into one score.** Scale scores are not
   psychometrically interpretable, and no reliability statistic applies. (S3)
3. **No validation of any kind.** No factor structure, no reliability, no
   item analysis, no known-groups comparison, no test-retest.
4. **Self-report with no ground truth.** No water parameter, photograph, or
   third-party observation corroborates any response. Not fixable by better
   items; must be disclosed as a limitation.
5. **Self-selected sample.** Respondents are visitors to a site that teaches the
   framework, who completed all five rhythms and opted in. Systematically more
   engaged and more ARA-sympathetic than aquarists generally. No generalisation
   to any wider population is supportable.
6. **Arbitrary weights and thresholds.** (S4)
7. **Non-uniform phase rule across rhythms.** Water uses a gated max-8 rule;
   others use max-10. Presented as comparable. (S4)
8. **Missing data encoded as low ability.** (S4)
9. **No instrument version or timestamp in stored data.** (S6)
10. **No covariates.** (S6)
11. **Response-order and social-desirability bias not controlled.** (S4)
12. **No withdrawal mechanism.** (S6)

### What this data can support

Descriptive and exploratory use: distributions of self-reported practice,
co-occurrence patterns across rhythms, hypothesis generation, and item-level
diagnostics to inform a revised instrument.

### What it cannot support

Confirmatory claims, prevalence estimates, causal inference, or any statement
that ARA-aligned practice produces better outcomes.

---

## S8: Versioning Policy

**v1** is the instrument as published 2026-09-04 and running unchanged since.

A version bump is required when any of the following changes:

- item wording (stem, sub-text, or any option label/description)
- the set of items, or their order
- scoring weights, phase thresholds, or the Water Rhythm gate
- the meaning of any stored option value

A version bump is **not** required for: layout, styling, navigation, screen
flow, translation of already-published strings, or anything else that leaves
stored response values and their meaning identical. (This is why PRs #553–#599
did not bump the version.)

When the version changes, `instrument_version` must ship in the submission
payload **in the same PR** — a version that is not recorded in the data is not
a version.

Each version gets an entry in S9 stating what changed and why, so that data from
different versions can be pooled or separated on the basis of a record rather
than a guess.

---

## S9: Change Log

**v1 — 2026-09-04** — Initial instrument. 25 items across 5 scales, derived from
`docs/ARA-framework-v2.md` as mapped in S2. Scoring as described in S4.
Published without pretesting or validation. Data collected from 2026-09-04
carries no version field; treat all pre-`instrument_version` submissions as v1
by inference.

---

## S10: Open Actions

Recorded here so they are not lost. Order reflects cost against consequence, not
importance.

1. **Ship `instrument_version` and a submission timestamp.** Cheap, and until it
   ships every incoming record inherits limitation 9.
2. **Separate "don't know" / "not applicable" from low scores** in both storage
   and scoring, consistently across all five rhythms.
3. **Collect minimum covariates** — tank volume, tank age.
4. **Write operational construct definitions** per rhythm (S2), before any item
   revision. Item revision without them repeats the original error.
5. **Resolve the §S4.5 contradiction** — Keeper items are scored against a
   framework passage that disclaims correct answers.
6. **Decide the instrument's shape.** The reflective surface and a measurement
   instrument pull in opposite directions. A two-layer design — uniform scored
   items carrying the measurement load, reflective vignettes retained for the
   reader but explicitly unscored — preserves both. This decision governs items
   4 and 5 and should be made before either.
7. **Offer a withdrawal route** in the consent text.
