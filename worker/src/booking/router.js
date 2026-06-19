// Native booking backend:
//   GET  /api/availability  -> edge-fast cached slot list (Calendly-computed)
//   POST /api/book          -> JIT re-check + create the booking via Calendly
//
// Calendly stays the source of truth. The KV cache is advisory display data
// (KV is eventually consistent), so every commit re-checks the slot live and
// Calendly is the final arbiter against double-booking.

import { createBooking, fetchAvailableTimes, isSlotAvailable } from '../calendly/client.js';
import { sha256Hex } from '../capi/hash.js';
import { rememberBookingToken } from '../capi/storage.js';
import { looksLikeBot } from '../security/bot-filter.js';

const AVAIL_KEY = 'avail:demo';
const FRESH_MS = 3 * 60 * 1000; // serve straight from cache
const STALE_MS = 30 * 60 * 1000; // beyond this, refresh before serving
const DURATION_MIN = 30;
const HOST_TZ = 'America/New_York';

// Exact custom-question strings from the Calendly event type. Positions 0-4
// below MUST match the event type's question order verbatim.
const PHONE_QUESTION = 'What is the best phone number to reach you at?';
const ROLE_QUESTION = 'Are you a dealership owner, manager or sales rep?';
const WEBSITE_QUESTION = "What's your dealership's website? (AutoLander is software for dealers — we don't sell vehicles.)";
const INVENTORY_QUESTION = 'How many vehicles do you currently have in inventory?';
const TEXT_REMINDER_QUESTION = 'Get text reminders about your demo';
const INVENTORY_CHOICES = ['1-50', '51-150', '151+'];
const ROLE_CHOICES = ['Owner', 'Manager', 'Sales Rep'];
const AL_VID_MARKER = 'al_vid:';

const BOOK_IP_HOURLY = 20;
const BOOK_IP_DAILY = 60;

export async function handleBooking(request, env, corsHeaders, ctx) {
  const url = new URL(request.url);

  if (url.pathname === '/api/availability' && request.method === 'GET') {
    return handleAvailability(request, env, corsHeaders, ctx);
  }
  if (url.pathname === '/api/book' && request.method === 'POST') {
    return handleBook(request, env, corsHeaders, ctx);
  }
  return json({ ok: false, reason: 'not_found' }, 404, corsHeaders);
}

// --- Availability -----------------------------------------------------------

async function readCachedAvailability(env) {
  if (!env.TRACKING) return null;
  return env.TRACKING.get(AVAIL_KEY, 'json');
}

async function writeCachedAvailability(env, blob) {
  if (!env.TRACKING) return;
  // Long TTL as a floor; we overwrite on every sync and gate freshness on generated_at.
  await env.TRACKING.put(AVAIL_KEY, JSON.stringify(blob), { expirationTtl: 24 * 60 * 60 });
}

function buildBlob(slots) {
  return {
    event: 'demo',
    duration_min: DURATION_MIN,
    timezone_host: HOST_TZ,
    generated_at: new Date().toISOString(),
    slots,
  };
}

// Pull fresh slots from Calendly and cache them. Used by cron + on-demand.
export async function syncAvailability(env) {
  const slots = await fetchAvailableTimes(env, { days: 14 });
  const blob = buildBlob(slots);
  await writeCachedAvailability(env, blob);
  return blob;
}

async function handleAvailability(request, env, corsHeaders, ctx) {
  if (!env.CALENDLY_API_TOKEN) {
    return json({ ok: false, reason: 'calendly_not_configured' }, 503, corsHeaders);
  }

  let blob = await readCachedAvailability(env);
  const ageMs = blob?.generated_at ? Date.now() - new Date(blob.generated_at).getTime() : Infinity;

  try {
    if (!blob || ageMs > STALE_MS) {
      // Cold/stale: refresh before serving so we never hand out badly stale data.
      blob = await syncAvailability(env);
    } else if (ageMs > FRESH_MS) {
      // Warm-ish: serve now, refresh in the background (stale-while-revalidate).
      if (ctx?.waitUntil) ctx.waitUntil(syncAvailability(env).catch(() => {}));
    }
  } catch (err) {
    console.error('[api/availability] sync failed', String(err).slice(0, 200));
    if (!blob) return json({ ok: false, reason: 'availability_unavailable' }, 502, corsHeaders);
    // fall through and serve stale rather than nothing
  }

  return new Response(JSON.stringify({ ok: true, ...blob }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      // Brief browser cache; the calendar feels instant on repeat opens.
      'Cache-Control': 'public, max-age=20',
    },
  });
}

// --- Booking ----------------------------------------------------------------

async function handleBook(request, env, corsHeaders, ctx) {
  if (!env.CALENDLY_API_TOKEN) {
    return json({ ok: false, reason: 'calendly_not_configured' }, 503, corsHeaders);
  }

  if (looksLikeBot(request).bot) {
    return json({ ok: false, reason: 'blocked' }, 403, corsHeaders);
  }

  const limited = await enforceBookRateLimit(request, env);
  if (!limited.ok) {
    return json({ ok: false, reason: 'rate_limited' }, 429, corsHeaders);
  }

  const body = await safeJson(request);

  // Optional invisible bot challenge. Off by default (REQUIRE_BOOK_TURNSTILE
  // unset/false) so live bookings are unaffected; once a Turnstile widget is
  // added to the calendar and TURNSTILE_SECRET_KEY is set, flipping the flag
  // blocks scripted /api/book abuse with no UX change for real users.
  const challenge = await verifyBookTurnstile(request, env, body.turnstileToken);
  if (!challenge.ok) {
    return json({ ok: false, reason: 'verification_failed' }, 403, corsHeaders);
  }

  const slotStartUTC = normalizeIso(body.slotStartUTC);
  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const phoneNorm = normalizePhone(phone);
  const textReminders = Boolean(body.textReminders);
  const role = clean(body.role, 60);
  const website = clean(body.website, 200);
  const inventory = clean(body.inventory, 24);
  const honeypot = clean(body.company, 200); // hidden field — only bots fill it
  const timezone = clean(body.timezone, 64) || HOST_TZ;
  const vid = isValidVid(body.vid) ? body.vid : '';
  const utms = body.utms && typeof body.utms === 'object' ? body.utms : {};

  // Honeypot: a real person never sees or fills the hidden "company" field.
  if (honeypot) return json({ ok: false, reason: 'blocked' }, 403, corsHeaders);

  if (!slotStartUTC) return json({ ok: false, reason: 'invalid_slot' }, 400, corsHeaders);
  if (new Date(slotStartUTC).getTime() < Date.now()) {
    return json({ ok: false, reason: 'slot_in_past' }, 400, corsHeaders);
  }
  if (!isEmail(email)) return json({ ok: false, reason: 'invalid_email' }, 400, corsHeaders);
  if (!name) return json({ ok: false, reason: 'missing_name' }, 400, corsHeaders);
  if (!phone) return json({ ok: false, reason: 'missing_phone' }, 400, corsHeaders);
  if (!phoneNorm.ok) return json({ ok: false, reason: 'invalid_phone' }, 400, corsHeaders);
  if (!ROLE_CHOICES.includes(role)) return json({ ok: false, reason: 'missing_role' }, 400, corsHeaders);
  if (!isWebsite(website)) return json({ ok: false, reason: 'invalid_website' }, 400, corsHeaders);
  if (!INVENTORY_CHOICES.includes(inventory)) return json({ ok: false, reason: 'invalid_inventory' }, 400, corsHeaders);

  // JIT re-check: Calendly is the arbiter, but this gives a clean "just taken" UX
  // instead of a generic failure.
  const stillOpen = await isSlotAvailable(env, slotStartUTC);
  if (stillOpen === false) {
    if (ctx?.waitUntil) ctx.waitUntil(syncAvailability(env).catch(() => {}));
    return json({ ok: false, reason: 'slot_taken' }, 409, corsHeaders);
  }

  const tracking = buildTracking(vid, utms);
  // Positions MUST match the Calendly event type order exactly:
  // 0 phone · 1 role · 2 website · 3 inventory · 4 reminders.
  const questionsAndAnswers = [
    { question: PHONE_QUESTION, answer: phoneNorm.pretty, position: 0 },
    { question: ROLE_QUESTION, answer: role, position: 1 },
    { question: WEBSITE_QUESTION, answer: website, position: 2 },
    { question: INVENTORY_QUESTION, answer: inventory, position: 3 },
  ];
  if (textReminders) {
    questionsAndAnswers.push({ question: TEXT_REMINDER_QUESTION, answer: 'Yes', position: 4 });
  }

  let result;
  try {
    result = await createBooking(env, {
      startTimeIso: slotStartUTC,
      name,
      email,
      phone: phoneNorm.e164,
      timezone,
      textReminders,
      tracking,
      questionsAndAnswers,
    });
  } catch (err) {
    console.error('[api/book] createBooking threw', String(err).slice(0, 200));
    return json({ ok: false, reason: 'booking_error' }, 502, corsHeaders);
  }

  if (!result.ok) {
    const taken = result.status === 409 || /already|taken|no longer|unavailable|conflict/i.test(result.raw || '');
    console.error('[api/book] calendly rejected', result.status, (result.raw || '').slice(0, 200));
    if (ctx?.waitUntil) ctx.waitUntil(syncAvailability(env).catch(() => {}));
    return json(
      { ok: false, reason: taken ? 'slot_taken' : 'booking_failed' },
      taken ? 409 : 502,
      corsHeaders,
    );
  }

  // Booked. Drop the slot from the cache immediately (best-effort) so other
  // visitors stop seeing it; the invitee.created webhook + cron also reconcile.
  if (ctx?.waitUntil) ctx.waitUntil(removeSlotFromCache(env, slotStartUTC).catch(() => {}));

  // We do NOT fire a Schedule event here: the existing invitee.created webhook
  // sends the server-side CAPI Schedule, and the thank-you page fires the
  // browser Schedule — identical to the current Calendly flow.
  //
  // Mint a single-use token that proves THIS booking really happened. The
  // thank-you page must redeem it (via /capi/confirm) before it is allowed to
  // fire the `Schedule` pixel conversion, so a bot, crawler, or shared
  // /thank-you link can no longer mint a fake "demo booked" conversion. We await
  // the KV write so the token is readable by the time the redirect lands.
  // Derive the SAME eventID the invitee.created webhook uses (cal_<hash of the
  // scheduled-event URI>, mirroring its event||uri precedence) so the browser
  // pixel Schedule and the server CAPI Schedule share an eventID and Meta
  // deduplicates them into a single conversion.
  const inviteeResource = result.body?.resource || {};
  const sharedEventUri = inviteeResource.event || inviteeResource.uri || '';
  const fbEventId = sharedEventUri ? `cal_${(await sha256Hex(sharedEventUri)).slice(0, 32)}` : '';
  const bookingToken = newBookingToken();
  await rememberBookingToken(env, bookingToken, fbEventId).catch(() => {});
  return json(
    { ok: true, redirectPath: '/thank-you', startTime: slotStartUTC, bt: bookingToken },
    200,
    corsHeaders,
  );
}

function buildTracking(vid, utms) {
  // Calendly's /invitees requires ALL tracking fields present (null is fine) —
  // it's all-or-nothing, so we always send the full shape.
  const field = (key) => clean(utms[key], 180) || null;
  // Carry the visitor id inside utm_content so the existing webhook can recover
  // it (regex: al_vid:(v_...)) and attribute the CAPI Schedule event.
  const baseContent = clean(utms.utm_content, 160);
  const utmContent = vid
    ? baseContent ? `${baseContent}|${AL_VID_MARKER}${vid}` : `${AL_VID_MARKER}${vid}`
    : baseContent || null;
  return {
    utm_source: field('utm_source'),
    utm_medium: field('utm_medium'),
    utm_campaign: field('utm_campaign'),
    utm_term: field('utm_term'),
    utm_content: utmContent,
    salesforce_uuid: null,
  };
}

async function removeSlotFromCache(env, slotIso) {
  const blob = await readCachedAvailability(env);
  if (!blob || !Array.isArray(blob.slots)) return;
  const next = blob.slots.filter((s) => s !== slotIso);
  if (next.length !== blob.slots.length) {
    await writeCachedAvailability(env, { ...blob, slots: next });
  }
}

// --- helpers ----------------------------------------------------------------

async function enforceBookRateLimit(request, env) {
  if (env.DISABLE_RATE_LIMITS === 'true' || !env.CHAT_RATE_LIMITS) return { ok: true };
  const now = new Date();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  const fp = await sha256Hex(`book:${ip}`);
  const limits = [
    { key: `book:ip:${fp}:${day}`, limit: BOOK_IP_DAILY, ttl: 26 * 60 * 60 },
    { key: `book:ip:${fp}:${hour}`, limit: BOOK_IP_HOURLY, ttl: 60 * 60 + 120 },
  ];
  const counts = await Promise.all(limits.map((l) => env.CHAT_RATE_LIMITS.get(l.key)));
  if (limits.some((l, i) => Number(counts[i] || 0) >= l.limit)) return { ok: false };
  await Promise.all(
    limits.map((l, i) => env.CHAT_RATE_LIMITS.put(l.key, String(Number(counts[i] || 0) + 1), { expirationTtl: l.ttl })),
  );
  return { ok: true };
}

function newBookingToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyBookTurnstile(request, env, token) {
  if (env.REQUIRE_BOOK_TURNSTILE !== 'true') return { ok: true };
  // Flag on but no secret configured yet → fail OPEN so a misconfig never blocks
  // a real booking. The challenge only enforces once the secret is set.
  if (!env.TURNSTILE_SECRET_KEY) return { ok: true };
  if (!token) return { ok: false };
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  form.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  }).catch(() => null);
  if (!resp) return { ok: true }; // network blip reaching Cloudflare → don't punish a real booking
  const result = await resp.json().catch(() => ({}));
  return result.success ? { ok: true } : { ok: false };
}

function normalizeIso(value) {
  if (typeof value !== 'string') return '';
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return '';
  // Calendly slots are second-precision UTC (e.g. 2026-06-29T22:30:00Z) with no
  // milliseconds. toISOString() adds ".000" which then fails the slot-equality
  // check and the booking start_time match — strip it.
  return new Date(t).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function isValidVid(value) {
  return typeof value === 'string' && /^v_[a-z0-9]{12,40}$/i.test(value);
}

// Mirror of src/lib/contact.js — keep the two in lockstep so a number/email the
// browser accepts is the same one the server accepts.
function isEmail(value) {
  // DNS-style domain labels + 2+ char alphabetic TLD; local part permissive.
  return /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(value);
}

// Lenient dealership-website check (mirrors src/components/InstantCalendar.jsx).
// Accepts with/without protocol or www and an optional path; rejects bare words.
function isWebsite(value) {
  const v = String(value || '').trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  return /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:[/?#].*)?$/i.test(v);
}

// Strict phone normalize. Returns { ok, e164, pretty }; ok=false for anything
// that isn't a usable number.
function normalizePhone(raw) {
  const s = typeof raw === 'string' ? raw.trim() : '';
  const hasPlus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');

  // North American first — handles a bare 10-digit number AND country code 1
  // (with or without a +), so a +1 number can't skip the NANP rule. NPA + NXX
  // must each start 2-9.
  let nat = digits;
  if (nat.length === 11 && nat.startsWith('1')) nat = nat.slice(1);
  if (/^[2-9]\d{2}[2-9]\d{6}$/.test(nat)) {
    return {
      ok: true,
      e164: `+1${nat}`,
      pretty: `(${nat.slice(0, 3)}) ${nat.slice(3, 6)}-${nat.slice(6)}`,
    };
  }

  // International only when explicitly prefixed with + (country code 1 is NANP,
  // handled above). 8-15 digits, E.164 shape.
  if (hasPlus && !digits.startsWith('1') && /^[1-9]\d{7,14}$/.test(digits)) {
    const e164 = `+${digits}`;
    return { ok: true, e164, pretty: e164 };
  }

  return { ok: false, e164: '', pretty: '' };
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
