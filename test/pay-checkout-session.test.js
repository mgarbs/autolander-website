// Stripe Checkout Session id scrub for the /pay success return (src/pay/lib/checkout-session.js,
// plus the first-touch hardening in public/al-attribution-v1.js).
//
// The id + the pay token together unlock the payer e-mail on the success page, so the id must
// leave the address bar before any tracking reads window.location.href, and must never be
// persisted into first-touch attribution.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import {
  PAY_SESSION_STORAGE_PREFIX,
  checkoutSessionIdFor,
  isCheckoutSessionId,
  payTokenFromPath,
  splitCheckoutSessionFromUrl,
  stashCheckoutSessionFromLocation,
} from '../src/pay/lib/checkout-session.js';

class MemoryStorage {
  constructor({ throwOnSet = false, throwOnGet = false } = {}) {
    this.values = new Map();
    this.throwOnSet = throwOnSet;
    this.throwOnGet = throwOnGet;
  }

  getItem(key) {
    if (this.throwOnGet) throw new Error('storage blocked');
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    if (this.throwOnSet) throw new Error('QuotaExceededError');
    this.values.set(key, String(value));
  }
}

function fakeWindow(href, storage = new MemoryStorage()) {
  const calls = [];
  const win = {
    location: { href },
    sessionStorage: storage,
    history: {
      state: { idx: 3 },
      replaceState(state, title, url) {
        calls.push({ state, title, url });
        win.location.href = new URL(url, href).href;
      },
    },
  };
  return { win, calls, storage };
}

test('isCheckoutSessionId accepts Stripe session ids only', () => {
  for (const value of ['cs_live_a1B2c3', 'cs_test_x', 'cs_1']) assert.equal(isCheckoutSessionId(value), true, value);
  for (const value of ['', 'abc', 'cs_', `cs_${'a'.repeat(300)}`, 'cs_live_a?b', 'cs_live_a&x=1', 'cs_live a', ['cs_1'], null, undefined, 42]) {
    assert.equal(isCheckoutSessionId(value), false, String(value));
  }
});

test('payTokenFromPath reads /pay/<token> only', () => {
  assert.equal(payTokenFromPath('/pay/tok123'), 'tok123');
  assert.equal(payTokenFromPath('/pay/tok123/'), 'tok123');
  assert.equal(payTokenFromPath('/pay/a%20b'), 'a b');
  for (const path of ['/', '/pay', '/pay/', '/pay/a/b', '/admin', '/pay/%E0%A4%A', null]) {
    assert.equal(payTokenFromPath(path), '', String(path));
  }
});

test('splitCheckoutSessionFromUrl strips session_id and keeps every other byte', () => {
  assert.deepEqual(
    splitCheckoutSessionFromUrl('https://autolander.ai/pay/tok123?state=success&session_id=cs_live_abc#x'),
    { token: 'tok123', sessionId: 'cs_live_abc', cleanedHref: '/pay/tok123?state=success#x' },
  );
  assert.deepEqual(
    splitCheckoutSessionFromUrl('https://autolander.ai/pay/tok123?session_id=cs_live_abc'),
    { token: 'tok123', sessionId: 'cs_live_abc', cleanedHref: '/pay/tok123' },
  );
  // Other params are never re-encoded.
  assert.deepEqual(
    splitCheckoutSessionFromUrl('https://autolander.ai/pay/tok123/?utm_term=a+b&session_id=cs_test_9&x=%20y'),
    { token: 'tok123', sessionId: 'cs_test_9', cleanedHref: '/pay/tok123/?utm_term=a+b&x=%20y' },
  );
  // An invalid id is still stripped, just never kept.
  assert.deepEqual(
    splitCheckoutSessionFromUrl('https://autolander.ai/pay/tok123?state=success&session_id=not-a-session'),
    { token: 'tok123', sessionId: '', cleanedHref: '/pay/tok123?state=success' },
  );
  // Every session_id pair goes, including an encoded name; the first valid one is kept.
  assert.deepEqual(
    splitCheckoutSessionFromUrl('https://autolander.ai/pay/tok123?session%5Fid=bad&state=success&session_id=cs_live_2'),
    { token: 'tok123', sessionId: 'cs_live_2', cleanedHref: '/pay/tok123?state=success' },
  );

  const empty = { token: '', sessionId: '', cleanedHref: '' };
  for (const href of [
    'https://autolander.ai/',
    'https://autolander.ai/pay',
    'https://autolander.ai/pay/?trial=starter3d',
    'https://autolander.ai/admin?session_id=cs_1',
    'https://autolander.ai/pay/a/b?session_id=cs_1',
    'https://autolander.ai/pay/tok123?state=success',
    'https://autolander.ai/pay/tok123',
    '',
    null,
  ]) {
    assert.deepEqual(splitCheckoutSessionFromUrl(href), empty, String(href));
  }
});

test('stashCheckoutSessionFromLocation scrubs the address bar once and stores the id', () => {
  const { win, calls, storage } = fakeWindow('https://autolander.ai/pay/tok123?state=success&session_id=cs_live_abc#x');
  stashCheckoutSessionFromLocation(win);

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { state: { idx: 3 }, title: '', url: '/pay/tok123?state=success#x' });
  assert.equal(storage.getItem(`${PAY_SESSION_STORAGE_PREFIX}tok123`), 'cs_live_abc');
  assert.equal(PAY_SESSION_STORAGE_PREFIX, 'al_pay_session:');
  assert.equal(win.location.href.includes('session_id'), false);
  assert.equal(checkoutSessionIdFor('tok123', win), 'cs_live_abc');
});

test('a throwing sessionStorage still leaves the id available from memory for this page load', () => {
  const { win, calls } = fakeWindow(
    'https://autolander.ai/pay/tokMemory?state=success&session_id=cs_live_mem',
    new MemoryStorage({ throwOnSet: true, throwOnGet: true }),
  );
  assert.doesNotThrow(() => stashCheckoutSessionFromLocation(win));
  assert.equal(calls.length, 1);
  assert.equal(checkoutSessionIdFor('tokMemory', win), 'cs_live_mem');
});

test('checkoutSessionIdFor falls back to sessionStorage, then a valid URL param, else ""', () => {
  const stored = new MemoryStorage();
  stored.setItem(`${PAY_SESSION_STORAGE_PREFIX}tokStored`, 'cs_live_stored');
  assert.equal(checkoutSessionIdFor('tokStored', fakeWindow('https://autolander.ai/pay/tokStored?state=success', stored).win), 'cs_live_stored');

  const tampered = new MemoryStorage();
  tampered.setItem(`${PAY_SESSION_STORAGE_PREFIX}tokTampered`, 'javascript:alert(1)');
  assert.equal(checkoutSessionIdFor('tokTampered', fakeWindow('https://autolander.ai/pay/tokTampered', tampered).win), '');

  assert.equal(
    checkoutSessionIdFor('tokUrl', fakeWindow('https://autolander.ai/pay/tokUrl?state=success&session_id=cs_live_url').win),
    'cs_live_url',
  );
  // A URL for a different token never answers for this one.
  assert.equal(
    checkoutSessionIdFor('tokOther', fakeWindow('https://autolander.ai/pay/tokUrl?session_id=cs_live_url').win),
    '',
  );
  assert.equal(checkoutSessionIdFor('tokNone', fakeWindow('https://autolander.ai/pay/tokNone?session_id=bogus').win), '');
  assert.equal(checkoutSessionIdFor('', fakeWindow('https://autolander.ai/').win), '');
});

test('the scrub is a no-op off /pay/<token> and never throws on a hostile window', () => {
  const { win, calls } = fakeWindow('https://autolander.ai/?session_id=cs_live_home&utm_source=x');
  stashCheckoutSessionFromLocation(win);
  assert.equal(calls.length, 0);
  assert.equal(win.location.href, 'https://autolander.ai/?session_id=cs_live_home&utm_source=x');

  const broken = {
    location: { href: 'https://autolander.ai/pay/tokBroken?session_id=cs_live_b' },
    sessionStorage: null,
    history: { state: null, replaceState() { throw new Error('SecurityError'); } },
  };
  assert.doesNotThrow(() => stashCheckoutSessionFromLocation(broken));
  assert.equal(checkoutSessionIdFor('tokBroken', broken), 'cs_live_b');
  assert.doesNotThrow(() => stashCheckoutSessionFromLocation(null));
  assert.doesNotThrow(() => stashCheckoutSessionFromLocation({}));
});

// ---------------------------------------------------------------- first-touch attribution

const CAPTURE_SCRIPT = readFileSync(new URL('../public/al-attribution-v1.js', import.meta.url), 'utf8');

function captureLanding(url) {
  const values = new Map();
  const storage = {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
  };
  vm.runInNewContext(CAPTURE_SCRIPT, {
    window: { location: new URL(url), localStorage: storage },
    document: { referrer: 'https://checkout.stripe.com/' },
    URL,
    URLSearchParams,
    Date,
  });
  return JSON.parse(values.get('al_attrib')).landing_page;
}

test('first-touch attribution never persists a Stripe session id, and leaves other queries alone', () => {
  assert.equal(
    captureLanding('https://autolander.ai/pay/tok123?state=success&session_id=cs_live_abc'),
    '/pay/tok123?state=success',
  );
  assert.equal(captureLanding('https://autolander.ai/pay/tok123?session_id=cs_live_abc'), '/pay/tok123');
  assert.equal(
    captureLanding('https://autolander.ai/pay/tok123?session%5Fid=cs_live_abc&utm_term=a+b'),
    '/pay/tok123?utm_term=a+b',
  );
  // Byte-identical to before when there is no session id.
  assert.equal(
    captureLanding('https://autolander.ai/guide/x/?utm_term=dealer+software&a=%20b&&c'),
    '/guide/x/?utm_term=dealer+software&a=%20b&&c',
  );
  assert.equal(captureLanding('https://autolander.ai/'), '/');
});
