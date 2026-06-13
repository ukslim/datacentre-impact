# AI Data Centre Impact Visualiser

A frontend-only web app that overlays illustrative data centre footprints on a map so you can compare physical scale and resource use in your own neighbourhood.

**Live site:** https://ukslim.github.io/datacentre-impact/

## Development

```bash
npm install
npm run dev      # http://localhost:5173/datacentre-impact/
npm test
npm run build
npm run preview
```

## Features

- Three facility tiers with metric readouts (ha, m², m³/day)
- GeoJSON overlays (perimeter, halls, substation) anchored to the map viewport centre
- Overlay rotation slider (independent of map bearing)
- Place search (Nominatim) and **My location** (browser geolocation)
- Tier selector updates overlay scale and metrics at the current map view

## Data sources

See [`src/data/facilities-sources.md`](src/data/facilities-sources.md) for citations and layout notes.

## Specification

- [`design.md`](design.md) — product spec
- [`AGENTS.md`](AGENTS.md) — agent implementation guide
