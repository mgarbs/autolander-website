import assert from 'node:assert/strict';
import test from 'node:test';

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

function cookieDocument(initial) {
  const values = new Map(Object.entries(initial));
  const document = {
    referrer: 'https://www.facebook.com/',
    title: 'AutoLander',
    documentElement: { clientWidth: 1440, clientHeight: 900 },
  };
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get() {
      return [...values].map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('; ');
    },
    set(serialized) {
      const [pair] = String(serialized).split(';');
      const separator = pair.indexOf('=');
      values.set(pair.slice(0, separator), decodeURIComponent(pair.slice(separator + 1)));
    },
  });
  return document;
}

test('submit keeps the existing Meta payload exact and sends organic fields separately', async (t) => {
  const originalDescriptors = Object.fromEntries(
    ['window', 'document', 'navigator'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  t.after(() => {
    for (const [key, descriptor] of Object.entries(originalDescriptors)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });

  const organic = {
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    landing_page: '/guide/page-a/?topic=photos',
    referrer_url: 'https://www.google.com/search?q=car+photos',
    first_seen: '2026-09-02T12:00:00.000Z',
  };
  const document = cookieDocument({
    _fbp: 'fb.1.1700000000000.123456789',
    _fbc: 'fb.1.1700000000000.MiXeD_Click-ID',
  });
  const analyticsCalls = [];
  const window = {
    location: new URL(
      'https://autolander.ai/?fbclid=MiXeD_Click-ID&utm_source=facebook&utm_medium=paid_social&utm_campaign=Meta+Campaign&utm_content=Meta+Creative&utm_term=Meta+Ad+Set&campaign_id=cmp_123&adset_id=set_456&ad_id=ad_789',
    ),
    localStorage: new MemoryStorage({ al_attrib: JSON.stringify(organic) }),
    sessionStorage: new MemoryStorage(),
    innerWidth: 1440,
    innerHeight: 900,
    screen: { width: 1440, height: 900, colorDepth: 24 },
    devicePixelRatio: 1,
    gtag: (...args) => analyticsCalls.push(args),
  };
  const navigator = {
    userAgent: 'Mozilla/5.0 AutoLander submit attribution test',
    language: 'en-US',
    platform: 'Win32',
    maxTouchPoints: 0,
    hardwareConcurrency: 8,
  };
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: window },
    document: { configurable: true, value: document },
    navigator: { configurable: true, value: navigator },
  });

  let submittedBody;
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    submittedBody = JSON.parse(init.body);
    return Response.json({ ok: true, duplicate: false, redirectPath: '/thank-you' });
  });

  const { submitApplication } = await import(`../src/lib/demo-application.js?submit-attribution=${Date.now()}`);
  const result = await submitApplication({
    fullName: 'Meta Regression Test',
    email: 'meta-test@example.com',
    phone: '(212) 555-0123',
    role: 'Owner',
    inventoryUrl: 'https://example.com/inventory',
    vehicleCount: '1-50',
    smsConsent: true,
    consentTimestamp: '2026-09-02T12:00:00.000Z',
    submissionId: 'sub_meta_regression_123',
    company: '',
  });

  assert.equal(result.ok, true);
  assert.deepEqual(submittedBody.attribution.utms, {
    utm_source: 'facebook',
    utm_medium: 'paid_social',
    utm_campaign: 'Meta Campaign',
    utm_content: 'Meta Creative',
    utm_term: 'Meta Ad Set',
    campaign_id: 'cmp_123',
    adset_id: 'set_456',
    ad_id: 'ad_789',
  });
  assert.equal(submittedBody.attribution.fbclid, 'MiXeD_Click-ID');
  assert.equal(submittedBody.attribution.fbc, 'fb.1.1700000000000.MiXeD_Click-ID');
  assert.equal(submittedBody.attribution.fbp, 'fb.1.1700000000000.123456789');
  assert.deepEqual(submittedBody.organic_attribution, organic);
  assert.equal(submittedBody.landing_page, '/guide/page-a/?topic=photos');
  assert.equal(submittedBody.referrer_url, 'https://www.google.com/search?q=car+photos');
  assert.equal(analyticsCalls.length, 1);
  assert.equal(analyticsCalls[0][0], 'event');
  assert.equal(analyticsCalls[0][1], 'generate_lead');
  assert.equal(analyticsCalls[0][2].lead_source, 'facebook');
  assert.equal(analyticsCalls[0][2].lead_medium, 'paid_social');
});

test('duplicate server responses do not double-count GA4 leads', async (t) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else delete globalThis.window;
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
    else delete globalThis.document;
    if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
    else delete globalThis.navigator;
  });

  const analyticsCalls = [];
  const document = cookieDocument({});
  const location = new URL('https://autolander.ai/');
  Object.defineProperties(globalThis, {
    window: {
      configurable: true,
      value: {
        location,
        localStorage: new MemoryStorage({
          al_attrib: JSON.stringify({ utm_source: 'direct', utm_medium: 'none' }),
        }),
        sessionStorage: new MemoryStorage(),
        innerWidth: 1440,
        innerHeight: 900,
        screen: { width: 1440, height: 900, colorDepth: 24 },
        devicePixelRatio: 1,
        gtag: (...args) => analyticsCalls.push(args),
      },
    },
    document: { configurable: true, value: document },
    navigator: { configurable: true, value: { userAgent: 'AutoLander duplicate test' } },
  });
  t.mock.method(globalThis, 'fetch', async () => Response.json({ ok: true, duplicate: true }));

  const { submitApplication } = await import(`../src/lib/demo-application.js?duplicate-attribution=${Date.now()}`);
  await submitApplication({
    fullName: 'Duplicate Test',
    email: 'duplicate@example.com',
    phone: '(212) 555-0123',
    role: 'Owner',
    inventoryUrl: 'https://example.com/inventory',
    vehicleCount: '1-50',
    smsConsent: true,
    consentTimestamp: '2026-09-02T12:00:00.000Z',
    submissionId: 'sub_duplicate_test_123',
    company: '',
  });

  assert.deepEqual(analyticsCalls, []);
});

test('a throwing analytics shim cannot break a successful CRM submission', async (t) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else delete globalThis.window;
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
    else delete globalThis.document;
    if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
    else delete globalThis.navigator;
  });

  const document = cookieDocument({});
  Object.defineProperties(globalThis, {
    window: {
      configurable: true,
      value: {
        location: new URL('https://autolander.ai/?utm_source=test&utm_medium=test'),
        localStorage: new MemoryStorage({
          al_attrib: JSON.stringify({ utm_source: 'test', utm_medium: 'test' }),
        }),
        sessionStorage: new MemoryStorage(),
        innerWidth: 1440,
        innerHeight: 900,
        screen: { width: 1440, height: 900, colorDepth: 24 },
        devicePixelRatio: 1,
        gtag: () => {
          throw new Error('blocked analytics');
        },
      },
    },
    document: { configurable: true, value: document },
    navigator: { configurable: true, value: { userAgent: 'AutoLander analytics fail-open test' } },
  });
  t.mock.method(globalThis, 'fetch', async () => (
    Response.json({ ok: true, duplicate: false, redirectPath: '/thank-you' })
  ));

  const { submitApplication } = await import(`../src/lib/demo-application.js?analytics-fail-open=${Date.now()}`);
  const result = await submitApplication({
    fullName: 'Analytics Fail Open',
    email: 'analytics-fail-open@example.com',
    phone: '(212) 555-0123',
    role: 'Owner',
    inventoryUrl: 'https://example.com/inventory',
    vehicleCount: '1-50',
    smsConsent: true,
    consentTimestamp: '2026-09-02T12:00:00.000Z',
    submissionId: 'sub_analytics_fail_open_123',
    company: '',
  });

  assert.equal(result.ok, true);
  assert.equal(result.redirectPath, '/thank-you');
});
