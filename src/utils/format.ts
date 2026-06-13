const LOCALE = 'en-GB';

export function formatNumber(value: number): string {
  return value.toLocaleString(LOCALE);
}

export function formatHectares(hectares: number): string {
  return `${formatNumber(hectares)} ha`;
}

export function formatSquareMeters(squareMeters: number): string {
  return `${formatNumber(squareMeters)} m²`;
}

export function formatCubicMetersPerDay(cubicMeters: number): string {
  return `${formatNumber(cubicMeters)} m³/day`;
}

export function formatMegawatts(megawatts: number): string {
  return `${formatNumber(megawatts)} MW`;
}
