import { describe, expect, it } from 'vitest';

import {
  formatCubicMetersPerDay,
  formatHectares,
  formatNumber,
  formatSquareMeters,
} from '../src/utils/format';

describe('formatNumber', () => {
  it('formats thousands with grouping separators', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
  });
});

describe('formatHectares', () => {
  it('includes ha suffix', () => {
    expect(formatHectares(6.07)).toBe('6.07 ha');
  });
});

describe('formatSquareMeters', () => {
  it('includes m² suffix', () => {
    expect(formatSquareMeters(13935)).toBe('13,935 m²');
  });
});

describe('formatCubicMetersPerDay', () => {
  it('includes m³/day suffix', () => {
    expect(formatCubicMetersPerDay(1200)).toBe('1,200 m³/day');
  });
});
