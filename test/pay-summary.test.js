import assert from 'node:assert/strict';
import test from 'node:test';
import {
  amountPresentation,
  normalizeSummary,
  parseCents,
} from '../src/pay/lib/summary.js';

test('subscriptions display recurringCents and ignore an accompanying one-time setup fee', () => {
  const summary = normalizeSummary({
    planName: 'Dealer Plan',
    interval: 'monthly',
    amountSummary: { recurringCents: 11700, oneTimeCents: 50000, currency: 'usd' },
  });

  assert.equal(summary.amountCents, 11700);
  assert.deepEqual(amountPresentation(summary), {
    amount: '$117',
    suffix: '/month',
    detail: '',
  });
});

test('one-time links display oneTimeCents', () => {
  const summary = normalizeSummary({
    planName: 'AI Studio Credits',
    interval: 'one_time',
    amountSummary: { recurringCents: null, oneTimeCents: 25000, currency: 'usd' },
  });

  assert.equal(summary.amountCents, 25000);
  assert.deepEqual(amountPresentation(summary), {
    amount: '$250',
    suffix: ' one-time',
    detail: '',
  });
});

test('legacy cents fields remain supported after the split amount contract', () => {
  assert.equal(normalizeSummary({ interval: 'monthly', amountSummary: { cents: '3900' } }).amountCents, 3900);
  assert.equal(normalizeSummary({ interval: 'monthly', amountCents: 7900 }).amountCents, 7900);
});

test('missing and empty values never coerce to a fake zero-dollar amount', () => {
  for (const value of [undefined, null, '', '   ', false, {}, [], -1, 1.5, Number.NaN]) {
    assert.equal(parseCents(value), null);
  }

  assert.equal(normalizeSummary({ interval: 'monthly', amountSummary: {} }).amountCents, null);
  assert.equal(normalizeSummary({ interval: 'monthly', amountSummary: { recurringCents: '', cents: '' } }).amountCents, null);
  assert.equal(amountPresentation(normalizeSummary({ interval: 'monthly', amountSummary: {} })), null);
});

test('a real zero-dollar catalog value is preserved', () => {
  const summary = normalizeSummary({ interval: 'monthly', amountSummary: { recurringCents: 0 } });
  assert.equal(summary.amountCents, 0);
  assert.deepEqual(amountPresentation(summary), { amount: '$0', suffix: '/month', detail: '' });
});

test('annual totals show a monthly equivalent and the exact yearly charge', () => {
  const summary = normalizeSummary({
    interval: 'annual',
    // Actual cloud contract: recurringCents is the monthly equivalent of the
    // annual Stripe price, not the full yearly total.
    amountSummary: { recurringCents: 8700, oneTimeCents: 50000, currency: 'usd' },
  });

  assert.deepEqual(amountPresentation(summary), {
    amount: '$87',
    suffix: '/month',
    detail: 'billed $1,044 yearly',
  });
});
