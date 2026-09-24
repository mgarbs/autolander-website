import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildBillingLinkPayload,
  normalizeTeamSeats,
} from '../src/admin/lib/billing-link-form.js';

const canonicalCrm = {
  contactId: 'contact_123',
  opportunityId: 'opportunity_456',
  assignedSalesRepId: 'user_789',
  crmSnapshot: {
    email: 'buyer@example.com',
    phone: '+15555550123',
    firstName: 'Jamie',
    lastName: 'Buyer',
    businessName: 'Example Motors',
    ignored: 'not sent',
  },
};

function teamForm(overrides = {}) {
  return {
    planCode: 'PRO_TEAM',
    billingInterval: 'monthly',
    seatsStarter: '3',
    seatsGrowth: '0',
    seatsPro: '0',
    couponId: '',
    setupFee: false,
    notCrmLinked: false,
    ...overrides,
  };
}

test('Dealer Plan sends catalog codes, canonical GHL IDs, and exactly three default seats', () => {
  const result = buildBillingLinkPayload({
    form: teamForm(),
    selectedOrg: { orgId: 'org_123' },
    selectedCrm: canonicalCrm,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.payload, {
    planCode: 'PRO_TEAM',
    billingInterval: 'monthly',
    withSetupFee: false,
    orgId: 'org_123',
    seats: { seatsStarter: 3, seatsGrowth: 0, seatsPro: 0 },
    ghlContactId: 'contact_123',
    ghlOpportunityId: 'opportunity_456',
    assignedSalesRepId: 'user_789',
    crmSnapshot: {
      email: 'buyer@example.com',
      phone: '+15555550123',
      firstName: 'Jamie',
      lastName: 'Buyer',
      businessName: 'Example Motors',
    },
    notCrmLinked: false,
  });
  assert.equal('amount' in result.payload, false);
  assert.equal('amountCents' in result.payload, false);
  assert.equal('price' in result.payload, false);
});

test('Dealer Plan rejects fewer than three, fractional, negative, or empty seat counts', () => {
  assert.equal(normalizeTeamSeats(teamForm({ seatsStarter: '2' })).ok, false);
  assert.equal(normalizeTeamSeats(teamForm({ seatsStarter: '2.5' })).ok, false);
  assert.equal(normalizeTeamSeats(teamForm({ seatsStarter: '-3' })).ok, false);
  assert.equal(normalizeTeamSeats(teamForm({ seatsStarter: '' })).ok, false);
});

test('a CRM-linked link cannot be built from raw form IDs or an incomplete server selection', () => {
  const rawOnly = buildBillingLinkPayload({
    form: teamForm({ ghlContactId: 'typed-contact', ghlOpportunityId: 'typed-opportunity' }),
  });
  assert.equal(rawOnly.ok, false);

  const incomplete = buildBillingLinkPayload({
    form: teamForm(),
    selectedCrm: { contactId: 'contact_123' },
  });
  assert.equal(incomplete.ok, false);
});

test('an intentionally unlinked link is explicit and cannot smuggle custom pricing', () => {
  const result = buildBillingLinkPayload({
    form: teamForm({
      notCrmLinked: true,
      amountCents: 1,
      price: 0,
      customPrice: 'free',
    }),
  });

  assert.equal(result.ok, true);
  assert.equal(result.payload.notCrmLinked, true);
  assert.equal('ghlContactId' in result.payload, false);
  assert.equal('amountCents' in result.payload, false);
  assert.equal('price' in result.payload, false);
  assert.equal('customPrice' in result.payload, false);
});

test('non-team plans omit the seat payload', () => {
  const result = buildBillingLinkPayload({
    form: teamForm({ planCode: 'STARTER' }),
    selectedCrm: canonicalCrm,
  });
  assert.equal(result.ok, true);
  assert.equal('seats' in result.payload, false);
});

test('a removed e-mail suggestion sends accountAttach:"none" only for an unattached core link', () => {
  const cleared = buildBillingLinkPayload({
    form: teamForm({ planCode: 'STARTER' }),
    selectedCrm: canonicalCrm,
    accountAttach: 'none',
  });
  assert.equal(cleared.ok, true);
  assert.equal(cleared.payload.accountAttach, 'none');
  assert.equal('orgId' in cleared.payload, false);

  // An explicit account wins: the flag is omitted.
  const picked = buildBillingLinkPayload({
    form: teamForm({ planCode: 'STARTER' }),
    selectedOrg: { orgId: 'org_123' },
    selectedCrm: canonicalCrm,
    accountAttach: 'none',
  });
  assert.equal(picked.ok, true);
  assert.equal(picked.payload.orgId, 'org_123');
  assert.equal('accountAttach' in picked.payload, false);

  // A trial link never auto-attaches, so it never carries the flag.
  const trial = buildBillingLinkPayload({
    form: teamForm({ planCode: 'STARTER_TRIAL_3D' }),
    selectedCrm: canonicalCrm,
    accountAttach: 'none',
  });
  assert.equal(trial.ok, true);
  assert.equal('accountAttach' in trial.payload, false);

  // Anything but the literal 'none' is ignored.
  for (const accountAttach of ['auto', true, 'NONE', '', null]) {
    const result = buildBillingLinkPayload({ form: teamForm(), selectedCrm: canonicalCrm, accountAttach });
    assert.equal('accountAttach' in result.payload, false, String(accountAttach));
  }
});

test('without accountAttach every payload is byte-identical to before', () => {
  for (const args of [
    { form: teamForm(), selectedOrg: { orgId: 'org_123' }, selectedCrm: canonicalCrm },
    { form: teamForm({ planCode: 'PRO' }), selectedCrm: canonicalCrm },
    { form: teamForm({ planCode: 'GROWTH', notCrmLinked: true }) },
    { form: teamForm({ planCode: 'STARTER_TRIAL_3D' }), selectedCrm: canonicalCrm },
  ]) {
    assert.deepEqual(
      buildBillingLinkPayload({ ...args, accountAttach: undefined }),
      buildBillingLinkPayload(args),
    );
    assert.equal('accountAttach' in buildBillingLinkPayload(args).payload, false);
  }
});
