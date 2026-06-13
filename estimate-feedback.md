# Estimate Feedback: Hall Area & Water-Use Comparisons

## Who wrote this and why it should be trusted

This note was written by Claude (Anthropic's Claude Code), an AI coding agent, during a
code review of this project requested by the repo owner. It is **not** a subjective
style opinion — every finding below is a direct arithmetic cross-check between numbers
that already exist in this repository (`src/data/facilities.json` and
`src/data/facilities-sources.md`), plus one external benchmark (UK per-capita water use)
that is cited with sources and was checked via live web search at review time
(2026-06-13).

Anyone — human or agent — can re-derive every number in this document from the inputs
given. Treat this as a verified bug report on the *data*, not as a request to trust the
reviewer's judgement. Where a fix requires a value judgement (e.g. which convention to
adopt across tiers), that is called out explicitly as a decision point rather than
prescribed.

**Scope:** this file covers only the two issues below. It does not cover code quality,
geometry/map correctness, or other parts of the project, which were reviewed separately
and were not problematic.

---

## Finding 1: Tier 3 hall footprint is ~2x the stated `dataHallsSqMeters`

**Location:** `src/data/facilities.json` → `tier-3-ai-mega-campus.layoutDefinition.halls`
and `tier-3-ai-mega-campus.footprint.dataHallsSqMeters`.

**The numbers:**

| Tier | Hall blocks in `layoutDefinition` | Sum of drawn hall area | `dataHallsSqMeters` | Ratio (drawn / stated) |
|------|-----------------------------------|------------------------|----------------------|-------------------------|
| Tier 1 | 4 × (85m × 40m) | 13,600 m² | 13,935 m² | 0.98 |
| Tier 2 | 6 × (100m × 50m) | 30,000 m² | 32,516 m² | 0.92 |
| Tier 3 | 9 × (200m × 100m) | **180,000 m²** | **92,903 m²** | **1.94** |

For Tier 1 and Tier 2, the rectangles drawn on the map (the dark-grey "halls" layer)
sum to within ~8% of the `dataHallsSqMeters` figure shown in the metrics panel — i.e.
the convention is "grey blocks ≈ data hall floor area shown in the readout." Tier 3
breaks that convention: the drawn blocks are roughly **double** the area the readout
claims.

**Why it matters:** a user switching between tiers will reasonably assume the grey
blocks mean the same thing in every tier. For Tier 3 they currently represent ~180,000
m² of building footprint while the on-screen "Data halls" metric says 92,903 m²
(≈1,000,000 sq ft, which checks out as a unit conversion — that part is fine).

**Decision points / options for the implementing agent:**

1. **Shrink Tier 3's hall blocks to match the stated metric** (keeps the existing
   "blocks ≈ stated m²" convention used for Tiers 1–2). To hit ~92,903 m² across 9
   blocks: ~10,323 m² each, e.g. ~145m × 71m, or keep one dimension at 100m and set the
   other to ~103m. Re-check that resized blocks still fit inside the 900m × 900m
   perimeter without new overlaps (current layout has ~50m gaps between blocks in both
   axes, so there's headroom).

2. **Treat hall blocks as total building footprint (not pure hall floor area) for all
   tiers**, with `dataHallsSqMeters` representing technical floor area *within* that
   footprint (a ~50% coverage ratio is plausible for real hyperscale designs with large
   mechanical/cooling galleries). This is consistent with Tier 3's current numbers but
   would mean Tiers 1–2 are *under*-drawn relative to this convention — their blocks
   would need to roughly double to match.

3. **Leave the numbers as-is but document the discrepancy** in
   `src/data/facilities-sources.md` and/or the in-app help dialog (`index.html`,
   "Positioning & accuracy" section), explaining that Tier 3's grey blocks represent
   total building footprint while the metric is technical hall area.

Option 1 is the smallest change and matches the existing convention; option 2 is more
"realistic" but has wider blast radius (Tiers 1–2 + their sources doc); option 3 is a
docs-only fix if the discrepancy is intentional and the owner just wants it explained.

---

## Finding 2: Water-use comparison strings understate the comparison by roughly 3–5x (Tiers 2 and 3)

### Reference benchmark used below

UK average household water consumption is **~136–140 litres per person per day**
(2023/24–2024/25 figures). Sources:
- [GOV.UK — Water resources 2024 to 2025 analysis](https://www.gov.uk/government/publications/water-resources-2024-2025-analysis-of-the-water-industrys-annual-water-resources-performance/water-resources-2024-to-2025-analysis-of-the-water-industrys-annual-water-resources-performance) — 136.5 L/person/day for England, 2024/25
- [Water UK — "Water you thinking? Brits way off on daily usage"](https://www.water.org.uk/news-views-publications/news/water-you-thinking-brits-way-daily-usage) — ~137 L/person/day (DiscoverWater)
- UK average household size is ~2.4 people (ONS) — used below to convert per-person to per-household.

### Tier 3 (`tier-3-ai-mega-campus`)

- `resources.waterCubicMetersPerDay`: **2500**
- `resources.waterComparisonMetric`: *"Roughly comparable to the daily public water
  supply of Royal Leamington Spa (~76,000 residents)"*
- `facilities-sources.md` justification: *"UK municipal supply benchmarks suggest
  roughly 2,000–3,000 m³/day for a town of that size"*

**Cross-check:** 76,000 residents × 0.137 m³/person/day ≈ **10,400 m³/day**. The
source doc's "2,000–3,000 m³/day for 76,000 people" implies ~30–40 L/person/day, which
is roughly a quarter of the actual UK average and even below WHO's basic-needs
threshold (~50 L/person/day) — it looks like an order-of-magnitude-style estimate that
didn't get checked against a per-capita benchmark.

At the stated 2,500 m³/day, a population-equivalent comparison using ~137 L/person/day
gives **2,500 / 0.137 ≈ 18,250 people** — i.e. a small town, not a town of 76,000.

### Tier 2 (`tier-2-standard-hyperscale`)

- `resources.waterCubicMetersPerDay`: **350**
- `resources.waterComparisonMetric`: *"Roughly the daily municipal water supply for a UK
  town of about 2,500 households"*
- `facilities-sources.md` justification: *"UK household water ~150 L/person/day;
  ~2,500 households ≈ 375 m³/day"*

**Cross-check:** the source doc's arithmetic (`2,500 × 150L = 375,000L = 375 m³/day`)
multiplies a **per-person** benchmark (150 L/person/day) by a **household count**
(2,500), without applying the ~2.4 people/household conversion. Using
137 L/person/day × 2.4 people/household ≈ 329 L/household/day, 350 m³/day corresponds
to **350,000 / 329 ≈ 1,065 households** — roughly 2.4x fewer than stated. Equivalently,
as a population: 350 / 0.137 ≈ **2,555 people**.

### Why this matters

Both errors push the same direction: they make the facility's water footprint look
smaller relative to a community than the underlying numbers support. For a tool whose
purpose is to communicate *impact*, this undersells the comparison — the opposite of
what you'd want if the numbers were going to be wrong in some direction.

Tier 1's water figure and comparison are **not** affected — they're derived directly
from Kao Data's reported annual potable water use (18.2M L/yr ÷ 365 ≈ 50 m³/day) and
hold up correctly.

### Suggested rewrites (for the implementing agent to verify/adjust)

- **Tier 2:** `waterComparisonMetric` → something like *"Roughly the daily municipal
  water supply for a UK town of about 2,500–2,600 people"* (population framing avoids
  the household-size conversion entirely), or *"...about 1,000 households"* if keeping
  the household framing.
- **Tier 3:** `waterComparisonMetric` → either reframe the population (*"...a town of
  about 18,000 people"*, dropping the Royal Leamington Spa reference since it's ~4x too
  large), or keep Leamington Spa as a recognisable place name but reframe as a fraction
  (*"...about a sixth of Royal Leamington Spa's daily public water supply"*).
- Update the corresponding rows in `src/data/facilities-sources.md` to use the
  ~137 L/person/day benchmark (cite GOV.UK/Water UK as above) so the written
  justification matches the displayed string.

Alternatively, if `waterCubicMetersPerDay` itself for Tiers 2/3 is the part that's
"illustrative" and considered less certain than the comparison framing, it may be
easier to adjust those m³/day figures upward to match a chosen comparison population,
rather than adjusting the comparison text downward. Either direction resolves the
inconsistency — which one is a judgement call for the repo owner.

---

## Suggested next steps for an implementing agent

1. Pick a resolution for Finding 1 (hall area convention) and update
   `src/data/facilities.json` (`tier-3-ai-mega-campus.layoutDefinition.halls` and/or
   `footprint.dataHallsSqMeters`) plus the Tier 3 row in
   `src/data/facilities-sources.md` accordingly.
2. Recompute and update `waterComparisonMetric` for Tiers 2 and 3 in
   `src/data/facilities.json`, and update the matching rows in
   `src/data/facilities-sources.md` with the corrected arithmetic and citation.
3. Both findings are **data/content-only changes** — no changes to
   `src/utils/geometry.ts`, `src/map/`, or `src/ui/` are needed. Run `npm test` and
   `npm run build` afterwards as a sanity check (existing geometry/format tests don't
   depend on these specific values, so they should continue to pass unchanged).
4. Consider whether `src/data/facilities-sources.md` should note the per-capita water
   benchmark and household-size assumption once, centrally, so future tier additions
   reuse a consistent conversion instead of re-deriving it ad hoc.
