import { describe, expect, it } from 'vitest';

import { parseNominatimResults } from '../src/utils/nominatim';

describe('parseNominatimResults', () => {
  it('returns null for empty results', () => {
    expect(parseNominatimResults([])).toBeNull();
  });

  it('parses the first result', () => {
    const result = parseNominatimResults([
      {
        lat: '52.406374',
        lon: '-1.510367',
        display_name: 'Coventry, West Midlands, England, United Kingdom',
      },
    ]);

    expect(result).toEqual({
      lat: 52.406374,
      lng: -1.510367,
      displayName: 'Coventry, West Midlands, England, United Kingdom',
    });
  });
});
