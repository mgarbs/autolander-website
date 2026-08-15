import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { handleBooking } from '../worker/src/booking/router.js';
import { handleCapi } from '../worker/src/capi/router.js';
import { hashLowercase, sha256Hex } from '../worker/src/capi/hash.js';
import { isAllowedEvent, normalizePostalCode } from '../worker/src/capi/validators.js';
import {
  canonicalMetaExternalId,
  isCanonicalMetaExternalId,
  isProductionMetaHostname,
  isProductionMetaRequest,
  isProductionMetaUrl,
} from '../shared/meta-signal.js';

const PIXEL_ID = '123456789';
const VISITOR_ID = 'v_abcdefghijklmnopqrstuv';
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36';

class MemoryKv {
  constructor() {
    this.values = new Map();
  }

  async get(key, type) {
    const value = this.values.get(key);
    if (value === undefined) return null;
    return type === 'json' ? JSON.parse(value) : value;
  }

  async put(key, value) {
    this.values.set(key, String(value));
  }

  async delete(key) {
    this.values.delete(key);
  }
}

function metaEnv(tracking = new MemoryKv()) {
  return {
    DISABLE_RATE_LIMITS: 'true',
    GHL_PRIVATE_INTEGRATION_TOKEN: 'test-ghl-token',
    GHL_LOCATION_ID: 'test-location',
    GHL_WORKFLOW_ID: 'test-workflow',
    META_CAPI_ACCESS_TOKEN: 'test-meta-token',
    META_PIXEL_ID: PIXEL_ID,
    TRACKING: tracking,
  };
}

function applicationRequest({
  origin = 'https://autolander.ai',
  requestUrl = 'https://autolander.ai/api/apply',
  submissionId = 'sub_meta_signal_quality_123',
  visitorId = VISITOR_ID,
  cf = { country: 'US', region: 'GA', city: 'Atlanta', postalCode: '30301' },
} = {}) {
  const request = new Request(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      'User-Agent': BROWSER_UA,
    },
    body: JSON.stringify({
      fullName: 'Jamie Dealer',
      email: 'jamie@example.com',
      phone: '(212) 555-0123',
      role: 'Owner',
      inventoryUrl: 'https://example.com/inventory',
      vehicleCount: '51-150',
      consentTimestamp: '2026-08-04T12:00:00.000Z',
      submissionId,
      attribution: {
        vid: visitorId,
        page: {
          current_page: `${origin}/`,
          landing_page: `${origin}/`,
        },
      },
    }),
  });
  Object.defineProperty(request, 'cf', { value: cf });
  return request;
}

function installNetworkMock(t) {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const href = String(url);
    requests.push({ href, init });
    if (href.includes('/contacts/upsert')) {
      return Response.json({ contact: { id: 'contact_meta_123' } });
    }
    if (href.includes('/notes')) {
      return Response.json({ note: { id: 'note_meta_123' } });
    }
    return Response.json({ events_received: 1 });
  });
  return requests;
}

function graphRequests(requests) {
  return requests.filter(({ href }) => href.includes('graph.facebook.com'));
}

test('postal codes are normalized for Meta user data', () => {
  assert.equal(normalizePostalCode('30301-1234'), '30301');
  assert.equal(normalizePostalCode(' 30301 '), '30301');
  assert.equal(normalizePostalCode('SW1A 1AA', 'GB'), 'sw1a1aa');
  assert.equal(normalizePostalCode('ABC', 'us'), '');
  assert.equal(normalizePostalCode(''), '');
  assert.equal(normalizePostalCode(undefined), '');
});

test('production Meta host and external-ID policies are positive allowlists', () => {
  assert.equal(isProductionMetaHostname('autolander.ai'), true);
  assert.equal(isProductionMetaHostname('WWW.AUTOLANDER.AI'), true);
  for (const hostname of [
    'localhost',
    '127.0.0.1',
    'preview.autolander.ai',
    'autolander-preview.pages.dev',
    'autolander-chatbot.michaelegarber.workers.dev',
    'mgarbs.github.io',
  ]) {
    assert.equal(isProductionMetaHostname(hostname), false, hostname);
  }
  assert.equal(isProductionMetaUrl('https://autolander.ai/thank-you'), true);
  assert.equal(isProductionMetaUrl('http://autolander.ai/thank-you'), false);
  assert.equal(isProductionMetaUrl('https://autolander.ai:8443/thank-you'), false);
  assert.equal(isProductionMetaUrl('https://preview.autolander.ai/thank-you'), false);

  const request = new Request('https://autolander.ai/capi/track', {
    headers: { Origin: 'https://www.autolander.ai' },
  });
  assert.equal(isProductionMetaRequest(request), true);
  assert.equal(
    isProductionMetaRequest(new Request('https://autolander.ai/capi/track', {
      headers: { Origin: 'http://localhost:5173' },
    })),
    false,
  );

  const externalId = canonicalMetaExternalId(PIXEL_ID, VISITOR_ID.toUpperCase());
  assert.equal(externalId, `${PIXEL_ID}:${VISITOR_ID}`);
  assert.equal(isCanonicalMetaExternalId(externalId, PIXEL_ID), true);
  assert.equal(isCanonicalMetaExternalId(`${PIXEL_ID}:contact_123`, PIXEL_ID), false);
});

test('verified Lead uses one deterministic ID and one external identity end to end', async (t) => {
  const tracking = new MemoryKv();
  const env = metaEnv(tracking);
  const requests = installNetworkMock(t);
  const submissionId = 'sub_meta_signal_quality_123';

  const first = await handleBooking(applicationRequest({ submissionId }), env, {}, {});
  assert.equal(first.status, 200);
  const payload = await first.json();
  assert.equal(payload.ok, true);
  assert.match(payload.bt, /^[a-f0-9]{32}$/);

  const expectedEventId = `lead_${(await sha256Hex(`lead:${submissionId}`)).slice(0, 32)}`;
  const expectedExternalId = canonicalMetaExternalId(PIXEL_ID, VISITOR_ID);
  assert.equal(payload.eventId, expectedEventId);

  const metaCalls = graphRequests(requests);
  assert.equal(metaCalls.length, 1);
  const metaEvent = JSON.parse(metaCalls[0].init.body).data[0];
  assert.equal(metaEvent.event_name, 'Lead');
  assert.equal(metaEvent.event_id, expectedEventId);
  assert.equal(metaEvent.user_data.external_id, await hashLowercase(expectedExternalId));
  assert.equal(metaEvent.user_data.zp, await sha256Hex('30301'));
  assert.equal(metaEvent.user_data.ct, await hashLowercase('atlanta'));
  assert.equal(metaEvent.user_data.st, await hashLowercase('ga'));
  assert.equal(metaEvent.user_data.country, await hashLowercase('us'));
  assert.deepEqual(
    {
      content_name: metaEvent.custom_data.content_name,
      content_category: metaEvent.custom_data.content_category,
      lead_type: metaEvent.custom_data.lead_type,
    },
    {
      content_name: 'demo_application_submitted',
      content_category: 'demo',
      lead_type: 'website_application',
    },
  );

  const advancedMatchingKeys = ['em', 'ph', 'fn', 'ln', 'ct', 'st', 'zp', 'country'];
  const expectedAm = Object.fromEntries(
    advancedMatchingKeys.map((key) => [key, metaEvent.user_data[key]]),
  );
  const tokenRecord = JSON.parse(await tracking.get(`booktok:${payload.bt}`));
  assert.deepEqual(tokenRecord, {
    e: expectedEventId,
    n: 'Lead',
    x: expectedExternalId,
    a: expectedAm,
  });

  const duplicate = await handleBooking(applicationRequest({ submissionId }), env, {}, {});
  const duplicatePayload = await duplicate.json();
  assert.equal(duplicatePayload.duplicate, true);
  assert.equal(duplicatePayload.eventId, expectedEventId);
  assert.equal(duplicatePayload.bt, payload.bt);
  assert.equal(graphRequests(requests).length, 1);

  const confirmed = await handleCapi(
    new Request('https://autolander.ai/capi/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://autolander.ai',
        'User-Agent': BROWSER_UA,
      },
      body: JSON.stringify({ bt: payload.bt }),
    }),
    env,
    {},
  );
  assert.equal(confirmed.status, 200);
  const confirmedText = await confirmed.text();
  const confirmedPayload = JSON.parse(confirmedText);
  assert.deepEqual(confirmedPayload, {
    ok: true,
    eventId: expectedEventId,
    eventName: 'Lead',
    externalId: expectedExternalId,
    am: expectedAm,
  });
  for (const key of advancedMatchingKeys) {
    assert.equal(confirmedPayload.am[key], metaEvent.user_data[key], key);
  }
  const confirmedTextLower = confirmedText.toLowerCase();
  for (const plaintext of [
    'jamie@example.com',
    '(212) 555-0123',
    '2125550123',
    '+12125550123',
    'jamie',
    'dealer',
  ]) {
    assert.equal(confirmedTextLower.includes(plaintext), false, plaintext);
  }

  const reused = await handleCapi(
    new Request('https://autolander.ai/capi/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://autolander.ai',
        'User-Agent': BROWSER_UA,
      },
      body: JSON.stringify({ bt: payload.bt }),
    }),
    env,
    {},
  );
  assert.equal(reused.status, 403);
});

test('incomplete Lead tokens fail closed and preview cannot consume a valid token', async () => {
  const tracking = new MemoryKv();
  const env = metaEnv(tracking);
  const legacyToken = 'a'.repeat(32);
  await tracking.put(`booktok:${legacyToken}`, '1');

  const legacy = await handleCapi(
    new Request('https://autolander.ai/capi/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://autolander.ai',
        'User-Agent': BROWSER_UA,
      },
      body: JSON.stringify({ bt: legacyToken }),
    }),
    env,
    {},
  );
  assert.equal(legacy.status, 409);
  assert.deepEqual(await legacy.json(), { ok: false, reason: 'incomplete_lead_identity' });

  const validToken = 'b'.repeat(32);
  const eventId = `lead_${'c'.repeat(32)}`;
  const externalId = canonicalMetaExternalId(PIXEL_ID, VISITOR_ID);
  await tracking.put(
    `booktok:${validToken}`,
    JSON.stringify({ e: eventId, n: 'Lead', x: externalId }),
  );

  const preview = await handleCapi(
    new Request('https://autolander.ai/capi/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://preview.autolander.ai',
        'User-Agent': BROWSER_UA,
      },
      body: JSON.stringify({ bt: validToken }),
    }),
    env,
    {},
  );
  assert.equal(preview.status, 403);
  assert.notEqual(await tracking.get(`booktok:${validToken}`), null);

  const production = await handleCapi(
    new Request('https://autolander.ai/capi/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://autolander.ai',
        'User-Agent': BROWSER_UA,
      },
      body: JSON.stringify({ bt: validToken }),
    }),
    env,
    {},
  );
  assert.equal(production.status, 200);
  assert.deepEqual(await production.json(), {
    ok: true,
    eventId,
    eventName: 'Lead',
    externalId,
    am: {},
  });
});

test('localhost and preview browser signals never call the production Meta endpoint', async (t) => {
  const requests = installNetworkMock(t);
  const cases = [
    ['https://autolander.ai', 'http://localhost:5173'],
    ['https://autolander.ai', 'http://127.0.0.1:4173'],
    ['https://autolander.ai', 'https://preview.autolander.ai'],
    ['https://autolander-preview.pages.dev', 'https://autolander-preview.pages.dev'],
    ['https://autolander-chatbot.michaelegarber.workers.dev', 'https://autolander.ai'],
    ['https://mgarbs.github.io', 'https://mgarbs.github.io'],
  ];

  for (const [host, origin] of cases) {
    const tracking = new MemoryKv();
    const response = await handleCapi(
      new Request(`${host}/capi/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: origin, 'User-Agent': BROWSER_UA },
        body: JSON.stringify({
          event: 'OutboundClick',
          eventId: `evt_${Math.random().toString(36).slice(2, 14)}`,
          sourceUrl: `${origin}/`,
          vid: VISITOR_ID,
        }),
      }),
      metaEnv(tracking),
      {},
    );
    assert.equal(response.status, 200, `${host} ${origin}`);
    assert.equal((await response.json()).skipped, 'non_production_meta_origin');
    assert.equal(tracking.values.size, 0);
  }

  assert.equal(graphRequests(requests).length, 0);
});

test('production browser signals still send with matching visitor external_id', async (t) => {
  const requests = installNetworkMock(t);
  for (const [host, origin, suffix] of [
    ['https://autolander.ai', 'https://autolander.ai', 'root'],
    ['https://www.autolander.ai', 'https://www.autolander.ai', 'www'],
  ]) {
    const response = await handleCapi(
      new Request(`${host}/capi/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: origin, 'User-Agent': BROWSER_UA },
        body: JSON.stringify({
          event: 'OutboundClick',
          eventId: `evt_production_${suffix}`,
          sourceUrl: `${origin}/`,
          vid: VISITOR_ID,
        }),
      }),
      metaEnv(new MemoryKv()),
      {},
    );
    assert.equal(response.status, 200);
  }

  const calls = graphRequests(requests);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    const event = JSON.parse(call.init.body).data[0];
    assert.equal(
      event.user_data.external_id,
      await hashLowercase(canonicalMetaExternalId(PIXEL_ID, VISITOR_ID)),
    );
  }
});

test('preview and localhost applications cannot mint or send a production Lead', async (t) => {
  const requests = installNetworkMock(t);
  for (const [origin, suffix] of [
    ['http://localhost:5173', 'localhost'],
    ['https://preview.autolander.ai', 'preview'],
    ['https://autolander-preview.pages.dev', 'pages'],
  ]) {
    const tracking = new MemoryKv();
    const response = await handleBooking(
      applicationRequest({ origin, submissionId: `sub_nonproduction_${suffix}_123` }),
      metaEnv(tracking),
      {},
      {},
    );
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.bt, '');
    assert.equal(
      [...tracking.values.keys()].some((key) => key.startsWith('booktok:') || key.startsWith('evt:')),
      false,
    );
  }
  assert.equal(graphRequests(requests).length, 0);
});

test('download clicks are truthful OutboundClick events, not checkouts or completed downloads', async () => {
  const [appSource, thankYouSource, trackerSource, viteSource, envSource] = await Promise.all([
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../public/thank-you.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/tracker.js', import.meta.url), 'utf8'),
    readFile(new URL('../vite.config.js', import.meta.url), 'utf8'),
    readFile(new URL('../.env', import.meta.url), 'utf8'),
  ]);

  assert.equal(isAllowedEvent('AppDownload'), false);
  assert.equal(isAllowedEvent('InitiateCheckout'), false);
  assert.equal(isAllowedEvent('OutboundClick'), true);
  assert.doesNotMatch(appSource, /AppDownload/);
  assert.doesNotMatch(appSource, /track\(['"]InitiateCheckout['"]/);
  assert.equal((appSource.match(/trackCustom\('OutboundClick'/g) || []).length, 3);
  assert.match(appSource, /action: 'download_installer'/);
  assert.match(appSource, /action: 'open_installed_app'/);

  assert.match(thankYouSource, /\^lead_\[a-f0-9\]\{32\}\$/);
  assert.match(thankYouSource, /data\.eventName !== 'Lead'/);
  assert.match(thankYouSource, /external_id: externalId/);
  assert.match(thankYouSource, /data\.am/);
  assert.match(thankYouSource, /\^\[a-f0-9\]\{64\}\$/);
  assert.match(thankYouSource, /fbq\('track', 'Lead'/);
  assert.match(thankYouSource, /\{ eventID: eventId \}/);
  assert.doesNotMatch(thankYouSource, /browserExternalId !== externalId/);
  assert.match(thankYouSource, /location\.origin !== 'https:\/\/autolander\.ai'/);
  assert.match(thankYouSource, /location\.origin !== 'https:\/\/www\.autolander\.ai'/);
  assert.doesNotMatch(thankYouSource, /vid \|\| bt/);
  assert.doesNotMatch(thankYouSource, /facebook\.com\/tr\?id=/);

  assert.match(trackerSource, /canonicalMetaExternalId/);
  assert.match(trackerSource, /isProductionMetaUrl/);
  assert.match(viteSource, /window\.location\.origin!=='https:\/\/autolander\.ai'/);
  assert.match(viteSource, /window\.location\.origin!=='https:\/\/www\.autolander\.ai'/);
  assert.doesNotMatch(viteSource, /facebook\.com\/tr\?id=/);

  const configuredPixelId = envSource.match(/^VITE_META_PIXEL_ID=(.+)$/m)?.[1]?.trim();
  const thankYouPixelId = thankYouSource.match(/var PIXEL_ID = '([^']+)'/)?.[1];
  assert.equal(thankYouPixelId, configuredPixelId);
});
