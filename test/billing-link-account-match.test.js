// Admin "Payment Links" e-mail auto-match + account change/detach:
//   • SPA helpers (src/admin/lib/billing-links.js): normalizeAccountMatch, the advisory core-plan
//     warning, the created-link line, the list-row stamp and the fetch wrappers;
//   • Worker proxies (worker/src/admin/billing-links.js) and their route order in
//     worker/src/admin/router.js — 'account-match' must never be read as a link id.
// The cloud endpoints themselves are built by the cloud lane; these pin the contract we call.

import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError } from '../src/admin/lib/api.js';
import {
  CORE_PLAN_CODES,
  accountCoreWarning,
  accountMatchLabel,
  accountMatchNote,
  billingLinkAccountErrorText,
  candidateCoreConflict,
  coreConflictMessage,
  describeCreatedAccountMatch,
  findAccountMatch,
  isAccountMatchUnavailable,
  isCoreLinkChoice,
  normalizeAccountMatch,
  normalizeAccountMatchStamp,
  normalizeBillingLinkRow,
  setBillingLinkAccount,
} from '../src/admin/lib/billing-links.js';
import {
  handleBillingLinkAccountMatch,
  handleBillingLinkSetAccount,
  handleBillingLinksCreate,
} from '../worker/src/admin/billing-links.js';
import { handleAdmin } from '../worker/src/admin/router.js';

// The cloud's candidate shape (out-of-band-linking findOrgCandidates / loadAccountCandidate).
const CLOUD_CANDIDATE = {
  org: { id: 'org-A', name: 'Acme Motors', slug: 'acme', plan: 'PRO', groupId: null, isGroupHq: false },
  phone: '+15555550123',
  adminUsers: [{ id: 'u1', email: 'owner@acme.test', displayName: 'Olive Owner', role: 'ADMIN' }],
  matchedUsers: [],
  subscription: { plan: 'PRO', status: 'active', stripeSubscriptionId: 'sub_1', billedByGroupId: null },
  creditBalance: 120,
};

const MATCHED_PAYLOAD = {
  email: 'owner@acme.test',
  status: 'matched',
  autoAttach: true,
  orgCount: 1,
  candidate: CLOUD_CANDIDATE,
  coreGuard: {
    blocked: true,
    code: 'CORE_PLAN_ACTIVE',
    plan: 'PRO',
    status: 'active',
    message: 'Acme Motors already has an active Pro subscription (active). Plan changes are made in the app under Configuration → Billing — a second core plan can\'t be sold on the same account. Past-due accounts can still be sent a replacement link.',
  },
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function withFetchStub(respond, run) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return respond(String(url), init);
  };
  try {
    await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const WORKER_ENV = {
  OPS_ADMIN_TOKEN: 'ops-secret',
  AUTOLANDER_CLOUD_URL: 'https://cloud.example.test/',
  ADMIN_PASSWORD: 'admin-pass',
  ADMIN_SESSION_SECRET: 'session-secret',
};

// ---------------------------------------------------------------- SPA helpers

test('normalizeAccountMatch maps the cloud candidate into the account-picker shape', () => {
  const match = normalizeAccountMatch(MATCHED_PAYLOAD);
  assert.equal(match.status, 'matched');
  assert.equal(match.email, 'owner@acme.test');
  assert.equal(match.autoAttach, true);
  assert.equal(match.orgCount, 1);
  assert.deepEqual(match.candidate, {
    orgId: 'org-A',
    orgName: 'Acme Motors',
    plan: 'PRO',
    subscription: CLOUD_CANDIDATE.subscription,
    admins: ['owner@acme.test'],
  });
  assert.deepEqual(match.candidates, []);
  assert.deepEqual(match.coreGuard, {
    blocked: true,
    message: MATCHED_PAYLOAD.coreGuard.message,
    plan: 'PRO',
    status: 'active',
  });
});

test('normalizeAccountMatch tolerates null, ambiguous and odd payloads', () => {
  for (const payload of [null, undefined, 'nope', 42, []]) {
    const match = normalizeAccountMatch(payload);
    assert.equal(match.status, '');
    assert.equal(match.autoAttach, false);
    assert.equal(match.candidate, null);
    assert.deepEqual(match.candidates, []);
    assert.deepEqual(match.coreGuard, { blocked: false, message: '', plan: '', status: '' });
  }

  const ambiguous = normalizeAccountMatch({
    email: 'shared@x.test',
    status: 'ambiguous',
    autoAttach: 'true', // only a real boolean true counts
    orgCount: 2,
    candidate: null,
    candidates: [
      { ...CLOUD_CANDIDATE, org: { id: 'org-A', name: 'Acme Motors' } },
      { ...CLOUD_CANDIDATE, org: { id: 'org-B', name: 'Bravo Autos' }, subscription: null },
      { org: {} }, // no id -> dropped
    ],
    coreGuard: { blocked: false },
  });
  assert.equal(ambiguous.status, 'ambiguous');
  assert.equal(ambiguous.autoAttach, false);
  assert.equal(ambiguous.orgCount, 2);
  assert.equal(ambiguous.candidate, null);
  assert.deepEqual(ambiguous.candidates.map((c) => c.orgId), ['org-A', 'org-B']);
  assert.equal(ambiguous.coreGuard.blocked, false);
});

// The cloud's reply when the CRM e-mail belongs to an AGENT/MANAGER of exactly one account
// (billing-links.js resolveAccountForLink -> 'non_owner_match'): the account comes back as the
// candidate, autoAttach false. It must reach the rep as a suggestion, never as an attach.
const NON_OWNER_PAYLOAD = {
  email: 'rep@acme.test',
  status: 'non_owner_match',
  autoAttach: false,
  orgCount: 1,
  candidate: { ...CLOUD_CANDIDATE, subscription: null },
  coreGuard: { blocked: false },
};

test('non_owner_match: the candidate survives normalizing and is offered as a suggestion only', () => {
  const match = normalizeAccountMatch(NON_OWNER_PAYLOAD);
  assert.equal(match.status, 'non_owner_match');
  assert.equal(match.autoAttach, false);
  assert.deepEqual(match.candidate, {
    orgId: 'org-A',
    orgName: 'Acme Motors',
    plan: 'PRO',
    subscription: null,
    admins: ['owner@acme.test'],
  });

  const described = accountMatchNote(match);
  assert.ok(described, 'a non-owner match must show a note, not nothing');
  assert.equal(described.tone, 'warn');
  assert.equal(
    described.note,
    'rep@acme.test belongs to a team member (not the owner) of Acme Motors — it is only suggested, '
      + 'never attached automatically. Attach it manually only if intended.',
  );
  assert.deepEqual(described.options.map((c) => c.orgId), ['org-A']);
  // The rep having removed an earlier suggestion does not hide this one.
  assert.deepEqual(accountMatchNote(match, { cleared: true }), described);

  // Without a candidate (older cloud) there is still a note, just no button.
  const bare = accountMatchNote(normalizeAccountMatch({ ...NON_OWNER_PAYLOAD, candidate: null }));
  assert.match(bare.note, /team member \(not the owner\) of an account/);
  assert.deepEqual(bare.options, []);

  // The display side reads it as words, not the raw key.
  assert.equal(accountMatchLabel('non_owner_match'), 'Matched a team member, not the owner (suggest only)');
  assert.equal(
    describeCreatedAccountMatch({ status: 'non_owner_match', email: 'rep@acme.test', orgId: 'org-A' }),
    'Not attached — matched a team member, not the owner (suggest only)',
  );
});

test('accountMatchNote covers every cloud status and never drops a suggestion', () => {
  const candidate = normalizeAccountMatch(MATCHED_PAYLOAD).candidate;
  const withStatus = (status, extra = {}) => normalizeAccountMatch({
    email: 'owner@acme.test', status, autoAttach: false, candidate: CLOUD_CANDIDATE, ...extra,
  });

  // An attached match says nothing until the rep removes it; then it offers the account back.
  assert.equal(accountMatchNote(normalizeAccountMatch(MATCHED_PAYLOAD)), null);
  const removed = accountMatchNote(normalizeAccountMatch(MATCHED_PAYLOAD), { cleared: true });
  assert.match(removed.note, /^E-mail match removed — this link will not attach to Acme Motors/);
  assert.deepEqual(removed.options, [candidate]);
  assert.equal(removed.tone, 'muted');

  const ambiguous = accountMatchNote(normalizeAccountMatch({
    email: 'shared@x.test',
    status: 'ambiguous',
    candidates: [CLOUD_CANDIDATE, { ...CLOUD_CANDIDATE, org: { id: 'org-B', name: 'Bravo Autos' } }],
  }));
  assert.equal(ambiguous.note, 'More than one account uses shared@x.test — pick the right one below.');
  assert.deepEqual(ambiguous.options.map((c) => c.orgId), ['org-A', 'org-B']);
  assert.equal(ambiguous.tone, 'warn');

  const none = accountMatchNote(normalizeAccountMatch({ email: 'new@x.test', status: 'none', candidate: null }));
  assert.match(none.note, /^No AutoLander account uses new@x\.test yet/);
  assert.deepEqual(none.options, []);

  const group = accountMatchNote(withStatus('dealer_group'));
  assert.match(group.note, /belongs to a dealer-group store — it is only suggested/);
  assert.deepEqual(group.options, [candidate]);
  assert.equal(group.tone, 'warn');

  // The earlier draft name stays handled.
  const noOwner = accountMatchNote(withStatus('no_owner'));
  assert.match(noOwner.note, /matches an account with no active owner/);
  assert.deepEqual(noOwner.options, [candidate]);

  const failed = accountMatchNote({ status: 'lookup_failed', email: 'owner@acme.test', candidates: [] });
  assert.equal(failed.note, 'Could not check accounts by e-mail. You can still search and attach an account below.');
  assert.deepEqual(failed.options, []);

  // A status this build does not know still offers its candidate instead of vanishing.
  const unknown = accountMatchNote(withStatus('some_future_status'));
  assert.equal(
    unknown.note,
    'owner@acme.test matches Acme Motors, but it was not attached automatically (some_future_status). '
      + 'Attach it manually only if intended.',
  );
  assert.deepEqual(unknown.options, [candidate]);
  assert.equal(unknown.tone, 'warn');

  // Nothing to say: no status, no e-mail to match, or an unknown status with no account.
  assert.equal(accountMatchNote(null), null);
  assert.equal(accountMatchNote(normalizeAccountMatch(null)), null);
  assert.equal(accountMatchNote(normalizeAccountMatch({ status: 'no_email', email: null })), null);
  assert.equal(accountMatchNote(withStatus('some_future_status', { candidate: null })), null);
});

test('core plans: the four posting plans, never the trial choice or add-ons', () => {
  assert.deepEqual([...CORE_PLAN_CODES], ['STARTER', 'GROWTH', 'PRO', 'PRO_TEAM']);
  for (const code of ['STARTER', 'growth', 'PRO', 'PRO_TEAM']) assert.equal(isCoreLinkChoice(code), true, code);
  for (const code of ['STARTER_TRIAL_3D', 'AI_STUDIO', 'CREDIT_PACK', 'FREE', '', null]) {
    assert.equal(isCoreLinkChoice(code), false, String(code));
  }
});

test('the advisory core warning mirrors the server guard, and prefers its sentence', () => {
  const candidate = normalizeAccountMatch(MATCHED_PAYLOAD).candidate;
  assert.deepEqual(candidateCoreConflict(candidate), { plan: 'PRO', status: 'active' });

  const sub = (overrides) => ({ subscription: { plan: 'GROWTH', status: 'trialing', stripeSubscriptionId: 'sub_2', ...overrides } });
  assert.deepEqual(candidateCoreConflict(sub({})), { plan: 'GROWTH', status: 'trialing' });
  // Not blocking: replaceable/inactive, no Stripe sub (the sign-up placeholder), add-ons, group seats.
  for (const overrides of [
    { status: 'past_due' },
    { status: 'unpaid' },
    { status: 'canceled' },
    { stripeSubscriptionId: null },
    { plan: 'FREE' },
    { plan: 'AI_STUDIO' },
    { billedByGroupId: 'grp-1' },
  ]) {
    assert.equal(candidateCoreConflict(sub(overrides)), null, JSON.stringify(overrides));
  }
  assert.equal(candidateCoreConflict({ subscription: null }), null);
  assert.equal(candidateCoreConflict({ subscription: 'PRO · active' }), null);

  const match = normalizeAccountMatch(MATCHED_PAYLOAD);
  assert.equal(
    accountCoreWarning({ selectedOrg: { ...match.candidate, autoMatched: true }, accountMatch: match }),
    MATCHED_PAYLOAD.coreGuard.message,
  );
  assert.equal(
    accountCoreWarning({ selectedOrg: sub({ plan: 'PRO_TEAM', status: 'active' }), accountMatch: null }),
    'This account already has an active Dealer Plan plan — this link will be refused. Plan changes are made in the app under Configuration → Billing.',
  );
  assert.equal(accountCoreWarning({ selectedOrg: sub({ status: 'past_due' }), accountMatch: match }), '');
  assert.equal(accountCoreWarning({ selectedOrg: null, accountMatch: match }), '');
  assert.match(coreConflictMessage({ plan: 'STARTER' }), /active Starter plan/);
});

test('created-link line, list-row stamp and labels read planMeta.accountMatch', () => {
  assert.equal(
    describeCreatedAccountMatch({ status: 'auto_attached', email: 'owner@acme.test', orgId: 'org-A' }, { orgId: 'org-A' }),
    'Attached to org-A (matched by e-mail)',
  );
  assert.equal(
    describeCreatedAccountMatch({ status: 'auto_attached', orgId: 'org-A' }, { orgId: 'org-A', orgName: 'Acme Motors' }),
    'Attached to Acme Motors (matched by e-mail)',
  );
  assert.equal(
    describeCreatedAccountMatch({ status: 'rep_selected', orgId: 'org-B' }, { orgId: 'org-B', orgName: 'Bravo Autos' }),
    'Attached to Bravo Autos (rep choice)',
  );
  assert.equal(describeCreatedAccountMatch({ status: 'ambiguous' }), 'Not attached — several accounts use this e-mail');
  assert.equal(describeCreatedAccountMatch({ status: 'rep_cleared' }), 'Not attached — e-mail match removed by rep');
  // An older cloud sends no accountMatch at all: nothing is shown.
  assert.equal(describeCreatedAccountMatch(undefined), '');
  assert.equal(describeCreatedAccountMatch(null), '');

  const row = normalizeBillingLinkRow({
    id: 'cr_1',
    planCode: 'PRO',
    planMeta: { accountMatch: { status: 'auto_attached_at_open', email: 'owner@acme.test', orgId: 'org-A', at: '2026-09-24T00:00:00.000Z' } },
  });
  assert.deepEqual(row.accountMatch, {
    status: 'auto_attached_at_open',
    email: 'owner@acme.test',
    orgId: 'org-A',
    at: '2026-09-24T00:00:00.000Z',
  });
  // planMeta's normalized trial fields are untouched by the new key.
  assert.deepEqual(row.planMeta, { trialCode: '', trialDays: null });
  assert.equal(normalizeBillingLinkRow({ id: 'cr_2', planCode: 'PRO' }).accountMatch, null);
  assert.equal(normalizeAccountMatchStamp({ status: '' }), null);

  assert.equal(accountMatchLabel('auto_attached'), 'Matched by e-mail');
  assert.equal(accountMatchLabel('ambiguous'), 'Several accounts use this e-mail');
  assert.equal(accountMatchLabel('rep_cleared'), 'E-mail match removed by rep');
  assert.equal(accountMatchLabel('non_owner_match'), 'Matched a team member, not the owner (suggest only)');
  assert.equal(accountMatchLabel('dealer_group'), 'Dealer-group store (suggest only)');
  assert.equal(accountMatchLabel('something_new'), 'something_new');
  assert.equal(accountMatchLabel(''), '—');
});

test('SPA fetch wrappers hit the Worker admin routes and map errors for the UI', async () => {
  await withFetchStub((url) => {
    if (url.includes('/account-match')) return jsonResponse(MATCHED_PAYLOAD);
    return jsonResponse({ request: { id: 'cr 1', orgId: null }, accountMatch: { status: 'rep_cleared' } });
  }, async (calls) => {
    const match = await findAccountMatch('  Owner@Acme.test ');
    assert.equal(calls[0].url, '/admin-api/billing-links/account-match?email=Owner%40Acme.test');
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(match.candidate.orgId, 'org-A');

    await setBillingLinkAccount('cr 1', null);
    assert.equal(calls[1].url, '/admin-api/billing-links/cr%201/account');
    assert.equal(calls[1].init.method, 'POST');
    assert.deepEqual(JSON.parse(calls[1].init.body), { orgId: null });

    await setBillingLinkAccount('cr_2', 'org-B');
    assert.deepEqual(JSON.parse(calls[2].init.body), { orgId: 'org-B' });
  });

  // An older cloud (no endpoint) answers the detail route's 404: no suggestion, no error note.
  await withFetchStub(() => jsonResponse({ ok: false, reason: 'not_found', error: 'not_found' }, 404), async () => {
    const err = await findAccountMatch('owner@acme.test').catch((error) => error);
    assert.ok(err instanceof ApiError);
    assert.equal(isAccountMatchUnavailable(err), true);
    assert.equal(
      billingLinkAccountErrorText(err),
      'Changing the account on a link needs the latest AutoLander cloud release.',
    );
  });
  assert.equal(isAccountMatchUnavailable(new ApiError('ops_not_configured', { status: 503, reason: 'ops_not_configured' })), true);
  assert.equal(isAccountMatchUnavailable(new ApiError('http_500', { status: 500, reason: 'http_500' })), false);

  // The cloud's refusal sentence reaches the rep instead of the bare code.
  await withFetchStub(() => jsonResponse({
    ok: false,
    reason: 'LINK_ACCOUNT_LOCKED',
    error: 'LINK_ACCOUNT_LOCKED',
    message: 'This link was already opened (or is not a posting-plan link). Disable it and create a new one to change the account.',
  }, 409), async () => {
    const err = await setBillingLinkAccount('cr_3', 'org-B').catch((error) => error);
    assert.equal(err.message, 'LINK_ACCOUNT_LOCKED');
    assert.equal(
      billingLinkAccountErrorText(err),
      'This link was already opened (or is not a posting-plan link). Disable it and create a new one to change the account.',
    );
  });
});

// ---------------------------------------------------------------- Worker proxies

test('account-match proxies to the cloud with the ops token, and refuses a missing e-mail locally', async () => {
  await withFetchStub(() => jsonResponse(MATCHED_PAYLOAD), async (calls) => {
    const result = await handleBillingLinkAccountMatch(
      new URL('https://autolander.ai/admin-api/billing-links/account-match?email=%20Owner%2Btag%40Acme.test%20'),
      WORKER_ENV,
    );
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, MATCHED_PAYLOAD);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://cloud.example.test/api/billing-links/account-match?email=Owner%2Btag%40Acme.test');
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].init.headers.Authorization, 'Bearer ops-secret');
  });

  await withFetchStub(() => {
    throw new Error('fetch must not be called');
  }, async (calls) => {
    const missing = await handleBillingLinkAccountMatch(new URL('https://autolander.ai/admin-api/billing-links/account-match'), WORKER_ENV);
    assert.deepEqual(missing, { status: 400, body: { ok: false, reason: 'missing_email' } });
    const blank = await handleBillingLinkAccountMatch(new URL('https://autolander.ai/x?email=%20%20'), WORKER_ENV);
    assert.equal(blank.status, 400);
    const huge = await handleBillingLinkAccountMatch(new URL(`https://autolander.ai/x?email=${'a'.repeat(400)}%40x.test`), WORKER_ENV);
    assert.deepEqual(huge, { status: 400, body: { ok: false, reason: 'invalid_email' } });
    const unconfigured = await handleBillingLinkAccountMatch(new URL('https://autolander.ai/x?email=a%40b.test'), {});
    assert.deepEqual(unconfigured, { status: 503, body: { ok: false, reason: 'ops_not_configured' } });
    assert.equal(calls.length, 0);
  });
});

test('set-account forwards only a trimmed orgId (or null) to the cloud', async () => {
  const post = (body) => new Request('https://autolander.ai/admin-api/billing-links/cr_1/account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

  await withFetchStub(() => jsonResponse({ request: { id: 'cr_1' }, accountMatch: { status: 'rep_selected' } }), async (calls) => {
    const attached = await handleBillingLinkSetAccount(post({ orgId: '  org-B  ', planCode: 'FREE', extra: 1 }), WORKER_ENV, 'cr_1');
    assert.equal(attached.status, 200);
    assert.equal(calls[0].url, 'https://cloud.example.test/api/billing-links/cr_1/account');
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].init.headers.Authorization, 'Bearer ops-secret');
    assert.deepEqual(JSON.parse(calls[0].init.body), { orgId: 'org-B' });

    // Detach: an explicit null, a blank string, or no orgId at all (the cloud reads a missing
    // orgId as null too).
    for (const body of [{ orgId: null }, { orgId: '   ' }, {}]) {
      await handleBillingLinkSetAccount(post(body), WORKER_ENV, 'cr_1');
      assert.deepEqual(JSON.parse(calls.at(-1).init.body), { orgId: null }, JSON.stringify(body));
    }

    const tooLong = await handleBillingLinkSetAccount(post({ orgId: 'o'.repeat(201) }), WORKER_ENV, 'cr_1');
    assert.deepEqual(tooLong, { status: 400, body: { ok: false, reason: 'invalid_org_id' } });
    const noId = await handleBillingLinkSetAccount(post({ orgId: 'org-B' }), WORKER_ENV, '');
    assert.deepEqual(noId, { status: 400, body: { ok: false, reason: 'missing_id' } });
  });
});

test('set-account refuses a malformed body instead of forwarding it as a detach', async () => {
  const post = (body) => new Request('https://autolander.ai/admin-api/billing-links/cr_1/account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  await withFetchStub(() => {
    throw new Error('fetch must not be called');
  }, async (calls) => {
    // A non-string, non-null orgId is not "no account": the cloud answers 400 for it as well.
    for (const orgId of [42, true, { id: 'org-B' }, ['org-B']]) {
      const refused = await handleBillingLinkSetAccount(post(JSON.stringify({ orgId })), WORKER_ENV, 'cr_1');
      assert.deepEqual(refused, { status: 400, body: { ok: false, reason: 'invalid_org_id' } }, JSON.stringify(orgId));
    }
    // A body that is not a JSON object never reaches the cloud either.
    for (const raw of ['not json', '', 'null', '[]', '"org-B"', '7']) {
      const refused = await handleBillingLinkSetAccount(post(raw), WORKER_ENV, 'cr_1');
      assert.deepEqual(refused, { status: 400, body: { ok: false, reason: 'invalid_body' } }, raw);
    }
    assert.equal(calls.length, 0);
  });
});

test('a cloud CORE_PLAN_ACTIVE refusal keeps its sentence through the create proxy', async () => {
  const message = 'Acme Motors already has an active Pro subscription (active). Plan changes are made in the app under Configuration → Billing.';
  await withFetchStub(() => jsonResponse({ error: 'CORE_PLAN_ACTIVE', message }, 409), async () => {
    const result = await handleBillingLinksCreate(new Request('https://autolander.ai/admin-api/billing-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planCode: 'PRO', billingInterval: 'monthly', orgId: 'org-A', notCrmLinked: true }),
    }), WORKER_ENV);
    assert.equal(result.status, 409);
    assert.equal(result.body.ok, false);
    assert.equal(result.body.reason, 'CORE_PLAN_ACTIVE');
    assert.equal(result.body.message, message);
  });
});

// ---------------------------------------------------------------- Worker route order

async function adminToken() {
  const response = await handleAdmin(new Request('https://autolander.ai/admin-api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: WORKER_ENV.ADMIN_PASSWORD }),
  }), WORKER_ENV, {});
  const body = await response.json();
  assert.equal(body.ok, true);
  return body.token;
}

test('router: account-match and /:id/account reach their own handlers, not the detail route', async () => {
  const token = await adminToken();
  const authed = (path, init = {}) => new Request(`https://autolander.ai${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

  await withFetchStub(() => jsonResponse({ ok: true }), async (calls) => {
    const match = await handleAdmin(authed('/admin-api/billing-links/account-match?email=owner%40acme.test'), WORKER_ENV, {});
    assert.equal(match.status, 200);
    assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/billing-links/account-match?email=owner%40acme.test');

    const setAccount = await handleAdmin(authed('/admin-api/billing-links/cr%2F9/account', {
      method: 'POST',
      body: JSON.stringify({ orgId: 'org-B' }),
    }), WORKER_ENV, {});
    assert.equal(setAccount.status, 200);
    assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/billing-links/cr%2F9/account');
    assert.equal(calls.at(-1).init.method, 'POST');
    assert.deepEqual(JSON.parse(calls.at(-1).init.body), { orgId: 'org-B' });

    // The existing routes are unchanged.
    await handleAdmin(authed('/admin-api/billing-links/cr_1'), WORKER_ENV, {});
    assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/billing-links/cr_1');
    await handleAdmin(authed('/admin-api/billing-links/cr_1/disable', { method: 'POST', body: '{}' }), WORKER_ENV, {});
    assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/billing-links/cr_1/disable');

    // GET on the account route is not a thing; it must not fall into the detail proxy.
    const before = calls.length;
    const wrongMethod = await handleAdmin(authed('/admin-api/billing-links/cr_1/account'), WORKER_ENV, {});
    assert.equal(wrongMethod.status, 404);
    assert.equal(calls.length, before);
  });

  // Without an admin session nothing is proxied.
  await withFetchStub(() => jsonResponse({ ok: true }), async (calls) => {
    const anonymous = await handleAdmin(new Request('https://autolander.ai/admin-api/billing-links/account-match?email=a%40b.test'), WORKER_ENV, {});
    assert.equal(anonymous.status, 401);
    assert.equal(calls.length, 0);
  });
});
