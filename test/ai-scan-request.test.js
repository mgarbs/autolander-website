import assert from 'node:assert/strict';
import test from 'node:test';
import { ROLE_CHOICES, SMS_CONSENT } from '../shared/ai-scan-form.js';
import { sha256Hex } from '../worker/src/capi/hash.js';
import {
  aiScanGhlRequest,
  handleBooking,
} from '../worker/src/booking/router.js';

const AI_SCAN_TTL_SECONDS = 90 * 24 * 60 * 60;
const PREVIEW_URL = 'https://preview.autolander.ai/api/ai-scan';
const PRODUCTION_URL = 'https://autolander.ai/api/ai-scan';
const FORM_SUCCESS = 'https://autolander.ai/ai-visibility/?sent=1#scan-form';
const FORM_ERROR = 'https://autolander.ai/ai-visibility/?error=';

class MemoryKv {
  constructor() {
    this.values = new Map();
    this.puts = [];
    this.deletes = [];
  }

  async get(key, type) {
    const value = this.values.get(key);
    if (value === undefined) return null;
    return type === 'json' ? JSON.parse(value) : value;
  }

  async put(key, value, options = {}) {
    const stored = String(value);
    this.values.set(key, stored);
    this.puts.push({ key, value: stored, options });
  }

  async delete(key) {
    this.values.delete(key);
    this.deletes.push(key);
  }
}

function submissionId(number) {
  return `sub_ai_scan_request_${String(number).padStart(4, '0')}`;
}

function validBody(overrides = {}) {
  return {
    dealershipName: 'Example Motors',
    website: 'example.com',
    location: 'Tampa, FL 33615',
    fullName: 'Jamie Dealer',
    role: ROLE_CHOICES[0],
    email: 'jamie@example.com',
    phone: '(212) 555-0123',
    smsConsent: true,
    consentTimestamp: '2026-09-29T14:15:16.000Z',
    smsConsentVersion: 'untrusted-client-version',
    submissionId: submissionId(1),
    company: '',
    userAgent: 'Mozilla/5.0 AutoLander AI scan test browser',
    attribution: {
      vid: 'v_abcdefghijklmnopqrstuv',
      fbp: 'fb.1.1700000000000.123456789',
      utms: {
        utm_source: 'facebook',
        utm_medium: 'paid_social',
        utm_campaign: 'ai_visibility',
        utm_content: 'dealer_owner',
        utm_term: 'visibility scan',
        campaign_id: 'campaign-123',
        adset_id: 'adset-123',
        ad_id: 'ad-123',
        placement: 'feed',
        site_source_name: 'facebook',
      },
      page: {
        landing_page: 'https://autolander.ai/ai-visibility/?utm_source=facebook',
        current_page: 'https://autolander.ai/ai-visibility/',
        referrer: 'https://facebook.com/',
      },
    },
    organic_attribution: {
      landing_page: 'https://autolander.ai/ai-visibility/',
      referrer_url: 'https://www.google.com/search?q=dealer+visibility',
    },
    landing_page: 'https://autolander.ai/ai-visibility/',
    referrer_url: 'https://www.google.com/search?q=dealer+visibility',
    current_page: 'https://autolander.ai/ai-visibility/',
    current_referrer: 'https://www.facebook.com/',
    submittedVia: 'fetch',
    ...overrides,
  };
}

function jsonRequest(body, {
  url = PREVIEW_URL,
  origin = new URL(url).origin,
  ip = '203.0.113.10',
  userAgent = 'Mozilla/5.0 request header test browser',
} = {}) {
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      'CF-Connecting-IP': ip,
      'User-Agent': userAgent,
    },
    body: JSON.stringify(body),
  });
}

function rawJsonRequest(bodyText, options = {}) {
  const url = options.url || PREVIEW_URL;
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: options.origin || new URL(url).origin,
      'CF-Connecting-IP': options.ip || '203.0.113.10',
      'User-Agent': 'Mozilla/5.0 raw JSON test browser',
    },
    body: bodyText,
  });
}

function formRequest(overrides = {}) {
  const body = validBody({
    smsConsent: 'on',
    submissionId: '',
    attribution: undefined,
    organic_attribution: undefined,
    ...overrides,
  });
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null && value !== false) params.set(key, String(value));
  }
  return new Request(PRODUCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://autolander.ai',
      'CF-Connecting-IP': '203.0.113.20',
      'User-Agent': 'Mozilla/5.0 no-JS form test browser',
    },
    body: params,
  });
}

function baseEnv(tracking = new MemoryKv(), overrides = {}) {
  return {
    DISABLE_RATE_LIMITS: 'true',
    SEND_WORKER_AI_SCAN_CAPI: 'false',
    TRACKING: tracking,
    ...overrides,
  };
}

function crmEnv(tracking = new MemoryKv(), overrides = {}) {
  return baseEnv(tracking, {
    GHL_PRIVATE_INTEGRATION_TOKEN: 'test-ghl-token',
    GHL_LOCATION_ID: 'test-location',
    ...overrides,
  });
}

function requestDetails(url, init = {}) {
  let body = null;
  if (typeof init.body === 'string' && init.body) {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = init.body;
    }
  }
  return {
    href: String(url),
    method: String(init.method || 'GET').toUpperCase(),
    headers: init.headers || {},
    body,
  };
}

async function storedRequest(tracking, id) {
  return tracking.get(`ai_scan:req:${id}`, 'json');
}

function assertSuccessPayload(payload, id, eventId, duplicate = false) {
  assert.deepEqual(payload, {
    ok: true,
    duplicate,
    submissionId: id,
    eventId,
  });
}

test('kill switch returns unavailable before parsing, storage, or network work', async (t) => {
  const tracking = new MemoryKv();
  let fetchCalls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    fetchCalls += 1;
    return Response.json({ ok: true });
  });

  const response = await handleBooking(
    rawJsonRequest('{this is not json'),
    baseEnv(tracking, { AI_SCAN_PUBLIC_ROUTE: 'off' }),
    {},
    {},
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, reason: 'unavailable' });
  assert.equal(tracking.puts.length, 0);
  assert.equal(fetchCalls, 0);
});

test('TRACKING replay read failure returns unavailable without repeating CRM or Meta work', async (t) => {
  const tracking = new MemoryKv();
  const id = submissionId(14);
  const eventId = `aiscan_${(await sha256Hex(`ai-scan:${id}`)).slice(0, 32)}`;
  tracking.values.set(`ai_scan:req:${id}`, JSON.stringify({
    status: 'received',
    crm: 'synced',
    response: { ok: true, duplicate: false, submissionId: id, eventId },
  }));
  tracking.get = async () => {
    throw new Error('simulated KV read outage');
  };
  let fetchCalls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    fetchCalls += 1;
    return Response.json({ ok: true });
  });
  const env = crmEnv(tracking, {
    META_PIXEL_ID: '123456789',
    META_CAPI_ACCESS_TOKEN: 'test-meta-token',
    SEND_WORKER_AI_SCAN_CAPI: 'true',
  });

  const response = await handleBooking(
    jsonRequest(validBody({ submissionId: id }), {
      url: PRODUCTION_URL,
      origin: 'https://autolander.ai',
    }),
    env,
    {},
    {},
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, reason: 'unavailable' });
  assert.equal(fetchCalls, 0, 'a possible replay must not repeat CRM or Meta writes');
  assert.equal(tracking.puts.length, 0);
});

test('honeypots receive a success-shaped answer and are stored as spam without outbound calls', async (t) => {
  const tracking = new MemoryKv();
  let fetchCalls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    fetchCalls += 1;
    return Response.json({ ok: true });
  });
  const id = submissionId(2);
  const env = crmEnv(tracking, {
    META_PIXEL_ID: '123456789',
    META_CAPI_ACCESS_TOKEN: 'test-meta-token',
    SEND_WORKER_AI_SCAN_CAPI: 'true',
  });

  const response = await handleBooking(
    jsonRequest(validBody({ submissionId: id, company: 'filled by bot' }), {
      url: PRODUCTION_URL,
      origin: 'https://autolander.ai',
    }),
    env,
    {},
    {},
  );
  const expectedEventId = `aiscan_${(await sha256Hex(`ai-scan:${id}`)).slice(0, 32)}`;

  assert.equal(response.status, 200);
  assertSuccessPayload(await response.json(), id, expectedEventId);
  assert.equal(fetchCalls, 0);
  const record = await storedRequest(tracking, id);
  assert.equal(record.status, 'spam');
  assert.equal(record.crm, 'skipped');
  assert.equal(record.dealershipName, 'Example Motors');
  assert.equal(record.email, 'jamie@example.com');
  assert.equal(record.eventId, expectedEventId);
  const requestWrite = tracking.puts.find(({ key }) => key === `ai_scan:req:${id}`);
  const indexWrite = tracking.puts.find(({ key }) => key.startsWith('ai_scan:index:'));
  assert.equal(requestWrite.options.expirationTtl, AI_SCAN_TTL_SECONDS);
  assert.equal(indexWrite.options.expirationTtl, AI_SCAN_TTL_SECONDS);
});

test('invalid and non-object JSON bodies fail as invalid submissions without throwing', async () => {
  for (const request of [
    jsonRequest(validBody({ submissionId: 'bad' })),
    rawJsonRequest('null'),
    rawJsonRequest('[]'),
  ]) {
    const response = await handleBooking(request, baseEnv(), {}, {});
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false, reason: 'invalid_submission' });
  }
});

test('AI scan validation reasons are returned in the required order', async (t) => {
  const cases = [
    ['missing_dealership', { dealershipName: '' }],
    ['invalid_website', { website: 'not a website' }],
    ['missing_location', { location: '' }],
    ['missing_full_name', { fullName: 'Jamie' }],
    ['missing_role', { role: 'Owner' }],
    ['invalid_email', { email: 'not-an-email' }],
    ['invalid_phone', { phone: '12345' }],
  ];

  for (const [reason, override] of cases) {
    await t.test(reason, async () => {
      const response = await handleBooking(
        jsonRequest(validBody({ ...override, submissionId: `sub_validation_${reason}` })),
        baseEnv(),
        {},
        {},
      );
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { ok: false, reason });
    });
  }
});

test('validated requests are stored for 90 days with canonical consent and a daily index', async () => {
  const tracking = new MemoryKv();
  const id = submissionId(3);
  const response = await handleBooking(
    jsonRequest(validBody({ submissionId: id })),
    baseEnv(tracking),
    {},
    {},
  );
  const eventId = `aiscan_${(await sha256Hex(`ai-scan:${id}`)).slice(0, 32)}`;

  assert.equal(response.status, 200);
  assertSuccessPayload(await response.json(), id, eventId);
  const record = await storedRequest(tracking, id);
  assert.equal(record.status, 'received');
  assert.equal(record.crm, 'skipped');
  assert.equal(record.website, 'https://example.com/');
  assert.equal(record.location, 'Tampa, FL 33615');
  assert.equal(record.fullName, 'Jamie Dealer');
  assert.equal(record.phone, '+12125550123');
  assert.equal(record.role, ROLE_CHOICES[0]);
  assert.deepEqual(record.consent, {
    text: SMS_CONSENT.text,
    version: SMS_CONSENT.version,
    timestamp: '2026-09-29T14:15:16.000Z',
  });
  assert.equal(record.attribution.vid, 'v_abcdefghijklmnopqrstuv');
  assert.equal(record.ghlUtms.utm_source, 'facebook');
  assert.equal(record.submittedVia, 'fetch');

  const relevantWrites = tracking.puts.filter(({ key }) => (
    key === `ai_scan:req:${id}` || key.startsWith('ai_scan:index:')
  ));
  assert.ok(relevantWrites.length >= 3, 'initial request, index, and CRM outcome are persisted');
  for (const write of relevantWrites) {
    assert.equal(write.options.expirationTtl, AI_SCAN_TTL_SECONDS, write.key);
  }
  const indexKey = [...tracking.values.keys()].find((key) => key.startsWith('ai_scan:index:'));
  assert.deepEqual(await tracking.get(indexKey, 'json'), [id]);
  for (const key of tracking.values.keys()) {
    assert.equal(key.includes('jamie@example.com'), false);
    assert.equal(key.includes('203.0.113.10'), false);
  }
});

test('IP rate limit rejects request thirteen while keeping IP and email out of counter keys', async () => {
  const tracking = new MemoryKv();
  const rateLimits = new MemoryKv();
  const env = {
    TRACKING: tracking,
    CHAT_RATE_LIMITS: rateLimits,
    AI_SCAN_HASH_KEY: 'test-only-ai-scan-hmac-key',
    SEND_WORKER_AI_SCAN_CAPI: 'false',
  };

  for (let index = 1; index <= 12; index += 1) {
    const response = await handleBooking(
      jsonRequest(validBody({
        submissionId: `sub_ip_limit_request_${String(index).padStart(2, '0')}`,
        email: `dealer${index}@example.com`,
      }), { ip: '198.51.100.44' }),
      env,
      {},
      {},
    );
    assert.equal(response.status, 200, `request ${index}`);
  }

  const limited = await handleBooking(
    jsonRequest(validBody({
      submissionId: 'sub_ip_limit_request_13',
      email: 'dealer13@example.com',
    }), { ip: '198.51.100.44' }),
    env,
    {},
    {},
  );
  assert.equal(limited.status, 429);
  assert.deepEqual(await limited.json(), { ok: false, reason: 'rate_limited' });
  assert.ok([...rateLimits.values.keys()].some((key) => key.startsWith('ai_scan:ip:')));
  for (const key of rateLimits.values.keys()) {
    assert.equal(key.includes('198.51.100.44'), false);
    assert.equal(key.includes('@example.com'), false);
  }
});

test('per-email rate limit rejects request four across different IP addresses', async () => {
  const tracking = new MemoryKv();
  const rateLimits = new MemoryKv();
  const env = {
    TRACKING: tracking,
    CHAT_RATE_LIMITS: rateLimits,
    AI_SCAN_HASH_KEY: 'test-only-ai-scan-hmac-key',
    SEND_WORKER_AI_SCAN_CAPI: 'false',
  };

  for (let index = 1; index <= 3; index += 1) {
    const response = await handleBooking(
      jsonRequest(validBody({
        submissionId: `sub_email_limit_request_${index}`,
        email: 'Same.Person@Example.com',
      }), { ip: `198.51.100.${index}` }),
      env,
      {},
      {},
    );
    assert.equal(response.status, 200, `request ${index}`);
  }

  const limited = await handleBooking(
    jsonRequest(validBody({
      submissionId: 'sub_email_limit_request_4',
      email: 'same.person@example.com',
    }), { ip: '198.51.100.4' }),
    env,
    {},
    {},
  );
  assert.equal(limited.status, 429);
  assert.deepEqual(await limited.json(), { ok: false, reason: 'rate_limited' });
  assert.ok([...rateLimits.values.keys()].some((key) => key.startsWith('ai_scan:email:')));
});

test('idempotent replay returns the saved answer and makes no second CRM or Meta call', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('/contacts/search/duplicate?')) return Response.json({ contact: null });
    if (call.href.endsWith('/contacts/')) return Response.json({ contact: { id: 'contact_replay' } });
    if (call.href.endsWith('/tags')) return Response.json({ tags: ['ai-scan-request'] });
    if (call.href.endsWith('/notes')) return Response.json({ note: { id: 'note_replay' } });
    if (call.href.includes('graph.facebook.com')) return Response.json({ events_received: 1 });
    throw new Error(`Unexpected request: ${call.method} ${call.href}`);
  });
  const id = submissionId(4);
  const env = crmEnv(tracking, {
    META_PIXEL_ID: '123456789',
    META_CAPI_ACCESS_TOKEN: 'test-meta-token',
    SEND_WORKER_AI_SCAN_CAPI: 'true',
  });
  const makeRequest = () => jsonRequest(validBody({ submissionId: id }), {
    url: PRODUCTION_URL,
    origin: 'https://autolander.ai',
  });

  const first = await handleBooking(makeRequest(), env, {}, {});
  const firstPayload = await first.json();
  assert.equal(first.status, 200);
  assert.equal(firstPayload.duplicate, false);
  const callCount = calls.length;
  assert.equal(callCount, 5);

  const replay = await handleBooking(makeRequest(), env, {}, {});
  assert.equal(replay.status, 200);
  assertSuccessPayload(await replay.json(), id, firstPayload.eventId, true);
  assert.equal(calls.length, callCount);
});

test('existing CRM contact is not updated and gets only additive tags and one note', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('/contacts/search/duplicate?')) {
      return Response.json({ contact: { id: 'contact_existing', phone: '+12125550123' } });
    }
    if (call.href.endsWith('/tags')) return Response.json({ ok: true });
    if (call.href.endsWith('/notes')) return Response.json({ note: { id: 'note_existing' } });
    throw new Error(`Unexpected request: ${call.method} ${call.href}`);
  });
  const id = submissionId(5);

  const response = await handleBooking(
    jsonRequest(validBody({ submissionId: id })),
    crmEnv(tracking),
    {},
    {},
  );

  assert.equal(response.status, 200);
  const eventId = `aiscan_${(await sha256Hex(`ai-scan:${id}`)).slice(0, 32)}`;
  assertSuccessPayload(await response.json(), id, eventId);
  assert.equal(calls.length, 3);
  assert.equal(calls[0].method, 'GET');
  const search = new URL(calls[0].href);
  assert.equal(search.pathname, '/contacts/search/duplicate');
  assert.equal(search.searchParams.get('locationId'), 'test-location');
  assert.equal(search.searchParams.get('email'), 'jamie@example.com');
  assert.equal(search.searchParams.get('number'), '+12125550123');
  assert.deepEqual(calls[1].body, { tags: ['ai-scan-request', 'ai-scan-sms-ok'] });
  assert.match(calls[2].body.body, /Matched; contact fields were not changed/);
  assert.match(calls[2].body.body, /Submission ID: sub_ai_scan_request_0005/);
  assert.match(calls[2].body.body, new RegExp(`Consent text version: ${SMS_CONSENT.version}`));
  assert.equal(calls.some(({ method }) => ['PUT', 'PATCH'].includes(method)), false);
  assert.equal(calls.some(({ href }) => /upsert|workflow|opportunit/i.test(href)), false);
  assert.equal(calls.some(({ href }) => new URL(href).pathname === '/contacts/'), false);
  const record = await storedRequest(tracking, id);
  assert.equal(record.crm, 'synced');
  assert.equal(record.crmContactId, 'contact_existing');
});

test('existing contact without a matching stored phone never receives the SMS-ok tag', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('/contacts/search/duplicate?')) {
      return Response.json({ contact: { id: 'contact_other_phone', phone: '+12125550199' } });
    }
    return Response.json({ ok: true });
  });

  const response = await handleBooking(
    jsonRequest(validBody({ submissionId: submissionId(6) })),
    crmEnv(tracking),
    {},
    {},
  );
  assert.equal(response.status, 200);
  const tags = calls.find(({ href }) => href.endsWith('/tags'));
  const note = calls.find(({ href }) => href.endsWith('/notes'));
  assert.deepEqual(tags.body, { tags: ['ai-scan-request'] });
  assert.match(note.body.body, /matched contact phone did not match/i);
});

test('new CRM contact is created, tagged, and noted with attribution-only custom fields', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('/contacts/search/duplicate?')) return Response.json({});
    if (call.href.endsWith('/contacts/')) return Response.json({ contact: { id: 'contact_new' } });
    if (call.href.endsWith('/tags')) return Response.json({ ok: true });
    if (call.href.endsWith('/notes')) return Response.json({ note: { id: 'note_new' } });
    throw new Error(`Unexpected request: ${call.method} ${call.href}`);
  });
  const forbiddenFieldIds = new Set([
    'cf_role',
    'cf_sms_consent',
    'cf_consent_timestamp',
    'cf_consent_version',
    'cf_external_id',
    'cf_meta_event_id',
    'cf_reminder',
  ]);
  const customFieldMap = {
    utm_source: 'cf_utm_source',
    landingPageUrl: 'cf_landing_page',
    userAgent: 'cf_user_agent',
    role: 'cf_role',
    smsConsent: 'cf_sms_consent',
    consentTimestamp: 'cf_consent_timestamp',
    consentTextVersion: 'cf_consent_version',
    submissionId: 'cf_external_id',
    metaEventId: 'cf_meta_event_id',
    reminder: 'cf_reminder',
  };
  const id = submissionId(7);

  const response = await handleBooking(
    jsonRequest(validBody({ submissionId: id })),
    crmEnv(tracking, { GHL_CUSTOM_FIELD_MAP: JSON.stringify(customFieldMap) }),
    {},
    {},
  );

  assert.equal(response.status, 200);
  const create = calls.find(({ href }) => new URL(href).pathname === '/contacts/');
  assert.ok(create);
  assert.equal(create.method, 'POST');
  assert.equal(create.body.locationId, 'test-location');
  assert.equal(create.body.firstName, 'Jamie');
  assert.equal(create.body.lastName, 'Dealer');
  assert.equal(create.body.email, 'jamie@example.com');
  assert.equal(create.body.phone, '+12125550123');
  assert.equal(create.body.website, 'https://example.com/');
  assert.equal(create.body.companyName, 'Example Motors');
  assert.equal(create.body.source, 'AutoLander AI Visibility scan');
  for (const key of ['assignedTo', 'owner', 'tags', 'role', 'smsConsent', 'consent', 'submissionId', 'metaEventId']) {
    assert.equal(Object.hasOwn(create.body, key), false, key);
  }
  const fieldIds = new Set(create.body.customFields.map(({ id }) => id).filter(Boolean));
  assert.equal(fieldIds.has('cf_utm_source'), true);
  assert.equal(fieldIds.has('cf_landing_page'), true);
  assert.equal(fieldIds.has('cf_user_agent'), true);
  for (const idValue of forbiddenFieldIds) assert.equal(fieldIds.has(idValue), false, idValue);
  const serializedFields = JSON.stringify(create.body.customFields);
  assert.equal(serializedFields.includes(SMS_CONSENT.version), false);
  assert.equal(serializedFields.includes(id), false);

  const tags = calls.find(({ href }) => href.endsWith('/tags'));
  const note = calls.find(({ href }) => href.endsWith('/notes'));
  assert.deepEqual(tags.body, { tags: ['ai-scan-request', 'ai-scan-sms-ok'] });
  assert.match(note.body.body, /Dealership: Example Motors/);
  assert.match(note.body.body, /Website: https:\/\/example\.com\//);
  assert.match(note.body.body, /Role: Owner \/ dealer principal/);
  assert.match(note.body.body, /Submission ID: sub_ai_scan_request_0007/);
  assert.equal(calls.some(({ method }) => ['PUT', 'PATCH'].includes(method)), false);
  assert.equal(calls.some(({ href }) => /upsert|workflow|opportunit/i.test(href)), false);
  const record = await storedRequest(tracking, id);
  assert.equal(record.crm, 'synced');
  assert.equal(record.crmContactId, 'contact_new');
});

test('unexpected duplicate-search shape performs no GHL write and marks needs_review', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  const logs = [];
  t.mock.method(console, 'error', (...args) => logs.push(args));
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    return Response.json({ contacts: [] });
  });
  const id = submissionId(8);

  const response = await handleBooking(
    jsonRequest(validBody({ submissionId: id })),
    crmEnv(tracking),
    {},
    {},
  );

  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'GET');
  assert.equal(calls.some(({ method }) => method !== 'GET'), false);
  const record = await storedRequest(tracking, id);
  assert.equal(record.crm, 'needs_review');
  assert.equal(logs.length, 1);
  assert.deepEqual(logs[0][1], { status: 200, keys: ['contacts'] });
  const serializedLogs = JSON.stringify(logs);
  assert.equal(serializedLogs.includes('jamie@example.com'), false);
  assert.equal(serializedLogs.includes('+12125550123'), false);
  assert.equal(serializedLogs.includes('Example Motors'), false);
});

test('the CRM duplicate reply with traceId and no contact creates, tags and notes', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('/contacts/search/duplicate?')) return Response.json({ contact: null, traceId: 'trace-example' });
    if (call.href.endsWith('/contacts/')) return Response.json({ contact: { id: 'contact_traced' }, traceId: 'trace-example' });
    if (call.href.endsWith('/tags')) return Response.json({ tags: ['ai-scan-request'], traceId: 'trace-example' });
    if (call.href.endsWith('/notes')) return Response.json({ note: { id: 'note_traced' }, traceId: 'trace-example' });
    throw new Error(`Unexpected request: ${call.method} ${call.href}`);
  });
  const id = submissionId(31);

  const response = await handleBooking(jsonRequest(validBody({ submissionId: id })), crmEnv(tracking), {}, {});

  assert.equal(response.status, 200);
  assert.deepEqual(calls.map(({ method, href }) => `${method} ${new URL(href).pathname.replace(/contact_traced/, ':id')}`), [
    'GET /contacts/search/duplicate',
    'POST /contacts/',
    'POST /contacts/:id/tags',
    'POST /contacts/:id/notes',
  ]);
  const record = await storedRequest(tracking, id);
  assert.equal(record.crm, 'synced');
  assert.equal(record.crmContactId, 'contact_traced');
});

test('the CRM duplicate reply with traceId and a contact only tags and notes that contact', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('/contacts/search/duplicate?')) {
      return Response.json({ contact: { id: 'contact_existing', phone: '+12125550123' }, traceId: 'trace-example' });
    }
    if (call.href.endsWith('/tags')) return Response.json({ ok: true });
    if (call.href.endsWith('/notes')) return Response.json({ note: { id: 'note_existing' } });
    throw new Error(`Unexpected request: ${call.method} ${call.href}`);
  });
  const id = submissionId(32);

  const response = await handleBooking(jsonRequest(validBody({ submissionId: id })), crmEnv(tracking), {}, {});

  assert.equal(response.status, 200);
  assert.equal(calls.some(({ href }) => new URL(href).pathname === '/contacts/'), false);
  assert.equal(calls.some(({ method }) => ['PUT', 'PATCH'].includes(method)), false);
  assert.equal(calls.some(({ href }) => /upsert|workflow|opportunit/i.test(href)), false);
  const record = await storedRequest(tracking, id);
  assert.equal(record.crm, 'synced');
  assert.equal(record.crmContactId, 'contact_existing');
});

test('a duplicate reply with an unknown extra key still fails closed', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(console, 'error', () => {});
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    calls.push(requestDetails(url, init));
    return Response.json({ contact: null, traceId: 'trace-example', contacts: [] });
  });
  const id = submissionId(33);

  const response = await handleBooking(jsonRequest(validBody({ submissionId: id })), crmEnv(tracking), {}, {});

  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.equal((await storedRequest(tracking, id)).crm, 'needs_review');
});

test('GHL failure never changes the success response and records CRM failure', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    calls.push(requestDetails(url, init));
    return new Response('temporary outage', { status: 503 });
  });
  const id = submissionId(9);

  const response = await handleBooking(
    jsonRequest(validBody({ submissionId: id })),
    crmEnv(tracking),
    {},
    {},
  );
  const eventId = `aiscan_${(await sha256Hex(`ai-scan:${id}`)).slice(0, 32)}`;

  assert.equal(response.status, 200);
  assertSuccessPayload(await response.json(), id, eventId);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'GET');
  assert.equal((await storedRequest(tracking, id)).crm, 'failed');
});

test('smsConsent false stores no consent block and never adds the SMS-ok tag', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('/contacts/search/duplicate?')) return Response.json({ contact: null });
    if (call.href.endsWith('/contacts/')) return Response.json({ contact: { id: 'contact_no_sms' } });
    return Response.json({ ok: true });
  });
  const id = submissionId(10);

  const response = await handleBooking(
    jsonRequest(validBody({
      submissionId: id,
      smsConsent: false,
      consentTimestamp: '2026-09-29T14:15:16.000Z',
      smsConsentVersion: SMS_CONSENT.version,
    })),
    crmEnv(tracking),
    {},
    {},
  );

  assert.equal(response.status, 200);
  const record = await storedRequest(tracking, id);
  assert.equal(record.smsConsent, false);
  assert.equal(Object.hasOwn(record, 'consent'), false);
  const tags = calls.find(({ href }) => href.endsWith('/tags'));
  assert.deepEqual(tags.body, { tags: ['ai-scan-request'] });
  const note = calls.find(({ href }) => href.endsWith('/notes'));
  assert.match(note.body.body, /Consent given: no/);
});

test('form consent tokens with surrounding whitespace are false and never add SMS consent', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('/contacts/search/duplicate?')) return Response.json({ contact: null });
    if (call.href.endsWith('/contacts/')) {
      return Response.json({ contact: { id: `contact_whitespace_${calls.length}` } });
    }
    return Response.json({ ok: true });
  });

  for (const [index, consentValue] of [' on ', ' true '].entries()) {
    const tracking = new MemoryKv();
    const id = `sub_form_whitespace_${index + 1}`;
    const firstCall = calls.length;
    const response = await handleBooking(
      formRequest({ submissionId: id, smsConsent: consentValue }),
      crmEnv(tracking),
      {},
      {},
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), FORM_SUCCESS);
    const record = await storedRequest(tracking, id);
    assert.equal(record.smsConsent, false, JSON.stringify(consentValue));
    assert.equal(Object.hasOwn(record, 'consent'), false, JSON.stringify(consentValue));
    const requestCalls = calls.slice(firstCall);
    const tags = requestCalls.find(({ href }) => href.endsWith('/tags'));
    assert.deepEqual(tags.body, { tags: ['ai-scan-request'] }, JSON.stringify(consentValue));
  }
});

test('form success generates a submission ID and redirects exactly without PII', async () => {
  const tracking = new MemoryKv();
  const response = await handleBooking(
    formRequest({
      submissionId: 'invalid-form-id',
      email: 'form.person@example.com',
      phone: '(415) 555-0123',
      dealershipName: 'Form Motors',
    }),
    baseEnv(tracking),
    {},
    {},
  );

  assert.equal(response.status, 303);
  const location = response.headers.get('location');
  assert.equal(location, FORM_SUCCESS);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(location.includes('form.person@example.com'), false);
  assert.equal(location.includes('415'), false);
  assert.equal(location.includes('Form Motors'), false);
  const requestKey = [...tracking.values.keys()].find((key) => key.startsWith('ai_scan:req:'));
  const id = requestKey.slice('ai_scan:req:'.length);
  assert.match(id, /^sub_[a-z2-7]{24}$/);
  const record = await storedRequest(tracking, id);
  assert.equal(record.status, 'received');
  assert.equal(record.smsConsent, true);
  assert.equal(record.consent.version, SMS_CONSENT.version);
});

test('form JSON attribution fields are parsed, sanitized, stored, and used by CRM', async (t) => {
  const tracking = new MemoryKv();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('/contacts/search/duplicate?')) return Response.json({ contact: null });
    if (call.href.endsWith('/contacts/')) {
      return Response.json({ contact: { id: 'contact_form_attribution' } });
    }
    return Response.json({ ok: true });
  });
  const id = 'sub_form_attribution_01';
  const attribution = {
    vid: 'v_formjson1234567890',
    fbp: 'fb.1.1700000000000.246813579',
    utms: {
      utm_source: 'facebook',
      utm_campaign: 'form-ai-scan',
      ignored_utm: 'must-not-survive',
    },
    firstTouch: {
      landing_page: 'https://autolander.ai/older-first-touch/',
      referrer: 'https://older-referrer.example/',
    },
    page: {
      landing_page: 'https://autolander.ai/ai-visibility/form-entry/',
      current_page: 'https://autolander.ai/ai-visibility/',
      referrer: 'https://facebook.com/',
      ignored_page: 'must-not-survive',
    },
    ignored_root: 'must-not-survive',
  };
  const organicAttribution = {
    utm_medium: 'organic',
    utm_term: 'dealer visibility',
    landing_page: 'https://autolander.ai/organic-first-touch/',
    referrer_url: 'https://www.google.com/search?q=dealer+visibility',
    ignored_organic: 'must-not-survive',
  };
  const fieldMap = {
    utm_source: 'cf_form_source',
    utm_medium: 'cf_form_medium',
    utm_term: 'cf_form_term',
    landing_page: 'cf_form_landing',
    referrer_url: 'cf_form_referrer',
    visitorId: 'cf_form_visitor',
  };

  const response = await handleBooking(
    formRequest({
      submissionId: id,
      attribution: JSON.stringify(attribution),
      organic_attribution: JSON.stringify(organicAttribution),
      landing_page: '',
      referrer_url: '',
      current_referrer: '',
    }),
    crmEnv(tracking, { GHL_CUSTOM_FIELD_MAP: JSON.stringify(fieldMap) }),
    {},
    {},
  );

  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), FORM_SUCCESS);
  const record = await storedRequest(tracking, id);
  assert.equal(record.attribution.vid, 'v_formjson1234567890');
  assert.equal(record.attribution.utms.utm_source, 'facebook');
  assert.equal(record.attribution.utms.utm_campaign, 'form-ai-scan');
  assert.equal(Object.hasOwn(record.attribution, 'ignored_root'), false);
  assert.equal(Object.hasOwn(record.attribution.utms, 'ignored_utm'), false);
  assert.equal(Object.hasOwn(record.attribution.page, 'ignored_page'), false);
  assert.equal(record.organic_attribution.utm_medium, 'organic');
  assert.equal(record.organic_attribution.utm_term, 'dealer visibility');
  assert.equal(Object.hasOwn(record.organic_attribution, 'ignored_organic'), false);
  assert.equal(record.landing_page, 'https://autolander.ai/organic-first-touch/');
  assert.equal(record.referrer_url, 'https://www.google.com/search?q=dealer+visibility');
  assert.equal(record.ghlUtms.utm_source, 'facebook');
  assert.equal(record.ghlUtms.utm_medium, 'organic');
  assert.equal(record.ghlUtms.utm_term, 'dealer visibility');

  const create = calls.find(({ href }) => new URL(href).pathname === '/contacts/');
  const crmFields = Object.fromEntries(
    create.body.customFields
      .filter(({ id: fieldId }) => fieldId)
      .map(({ id: fieldId, field_value: value }) => [fieldId, value]),
  );
  assert.equal(crmFields.cf_form_source, 'facebook');
  assert.equal(crmFields.cf_form_medium, 'organic');
  assert.equal(crmFields.cf_form_term, 'dealer visibility');
  assert.equal(crmFields.cf_form_landing, 'https://autolander.ai/organic-first-touch/');
  assert.equal(
    crmFields.cf_form_referrer,
    'https://www.google.com/search?q=dealer+visibility',
  );
  assert.equal(crmFields.cf_form_visitor, 'v_formjson1234567890');
  const note = calls.find(({ href }) => href.endsWith('/notes'));
  assert.match(note.body.body, /utm_medium: organic/);
  assert.match(note.body.body, /utm_term: dealer visibility/);
});

test('form invalid email redirects exactly to its non-PII error URL', async () => {
  const response = await handleBooking(
    formRequest({
      email: 'private-person-at-example.com',
      phone: '(415) 555-0123',
      dealershipName: 'Private Motors',
    }),
    baseEnv(),
    {},
    {},
  );

  assert.equal(response.status, 303);
  const location = response.headers.get('location');
  assert.equal(location, `${FORM_ERROR}invalid_email#scan-form`);
  assert.equal(location.includes('private-person'), false);
  assert.equal(location.includes('415'), false);
  assert.equal(location.includes('Private Motors'), false);
});

test('Meta sends AIScanRequest with deterministic ID only for production requests', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const call = requestDetails(url, init);
    calls.push(call);
    if (call.href.includes('graph.facebook.com')) return Response.json({ events_received: 1 });
    throw new Error(`Unexpected request: ${call.method} ${call.href}`);
  });
  const id = submissionId(11);
  const tracking = new MemoryKv();
  const env = baseEnv(tracking, {
    SEND_WORKER_AI_SCAN_CAPI: 'true',
    META_PIXEL_ID: '123456789',
    META_CAPI_ACCESS_TOKEN: 'test-meta-token',
  });

  const response = await handleBooking(
    jsonRequest(validBody({ submissionId: id }), {
      url: PRODUCTION_URL,
      origin: 'https://autolander.ai',
      ip: '203.0.113.55',
    }),
    env,
    {},
    {},
  );
  const expectedEventId = `aiscan_${(await sha256Hex(`ai-scan:${id}`)).slice(0, 32)}`;

  assert.equal(response.status, 200);
  assertSuccessPayload(await response.json(), id, expectedEventId);
  const graphCalls = calls.filter(({ href }) => href.includes('graph.facebook.com'));
  assert.equal(graphCalls.length, 1);
  const event = graphCalls[0].body.data[0];
  assert.equal(event.event_name, 'AIScanRequest');
  assert.equal(event.event_id, expectedEventId);
  assert.equal(event.event_source_url, 'https://autolander.ai/ai-visibility/');
  assert.equal(event.user_data.client_user_agent, 'Mozilla/5.0 AutoLander AI scan test browser');
  assert.equal(event.user_data.client_ip_address, '203.0.113.55');
  assert.equal(event.custom_data.content_name, 'ai_visibility_scan_requested');
  assert.equal(event.custom_data.content_category, 'ai_visibility');
  assert.equal(event.custom_data.role, ROLE_CHOICES[0]);
  assert.equal(event.custom_data.utm_source, 'facebook');
  assert.equal(event.custom_data.utm_campaign, 'ai_visibility');
  assert.equal([...tracking.values.keys()].includes(`evt:${expectedEventId}`), true);

  const beforePreview = calls.length;
  const preview = await handleBooking(
    jsonRequest(validBody({ submissionId: submissionId(12) })),
    baseEnv(new MemoryKv(), {
      SEND_WORKER_AI_SCAN_CAPI: 'true',
      META_PIXEL_ID: '123456789',
      META_CAPI_ACCESS_TOKEN: 'test-meta-token',
    }),
    {},
    {},
  );
  assert.equal(preview.status, 200);
  assert.equal(calls.length, beforePreview);

  const beforeOffSwitch = calls.length;
  const offSwitch = await handleBooking(
    jsonRequest(validBody({ submissionId: submissionId(13) }), {
      url: PRODUCTION_URL,
      origin: 'https://autolander.ai',
    }),
    baseEnv(new MemoryKv(), {
      SEND_WORKER_AI_SCAN_CAPI: 'false',
      META_PIXEL_ID: '123456789',
      META_CAPI_ACCESS_TOKEN: 'test-meta-token',
    }),
    {},
    {},
  );
  assert.equal(offSwitch.status, 200);
  assert.equal(calls.length, beforeOffSwitch);
});

test('AI scan GHL allowlist accepts only the four route shapes and rejects prohibited paths', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    calls.push(requestDetails(url, init));
    return Response.json({ ok: true });
  });
  const env = {};
  const config = { token: 'test-token', locationId: 'test-location' };
  const allowed = [
    ['/contacts/search/duplicate?locationId=test-location&email=a%40example.com&number=%2B12125550123', { method: 'GET' }],
    ['/contacts/', { method: 'POST', body: '{}' }],
    ['/contacts/contact_1/tags', { method: 'POST', body: '{"tags":[]}' }],
    ['/contacts/contact_1/notes', { method: 'POST', body: '{"body":"note"}' }],
  ];
  for (const [path, init] of allowed) {
    const result = await aiScanGhlRequest(env, config, path, init);
    assert.equal(result.ok, true, path);
  }
  assert.equal(calls.length, 4);

  const prohibited = [
    ['/contacts/search/duplicate', { method: 'GET' }],
    ['/contacts/search/duplicate?locationId=test-location', { method: 'POST' }],
    ['/contacts/upsert', { method: 'POST' }],
    ['/contacts/contact_1', { method: 'PUT' }],
    ['/contacts/contact_1/workflow/workflow_1', { method: 'POST' }],
    ['/opportunities/', { method: 'POST' }],
    ['/contacts/contact_1/tags/extra', { method: 'POST' }],
  ];
  for (const [path, init] of prohibited) {
    await assert.rejects(
      aiScanGhlRequest(env, config, path, init),
      /ai_scan_route_forbidden/,
      path,
    );
  }
  assert.equal(calls.length, 4, 'forbidden routes never reach fetch');
});
