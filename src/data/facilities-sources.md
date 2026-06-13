# Facility data sources

Illustrative layout polygons are simplified rectangles derived from published footprint metrics and typical data-centre site plans. They are for scale comparison on the map, not survey-grade boundaries.

## Conventions

- **Hall blocks ≈ stated hall area.** The dark-grey "halls" rectangles in each tier's
  `layoutDefinition` sum to within ~8% of that tier's `footprint.dataHallsSqMeters`, so the
  drawn blocks and the on-screen "Data halls" metric mean the same thing across all tiers.
- **Water population benchmark.** Population-equivalent water comparisons use the UK average
  mains water use of **~137 litres per person per day** (England, 2024/25). Sources:
  [GOV.UK Water resources 2024–25](https://www.gov.uk/government/publications/water-resources-2024-2025-analysis-of-the-water-industrys-annual-water-resources-performance/water-resources-2024-to-2025-analysis-of-the-water-industrys-annual-water-resources-performance)
  (136.5 L/person/day) and [Water UK](https://www.water.org.uk/news-views-publications/news/water-you-thinking-brits-way-daily-usage)
  (~137 L/person/day). People-equivalent = `m³/day ÷ 0.137`. New tiers should reuse this
  benchmark rather than re-deriving a per-capita figure.

## Tier 1 — Kao Data Campus, Harlow

| Field | Value | Source |
|-------|-------|--------|
| Power | 40 MW ITE (campus target) | [Kao Data Harlow](https://kaodata.com/locations/harlow/) |
| Site area | ~6 ha (15 acre campus) | Kao Data Harlow; 61,000 m² campus cited on same page |
| Data halls | ~14,000 m² technical space | Kao Data Harlow (14,000 m² technical space; 150,000 sq ft cited for full build-out) |
| Water | ~50 m³/day | Kao Data ESG FY2023-24: ~18.2 million litres potable water company-wide per year → ~50 m³/day average |
| Coordinates | 51.7678°N, 0.1022°E | Campus, London Road, Harlow |
| Layout | ~280 × 220 m perimeter; four hall blocks | Approximate from campus size and KLON building footprints in planning materials |

**Water comparison:** Derived from reported annual potable water in [Kao Data ESG Report FY2023-24](https://kaodata.com/wp-content/uploads/2026/04/Kao-Data-ESG-Report-2023-24-v1.pdf).

**Layout:** [Plot F planning application PDF](https://docs.planning.org.uk/20250613/164/SXSVCPHX01700/xz38443r1l0z2jp9.pdf) describes KLON-7/8 building GIAs on the Harlow campus extension.

## Tier 2 — VIRTUS Stockley Park, London

| Field | Value | Source |
|-------|-------|--------|
| Power | ~100 MW | Industry reporting for VIRTUS London campus scale |
| Site area | ~10 ha | ~25 acre Stockley Park hyperscale campus (converted to hectares) |
| Data halls | ~33,000 m² | ~350,000 sq ft halls (converted) per design target dataset |
| Water | ~350 m³/day | Illustrative estimate for 100 MW evaporative/adiabatic cooling at high utilisation |
| Coordinates | 51.5055°N, 0.4524°W | Stockley Park, near Heathrow |
| Layout | ~400 × 250 m; six hall blocks | Scaled from site area and typical hyperscale row layout |

**Water comparison:** 350 m³/day ÷ 0.137 m³/person/day ≈ 2,555 people → "about 2,600 people" (using the ~137 L/person/day benchmark above).

## Tier 3 — Google Campus 2, Iowa

| Field | Value | Source |
|-------|-------|--------|
| Power | ~300 MW | Public reporting on Google Iowa data-centre expansion scale |
| Site area | ~81 ha | ~200+ acres (converted) per design target dataset |
| Data halls | ~93,000 m² | ~1 million sq ft halls (converted) |
| Water | ~2,500 m³/day | Illustrative estimate for large AI-oriented mega-campus cooling load |
| Coordinates | 41.2619°N, 95.8517°W | Council Bluffs / Papillion area, Iowa |
| Layout | ~900 × 900 m; nine hall blocks (145 × 71 m each ≈ 92,655 m²) | Hall blocks sized to match the ~93,000 m² stated hall area, per the convention above |

**Water comparison:** 2,500 m³/day ÷ 0.137 m³/person/day ≈ 18,250 people → "about 18,000 people" (using the ~137 L/person/day benchmark above). The earlier Royal Leamington Spa reference (~76,000 residents) was ~4x too large and has been dropped.

## Geocoding

Place search uses [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) (same ecosystem as map tiles). Submit-on-search only; no autocomplete polling.
