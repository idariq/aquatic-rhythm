# ARA Hypothesis Inventory

## Internal Reference Document — Aquatic Rhythm

**Companion to:** `docs/rhythm-tracker-instrument.md`
**Source of claims:** `docs/ARA-framework-v2.md` (v2.0)
**Instrument assessed:** Rhythm Tracker v1.4 (25 scored items + 7 unscored context items)
**Last revised:** 2026-09-06 — coverage re-scored after v1.3 and v1.4 (see S9, S10)
**Written:** 2026-09-06

---

## S1: Why This Document Exists

The Rhythm Tracker's items are mapped to framework *sections* — descriptive
content about each rhythm. They have never been mapped to **propositions that
could turn out to be false**. Those are different things, and only the second
kind can be supported or undermined by data.

This document does the second mapping. It asks, of each assertion the framework
makes: could this be wrong, and would anything the tracker collects give a
signal about it?

The expected output was a list of gaps. That is what it produced — but the
largest gap is not the one anticipated, and it is structural rather than a
matter of missing items. See S5.

**This is not a research protocol.** Nothing here is pre-registered, no
predictions are committed to, and listing a claim as testable is not a plan to
test it. It is an audit of what the framework asserts and what the current
instrument can see.

---

## S2: Method

Claims were read out of `ARA-framework-v2.md` section by section and sorted
into four kinds:

- **Definitional** — fixes the meaning of a term (Early Phase *is* the period
  before cycle completion). Cannot be false, only more or less useful. Excluded
  from the inventory.
- **Normative** — states what a keeper ought to value. Outside empirical reach.
  Excluded.
- **Descriptive-empirical** — a claim about what keepers in fact do, know, or
  believe. Testable by survey. **The tracker's natural territory.**
- **Ecological-empirical** — a claim about how aquarium systems in fact behave.
  Testable only with system-state or outcome data over time.

Borrowed claims — those the framework attributes to outside literature rather
than to itself (S3.1's "well-established in aquaculture research", S3.4's
"current understanding of fish physiology") — are marked **[borrowed]**. They
are not ARA's to defend, but the framework's *reliance* on them is still worth
recording.

Each claim gets a stable id so later work can cite it without re-quoting.

---

## S3: The Inventory

Legend for the **Tracker** column:

| | |
|---|---|
| **direct** | an existing item measures this claim's subject |
| **partial** | an item touches it, but measures something adjacent (usually a belief where the claim is about behaviour, or vice versa) |
| **none** | no item gives any signal |

### S3.1: Foundational assumptions (S2.2)

| id | Claim | Kind | Tracker | Item |
|---|---|---|---|---|
| H-F1 | "Keeper behaviour is a variable in the system. When keeper rhythm changes, system rhythm changes." | ecological | none | — |
| H-F2 | A system in alignment "is more stable and requires less active management than a system that is technically correct but ecologically misaligned" | ecological | partial | `outcome_intervention` *(v1.3)* |
| H-F3 | "Most chronic aquarium problems are expressions of misalignment, not technical failure" | ecological (prevalence) | none | — |
| H-F4 | "Living systems do best when their needs arrive consistently and incrementally" | ecological | none | — |
| H-F5 | Technology-neutrality: a low-tech and a high-tech system "may both be aligned"; equipment is "evaluated relationally, not ideologically" | ecological (null) | partial | `automation-reliance` |

H-F2 is the framework's central claim. Before v1.3 nothing in the instrument
reached it at all; `outcome_intervention` now gives it a first, weak handle.

### S3.2: Water Rhythm (S3.1)

| id | Claim | Kind | Tracker | Item |
|---|---|---|---|---|
| H-W1 | "Parameter trajectory matters more than parameter value" | ecological | partial | `trend-read` (measures whether the keeper reads trends, not whether trends predict better) |
| H-W2 | "Stable suboptimal outperforms unstable optimal" **[borrowed]** | ecological | partial | `stable-response` (measures the keeper's stated response, not the outcome) |
| H-W3 | "Most hobbyists test nitrogen cycle parameters but not dissolved oxygen" | **descriptive** | partial | `oxygen-read` (measures DO *reasoning*, not DO *testing*) |
| H-W4 | Early-morning surface gasping is "often misread as disease" | **descriptive** | **direct** | `oxygen-read` |
| H-W5 | Diurnal pH swings of 0.3–0.8 units are normal in planted/CO₂ systems | ecological (quantitative) | none | — |

### S3.3: Biological Rhythm (S3.2, S2.4)

| id | Claim | Kind | Tracker | Item |
|---|---|---|---|---|
| H-B1 | Biofilm "often concerns new keepers who interpret it as contamination" | **descriptive** | **direct** | `biofilm-read` |
| H-B2 | Substrate communities "take months to establish and can be significantly disrupted by deep substrate cleaning" | ecological | partial | `substrate-clean` (behaviour only) |
| H-B3 | After disruption "the system will behave more like an earlier phase during this recovery window" | ecological | partial | `recovery-awareness` (measures intended response, not system behaviour) |
| H-B4 | "Biological rhythm cannot be read by nitrogen cycle testing alone" | ecological | partial | `maturity-marker` |
| H-B5 | A two-year-old tank "has biological depth that cannot be replicated by technical replication of its parameters" | ecological | none | — |

### S3.4: Environmental Rhythm (S3.3)

| id | Claim | Kind | Tracker | Item |
|---|---|---|---|---|
| H-E1 | Photoperiod consistency is "a more significant keeper variable than most hobbyists recognise" | **descriptive** + ecological | partial | `light-consequence` (reaches the recognition half only) |
| H-E2 | Irregular light cycles produce chronic stress "in colour fading, reduced feeding response, and increased susceptibility to disease" | ecological | none | — |
| H-E3 | Moving hardscape disrupts social geometry; in territorial species "this disruption can trigger conflict cascades" | ecological | partial | `hardscape-moves` (frequency only) |
| H-E4 | "Uneven flow creates dead spots where detritus accumulates and oxygen is low" | ecological | partial | `flow-deadspots` (attention only) |

### S3.5: Livestock Rhythm (S3.4)

| id | Claim | Kind | Tracker | Item |
|---|---|---|---|---|
| H-L1 | "Behavioural changes precede physiological changes, which precede measurable chemical changes" **[borrowed]** | ecological | partial | `behaviour-vs-chemistry` (priority belief, not sequence) |
| H-L2 | Chronic sub-threshold stressors are cumulative **[borrowed]** | ecological | partial | `stress-accumulation` (belief only) |
| H-L3 | Adding fish stresses "all tank inhabitants, not just the new arrivals" | ecological | partial | `new-addition-disruption` (expectation only) |
| H-L4 | The seven listed preclinical indicators, "together, or persisting over 24–48 hours", represent a pattern worth investigating | ecological | partial | `preclinical-signs` |

### S3.6: Keeper Rhythm (S4)

| id | Claim | Kind | Tracker | Item |
|---|---|---|---|---|
| H-K1 | Capacity creep is "one of the most common causes of chronic aquarium problems" | ecological (prevalence) | none | — |
| H-K2 | Capacity creep is "one of the least recognised" | **descriptive** | **direct** | `wc-interval-awareness` |
| H-K3 | Capacity creep "is difficult to detect from inside it because each new interval becomes the new baseline" | **descriptive** | **direct** | `wc-interval-awareness` — the `drifted-unnoticed` / `drifted-aware` split is exactly this distinction |
| H-K4 | The four named indicators co-occur as a syndrome | **descriptive** | **direct** | 4 of the 5 Keeper items are these indicators |
| H-K5 | "Automation executes but does not observe"; a keeper relying on it "must observe with greater intentionality, not less" | ecological | partial | `automation-reliance` |
| H-K6 | Manual schedule assessment "undercounts" the capacity of keepers with maintained automation | **descriptive** | partial | `automation-reliance` |
| H-K7 | Every tank has a minimum viable care level, below which "the system begins to drift" | ecological | none | — |
| H-K8 | Life changes disrupt keeper rhythm; overcorrection on return "can destabilise a system that has equilibrated around the reduced inputs" | ecological | partial | `life_change` *(v1.4)* — reaches the disruption, not the overcorrection |

H-K2/K3/K4 are the strongest instrument–claim fit in the whole framework. This
is not a coincidence: the Keeper items were operationalised directly from S4.5.

### S3.7: Phases (S5)

| id | Claim | Kind | Tracker | Item |
|---|---|---|---|---|
| H-P1 | The cycle "typically completes in three to eight weeks in an uncycled setup" | ecological (quantitative) | none | — |
| H-P2 | "The second week often produces the highest ammonia and nitrite peaks" | ecological (quantitative) | none | — |
| H-P3 | New keepers "intervene heavily at exactly the moment when stability and patience are most needed" | **descriptive** | partial | `stable-response` (asks about a stable-but-off parameter, not an Early-Phase peak) |
| H-P4 | Mature Phase signs: stable ≥6 months, settled animals, recovery without intervention, visible biological depth | ecological (criteria) | partial | `maturity-marker` (belief about markers, not the markers themselves) |
| H-P5 | A false-mature tank "will often fail unexpectedly when stocking is increased, when the keeper's rhythm changes, or when a disruption occurs" | ecological | partial | `outcome_slip` *(v1.3)* |
| H-P6 | False vs genuine maturity "is difficult to assess with test kits… better read through the system's response to disruption" | ecological | **direct** | `outcome_slip` *(v1.3)* — asks exactly what the system did after a slip |
| H-P7 | Phase regression is recoverable, and "the biology… can re-establish more quickly the second time" | ecological | none | — |
| H-P8 | Ecological forgiveness is "built gradually, through consistent, modest care sustained over months and years"; episodic care never develops it | ecological | **direct** | `outcome_slip` *(v1.3)* — measures forgiveness as recovery behaviour, not as a belief about maturity |

**On H-P8.** Forgiveness is what S5.7 says *defines* genuine Mature Phase, and
the only item near it asks what the respondent *believes* marks maturity — not
whether their own tank absorbs a missed water change. The framework also names
this claim's operationalisation problem itself: classification "requires
criteria set before a disturbance occurs, not after — otherwise any system that
happens to recover can be called forgiving after the fact." That warning applies
directly to any future attempt to measure it here.

### S3.8: Alignment (S6)

| id | Claim | Kind | Tracker | Item |
|---|---|---|---|---|
| H-A1 | "A tank in alignment tends toward stability without active effort" | ecological | partial | `outcome_intervention` *(v1.3)* |
| H-A2 | *Timing before Technique* — "the same action carries different ecological consequences at different moments" | ecological | partial | `stable-response` |
| H-A3 | *Capacity before Ambition* — "a system that survives realistic keeper behaviour is more ecologically valuable than one that thrives only under ideal conditions" | normative + ecological | partial | `stocking_change` *(v1.4)* |
| H-A4 | *Consistency before Intensity* — "a 20% water change every week produces a more stable chemical environment than a 50% water change once a month, even at identical total volume replaced" | ecological (quantitative) | none | — |
| H-A5 | *Observation before Correction* — premature action "frequently produces more disruption than the signal that prompted it" | ecological | partial | `stable-response: multiple-fixes` |
| H-A6 | **Cross-rhythm buffering** — "a system with one weak rhythm may remain stable if the other four are strong. A system where all five are under pressure simultaneously has no cross-rhythm buffer" | ecological | partial | the five-rhythm profile itself |
| H-A7 | Visible problems "are rarely the origin of the disturbance they represent… downstream expressions of misalignment that began in another rhythm" | ecological | none | — |
| H-A8 | The 3-day / 7-day signal rules | ecological (quantitative) | none | — |
| H-A9 | "Five minutes done this way is more valuable than an hour of anxious scrutiny" | ecological | partial | `observation-quality` |
| H-A10 | Observation requires a baseline; four named practices build it (photographs, behavioural mapping, same-time habit, fresh-eyes review) | ecological | partial | `observation-baseline` (asks whether a baseline exists, not how it was built) |

**H-A4 is the most directly falsifiable claim in the framework** — a specific,
quantitative, controlled comparison. It needs two tanks and a test kit, not a
survey.

**H-A6 is the best structural match to the instrument.** A five-rhythm profile
per respondent is exactly the shape of data the buffering claim is about. What
is missing is the other half: an outcome to check the profile against.

### S3.9: Pathways and false signals (S8, S9)

| id | Claim | Kind | Tracker | Item |
|---|---|---|---|---|
| H-X1 | Slow drift: Keeper → Water → Livestock, over weeks to months | ecological (causal) | none | — |
| H-X2 | Environmental instability → immune depletion → apparent-sudden disease | ecological (causal) | none | — |
| H-X3 | Biological overload → self-reinforcing drift → lost resilience | ecological (causal) | partial | `stocking_change` *(v1.4)* — reaches stocking creep, the common route in, not the drift it claims to cause |
| H-X4 | False maturity → crisis on disruption | ecological (causal) | none | — |
| H-X5 | Social disruption → aggression/avoidance → stress, misread as disease | ecological (causal) | none | — |
| H-X6 | Diatoms are normal in months 1–4 and "typically recede naturally" | ecological | none | — |
| H-X7 | White cloudiness self-resolves in 1–2 weeks; intervening "can extend it" | ecological | none | — |
| H-X8 | The "panic window" — the first 4–6 weeks contain the highest density of unnecessary intervention | **descriptive** | none | — |
| H-X9 | Iteration windows: 3–7 days minor, 2–4 weeks significant | ecological (quantitative) | none | — |

The framework itself marks S8's pathways as "worked examples of reading
backwards from symptom to origin, not as a fixed or complete taxonomy." They
are the framework's causal model, and are the least reachable part of it.

---

## S4: Coverage

**58 claims inventoried.** By what the instrument can see, before and after the
v1.3 outcome items:

| | v1.2 | v1.3 | v1.4 |
|---|---|---|---|
| **direct** | 5 | **7** | 7 |
| **partial** | 25 | 26 | **29** |
| **none** | 28 | **25** | **22** |

By kind, at v1.4:

| Kind | Total | direct | partial | none |
|---|---|---|---|---|
| Descriptive-empirical (about keepers) | 10 | 5 | 4 | 1 |
| Ecological-empirical (about systems) | 48 | **2** | 25 | 21 |

The two ecological claims now reached directly are H-P6 and H-P8 — false
maturity and ecological forgiveness — both via `outcome_slip`, which asks what
the system did after care slipped rather than what the keeper believes about
maturity. That is the whole of the change: three claims moved off *none*, two
moved up to *direct*, and 24 ecological claims remain unreachable.

*(Counts verified programmatically against the tables above, not by hand — the
id, kind and coverage columns are parsed and tallied, so they stay checkable as
the inventory grows.)*

**Before v1.3, all five claims the tracker reached directly were claims about
keepers, and zero of the 48 ecological claims were directly reachable.** The
*partial* rows were partial in the same direction every time: the item measured
what the keeper *believes, notices, or intends*, where the claim is about what
the *system does*.

v1.3 breaks that pattern in two places and v1.4 narrows it further, but neither
undoes it. **21 ecological claims still have no signal at all**, and most of the
rest are still read through the keeper rather than the system. The 7 direct hits
are unchanged since v1.3: v1.4 moved three claims off *none*, it did not make
any newly reachable in full.

Put the other way round: on its own territory — what keepers know and do — the
instrument does well, reaching 9 of 10 descriptive claims at least partially.
It is not a weak instrument. It is a well-aimed instrument pointed at a
different target from the one the framework's claims sit on.

---

## S5: The Structural Gap

*Written against v1.2. v1.3 addressed the first two consequences partially and
the third not at all; the changes are marked inline.*

The mismatch is not a shortage of items. It is that **the instrument and the
framework are about different things.**

Of the 25 scored items, at most two ask about the state of the tank
(`cycle-status`, and `temp-stability` partly). The remaining 23 ask about the
keeper — their habits, knowledge, beliefs, and attention. The framework,
meanwhile, is overwhelmingly a set of claims about how aquarium *systems* behave
over time. **v1.3 does not change this**: the three new context items sit
outside the scored set, so the instrument proper is still 23-of-25 about the
keeper.

Three specific consequences:

**No outcome variable exists.** Nothing collected says whether the tank is doing
well. Without that, every ecological claim is unreachable in principle, however
many items are added — a survey of practice cannot show that the practice works.
**Partly addressed in v1.3** by `outcome_slip` and `outcome_intervention`. Both
are self-reported and retrospective, which is weak evidence for an outcome; the
difference they make is between *no* signal and *some*, not between weak and
strong. `outcome_slip` in particular asks a respondent to recall and classify a
past recovery, which is exactly the after-the-fact reasoning S5.7 of the
framework warns against — see the note on H-P8.

**No time dimension exists.** Every claim in S3.9, and most in S3.7, is about
sequence: X drifts, then Y appears, then Z becomes visible. A single
cross-sectional snapshot cannot see a sequence. **Plumbing added in v1.3**:
`submission_index`, `days_since_first`, `days_since_previous`, per-rhythm
`answer_dates`, and a return invitation. But plumbing is not data — until repeat
submissions actually accumulate, every sequence claim stays unreachable, and
none of the S3.9 rows moved.

**Belief is being measured where behaviour is claimed.** `maturity-marker` asks
what the respondent thinks marks maturity; H-P4 is about what actually marks it.
`stress-accumulation` asks whether they believe stressors accumulate; H-L2 is
about whether stressors accumulate. This substitution runs through most of the
*partial* rows, and it is the single most common defect the mapping exposed.

---

## S6: Validity Threats This Exposed

**Intent is invisible, and the framework says intent matters.** S4.1 carves out
"intentional intensity" and S5.6 carves out "intentional phase reset" as
explicitly *not* misaligned — a competition aquascaper working a high-tempo
growth phase, a breeder conditioning a spawning tank, a quarantine tank never
meant to mature. The instrument has no way to detect that a respondent's
practice is deliberate, and would score all three as drifting. The framework
takes care to protect these keepers; the instrument does not.

**Stocking is absent entirely.** No item asks about stocking level, stocking
changes, or species mix — despite stocking carrying *Capacity before Ambition*
(H-A3), the biological-overload pathway (H-X3), false-maturity failure (H-P5),
and the Developing Phase caution about "sudden stocking additions". It is one of
the framework's most load-bearing variables and the instrument does not mention
it once.

**Life-change disruption is absent.** S4.4 is a whole section on travel, illness
and work pressure as normal, expected disruptions to keeper rhythm. No item
asks. A keeper mid-disruption is scored as if their current rhythm were their
settled one — which is precisely the misreading S4.4 exists to prevent.

**Water Rhythm's phase gate rests on an unmeasured construct.** The gate uses
cycle status, which S5.1 defines the phase boundary by — sound. But the Mature
threshold above it is a knowledge-and-habit score, while S5.3's own Mature
criteria are system properties (stable 6 months, recovers unaided, visible
biological depth). A well-read keeper with a young tank can score Mature.

---

## S7: What This Implies for Revision

Ordered by how much they change what the data can support, not by cost.

1. ~~Add an outcome measure, however crude.~~ **Done in v1.3** — `outcome_slip`
   and `outcome_intervention`, both optional and unscored. A mortality item was
   considered and deliberately left out (see S9).
2. ~~Invite repeat submission.~~ **Plumbing done in v1.3**; the data itself does
   not exist yet and will take months to accumulate.
3. ~~Add stocking and life-change items.~~ **Done in v1.4**, both unscored (S10).
4. **Convert belief items to behaviour items where the claim is about
   behaviour.** In shape: from *what do you think marks maturity* to *does your
   tank absorb a missed water change*. (Both are paraphrases of an item's intent,
   not quotations.) This is a rewrite of existing items rather than an addition,
   and it directly addresses the most common defect in S5.
5. ~~Add an intent question.~~ **Done in v1.3** — `care_intent`, including an
   option for a deliberately intensive phase. It is recorded, not scored, so it
   flags the carve-out for analysis without changing anyone's reflection.
6. **Leave the quantitative ecological claims alone.** H-A4, H-P1, H-P2, H-W5,
   H-A8, H-X9 are tank experiments, not survey questions. They belong in a
   different study and should not distort this instrument.

---

## S8: Honest Statement of What This Inventory Is

The claims were extracted and classified by an AI assistant (Claude, via Claude
Code) reading `ARA-framework-v2.md`, in the session recorded in git. No
independent reviewer has checked either the extraction or the classification.
Two judgements in particular are contestable and should be reviewed by the
framework author:

- **What counts as a distinct claim.** Some of the 41 could reasonably be merged
  or split; the count is a convenience, not a fact about the framework.
- **The direct / partial / none calls.** These reflect one reading of what each
  item measures. `oxygen-read` is called *direct* for H-W4 and *partial* for
  H-W3 on the grounds that it tests reasoning rather than testing behaviour —
  an arguable line.

Nothing here has been pre-registered, and the coverage table should not be
quoted as a validation result. It is a map of what has not been done.

**Quotation accuracy was checked programmatically**, not by eye: every quoted
fragment of 20 characters or more was matched against `ARA-framework-v2.md`.
All matched, allowing for case changes where a quote is embedded mid-sentence.
Re-run that check after editing this file — a paraphrase in quotation marks is
exactly the error the check exists to catch, and it caught one on the first
pass.

---

## S9: v1.3 — What Changed and What It Bought

Three optional, **unscored** context items were added to the share step, plus
the plumbing for repeat submission. Scoring was not touched: an exhaustive
re-run of all 5,120 answer combinations against the v1 reference produced 0
mismatches, confirming the outcome items feed nothing.

| Item | Reaches | Why unscored |
|---|---|---|
| `outcome_slip` | H-P6, H-P8 (**direct**), H-P5 | It is the outcome. Scoring it would fold the outcome into the predictor and rebuild the circularity the instrument record warns about. |
| `outcome_intervention` | H-F2, H-A1 | Same. |
| `care_intent` | the S6 intent threat | Intent is a control variable, not a virtue. |

**A mortality item was considered and left out.** It would be the most concrete
outcome available, and it was rejected on two grounds: ARA's claims are about
stability and resilience rather than mortality, so loss is a blunt proxy for
what the framework actually asserts; and the site's own position (`grief-
without-a-mistake`) is that a loss is not evidence of a mistake, which an audit-
shaped question would quietly contradict. This is a scoping decision, not an
oversight — if a later study needs a hard outcome, this is the obvious first
place to revisit, and the reasoning above is what would have to be traded away.

**What the repeat plumbing records.** `submission_index`, `days_since_first`,
`days_since_previous`, and per-rhythm `answer_dates`. The last of these exists
because a returning respondent may revise one rhythm and share all five, four of
which are months old. Without dates that submission looks uniformly fresh;
with them, mixed freshness is a visible fact rather than a hidden one.

**What it did not buy.** No S3.9 pathway row moved, and 24 ecological claims
remain at *none*. Stocking and life-change items (S7 item 3) were not added.
The belief-for-behaviour substitution (S7 item 4) is untouched — the three new
items sit alongside the 25, they do not fix them.

---

## S10: v1.4 — Stocking and Life Change

The two content holes named in S6 were the framework's most load-bearing absent
variables. Both are now asked, both **unscored**, in the same context block as
the v1.3 items.

| Item | Reaches | Shape |
|---|---|---|
| `stocking_change` | H-X3, H-A3, and feeds H-P5 | Deliberately mirrors `wc-interval-awareness`: a *grown-and-I-knew* / *grown-more-than-I-realised* split. That aware-vs-unnoticed distinction is the instrument's single strongest existing fit (H-K3), and stocking creep is described in S8.2 in the same terms as capacity creep. |
| `life_change` | H-K8, and the S6 mid-disruption threat | Four options mapped onto S4.4's own three categories (short-term, extended, permanent) plus a *normal stretch* baseline. |

**Why stocking is asked as change rather than as level.** Self-reported
stocking density is close to meaningless without species, adult size and
filtration — "eight fish" says nothing on its own. What the framework actually
claims is about *creep*: "additions over time, each individually reasonable"
(S8.2). Asking the question the framework's claim is about, rather than the
question that sounds more quantitative, keeps the item honest about what it can
support.

**What `life_change` fixes and what it does not.** It resolves the S6 threat
that a keeper mid-disruption is scored as though their current rhythm were their
settled one — that is now a recorded fact rather than an invisible confound. It
does **not** reach the second half of H-K8, the claim that overcorrecting on
return "can destabilise a system that has equilibrated around the reduced
inputs". That would need a follow-up after the disruption ends, which is what
the repeat-submission plumbing exists for.

**Coverage effect:** three claims moved off *none* (H-K8, H-A3, H-X3 — the first
pathway row ever to move). No new direct hits. 21 ecological claims remain
unreachable.

**Confirmation that the v1.3 i18n refactor was worth it:** these two items
needed markup and translation keys only. `scripts/build-ryr-i18n.mjs` was not
edited, because it discovers labels by span id and options by option value. The
hardcoded list that would have needed updating no longer exists.