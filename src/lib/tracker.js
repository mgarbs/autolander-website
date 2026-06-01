import { getAttributionPayload, getVisitorId } from './identity.js';

export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';
const CAPI_URL = (import.meta.env.VITE_CAPI_URL || import.meta.env.VITE_CHAT_API_URL || '').replace(/\/+$/, '');

const isBrowser = typeof window !== 'undefined';

export const isPixelEnabled = () =>
  Boolean(META_PIXEL_ID) && isBrowser && typeof window.fbq === 'function';

export function newEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function firePixel(method, event, params, eventId) {
  if (!isPixelEnabled()) return;
  try {
    window.fbq(method, event, params, eventId ? { eventID: eventId } : undefined);
  } catch {
    /* Pixel must never break user flows */
  }
}

async function sendToCapi(event, params, { eventId, userData } = {}) {
  if (!CAPI_URL || !isBrowser) return;
  try {
    const attribution = getAttributionPayload();
    const payload = {
      event,
      eventId,
      eventTime: Math.floor(Date.now() / 1000),
      sourceUrl: window.location.href,
      ...attribution,
      customData: params || {},
      ...(userData || {}),
    };

    await fetch(`${CAPI_URL}/capi/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'omit',
      mode: 'cors',
    });
  } catch {
    /* Tracking must never break user flows */
  }
}

export function track(event, params = {}, opts = {}) {
  const eventId = opts.eventId || newEventId();
  firePixel('track', event, params, eventId);
  void sendToCapi(event, params, { eventId, userData: opts.userData });
  return eventId;
}

export function trackCustom(event, params = {}, opts = {}) {
  const eventId = opts.eventId || newEventId();
  firePixel('trackCustom', event, params, eventId);
  void sendToCapi(event, params, { eventId, userData: opts.userData });
  return eventId;
}

export function pageView() {
  if (!isBrowser) return;
  getVisitorId();
  track('PageView', {});
  installEngagementTracking();
}

function sessionFlag(key) {
  try {
    return window.sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(key) {
  try {
    window.sessionStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
}

function installEngagementTracking() {
  if (!isBrowser) return;
  const path = window.location.pathname || '/';
  const engagedKey = `al_engaged:${path}`;
  if (!sessionFlag(engagedKey)) {
    window.setTimeout(() => {
      if (sessionFlag(engagedKey)) return;
      setSessionFlag(engagedKey);
      trackCustom('EngagedVisit', { engagement_seconds: 15, page_path: path });
    }, 15000);
  }

  const scrollMarks = [50, 90];
  const onScroll = () => {
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    const percent = Math.min(100, Math.round((window.scrollY / maxScroll) * 100));
    for (const mark of scrollMarks) {
      const key = `al_scroll:${path}:${mark}`;
      if (percent >= mark && !sessionFlag(key)) {
        setSessionFlag(key);
        trackCustom('ScrollDepth', { percent: mark, page_path: path });
      }
    }
    if (scrollMarks.every((mark) => sessionFlag(`al_scroll:${path}:${mark}`))) {
      window.removeEventListener('scroll', onScroll);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
