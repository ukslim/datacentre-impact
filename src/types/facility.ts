export interface FacilityClass {
  id: string;
  name: string;
  powerCapacityMW: number;
  realWorldExample: {
    name: string;
    location: string;
  };
  exampleCoordinates: [number, number];
  footprint: {
    perimeterHectares: number;
    dataHallsSqMeters: number;
  };
  resources: {
    waterCubicMetersPerDay: number;
    waterComparisonMetric: string;
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
