import assert from 'node:assert/strict';
import test from 'node:test';
import { handleCapi } from '../worker/src/capi/router.js';
import {
  buildFbc,
  cleanFbclid,
  isValidFbc,
} from '../worker/src/capi/validators.js';

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

const BROWSER_HEADERS = {
  'CF-Connecting-IP': '203.0.113.10',
  'Content-Type': 'application/json',
  Origin: 'https://autolander.ai',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36',
};

function installBrowserCookieHarness(t, href, initialCookies = {}) {
  const jar = new Map(
    Object.entries(initialCookies).map(([name, value]) => [name, encodeURIComponent(value)]),
  );
  const originalDescriptors = new Map(
    ['window', 'document'].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
  );
  const documentMock = { referrer: '', title: '', documentElement: {} };

  Object.defineProperty(documentMock, 'cookie', {
    configurable: true,
    get() {
      return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
    },
    set(serialized) {
      const pair = String(serialized).split(';', 1)[0];
      const separator = pair.indexOf('=');
      if (separator > 0) jar.set(pair.slice(0, separator), pair.slice(separator + 1));
    },
  });

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: new URL(href) },
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: documentMock,
  });

  t.after(() => {
    for (const [name, descriptor] of originalDescriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });

  return {
    read(name) {
      const value = jar.get(name);
      return value ? decodeURIComponent(value) : '';
    },
  };
}

async function track(t, body) {
  const tracking = new MemoryKv();
  const metaRequests = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    metaRequests.push({ url: String(url), init });
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  const response = await handleCapi(
    new Request('https://autolander.ai/capi/track', {
      method: 'POST',
      headers: BROWSER_HEADERS,
      body: JSON.stringify(body),
    }),
    {
      DISABLE_RATE_LIMITS: 'true',
      META_CAPI_ACCESS_TOKEN: 'test-token',
      META_PIXEL_ID: '123456789',
      TRACKING: tracking,
    },
    {},
  );

  assert.equal(response.status, 200);
  assert.equal(metaRequests.length, 1);
  return {
    metaBody: JSON.parse(metaRequests[0].init.body),
    tracking,
  };
}

test('a 350-character mixed-case fbclid survives intake, persistence, and fbc rebuild byte-exact', async (t) => {
  const fbclid = 'AbC123_xY-Z.'.repeat(30).slice(0, 350);
  const ts = 1_712_345_678;
  const vid = 'v_abcdefghijklmnopqrstuv';

  const { metaBody, tracking } = await track(t, {
    event: 'PageView',
    eventId: 'evt_long_fbclid_1',
    eventTime: ts + 10,
    firstTouch: { ts },
    fbclid,
    sourceUrl: 'https://autolander.ai/?fbclid=test',
    vid,
  });

  const visitor = await tracking.get(`vid:${vid}`, 'json');
  assert.equal(visitor.fbclid, fbclid);
  assert.equal(visitor.fbclid.length, 350);
  assert.equal(visitor.firstTouch.ts, ts);
  assert.equal(metaBody.data[0].user_data.fbc, `fb.1.${ts * 1000}.${fbclid}`);
});

test('cleanFbclid rejects all whitespace and overlong values instead of mutating or slicing them', () => {
  assert.equal(cleanFbclid('  AbCd_Ef-123  '), '');
  assert.equal(cleanFbclid('AbCd Ef-123'), '');
  assert.equal(cleanFbclid('AbCd\tEf-123'), '');
  assert.equal(cleanFbclid('a'.repeat(1000)), 'a'.repeat(1000));
  assert.equal(cleanFbclid('a'.repeat(1001)), '');
  assert.equal(cleanFbclid(null), '');
});

test('fbc rebuild uses the supplied click timestamp in seconds and otherwise falls back to Date.now', (t) => {
  assert.equal(buildFbc('MiXeD_Click-ID', 1_700_000_001), 'fb.1.1700000001000.MiXeD_Click-ID');

  t.mock.method(Date, 'now', () => 1_800_000_002_345);
  assert.equal(buildFbc('MiXeD_Click-ID'), 'fb.1.1800000002345.MiXeD_Click-ID');
});

test('_fbc cookie input passes through untouched and over-1200-character fbc is rejected', async (t) => {
  const cookieFbc = `fb.1.1712345678000.${'MiXeD._-123'.repeat(30)}`;
  assert.equal(isValidFbc(cookieFbc), true);
  assert.equal(isValidFbc(`fb.1.1712345678000.${'a'.repeat(1200)}`), false);

  const { metaBody } = await track(t, {
    event: 'ChatOpened',
    eventId: 'evt_fbc_passthrough_1',
    fbc: cookieFbc,
    fbclid: 'DifferentClickId',
    firstTouch: { ts: 1_600_000_000 },
    sourceUrl: 'https://autolander.ai/',
    vid: 'v_bcdefghijklmnopqrstuvw',
  });

  assert.equal(metaBody.data[0].user_data.fbc, cookieFbc);
});

test('/capi/track omits fbc when neither a stored cookie nor fbclid is available', async (t) => {
  const { metaBody } = await track(t, {
    event: 'PageView',
    eventId: 'evt_no_fbc_1',
    fbc: '',
    fbclid: '',
    sourceUrl: 'https://autolander.ai/',
    vid: 'v_cdefghijklmnopqrstuvwx',
  });

  assert.equal(Object.hasOwn(metaBody.data[0].user_data, 'fbc'), false);
});

test('a new URL fbclid replaces a stale _fbc cookie byte-exact', async (t) => {
  const now = 1_800_000_002_345;
  const fbclid = 'New_MiXeD-Click.ID';
  const cookies = installBrowserCookieHarness(
    t,
    `https://autolander.ai/?fbclid=${encodeURIComponent(fbclid)}`,
    {
      _fbp: 'fb.1.1700000000000.123456789',
      _fbc: 'fb.1.1700000000000.Old_Click-ID',
    },
  );
  t.mock.method(Date, 'now', () => now);
  const identity = await import(`../src/lib/identity.js?new-click=${Math.random()}`);

  assert.deepEqual(identity.getFbCookies(), {
    fbp: 'fb.1.1700000000000.123456789',
    fbc: `fb.1.${now}.${fbclid}`,
  });
  assert.equal(cookies.read('_fbc'), `fb.1.${now}.${fbclid}`);
});

test('the same current fbclid keeps its original _fbc creation time', async (t) => {
  const fbclid = 'Same_MiXeD-Click.ID';
  const storedFbc = `fb.1.1700000000000.${fbclid}`;
  const cookies = installBrowserCookieHarness(
    t,
    `https://autolander.ai/?fbclid=${encodeURIComponent(fbclid)}`,
    { _fbc: storedFbc },
  );
  t.mock.method(Date, 'now', () => 1_800_000_002_345);
  const identity = await import(`../src/lib/identity.js?same-click=${Math.random()}`);

  assert.equal(identity.getFbCookies().fbc, storedFbc);
  assert.equal(cookies.read('_fbc'), storedFbc);
});

test('a stored _fbc remains available after fbclid leaves the URL', async (t) => {
  const storedFbc = 'fb.1.1700000000000.Stored_Click-ID';
  const cookies = installBrowserCookieHarness(t, 'https://autolander.ai/features', {
    _fbc: storedFbc,
  });
  const identity = await import(`../src/lib/identity.js?stored-click=${Math.random()}`);

  assert.equal(identity.getFbCookies().fbc, storedFbc);
  assert.equal(cookies.read('_fbc'), storedFbc);
});

test('a whitespace-wrapped URL fbclid is omitted instead of trimmed or stored', async (t) => {
  const cookies = installBrowserCookieHarness(
    t,
    'https://autolander.ai/?fbclid=%20MiXeD_Click-ID%20',
  );
  const identity = await import(`../src/lib/identity.js?invalid-click=${Math.random()}`);

  assert.equal(identity.getFbCookies().fbc, '');
  assert.equal(cookies.read('_fbc'), '');
  assert.equal(identity.getFirstTouch(), null);
});
