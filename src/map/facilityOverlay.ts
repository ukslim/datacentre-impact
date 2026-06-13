import type maplibregl from 'maplibre-gl';

import type { FacilityClass } from '../types/facility';
import { buildFacilityGeoJSON, type LngLat } from '../utils/geometry';

const PERIMETER_SOURCE = 'facility-perimeter';
const HALLS_SOURCE = 'facility-halls';
const SUBSTATION_SOURCE = 'facility-substation';

function createStripePattern(map: maplibregl.Map): void {
  if (map.hasImage('substation-stripe')) {
    return;
  }

  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.fillStyle = '#e85d04';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size, 0);
  ctx.stroke();

  const imageData = ctx.getImageData(0, 0, size, size);
  map.addImage('substation-stripe', imageData, { pixelRatio: 2 });
}

export function getViewportCenter(map: maplibregl.Map): LngLat {
  const center = map.getCenter();
  return [center.lng, center.lat];
}

export function initFacilityOverlay(map: maplibregl.Map): void {
  map.addSource(PERIMETER_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addSource(HALLS_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addSource(SUBSTATION_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  map.addLayer({
    id: 'facility-perimeter-fill',
    type: 'fill',
    source: PERIMETER_SOURCE,
    paint: {
      'fill-color': '#e85d04',
      'fill-opacity': 0.25,
    },
  });
  map.addLayer({
    id: 'facility-perimeter-line',
    type: 'line',
    source: PERIMETER_SOURCE,
    paint: {
      'line-color': '#c1121f',
      'line-width': 2,
    },
  });

  map.addLayer({
    id: 'facility-halls-fill',
    type: 'fill',
    source: HALLS_SOURCE,
    paint: {
      'fill-color': '#2b2d42',
      'fill-opacity': 0.85,
    },
  });
  map.addLayer({
    id: 'facility-halls-line',
    type: 'line',
    source: HALLS_SOURCE,
    paint: {
      'line-color': '#1a1a1a',
      'line-width': 1,
    },
  });

  createStripePattern(map);
  map.addLayer({
    id: 'facility-substation-fill',
    type: 'fill',
    source: SUBSTATION_SOURCE,
    paint: {
      'fill-pattern': 'substation-stripe',
      'fill-opacity': 0.9,
    },
  });
  map.addLayer({
    id: 'facility-substation-line',
    type: 'line',
    source: SUBSTATION_SOURCE,
    paint: {
      'line-color': '#e85d04',
      'line-width': 2,
    },
  });
}

export function updateFacilityOverlay(
  map: maplibregl.Map,
  facility: FacilityClass,
  center: LngLat,
  rotationDegrees: number,
): void {
  const geojson = buildFacilityGeoJSON(center, facility, rotationDegrees);

  const perimeterSource = map.getSource(PERIMETER_SOURCE) as
    | maplibregl.GeoJSONSource
    | undefined;
  const hallsSource = map.getSource(HALLS_SOURCE) as
    | maplibregl.GeoJSONSource
    | undefined;
  const substationSource = map.getSource(SUBSTATION_SOURCE) as
    | maplibregl.GeoJSONSource
    | undefined;

  if (!perimeterSource || !hallsSource || !substationSource) {
    return;
  }

  perimeterSource.setData(geojson.perimeter);
  hallsSource.setData(geojson.halls);
  substationSource.setData(geojson.substation);
}

export function isOverlayReady(map: maplibregl.Map): boolean {
  return map.getSource(PERIMETER_SOURCE) !== undefined;
}
