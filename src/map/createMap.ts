import maplibregl from 'maplibre-gl';

const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};

/** Kao Data Campus, Harlow, UK (Tier 1 example). */
const DEFAULT_CENTER: [number, number] = [0.129379, 51.769104];

export function createMap(container: HTMLElement): maplibregl.Map {
  return new maplibregl.Map({
    container,
    style: OSM_STYLE,
    center: DEFAULT_CENTER,
    zoom: 13,
    attributionControl: {},
    dragRotate: true,
  });
}
