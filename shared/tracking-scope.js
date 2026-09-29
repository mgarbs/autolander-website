export const NO_TRACK_PATH_SOURCE = '^/(admin|download/setup|demo|demo-clay|onboarding|training)(/|$)';
export const NO_TRACK_PATH = new RegExp(NO_TRACK_PATH_SOURCE);
export function isNoTrackPath(pathname) { return NO_TRACK_PATH.test(String(pathname || '/')); }
export const GA_MEASUREMENT_ID = 'G-30H80LZMCH';

// Apply at the vendor boundary, including cached clients and stored attribution.
export function redactTrackingValue(value, key = '') {
  // Opaque identity and click IDs are never URL-normalized.
  if (['fbclid', 'fbc', 'fbp', 'event_id', 'eventId', 'vid', 'sid'].includes(key)) return value;
  if (typeof value === 'string') return value.replace(/\/pay\/[^/?#\s]+/g, '/pay/:token');
  if (Array.isArray(value)) return value.map((item) => redactTrackingValue(item, key));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactTrackingValue(item, key)]));
  }
  return value;
}
