import assert from 'node:assert/strict';
import test from 'node:test';
import {
  billingDay,
  billingDayOrdinal,
  buildBillingConfirmCopy,
  ordinal,
} from '../src/admin/lib/billing-panel-format.js';

test('ordinal formats ordinary days and the 11th through 13th exceptions', () => {
  assert.equal(ordinal(1), '1st');
  assert.equal(ordinal(2), '2nd');
  assert.equal(ordinal(3), '3rd');
  assert.equal(ordinal(4), '4th');
  assert.equal(ordinal(11), '11th');
  assert.equal(ordinal(12), '12th');
  assert.equal(ordinal(13), '13th');
  assert.equal(ordinal(21), '21st');
  assert.equal(ordinal(22), '22nd');
  assert.equal(ordinal(23), '23rd');
  assert.equal(ordinal(31), '31st');
});

test('billing day helpers read date-only values as UTC calendar days', () => {
  assert.equal(billingDay('2026-08-15'), 15);
  assert.equal(billingDayOrdinal('2026-08-15'), '15th');
  assert.equal(billingDay('not-a-date'), null);
  assert.equal(billingDayOrdinal('not-a-date'), '');
});

test('schedulable confirmation copy explains the delayed charge and recurring day', () => {
  assert.equal(
    buildBillingConfirmCopy({
      mode: 'schedulable',
      nextBillingDate: '2026-09-12',
      amountCents: 7900,
      currency: 'usd',
    }),
    'Move the next charge to Sep 12, 2026? · Nothing is charged until then · $79.00 on Sep 12, then the 12th of every month · They keep full access the whole time.',
  );
});

test('past-due confirmation copy distinguishes the unpaid bill from the next charge', () => {
  assert.equal(
    buildBillingConfirmCopy({
      mode: 'past_due',
      nextBillingDate: '2026-08-15',
      amountCents: 7900,
      unpaidAmountCents: 8400,
      currency: 'usd',
    }),
    'Forgive the unpaid $84.00 bill and move billing to Aug 15, 2026? · The unpaid bill is canceled — they owe nothing today · $79.00 on Aug 15, then the 15th of every month · Posting turns back on right away.',
  );
});
