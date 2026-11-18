import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import worker from '../worker/src/index.js';
import { handleLogin } from '../worker/src/admin/auth.js';

// Card #193 security review: the admin session cookie plus credentialed CORS for any
// *.autolander-*.pages.dev origin let a page on an attacker-registered Pages project drive
// /admin-api/login-email/* as the signed-in admin. These pins run the REAL Worker entry with
// the PRODUCTION ALLOWED_ORIGINS value from worker/wrangler.toml.

const wrangler = readFileSync(new URL('../worker/wrangler.toml', import.meta.url), 'utf8');
const PROD_ALLOWED_ORIGINS = wrangler.match(/^ALLOWED_ORIGINS = "([^"]+)"/m)[1];
const ENV = {
  ALLOWED_ORIGINS: PROD_ALLOWED_ORIGINS,
  ADMIN_SESSION_SECRET: 'origin-hardening-secret',
  ADMIN_PASSWORD: 'origin-hardening-password',
  OPS_ADMIN_TOKEN: 'server-only-ops-token',
  AUTOLANDER_CLOUD_URL: 'https://cloud.example.test',
};
const ATTACKERS = ['https://x.autolander-evil.pages.dev', 'https://autolander-screenshots.pages.dev', 'https://autolander-book.pages.dev'];
const BODY = {
  orgId: '11111111-1111-4111-8111-111111111111', userId: '22222222-2222-4222-8222-222222222222',
  expectCurrentEmail: 'old@example.test', newEmail: 'attacker@example.test', by: 'Clay',
  verification: { method: 'phone_callback', phoneAttested: true }, apply: true,
};

function sessionCookie() {
  const encoded = Buffer.from(JSON.stringify({ uid: 'owner', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  const signature = createHmac('sha256', ENV.ADMIN_SESSION_SECRET).update(encoded).digest('hex');
  return `al_admin=${encoded}.${signature}`;
}

function adminRequest(path, { method = 'POST', origin, body = BODY } = {}) {
  const headers = { Cookie: sessionCookie(), 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  return new Request(`https://autolander.ai/admin-api/login-email/${path}`, {
    method, headers, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
  });
}

function captureFetch(t) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: String(url), ...options });
    return Response.json({ ok: true, mode: 'apply' });
  });
  return calls;
}

test('production config has no pages.dev wildcard: attacker Pages origins get no CORS echo and 403 on every login-email write', async (t) => {
  const calls = captureFetch(t);
  for (const origin of ATTACKERS) {
    const preflight = await worker.fetch(new Request('https://autolander.ai/admin-api/login-email/start', {
      method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' },
    }), ENV, {});
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), null, origin);
    assert.equal(preflight.headers.get('Access-Control-Allow-Credentials'), null, origin);
    for (const path of ['start', 'cancel', 'send-reset', 'status']) {
      const response = await worker.fetch(adminRequest(path, { origin, method: path === 'status' ? 'GET' : 'POST' }), ENV, {});
      assert.equal(response.status, 403, `${origin} ${path}`);
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), null, `${origin} ${path}`);
      assert.equal(response.headers.get('Access-Control-Allow-Credentials'), null, `${origin} ${path}`);
    }
  }
  assert.equal(calls.length, 0);
});

test('the real admin origin still proxies login-email writes with the session cookie', async (t) => {
  const calls = captureFetch(t);
  for (const origin of ['https://autolander.ai', 'https://www.autolander.ai']) {
    const response = await worker.fetch(adminRequest('start', { origin }), ENV, {});
    assert.equal(response.status, 200, origin);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  }
  assert.equal(calls.length, 2);
  assert.ok(calls.every((call) => call.url === 'https://cloud.example.test/api/ops/login-email/start'));
});

test('an allowed public-site origin (the preview) and a missing Origin cannot write login emails', async (t) => {
  const calls = captureFetch(t);
  const preview = await worker.fetch(adminRequest('start', { origin: 'https://autolander-preview.pages.dev' }), ENV, {});
  assert.equal(preview.status, 403);
  assert.equal((await preview.json()).reason, 'origin_not_allowed');
  const missing = await worker.fetch(adminRequest('cancel', { body: { ...BODY, pendingId: 'pending' } }), ENV, {});
  assert.equal(missing.status, 403);
  assert.equal((await missing.json()).reason, 'origin_not_allowed');
  assert.equal(calls.length, 0);
});

test('the documented preview host keeps its exact CORS echo for public APIs', async () => {
  const response = await worker.fetch(new Request('https://autolander.ai/api/availability', {
    method: 'OPTIONS', headers: { Origin: 'https://autolander-preview.pages.dev', 'Access-Control-Request-Method': 'GET' },
  }), { ...ENV, ALLOWED_ORIGINS: undefined }, {});
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://autolander-preview.pages.dev');
});

test('the admin session cookie is SameSite=Lax, never SameSite=None', async () => {
  const response = await handleLogin(new Request('https://autolander.ai/admin-api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: ENV.ADMIN_PASSWORD }),
  }), ENV, {});
  assert.equal(response.status, 200);
  const cookie = response.headers.get('Set-Cookie');
  assert.match(cookie, /^al_admin=/);
  assert.match(cookie, /; SameSite=Lax(;|$)/);
  assert.doesNotMatch(cookie, /SameSite=None/i);
  assert.match(cookie, /; HttpOnly(;|$)/);
  assert.match(cookie, /; Secure(;|$)/);
});
