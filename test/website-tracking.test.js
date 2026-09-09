import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { setImmediate } from 'node:timers';
import test from 'node:test';
import vm from 'node:vm';
import { handleBooking } from '../worker/src/booking/router.js';
import { handleCapi } from '../worker/src/capi/router.js';
import { verifyAttributionToken } from '../worker/src/attribution/router.js';
import { sha256Hex } from '../worker/src/capi/hash.js';

function browser(t, { url = 'https://autolander.ai/', cookies = {}, organic = null, referrer = '' } = {}) {
  const descriptors = Object.fromEntries(['window', 'document', 'navigator'].map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  t.after(() => {
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  const jar = new Map(Object.entries(cookies));
  const local = new Map(organic ? [['al_attrib', JSON.stringify(organic)]] : []);
  const storage = (values) => ({
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value)),
  });
  const pixel = [];
  const listeners = [];
  const timers = [];
  const document = { referrer, title: 'AutoLander', documentElement: {} };
  Object.defineProperty(document, 'cookie', {
    get: () => [...jar].map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('; '),
    set: (serialized) => {
      const [pair] = serialized.split(';');
      const separator = pair.indexOf('=');
      jar.set(pair.slice(0, separator), decodeURIComponent(pair.slice(separator + 1)));
    },
  });
  const window = {
    location: new URL(url), localStorage: storage(local), sessionStorage: storage(new Map()),
    fbq: (...args) => pixel.push({ args, fbp: jar.get('_fbp') }),
    addEventListener: (...args) => listeners.push(args),
    setTimeout: (...args) => timers.push(args),
    innerWidth: 1440, innerHeight: 900, screen: {},
  };
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: window },
    document: { configurable: true, value: document },
    navigator: { configurable: true, value: { userAgent: 'Mozilla/5.0 tracking regression test' } },
  });
  return { jar, pixel, listeners, timers, local };
}

async function trackerModule() {
  // Use the browser module with the same build-time environment substitutions
  // Vite makes. Identity and the actual tracker implementation stay intact.
  const identityUrl = new URL(`../src/lib/identity.js?tracking=${crypto.randomUUID()}`, import.meta.url).href;
  const sharedUrl = new URL('../shared/meta-signal.js', import.meta.url).href;
  const source = (await readFile(new URL('../src/lib/tracker.js', import.meta.url), 'utf8'))
    .replace("'./identity.js'", JSON.stringify(identityUrl))
    .replace("'../../shared/meta-signal.js'", JSON.stringify(sharedUrl))
    .replaceAll('import.meta.env', JSON.stringify({
      MODE: 'production', VITE_META_PIXEL_ID: '123456789', VITE_CAPI_URL: 'https://autolander.ai',
    }));
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

test('first PageView has _fbp before Pixel init and sends browser/server together with one ID', async (t) => {
  const harness = browser(t);
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    requests.push({ url, body: JSON.parse(init.body), init });
    return Response.json({ ok: true });
  });
  const { pageView } = await trackerModule();
  pageView();

  assert.match(harness.jar.get('_fbp'), /^fb\.1\.\d{13}\.\d+$/);
  assert.equal(harness.pixel.length, 2);
  assert.equal(harness.pixel[0].args[0], 'init');
  assert.equal(harness.pixel[0].fbp, harness.jar.get('_fbp'));
  assert.equal(harness.pixel[1].args[1], 'PageView');
  assert.equal(requests.length, 1, 'server delivery starts synchronously without a timer');
  assert.equal(requests[0].body.event, 'PageView');
  assert.equal(requests[0].body.fbp, harness.pixel[1].fbp);
  assert.equal(requests[0].body.eventId, harness.pixel[1].args[3].eventID);
  assert.equal(requests[0].init.keepalive, true);
  assert.equal(harness.listeners.some(([event]) => event === 'scroll'), false);
  assert.deepEqual(harness.timers.map(([, delay]) => delay), [15000]);
});

test('OutboundClick carries the exact stored fbc through browser payload and Worker CAPI', async (t) => {
  const fbc = 'fb.1.1700000000000.MiXeD_Click-ID';
  const fbp = 'fb.1.1700000000000.123456789';
  const harness = browser(t, { cookies: { _fbc: fbc, _fbp: fbp } });
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    requests.push({ url: String(url), body: JSON.parse(init.body) });
    return Response.json({ ok: true, events_received: 1 });
  });
  const { trackCustom } = await trackerModule();
  const customData = {
    content_name: 'download', content_label: 'Download for Windows',
    content_category: 'desktop_app', action: 'download_installer', destination: 'github_release',
  };
  trackCustom('OutboundClick', customData);
  const payload = requests[0].body;
  assert.equal(payload.fbc, fbc);
  assert.equal(payload.fbp, fbp);
  assert.deepEqual(payload.customData, customData);
  assert.equal(payload.eventId, harness.pixel[1].args[3].eventID);

  const trackingValues = new Map();
  const response = await handleCapi(new Request('https://autolander.ai/capi/track', {
    method: 'POST', headers: {
      Origin: 'https://autolander.ai', 'Content-Type': 'application/json',
      'User-Agent': navigator.userAgent,
    }, body: JSON.stringify(payload),
  }), {
    DISABLE_RATE_LIMITS: 'true', META_PIXEL_ID: '123456789', META_CAPI_ACCESS_TOKEN: 'test-token',
    TRACKING: {
      get: async (key, type) => {
        const value = trackingValues.get(key);
        return value === undefined ? null : type === 'json' ? JSON.parse(value) : value;
      },
      put: async (key, value) => trackingValues.set(key, value),
    },
  }, {});
  assert.equal(response.status, 200);
  const event = requests.find(({ url }) => url.includes('graph.facebook.com')).body.data[0];
  assert.equal(event.event_id, payload.eventId);
  assert.equal(event.user_data.fbc, fbc);
  assert.equal(event.custom_data.content_name, 'download');
  assert.equal(event.custom_data.content_label, 'Download for Windows');
});

test('the build queues Pixel immediately and keeps the production origin gate', async () => {
  const source = await readFile(new URL('../vite.config.js', import.meta.url), 'utf8');
  const script = source.match(/const script = `[\s\S]*?<script>([\s\S]*?)<\/script>/)[1];
  for (const origin of ['https://autolander.ai', 'https://preview.autolander.ai']) {
    const inserted = [];
    const window = { location: { origin } };
    vm.runInNewContext(script, {
      window,
      document: {
        createElement: () => ({}),
        getElementsByTagName: () => [{ parentNode: { insertBefore: (element) => inserted.push(element) } }],
      },
    });
    assert.equal(inserted.length, origin === 'https://autolander.ai' ? 1 : 0);
    if (inserted.length) {
      assert.equal(inserted[0].async, true);
      assert.equal(inserted[0].src, 'https://connect.facebook.net/en_US/fbevents.js');
    }
  }
});

test('thank-you PageView is paired on both channels without weakening verified Lead delivery', async (t) => {
  const harness = browser(t, {
    url: `https://autolander.ai/thank-you?bt=${'a'.repeat(32)}`,
    cookies: { al_vid: 'v_abcdefghijklmnopqrstuv', al_attr: JSON.stringify({
      utm_source: 'meta', utm_medium: 'paid_social', landing_page: 'https://autolander.ai/first',
    }) },
  });
  const html = await readFile(new URL('../public/thank-you.html', import.meta.url), 'utf8');
  const script = html.match(/<!-- Meta Pixel Code -->\s*<script>([\s\S]*?)<\/script>/)[1];
  const requests = [];
  const expectedLeadId = `lead_${'b'.repeat(32)}`;
  const context = {
    ...window, document, crypto, URLSearchParams, Uint32Array,
    history: { replaceState: () => {} },
    fetch: async (url, init) => {
      requests.push({ url, body: JSON.parse(init.body) });
      if (url.endsWith('/capi/confirm')) return Response.json({
        ok: true, eventName: 'Lead', eventId: expectedLeadId,
        externalId: '2087440198847151:v_abcdefghijklmnopqrstuv', am: { em: 'c'.repeat(64) },
      });
      return Response.json({ ok: true });
    },
  };
  context.window = context;
  vm.runInNewContext(script, context);
  await new Promise((resolve) => setImmediate(resolve));
  const pageView = harness.pixel.find(({ args }) => args[1] === 'PageView');
  const serverPageView = requests.find(({ body }) => body.event === 'PageView').body;
  assert.equal(pageView.args[3].eventID, serverPageView.eventId);
  assert.match(pageView.fbp, /^fb\.1\.\d{13}\.\d+$/);
  assert.equal(serverPageView.fbp, pageView.fbp);
  assert.equal(serverPageView.utms.utm_source, 'meta');
  assert.equal(serverPageView.firstTouch.utm_medium, 'paid_social');
  assert.equal(serverPageView.page.landing_page, 'https://autolander.ai/first');
  const leads = harness.pixel.filter(({ args }) => args[1] === 'Lead');
  assert.equal(leads.length, 1);
  assert.equal(leads[0].args[3].eventID, expectedLeadId);
  const init = harness.pixel.find(({ args }) => args[0] === 'init');
  assert.equal(init.args[2].em, 'c'.repeat(64));
});

const leadBody = {
  fullName: 'Jamie Dealer', email: 'jamie@example.com', phone: '(212) 555-0123', role: 'Owner',
  inventoryUrl: 'https://example.com/inventory', vehicleCount: '1-50',
  consentTimestamp: '2026-09-08T12:00:00.000Z', submissionId: 'sub_attribution_fallback_123',
};
const fieldIds = {
  utm_source: 'mZYHmNxMRcoKnxgnDDls', utm_medium: 'TBJbLH9MmAae7oFCGVYJ',
  landing_page: 'xuD9mpOm4dhav7USCLQK', referrer_url: 'QC7uBSRjA73HVXZ1B1q6',
};

test('accepted demo signs actual CRM identity and normalized applicant hashes into signup token', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => (
    String(url).endsWith('/contacts/upsert')
      ? Response.json({ contact: { id: 'contact_accepted_demo' } }) : Response.json({ ok: true })
  ));
  const env = {
    ATTRIBUTION_SIGNING_SECRET: 'unit-test-only-secret-at-least-32-characters',
    DISABLE_RATE_LIMITS: 'true', GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token',
    GHL_LOCATION_ID: 'test-location', GHL_WORKFLOW_ID: 'test-workflow',
  };
  const response = await handleBooking(new Request('https://preview.autolander.ai/api/apply', {
    method: 'POST', headers: {
      Origin: 'https://preview.autolander.ai', 'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 accepted demo attribution test',
    }, body: JSON.stringify({
      ...leadBody, email: 'Jamie@Example.com',
      attribution: { ghl_contact_id: 'forged', fbc: 'fb.1.1700000000000.MiXeD_Click-ID' },
      organic_attribution: { utm_source: 'google', utm_medium: 'organic', landing_page: '/guide/first/' },
      current_page: 'https://autolander.ai/submit',
    }),
  }), env, {}, {});
  assert.equal(response.status, 200);
  const payload = await response.json();
  const verified = await verifyAttributionToken(env, payload.attribution_token);
  assert.equal(verified.attribution.ghl_contact_id, 'contact_accepted_demo');
  assert.equal(verified.attribution.ghl_email_sha256, await sha256Hex('jamie@example.com'));
  assert.equal(verified.attribution.ghl_phone_sha256, await sha256Hex('12125550123'));
  assert.equal(verified.attribution.fbc, 'fb.1.1700000000000.MiXeD_Click-ID');
  assert.equal(verified.attribution.landing_url, 'https://autolander.ai/guide/first/');
  assert.equal(verified.attribution.utm_source, 'google');
  assert.equal(payload.eventId, `lead_${(await sha256Hex(`lead:${leadBody.submissionId}`)).slice(0, 32)}`);
});

for (const scenario of [
  {
    name: 'organic first touch wins for landing and referrer while paid UTMs retain priority',
    body: {
      organic_attribution: { utm_source: 'google', utm_medium: 'organic', landing_page: '/guide/first/', referrer_url: 'https://google.com/' },
      attribution: { utms: { utm_source: 'facebook', utm_medium: 'paid_social' }, firstTouch: { landing_page: 'https://autolander.ai/paid', referrer: 'https://facebook.com/' } },
      current_page: 'https://autolander.ai/submit', current_referrer: 'https://autolander.ai/other',
    },
    expected: ['facebook', 'paid_social', '/guide/first/', 'https://google.com/'],
  },
  {
    name: 'paid cookie is used when organic storage is absent',
    body: {
      attribution: { firstTouch: { utm_source: 'facebook', utm_medium: 'paid_social', landing_page: 'https://autolander.ai/paid', referrer: 'https://facebook.com/' } },
      current_page: 'https://autolander.ai/submit', current_referrer: 'https://autolander.ai/other',
    },
    expected: ['facebook', 'paid_social', 'https://autolander.ai/paid', 'https://facebook.com/'],
  },
  {
    name: 'submit-time browser values cover missing first-touch storage',
    body: { current_page: 'https://autolander.ai/submit', current_referrer: 'https://partner.example/' },
    expected: ['direct', 'none', 'https://autolander.ai/submit', 'https://partner.example/'],
  },
  {
    name: 'legacy clients fall back to the Referer header',
    body: {}, header: 'https://autolander.ai/legacy',
    expected: ['direct', 'none', 'https://autolander.ai/legacy', 'https://autolander.ai/legacy'],
  },
]) {
  test(`application CRM fallback: ${scenario.name}`, async (t) => {
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (url, init) => {
      requests.push({ url: String(url), init });
      if (String(url).endsWith('/contacts/upsert')) return Response.json({ contact: { id: 'contact_123' } });
      return Response.json({ ok: true });
    });
    const response = await handleBooking(new Request('https://preview.autolander.ai/api/apply', {
      method: 'POST', headers: {
        Origin: 'https://preview.autolander.ai', 'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 CRM fallback regression test', ...(scenario.header ? { Referer: scenario.header } : {}),
      }, body: JSON.stringify({ ...leadBody, ...scenario.body }),
    }), {
      DISABLE_RATE_LIMITS: 'true', GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token', GHL_LOCATION_ID: 'test-location',
      GHL_WORKFLOW_ID: 'test-workflow', GHL_CUSTOM_FIELD_MAP: JSON.stringify(fieldIds),
    }, {}, {});
    assert.equal(response.status, 200);
    const updated = JSON.parse(requests.find(({ init }) => init.method === 'PUT').init.body).customFields;
    const fields = Object.fromEntries(updated.map(({ id, field_value }) => [id, field_value]));
    assert.deepEqual(Object.values(fieldIds).map((id) => fields[id]), scenario.expected);
    const upsert = JSON.parse(requests.find(({ url }) => url.endsWith('/contacts/upsert')).init.body);
    assert.equal(upsert.source, 'AutoLander website application');
    assert.ok(requests.some(({ url }) => url.endsWith('/workflow/test-workflow')));
  });
}

for (const withPaidCookie of [true, false]) {
  test(`browser submits current context and ${withPaidCookie ? 'paid' : 'current'} landing/referrer fallback`, async (t) => {
    const paid = { landing_page: 'https://autolander.ai/paid', referrer: 'https://facebook.com/', utm_source: 'facebook' };
    browser(t, {
      url: 'https://autolander.ai/submit', referrer: 'https://partner.example/',
      cookies: withPaidCookie ? { al_attr: JSON.stringify(paid) } : {},
    });
    let submitted;
    t.mock.method(globalThis, 'fetch', async (_url, init) => {
      submitted = JSON.parse(init.body);
      return Response.json({ ok: true, attribution_token: 'signed-demo-token' });
    });
    const { submitApplication } = await import(`../src/lib/demo-application.js?fallback=${crypto.randomUUID()}`);
    await submitApplication(leadBody);
    assert.equal(submitted.current_page, 'https://autolander.ai/submit');
    assert.equal(submitted.current_referrer, 'https://partner.example/');
    assert.equal(submitted.landing_page, withPaidCookie ? paid.landing_page : submitted.current_page);
    assert.equal(submitted.referrer_url, withPaidCookie ? paid.referrer : submitted.current_referrer);
    assert.equal(window.localStorage.getItem('al_signup_attribution_token'), 'signed-demo-token');
  });
}
