import assert from 'node:assert/strict';
import test from 'node:test';
import {
  billingDay,
  billingDayOrdinal,
  buildBillingBridgeCopy,
  buildBillingConfirmCopy,
  buildBillingResumeCopy,
  buildBillingSuccessCopy,
  buildPastDueNoticeCopy,
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

test('past-due notice preserves the single-invoice disclosure', () => {
  assert.equal(
    buildPastDueNoticeCopy({
      unpaidInvoiceCount: 1,
      unpaidAmountCents: 8400,
      unpaidTotalCents: 8400,
      oldestInvoiceDate: '2026-07-01T12:00:00.000Z',
      currency: 'usd',
    }),
    "Their $84.00 charge on Jul 1 didn't go through — the bill is unpaid and Stripe is retrying their card. Posting is paused until this is fixed.",
  );
});

test('multi-invoice notice and confirmation disclose the count and summed amount', () => {
  assert.equal(
    buildPastDueNoticeCopy({
      unpaidInvoiceCount: 2,
      unpaidAmountCents: 7900,
      unpaidTotalCents: 15800,
      oldestInvoiceDate: '2026-07-01T12:00:00.000Z',
      currency: 'usd',
    }),
    'They have 2 unpaid bills totaling $158.00 — the oldest from Jul 1. Stripe is retrying their card. Posting is paused until this is fixed.',
  );

  assert.equal(
    buildBillingConfirmCopy({
      mode: 'past_due',
      nextBillingDate: '2026-08-15',
      amountCents: 7900,
      unpaidAmountCents: 7900,
      unpaidInvoiceCount: 2,
      unpaidTotalCents: 15800,
      currency: 'usd',
    }),
    'Forgive 2 unpaid bills totaling $158.00 and move billing to Aug 15, 2026? · The unpaid bills are canceled — they owe nothing today · $79.00 on Aug 15, then the 15th of every month · Posting turns back on right away.',
  );
});

test('resume helper explains the locked target date', () => {
  assert.equal(
    buildBillingResumeCopy('2026-08-15'),
    'Finishing a previously started move to Aug 15, 2026 — the unpaid bill still needs to be forgiven.',
  );
});

test('recurring copy adds the shorter-month clamp for days 29 through 31 only', () => {
  const cases = [
    { date: '2026-08-28', day: '28th', clamp: '' },
    { date: '2026-08-29', day: '29th', clamp: ' (or the last day of shorter months)' },
    { date: '2026-08-30', day: '30th', clamp: ' (or the last day of shorter months)' },
    { date: '2026-08-31', day: '31st', clamp: ' (or the last day of shorter months)' },
  ];

  for (const { date, day, clamp } of cases) {
    for (const mode of ['schedulable', 'past_due']) {
      const confirmation = buildBillingConfirmCopy({
        mode,
        nextBillingDate: date,
        amountCents: 7900,
        unpaidAmountCents: 7900,
        currency: 'usd',
      });
      assert.ok(confirmation.includes(`then the ${day} of every month${clamp} ·`));
      if (!clamp) {
        assert.equal(confirmation.includes('last day of shorter months'), false);
      }
    }

    const scheduledSuccess = buildBillingSuccessCopy({
      mode: 'schedulable',
      nextBillingDate: date,
    });
    assert.ok(scheduledSuccess.includes(`monthly on the ${day}${clamp} from then on.`));

    const pastDueSuccess = buildBillingSuccessCopy({
      mode: 'past_due',
      nextBillingDate: date,
    });
    assert.ok(pastDueSuccess.includes(`monthly on the ${day}${clamp}. Posting is back on.`));

    const bridge = buildBillingBridgeCopy({
      trialEnd: date,
      amountCents: 7900,
      currency: 'usd',
    });
    assert.ok(bridge.includes(`monthly on the ${day}${clamp}.`));

    if (!clamp) {
      assert.equal(scheduledSuccess.includes('last day of shorter months'), false);
      assert.equal(pastDueSuccess.includes('last day of shorter months'), false);
      assert.equal(bridge.includes('last day of shorter months'), false);
    }
  }
});
