import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';

import facilitiesData from './data/facilities.json';
import {
  getViewportCenter,
  initFacilityOverlay,
  isOverlayReady,
  updateFacilityOverlay,
} from './map/facilityOverlay';
import { createMap } from './map/createMap';
import { createAppState } from './state/appState';
import type { FacilityClass } from './types/facility';
import { initControlPanel, type ControlPanelElements } from './ui/controlPanel';
import { initDialogs } from './ui/helpDialog';

const facilities = facilitiesData as FacilityClass[];
const defaultFacility = facilities[0]!;

const mapContainer = document.getElementById('map');
if (!mapContainer) {
  throw new Error('Map container is missing');
}

const controlElements = getControlPanelElements();
const state = createAppState({
  centerCoordinates: defaultFacility.exampleCoordinates,
  overlayRotation: 0,
  selectedTierId: defaultFacility.id,
});

const map = createMap(mapContainer);
map.addControl(new maplibregl.NavigationControl(), 'top-right');

const mapResizeObserver = new ResizeObserver(() => {
  map.resize();
  if (isOverlayReady(map)) {
    state.setState({ centerCoordinates: getViewportCenter(map) });
  }
});
mapResizeObserver.observe(mapContainer);

function refreshOverlay(): void {
  if (!isOverlayReady(map)) {
    return;
  }

  const currentState = state.getState();
  const facility = facilities.find((f) => f.id === currentState.selectedTierId) ?? defaultFacility;
  updateFacilityOverlay(
    map,
    facility,
    currentState.centerCoordinates,
    currentState.overlayRotation,
  );
}

map.on('load', () => {
  initFacilityOverlay(map);
  state.setState({ centerCoordinates: getViewportCenter(map) });
  refreshOverlay();
});

map.on('moveend', () => {
  state.setState({ centerCoordinates: getViewportCenter(map) });
});

state.subscribe(() => {
  refreshOverlay();
});

initControlPanel(controlElements, facilities, state, map);
initDialogs();

function getControlPanelElements(): ControlPanelElements {
  const tierSelect = document.getElementById('tier-select');
  const rotationSlider = document.getElementById('rotation-slider');
  const rotationValue = document.getElementById('rotation-value');
  const subtitle = document.querySelector('.control-panel__subtitle');
  const navStatus = document.getElementById('nav-status');
  const metrics = document.getElementById('metrics');
  const locationSearch = document.getElementById('location-search');
  const locationSearchBtn = document.getElementById('location-search-btn');
  const myLocationBtn = document.getElementById('my-location-btn');

  if (
    !tierSelect ||
    !rotationSlider ||
    !rotationValue ||
    !subtitle ||
    !navStatus ||
    !metrics ||
    !locationSearch ||
    !locationSearchBtn ||
    !myLocationBtn
  ) {
    throw new Error('Required control panel elements are missing');
  }

  return {
    tierSelect: tierSelect as HTMLSelectElement,
    rotationSlider: rotationSlider as HTMLInputElement,
    rotationValue: rotationValue as HTMLElement,
    subtitle: subtitle as HTMLElement,
    navStatus: navStatus as HTMLElement,
    metrics,
    locationSearch: locationSearch as HTMLInputElement,
    locationSearchBtn: locationSearchBtn as HTMLButtonElement,
    myLocationBtn: myLocationBtn as HTMLButtonElement,
  };
}
