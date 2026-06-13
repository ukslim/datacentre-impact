# AGENTS.md — AI Data Centre Impact Visualiser

## What This Is

A lightweight, frontend-only web application that helps users visualise the physical and environmental scale of modern AI data centres. The app overlays geometric representations of real-world data centre classes onto a user-navigable web map, providing localised context for physical footprint and resource consumption.

**Target deployment:** GitHub Pages at `https://ukslim.github.io/datacentre-impact`

**Specification:** [`design.md`](design.md) is the authoritative product and implementation spec. Prefer matching it when making architectural choices.

**Language:** British English in all user-facing copy and documentation (e.g. *centre*, *visualise*, *colour*, *metre*, *datacentre*).

## Tech Stack

- **Vite** — build tool and dev server
- **TypeScript** — strict mode enabled
- **MapLibre GL JS** — map engine
- **State & UI** — vanilla TypeScript manipulating the DOM (use Alpine.js only if data-binding becomes unwieldy during prototyping)
- **Styling** — native CSS or Tailwind CSS (agent discretion for fastest prototyping)
- **Testing** — Vitest, unit tests only for pure geometry/math functions

No backend, no API keys, no E2E framework (Playwright/Cypress are explicitly excluded).

## Units

Use **SI metric only** — hectares (ha), square metres (m²), cubic metres per day (m³/day), megawatts (MW), metres for layout geometry. Never use acres, square feet, or gallons in data, UI, or docs.

## Facility Tiers

Static data in `src/data/facilities.json`. Three facility classes:

| Tier | Example | Power | Footprint | Halls |
|------|---------|-------|-----------|-------|
| Tier 1: Regional Hub | Kao Data Campus (Harlow, UK) | ~40 MW | ~6 ha | ~14,000 m² |
| Tier 2: Standard Hyperscale | VIRTUS Stockley Park (London, UK) | ~100 MW | ~10 ha | ~33,000 m² |
| Tier 3: AI Mega-Campus | Google Campus 2 (Iowa, USA) | ~300 MW | ~80+ ha | ~93,000+ m² |

### Facility schema

```typescript
interface FacilityClass {
  id: string;
  name: string;
  powerCapacityMW: number;
  realWorldExample: {
    name: string;
    location: string;
  };
  footprint: {
    perimeterHectares: number;
    dataHallsSqMeters: number;
  };
  resources: {
    waterCubicMetersPerDay: number;
    waterComparisonMetric: string; // e.g. "Equivalent to the daily usage of Warwick"
  };
  layoutDefinition: {
    perimeterWidthMeters: number;
    perimeterHeightMeters: number;
    halls: Array<{
      widthMeters: number;
      heightMeters: number;
      offsetX: number;
      offsetY: number;
    }>;
    substation: {
      widthMeters: number;
      heightMeters: number;
      offsetX: number;
      offsetY: number;
    };
  };
}
```

## UI Layout

1. **Full-screen map canvas** — MapLibre instance
2. **Floating control panel** (absolute positioned; glassmorphism or solid background):
   - **Tier selector** — dropdown or radio buttons
   - **Place search** — Nominatim geocoder (submit on Search / Enter); flies map to result
   - **My location** — browser geolocation button; flies map to current position
   - **Overlay rotation slider** — range input 0–360°; rotates the GeoJSON overlay independently of the map
   - **Map bearing hint** — short text explaining right-click + drag for map rotation (MapLibre native)
   - **Metrics readout** — site area (ha), data hall area (m²), water use (m³/day), and contextual comparison string for the active tier

## Map & Geometry (Core Logic)

Synthetic GeoJSON polygons represent the selected facility at the centre of the user's current map view.

### Map setup

- Initialize MapLibre with a free raster tile source (e.g. OpenStreetMap default tiles). No API key.
- Maintain `state.centerCoordinates` as `[lng, lat]` — default is the viewport centre.

### Geometry generation

Pure function: `calculatePolygonVertices(center, width, height, rotationAngle)`.

- Uses standard geospatial math (Haversine or a lightweight library like `turf.js` if hand-rolled math is too verbose).
- Returns the four corner coordinates `[lng, lat]` of a rectangle from centre, dimensions in metres, and rotation angle.

### Map layers

| Layer | GeoJSON type | Style |
|-------|--------------|-------|
| Perimeter | Polygon | Semi-transparent red or orange stroke and fill |
| Halls | MultiPolygon | Solid opaque dark grey |
| Substation | Polygon | Striped or distinct accent colour |

### Event listeners

- **Map `moveend`** — update `state.centerCoordinates`, re-render GeoJSON data source
- **Slider `input`** — update `state.overlayRotation`, re-render GeoJSON data source

## Project Structure (target)

```
datacentre-impact/
├── src/
│   ├── data/
│   │   └── facilities.json       # Static facility tier data
│   ├── utils/
│   │   ├── geometry.ts         # calculatePolygonVertices and related pure functions
│   │   └── format.ts           # Metric unit formatting (ha, m², m³/day)
│   ├── map/                      # MapLibre setup, layers, GeoJSON source updates
│   ├── ui/                       # Control panel, tier selector, metrics readout
│   ├── types/                    # FacilityClass and shared types
│   ├── main.ts                   # App entry
│   └── style.css                 # Or Tailwind entry if chosen
├── tests/
│   └── geometry.test.ts          # Vitest tests for geometry/math
├── public/
├── index.html
├── design.md                     # Full specification
├── AGENTS.md                     # This file
├── package.json
├── tsconfig.json
├── vite.config.ts                # base: '/datacentre-impact/' for GitHub Pages
└── vitest.config.ts
```

Adjust paths as the codebase grows, but keep geometry logic in pure, testable modules separate from MapLibre and DOM code.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server
npm run build            # Production build → dist/
npm run preview          # Preview production build locally
npm test                 # Run Vitest (geometry/math unit tests)
```

## Testing

**Unit tests only** — Vitest, focused on geospatial math where silent failures are likely.

Required test targets:

- `calculatePolygonVertices()` — at 0° rotation, output vertices form a valid rectangle for a known centre, width, and height
- `calculatePolygonVertices()` — 90° rotation transforms coordinates correctly
- Number formatting utils — e.g. `1,000,000` with grouping separators; metric suffixes (`ha`, `m²`, `m³/day`)

**UI testing:** manual visual verification only. No Playwright or Cypress.

## Deployment

- Code hosted on GitHub; deploy to GitHub Pages via GitHub Actions
- Set Vite `base` in `vite.config.ts` to `/datacentre-impact/` for sub-path hosting
- Build output directory: `dist/`

## Implementation Notes for Agents

- Prefer small, focused diffs. Do not add frameworks beyond what the spec allows without a clear reason.
- Keep `calculatePolygonVertices` and similar functions pure — no MapLibre or DOM dependencies inside them.
- Facility metrics in the UI must come from the active tier in `facilities.json`, not hard-coded strings.
- Overlay rotation (slider) is independent of map bearing (right-click drag). Do not conflate the two.
- When choosing CSS approach, pick one (native CSS or Tailwind) and stay consistent across the project.
- All displayed quantities must use metric units and `src/utils/format.ts` for consistent formatting.
