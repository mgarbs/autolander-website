import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as billingFormat from '../src/admin/lib/billing-panel-format.js';

const unknownAmounts = [undefined, null, '', 'not-a-number', Infinity, NaN];

test('amount availability distinguishes unknown amounts from a genuine zero', () => {
  for (const amountCents of unknownAmounts) {
    assert.equal(billingFormat.hasBillingAmount(amountCents), false);
  }
  for (const amountCents of [0, 15700, '15700']) {
    assert.equal(billingFormat.hasBillingAmount(amountCents), true);
  }
});

test('bridge copy keeps the known recurring total and a genuine zero', () => {
  for (const [amountCents, amount] of [[15700, '$157.00'], [0, '$0.00']]) {
    const copy = billingFormat.buildBillingBridgeCopy({
      trialEnd: '2026-10-20',
      amountCents,
      currency: 'usd',
    });
    assert.ok(copy.endsWith(`no charge until Oct 20, 2026, then ${amount} monthly on the 20th.`));
  }
});

test('bridge copy withholds every unknown amount even when tax or discounts are flagged', () => {
  for (const amountCents of unknownAmounts) {
    for (const amountBeforeTaxAndDiscounts of [false, true]) {
      const copy = billingFormat.buildBillingBridgeCopy({
        trialEnd: '2026-10-20',
        amountCents,
        currency: 'usd',
        amountBeforeTaxAndDiscounts,
      });
      assert.ok(copy.endsWith('no charge until Oct 20, 2026, then their regular charge resumes.'));
      assert.doesNotMatch(copy, /\$|\u2014|before tax/);
    }
  }
});

test('bridge copy qualifies the list price before tax and discounts and preserves the day clamp', () => {
  const copy = billingFormat.buildBillingBridgeCopy({
    trialEnd: '2026-10-31',
    amountCents: 15700,
    currency: 'usd',
    amountBeforeTaxAndDiscounts: true,
  });
  assert.ok(copy.endsWith('no charge until Oct 31, 2026, then $157.00 monthly on the 31st (or the last day of shorter months), before tax and discounts.'));
});

test('confirmation copy withholds unknown recurring amounts for all confirmation modes', () => {
  for (const amountCents of unknownAmounts) {
    const options = {
      nextBillingDate: '2026-10-20',
      amountCents,
      unpaidAmountCents: 8400,
      unpaidTotalCents: 16800,
      currency: 'usd',
      amountBeforeTaxAndDiscounts: true,
    };
    assert.equal(
      billingFormat.buildBillingConfirmCopy({ ...options, mode: 'schedulable' }),
      'Move the next charge to Oct 20, 2026? \u00b7 Nothing is charged until then \u00b7 Their regular charge on Oct 20, then the 20th of every month \u00b7 They keep full access the whole time.',
    );
    assert.equal(
      billingFormat.buildBillingConfirmCopy({ ...options, mode: 'past_due' }),
      'Forgive the unpaid $84.00 bill and move billing to Oct 20, 2026? \u00b7 The unpaid bill is canceled \u2014 they owe nothing today \u00b7 Their regular charge on Oct 20, then the 20th of every month \u00b7 Posting turns back on right away.',
    );
    assert.equal(
      billingFormat.buildBillingConfirmCopy({ ...options, mode: 'past_due', unpaidInvoiceCount: 2 }),
      'Forgive 2 unpaid bills totaling $168.00 and move billing to Oct 20, 2026? \u00b7 The unpaid bills are canceled \u2014 they owe nothing today \u00b7 Their regular charge on Oct 20, then the 20th of every month \u00b7 Posting turns back on right away.',
    );
  }
});

test('confirmation copy preserves a genuine zero and qualifies only the recurring list price', () => {
  assert.equal(
    billingFormat.buildBillingConfirmCopy({
      mode: 'past_due',
      nextBillingDate: '2026-10-20',
      amountCents: 0,
      unpaidAmountCents: 8400,
      currency: 'usd',
      amountBeforeTaxAndDiscounts: true,
    }),
    'Forgive the unpaid $84.00 bill and move billing to Oct 20, 2026? \u00b7 The unpaid bill is canceled \u2014 they owe nothing today \u00b7 $0.00 (before tax and discounts) on Oct 20, then the 20th of every month \u00b7 Posting turns back on right away.',
  );
});

test('status copy maps both bridge modes, ISO dates, currency, total and qualifier', () => {
  for (const mode of ['trial_bridge', 'scheduled_bridge']) {
    const status = {
      ok: true,
      mode,
      amountCents: 15700,
      currency: 'eur',
      amountBeforeTaxAndDiscounts: true,
      ...(mode === 'trial_bridge' ? {
        trialEndIso: '2026-10-20T15:10:03.000Z',
        trialEnd: Date.parse('2026-10-21T15:10:03Z') / 1000,
      } : {
        scheduledBillingIso: '2026-10-20T15:10:03.000Z',
        scheduledBillingAt: Date.parse('2026-10-21T15:10:03Z') / 1000,
      }),
    };
    const copy = billingFormat.buildBillingStatusCopy(status);
    assert.ok(copy.endsWith('no charge until Oct 20, 2026, then \u20ac157.00 monthly on the 20th, before tax and discounts.'));
  }
});

test('status copy uses bridge timestamp fallbacks and preserves unqualified zero', () => {
  for (const mode of ['trial_bridge', 'scheduled_bridge']) {
    const status = {
      ok: true,
      mode,
      amountCents: 0,
      currency: 'usd',
      [mode === 'trial_bridge' ? 'trialEnd' : 'scheduledBillingAt']: Date.parse('2026-10-20T15:10:03Z') / 1000,
    };
    assert.ok(billingFormat.buildBillingStatusCopy(status).endsWith('no charge until Oct 20, 2026, then $0.00 monthly on the 20th.'));
  }
});

test('status copy withholds null and missing bridge amounts', () => {
  for (const amount of [{ amountCents: null }, {}]) {
    const copy = billingFormat.buildBillingStatusCopy({
      ok: true,
      mode: 'trial_bridge',
      trialEndIso: '2026-10-20T15:10:03.000Z',
      currency: 'usd',
      amountBeforeTaxAndDiscounts: true,
      ...amount,
    });
    assert.ok(copy.endsWith('no charge until Oct 20, 2026, then their regular charge resumes.'));
  }
});

test('status copy maps the schedulable confirmation and qualifier', () => {
  assert.equal(
    billingFormat.buildBillingStatusCopy({
      ok: true,
      mode: 'schedulable',
      amountCents: 15700,
      currency: 'eur',
      amountBeforeTaxAndDiscounts: true,
    }, { nextBillingDate: '2026-10-20' }),
    'Move the next charge to Oct 20, 2026? \u00b7 Nothing is charged until then \u00b7 \u20ac157.00 (before tax and discounts) on Oct 20, then the 20th of every month \u00b7 They keep full access the whole time.',
  );
});

test('status copy preserves unflagged confirmation wording through the helper', () => {
  const cases = [
    ['schedulable', 1, 'Move the next charge to Oct 20, 2026? \u00b7 Nothing is charged until then \u00b7 $157.00 on Oct 20, then the 20th of every month \u00b7 They keep full access the whole time.'],
    ['past_due', 1, 'Forgive the unpaid $84.00 bill and move billing to Oct 20, 2026? \u00b7 The unpaid bill is canceled \u2014 they owe nothing today \u00b7 $157.00 on Oct 20, then the 20th of every month \u00b7 Posting turns back on right away.'],
    ['past_due', 2, 'Forgive 2 unpaid bills totaling $168.00 and move billing to Oct 20, 2026? \u00b7 The unpaid bills are canceled \u2014 they owe nothing today \u00b7 $157.00 on Oct 20, then the 20th of every month \u00b7 Posting turns back on right away.'],
  ];
  for (const qualifier of [{}, { amountBeforeTaxAndDiscounts: false }]) {
    for (const [mode, unpaidInvoiceCount, expected] of cases) {
      assert.equal(billingFormat.buildBillingStatusCopy({
        ok: true,
        mode,
        amountCents: 15700,
        currency: 'usd',
        ...qualifier,
      }, {
        nextBillingDate: '2026-10-20',
        unpaidAmountCents: 8400,
        unpaidInvoiceCount,
        unpaidTotalCents: 16800,
      }), expected);
    }
  }
});

test('status copy requires review without promising a charge for conditional billing', () => {
  for (const mode of ['trial_bridge', 'scheduled_bridge', 'schedulable', 'past_due']) {
    for (const amount of [{}, { amountCents: null }, { amountCents: 15700 }]) {
      assert.equal(billingFormat.buildBillingStatusCopy({
        ok: true,
        mode,
        trialEndIso: '2026-10-20T15:10:03.000Z',
        scheduledBillingIso: '2026-10-20T15:10:03.000Z',
        currency: 'usd',
        amountBeforeTaxAndDiscounts: true,
        requiresBillingReview: true,
        ...amount,
      }, {
        nextBillingDate: '2026-10-20',
        unpaidAmountCents: 8400,
        unpaidInvoiceCount: 2,
        unpaidTotalCents: 16800,
      }), "Review this subscription's billing settings in Stripe.");
    }
  }
});

test('unknown unpaid invoice amounts never become a zero bill in notice or confirmation copy', () => {
  for (const unpaidAmountCents of [undefined, null]) {
    assert.equal(billingFormat.buildPastDueNoticeCopy({
      unpaidAmountCents,
      oldestInvoiceDate: '2026-09-29',
    }), "Their charge on Sep 29 didn't go through \u2014 the bill is unpaid and Stripe is retrying their card. Posting is paused until this is fixed.");
    const copy = billingFormat.buildBillingStatusCopy({
      mode: 'past_due',
      amountCents: null,
      currency: 'usd',
    }, { nextBillingDate: '2026-10-20', unpaidAmountCents });
    assert.ok(copy.startsWith('Forgive the unpaid bill and move billing to Oct 20, 2026?'));
    assert.doesNotMatch(copy, /\$0\.00|\u2014 bill/);
  }
});

test('a genuine zero unpaid invoice amount remains visible', () => {
  assert.match(billingFormat.buildPastDueNoticeCopy({
    unpaidAmountCents: 0,
    oldestInvoiceDate: '2026-09-29',
  }), /Their \$0\.00 charge/);
  assert.match(billingFormat.buildBillingStatusCopy({
    mode: 'past_due', amountCents: null, currency: 'usd',
  }, { nextBillingDate: '2026-10-20', unpaidAmountCents: 0 }), /^Forgive the unpaid \$0\.00 bill/);
});

test('BillingPanel guards the unpaid invoice fallback against a withheld recurring amount', () => {
  const source = readFileSync(new URL('../src/admin/BillingPanel.jsx', import.meta.url), 'utf8')
    .replace(/\r\n/g, '\n');
  assert.match(source, /const unpaidAmountCents = unpaidInvoice\?\.totalCents\n\s+\?\? \(hasBillingAmount\(billingStatus.amountCents\) \? billingStatus.amountCents : undefined\);/);
});

test('status copy maps a single unpaid invoice separately from the recurring total', () => {
  assert.equal(
    billingFormat.buildBillingStatusCopy({
      ok: true,
      mode: 'past_due',
      amountCents: 15700,
      currency: 'usd',
      amountBeforeTaxAndDiscounts: true,
    }, {
      nextBillingDate: '2026-10-20',
      unpaidAmountCents: 8400,
      unpaidInvoiceCount: 1,
      unpaidTotalCents: 8400,
    }),
    'Forgive the unpaid $84.00 bill and move billing to Oct 20, 2026? \u00b7 The unpaid bill is canceled \u2014 they owe nothing today \u00b7 $157.00 (before tax and discounts) on Oct 20, then the 20th of every month \u00b7 Posting turns back on right away.',
  );
});

test('status copy maps multiple unpaid invoices separately from the recurring total', () => {
  assert.equal(
    billingFormat.buildBillingStatusCopy({
      ok: true,
      mode: 'past_due',
      amountCents: 15700,
      currency: 'usd',
      amountBeforeTaxAndDiscounts: true,
    }, {
      nextBillingDate: '2026-10-20',
      unpaidAmountCents: 8400,
      unpaidInvoiceCount: 2,
      unpaidTotalCents: 16800,
    }),
    'Forgive 2 unpaid bills totaling $168.00 and move billing to Oct 20, 2026? \u00b7 The unpaid bills are canceled \u2014 they owe nothing today \u00b7 $157.00 (before tax and discounts) on Oct 20, then the 20th of every month \u00b7 Posting turns back on right away.',
  );
});

test('status copy maps a withheld recurring confirmation amount without losing unpaid totals', () => {
  assert.equal(
    billingFormat.buildBillingStatusCopy({
      ok: true,
      mode: 'past_due',
      amountCents: null,
      currency: 'usd',
    }, {
      nextBillingDate: '2026-10-20',
      unpaidAmountCents: 8400,
      unpaidInvoiceCount: 2,
      unpaidTotalCents: 16800,
    }),
    'Forgive 2 unpaid bills totaling $168.00 and move billing to Oct 20, 2026? \u00b7 The unpaid bills are canceled \u2014 they owe nothing today \u00b7 Their regular charge on Oct 20, then the 20th of every month \u00b7 Posting turns back on right away.',
  );
});

test('BillingPanel routes both bridge and confirmation copy through the complete billing status', () => {
  const source = readFileSync(new URL('../src/admin/BillingPanel.jsx', import.meta.url), 'utf8')
    .replace(/\r\n/g, '\n');
  assert.equal([...source.matchAll(/buildBillingStatusCopy\(billingStatus(?=[,)])/g)].length, 2);
  assert.doesNotMatch(source, /buildBillingBridgeCopy|buildBillingConfirmCopy/);
  assert.match(source, /buildBillingStatusCopy\(billingStatus, \{\n\s+nextBillingDate,\n\s+unpaidAmountCents,\n\s+unpaidInvoiceCount,\n\s+unpaidTotalCents,\n\s+\}\)/);
});
