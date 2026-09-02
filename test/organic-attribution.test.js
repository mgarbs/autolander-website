import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {
  mergeOrganicAttribution,
  readOrganicAttribution,
  trackGoogleLead,
} from '../src/lib/organic-attribution.js';
import { handleBooking } from '../worker/src/booking/router.js';
import { hashLowercase, sha256Hex } from '../worker/src/capi/hash.js';

const ROOT = resolve(import.meta.dirname, '..');
const SCRIPT_PATH = resolve(ROOT, 'public', 'al-attribution-v1.js');
const CAPTURE_SCRIPT = readFileSync(SCRIPT_PATH, 'utf8');

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

function capture({
  url = 'https://autolander.ai/',
  referrer = '',
  storage = new MemoryStorage(),
} = {}) {
  const location = new URL(url);
  vm.runInNewContext(CAPTURE_SCRIPT, {
    window: { location, localStorage: storage },
    document: { referrer },
    URL,
    URLSearchParams,
    Date,
  });
  let raw = null;
  try {
    raw = storage.getItem('al_attrib');
  } catch {
    raw = null;
  }
  let value = null;
  try {
    value = raw ? JSON.parse(raw) : null;
  } catch {
    value = null;
  }
  return { raw, value, storage };
}

test('explicit UTMs win over inferred traffic and preserve all five fields', () => {
  const { value } = capture({
    url: 'https://autolander.ai/guide/test/?utm_source=test&utm_medium=test&utm_campaign=launch&utm_content=creative-7&utm_term=dealer+software',
    referrer: 'https://www.google.com/search?q=autolander',
  });

  assert.deepEqual(
    {
      source: value.utm_source,
      medium: value.utm_medium,
      campaign: value.utm_campaign,
      content: value.utm_content,
      term: value.utm_term,
    },
    {
      source: 'test',
      medium: 'test',
      campaign: 'launch',
      content: 'creative-7',
      term: 'dealer software',
    },
  );
  assert.equal(value.landing_page, '/guide/test/?utm_source=test&utm_medium=test&utm_campaign=launch&utm_content=creative-7&utm_term=dealer+software');
  assert.equal(value.referrer_url, 'https://www.google.com/search?q=autolander');
  assert.equal(new Date(value.first_seen).toISOString(), value.first_seen);
});

test('AI answer engines are named before broader search-engine rules', () => {
  const cases = [
    ['https://chatgpt.com/', 'chatgpt'],
    ['https://chat.openai.com/', 'chatgpt'],
    ['https://www.perplexity.ai/', 'perplexity'],
    ['https://claude.ai/', 'claude'],
    ['https://copilot.microsoft.com/', 'copilot'],
    ['https://gemini.google.com/app', 'gemini'],
    ['https://grok.com/', 'grok'],
    ['https://www.meta.ai/', 'meta_ai'],
    ['https://you.com/search', 'you'],
    ['https://www.phind.com/search', 'phind'],
    ['https://poe.com/', 'poe'],
    ['https://chat.deepseek.com/', 'deepseek'],
    ['https://chat.mistral.ai/', 'mistral'],
  ];

  for (const [referrer, source] of cases) {
    const { value } = capture({ referrer });
    assert.equal(value.utm_source, source, referrer);
    assert.equal(value.utm_medium, 'ai', referrer);
    assert.equal(value.utm_content, '', referrer);
  }
});

test('regular search engines are named as organic traffic', () => {
  const cases = [
    ['https://www.google.com/search?q=inventory', 'google'],
    ['https://www.google.co.uk/search?q=inventory', 'google'],
    ['https://www.google.com.au/search?q=inventory', 'google'],
    ['https://www.google.com.ar/search?q=inventory', 'google'],
    ['https://www.google.co.id/search?q=inventory', 'google'],
    ['android-app://com.google.android.googlequicksearchbox/https/www.google.com', 'google'],
    ['https://www.bing.com/search?q=inventory', 'bing'],
    ['https://duckduckgo.com/?q=inventory', 'duckduckgo'],
    ['https://search.yahoo.com/search?p=inventory', 'yahoo'],
    ['https://search.yahoo.co.in/search?p=inventory', 'yahoo'],
    ['https://search.brave.com/search?q=inventory', 'brave'],
    ['https://www.ecosia.org/search?q=inventory', 'ecosia'],
    ['https://www.startpage.com/do/search?q=inventory', 'startpage'],
  ];

  for (const [referrer, source] of cases) {
    const { value } = capture({ referrer });
    assert.equal(value.utm_source, source, referrer);
    assert.equal(value.utm_medium, 'organic', referrer);
  }
});

test('social, referral, direct, self-referral, and deceptive hosts classify safely', () => {
  const social = capture({ referrer: 'https://m.instagram.com/story/1' }).value;
  assert.equal(social.utm_source, 'facebook');
  assert.equal(social.utm_medium, 'organic_social');

  const referral = capture({ referrer: 'https://partner.example/path' }).value;
  assert.equal(referral.utm_source, 'partner.example');
  assert.equal(referral.utm_medium, 'referral');

  const direct = capture().value;
  assert.equal(direct.utm_source, 'direct');
  assert.equal(direct.utm_medium, 'none');

  for (const referrer of ['https://autolander.ai/page-a', 'https://www.autolander.ai/page-a']) {
    const self = capture({ url: 'https://autolander.ai/page-b', referrer }).value;
    assert.equal(self.utm_source, 'direct');
    assert.equal(self.utm_medium, 'none');
    assert.equal(self.referrer_url, '');
  }

  for (const referrer of [
    'https://notautolander.ai/',
    'https://chatgpt.com.evil.example/',
    'https://mail.google.com/mail/u/0/',
    'https://docs.google.com/document/d/example/',
    'https://www.google.com.evil.example/',
    'https://www.bing.com.evil.example/',
    'https://search.yahoo.com.evil.example/',
  ]) {
    const deceptive = capture({ referrer }).value;
    assert.equal(deceptive.utm_medium, 'referral', referrer);
  }
});

test('first touch and page A survive later navigation to page B', () => {
  const first = capture({
    url: 'https://autolander.ai/guide/page-a/?topic=photos',
    referrer: 'https://www.google.com/search?q=car+photos',
  });
  const second = capture({
    url: 'https://autolander.ai/?utm_source=should-not-win',
    referrer: 'https://autolander.ai/guide/page-a/',
    storage: first.storage,
  });

  assert.equal(second.raw, first.raw);
  assert.equal(second.value.utm_source, 'google');
  assert.equal(second.value.utm_medium, 'organic');
  assert.equal(second.value.landing_page, '/guide/page-a/?topic=photos');
});

test('malformed or unavailable storage and malformed referrers fail open', () => {
  const corrupt = new MemoryStorage({ al_attrib: '{not-json' });
  assert.doesNotThrow(() => capture({ storage: corrupt }));
  assert.equal(corrupt.getItem('al_attrib'), '{not-json');
  assert.equal(readOrganicAttribution(corrupt), null);

  const throwing = {
    getItem() { throw new Error('storage blocked'); },
    setItem() { throw new Error('storage blocked'); },
  };
  assert.doesNotThrow(() => capture({ storage: throwing }));

  const malformed = capture({ referrer: 'not a valid url' }).value;
  assert.equal(malformed.utm_source, 'direct');
  assert.equal(malformed.utm_medium, 'none');
});

test('organic values fill blanks while every existing Meta value stays byte-exact', () => {
  const existing = {
    vid: 'v_abcdefghijklmnopqrstuv',
    fbclid: 'MiXeD_Meta.Click-ID',
    fbc: 'fb.1.1700000000000.MiXeD_Meta.Click-ID',
    fbp: 'fb.1.1700000000000.123456789',
    utms: {
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'Meta Campaign',
      utm_content: 'Meta Creative',
      utm_term: 'Meta Ad Set',
      campaign_id: 'cmp_123',
      adset_id: 'set_456',
      ad_id: 'ad_789',
    },
  };
  const organic = {
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
  };

  const merged = mergeOrganicAttribution(existing, organic);
  assert.deepEqual(merged, existing);
  assert.notEqual(merged, existing);
  assert.equal(existing.fbclid, 'MiXeD_Meta.Click-ID');

  const blank = mergeOrganicAttribution({ utms: {} }, organic);
  assert.deepEqual(blank.utms, { utm_source: 'google', utm_medium: 'organic' });
});

test('verified applications queue one GA4 recommended generate_lead event', () => {
  const calls = [];
  const sent = trackGoogleLead(
    { utms: { utm_source: 'perplexity', utm_medium: 'ai' } },
    {
      landing_page: '/guide/page-a/?utm_source=perplexity',
      referrer_url: 'https://www.perplexity.ai/search/abc',
    },
    (...args) => calls.push(args),
  );

  assert.equal(sent, true);
  assert.deepEqual(calls, [[
    'event',
    'generate_lead',
    {
      method: 'demo_application',
      lead_source: 'perplexity',
      lead_medium: 'ai',
      first_landing_page: '/guide/page-a/',
      first_referrer_domain: 'perplexity.ai',
    },
  ]]);

  const referralCalls = [];
  trackGoogleLead(
    { utms: { utm_source: 'partner', utm_medium: 'referral' } },
    { landing_page: '/ref/A1b2C3d4?utm_source=partner', referrer_url: 'https://partner.example/' },
    (...args) => referralCalls.push(args),
  );
  assert.equal(referralCalls[0][2].first_landing_page, '/ref/:code');

  const dynamicRouteCalls = [];
  for (const landing_page of ['/r/deadbeef', '/REF/DeadBeef', '/pay/tok_live_secret']) {
    trackGoogleLead(
      { utms: { utm_source: 'direct', utm_medium: 'none' } },
      { landing_page, referrer_url: '' },
      (...args) => dynamicRouteCalls.push(args),
    );
  }
  assert.equal(dynamicRouteCalls[0][2].first_landing_page, '/r/:code');
  assert.equal(dynamicRouteCalls[1][2].first_landing_page, '/ref/:code');
  assert.equal(dynamicRouteCalls[2][2].first_landing_page, '/pay/:token');
});

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  });
}

test('every indexable HTML landing page loads the shared capture exactly once', () => {
  const files = [resolve(ROOT, 'index.html'), ...htmlFiles(resolve(ROOT, 'public'))];
  const checked = [];
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    if (/google-site-verification:/i.test(html) || /content=["'][^"']*noindex/i.test(html)) continue;
    const matches = html.match(/<script\b[^>]*\bsrc=["']\/al-attribution-v1\.js["'][^>]*><\/script>/gi) || [];
    assert.equal(matches.length, 1, file);
    checked.push(file);
  }
  assert.ok(checked.length >= 50, `expected at least 50 indexable entry pages, saw ${checked.length}`);

  for (const generator of ['scripts/seo/shell.mjs', 'scripts/build-compare-pages.mjs']) {
    const source = readFileSync(resolve(ROOT, generator), 'utf8');
    assert.equal((source.match(/\/al-attribution-v1\.js/g) || []).length, 1, generator);
  }
});

test('production GA is hostname-gated and the homepage does not miss long non-interactive visits', () => {
  const files = [resolve(ROOT, 'index.html'), ...htmlFiles(resolve(ROOT, 'public'))];
  const hostGate = "location.hostname === 'autolander.ai' || location.hostname === 'www.autolander.ai'";
  const checked = [];

  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    if (!html.includes('G-30H80LZMCH')) continue;
    if (/google-site-verification:/i.test(html)) continue;
    assert.ok(html.includes(hostGate), file);
    assert.doesNotMatch(
      html,
      /<script\b[^>]*\bsrc=["']https:\/\/www\.googletagmanager\.com\/gtag\/js/i,
      file,
    );
    checked.push(file);
  }

  assert.ok(checked.length >= 50, `expected at least 50 GA-enabled entry pages, saw ${checked.length}`);
  const homepage = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  assert.match(homepage, /requestIdleCallback\(load, \{ timeout: 4000 \}\)/);
  assert.match(homepage, /setTimeout\(load, 2000\)/);
});

test('GHL receives organic fallback and the two new fields without changing CAPI attribution', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const href = String(url);
    requests.push({ href, init });
    if (href.includes('/contacts/upsert')) return Response.json({ contact: { id: 'contact_organic_123' } });
    if (href.includes('/notes')) return Response.json({ note: { id: 'note_organic_123' } });
    return Response.json({ ok: true });
  });

  const fieldIds = {
    utm_source: 'field_source',
    utm_medium: 'field_medium',
    utm_campaign: 'field_campaign',
    utm_content: 'field_content',
    utm_term: 'field_term',
    landing_page: 'field_landing',
    referrer_url: 'field_referrer',
  };
  const request = new Request('https://preview.autolander.ai/api/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://preview.autolander.ai',
      'User-Agent': 'Mozilla/5.0 AutoLander organic attribution test',
    },
    body: JSON.stringify({
      fullName: 'Organic Search Test',
      email: 'organic-test@example.com',
      phone: '(212) 555-0123',
      role: 'Owner',
      inventoryUrl: 'https://example.com/inventory',
      vehicleCount: '1-50',
      smsConsent: true,
      consentTimestamp: '2026-09-02T12:00:00.000Z',
      submissionId: 'sub_organic_attribution_123',
      attribution: {
        vid: 'v_abcdefghijklmnopqrstuv',
        fbclid: 'MiXeD_Click-ID',
        fbc: 'fb.1.1700000000000.MiXeD_Click-ID',
        fbp: 'fb.1.1700000000000.123456789',
        utms: {},
        page: {
          landing_page: 'https://autolander.ai/guide/page-a/?topic=photos',
          current_page: 'https://autolander.ai/',
        },
      },
      organic_attribution: {
        utm_source: 'google',
        utm_medium: 'organic',
        utm_campaign: '',
        utm_content: '',
        utm_term: '',
      },
      landing_page: '/guide/page-a/?topic=photos',
      referrer_url: 'https://www.google.com/search?q=car+photos',
    }),
  });

  const response = await handleBooking(request, {
    DISABLE_RATE_LIMITS: 'true',
    GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token',
    GHL_LOCATION_ID: 'test-location',
    GHL_WORKFLOW_ID: 'test-workflow',
    GHL_CUSTOM_FIELD_MAP: JSON.stringify(fieldIds),
  }, {}, {});
  assert.equal(response.status, 200);

  const update = requests.find(({ href, init }) => href.endsWith('/contacts/contact_organic_123') && init.method === 'PUT');
  assert.ok(update, 'expected a GHL custom-field update');
  const fields = Object.fromEntries(
    JSON.parse(update.init.body).customFields.map((field) => [field.id || field.key, field.field_value]),
  );
  assert.equal(fields.field_source, 'google');
  assert.equal(fields.field_medium, 'organic');
  assert.equal(fields.field_landing, '/guide/page-a/?topic=photos');
  assert.equal(fields.field_referrer, 'https://www.google.com/search?q=car+photos');
  assert.equal(fields.field_content, undefined);

  const noteCall = requests.find(({ href }) => href.includes('/notes'));
  const note = JSON.parse(noteCall.init.body).body;
  assert.match(note, /utm_source: google/);
  assert.match(note, /utm_medium: organic/);
  assert.match(note, /utm_content: Not provided/);
  assert.match(note, /First-touch landing page: \/guide\/page-a\/\?topic=photos/);
  assert.match(note, /First-touch referrer URL: https:\/\/www\.google\.com\/search\?q=car\+photos/);

  assert.equal(requests.some(({ href }) => href.includes('graph.facebook.com')), false);
});

test('unmapped first-touch fields are omitted without risking the established GHL UTM update', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const href = String(url);
    requests.push({ href, init });
    if (href.includes('/contacts/upsert')) return Response.json({ contact: { id: 'contact_safe_123' } });
    if (href.includes('/notes')) return Response.json({ note: { id: 'note_safe_123' } });
    return Response.json({ ok: true });
  });

  const response = await handleBooking(new Request('https://preview.autolander.ai/api/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://preview.autolander.ai',
      'User-Agent': 'Mozilla/5.0 AutoLander safe mapping test',
    },
    body: JSON.stringify({
      fullName: 'Safe Mapping Test',
      email: 'safe-mapping@example.com',
      phone: '(212) 555-0124',
      role: 'Owner',
      inventoryUrl: 'https://example.com/inventory',
      vehicleCount: '1-50',
      smsConsent: true,
      consentTimestamp: '2026-09-02T12:00:00.000Z',
      submissionId: 'sub_safe_mapping_123',
      attribution: { utms: {}, page: {} },
      organic_attribution: { utm_source: 'google', utm_medium: 'organic' },
      landing_page: '/guide/page-a/',
      referrer_url: 'https://www.google.com/',
    }),
  }), {
    DISABLE_RATE_LIMITS: 'true',
    GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token',
    GHL_LOCATION_ID: 'test-location',
    GHL_WORKFLOW_ID: 'test-workflow',
    GHL_CUSTOM_FIELD_MAP: JSON.stringify({
      utm_source: 'field_source',
      utm_medium: 'field_medium',
    }),
  }, {}, {});

  assert.equal(response.status, 200);
  const update = requests.find(({ href, init }) => href.endsWith('/contacts/contact_safe_123') && init.method === 'PUT');
  const fields = JSON.parse(update.init.body).customFields;
  assert.equal(fields.find(({ id }) => id === 'field_source')?.field_value, 'google');
  assert.equal(fields.find(({ id }) => id === 'field_medium')?.field_value, 'organic');
  assert.equal(fields.some(({ key }) => key === 'contact.landing_page'), false);
  assert.equal(fields.some(({ key }) => key === 'contact.referrer_url'), false);
});

test('production CAPI keeps original Meta attribution and identity when organic fallback is present', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const href = String(url);
    requests.push({ href, init });
    if (href.includes('/contacts/upsert')) return Response.json({ contact: { id: 'contact_meta_organic_123' } });
    if (href.includes('/notes')) return Response.json({ note: { id: 'note_meta_organic_123' } });
    if (href.includes('graph.facebook.com')) return Response.json({ events_received: 1 });
    return Response.json({ ok: true });
  });

  const pixelId = '123456789';
  const visitorId = 'v_abcdefghijklmnopqrstuv';
  const submissionId = 'sub_meta_organic_isolation_123';
  const fbp = 'fb.1.1700000000000.123456789';
  const fbclid = 'MiXeD_Click-ID';
  const fbc = `fb.1.1700000000000.${fbclid}`;
  const metaUtms = {
    utm_source: 'facebook',
    utm_medium: 'paid_social',
    utm_campaign: 'Meta Campaign',
    utm_content: 'Meta Creative',
    utm_term: 'Meta Ad Set',
    campaign_id: 'cmp_123',
    adset_id: 'set_456',
    ad_id: 'ad_789',
    placement: 'Facebook_Feed',
    site_source_name: 'fb',
  };
  const request = new Request('https://autolander.ai/api/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://autolander.ai',
      'User-Agent': 'Mozilla/5.0 AutoLander production CAPI isolation test',
    },
    body: JSON.stringify({
      fullName: 'Meta Isolation Test',
      email: 'meta-isolation@example.com',
      phone: '(212) 555-0123',
      role: 'Owner',
      inventoryUrl: 'https://example.com/inventory',
      vehicleCount: '1-50',
      smsConsent: true,
      consentTimestamp: '2026-09-02T12:00:00.000Z',
      submissionId,
      attribution: {
        vid: visitorId,
        fbclid,
        fbc,
        fbp,
        utms: metaUtms,
        page: {
          landing_page: 'https://autolander.ai/?utm_source=facebook',
          current_page: 'https://autolander.ai/',
        },
      },
      organic_attribution: {
        utm_source: 'google',
        utm_medium: 'organic',
        utm_campaign: 'SEO Campaign',
        utm_content: 'must-not-reach-meta',
        utm_term: 'must-not-reach-meta',
      },
      landing_page: '/guide/page-a/?topic=photos',
      referrer_url: 'https://www.google.com/search?q=car+photos',
    }),
  });

  const response = await handleBooking(request, {
    DISABLE_RATE_LIMITS: 'true',
    GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token',
    GHL_LOCATION_ID: 'test-location',
    GHL_WORKFLOW_ID: 'test-workflow',
    META_CAPI_ACCESS_TOKEN: 'test-meta-token',
    META_PIXEL_ID: pixelId,
    TRACKING: new MemoryKv(),
  }, {}, {});
  assert.equal(response.status, 200);
  const responseBody = await response.json();
  const expectedEventId = `lead_${(await sha256Hex(`lead:${submissionId}`)).slice(0, 32)}`;
  assert.equal(responseBody.eventId, expectedEventId);

  const graphCalls = requests.filter(({ href }) => href.includes('graph.facebook.com'));
  assert.equal(graphCalls.length, 1);
  const metaEvent = JSON.parse(graphCalls[0].init.body).data[0];
  assert.equal(metaEvent.event_name, 'Lead');
  assert.equal(metaEvent.event_id, expectedEventId);
  assert.equal(metaEvent.event_source_url, 'https://autolander.ai/');
  assert.equal(metaEvent.user_data.fbp, fbp);
  assert.equal(metaEvent.user_data.fbc, fbc);
  assert.equal(metaEvent.user_data.external_id, await hashLowercase(`${pixelId}:${visitorId}`));
  assert.deepEqual(metaEvent.custom_data, {
    content_name: 'demo_application_submitted',
    content_category: 'demo',
    lead_type: 'website_application',
    dealership_name: '',
    role: 'Owner',
    vehicle_count: '1-50',
    ...metaUtms,
    campaign_name: 'Meta Campaign',
    ad_name: 'Meta Creative',
    adset_name: 'Meta Ad Set',
  });
  assert.equal(JSON.stringify(metaEvent).includes('must-not-reach-meta'), false);
  assert.equal(JSON.stringify(metaEvent).includes('google.com/search'), false);
  assert.equal(JSON.stringify(metaEvent).includes('/guide/page-a/'), false);
});
