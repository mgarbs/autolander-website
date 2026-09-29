import { isNoTrackPath, redactTrackingValue } from '../../shared/tracking-scope.js';
import { readQaTestEventCode } from './tracking-qa.js';
import { getAttributionPayload, getFbCookies, getVisitorId } from './identity.js';
import {
  isProductionMetaUrl,
} from '../../shared/meta-signal.js';

const CAPI_URL = (import.meta.env.VITE_CAPI_URL || import.meta.env.VITE_CHAT_API_URL || '').replace(/\/+$/, '');
const isBrowser = typeof window !== 'undefined';

// Only production trackable pages emit server events.
const TRACKING_DISABLED =
  import.meta.env.MODE === 'preview'
  || import.meta.env.VITE_DEPLOY_TARGET === 'preview'
  || !isBrowser
  || isNoTrackPath(window.location.pathname)
  || !isProductionMetaUrl(window.location.href);

export function newEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function sendToCapi(event, params, { eventId, userData } = {}) {
  if (TRACKING_DISABLED || !CAPI_URL || !isBrowser) return;
  try {
    const attribution = getAttributionPayload();
    const testEventCode = readQaTestEventCode();
    const payload = redactTrackingValue({
      channel: 'server_only',
      ...(testEventCode ? { testEventCode } : {}),
      event,
      eventId,
      eventTime: Math.floor(Date.now() / 1000),
      sourceUrl: window.location.href,
      ...attribution,
      customData: params || {},
      ...(userData || {}),
    });

    const response = await fetch(`${CAPI_URL}/capi/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      // Background telemetry must not hold network-critical-idle open.
      priority: 'low',
      credentials: 'omit',
      mode: 'cors',
    });
    try { await response.text(); } catch { /* The response is unused; drain it. */ }
  } catch {
    /* Tracking must never break user flows */
  }
}

export function track(event, params = {}, opts = {}) {
  const eventId = opts.eventId || newEventId();
  void sendToCapi(event, params, { eventId, userData: opts.userData });
  return eventId;
}

export function trackCustom(event, params = {}, opts = {}) {
  const eventId = opts.eventId || newEventId();
  void sendToCapi(event, params, { eventId, userData: opts.userData });
  return eventId;
}

export function pageView() {
  if (TRACKING_DISABLED) return;
  getVisitorId();
  getFbCookies();
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
  if (TRACKING_DISABLED) return;
  const path = window.location.pathname || '/';
  const engagedKey = `al_engaged:${path}`;
  if (!sessionFlag(engagedKey)) {
    window.setTimeout(() => {
      if (sessionFlag(engagedKey)) return;
      setSessionFlag(engagedKey);
      trackCustom('EngagedVisit', { engagement_seconds: 15, page_path: path });
    }, 15000);
  }
}
