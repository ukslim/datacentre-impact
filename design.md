# System Design: AI Data Centre Impact Visualiser

## 1. Project Overview

A lightweight, frontend-only web application designed to help users visualise the physical and environmental scale of modern AI data centres. The application overlays geometric representations of real-world data centre classes onto a user-navigable web map, providing localised context for physical footprint and resource consumption.

**Target Deployment:** GitHub Pages (e.g., `https://ukslim.github.io/datacentre-impact`)
**Development Paradigm:** AI-assisted development. This document serves as the detailed specification implementation guide.

**Language:** British English in all user-facing copy and documentation.

## 2. Technology Stack

- **Build Tool:** Vite
- **Language:** TypeScript (Strict mode enabled)
- **Map Engine:** MapLibre GL JS
- **State & UI:** Vanilla TypeScript manipulating DOM elements (or Alpine.js if data-binding becomes complex during exploratory prototyping).
- **Testing:** Vitest (Focused entirely on unit-testing pure geometry/math functions).
- **Styling:** Native CSS or Tailwind CSS (Agent's discretion for fastest prototyping).

## 2.1 Units

All physical quantities use **SI metric units** throughout data, UI, and documentation:

| Quantity | Unit | Notes |
|----------|------|-------|
| Site footprint area | hectares (ha) | Not acres |
| Data hall floor area | square metres (m²) | Not square feet |
| Water consumption | cubic metres per day (m³/day) | Not gallons |
| Power capacity | megawatts (MW) | Already metric |
| Layout geometry | metres (m) | Map overlay dimensions |

Do not store or display imperial units.

## 3. Data Architecture

Data is static and should be managed in a local JSON configuration file (`src/data/facilities.json`).

### 3.1 Facility Schema

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
    waterComparisonMetric: string; // e.g., "Equivalent to the daily usage of Warwick"
  };
  layoutDefinition: {
    // Relative dimensions to draw the GeoJSON polygons
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

### 3.2 Target Dataset

1. **Tier 1: Regional Hub:** Kao Data Campus (Harlow, UK) | ~40 MW | ~6 ha | ~14,000 m² halls.
2. **Tier 2: Standard Hyperscale:** VIRTUS Stockley Park (London, UK) | ~100 MW | ~10 ha | ~33,000 m² halls.
3. **Tier 3: AI Mega-Campus:** Google Campus 2 (Iowa, USA) | ~300 MW | ~80+ ha | ~93,000+ m² halls.

## 4. UI Layout & Controls

The viewport is divided into two primary areas:

1. **Full-Screen Map Canvas:** The MapLibre instance.
2. **Floating Control Panel (Absolute positioned, glassmorphism or solid background):**

- **Tier Selector:** Dropdown or radio buttons to select the facility class.
- **Place search:** Text input and Search button (submit on Enter) using OpenStreetMap Nominatim — flies the map to the searched location. No API key required; submit-on-search only (no autocomplete).
- **My location:** Button using browser geolocation to fly the map to the user's current position.
- **Overlay Rotation Slider:** Range input (0 to 360 degrees) to rotate the generated GeoJSON overlay independently of the map.
- **Map Bearing:** MapLibre handles map rotation natively via Right-Click + Drag. Include a small UI hint text explaining this to the user.
- **Metrics Readout:** Dynamic text displaying site area (ha), data hall area (m²), water use (m³/day), and the contextual comparison string based on the active Tier.

## 5. Map & Geometry Implementation Logic

This is the core technical challenge. The app must render synthetic GeoJSON polygons representing the facility at the centre of the user's current map view.

- **Map Setup:** Initialize MapLibre with a free raster tile source (e.g., OpenStreetMap default tiles). No API key required.
- **The Anchor Point:** Maintain a `state.centerCoordinates` `[lng, lat]`. By default, this is the centre of the map viewport.
- **Geometry Generation (Pure Functions):**
- Create a utility function: `calculatePolygonVertices(center, width, height, rotationAngle)`.
- This function uses standard geospatial math (e.g., the Haversine formula or a lightweight library like `turf.js` if doing it from scratch is too verbose) to calculate the 4 corner coordinates `[lng, lat]` of a rectangle based on the centre point, dimensions in metres, and the user-defined rotation slider value.

- **Map Layers:**
- **Layer 1 (Perimeter):** GeoJSON Polygon. Style: Semi-transparent red or orange stroke and fill.
- **Layer 2 (Halls):** GeoJSON MultiPolygon. Style: Solid, opaque dark grey.
- **Layer 3 (Substation):** GeoJSON Polygon. Style: Striped or distinct accent colour.

- **Event Listeners:** \* On Map `moveend`: Update `state.centerCoordinates` and trigger a re-render of the GeoJSON data source.
- On Slider `input`: Update `state.overlayRotation` and trigger a re-render of the GeoJSON data source.

## 6. Testing Strategy

Given the project scope, an E2E framework (Playwright/Cypress) is explicitly excluded. Testing should be strictly limited to the business logic that handles geospatial math, as this is where silent failures occur.

- **Framework:** Vitest
- **Test Targets:**
- `calculatePolygonVertices()`: Assert that given a specific centre, width, height, and 0 rotation, the output vertices form a valid rectangle.
- Assert that a 90-degree rotation transforms the coordinates correctly.
- Data formatting utils (e.g., ensuring numbers format to `1,000,000` with grouping separators; metric suffixes `ha`, `m²`, `m³/day`).

- **UI Testing:** Manual visual verification only.

## 7. Deployment Protocol

- Code hosted on GitHub.
- Configure Vite's `base` path in `vite.config.ts` to match the repository name if deploying to a sub-path (`/datacentre-impact/`).
- Deploy using a standard GitHub Actions workflow targeting GitHub Pages. Output directory is `dist/`.
