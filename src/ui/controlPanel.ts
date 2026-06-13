import type maplibregl from 'maplibre-gl';

import type { FacilityClass } from '../types/facility';
import {
  formatCubicMetersPerDay,
  formatHectares,
  formatMegawatts,
  formatSquareMeters,
} from '../utils/format';
import { getCurrentPosition } from '../utils/geolocation';
import { searchPlace } from '../utils/nominatim';
import { flyToLngLat, URBAN_NAV_ZOOM } from '../map/navigate';
import type { createAppState } from '../state/appState';
import { trackEvent } from '../utils/analytics';

type AppStateStore = ReturnType<typeof createAppState>;

export interface ControlPanelElements {
  tierSelect: HTMLSelectElement;
  rotationSlider: HTMLInputElement;
  rotationValue: HTMLElement;
  subtitle: HTMLElement;
  navStatus: HTMLElement;
  metrics: HTMLElement;
  locationSearch: HTMLInputElement;
  locationSearchBtn: HTMLButtonElement;
  myLocationBtn: HTMLButtonElement;
}

export function initControlPanel(
  elements: ControlPanelElements,
  facilities: FacilityClass[],
  state: AppStateStore,
  map: maplibregl.Map,
): void {
  populateTierSelect(elements.tierSelect, facilities, state.getState().selectedTierId);

  const facility = findFacility(facilities, state.getState().selectedTierId);
  updateSubtitle(elements.subtitle, facility);
  updateMetrics(elements.metrics, facility);
  updateRotationValue(elements.rotationValue, state.getState().overlayRotation);

  elements.tierSelect.addEventListener('change', () => {
    const selectedId = elements.tierSelect.value;
    trackEvent(`tier-${selectedId}`);
    state.setState({ selectedTierId: selectedId });
    const selected = findFacility(facilities, selectedId);
    updateSubtitle(elements.subtitle, selected);
    updateMetrics(elements.metrics, selected);
  });

  elements.rotationSlider.addEventListener('input', () => {
    const rotation = Number(elements.rotationSlider.value);
    state.setState({ overlayRotation: rotation });
    updateRotationValue(elements.rotationValue, rotation);
  });

  elements.locationSearchBtn.addEventListener('click', () => {
    void handleSearch(elements, map);
  });

  elements.locationSearch.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleSearch(elements, map);
    }
  });

  elements.myLocationBtn.addEventListener('click', () => {
    void handleMyLocation(elements, map);
  });
}

function populateTierSelect(
  select: HTMLSelectElement,
  facilities: FacilityClass[],
  selectedId: string,
): void {
  select.replaceChildren();
  for (const facility of facilities) {
    const option = document.createElement('option');
    option.value = facility.id;
    option.textContent = facility.name;
    select.append(option);
  }
  select.value = selectedId;
}

function findFacility(facilities: FacilityClass[], id: string): FacilityClass {
  const match = facilities.find((f) => f.id === id);
  return match ?? facilities[0]!;
}

function updateSubtitle(element: HTMLElement, facility: FacilityClass): void {
  element.textContent = `${facility.realWorldExample.name}, ${facility.realWorldExample.location} — ${formatMegawatts(facility.powerCapacityMW)}`;
}

function updateMetrics(container: HTMLElement, facility: FacilityClass): void {
  const [siteArea, halls, water] = container.querySelectorAll('dd');
  if (!siteArea || !halls || !water) return;

  siteArea.textContent = formatHectares(facility.footprint.perimeterHectares);
  halls.textContent = formatSquareMeters(facility.footprint.dataHallsSqMeters);
  water.textContent = formatWaterUse(facility);
}

function formatWaterUse(facility: FacilityClass): string {
  const { waterCubicMetersPerDay, waterComparisonMetric } = facility.resources;

  if (waterCubicMetersPerDay > 0) {
    return `${formatCubicMetersPerDay(waterCubicMetersPerDay)} — ${waterComparisonMetric}`;
  }

  return waterComparisonMetric;
}

function updateRotationValue(element: HTMLElement, degrees: number): void {
  element.textContent = `${degrees}°`;
}

function setNavStatus(element: HTMLElement, message: string): void {
  element.textContent = message;
}

async function handleSearch(
  elements: ControlPanelElements,
  map: maplibregl.Map,
): Promise<void> {
  const query = elements.locationSearch.value.trim();
  if (!query) {
    setNavStatus(elements.navStatus, 'Enter a place name to search.');
    return;
  }

  elements.locationSearchBtn.disabled = true;
  setNavStatus(elements.navStatus, 'Searching…');

  try {
    const result = await searchPlace(query);
    if (!result) {
      setNavStatus(elements.navStatus, 'No results found.');
      return;
    }

    flyToLngLat(map, [result.lng, result.lat], URBAN_NAV_ZOOM);
    trackEvent('nav-search-success');
    setNavStatus(elements.navStatus, `Found: ${result.displayName}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed.';
    setNavStatus(elements.navStatus, message);
  } finally {
    elements.locationSearchBtn.disabled = false;
  }
}

async function handleMyLocation(
  elements: ControlPanelElements,
  map: maplibregl.Map,
): Promise<void> {
  elements.myLocationBtn.disabled = true;
  setNavStatus(elements.navStatus, 'Getting your location…');

  try {
    const position = await getCurrentPosition();
    flyToLngLat(map, position, URBAN_NAV_ZOOM);
    trackEvent('nav-my-location-success');
    setNavStatus(elements.navStatus, 'Showing your current location.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Location unavailable.';
    setNavStatus(elements.navStatus, message);
  } finally {
    elements.myLocationBtn.disabled = false;
  }
}
