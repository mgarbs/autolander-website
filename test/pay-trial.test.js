import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTrialCheckoutBody,
  formatTrialEnd,
  splitFullName,
  trialCodeFromSearch,
  trialErrorCode,
  trialErrorMessage,
  validateTrialForm,
} from '../src/pay/lib/trial.js';
import { normalizeSummary, normalizeTrial, trialPresentation } from '../src/pay/lib/summary.js';

test('/pay/?trial=starter3d maps to the starter_3d_v1 trial code and ignores utm_* on the same URL', () => {
  assert.equal(trialCodeFromSearch('?trial=starter3d'), 'starter_3d_v1');
  assert.equal(trialCodeFromSearch('?utm_source=x&trial=starter3d&fbclid=abc'), 'starter_3d_v1');
  assert.equal(trialCodeFromSearch('?trial=STARTER3D'), 'starter_3d_v1');
  assert.equal(trialCodeFromSearch('?trial=other'), '');
  assert.equal(trialCodeFromSearch('?state=success'), '');
  assert.equal(trialCodeFromSearch(''), '');
  assert.equal(trialCodeFromSearch(undefined), '');
});

test('your name splits into first/last on the first space', () => {
  assert.deepEqual(splitFullName('Jamie Buyer'), { firstName: 'Jamie', lastName: 'Buyer' });
  assert.deepEqual(splitFullName('  Mary   Ann Smith '), { firstName: 'Mary', lastName: 'Ann Smith' });
  assert.deepEqual(splitFullName('Cher'), { firstName: 'Cher', lastName: '' });
  assert.deepEqual(splitFullName(''), { firstName: '', lastName: '' });
});

test('the trial form validates the four CRM fields and builds the exact self-serve body', () => {
  const bad = validateTrialForm({ businessName: '', fullName: '', email: 'nope', phone: '12' });
  assert.equal(bad.ok, false);
  assert.deepEqual(Object.keys(bad.errors).sort(), ['businessName', 'email', 'fullName', 'phone']);

  const good = validateTrialForm({
    businessName: ' Example Motors ',
    fullName: 'Jamie Buyer',
    email: ' Buyer@Example.com ',
    phone: '(919) 280-0967',
  });
  assert.equal(good.ok, true);
  assert.deepEqual(good.crm, {
    businessName: 'Example Motors',
    firstName: 'Jamie',
    lastName: 'Buyer',
    email: 'buyer@example.com',
    phone: '9192800967',
  });

  const body = buildTrialCheckoutBody({ crm: good.crm, attribution: { utm_source: 'x', timezone: 'America/New_York' } });
  assert.deepEqual(body, {
    planCode: 'STARTER',
    interval: 'monthly',
    trialCode: 'starter_3d_v1',
    crm: good.crm,
    attribution: { utm_source: 'x', timezone: 'America/New_York' },
  });
});

test('eligibility refusals render the cloud message verbatim; throttles and unknowns get friendly fallbacks', () => {
  const refusal = { status: 409, reason: 'http_409', body: { error: 'TRIAL_ALREADY_USED', message: 'This offer is for new AutoLander accounts.' } };
  assert.equal(trialErrorCode(refusal), 'TRIAL_ALREADY_USED');
  assert.equal(trialErrorMessage(refusal), 'This offer is for new AutoLander accounts.');

  for (const code of ['ALREADY_CUSTOMER', 'EMAIL_AMBIGUOUS', 'TRIAL_CHECK_UNAVAILABLE']) {
    const err = { status: 409, body: { error: code } };
    assert.equal(trialErrorCode(err), code);
    assert.ok(trialErrorMessage(err).length > 20, `${code} has a fallback sentence`);
  }

  assert.equal(trialErrorCode({ status: 429, reason: 'rate_limited', body: { ok: false, reason: 'rate_limited' } }), 'rate_limited');
  assert.equal(trialErrorCode({ status: 0, reason: 'network_error' }), 'network_error');
  assert.equal(trialErrorCode({ status: 400, body: { error: 'invalid_email', message: 'Email is required.' } }), 'validation');
  assert.equal(trialErrorMessage({ status: 400, body: { error: 'invalid_email', message: 'Email is required.' } }), 'Email is required.');

  // An echoed machine token is never shown as prose.
  assert.match(trialErrorMessage({ status: 502, reason: 'http_502', body: { message: 'http_502' } }), /Something went wrong/);
  assert.match(trialErrorMessage({ status: 502, reason: 'http_502', body: { ok: false, reason: 'cloud_unreachable', message: 'fetch failed' } }), /fetch failed/);
});

test('GET /api/pay/:token trial block is normalized and presented as $0 today · 3-day free trial · then $39/month', () => {
  assert.equal(normalizeTrial(null), null);
  assert.equal(normalizeTrial({}), null);
  assert.equal(normalizeSummary({ interval: 'monthly', amountSummary: { recurringCents: 3900 } }).trial, null);

  const before = normalizeSummary({
    planName: 'Starter',
    interval: 'monthly',
    amountSummary: { recurringCents: 3900, oneTimeCents: 0, currency: 'usd' },
    trial: { code: 'starter_3d_v1', days: 3, priceCents: 3900 },
  });
  assert.deepEqual(before.trial, { code: 'starter_3d_v1', days: 3, priceCents: 3900, endsAt: null, timezoneHint: null });
  const shown = trialPresentation(before);
  assert.equal(shown.terms, '$0 today · 3-day free trial · then $39/month (plus any applicable tax) unless you cancel');
  assert.equal(shown.todayLabel, '$0 today');
  assert.equal(shown.endsAt, null);

  const after = normalizeSummary({
    interval: 'monthly',
    amountSummary: { recurringCents: 3900 },
    trial: { code: 'starter_3d_v1', days: 3, priceCents: 3900, endsAt: '2026-09-25T18:15:00.000Z', timezoneHint: 'America/New_York' },
  });
  assert.equal(after.trial.endsAt, '2026-09-25T18:15:00.000Z');
  assert.equal(after.trial.timezoneHint, 'America/New_York');
  assert.equal(normalizeTrial({ code: 'starter_3d_v1', endsAt: 'not-a-date' }).endsAt, null);
});

test('the trial end renders in the viewer timezone with a zone abbreviation', () => {
  // 18:15Z is Friday in every zone from UTC-18 to UTC+5; use a noon-UTC instant so
  // the weekday assertion holds on any CI runner, and require a real zone token
  // (not the AM/PM marker) after the time.
  const label = formatTrialEnd('2026-09-25T12:00:00.000Z');
  assert.match(label, /Friday/);
  assert.match(label, /Sep/);
  assert.match(label, /\d{1,2}:\d{2}/);
  assert.match(label, /\d{1,2}:\d{2}\s*(?:[AP]M\s+)?(?:[A-Z]{2,5}|GMT[+-]?\d*|UTC)\b/);
  assert.equal(formatTrialEnd(null), '');
  assert.equal(formatTrialEnd('garbage'), '');
});
