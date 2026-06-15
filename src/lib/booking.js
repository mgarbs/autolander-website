import { getAttributionPayload } from './identity.js';

// Same Worker base the tracker uses.
const CAPI_URL = (import.meta.env.VITE_CAPI_URL || import.meta.env.VITE_CHAT_API_URL || '').replace(/\/+$/, '');

export function bookingApiConfigured() {
  return Boolean(CAPI_URL);
}

export function visitorTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  } catch {
    return 'America/New_York';
  }
}

// Edge-cached, Calendly-computed availability. Returns
// { ok, event, duration_min, timezone_host, generated_at, slots:[utc-iso] }.
export async function getAvailability() {
  if (!CAPI_URL) throw new Error('booking_api_unconfigured');
  const res = await fetch(`${CAPI_URL}/api/availability`, { mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error(`availability_${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.reason || 'availability_error');
  return data;
}

// Create the booking. Returns { httpOk, ok, reason?, redirectPath?, startTime? }.
export async function submitBooking({ slotStartUTC, name, email, phone, textReminders }) {
  if (!CAPI_URL) throw new Error('booking_api_unconfigured');
  const attr = getAttributionPayload();
  const res = await fetch(`${CAPI_URL}/api/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    credentials: 'omit',
    body: JSON.stringify({
      slotStartUTC,
      name,
      email,
      phone,
      textReminders,
      timezone: visitorTimezone(),
      vid: attr.vid,
      utms: attr.utms,
    }),
  });
  const data = await res.json().catch(() => ({ ok: false, reason: 'bad_response' }));
  return { httpOk: res.ok, ...data };
}
