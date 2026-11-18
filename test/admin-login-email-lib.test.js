import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  cancelLoginEmailChange,
  emailsMatch,
  getLoginEmailStatus,
  isLast4,
  LOGIN_EMAIL_COPY,
  normalizeEmail,
  operatorNameError,
  REASON_TEXT,
  reasonText,
  sendLoginEmailReset,
  startLoginEmailChange,
} from '../src/admin/lib/login-email.js';

test('email normalization and matching require two nonempty trimmed case-insensitive strings', () => {
  assert.equal(normalizeEmail('  Clay@Example.TEST '), 'clay@example.test');
  assert.equal(emailsMatch(' Clay@Example.TEST ', 'clay@example.test'), true);
  assert.equal(emailsMatch('a@example.test', 'b@example.test'), false);
  for (const value of ['', ' ', null, undefined, 123, {}, []]) {
    assert.equal(normalizeEmail(value), '');
    assert.equal(emailsMatch(value, value), false);
    assert.equal(emailsMatch('a@example.test', value), false);
  }
});

test('last 4 accepts exactly four digits with no coercion or whitespace', () => {
  for (const value of ['0000', '1234', '9999']) assert.equal(isLast4(value), true);
  for (const value of ['', '123', '12345', '12a4', ' 1234', '1234\n', 1234, null, undefined]) {
    assert.equal(isLast4(value), false);
  }
});

test('operator name errors require 2-60 trimmed characters and reject email addresses', () => {
  for (const value of ['Al', ' Clay ', 'a'.repeat(60)]) assert.equal(operatorNameError(value), null);
  for (const value of ['', ' ', 'A', 'a'.repeat(61), null, 123]) {
    assert.equal(operatorNameError(value), 'Type your name.');
  }
  for (const value of ['@', ' clay@example.test ', 'a'.repeat(61) + '@']) {
    assert.equal(operatorNameError(value), 'Type your name, not an email address.');
  }
});

test('all reason codes have the specified copy and unknown codes use the safe fallback', () => {
  const expected = {
    USER_NOT_IN_ORG: 'This user is not in this account.',
    USER_DEACTIVATED: 'This user was removed from the team. Reactivate them first.',
    GROUP_OWNER: 'This is a dealer group owner login. Ask Mike to change it.',
    EMAIL_NOT_VERIFIED: 'This user has not verified their email yet. They can change it on the verification screen in the app.',
    CURRENT_EMAIL_MISMATCH: 'The current email changed since this page loaded. Refresh and try again.',
    SAME_EMAIL: 'That is already their login email.',
    EMAIL_IN_USE: 'Another AutoLander account already uses that email.',
    PHONE_NOT_ON_FILE: 'There is no phone on file for this account. Use the card check instead.',
    CARD_NOT_ON_FILE: 'There is no card on file for this account. Use the phone call instead.',
    VERIFICATION_FAILED: 'Those 4 digits do not match the card on file. Nothing was sent.',
    CARD_CHECK_LOCKED: 'Too many wrong card checks for this account today. Use the phone call, or try again tomorrow.',
    CARD_CHECK_UNAVAILABLE: 'We could not reach Stripe to check the card. Try again in a minute.',
    RATE_LIMITED: 'Too many email changes for this account today. Try again tomorrow or ask Mike.',
    NO_PENDING: 'There is no pending change to cancel.',
    NOT_OPEN: 'That change is no longer pending.',
    NO_EMAIL: 'This user has no email on file.',
    TARGET_CHANGED: 'The account changed while we were working. Refresh and try again.',
  };
  assert.deepEqual(REASON_TEXT, expected);
  for (const [code, text] of Object.entries(expected)) assert.equal(reasonText(code), text);
  for (const code of ['UNKNOWN', '', undefined, null, 'toString', '__proto__']) {
    assert.equal(reasonText(code), 'Something went wrong. Nothing was changed.');
  }
});

test('UI copy is frozen and copy and new implementation files contain no long dashes', async () => {
  assert.ok(Object.isFrozen(REASON_TEXT));
  assert.ok(Object.isFrozen(LOGIN_EMAIL_COPY));
  assert.doesNotMatch(JSON.stringify(REASON_TEXT), /[\u2013\u2014]/);
  assert.doesNotMatch(JSON.stringify(LOGIN_EMAIL_COPY), /[\u2013\u2014]/);
  for (const path of [
    '../src/admin/LoginEmailChange.jsx',
    '../src/admin/lib/login-email.js',
    '../worker/src/admin/login-email.js',
  ]) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /[\u2013\u2014]/, path);
    assert.doesNotMatch(source, /[^\x00-\x7f]/, path);
    assert.doesNotMatch(source, /\r/, path);
  }
});

test('API wrappers encode both status ids, forward abort options, and use the three POST paths', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, ...options });
    return Response.json({ ok: true });
  });
  const controller = new AbortController();
  assert.deepEqual(await getLoginEmailStatus('org&one', 'user+two', { signal: controller.signal }), { ok: true });
  assert.equal(calls[0].url, '/admin-api/login-email/status?orgId=org%26one&userId=user%2Btwo');
  assert.equal(calls[0].signal, controller.signal);
  assert.equal(calls[0].method, 'GET');
  const input = { orgId: 'org', userId: 'user', by: 'Clay', apply: true };
  for (const [path, call] of [
    ['start', startLoginEmailChange],
    ['cancel', cancelLoginEmailChange],
    ['send-reset', sendLoginEmailReset],
  ]) {
    assert.deepEqual(await call(input), { ok: true });
    assert.equal(calls.at(-1).url, `/admin-api/login-email/${path}`);
    assert.equal(calls.at(-1).method, 'POST');
    assert.deepEqual(JSON.parse(calls.at(-1).body), input);
    assert.equal(calls.at(-1).credentials, 'include');
  }
});

test('cloud reasons mapped by the Worker survive api.js for the specified UI message', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({
    ok: false, reasons: ['EMAIL_IN_USE'], reason: 'EMAIL_IN_USE',
  }, { status: 409 }));
  await assert.rejects(startLoginEmailChange({}), (error) => {
    assert.equal(error.status, 409);
    assert.equal(reasonText(error.reason), REASON_TEXT.EMAIL_IN_USE);
    return true;
  });
});
