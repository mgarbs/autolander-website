import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { setImmediate } from 'node:timers';
import vm from 'node:vm';
import worker from '../worker/src/index.js';
import { issueAttributionToken, verifyAttributionToken } from '../worker/src/attribution/router.js';

const env = { ATTRIBUTION_SIGNING_SECRET: 'unit-test-only-secret-at-least-32-characters' };
const request = (body, path = 'token') => new Request(`https://autolander.ai/api/attribution/${path}`, {
  method: 'POST', headers: { Origin: 'https://autolander.ai', 'Content-Type': 'application/json',
    'CF-Connecting-IP': '192.0.2.10', 'User-Agent': 'test-browser', Referer: 'https://autolander.ai/?utm_source=meta' },
  body: JSON.stringify(body),
});
const source = { attribution: { fbp: 'fb.1.1757000000000.123456', fbc: 'fb.1.1757000000000.ABC_case',
  utms: { utm_source: 'meta', utm_medium: 'paid_social', utm_campaign: 'September', ad_id: '12345' },
  page: { landing_page: 'https://autolander.ai/?fbclid=ABC_case#private' } } };

test('signed signup context travels through the routed Worker verification API', async () => {
  const response = await worker.fetch(request(source), env, {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const issued = await response.json();
  const verified = await worker.fetch(request({ token: issued.token }, 'verify'), env, {});
  assert.equal(verified.status, 200);
  const data = await verified.json();
  assert.equal(data.attribution.fbp, source.attribution.fbp);
  assert.equal(data.attribution.fbc, source.attribution.fbc);
  assert.equal(data.attribution.utm_source, 'meta');
  assert.equal(data.attribution.ad_id, '12345');
  assert.equal(data.attribution.client_ip, '192.0.2.10');
  assert.equal(data.attribution.user_agent, 'test-browser');
  assert.equal(data.attribution.landing_url, 'https://autolander.ai/?fbclid=ABC_case');
  assert.equal(data.expires_at - data.issued_at, 30 * 86400);
});

test('tampered, expired, wrong-key and oversized tokens are rejected', async () => {
  const issued = await issueAttributionToken(env, request(source), source);
  const [header, payload, signature] = issued.token.split('.');
  const altered = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, 'base64url')), attribution: { ghl_contact_id: 'forged' } })).toString('base64url');
  assert.equal(await verifyAttributionToken(env, `${header}.${altered}.${signature}`), null);
  assert.equal(await verifyAttributionToken(env, issued.token, issued.expires_at), null);
  assert.equal(await verifyAttributionToken({ ATTRIBUTION_SIGNING_SECRET: 'wrong-secret-with-at-least-32-characters' }, issued.token), null);
  assert.equal(await verifyAttributionToken(env, 'x'.repeat(8193)), null);
});

test('public input cannot assert a GHL identity or spoof observed IP and agent', async () => {
  const response = await worker.fetch(request({ ...source, ghl_contact_id: 'forged',
    attribution: { ...source.attribution, ghl_contact_id: 'forged', client_ip: 'fake', user_agent: 'fake' } }), env, {});
  const data = await verifyAttributionToken(env, (await response.json()).token);
  assert.equal(data.attribution.ghl_contact_id, undefined);
  assert.equal(data.attribution.client_ip, '192.0.2.10');
  assert.equal(data.attribution.user_agent, 'test-browser');
});

test('accepted demo identity survives token renewal only from signed previous context', async () => {
  const identity = { ghl_contact_id: 'real-contact', ghl_email_sha256: 'e'.repeat(64), ghl_phone_sha256: 'f'.repeat(64) };
  const previous = await issueAttributionToken(env, request(source), source, identity);
  const response = await worker.fetch(request({ ...source, previous_token: previous.token }), env, {});
  const data = await verifyAttributionToken(env, (await response.json()).token);
  for (const [key, value] of Object.entries(identity)) assert.equal(data.attribution[key], value);
});

test('organic and direct signup defaults preserve useful source URLs', async () => {
  const issued = await issueAttributionToken(env, request({}), { organic_attribution: { utm_source: 'google', utm_medium: 'organic', landing_page: 'https://autolander.ai/guide/test/?token=private#private' } });
  const data = await verifyAttributionToken(env, issued.token);
  assert.equal(data.attribution.utm_source, 'google');
  assert.equal(data.attribution.landing_url, 'https://autolander.ai/guide/test/');
  const relative = await verifyAttributionToken(env, (await issueAttributionToken(env, request({}), {
    organic_attribution: { landing_page: '/guide/first/?attribution_token=private#private' },
  })).token);
  assert.equal(relative.attribution.landing_url, 'https://autolander.ai/guide/first/');
  const direct = await verifyAttributionToken(env, (await issueAttributionToken(env, request({}), {})).token);
  assert.equal(direct.attribution.utm_source, 'direct');
  assert.equal(direct.attribution.utm_medium, 'none');
});

test('missing configuration and oversized streamed requests fail with bounded responses', async () => {
  assert.equal((await worker.fetch(request(source), {}, {})).status, 503);
  assert.equal((await worker.fetch(request({ data: 'x'.repeat(24001) }), env, {})).status, 413);
});

test('setup page starts allowlisted installer and passes code plus referral only to app', async () => {
  const script = await readFile(new URL('../public/al-download-setup.js', import.meta.url), 'utf8');
  const token = (await issueAttributionToken(env, request(source), source)).token;
  const elements = new Map(); const clicks = [];
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { value: '', textContent: '', addEventListener() {}, removeAttribute() {}, click() { clicks.push(this.href); } });
    return elements.get(id);
  };
  const values = new Map([['al_signup_handoff_context', JSON.stringify({ saved_at: Date.now(), ...source })]]);
  let posted;
  vm.runInNewContext(script, { URL, URLSearchParams, Date, AbortController, setTimeout, clearTimeout,
    document: { cookie: '', getElementById: element }, navigator: {},
    window: { location: { search: '?os=mac&ref=dealer123&fb_event_id=event123', origin: 'https://autolander.ai' },
      localStorage: { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) } },
    fetch: async (url, options) => { posted = { url, body: JSON.parse(options.body) }; return { ok: true, json: async () => ({ token }) }; },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(clicks.length, 1);
  assert.match(clicks[0], /AutoLander-Mac\.dmg\?fb_event_id=event123$/);
  assert.equal(clicks[0].includes(token), false);
  assert.equal(posted.url, '/api/attribution/token');
  assert.equal(posted.body.attribution.fbp, source.attribution.fbp);
  const app = new URL(element('open-app').href);
  assert.equal(app.protocol, 'autolander:');
  assert.equal(app.searchParams.get('attribution_token'), token);
  assert.equal(app.searchParams.get('ref'), 'dealer123');
  assert.equal(values.get('al_signup_attribution_token'), token);
  const html = await readFile(new URL('../public/download/setup/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /fbq|gtag|googletagmanager|connect\.facebook/);
  assert.match(html, /name="referrer" content="no-referrer"/);
});

test('blocked storage and a signing outage still allow installer download and app signup', async () => {
  const script = await readFile(new URL('../public/al-download-setup.js', import.meta.url), 'utf8');
  const elements = new Map(); const clicks = [];
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', addEventListener() {}, removeAttribute() {},
      click() { clicks.push(this.href); },
    });
    return elements.get(id);
  };
  let posted;
  vm.runInNewContext(script, { URL, URLSearchParams, Date, AbortController, setTimeout, clearTimeout,
    document: { cookie: '_fbp=fb.1.1757000000000.123456; _fbc=fb.1.1757000000000.MiXeD_ID', getElementById: element },
    navigator: {}, window: {
      location: { search: '?os=untrusted&ref=dealer123', origin: 'https://autolander.ai' },
      localStorage: { getItem() { throw new Error('storage blocked'); } },
    },
    fetch: async (_url, options) => { posted = JSON.parse(options.body); throw new Error('network unavailable'); },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(clicks.length, 1);
  assert.match(clicks[0], /\/AutoLander-Setup\.exe$/);
  assert.equal(posted.attribution.fbc, 'fb.1.1757000000000.MiXeD_ID');
  assert.equal(element('open-app').href, 'autolander://signup?ref=dealer123');
  assert.equal(element('setup-code').value, '');
  assert.match(element('status').textContent, /You can still open the app/);
});
