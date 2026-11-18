import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import test from 'node:test';
import { requireAdmin } from '../worker/src/admin/auth.js';
import { handleAdmin } from '../worker/src/admin/router.js';
import {
  buildActor,
  handleLoginEmailCancel,
  handleLoginEmailSendReset,
  handleLoginEmailStart,
  handleLoginEmailStatus,
  proxyLoginEmail,
} from '../worker/src/admin/login-email.js';

const ENV = {
  AUTOLANDER_CLOUD_URL: 'https://cloud.example.test///',
  OPS_ADMIN_TOKEN: 'server-only-ops-token',
  ADMIN_SESSION_SECRET: 'test-admin-session-secret',
};
const AUTH = {
  ok: true,
  session: { uid: 'owner', exp: 2000000000 },
  sessionId: '0123456789abcdef0123456789abcdef',
};
const ACTOR = {
  uid: AUTH.session.uid,
  sessionId: AUTH.sessionId,
  sessionExp: AUTH.session.exp,
  ip: '2001:db8::1',
};
const INPUT = {
  orgId: '11111111-1111-4111-8111-111111111111',
  userId: '22222222-2222-4222-8222-222222222222',
  expectCurrentEmail: 'old@example.test',
  newEmail: 'new@example.test',
  verification: { method: 'card_last4', cardLast4: '1234', phoneAttested: false, cardNumber: 'drop-me' },
  by: 'Clay',
  note: 'Customer called.',
  pendingId: 'pending_123',
  role: 'ADMIN',
  orgIdOverride: 'another-org',
  actor: { uid: 'browser-forgery', sessionId: 'forged', ip: '1.1.1.1', channel: 'ops_token' },
};
const POST_HANDLERS = [
  ['start', handleLoginEmailStart, ['orgId', 'userId', 'expectCurrentEmail', 'newEmail', 'by', 'note']],
  ['cancel', handleLoginEmailCancel, ['orgId', 'userId', 'pendingId', 'by']],
  ['send-reset', handleLoginEmailSendReset, ['orgId', 'userId', 'expectCurrentEmail', 'by']],
];

function postRequest(path, body = INPUT, headers = {}) {
  return new Request(`https://admin.example.test/admin/login-email/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ACTOR.ip, ...headers },
    body: JSON.stringify(body),
  });
}

function signSession(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', ENV.ADMIN_SESSION_SECRET).update(encoded).digest('hex');
  return `${encoded}.${signature}`;
}

function captureFetch(t, body = { ok: true }) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, ...options });
    return Response.json(body);
  });
  return calls;
}

test('status uses the server token and forwards only encoded orgId and userId with the abort signal', async (t) => {
  const calls = captureFetch(t);
  const url = new URL('https://admin.example.test/admin/login-email/status?role=ADMIN&orgId=org%26one&userId=user%2Btwo&actor=forged&userId=ignored');
  const request = new Request(url);
  assert.equal(request.headers.has('Authorization'), false);
  const result = await handleLoginEmailStatus(request, url, ENV);
  assert.deepEqual(result, { status: 200, body: { ok: true } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://cloud.example.test/api/ops/login-email/status?orgId=org%26one&userId=user%2Btwo');
  assert.equal(calls[0].headers.Authorization, `Bearer ${ENV.OPS_ADMIN_TOKEN}`);
  assert.equal(calls[0].method, 'GET');
  assert.equal(calls[0].body, undefined);
  assert.equal(calls[0].signal, request.signal);
});

for (const [path, handler, keys] of POST_HANDLERS) {
  test(`${path} filters body fields and replaces the browser actor with the Worker actor`, async (t) => {
    const calls = captureFetch(t);
    const request = postRequest(path);
    assert.equal(request.headers.has('Authorization'), false);
    await handler(request, ENV, AUTH);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `https://cloud.example.test/api/ops/login-email/${path}`);
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].headers.Authorization, `Bearer ${ENV.OPS_ADMIN_TOKEN}`);
    assert.equal(calls[0].headers['Content-Type'], 'application/json');
    assert.equal(calls[0].signal, request.signal);
    const expected = Object.fromEntries(keys.map((key) => [key, INPUT[key]]));
    if (path === 'start') expected.verification = { method: 'card_last4', cardLast4: '1234', phoneAttested: false };
    assert.deepEqual(JSON.parse(calls[0].body), { ...expected, actor: ACTOR });
  });

  test(`${path} applies only for the literal boolean true`, async (t) => {
    const calls = captureFetch(t);
    for (const apply of ['true', 1, false, null, undefined, true]) {
      await handler(postRequest(path, { ...INPUT, apply }), ENV, AUTH);
      const body = JSON.parse(calls.at(-1).body);
      assert.equal(Object.hasOwn(body, 'apply'), apply === true);
      if (apply === true) assert.equal(body.apply, true);
    }
  });

  test(`${path} omits malformed connecting IP headers`, async (t) => {
    const calls = captureFetch(t);
    for (const ip of ['1.2.3.4, 5.6.7.8', '<x>', '', 'a', 'a'.repeat(46)]) {
      await handler(postRequest(path, INPUT, { 'CF-Connecting-IP': ip }), ENV, AUTH);
      const { ip: _ip, ...expected } = ACTOR;
      assert.deepEqual(JSON.parse(calls.at(-1).body).actor, expected);
    }
  });
}

test('buildActor omits missing or invalid cloud actor fields without coercing them', () => {
  const request = new Request('https://admin.example.test');
  assert.deepEqual(buildActor(request), {});
  for (const uid of ['', 'a'.repeat(33), 'bad@email', 123, null]) {
    assert.deepEqual(buildActor(request, { session: { uid } }), {});
  }
  for (const sessionId of ['', 'A'.repeat(32), 'a'.repeat(15), 'a'.repeat(65), 123]) {
    assert.deepEqual(buildActor(request, { sessionId }), {});
  }
  for (const exp of [999999999, 10000000001, 2000000000.5, '2000000000', null]) {
    assert.deepEqual(buildActor(request, { session: { exp } }), {});
  }
  for (const exp of [1000000000, 10000000000]) {
    assert.deepEqual(buildActor(request, { session: { exp } }), { sessionExp: exp });
  }
  assert.deepEqual(buildActor(new Request(request, { headers: { 'CF-Connecting-IP': '1.2.3.4' } }), AUTH), {
    ...ACTOR, ip: '1.2.3.4',
  });
});

test('all login email routes reject absent and invalid sessions without calling cloud', async (t) => {
  const calls = captureFetch(t);
  for (const prefix of ['/admin', '/admin-api']) {
    for (const path of ['status', 'start', 'cancel', 'send-reset']) {
      for (const headers of [{}, { Authorization: 'Bearer invalid-session' }]) {
        const request = new Request(`https://admin.example.test${prefix}/login-email/${path}`, {
          method: path === 'status' ? 'GET' : 'POST', headers,
        });
        const response = await handleAdmin(request, ENV, {});
        assert.equal(response.status, 401);
        assert.equal((await response.json()).ok, false);
      }
    }
  }
  assert.equal(calls.length, 0);
});

test('all login email routes proxy a valid signed session and preserve CORS headers', async (t) => {
  const calls = captureFetch(t);
  const session = { uid: 'owner', exp: Math.floor(Date.now() / 1000) + 3600 };
  const token = signSession(session);
  const sessionId = createHash('sha256').update(token).digest('hex').slice(0, 32);
  for (const prefix of ['/admin', '/admin-api']) {
    for (const path of ['status', 'start', 'cancel', 'send-reset']) {
      const request = new Request(`https://admin.example.test${prefix}/login-email/${path}?orgId=org&userId=user`, {
        method: path === 'status' ? 'GET' : 'POST',
        headers: { Cookie: `al_admin=${token}`, 'CF-Connecting-IP': ACTOR.ip },
        ...(path === 'status' ? {} : { body: JSON.stringify(INPUT) }),
      });
      const response = await handleAdmin(request, ENV, { 'Access-Control-Allow-Origin': 'https://admin.example.test' });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { ok: true });
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://admin.example.test');
      const call = calls.at(-1);
      assert.equal(new URL(call.url).pathname, `/api/ops/login-email/${path}`);
      assert.equal(call.headers.Authorization, `Bearer ${ENV.OPS_ADMIN_TOKEN}`);
      if (path !== 'status') {
        assert.deepEqual(JSON.parse(call.body).actor, { uid: session.uid, sessionId, sessionExp: session.exp, ip: ACTOR.ip });
      }
    }
  }
  assert.equal(calls.length, 8);
});

test('missing ops token returns 503 for every handler without calling fetch', async (t) => {
  const calls = captureFetch(t);
  const env = { ...ENV, OPS_ADMIN_TOKEN: undefined };
  const expected = { status: 503, body: { ok: false, reason: 'ops_not_configured' } };
  const request = new Request('https://admin.example.test/admin/login-email/status?orgId=org&userId=user');
  assert.deepEqual(await handleLoginEmailStatus(request, new URL(request.url), env), expected);
  for (const [path, handler] of POST_HANDLERS) {
    assert.deepEqual(await handler(postRequest(path), env, AUTH), expected);
  }
  assert.equal(calls.length, 0);
});

test('requireAdmin returns the stable first 32 SHA-256 hex characters of the verified token', async () => {
  const session = { uid: 'owner', exp: Math.floor(Date.now() / 1000) + 3600 };
  const firstToken = signSession(session);
  const secondToken = signSession({ ...session, exp: session.exp + 1 });
  const authenticate = (headers) => requireAdmin(new Request('https://admin.example.test', { headers }), ENV);
  const first = await authenticate({ Authorization: `Bearer ${firstToken}` });
  const repeated = await authenticate({ Cookie: `al_admin=${firstToken}` });
  const second = await authenticate({ Authorization: `Bearer ${secondToken}` });
  assert.equal(first.ok, true);
  assert.deepEqual(first.session, session);
  assert.match(first.sessionId, /^[a-f0-9]{32}$/);
  assert.equal(first.sessionId, createHash('sha256').update(firstToken).digest('hex').slice(0, 32));
  assert.equal(first.sessionId, repeated.sessionId);
  assert.notEqual(first.sessionId, second.sessionId);
  assert.equal((await authenticate({ Authorization: `Bearer ${secondToken}`, Cookie: `al_admin=${firstToken}` })).sessionId, second.sessionId);
});

test('proxy retains the support proxy error mappings and exposes cloud refusal codes to api.js', async (t) => {
  const cases = [
    [503, { error: 'ops_disabled' }, 503, 'ops_not_configured'],
    [503, { reason: 'ops_disabled' }, 503, 'ops_not_configured'],
    [401, { error: 'unauthorized' }, 502, 'ops_token_rejected'],
    [403, { error: 'forbidden' }, 502, 'ops_token_rejected'],
    [200, null, 502, 'cloud_bad_response'],
    [200, 'not an object', 502, 'cloud_bad_response'],
    [409, { ok: false, reasons: ['EMAIL_IN_USE', 'SAME_EMAIL'] }, 409, 'EMAIL_IN_USE'],
    [400, { error: 'invalid_by' }, 400, 'invalid_by'],
    [429, { ok: false, reason: 'RATE_LIMITED' }, 429, 'RATE_LIMITED'],
    [500, {}, 500, 'cloud_http_500'],
  ];
  for (const [upstreamStatus, body, status, reason] of cases) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(body, { status: upstreamStatus }));
    const result = await proxyLoginEmail(ENV, '/status');
    assert.equal(result.status, status);
    assert.equal(result.body.reason, reason);
    t.mock.restoreAll();
  }
  t.mock.method(globalThis, 'fetch', async () => new Response('invalid JSON'));
  assert.equal((await proxyLoginEmail(ENV, '/status')).body.reason, 'cloud_bad_response');
  t.mock.restoreAll();
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline'); });
  assert.deepEqual(await proxyLoginEmail(ENV, '/status'), {
    status: 502, body: { ok: false, reason: 'cloud_unreachable', message: 'offline' },
  });
});
