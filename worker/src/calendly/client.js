// Thin Calendly v2 REST client for the native booking flow.
// Auth: Personal Access Token in env.CALENDLY_API_TOKEN (paid plan required).
// We never re-implement availability rules — we read Calendly's COMPUTED slots
// and let Calendly remain the authoritative writer (no double-booking).

const CALENDLY_API = 'https://api.calendly.com';
const DEFAULT_EVENT_TYPE = 'https://api.calendly.com/event_types/8969cc69-05d5-4c3d-8ec9-20309f721b2f';

// Calendly caps the available_times window to 7 days per request.
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export function eventTypeUri(env) {
  return env.CALENDLY_EVENT_TYPE_URI || DEFAULT_EVENT_TYPE;
}

function authHeaders(env) {
  return {
    Authorization: `Bearer ${env.CALENDLY_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

// Pull bookable slot start times (UTC ISO) for the next `days` days.
// Chunks the range into <=7-day windows and merges. Returns sorted, de-duped.
export async function fetchAvailableTimes(env, { days = 14 } = {}) {
  if (!env.CALENDLY_API_TOKEN) throw new Error('CALENDLY_API_TOKEN missing');
  const uri = eventTypeUri(env);
  const now = Date.now();
  const end = now + days * 24 * 60 * 60 * 1000;
  // start_time must be in the future.
  let cursor = now + MINUTE_MS;
  const slots = [];
  let guard = 0;
  while (cursor < end && guard < 6) {
    guard += 1;
    const chunkEnd = Math.min(cursor + WINDOW_MS - MINUTE_MS, end);
    const params = new URLSearchParams({
      event_type: uri,
      start_time: new Date(cursor).toISOString(),
      end_time: new Date(chunkEnd).toISOString(),
    });
    const res = await fetch(`${CALENDLY_API}/event_type_available_times?${params}`, {
      headers: authHeaders(env),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`calendly_availability_${res.status}:${detail.slice(0, 180)}`);
    }
    const data = await res.json();
    for (const item of data.collection || []) {
      if (item.status === 'available' && Number(item.invitees_remaining) > 0 && item.start_time) {
        slots.push(item.start_time);
      }
    }
    cursor = chunkEnd;
  }
  return [...new Set(slots)].sort();
}

// JIT re-check a single slot right before committing. Returns true/false, or
// null if Calendly is unreachable (caller decides how to treat unknown).
export async function isSlotAvailable(env, startTimeIso) {
  if (!env.CALENDLY_API_TOKEN) return null;
  const uri = eventTypeUri(env);
  const t = new Date(startTimeIso).getTime();
  if (!Number.isFinite(t)) return false;
  const start = new Date(Math.max(Date.now() + MINUTE_MS, t - MINUTE_MS)).toISOString();
  const endIso = new Date(t + 60 * MINUTE_MS).toISOString();
  const params = new URLSearchParams({ event_type: uri, start_time: start, end_time: endIso });
  const res = await fetch(`${CALENDLY_API}/event_type_available_times?${params}`, {
    headers: authHeaders(env),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.collection || []).some(
    (s) => s.status === 'available' && s.start_time === startTimeIso,
  );
}

// Create the booking via the Scheduling API. Calendly is the authoritative
// writer: if the slot was taken since our cache refresh, this rejects and we
// surface "slot just taken" to the visitor.
export async function createBooking(env, {
  startTimeIso,
  name,
  email,
  phone,
  timezone,
  textReminders,
  tracking,
  questionsAndAnswers,
}) {
  if (!env.CALENDLY_API_TOKEN) throw new Error('CALENDLY_API_TOKEN missing');

  const invitee = {
    email,
    name,
    timezone: timezone || 'America/New_York',
  };
  const smsNumber = textReminders ? toE164(phone) : '';
  if (smsNumber) invitee.text_reminder_number = smsNumber;

  const body = {
    event_type: eventTypeUri(env),
    start_time: startTimeIso,
    invitee,
    location: { kind: 'google_conference' },
  };
  if (Array.isArray(questionsAndAnswers) && questionsAndAnswers.length) {
    body.questions_and_answers = questionsAndAnswers;
  }
  if (tracking && Object.keys(tracking).length) body.tracking = tracking;

  const res = await fetch(`${CALENDLY_API}/invitees`, {
    method: 'POST',
    headers: authHeaders(env),
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let json = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, body: json, raw };
}

// Best-effort E.164 normalization for SMS reminders (defaults to US +1).
// If it doesn't look like a usable number we return '' and skip the SMS field
// so a malformed phone never fails the whole booking.
export function toE164(raw) {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (/^\+[1-9]\d{7,14}$/.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return '';
}
