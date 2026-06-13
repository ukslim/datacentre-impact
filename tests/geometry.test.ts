import { describe, expect, it } from 'vitest';

import {
  calculatePolygonVertices,
  distanceMeters,
  buildFacilityGeoJSON,
} from '../src/utils/geometry';
import type { FacilityClass } from '../src/types/facility';

const CENTER: [number, number] = [0, 51];

describe('calculatePolygonVertices', () => {
  it('returns four corners for a rectangle at 0° rotation', () => {
    const vertices = calculatePolygonVertices(CENTER, 100, 50, 0);
    expect(vertices).toHaveLength(4);
  });

  it('forms a valid rectangle at 0° — equal opposite sides', () => {
    const vertices = calculatePolygonVertices(CENTER, 100, 50, 0);
    const [sw, se, ne, nw] = vertices;

    expect(sw).toBeDefined();
    expect(se).toBeDefined();
    expect(ne).toBeDefined();
    expect(nw).toBeDefined();

    const south = distanceMeters(sw!, se!);
    const north = distanceMeters(nw!, ne!);
    const west = distanceMeters(sw!, nw!);
    const east = distanceMeters(se!, ne!);

    expect(south).toBeCloseTo(100, 0);
    expect(north).toBeCloseTo(100, 0);
    expect(west).toBeCloseTo(50, 0);
    expect(east).toBeCloseTo(50, 0);
  });

  it('rotates corners when rotation is 90°', () => {
    const atZero = calculatePolygonVertices(CENTER, 100, 50, 0);
    const atNinety = calculatePolygonVertices(CENTER, 100, 50, 90);

    expect(atNinety[0]).not.toEqual(atZero[0]);

    const [sw, se, ne] = atNinety;
    const sideA = distanceMeters(sw!, se!);
    const sideB = distanceMeters(se!, ne!);
    const lengths = [sideA, sideB].sort((a, b) => a - b);
    expect(lengths[0]).toBeCloseTo(50, 0);
    expect(lengths[1]).toBeCloseTo(100, 0);
  });

  it('increases latitude when offset north at 0° rotation', () => {
    const vertices = calculatePolygonVertices(CENTER, 10, 10, 0);
    const northCorner = vertices[2];
    expect(northCorner![1]).toBeGreaterThan(CENTER[1]);
  });
});

describe('buildFacilityGeoJSON', () => {
  const mockFacility: FacilityClass = {
    id: 'test',
    name: 'Test',
    powerCapacityMW: 10,
    realWorldExample: { name: 'Test', location: 'Test' },
    exampleCoordinates: [0, 51],
    footprint: { perimeterHectares: 1, dataHallsSqMeters: 1000 },
    resources: {
      waterCubicMetersPerDay: 100,
      waterComparisonMetric: 'test',
    },
    layoutDefinition: {
      perimeterWidthMeters: 100,
      perimeterHeightMeters: 50,
      halls: [
        {
          widthMeters: 30,
          heightMeters: 20,
          offsetX: -20,
          offsetY: 10,
        },
      ],
      substation: {
        widthMeters: 15,
        heightMeters: 10,
        offsetX: 30,
        offsetY: -15,
      },
    },
  };

  it('builds perimeter, halls, and substation collections', () => {
    const geojson = buildFacilityGeoJSON(CENTER, mockFacility, 0);
    expect(geojson.perimeter.features).toHaveLength(1);
    expect(geojson.halls.features).toHaveLength(1);
    expect(geojson.substation.features).toHaveLength(1);
  });
});
