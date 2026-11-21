import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { handleAdmin } from '../worker/src/admin/router.js';
import { handleOrgRename, proxyOrgRename } from '../worker/src/admin/org-rename.js';
import {
  canRenameOrg,
  ORG_RENAME_COPY,
  ORG_RENAME_REASON_TEXT,
  orgRenameFailureText,
  renameOrg,
} from '../src/admin/lib/org-rename.js';

// Notion #198 (2026-11-21): Clay renames a dealership from the admin dashboard (the AI
// replies sign with the dealership name; #186 kept "Classic Chevrolet"). The Worker
// forwards to the cloud lever POST /api/ops/orgs/rename with the server-only token.

const ENV = {
  AUTOLANDER_CLOUD_URL: 'https://cloud.example.test///',
  OPS_ADMIN_TOKEN: 'server-only-ops-token',
  ADMIN_SESSION_SECRET: 'test-admin-session-secret',
};
const AUTH = { ok: true, session: { uid: 'owner', exp: 2000000000 }, sessionId: '0123456789abcdef0123456789abcdef' };
const ACTOR = { uid: 'owner', sessionId: AUTH.sessionId, sessionExp: 2000000000, ip: '2001:db8::1' };
const INPUT = {
  orgId: '899b78a8-0c35-4f5d-a955-2b599b2530e0',
  expectCurrentName: 'Classic Chevrolet',
  name: 'Tulsa Hyundai',
  by: 'Clay',
  source: 'ops',
  role: 'ADMIN',
  orgIdOverride: 'another-org',
  actor: { uid: 'browser-forgery', sessionId: 'forged', ip: '1.1.1.1' },
};

function signSession(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', ENV.ADMIN_SESSION_SECRET).update(encoded).digest('hex');
  return `${encoded}.${signature}`;
}
function captureFetch(t, body = { ok: true, mode: 'dry-run', wouldChange: true }, status = 200) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, ...options });
    return Response.json(body, { status });
  });
  return calls;
}
function postRequest(body = INPUT, headers = {}) {
  return new Request('https://admin.example.test/admin/orgs/rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ACTOR.ip, ...headers },
    body: JSON.stringify(body),
  });
}

test('the Worker forwards a whitelisted body with its own actor and the server token, never the abort signal', async (t) => {
  const calls = captureFetch(t);
  const result = await handleOrgRename(postRequest(), ENV, AUTH);
  assert.equal(result.status, 200);
  assert.equal(calls.length, 1);
  const call = calls[0];
  assert.equal(call.url, 'https://cloud.example.test/api/ops/orgs/rename');
  assert.equal(call.method, 'POST');
  assert.equal(call.headers.Authorization, `Bearer ${ENV.OPS_ADMIN_TOKEN}`);
  assert.equal(call.signal, undefined);
  assert.deepEqual(JSON.parse(call.body), {
    orgId: INPUT.orgId, expectCurrentName: 'Classic Chevrolet', name: 'Tulsa Hyundai', by: 'Clay', actor: ACTOR,
  });
});

test('apply is sent only for the literal boolean true (dry-run otherwise)', async (t) => {
  const calls = captureFetch(t);
  for (const apply of ['true', 1, 'yes', null, undefined, false]) {
    await handleOrgRename(postRequest({ ...INPUT, apply }), ENV, AUTH);
    assert.equal(Object.hasOwn(JSON.parse(calls.at(-1).body), 'apply'), false, String(apply));
  }
  await handleOrgRename(postRequest({ ...INPUT, apply: true }), ENV, AUTH);
  assert.equal(JSON.parse(calls.at(-1).body).apply, true);
});

test('a missing ops token answers 503 without calling the cloud', async (t) => {
  const calls = captureFetch(t);
  assert.deepEqual(await handleOrgRename(postRequest(), { ...ENV, OPS_ADMIN_TOKEN: undefined }, AUTH),
    { status: 503, body: { ok: false, reason: 'ops_not_configured' } });
  assert.equal(calls.length, 0);
});

test('cloud refusals reach the UI as a reason code', async (t) => {
  const cases = [
    [409, { mode: 'apply', ok: false, error: 'fence_refused', reasons: ['GROUP_ORG'] }, 409, 'GROUP_ORG'],
    [409, { mode: 'apply', ok: false, error: 'fence_refused', reasons: ['CURRENT_NAME_MISMATCH'] }, 409, 'CURRENT_NAME_MISMATCH'],
    [400, { error: 'invalid_name', message: 'Dealership names must be 2 to 100 characters.' }, 400, 'invalid_name'],
    [409, { mode: 'apply', ok: false, changed: false, error: 'target_changed' }, 409, 'target_changed'],
    [401, { error: 'unauthorized' }, 502, 'ops_token_rejected'],
    [503, { error: 'ops_disabled' }, 503, 'ops_not_configured'],
    [500, {}, 500, 'cloud_http_500'],
  ];
  for (const [upstream, body, status, reason] of cases) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(body, { status: upstream }));
    const result = await proxyOrgRename(ENV, { orgId: INPUT.orgId });
    assert.equal(result.status, status);
    assert.equal(result.body.reason, reason);
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('connection reset'); });
  assert.equal((await proxyOrgRename(ENV, {})).body.reason, 'cloud_unreachable');
});

test('the route needs an admin session and the exact admin Origin', async (t) => {
  const calls = captureFetch(t);
  for (const prefix of ['/admin', '/admin-api']) {
    const anonymous = new Request(`https://admin.example.test${prefix}/orgs/rename`, { method: 'POST', body: JSON.stringify(INPUT) });
    assert.equal((await handleAdmin(anonymous, ENV, {})).status, 401);
  }
  const session = { uid: 'owner', exp: Math.floor(Date.now() / 1000) + 3600 };
  const token = signSession(session);
  const sessionId = createHash('sha256').update(token).digest('hex').slice(0, 32);
  for (const origin of [undefined, 'https://evil.example', 'https://autolander.ai.evil.example']) {
    const response = await handleAdmin(postRequest(INPUT, { Cookie: `al_admin=${token}`, ...(origin ? { Origin: origin } : {}) }), ENV, {});
    assert.equal(response.status, 403);
    assert.equal((await response.json()).reason, 'origin_not_allowed');
  }
  assert.equal(calls.length, 0);
  const ok = await handleAdmin(postRequest(INPUT, { Cookie: `al_admin=${token}`, Origin: 'https://autolander.ai' }), ENV, {});
  assert.equal(ok.status, 200);
  assert.equal(calls.length, 1);
  assert.deepEqual(JSON.parse(calls[0].body).actor, { uid: session.uid, sessionId, sessionExp: session.exp, ip: ACTOR.ip });
});

test('the UI calls the Worker path and only offers Rename for a standalone dealership', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => { calls.push({ url, ...options }); return Response.json({ ok: true }); });
  await renameOrg({ orgId: 'org', name: 'Tulsa Hyundai' });
  assert.equal(calls[0].url, '/admin-api/orgs/rename');
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].credentials, 'include');
  assert.equal(canRenameOrg({ groupId: null, isGroupHq: false }), true);
  assert.equal(canRenameOrg({ groupId: 'group-1', isGroupHq: false }), false);
  assert.equal(canRenameOrg({ groupId: null, isGroupHq: true }), false);
  assert.equal(canRenameOrg(null), false);
});

test('refusals have plain copy; a name error shows the cloud message', () => {
  assert.equal(orgRenameFailureText({ reason: 'GROUP_ORG' }), 'This store belongs to a dealer group. Its group manages the name.');
  assert.equal(orgRenameFailureText({ reason: 'CURRENT_NAME_MISMATCH' }), 'The name changed since you opened this account. Reload and try again.');
  assert.equal(orgRenameFailureText({ reason: 'invalid_name', serverMessage: 'Dealership names must be 2 to 100 characters.' }),
    'Dealership names must be 2 to 100 characters.');
  assert.equal(orgRenameFailureText({ reason: 'something_new' }), 'Something went wrong. Nothing was changed.');
});

test('copy is frozen, plain ASCII, with no long dashes, in every new file', async () => {
  assert.ok(Object.isFrozen(ORG_RENAME_COPY));
  assert.ok(Object.isFrozen(ORG_RENAME_REASON_TEXT));
  for (const path of ['../src/admin/OrgRename.jsx', '../src/admin/lib/org-rename.js', '../worker/src/admin/org-rename.js']) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /[–—]/, path);
    // eslint-disable-next-line no-control-regex
    assert.doesNotMatch(source, /[^\x00-\x7f]/, path);
    assert.doesNotMatch(source, /\r/, path);
  }
});

test('the account page offers Rename next to the name, only when canRenameOrg allows it', async () => {
  const source = await readFile(new URL('../src/admin/AccountDetail.jsx', import.meta.url), 'utf8');
  assert.match(source, /import OrgRename from '\.\/OrgRename\.jsx';/);
  assert.match(source, /\{typeof org\.name === 'string' && org\.name && canRenameOrg\(org\) && \(/);
  assert.match(source, /<OrgRename[\s\S]*?currentName=\{org\.name\}/);
});

test('an applied rename claims a Stripe name change only when the cloud reports one', async () => {
  const { orgRenamedText } = await import('../src/admin/lib/org-rename.js');
  // Shapes are the cloud's own: routes/ops-orgs.js returns stripe: { updated, skipped, disabled?, error? }.
  const updated = orgRenamedText({ ok: true, changed: true, stripe: { updated: 1, skipped: [] } }, 'Tulsa Hyundai');
  assert.match(updated, /^Renamed to Tulsa Hyundai\. /);
  assert.match(updated, /Stripe customer name is updated too/);
  for (const stripe of [
    { updated: 0, skipped: ['custom_name'] },
    { updated: 0, skipped: ['shared_customer'] },
    { updated: 0, skipped: [], error: 'stripe_error' },
    { updated: 0, skipped: [], disabled: true },
    { updated: 0, skipped: [] },
    undefined,
  ]) {
    const text = orgRenamedText({ ok: true, changed: true, ...(stripe ? { stripe } : {}) }, 'Tulsa Hyundai');
    assert.match(text, /^Renamed to Tulsa Hyundai\. /);
    assert.doesNotMatch(text, /updated too/);
    assert.match(text, /Stripe customer name was not changed/);
  }
});

test('the rename dialog reads the Stripe outcome instead of a fixed success line', async () => {
  const source = await readFile(new URL('../src/admin/OrgRename.jsx', import.meta.url), 'utf8');
  assert.match(source, /orgRenamedText\(result, /);
  assert.doesNotMatch(source, /copy\('renamed'/);
});
