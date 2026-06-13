import type { LngLat } from '../utils/geometry';

export interface AppState {
  centerCoordinates: LngLat;
  overlayRotation: number;
  selectedTierId: string;
}

type Listener = (state: AppState) => void;

export function createAppState(initial: AppState): {
  getState: () => AppState;
  setState: (partial: Partial<AppState>) => void;
  subscribe: (listener: Listener) => () => void;
} {
  let state = { ...initial };
  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    setState: (partial) => {
      state = { ...state, ...partial };
      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
