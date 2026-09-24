export const TEAM_MIN_SEATS = 3;
export const TEAM_SEAT_FIELDS = ['seatsStarter', 'seatsGrowth', 'seatsPro'];

// Starter 3-day card-required trial (design doc §3). STARTER_TRIAL_3D is a
// UI-only plan choice: the cloud never sees it — it becomes
// `planCode:'STARTER', billingInterval:'monthly', trialCode:'starter_3d_v1'`
// with no seats, setup fee or coupon. Defined here (dependency-free) so the
// node:test suite can import it without pulling the fetch wrapper.
export const TRIAL_PLAN_CHOICE = 'STARTER_TRIAL_3D';
export const TRIAL_CODE = 'starter_3d_v1';
export const TRIAL_DAYS = 3;
export const TRIAL_BASE_PLAN = 'STARTER';
export const TRIAL_INTERVAL = 'monthly';

export function isTrialPlanChoice(code) {
  return String(code || '').trim().toUpperCase() === TRIAL_PLAN_CHOICE;
}

const PLAN_CODES = new Set(['STARTER', 'GROWTH', 'PRO', 'PRO_TEAM']);
const BILLING_INTERVALS = new Set(['monthly', 'annual']);
const CRM_SNAPSHOT_FIELDS = ['email', 'phone', 'firstName', 'lastName', 'businessName', 'website'];

function text(value, maxLength = 500) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

function parseSeatCount(value) {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }
  const raw = text(value, 20);
  if (!/^\d+$/.test(raw)) return null;
  const amount = Number(raw);
  return Number.isSafeInteger(amount) ? amount : null;
}

export function normalizeTeamSeats(form = {}) {
  const seats = {};
  for (const field of TEAM_SEAT_FIELDS) {
    const count = parseSeatCount(form[field]);
    if (count === null) {
      return { ok: false, error: 'Seat counts must be whole numbers of zero or more.' };
    }
    seats[field] = count;
  }

  const total = TEAM_SEAT_FIELDS.reduce((sum, field) => sum + seats[field], 0);
  if (total < TEAM_MIN_SEATS) {
    return { ok: false, error: `Dealer Plan requires at least ${TEAM_MIN_SEATS} seats.` };
  }
  return { ok: true, seats, total };
}

export function teamSeatTotal(form = {}) {
  return TEAM_SEAT_FIELDS.reduce((sum, field) => {
    const count = parseSeatCount(form[field]);
    return sum + (count === null ? 0 : count);
  }, 0);
}

function normalizeSelectedCrm(selectedCrm) {
  if (!selectedCrm || typeof selectedCrm !== 'object') return null;
  const contactId = text(selectedCrm.contactId, 200);
  const opportunityId = text(selectedCrm.opportunityId, 200);
  if (!contactId || !opportunityId) return null;

  const rawSnapshot = selectedCrm.crmSnapshot && typeof selectedCrm.crmSnapshot === 'object'
    ? selectedCrm.crmSnapshot
    : {};
  const crmSnapshot = {};
  for (const field of CRM_SNAPSHOT_FIELDS) {
    const value = text(rawSnapshot[field]);
    if (value) crmSnapshot[field] = value;
  }

  return {
    contactId,
    opportunityId,
    assignedSalesRepId: text(selectedCrm.assignedSalesRepId, 200),
    crmSnapshot,
  };
}

// Build the allowlisted cloud payload from catalog codes and a server-resolved
// GHL selection. Deliberately accepts no dollar/price fields: the cloud billing
// catalog remains the only authority for what Stripe charges.
//
// `accountAttach: 'none'` is passed only when the rep removed the e-mail
// auto-match suggestion; it tells the cloud not to auto-attach this link by the
// CRM e-mail (at create or at first open). An explicit account always wins, and
// a trial link never auto-attaches, so the flag is omitted for both.
export function buildBillingLinkPayload({ form = {}, selectedOrg, selectedCrm, accountAttach } = {}) {
  const planChoice = text(form.planCode, 40).toUpperCase();
  const isTrial = isTrialPlanChoice(planChoice);
  const planCode = isTrial ? TRIAL_BASE_PLAN : planChoice;
  if (!PLAN_CODES.has(planCode)) return { ok: false, error: 'Choose a supported plan.' };

  // A trial is monthly by catalog definition — the interval control is hidden
  // for it in the UI, so whatever the form still holds is ignored here.
  const billingInterval = isTrial ? TRIAL_INTERVAL : text(form.billingInterval, 20).toLowerCase();
  if (!BILLING_INTERVALS.has(billingInterval)) {
    return { ok: false, error: 'Choose monthly or annual billing.' };
  }

  const crm = normalizeSelectedCrm(selectedCrm);
  if (!crm && form.notCrmLinked !== true) {
    return {
      ok: false,
      error: 'Select the customer opportunity from GoHighLevel, or explicitly confirm this link is not CRM-linked.',
    };
  }

  const orgId = text(selectedOrg?.orgId, 200);
  if (isTrial && !orgId && !crm?.crmSnapshot?.email) {
    return {
      ok: false,
      error: 'A trial link needs the customer email from the GoHighLevel opportunity, or an attached AutoLander account, so eligibility can be checked.',
    };
  }

  const payload = {
    planCode,
    billingInterval,
    withSetupFee: isTrial ? false : form.setupFee === true,
    ...(orgId ? { orgId } : {}),
  };

  if (!orgId && !isTrial && accountAttach === 'none') payload.accountAttach = 'none';

  if (isTrial) payload.trialCode = TRIAL_CODE;

  if (planCode === 'PRO_TEAM') {
    const seatSelection = normalizeTeamSeats(form);
    if (!seatSelection.ok) return seatSelection;
    payload.seats = seatSelection.seats;
  }

  const couponId = isTrial ? '' : text(form.couponId, 200);
  if (couponId) payload.couponId = couponId;

  if (crm) {
    payload.ghlContactId = crm.contactId;
    payload.ghlOpportunityId = crm.opportunityId;
    if (crm.assignedSalesRepId) payload.assignedSalesRepId = crm.assignedSalesRepId;
    if (Object.keys(crm.crmSnapshot).length) payload.crmSnapshot = crm.crmSnapshot;
    payload.notCrmLinked = false;
  } else {
    payload.notCrmLinked = true;
  }

  return { ok: true, payload };
}
