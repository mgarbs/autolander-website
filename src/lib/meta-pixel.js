export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';

export const isPixelEnabled = () =>
  Boolean(META_PIXEL_ID) && typeof window !== 'undefined' && typeof window.fbq === 'function';

export function track(event, params = {}, opts = {}) {
  if (!isPixelEnabled()) return;
  try {
    window.fbq('track', event, params, opts.eventId ? { eventID: opts.eventId } : undefined);
  } catch {
    /* Meta Pixel must not interrupt user flows. */
  }
}

export function trackCustom(event, params = {}, opts = {}) {
  if (!isPixelEnabled()) return;
  try {
    window.fbq('trackCustom', event, params, opts.eventId ? { eventID: opts.eventId } : undefined);
  } catch {
    /* Meta Pixel must not interrupt user flows. */
  }
}

export function newEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
