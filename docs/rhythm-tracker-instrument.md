# Rhythm Tracker — Instrument Development Record

## Internal Reference Document — Aquatic Rhythm

**Instrument:** Rhythm Tracker (`articles/rhythm-tracker.html`)
**Instrument version:** v2.1 (live). See S11 for the design rationale, S9 for what shipped.
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

### Settled 2026-09-06: phase labels are a reader-facing device, not data

An explicit owner decision, recorded here because it governs how everything
else in this file should be read.

The Early / Developing / Mature label a respondent sees is **a reflective
device**. The scoring rule behind it exists to produce a sensible, honest
reflection for that person — not to estimate anything about their tank. It is
not a measurement, and it is not offered as one.

Three consequences, all binding on any future analysis:

1. **Analyse items, never phases.** Raw item responses are the data. A phase
   label is a function of author-assigned weights and thresholds that were never
   derived from theory or estimated from data (S4); treating it as a variable
   would give those arbitrary numbers the standing of a measurement.
2. **`phases` in the payload is session metadata, not a tank measure.** It is
   retained because it records *what the respondent was shown*, which may matter
   for interpreting what they did next — whether seeing "Early" changed their
   willingness to share, for instance. It does not record anything about the
   tank.
3. **The scale-quality problems in S3 and S4 stop being blockers.** Heterogeneous
   item types, non-uniform thresholds, the Water Rhythm asymmetry — these would
   be disqualifying for an instrument claiming measurement. For a reflective
   device they are quality issues to improve when convenient, not defects that
   invalidate the output.

**What this decision defers rather than rejects.** A two-layer redesign — uniform
scored items carrying a measurement load, reflective vignettes retained but
explicitly unscored — remains the right move *if* the work ever turns toward
formal instrument development. It is deferred because rebuilding the scoring now
would be expensive, would change what readers see, and would be premature before
the completion and opt-in rates are known. Revisit it then, not now.

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

The instrument scores them 0/1/2 against author-keyed preferred responses.

**Resolved 2026-09-06 by the S1 decision.** The tension was between §S4.5's
"honest answers, not correct ones" and a score presented as a *measurement*. Once
the phase label is a reflective device rather than a measurement, that conflict
largely dissolves: the Keeper items produce a reflection back to the person who
answered, which is what §S4.5 intends them to do. The weights remain author
judgements about what a useful reflection looks like, and are documented as such.

What survives of the original concern: if the work ever moves to formal
instrument development, these items cannot be carried over as scale items
unchanged — §S4.5 disclaims exactly that use. Recorded here so the decision is
not silently reversed later.

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
| Environmental | `temp-stability` *(v1 only — split into `temp-check-freq` + unscored `temp_swing` in v2, see S9/S11)* | monitoring practice |
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

**This section describes v1–v1.4. Superseded 2026-09-06 by v2 — see S9's v2.0
entry and S11.** In v2, NOM-typed items (S11.2) are excluded from score/max
entirely rather than weighted 2/1/0 like everything else, which changes the
maximum for Biological, Livestock and Keeper (10 → 6 each; Environmental
stays 10, none of its items are NOM). The mechanism below — weights keyed to
option values, one preferred response scores 2 — is unchanged for whichever
items remain scored; what changed is which items participate at all.

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

### "Don't know" and "not applicable" — v1 behaviour, fixed in v1.1

*This section describes v1. See "v1.1" in S9 for what replaced it.*

Responses expressing absence of knowledge or non-applicability scored **0 in
Water Rhythm** but **1 in the other four rhythms**:

| Scored 0 (Water) | Scored 1 (other rhythms) |
|---|---|
| `testing-habit: too-new` | `biofilm-read: never-noticed` |
| `trend-read: unsure` | `substrate-clean: not-applicable` |
| `oxygen-read: no-idea` | `recovery-awareness: never-happened` |
| | `hardscape-moves: no-hardscape` |
| | `filter-check-date: new-tank` |
| | `automation-reliance: no-automation` |

Two separate problems were visible here. First, the inconsistency itself. Second
and more important: **missing data was being encoded as low ability**. "I have
never tested for this" and "I would do the wrong thing" are different states,
and in v1 they are indistinguishable in the stored response and in the score.

**Any analysis of v1 data (submissions with no `instrument_version` field) must
still handle this manually** — the data itself does not carry the distinction.
From v1.1 the submitted payload is self-describing; see S9.

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

**Updated 2026-09-06 — tank-context fields moved ahead of the consent
trigger, then split further by theme.** `tank_volume`/`tank_age`/
`temp_swing`/`stocking_change`/`life_change`/`outcome_slip`/
`outcome_intervention`/`care_intent` used to sit inside the share modal
itself (asked only once all five rhythms were done, right above the
consent checkbox). First move: all eight to the picker screen, ahead of the
rhythm cards — visible to every visitor, not only those who reach the share
step. The owner's reasoning: a keeper with more than one tank had no cue
that all five rhythms should be answered about the *same* tank, and
answering that cue upfront (rather than being told about it only after
finishing) is what actually fixes the ambiguity.

**Second move, same day, on the owner's further judgement**: only
`tank_volume`/`tank_age` stayed on the picker screen — pure tank facts
needed as context for every rhythm. The other six moved again, this time to
an inline block on the *specific* rhythm's own result screen, thematically
paired: `temp_swing` appears after Environmental Rhythm (companion to
`temp-check-freq`, the item it was split from — S9's v2.0 entry);
`stocking_change` after Livestock Rhythm (bioload theme); `outcome_slip`
after Biological Rhythm (false-maturity/forgiveness theme, §S5.7 of the
framework); `life_change`/`outcome_intervention`/`care_intent` together
after Keeper Rhythm (capacity/intent theme). Water has no paired field and
shows none. Because the tool is explicitly order-free (a respondent can
answer any rhythm in any sequence, days apart, and re-read any of them —
"nothing here needs to happen in order" is the picker screen's own text),
each inline block is simply shown or hidden based on which rhythm's result
is currently displayed (`ryrShowInlineContext()` in
`articles/rhythm-tracker.html`), not tracked as "seen once" — a respondent
revisiting a rhythm's result sees its paired field again, pre-filled if
already answered, which needed no new state beyond what `ryrTankContext()`/
`ryrRestoreTankContext()` already did.

Still fully optional, still unscored throughout, and — this is the part
that could easily have drifted without saying so — **still not transmitted
anywhere until the respondent separately opts in and sends at the end**:
neither move changed *when* the data leaves the browser, only where on the
page each field is asked. The consent trigger condition above (all five
rhythms complete) is unchanged.

### Participant-facing text (verbatim, v1, EN — see the note below for what changed)

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

**Updated 2026-09-06, §S12 shipped.** The sentence naming Formspree is now
*"It goes straight to our own server — no third party in between — with
nothing else attached: ..."* — everything else in the quoted text is
unchanged. Recorded here rather than editing the quote above silently: the
quote above is what v1–v2.0 respondents actually saw and consented to: it is
a historical record, not a live copy of current copy, and should not be
quietly rewritten to match whatever the site currently says. The current
text lives in `articles/rhythm-tracker.html`'s `#ryr-share-detail`, as
always.

### What is transmitted

**Updated 2026-09-06 (§S12).** POST to
`https://api.aquaticrhythm.com/forms/rhythm-tracker` (our own Cloudflare
Worker, verified with Cloudflare Turnstile) as a single JSON body, replacing
the Formspree endpoint below that all v1–v2.0 submissions before this date
went to. The field list is unchanged — same names, same meanings — only the
transport changed. Historical field-by-field notes below, kept as written
for older versions:

POST to `https://formspree.io/f/xoeqleyo` *(pre-2026-09-06 — see the update
note above)* with four fields:

| Field | Content |
|---|---|
| `phases` | phase label per rhythm |
| `answers` | raw option value per item, per rhythm |
| `lang` | `en` / `id` / `ja` |
| `respondent_id` | `crypto.randomUUID()`, persisted in `localStorage` |
| `instrument_version` | *(v1.1+)* e.g. `v1.1` |
| `submitted_at` | *(v1.1+)* ISO 8601 timestamp |
| `response_coding` | *(v1.1+)* per-item `not_applicable` / `no_basis` annotation |
| `tank_volume` | *(v1.2+)* bucket, or empty string if not answered |
| `tank_age` | *(v1.2+)* bucket, or empty string if not answered |
| `outcome_slip` | *(v1.3+)* what the system did after care slipped |
| `outcome_intervention` | *(v1.3+)* times the keeper had to step in, last month |
| `care_intent` | *(v1.3+)* whether the current pattern is deliberate |
| `stocking_change` | *(v1.4+)* how stocking has changed, and whether noticed |
| `life_change` | *(v1.4+)* disruption to keeper rhythm right now |
| `temp_swing` | *(v2.0+)* how much temperature actually moves — split off `temp-stability`'s state-facet; see S9 |
| `oxygen_testing` | *(v2.1+)* whether the respondent tests for dissolved oxygen directly — closes H-W3's reasoning-vs-behaviour gap; see S9 |
| `submission_index` | *(v1.3+)* 1 for a first submission, 2 for a second, … |
| `days_since_first` / `days_since_previous` | *(v1.3+)* empty on a first submission |
| `answer_dates` | *(v1.3+)* when each rhythm was last answered |

Item-level raw responses are retained, which is correct and is what makes any
future rescoring possible. `response_coding` makes the payload self-describing:
an analyst no longer has to know which option strings mean "couldn't answer".

### What is not transmitted

No demographics, no location, no free text, no experience level. Tank volume and
tank age are collected from v1.2 (both optional, see S9).

**Submissions made before v1.1** carry no version field and can only be
identified by Formspree's own received-date. They must be treated as v1 by
inference rather than by record. **v1.1 submissions** carry a version but no
covariates; an absent `tank_volume` field distinguishes them from a v1.2
submission where the respondent simply skipped the question (empty string).

### Anonymity

No name, email, IP-linked identifier, or free text is collected. `respondent_id`
is a random UUID generated client-side and stored only in the respondent's own
browser; it links that browser's submissions to each other and to nothing else.

Two consequences follow. First, the identifier is **not recoverable by us** — if
a respondent clears site data, their prior submissions cannot be linked to any
new ones. Second, where `localStorage` is unavailable (private browsing, blocked
storage), the fallback identifier is regenerated per call and is not stable.

### Withdrawal

*(v1.1)* After a successful send, the respondent's `respondent_id` is displayed
to them, and the consent text tells them to keep it and write to
`hello@aquaticrhythm.com` to have their answers removed. Since the identifier is
random and held only by them, supplying it is the only way a submission can be
located — which is also why the code has to be shown for the route to work.

**In v1 there was no withdrawal mechanism at all**, and pre-v1.1 respondents were
never shown their code. Their submissions are effectively unwithdrawable unless
they still have the original browser profile (the id persists in `localStorage`).

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
8. ~~Missing data encoded as low ability.~~ Fixed in v1.1; still applies to v1
   records.
9. ~~No instrument version or timestamp in stored data.~~ Fixed in v1.1; v1
   records remain unlabelled.
10. ~~No covariates.~~ Fixed in v1.2 (optional, so coverage will be partial).
11. **Response-order and social-desirability bias not controlled.** (S4)
12. ~~No withdrawal mechanism.~~ Fixed in v1.1; pre-v1.1 respondents were never
    shown their code and remain unable to use it.

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

- any question added to or removed from what respondents are asked, **whether or
  not it is scored** (added 2026-09-06 with the v1.2 covariates: the original
  wording was written for scale items only, and a change to the administered
  questionnaire deserves a version even when no scale item moves)

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

**v1.1 — 2026-09-06** — Data-integrity release. **No item wording changed and no
item was added or removed.** The version bump is for the scoring and payload
changes below, which alter what a stored record means.

*Payload* — added `instrument_version`, `submitted_at`, and `response_coding`.
The last annotates each answer as `not_applicable` or `no_basis` where it is
one, so the data no longer requires outside knowledge to interpret.

*Response coding* — the two kinds of "I can't answer that" are now separated:

- **`not_applicable`** (6 responses: `testing-habit:too-new`,
  `substrate-clean:not-applicable`, `recovery-awareness:never-happened`,
  `hardscape-moves:no-hardscape`, `filter-check-date:new-tank`,
  `automation-reliance:no-automation`) — the item's premise does not hold for
  this setup. Now **excluded from both the score and the maximum**, so nobody is
  scored on something their tank cannot exhibit.
- **`no_basis`** (13 responses, e.g. `oxygen-read:no-idea`,
  `temp-stability:unsure-swings`) — the respondent doesn't know or hasn't
  noticed. **Still scored**, because not knowing genuinely is the low end of a
  knowledge or awareness item, but now flagged in the data so analysis can
  separate "didn't know" from "knew and chose otherwise".

*Phase rule* — phases are now computed from the **proportion** of applicable
items rather than a raw total, which is what makes exclusion possible. The
ratios are unchanged (0.7 / 0.4; Water 0.75 behind its unchanged cycle gate).

**Verified behaviour change.** All 5,120 possible answer combinations (4^5 × 5
rhythms) were compared against a reference implementation of v1:

- **0 mismatches** among combinations containing no `not_applicable` response —
  for those respondents v1.1 is exactly v1.
- Of the 1,408 combinations that do contain one: 1,145 unchanged, 259 moved
  down a phase, 4 moved up.

The downward movement is the intended correction, not a regression. v1 granted a
flat 1-of-2 (50%) for a non-applicable item, which sits above most respondents'
actual mean, so it inflated. Excluding the item instead scores the respondent on
their own mean across items that do apply. The 4 upward cases are all Water
Rhythm with the self-contradictory pair `cycle-status:established` (stable for
months) plus `testing-habit:too-new` (too new for a routine).

*Consent* — widened to state that the work is intended as groundwork for a later
formal study and that grouped findings may be published or shared openly, and to
offer a withdrawal route (see S6). Respondent code now shown after sending.

*Funnel instrumentation* — GA events `ryr_rhythm_complete`,
`ryr_all_five_complete`, `ryr_share_prompted`, `ryr_share_submitted`,
`ryr_share_dismissed`, so completion and opt-in rates can be measured. These
respect the existing analytics opt-out, which is enforced at the page head via
`ga-disable-*`, making the calls no-ops for anyone who turned it off.

**v1.2 — 2026-09-06** — Covariates. **No scale item changed, and scoring is
untouched.** Two optional questions were added — `tank_volume` (6 buckets,
`< 20 L` … `> 500 L`, spanning the 20–500 L scope the framework works in) and
`tank_age` (6 buckets, `< 1 month` … `> 3 years`).

They are asked **inside the share modal**, not in the question flow, so readers
who never share are not made to answer them, and they sit **above the consent
checkbox** so what is being consented to is visible before consent is given.
Both are optional; an unanswered select submits an empty string, which is
distinguishable from every bucket. Selections are remembered in `localStorage`
so a respondent re-sending after revising an answer does not have to re-pick.

Why these two and not more: a phase reading at six weeks and at three years mean
different things, and without volume and age the most obvious confound cannot be
controlled at all. Everything beyond them was left out to keep the ask short.

The version bump is conservative — under the S8 rules as originally written it
was not strictly required, since no stored response value changed meaning. The
rule was extended instead (see S8) so that any change to what respondents are
asked earns a version, scored or not.

**v1.3 — 2026-09-06** — Outcome measures and repeat submission. **No scored item
changed and scoring was not touched** — verified by re-running all 5,120 answer
combinations against the v1 reference, 0 mismatches.

*Three optional, unscored context items* joined the tank-context block:
`outcome_slip` (what the system did after care slipped), `outcome_intervention`
(times the keeper stepped in last month), and `care_intent` (whether the current
pattern is deliberate, including an option for a deliberately intensive phase).

They are recorded and never scored, deliberately. Scoring an outcome would fold
it back into the predictor and rebuild exactly the circularity S1 warns about;
scoring intent would penalise the competition aquascaper and the breeder that
§S4.1 and §S5.6 of the framework explicitly protect.

Effect on what the data can support, re-scored in the hypothesis inventory: two
ecological claims became directly reachable (H-P6 false maturity, H-P8
ecological forgiveness, both via `outcome_slip`), three moved off *none*. 24
ecological claims remain unreachable. A mortality item was considered and left
out; the reasoning is recorded in the inventory's S9.

*Repeat submission* — `submission_index`, `days_since_first`,
`days_since_previous`, and per-rhythm `answer_dates` were added, and the
after-sending message now invites a second reading months later. The share
prompt, previously once-ever, now also re-appears for a returning respondent,
but only when the answers have genuinely changed **and** at least
`RYR_REPROMPT_DAYS` (60) have passed since their last submission. Dismissing it
suppresses it for the rest of that page session — without that, the re-prompt
condition stays true and the modal would re-open after every rhythm completed.

`answer_dates` exists because a returning respondent may revise one rhythm and
share all five, four of which are months old. Without dates that submission
looks uniformly fresh. This is the same principle as `response_coding` in v1.1:
make the awkward fact visible in the data rather than leave it to be
reconstructed.

**Limitation carried forward.** Both outcome items are self-reported and
retrospective. `outcome_slip` in particular asks a respondent to recall and
classify a past recovery — which is close to the after-the-fact reasoning §S5.7
of the framework warns about when it says forgiveness must be classified by
criteria set *before* a disturbance. It is a first handle on the claim, not a
measurement of it.

**v1.4 — 2026-09-06** — Stocking and life change. Two more optional, unscored
context items: `stocking_change` and `life_change`. **No scored item changed;
scoring re-verified across all 5,120 combinations, 0 mismatches.**

These were the two largest content holes the hypothesis inventory found. Stocking
carries *Capacity before Ambition*, the biological-overload pathway and
false-maturity failure; §S4.4 is an entire section on life disruption. Neither
was asked anywhere.

`stocking_change` asks about **change, not level** — self-reported density is
close to meaningless without species, adult size and filtration, while what the
framework actually claims is about creep ("additions over time, each
individually reasonable", §S8.2). It deliberately mirrors
`wc-interval-awareness`'s grown-and-knew / grown-more-than-realised split, which
is the instrument's strongest existing fit.

`life_change` maps onto §S4.4's own three categories. It resolves the validity
threat that a keeper mid-disruption is scored as though their current rhythm
were their settled one — now a recorded fact rather than an invisible confound.

Coverage effect: three claims moved off *none* (H-K8, H-A3, H-X3 — the first
pathway row ever to move), no new direct hits, 21 ecological claims still
unreachable.

`scripts/build-ryr-i18n.mjs` needed **no edit** for either item — it discovers
labels by span id and options by option value, a generalisation made in v1.3
specifically so the next question would not require touching it.

**v2.0 — 2026-09-06** — Type-aware scoring, per S11. Two changes, both
version-bump-worthy under S8 (an item added; scoring meaning changed):

*Scoring* — every item tagged NOM in S11.2 (`stable-response`,
`substrate-clean`, `recovery-awareness`, `preclinical-signs`,
`behaviour-vs-chemistry`, `wc-interval-awareness`, `automation-reliance`) is
now excluded from score and max entirely, rather than weighted 2/1/0 like
every other item regardless of type (v1's actual defect, S3/S7). They keep
their per-item reflection paragraphs — nothing a respondent reads changed
except the item below. Consequence: Biological, Livestock and Keeper's
maximum drops from 10 to 6 (3 scored items each); Environmental is unaffected
(none of its 5 items are NOM); Water's max is unaffected by this change
specifically (`stable-response` was already the only NOM item there, dropping
its max from 8 to 6) — the gate and thresholds (0.7/0.4 ratios) are otherwise
untouched, since the phase rule already worked on proportions, not raw
totals, from v1.1 onward.

*Item split* — `temp-stability` conflated a tank-state fact (how much
temperature actually moves) with a keeper-practice fact (how often it's
checked), per S11.2's callout. Split into `temp-check-freq` (scored, ORD —
replaces `temp-stability` as Environmental's fifth item, same slot, same
scoring role) and `temp_swing` (new, unscored, asked once in the share modal
alongside `tank_volume`/`tank_age` rather than per rhythm). `temp-check-freq`
codes `no-thermometer` as `not_applicable` (S6's response-coding scheme) —
"no way to check" is a premise failure, not a low score, matching
`hardscape-moves:no-hardscape`'s treatment.

**Verified**: `scripts/build-ryr-i18n.mjs`'s per-rhythm answer combinations
(used to extract exact shipped strings for id/ja substitution) assert each
combo lands in its intended phase bucket — Livestock's combo needed
recalibrating (swapping which combo row supplies `stress-accumulation`'s
`fine-if-no-symptom` vs `unsure-cumulative`) once `preclinical-signs` and
`behaviour-vs-chemistry` stopped contributing to its score; Biological's and
Keeper's combos held without changes. A Playwright check confirmed NOM-item
answers no longer move a rhythm's phase (varying `stable-response`,
`substrate-clean`+`recovery-awareness`, `preclinical-signs`+
`behaviour-vs-chemistry`, and `wc-interval-awareness`+`automation-reliance`
against otherwise-Mature answers left every phase at Mature), and that the
new `temp-check-freq` item and `temp_swing` field render correctly in en/id/ja
with no console errors or 404s.

**What this does not change**: no hypothesis-inventory coverage — S11.4
already noted this is a measurement-quality pass, not a content pass. The one
line in `docs/rhythm-tracker-hypothesis-inventory.md` §S5 that named
`temp-stability` as a partial tank-state item is updated to reflect the
split (see that document).

**v2.1 — 2026-09-06** — Moved Formspree submission to a self-hosted
Worker + D1 pipeline (§S12), split the tank-context block by theme so each
field now appears alongside the rhythm it belongs to instead of all eight at
once in the share modal (`tank_volume`/`tank_age` stayed on the rhythm-picker
screen, asked before any rhythm is answered so respondents know the five
rhythms they are about to answer describe one specific tank; the other six
now sit inline on each rhythm's result screen, revealed only for the rhythm
just completed), and added one new optional, unscored item: `oxygen_testing`
(three options — tests dissolved oxygen directly, aware it matters but
doesn't test it, or hasn't considered it — shown on Water's result screen).

*Why this field*: the hypothesis inventory's H-W3 ("most hobbyists test
nitrogen-cycle parameters but not dissolved oxygen") was only reachable via
`oxygen-read`, a scored knowledge item that tests whether a respondent can
reason about oxygen, not whether they actually test for it — a
reasoning-vs-behaviour gap the inventory flagged as *partial*, not *direct*.
`oxygen_testing` asks the behaviour directly, the same pattern
`stocking_change`/`life_change` used in v1.4 for their gaps. It is Water's
first context item — the four other rhythms already had one — which was
incidental (no pre-existing field happened to be Water-themed), not a
deliberate omission; this closes that gap rather than leaving Water alone
by default.

*Not scored*, for the same reason every other context item is not: this is
a behaviour report, not a knowledge test, and folding it into Water's score
would reward owning a dissolved-oxygen meter rather than reward alignment.

**Verified**: `scripts/build-ryr-i18n.mjs` re-run for id/ja with no script
change beyond adding `'water'` to the rhythm-key loop already generalised in
v1.3/v1.4 — labels and options are discovered by span id and option value,
not hardcoded. `npm run i18n:check` run twice showed identical diff-stats
(idempotent). A Playwright walk of all five rhythms across en/id/ja confirmed
the picker screen still shows exactly `tank_volume`/`tank_age`, each
rhythm's result screen shows exactly its own inline context block (Water:
`oxygen_testing` only), and the submitted payload carries every filled
field including `oxygen_testing`. `worker/schema.sql` gained the column plus
an `ALTER TABLE` migration line for the database created before v2.1 (the
`CREATE TABLE IF NOT EXISTS` above it is a no-op against an existing table
and will not add the column on its own).

---

## S10: Open Actions

Recorded here so they are not lost. Order reflects cost against consequence, not
importance.

1. ~~Ship `instrument_version` and a submission timestamp.~~ **Done in v1.1.**
2. ~~Separate "don't know" / "not applicable" from low scores.~~ **Done in v1.1.**
3. ~~Offer a withdrawal route in the consent text.~~ **Done in v1.1.**
4. ~~Collect minimum covariates — tank volume, tank age.~~ **Done in v1.2.**
   Outcome measures, intent, and repeat-submission plumbing followed in v1.3.
5. ~~Build a hypothesis inventory.~~ **Done** —
   `docs/rhythm-tracker-hypothesis-inventory.md`, 58 claims. The gap turned out
   to be structural rather than a matter of missing items: all 5 claims the
   instrument reaches directly are about *keepers*, and **0 of the 48 ecological
   claims are directly reachable**, because no outcome variable and no time
   dimension exist. Its S7 supersedes the ordering below for items 6-9.
6. ~~Write operational construct definitions~~ per rhythm (S2), derived from
   item 5. **Done 2026-09-06** — see S11.1; implemented as v2.0 scoring (S9).
7. ~~Resolve the §S4.5 contradiction.~~ **Resolved 2026-09-06** by the S1
   decision — see the note in S2.
8. ~~Decide the instrument's shape.~~ **Decided 2026-09-06: stay reflective.**
   Phase labels are a reader-facing device; analysis uses items only. The
   two-layer redesign is deferred, not rejected (S1).
9. **Cognitive pretesting** with real aquarists. Under the exploratory purpose
   this is the highest-value remaining step: if respondents systematically
   misread an item, the resulting picture is a picture of misreading, and no
   later analysis recovers it. Statistical work can wait; this cannot.
   **Protocol written 2026-09-06** — `docs/rhythm-tracker-pretest-protocol.md`,
   covering recruitment, probes, the eight items to probe specifically, what
   counts as a finding, and the honest limits. Not yet run; running it needs
   people, not code.
   **Re-scoped 2026-09-06** — owner decision: pretest the v2 draft (S11), not
   the live v1.4 wording, since v1.4 items scheduled for replacement would
   waste the pretest budget on text about to be discarded. S11.5 finds this
   costs less than it sounds: most item text carries forward into v2
   unchanged, so the original eight flagged items plus whatever S11.2's
   `temp-stability` split produces remain the actual pretest scope — the
   re-scoping changed *when* to run it, not how much there is to test.
   **v2.0 shipped 2026-09-06** (S9) with the split's actual text
   (`temp-check-freq`, `temp_swing`) — add both to
   `docs/rhythm-tracker-pretest-protocol.md`'s §S5 probe table alongside the
   original eight before running it. Still not yet run.

### Purpose note (recorded 2026-09-06)

The instrument is **not** intended to prove any claim. It is early groundwork so
that a picture from real keepers exists by the time ARA is ready for formal
testing. That framing dissolves the circularity problem in S7 (it only bites if
validation is claimed) and defers the psychometric work — no factor analysis, no
reliability estimate, no data-derived scoring model, no minimum sample size.

It also inverts the priorities. Since the scores will be discarded and the **raw
item responses** are the asset that carries forward, the operative rule for any
future analysis is: **analyse items, never phases.** Phase labels are a reader
-facing feature of the tool, not data.

That rule was an inference from the purpose when it was first written here. It
is now a settled owner decision with its own consequences — see **S1, "phase
labels are a reader-facing device, not data"**, which is the authoritative
statement and supersedes this paragraph where they differ.

---

## S11: v2 Instrument Structure — Design Proposal (2026-09-06)

**Status: implemented as v2.0 (2026-09-06).** S11.6 steps 1–3 are done — the
scoring rewrite and the `temp-stability` split described below shipped in the
same session; see S9's v2.0 entry for exactly what changed and how it was
verified. What remains open is S11.6 step 2's pretest and step 4's
reader-facing decision (S11.3's note) — both still require people, not code.
This section is kept as the design record; read it alongside S9 for the
as-shipped detail. It covers all 25 scored items, per owner decision on the
same date, rather than only the eight items the pretest protocol had already
flagged.

### S11.1: Operational Construct Definitions

The gap this closes: the framework defines each rhythm conceptually (S2) but
never states what counts as *evidence* of a given phase within it. Without
that, item revision has nothing to revise against except intuition — the same
failure mode that produced v1. One paragraph per rhythm, derived from the
phase criteria in `docs/ARA-framework-v2.md` §S5.1–S5.3 applied to each
rhythm's own §S3.x material.

**Water Rhythm.** Phase is not the parameter reading itself but the keeper's
relationship to it: whether readings are tracked as trajectory or read as
isolated snapshots (§S3.1), whether a stable-but-published-suboptimal reading
is tolerated rather than chased, and whether dissolved oxygen is recognised as
a distinct, undertested variable. Cycle-completion status is a system fact,
not a facet of this construct — it is the gate in front of it (S4). Observable
facets: testing regularity; trend- vs snapshot-based interpretation; tolerance
for stable-suboptimal readings; recognition of the DO/surface-gasping signal.

**Biological Rhythm.** Phase is the tank's microbial depth (§S2.4, §S3.2) and
whether keeper habits protect or disrupt it. Genuine Mature Phase is what
§S5.7 names ecological forgiveness — demonstrated recovery from an ordinary
lapse, not clean test-kit numbers (the false-maturity trap, §S5.5). Observable
facets: reading biofilm as construction rather than contamination; substrate
handling that avoids disturbing a developing community; post-disruption
recovery behaviour; the keeper's own belief about what maturity consists of;
filter-media handling that preserves rather than resets the bacterial colony.

**Environmental Rhythm.** Phase is whether light, flow, hardscape and
temperature are managed as ecological infrastructure or left as background
(§S3.3). Observable facets: photoperiod consistency; recognition of irregular
light as a chronic-stress source, not a cosmetic one; restraint around
rearranging established hardscape; attention to flow dead-spots; *confirmed*
rather than assumed temperature stability.

**Livestock Rhythm.** Phase is how early and how completely behavioural
signals are read before they surface elsewhere — the framework's claim that
behaviour precedes physiology precedes measurable chemistry (§S3.4, H-L1).
Observable facets: knowledge of an individual animal's baseline; response to
one preclinical sign (watching for a pattern, neither ignoring nor
overtreating it); belief in cumulative sub-threshold stress; expectation that
a new addition disrupts the whole existing community, not just the newcomer;
behaviour checked before water chemistry.

**Keeper Rhythm.** Phase is the keeper's honesty about their actual, not
intended, pattern of care — this scale operationalises the §S4.5
self-assessment tool almost verbatim. Observable facets: awareness of
water-change-interval drift; knowledge of the last filter check; feeding
precision; quality of daily observation (reading vs glancing); whether
automation is verified or left unattended.

### S11.2: Item Type Reclassification — all 25 items

S3/S4's finding was that 25 items of at least three measurement types were
summed into one score. The fix is not one uniform format for all 25 — it is
naming the types and treating each on its own terms.

| Type | Meaning | Treatment |
|---|---|---|
| **STATE/GATE** | describes the tank, not the keeper | unchanged, unscored (S4) |
| **NOM** | discrete strategies with no natural more/less axis | reported as a response distribution, never summed |
| **ORD** | a genuine low-to-high axis (frequency, precision, recency) | candidate for explicit ranked anchors |
| **KNOW** | one framework-keyed correct answer; other options are wrong beliefs, not "less aligned" ones | reported as an accuracy rate, never a degree |

**The NOM/KNOW line, stated as a rule** (settled 2026-09-06, resolving both
judgment calls flagged when this table was first drafted): nearly every item
in this instrument has a framework-preferred answer — that alone does not
make it KNOW. The test is what the *wrong* options represent. If they are
false beliefs about how the system works (biofilm is contamination; zero
readings mean maturity), the item is KNOW. If they are alternative actions or
priorities that are merely less aligned — not factually wrong, just a
different choice (test the water first instead of watching the animal;
push forward after a disruption instead of easing back) — the item is NOM.
Stem shape is a reliable tell: "what's actually happening" or "what would you
expect" asks for a belief (KNOW); "what do you check first" or "what do you
do" asks for an action (NOM), even when the framework ranks one action above
the others.

| Rhythm | Item | v1 type (S3) | v2 type | Note |
|---|---|---|---|---|
| Water | `cycle-status` | factual system state (gate) | STATE/GATE | outside the taxonomy by design |
| Water | `testing-habit` | behavioural frequency | ORD | routine>reactive>rarely is a clean frequency axis; `too-new` is N/A, not a fourth degree |
| Water | `trend-read` | interpretive strategy | ORD | trajectory>ideal-number>no-comparison is a genuine trend-literacy axis (§S3.1); `unsure` is N/A |
| Water | `stable-response` | situational judgment | NOM | four qualitatively different response strategies; `would-research` and `multiple-fixes` score identically in v1 despite being opposite in impulsivity — a sign this was never one axis |
| Water | `oxygen-read` | domain knowledge | KNOW | `oxygen-aware` is the framework's stated correct read (§S3.1, §S9.2); the rest are wrong causal attributions |
| Biological | `biofilm-read` | judgment + knowledge | KNOW | `leave-it` is factually correct — biofilm is not contamination; the hybrid label in S3 resolves to KNOW outright |
| Biological | `substrate-clean` | behavioural practice | NOM | `spot-clean` and `never-touch` are both endorsed by the framework's own text as roughly equally protective — no clean monotonic order, so v1 scoring one above the other is a scoring-convention artifact, not a construct fact |
| Biological | `recovery-awareness` | situational judgment | NOM | three genuinely different post-disruption strategies (ease back / resume / compensate), not degrees of one variable |
| Biological | `maturity-marker` | conceptual knowledge | KNOW | `resilience` is the framework's named correct answer (§S5.7); `zero-readings`/`time-elapsed` are the false-maturity trap named explicitly wrong (§S5.5) — the hypothesis inventory's paradigm belief-item (H-P4) |
| Biological | `filter-media` | behavioural practice | KNOW | one factually protective method (tank-water rinse); the other two are factually damaging to the colony, not merely less aligned |
| Environmental | `light-schedule` | behavioural practice | ORD | timer>by-feel-consistent>by-feel-variable>rarely-tracked is a clean consistency axis |
| Environmental | `light-consequence` | domain knowledge | KNOW | `chronic-stress-aware` is the framework's stated consequence (§S3.3); `algae-only` is true-but-incomplete, the rest are absent/wrong beliefs |
| Environmental | `hardscape-moves` | behavioural frequency | ORD | rarely>occasional>frequent is a clean frequency axis; `no-hardscape` is N/A |
| Environmental | `flow-deadspots` | attention practice | ORD | checks-regularly>notices-eventually>rarely-looks>never-considered is a clean attention-frequency axis |
| Environmental | `temp-stability` | monitoring practice | **split** | conflates two constructs: actual temperature stability (a system-state fact) and monitoring diligence (a keeper-practice fact) — see callout below |
| Livestock | `observation-baseline` | self-reported capability | ORD | yes>maybe>only-dramatic>dont-track is a clean noticing-capability axis |
| Livestock | `preclinical-signs` | situational judgment | NOM | the aligned answer (`watch-pattern`) sits in the *middle*; `dismiss-single` and `immediate-treatment` are opposite failure directions, and `wouldnt-notice` is a separate detection-failure axis — see callout below |
| Livestock | `stress-accumulation` | conceptual knowledge | KNOW | `chronic-cumulative` is the borrowed physiology claim (H-L2) asserted as fact; the other three are named wrong beliefs |
| Livestock | `new-addition-disruption` | expectation / knowledge | KNOW | `expects-disruption` is the framework's stated fact about social geometry (§S3.4, H-L3); the rest are wrong expectations |
| Livestock | `behaviour-vs-chemistry` | prioritisation strategy | NOM | **resolved 2026-09-06**: an action stem ("what do you check first"), not a belief stem — its three non-preferred options are alternative priorities, not false beliefs about mechanism. H-L1 (borrowed) gives the framework a favoured order, but the type rule above turns on what the *wrong* options represent, not on whether a preferred answer exists — parallel to `stable-response` and `preclinical-signs`, also NOM despite each having a framework-favoured option |
| Keeper | `wc-interval-awareness` | self-monitoring / recall | NOM | **confirmed 2026-09-06**: H-K2/K3's claim is that drift-awareness is categorical — noticed vs unnoticed — not a matter of how much interval has drifted, so no ORD conversion applies. Remains the instrument's strongest existing framework fit; lowest priority for any wording change. (`same-or-decided` bundles two different scenarios — no drift, and deliberate change — as equally aligned; defensible under S4.1's intentional-intensity carve-out, but noted here as a possible future refinement, not a blocker.) |
| Keeper | `filter-check-date` | self-monitoring / recall | ORD | recent>a-while>no-idea is a clean recency axis; `new-tank` is N/A |
| Keeper | `feeding-precision` | behavioural practice | ORD | measured>estimated-consistent>estimated-variable>not-tracked is a clean precision axis |
| Keeper | `observation-quality` | self-reported attention quality | ORD | reading>checking>glancing>rarely-look is a clean attention-quality axis |
| Keeper | `automation-reliance` | practice + stance | NOM | `trust-but-verify` and `set-and-forget` are different stances toward the same practice, not different amounts of it; `no-automation` is N/A |

**Callout — `temp-stability` should split into two items.** A keeper can have
a genuinely stable tank they never check, or an unstable one they check
constantly; the current four options collapse both facts onto one axis.
Proposed v2: one STATE item (how much the temperature actually moves, best
honest estimate — a system fact) and one ORD item (how often it is actually
checked — a monitoring-diligence fact), mirroring the existing separation
between `cycle-status` (state) and the rest of Water Rhythm (practice).

**Callout — `preclinical-signs` cannot be forced onto a single Likert axis.**
The aligned response sits between two opposite failure modes
(under-responding and over-responding), with a third, orthogonal
detection-failure option (`wouldnt-notice`) alongside them. A frequency-style
scale has no way to place "correct" in its middle without inventing a false
low-to-high order the framework does not claim. This is the clearest case in
the instrument of an item that must stay NOM.

**Callout — `substrate-clean`'s options are not monotonic.** `never-touch`
is not "less aligned" than `spot-clean`; the framework text treats both as
acceptable, differing mainly in how actively detritus is managed. Scoring
`spot-clean` above `never-touch`, as v1 does, encodes an order the framework
never asserts.

### S11.3: v2 Scoring / Reporting Model

Replace the blended per-rhythm 0–10 (0–8 for Water, behind its gate) sum with
three separate, type-pure figures per rhythm:

- **Practice Consistency** — each ORD item reported on its own ranked scale.
  Not collapsed into one composite number across items with different
  anchors unless a later step establishes they share a common latent trait —
  not assumed here.
- **Strategy Profile** — the response distribution across that rhythm's NOM
  items, reported as frequencies per option, never summed into a score. This
  is descriptive, and it is where a future typology (which strategies
  co-occur) could eventually come from — a later exploratory step, not
  something the instrument itself needs to compute.
- **Knowledge Accuracy** — percentage of that rhythm's KNOW items answered
  with the framework-keyed response.

**Reader-facing note.** This restructures the analysis layer; it does not by
itself require changing what a respondent sees. S1's "stay reflective"
decision survives either way — the existing single Early/Developing/Mature
reflection could continue to be computed from a simplified version of the
same logic, or from Practice Consistency and Knowledge Accuracy alone (NOM
items have no scored "correct" direction to contribute to a single number).
Which of those the reader sees is an implementation-time decision, not fixed
here.

### S11.4: What This Does Not Change

- The `cycle-status` gate (S4) is untouched.
- No scored item is removed, and no new scored item is added except the
  `temp-stability` split. Hypothesis-inventory coverage is unaffected — this
  is a measurement-quality pass, not a content pass. Closing coverage gaps
  (H-A6 cross-rhythm buffering, the S8 pathway claims) is a separate,
  later decision.
- The seven unscored context items (`tank_volume`, `tank_age`, `outcome_slip`,
  `outcome_intervention`, `care_intent`, `stocking_change`, `life_change`) are
  untouched — they were never part of the type-blending problem.
- The belief-for-behaviour substitution the hypothesis inventory names in its
  S7 item 4 (e.g. rewriting `maturity-marker` from *what do you think marks
  maturity* to *does your tank absorb a missed water change*) is a different,
  later revision track. Typing an item correctly as KNOW does not by itself
  convert it to a behaviour item — the two should not be conflated into one
  pass.

### S11.5: Does Any of This Actually Require New Wording?

Checked against the type table in S11.2: **mostly no.** Every item tagged ORD
already has a clean, narratively-encoded rank order in its existing four
options (see the "clean … axis" notes above) — the fix is tagging that order
explicitly in the scoring code (a ranked-anchor array per item, replacing the
uniform 2/1/0 weight-key mechanism every item currently shares regardless of
type), not rewriting respondent-facing text. Items tagged NOM keep their
existing wording outright — the change is in how their responses are
aggregated (S11.3), not in the item itself.

The one item that needs new text is `temp-stability`'s split (S11.2 callout).
Everything else is a scoring-code and reporting change.

**This revises the plan agreed earlier in this session.** The original
framing — restructure all 25 items, then pretest the result — assumed a
wording rewrite large enough to justify deferring the pretest until it was
done. Checked against actual item text, that assumption does not hold: the
rewrite is one new item, not twenty-five. The pretest's scope is therefore
still what `docs/rhythm-tracker-pretest-protocol.md` already named — the
eight originally flagged items — plus whatever wording the `temp-stability`
split produces. The re-scoping in S10 item 9 changed *when* the pretest runs
(after this section's construct definitions and type table are confirmed,
not before), not how much of the instrument it needs to cover.

### S11.6: Sequencing From Here

1. ~~Owner review of S11.1 and S11.2's two flagged judgment calls.~~
   **Resolved 2026-09-06** — both confirmed NOM, on the stated type rule
   (S11.2): `behaviour-vs-chemistry` is an action stem with non-belief wrong
   options; `wc-interval-awareness`'s claim is categorical, not a matter of
   degree. Construct definitions and the type table now stand without open
   judgment calls.
2. ~~Write~~ the `temp-stability` split. **Done 2026-09-06** (S9) — text
   written, translated, and shipped. **Pretest still outstanding** — the
   split's new text (`temp-check-freq` + `temp_swing`) should be added to
   `docs/rhythm-tracker-pretest-protocol.md`'s probe list alongside the
   original eight items; still needs people, not code.
3. ~~Rewrite each rhythm's `reflect()` function~~ to exclude NOM items from
   score/max. **Done 2026-09-06** (S9) — implemented as exclusion, not as the
   three-figure S11.3 report (see step 4's note on why).
4. Decide, at implementation time, what the single reader-facing phase
   reflection is computed from (S11.3's reader-facing note). **Resolved by
   the v2.0 implementation**: it stayed the existing single phase number,
   now computed from ORD+KNOW items only (NOM excluded) — the minimal change
   that fixes the type-blending defect without adding new UI. The fuller
   three-figure report (Practice Consistency / Strategy Profile / Knowledge
   Accuracy) remains available to a later *analysis* pass over the raw
   stored `answers`, using S11.2's type table — it does not require any
   further change to the live instrument, since raw per-item answers were
   already being collected.
5. ~~Version bump to v2 per S8~~ **Done 2026-09-06** — `v2.0`,
   `instrument_version` ships in the same commit, i18n rebuilt via
   `scripts/build-ryr-i18n.mjs`, S9 change-log entry written.

---

## S12: Data Pipeline — Formspree → Worker+D1 (2026-09-06)

**Status: implemented and shipped 2026-09-06.** Raised because Formspree's
actual notification behaviour for this form (does a submission email the
owner, or sit dashboard-only?) was an account-dashboard setting with no
trace in this repo — unlike everything else this record documents, it could
not be verified from git. The fix that removes the unknown is removing the
third party.

**What actually happened, briefly** (full detail stays in S12.2–S12.4 below,
written before implementation and left as the design record; this paragraph
is the after-the-fact summary): the account owner created the D1 database
and a Turnstile widget by hand in the Cloudflare dashboard and handed over
the `database_id` and site key; the WAF rate-limiting assumption in S12.2
turned out to be wrong once checked against the account's actual plan (see
the dated correction inline) and was replaced with Turnstile + Bot Fight
Mode + the in-Worker limiter instead, none of it gated by the rule quota
that turned out to be full. `worker/index.js`, `worker/wrangler.toml`,
`worker/schema.sql`, `articles/rhythm-tracker.html`, `_headers` (CSP, to
allow the Turnstile script/frame), and both translation files were updated
in the same change. **Not yet done**: the owner still needs to run
`wrangler secret put TURNSTILE_SECRET_KEY` — until then, `verifyTurnstile()`
in `worker/index.js` deliberately allows submissions through unverified
(see its comment) rather than silently rejecting everyone over a
deploy-ordering gap; and the historical-Formspree-data decision (S12.4 #4)
is still open.

### S12.1: Why this, why now

`worker/index.js` already exists, already auto-deploys on `worker/**` → `main`
(`.github/workflows/deploy-worker.yml`), and already proxies a
privacy-sensitive flow (Rhyssa chat) with an established CORS/rate-limit
pattern. Routing Rhythm Tracker's submissions through it removes Formspree
entirely rather than trading one opaque vendor for another — a Google
Forms/Sheets webhook or a different form host (considered and rejected when
this was first discussed) has exactly the same "settings live outside the
repo" property Formspree does.

**Scope: Rhythm Tracker only.** `share-photos.html`'s Formspree form is a
different case — it needs a human to be notified and to review submissions
(credit name is collected *to be published*, and links must actually be
opened and judged), which Formspree's dashboard/email currently does for
free. Migrating it would mean building a notification path (Cloudflare Email
Workers/Routing — itself first-party, not a new third party) **and** a
submission-review surface, which Worker+D1 alone doesn't give you. That is a
separate, larger piece of work and is deliberately out of scope here.

### S12.2: Target architecture

**Route:** `POST https://api.aquaticrhythm.com/forms/rhythm-tracker` — new
pathname branch in the existing Worker, same domain and CORS pattern `/chat`
already uses (`env.ALLOWED_ORIGIN` check, `Origin` must equal
`https://aquaticrhythm.com`; `/id/` and `/ja/` pages are the same origin,
just a different path, so no per-language CORS handling is needed).

The `/forms/*` path was chosen because `docs/waf-github-pages.md` §4
documents a rate-limiting rule **template** for exactly this shape of
endpoint (`/api/contact`, `/forms/*`, `/subscribe` — `>10 req/min/IP`,
Managed Challenge). **Corrected 2026-09-06, checked against the account's
actual dashboard**: that rule cannot be activated without a plan upgrade —
Security → WAF → Rate limiting rules shows `1/1 rules`, and the one slot is
already held by the `/chat` rule, with a locked "Upgrade plan" button on
anything further. This does not block the plan; it changes what "abuse
handling" means for this endpoint, and on inspection the WAF rule was never
actually load-bearing here the way it is for `/chat`.

**Why `/chat`'s WAF rule is load-bearing and this endpoint's would only be
nice-to-have.** The WAF doc's own text marks `/chat`'s rule "WAJIB, bukan
opsional" for one specific reason: `/chat` calls a *paid* upstream (the
Anthropic API), so a request spread across edge colos — which the in-Worker
limiter's per-isolate memory can't see — has a real cost per hit that
compounds while it's unblocked. `/forms/rhythm-tracker` calls nothing paid;
it writes one row to D1, which has a generous free tier. The worst case of
an attacker spread across colos is junk rows in an early-stage exploratory
dataset (S7's own framing), not a runaway bill. The WAF doc's own §4 already
places `/api/contact`/`/forms/*`/`/subscribe` in a separate, lower-urgency
bucket from `/chat` — this was true before the plan limit was discovered, it
just wasn't load-bearing to notice until the account's actual rule quota did.

**Revised abuse-handling stack, none of it gated by the rate-limiting rule
quota**: the in-Worker limiter alone (adequate given no paid-API exposure,
per the reasoning above) + **Cloudflare Turnstile** (a separate free
Cloudflare product, not counted against the WAF "Rate limiting rules" quota
shown as full) on the share/consent step + **Bot Fight Mode** (WAF doc §3 —
typically free on the same plan, a different feature from the paid-tier
rate-limiting rules) + the honeypot field below. Together these cover the
same failure mode (scripted spam floods) the WAF rule would have, without
needing a plan upgrade.

**No IP or identifying metadata persisted.** This is a decision, not an
oversight: S6 states plainly "No name, email, IP-linked identifier... is
collected," and D1 must keep that true, not just Formspree. `CF-Connecting-IP`
is used only transiently, in-memory, for the rate-limiter — exactly the
`/chat` pattern (§`isRateLimited`/`rateLimitHits`) — and is never written to
a row.

**D1 schema** (one table, columns mapped 1:1 from S6's payload table):

```sql
CREATE TABLE rhythm_tracker_submissions (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  respondent_id         TEXT NOT NULL,
  submission_index      INTEGER,
  instrument_version    TEXT NOT NULL,
  lang                  TEXT,
  submitted_at          TEXT NOT NULL,  -- client clock, kept for parity with Formspree-era rows
  received_at           TEXT NOT NULL DEFAULT (datetime('now')),  -- server clock, authoritative
  phases                TEXT,  -- JSON
  answers               TEXT,  -- JSON
  response_coding       TEXT,  -- JSON
  tank_volume           TEXT,
  tank_age              TEXT,
  temp_swing            TEXT,
  stocking_change       TEXT,
  life_change           TEXT,
  outcome_slip          TEXT,
  outcome_intervention  TEXT,
  care_intent           TEXT,
  days_since_first      TEXT,
  days_since_previous   TEXT,
  answer_dates          TEXT   -- JSON
);
CREATE INDEX idx_rts_respondent ON rhythm_tracker_submissions(respondent_id);
```

JSON-shaped fields (`phases`, `answers`, `response_coding`, `answer_dates`)
stay as TEXT columns holding JSON rather than being split into child tables —
D1 is SQLite, this is the low-friction option, and nothing here needs SQL-side
querying into those blobs yet. `received_at` is new: Formspree's own
received-date was already the fallback for identifying pre-v1.1 submissions
(S6), so a server-assigned timestamp neither Formspree nor a client clock can
misreport is a genuine improvement, not just parity.

**Abuse handling**, reusing patterns already in this codebase rather than
inventing new ones, and — per the correction above — not depending on the
WAF rate-limiting rule quota: the `/chat` in-memory rate-limiter
(`isRateLimited`/`rateLimitHits`), tuned lower since this is a free form
endpoint, not a paid-API call it protects; **Cloudflare Turnstile**, verified
server-side in the new handler before any D1 write (a free product,
independent of the WAF rate-limiting quota); **Bot Fight Mode** at the
account level (WAF doc §3); a honeypot field, mirroring `share-photos.html`'s
`_gotcha` pattern (new for Rhythm Tracker — it has none today); and payload
validation with length caps, mirroring `sanitizeTankContext`'s existing
approach of stripping unexpected fields.

**Response contract:** `{ok:true}` on success, `{error:'...'}` on failure —
the client's existing status-message logic (`Sending…` / `Sent — thank you` /
error text) needs its fetch target and encoding changed (FormData → JSON,
matching `/chat`'s convention), not its UI.

### S12.3: What changes where

- `worker/wrangler.toml` — add a `[[d1_databases]]` binding (owner
  provisions the database once; see S12.4).
- `worker/schema.sql` (new) — the table above.
- `worker/index.js` — new `url.pathname === '/forms/rhythm-tracker'` branch
  and handler (Turnstile verification, honeypot check, payload validation,
  then the D1 insert), alongside the existing `/health` and `/chat` ones.
- `articles/rhythm-tracker.html` — swap `RYR_FORMSPREE_ENDPOINT` for the new
  Worker URL; encode the payload as JSON instead of `FormData`; add the
  Turnstile widget + honeypot field to the share/consent markup.
- `.github/workflows/deploy-worker.yml` — add a `wrangler d1 migrations
  apply --remote` step, so future schema changes ship through the same
  PR → merge → auto-deploy path as everything else in this repo, rather than
  becoming a manual side-channel step.
- `docs/waf-github-pages.md` §4 — **no change needed**, per the correction
  above: the `/forms/*` template stays exactly as documented (prepared, not
  activated) for whenever a form endpoint's risk profile actually needs it.
  Worth a note there that Rhythm Tracker deliberately did not draw on it and
  why, so a future reader doesn't wonder whether it was forgotten.
- **This document, S6** — the consent text quoted there says *"It goes
  through Formspree, a third-party form service."* That sentence becomes
  false the moment this ships and is respondent-facing copy people actually
  read before consenting — it must be rewritten in the same change, not
  left stale. New version bump reasoning: see S12.6.

### S12.4: What only the account owner can do

None of this is something I can run from here — it needs Cloudflare account
access this session doesn't have:

1. ~~Create the D1 database once~~ **Done 2026-09-06** — `wrangler d1 create
   aquatic-rhythm-rhythm-tracker`, `database_id` handed over and bound in
   `wrangler.toml`.
2. **Confirm `CLOUDFLARE_API_TOKEN`** (already used by
   `deploy-worker.yml`) has D1 edit permission — may need its scope widened
   in the Cloudflare dashboard where the token was issued. **Still open** —
   only surfaces as a failure the first time `wrangler d1 migrations apply`
   (or an equivalent manual `wrangler d1 execute --file=schema.sql`) actually
   needs to run against the remote database; not yet confirmed either way.
3. ~~Create a Turnstile site key~~ **Done 2026-09-06** — site key handed
   over and now in `articles/rhythm-tracker.html`; **secret key still
   needs** `wrangler secret put TURNSTILE_SECRET_KEY` run by the owner
   (never pasted into chat or git) — until then `verifyTurnstile()` allows
   submissions through unverified rather than rejecting everyone, per its
   comment in `worker/index.js`. **Bot Fight Mode** (WAF doc §3) — confirm
   it's on; not verified either way yet.
4. **Decide on historical Formspree data** — export existing submissions
   from the Formspree dashboard (CSV; only the owner can reach it) if a
   unified dataset is wanted. I can turn that export into a `wrangler d1
   execute --file=import.sql` migration once handed the file. **Still
   open.**

### S12.5: Decisions (implemented on the recommended default; not all explicitly re-confirmed)

Implementation proceeded on these once the owner started executing the
account-side steps (creating D1, creating Turnstile) without objection —
worth recording plainly that "proceeded without objection" and "explicitly
confirmed" are not the same thing, so a future reader doesn't read more
agreement into this than actually happened:

- **No IP or identifying metadata stored at all** — implemented this way
  (`worker/schema.sql`'s header comment states it explicitly); matches S6's
  existing promise.
- **CLI-based data access** (`wrangler d1 execute ... --json`) — no
  admin/export page was built; this is the access path until/unless one is
  requested.
- **Historical Formspree submissions** — not yet decided (S12.4 #4, still
  open); nothing has been imported.
- **Cut over directly**, no dual-write period — implemented this way.
  **Not yet verified with one real test submission**, because
  `TURNSTILE_SECRET_KEY` hasn't been set yet (S12.4 #3) — do that end-to-end
  check as part of setting it, not as a separate step.

### S12.6: Versioning

Per S8, this is **not** an `instrument_version` bump on its own — no item,
wording, scoring, or question changes. It gets a dated note in S6 instead,
since the transmission mechanism and the consent text describing it change
materially even though what is asked does not — the same distinction S8
already draws between "layout/styling/translation" (no bump) and
"the administered questionnaire" (bump).
