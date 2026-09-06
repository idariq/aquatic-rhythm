# Rhythm Tracker — Instrument Development Record

## Internal Reference Document — Aquatic Rhythm

**Instrument:** Rhythm Tracker (`articles/rhythm-tracker.html`)
**Instrument version:** v1.4
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
6. **Write operational construct definitions** per rhythm (S2), derived from
   item 5. Item revision without them repeats the original error.
7. **Resolve the §S4.5 contradiction** — Keeper items are scored against a
   framework passage that disclaims correct answers.
8. **Decide the instrument's shape.** The reflective surface and a measurement
   instrument pull in opposite directions. A two-layer design — uniform scored
   items carrying the measurement load, reflective vignettes retained for the
   reader but explicitly unscored — preserves both. Governs items 6 and 7.
9. **Cognitive pretesting** with real aquarists. Under the exploratory purpose
   this is the highest-value remaining step: if respondents systematically
   misread an item, the resulting picture is a picture of misreading, and no
   later analysis recovers it. Statistical work can wait; this cannot.

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
