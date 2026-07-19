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

async function track(t, body) {
  const tracking = new MemoryKv();
  const metaRequests = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    metaRequests.push({ url: String(url), init });
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  const response = await handleCapi(
    new Request('https://worker.example/capi/track', {
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

test('cleanFbclid rejects embedded whitespace and overlong values instead of mutating or slicing them', () => {
  assert.equal(cleanFbclid('  AbCd_Ef-123  '), 'AbCd_Ef-123');
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
