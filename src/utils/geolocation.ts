import type { LngLat } from './geometry';

export function getCurrentPosition(): Promise<LngLat> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude]);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('Unable to retrieve your location.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  });
}
