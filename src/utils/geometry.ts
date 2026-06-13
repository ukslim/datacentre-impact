import { destination } from '@turf/destination';
import { distance } from '@turf/distance';
import { point } from '@turf/helpers';
import type { Feature, FeatureCollection, Polygon } from 'geojson';

import type { FacilityClass } from '../types/facility';

export type LngLat = [number, number];

function rotateOffset(
  eastMeters: number,
  northMeters: number,
  rotationDegrees: number,
): [number, number] {
  const radians = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [
    eastMeters * cos - northMeters * sin,
    eastMeters * sin + northMeters * cos,
  ];
}

function meterOffsetToLngLat(
  center: LngLat,
  eastMeters: number,
  northMeters: number,
): LngLat {
  const distanceKm = Math.hypot(eastMeters, northMeters) / 1000;
  if (distanceKm === 0) {
    return center;
  }

  const bearing = (Math.atan2(eastMeters, northMeters) * 180) / Math.PI;
  const result = destination(point(center), distanceKm, bearing, {
    units: 'kilometers',
  });
  const coords = result.geometry.coordinates;
  return [coords[0] ?? center[0], coords[1] ?? center[1]];
}

function offsetLngLat(
  center: LngLat,
  eastMeters: number,
  northMeters: number,
  rotationDegrees: number,
): LngLat {
  const [east, north] = rotateOffset(eastMeters, northMeters, rotationDegrees);
  return meterOffsetToLngLat(center, east, north);
}

export function calculatePolygonVertices(
  center: LngLat,
  widthMeters: number,
  heightMeters: number,
  rotationDegrees: number,
): LngLat[] {
  const halfWidth = widthMeters / 2;
  const halfHeight = heightMeters / 2;

  const corners: Array<[number, number]> = [
    [-halfWidth, -halfHeight],
    [halfWidth, -halfHeight],
    [halfWidth, halfHeight],
    [-halfWidth, halfHeight],
  ];

  return corners.map(([east, north]) =>
    offsetLngLat(center, east, north, rotationDegrees),
  );
}

export function rectangleFromCenterAndOffset(
  center: LngLat,
  widthMeters: number,
  heightMeters: number,
  offsetX: number,
  offsetY: number,
  rotationDegrees: number,
): LngLat[] {
  return calculatePolygonVertices(
    offsetLngLat(center, offsetX, offsetY, rotationDegrees),
    widthMeters,
    heightMeters,
    rotationDegrees,
  );
}

function closeRing(vertices: LngLat[]): LngLat[] {
  const first = vertices[0];
  const last = vertices[vertices.length - 1];
  if (first && last && first[0] === last[0] && first[1] === last[1]) {
    return vertices;
  }
  return first ? [...vertices, first] : vertices;
}

function polygonFeature(vertices: LngLat[]): Feature<Polygon> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [closeRing(vertices)],
    },
  };
}

export interface FacilityGeoJSON {
  perimeter: FeatureCollection<Polygon>;
  halls: FeatureCollection<Polygon>;
  substation: FeatureCollection<Polygon>;
}

export function buildFacilityGeoJSON(
  center: LngLat,
  facility: FacilityClass,
  rotationDegrees: number,
): FacilityGeoJSON {
  const { layoutDefinition } = facility;

  const perimeterVertices = calculatePolygonVertices(
    center,
    layoutDefinition.perimeterWidthMeters,
    layoutDefinition.perimeterHeightMeters,
    rotationDegrees,
  );

  const hallFeatures = layoutDefinition.halls.map((hall) =>
    polygonFeature(
      rectangleFromCenterAndOffset(
        center,
        hall.widthMeters,
        hall.heightMeters,
        hall.offsetX,
        hall.offsetY,
        rotationDegrees,
      ),
    ),
  );

  const substationVertices = rectangleFromCenterAndOffset(
    center,
    layoutDefinition.substation.widthMeters,
    layoutDefinition.substation.heightMeters,
    layoutDefinition.substation.offsetX,
    layoutDefinition.substation.offsetY,
    rotationDegrees,
  );

  return {
    perimeter: {
      type: 'FeatureCollection',
      features: [polygonFeature(perimeterVertices)],
    },
    halls: {
      type: 'FeatureCollection',
      features: hallFeatures,
    },
    substation: {
      type: 'FeatureCollection',
      features: [polygonFeature(substationVertices)],
    },
  };
}

export function distanceMeters(a: LngLat, b: LngLat): number {
  return distance(point(a), point(b), { units: 'meters' });
}
