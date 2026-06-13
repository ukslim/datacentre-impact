declare global {
  interface Window {
    goatcounter?: {
      count: (options: { path: string; event?: boolean; title?: string }) => void;
    };
  }
}

export function trackEvent(path: string): void {
  window.goatcounter?.count({ path, event: true });
}

export {};