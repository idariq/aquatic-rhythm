# Rhythm Tracker — Language & Comprehensibility Review

## Internal Reference Document — Aquatic Rhythm

**Companion to:** `docs/rhythm-tracker-instrument.md`, `docs/rhythm-tracker-pretest-protocol.md`
**Instrument reviewed:** Rhythm Tracker v2.1 (25 scored items across 5 rhythms + 9 unscored context items)
**Written:** 2026-09-06
**Status:** Desk review. Not yet actioned — findings below are candidates for the author to accept, reject, or defer.

---

## S1: What This Is and Isn't

This is a **desk-based comprehensibility audit** of the instrument's actual wording — item text, sub-text, and option labels — across all three shipped languages (en source, id, ja). It asks one question: *would someone from a different background than the person who wrote this actually understand what's being asked?*

It is **not** the cognitive pretest. `docs/rhythm-tracker-pretest-protocol.md` already exists for that, and running real people through the instrument is still the only way to find out how it's *actually* misread, not just how it *might* be. This document exists to catch the cheap, obvious problems first — jargon, ambiguity, inconsistent difficulty across languages — so the pretest's limited sessions (recommended 5–8 people, per that protocol's S3) aren't spent rediscovering things a close read could have caught for free.

**Method:** every scored item's `text`/`sub`/option `l` (label) was extracted from the live EN source (`articles/rhythm-tracker.html`'s `RHYTHMS` object) and compared side by side with its `translations/id/rhythm-tracker.json` and `translations/ja/rhythm-tracker.json` counterparts. The unscored context fields (tank volume/age, `oxygen_testing`, etc.) were checked too, more briefly — their language is already plain and multiple-choice-concrete, and turned up nothing beyond what S3 notes below.

**What "different backgrounds" means here**, concretely: (1) fishkeepers newer to the hobby than the instrument assumes — someone who has never heard "gravel vac" said out loud; (2) readers whose first language isn't the one they're answering in, including English readers who are not native speakers; (3) readers without a science/technical background, for whom "respiration" or "pallor" are not everyday words even if they're not exotic vocabulary. It does **not** mean simplifying away content the framework genuinely needs (nitrite vs. nitrate has to stay precise — see S2.1).

---

## S2: Findings

### S2.1 — HIGH: nitrite/nitrate confusability, in all three languages, unavoidable in content

`cycle-status` (Water, item 1) asks whether "ammonia and nitrite have both settled at zero, with nitrate present and steady." Getting this right requires the reader to keep **nitrite** and **nitrate** distinct — two words that differ by one syllable, look nearly identical on the page, and are second-nature to distinguish only *after* someone already understands the nitrogen cycle (which is exactly the fact this item is trying to measure in the first place). This is not a hypothetical risk: confusing the two is one of the most common beginner errors in the hobby, precisely because the words are so visually and phonetically close.

The same shape of confusability exists in the other two languages, not just English:

- **id**: *nitrit* (nitrite) vs. *nitrat* (nitrate) — same one-letter difference, same risk.
- **ja**: 亜硝酸塩 (nitrite) vs. 硝酸塩 (nitrate) — the ja terms share the same 酸塩 root and differ only by the 亜 prefix, arguably an even smaller visual distinction than en/id.

**This isn't fixable by rewording** — the distinction is the content, not an accident of phrasing, and flattening it would make the item measure less than it currently does. What it *is* fixable by: naming it explicitly as something to watch for in the pretest. `docs/rhythm-tracker-pretest-protocol.md` §S5 does not currently list `cycle-status`, and probably should — specifically to ask a pretest participant to read the option back in their own words and see whether nitrite and nitrate get swapped.

### S2.2 — MEDIUM-HIGH: two technical terms kept as untranslated jargon in all three languages

Two words appear in scored-item text/sub-text, unglossed, and are carried into id/ja as direct borrowings rather than translated into plainer vocabulary a general keeper would use day to day:

| Term | en | id | ja | Where |
|---|---|---|---|---|
| impeller | "media, flow, impeller" | "media, aliran, **impeller**" | "ろ材や水流、**インペラー**" (katakana loanword) | `filter-check-date` (Keeper, item 2) |
| detritus | "Where detritus tends to collect" | "Tempat **detritus** biasanya menumpuk" | "**デトリタス**が溜まりやすい場所" (katakana loanword) | `flow-deadspots` sub-text (Environmental, item 4) |

Neither term is load-bearing for *answering* the question — `filter-check-date` is really asking "when did you last check the filter," and naming the impeller is just one example among three ("media, flow, impeller"); `flow-deadspots`'s sub-text is context, not the question itself. But an unfamiliar word sitting inside the thing you're being asked can still create hesitation or a feeling that the question needs equipment knowledge it doesn't actually require — and the fact that **all three languages** independently chose to keep the loanword rather than localize it suggests this wasn't a deliberate terminology decision so much as nobody having flagged it. (Contrast with `substrate-clean`'s "gravel-vac" — kept in en/id as `vakum kerikil`, a genuinely common hobby term in both languages — where keeping it is the right call. Impeller and detritus don't have that same everyday-hobby-vocabulary status.)

Suggested plain-language substitutes, for consideration:
- `filter-check-date`: "media, flow, impeller" → "media, flow, the moving parts inside it" (or simply drop "impeller" — "media, flow" already covers what most keepers can check without opening the filter housing).
- `flow-deadspots` sub: "Where detritus tends to collect" → "Where waste tends to collect" / "Where gunk tends to build up."

### S2.3 — MEDIUM: the English source is more jargon-heavy than its own id/ja translations, in the same item

`preclinical-signs` (Livestock, item 2) lists four early symptoms. Comparing the EN wording against what id/ja actually shipped for the *same* item is revealing:

- **en**: "Reduced feeding interest, subtle colour **pallor**, resting in an unusual spot, mildly **clamped fins**"
- **id**: "Minat makan yang menurun, warna sedikit **pucat**, berdiam di tempat yang tidak biasa, sirip yang sedikit **terkatup**" — "pucat" (pale) and "terkatup" (folded/closed) are both everyday words, not hobby jargon.
- **ja**: "食欲の低下、わずかな体色の**褪せ**、いつもと違う場所での静止、少し**閉じ気味**のヒレ" — 褪せ (fading) and 閉じ気味 (tending to close) are similarly plain.

"Pallor" is a mildly clinical/literary register word — most native English speakers would say "pale," and it's not a word every reader (especially non-native English readers, who make up a real share of this instrument's audience even for the English version) will recognize on sight. "Clamped fins" is genuine hobby jargon — a specific term for a specific visual sign — that a newer keeper who has never read a fish-health guide won't know by name, even if they'd immediately recognize the fins-held-close-to-the-body look if it were described instead of named.

Since id and ja independently arrived at the plainer, more accessible phrasing for the exact same underlying signs, the fix here is straightforward and low-risk: bring the English down to match its own translations, not the other way around. Suggested: "Reduced feeding interest, a slightly pale colour, resting in an unusual spot, fins held a little closer to the body than usual."

### S2.4 — LOW: car-filter analogy assumes car ownership

`filter-media`'s reflect text for `replace-regularly` (Biological) uses "like changing a car filter" as the illustrative analogy (en, id, and ja all keep the same analogy: "seperti mengganti filter mobil" / "車のフィルターを替えるように"). This is a reasonably widely-understood reference in most markets the site serves, but it does assume familiarity with car maintenance specifically, which isn't universal — younger readers, readers in dense urban areas with low car ownership, or readers who've simply never done their own car maintenance may find the comparison adds a small extra translation step rather than clarifying anything. Low priority: the analogy sits in the *reflection* text (read after answering, not needed to answer), so it doesn't affect measurement, only how well the explanation lands afterward.

### S2.5 — LOW, informational only: "hardscape" as a loanword

`hardscape-moves`/`flow-deadspots` (Environmental) and `biofilm-read`/`substrate-clean` (Biological) all use "hardscape," kept as an untranslated loanword in both id and ja (ハードスケープ / hardscape). Unlike S2.2's terms, this is very likely the right call to leave alone — "hardscape" functions as an international aquascaping-hobby loanword used by non-English-speaking hobbyists themselves, the way "aquascape" itself is. Noting it here only so it isn't mistaken for an oversight if a future pass revisits jargon.

### S2.6 — LOW, positive note: `substrate-clean`'s ja version is a good model of restructuring

Where en/id name the specific tool ("gravel-vac-and-test routine" / "rutinitas vakum kerikil"), ja's `substrate-clean` sidesteps the tool name entirely and asks functionally instead: "砂や土の底床は、水換え時の掃除とは別に、実際どう扱っていますか。" (roughly, "aside from cleaning at water-change time, how do you actually handle sand/soil substrate?"). This reaches the same distinction — routine surface maintenance vs. deep substrate handling — without requiring the reader to already know a specific piece of equipment by name. Worth keeping as a reference example the next time a scored item leans on named equipment.

### S2.7 — LOW, design note (not a defect): the "not X — actually Y" framing is a deliberate, repeated pattern

A large share of items use a "not what you're supposed to do — what you actually do" contrast in the sub-text (`testing-habit`, `trend-read`, `filter-media`, `light-schedule`, `hardscape-moves`, `feeding-precision`, and others). This is a consistent, intentional design choice — it primes honest self-report over the socially-desirable answer, and is good survey practice, not a comprehension problem. Flagging only because a reader moving through all 25 items back to back may start pattern-matching the framing rather than reading each one fresh; this is a possible respondent-fatigue/habituation question worth keeping in mind for the pretest's debrief, not a wording defect to fix.

---

## S3: Unscored Context Fields — Brief Check

Tank volume/age, `temp_swing`, `stocking_change`, `outcome_slip`, `outcome_intervention`, `life_change`, `care_intent`, and `oxygen_testing` were checked more briefly since their format (short label + concrete multiple-choice buckets) leaves much less room for the kind of ambiguity scored items can carry. Nothing rose to the level of S2's findings. The one word worth a light mention: "stocking" in `stock-*`'s label ("How the stocking has changed") is standard hobby vocabulary for population/species density, but is not a word with an obvious meaning to someone entirely outside the hobby vocabulary — low priority, since anyone reaching this field is already mid-way through an aquarium-specific instrument and has almost certainly encountered "stocking" already in that context.

---

## S4: What To Do With This

Nothing in S2 has been applied to the shipped instrument. Two of the findings (S2.2, S2.3) are concrete wording changes to scored-item text/sub-text — under §S8 of `docs/rhythm-tracker-instrument.md`, **any change to what respondents are asked earns a version bump, scored or not**, so acting on them means a v2.2 release, not a silent edit. Given that, the natural path is:

1. Decide which of S2.2/S2.3's suggested rewordings (if any) to accept — they can be adjusted, not just accepted verbatim.
2. If any are accepted, batch them into one version bump rather than one per item, the same way v1.3 and v1.4 each bundled several related additions.
3. Add `cycle-status` (S2.1) to `docs/rhythm-tracker-pretest-protocol.md` §S5's probe list regardless of whether any wording changes — that finding can only really be resolved by watching a real person read the item aloud.
4. Re-run the existing verification discipline for any scored-item change: all 5,120 answer combinations against the reference implementation (per the pattern in every version note in §S9 of the instrument record), plus `npm run i18n:check` twice for idempotence.

This document does not recommend a specific decision on 1–2; it surfaces what a close read found so the choice can be made deliberately rather than by default.
