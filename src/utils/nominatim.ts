export interface PlaceSearchResult {
  lng: number;
  lat: number;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const USER_AGENT = 'datacentre-impact-visualiser/1.0 (GitHub Pages demo)';

export function parseNominatimResults(results: NominatimResult[]): PlaceSearchResult | null {
  const first = results[0];
  if (!first) {
    return null;
  }

  return {
    lat: Number.parseFloat(first.lat),
    lng: Number.parseFloat(first.lon),
    displayName: first.display_name,
  };
}

export async function searchPlace(query: string): Promise<PlaceSearchResult | null> {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('q', trimmed);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Search failed (${response.status}).`);
  }

  const results = (await response.json()) as NominatimResult[];
  return parseNominatimResults(results);
}
