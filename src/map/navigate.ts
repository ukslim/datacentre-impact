import type maplibregl from 'maplibre-gl';

import type { LngLat } from '../utils/geometry';

export const URBAN_NAV_ZOOM = 15;

export function flyToLngLat(
  map: maplibregl.Map,
  lngLat: LngLat,
  zoom = URBAN_NAV_ZOOM,
): void {
  map.flyTo({
    center: lngLat,
    zoom,
    essential: true,
  });
}
