import assert from 'node:assert/strict';
import test from 'node:test';
import { TRIAL_PLAN_CHOICE, buildBillingLinkPayload } from '../src/admin/lib/billing-link-form.js';
import { PLAN_CHOICES, normalizeBillingLinkRow, normalizePlanMeta } from '../src/admin/lib/billing-links.js';

const canonicalCrm = {
  contactId: 'contact_123',
  opportunityId: 'opportunity_456',
  assignedSalesRepId: 'user_789',
  crmSnapshot: { email: 'buyer@example.com', firstName: 'Jamie', lastName: 'Buyer', businessName: 'Example Motors' },
};

function trialForm(overrides = {}) {
  return {
    planCode: TRIAL_PLAN_CHOICE,
    billingInterval: 'annual', // ignored for a trial — proves monthly is forced
    seatsStarter: '3',
    seatsGrowth: '0',
    seatsPro: '0',
    couponId: 'SHOULD_BE_DROPPED',
    setupFee: true,
    notCrmLinked: false,
    ...overrides,
  };
}

test('the Starter 3-day trial choice sends planCode STARTER + monthly + trialCode with no seats, coupon or setup fee', () => {
  const result = buildBillingLinkPayload({ form: trialForm(), selectedCrm: canonicalCrm });
  assert.equal(result.ok, true);
  assert.deepEqual(result.payload, {
    planCode: 'STARTER',
    billingInterval: 'monthly',
    withSetupFee: false,
    trialCode: 'starter_3d_v1',
    ghlContactId: 'contact_123',
    ghlOpportunityId: 'opportunity_456',
    assignedSalesRepId: 'user_789',
    crmSnapshot: { email: 'buyer@example.com', firstName: 'Jamie', lastName: 'Buyer', businessName: 'Example Motors' },
    notCrmLinked: false,
  });
  assert.equal('seats' in result.payload, false);
  assert.equal('couponId' in result.payload, false);
  assert.equal(result.payload.planCode !== TRIAL_PLAN_CHOICE, true);
});

test('a trial link needs an email (CRM) or an attached org so eligibility can be checked', () => {
  const unlinked = buildBillingLinkPayload({ form: trialForm({ notCrmLinked: true }) });
  assert.equal(unlinked.ok, false);
  assert.match(unlinked.error, /email|account/i);

  const withOrg = buildBillingLinkPayload({ form: trialForm({ notCrmLinked: true }), selectedOrg: { orgId: 'org_1' } });
  assert.equal(withOrg.ok, true);
  assert.equal(withOrg.payload.orgId, 'org_1');
  assert.equal(withOrg.payload.trialCode, 'starter_3d_v1');
  assert.equal(withOrg.payload.notCrmLinked, true);
});

test('existing plan choices are untouched by the trial option', () => {
  assert.deepEqual(PLAN_CHOICES.slice(0, 4), ['STARTER', 'GROWTH', 'PRO', 'PRO_TEAM']);
  const starter = buildBillingLinkPayload({
    form: trialForm({ planCode: 'STARTER', billingInterval: 'annual', couponId: 'KEEP', setupFee: true }),
    selectedCrm: canonicalCrm,
  });
  assert.equal(starter.ok, true);
  assert.equal(starter.payload.billingInterval, 'annual');
  assert.equal(starter.payload.couponId, 'KEEP');
  assert.equal(starter.payload.withSetupFee, true);
  assert.equal('trialCode' in starter.payload, false);
});

test('planMeta.trialCode is normalized on list rows for the TRIAL chip', () => {
  assert.deepEqual(normalizePlanMeta(undefined), { trialCode: '', trialDays: null });
  assert.deepEqual(normalizePlanMeta({ trialCode: 'starter_3d_v1', trialDays: 3 }), { trialCode: 'starter_3d_v1', trialDays: 3 });
  assert.deepEqual(normalizePlanMeta({ trialCode: 'starter_3d_v1' }), { trialCode: 'starter_3d_v1', trialDays: 3 });

  const row = normalizeBillingLinkRow({ id: 'cr_1', planCode: 'STARTER', planMeta: { trialCode: 'starter_3d_v1', trialDays: 3 } });
  assert.equal(row.planMeta.trialCode, 'starter_3d_v1');
  assert.equal(normalizeBillingLinkRow({ id: 'cr_2', planCode: 'PRO' }).planMeta.trialCode, '');
});
