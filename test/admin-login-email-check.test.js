import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  emailCheckWarnings,
  LOGIN_EMAIL_COPY,
  runStartWithEmailCheck,
  sendNeedsCheck,
} from '../src/admin/lib/login-email.js';

// Notion #201 (2026-11-21): check the address before anything is sent. The cloud dry-run
// of the support change answers emailCheck.warnings. Plan check: Send was enabled as soon
// as Check was, so Clay could send to a typo without ever seeing a warning. Now Send runs
// the dry-run first for any address not checked yet; a warning stops that Send, and a
// second Send for the same address goes through (a warning, never a hard block).

const WARNED = { ok: true, mode: 'dry-run', wouldSend: true, to: 'new@gmial.com',
  emailCheck: { warnings: [{ code: 'typo', message: 'Did you mean new@gmail.com?', suggestion: 'new@gmail.com' }] } };
const CLEAN = { ok: true, mode: 'dry-run', wouldSend: true, to: 'new@gmail.com', emailCheck: { warnings: [] } };
const SENT = { ok: true, mode: 'apply', pending: { id: 'p1' }, sent: { confirmation: true } };
const INPUT = { orgId: 'org', userId: 'user', by: 'Clay', expectCurrentEmail: 'old@example.test',
  verification: { method: 'phone_callback', phoneAttested: true }, note: '' };

function fakeCloud(answers) {
  const calls = [];
  const start = async (input) => {
    calls.push(input);
    if (input.apply === true) return SENT;
    return answers[input.newEmail] || CLEAN;
  };
  return { start, calls };
}

test('Send for an unchecked address runs the dry-run first; a warning stops it and nothing is sent', async () => {
  const cloud = fakeCloud({ 'new@gmial.com': WARNED });
  const outcome = await runStartWithEmailCheck({ action: 'send', checked: null, input: { ...INPUT, newEmail: ' New@Gmial.com ' }, start: cloud.start });
  assert.equal(outcome.stopped, true);
  assert.deepEqual(outcome.checked, { email: 'new@gmial.com', warnings: WARNED.emailCheck.warnings });
  assert.equal(cloud.calls.length, 1);
  assert.equal(Object.hasOwn(cloud.calls[0], 'apply'), false);
  assert.equal(cloud.calls[0].newEmail, 'new@gmial.com');
});

test('a second Send for the same address goes through (never a hard block)', async () => {
  const cloud = fakeCloud({ 'new@gmial.com': WARNED });
  const first = await runStartWithEmailCheck({ action: 'send', checked: null, input: { ...INPUT, newEmail: 'new@gmial.com' }, start: cloud.start });
  const second = await runStartWithEmailCheck({ action: 'send', checked: first.checked, input: { ...INPUT, newEmail: 'NEW@gmial.com' }, start: cloud.start });
  assert.equal(second.stopped, false);
  assert.deepEqual(second.result, SENT);
  assert.deepEqual(cloud.calls.map((call) => call.apply === true), [false, true]);
  assert.equal(cloud.calls[1].newEmail, 'new@gmial.com');
});

test('a clean address sends in one click: dry-run, then apply', async () => {
  const cloud = fakeCloud({});
  const outcome = await runStartWithEmailCheck({ action: 'send', checked: null, input: { ...INPUT, newEmail: 'new@gmail.com' }, start: cloud.start });
  assert.equal(outcome.stopped, false);
  assert.deepEqual(outcome.result, SENT);
  assert.deepEqual(cloud.calls.map((call) => call.apply === true), [false, true]);
});

test('Check stores the warnings for that address; a Send right after does not check again', async () => {
  const cloud = fakeCloud({ 'new@gmial.com': WARNED });
  const checked = await runStartWithEmailCheck({ action: 'check', checked: null, input: { ...INPUT, newEmail: 'new@gmial.com' }, start: cloud.start });
  assert.equal(checked.stopped, false);
  assert.deepEqual(checked.result, WARNED);
  assert.deepEqual(checked.checked.warnings, WARNED.emailCheck.warnings);
  const sent = await runStartWithEmailCheck({ action: 'send', checked: checked.checked, input: { ...INPUT, newEmail: 'new@gmial.com' }, start: cloud.start });
  assert.equal(sent.stopped, false);
  assert.deepEqual(cloud.calls.map((call) => call.apply === true), [false, true]);
});

test('editing the address after a check means Send checks the new address first', async () => {
  const cloud = fakeCloud({ 'new@yahoo.con': { ...WARNED, emailCheck: { warnings: [{ code: 'typo', message: 'Did you mean new@yahoo.com?', suggestion: 'new@yahoo.com' }] } } });
  const previous = { email: 'new@gmial.com', warnings: WARNED.emailCheck.warnings };
  assert.equal(sendNeedsCheck(previous, 'new@gmial.com'), false);
  assert.equal(sendNeedsCheck(previous, 'new@yahoo.con'), true);
  assert.equal(sendNeedsCheck(null, 'new@gmial.com'), true);
  const outcome = await runStartWithEmailCheck({ action: 'send', checked: previous, input: { ...INPUT, newEmail: 'new@yahoo.con' }, start: cloud.start });
  assert.equal(outcome.stopped, true);
  assert.equal(cloud.calls.length, 1);
});

test('a dry-run refusal is returned for the usual refusal copy, and nothing is applied', async () => {
  const refused = { ok: false, reasons: ['EMAIL_IN_USE'] };
  const start = async (input) => (input.apply ? SENT : refused);
  const outcome = await runStartWithEmailCheck({ action: 'send', checked: null, input: { ...INPUT, newEmail: 'new@gmail.com' }, start });
  assert.deepEqual(outcome, { stopped: false, checked: null, result: refused });
});

test('warnings keep only plain capped strings', () => {
  assert.deepEqual(emailCheckWarnings({}), []);
  assert.deepEqual(emailCheckWarnings({ emailCheck: { warnings: 'nope' } }), []);
  const warnings = emailCheckWarnings({ emailCheck: { warnings: [
    { code: 'typo', message: 'Did you mean a@gmail.com?', suggestion: 'a@gmail.com', html: '<b>x</b>' },
    { code: 'no_mail', message: 'x'.repeat(400) },
    { code: 'bad', message: 42 },
    null,
  ] } });
  assert.deepEqual(warnings[0], { code: 'typo', message: 'Did you mean a@gmail.com?', suggestion: 'a@gmail.com' });
  assert.equal(warnings[1].message.length, 300);
  assert.equal(warnings.length, 2);
});

test('the dialog uses the shared flow, shows the warnings and a Use button, and keeps the form on a stop', async () => {
  const source = await readFile(new URL('../src/admin/LoginEmailChange.jsx', import.meta.url), 'utf8');
  assert.match(source, /runStartWithEmailCheck\(\{/);
  assert.doesNotMatch(source, /startLoginEmailChange\(\{\s*\.\.\.base/);
  assert.match(source, /if \(outcome\.stopped\) \{\s*stopped = true;/);
  assert.match(source, /if \(action === 'send' && !stopped\) setCardLast4\(''\);/);
  assert.match(source, /\{COPY\.emailCheckHeading\}/);
  assert.match(source, /copy\('useSuggestion', \{ suggestion \}\)/);
  for (const key of ['emailCheckHeading', 'emailCheckStopped', 'useSuggestion']) {
    assert.equal(typeof LOGIN_EMAIL_COPY[key], 'string', key);
    assert.doesNotMatch(LOGIN_EMAIL_COPY[key], /[–—]/);
  }
});

test('the check before Send is a dry-run even if the caller passed apply in its input', async () => {
  const calls = [];
  const start = async (input) => { calls.push(input); return input.apply === true ? SENT : { ok: true, mode: 'dry-run' }; };
  await runStartWithEmailCheck({ action: 'send', checked: null, input: { userEmail: 'a@b.com', newEmail: 'x@gmial.com', apply: true }, start });
  assert.equal(calls[0].apply, undefined);
});
