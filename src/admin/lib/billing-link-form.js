export const TEAM_MIN_SEATS = 3;
export const TEAM_SEAT_FIELDS = ['seatsStarter', 'seatsGrowth', 'seatsPro'];

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
export function buildBillingLinkPayload({ form = {}, selectedOrg, selectedCrm } = {}) {
  const planCode = text(form.planCode, 40).toUpperCase();
  if (!PLAN_CODES.has(planCode)) return { ok: false, error: 'Choose a supported plan.' };

  const billingInterval = text(form.billingInterval, 20).toLowerCase();
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

  const payload = {
    planCode,
    billingInterval,
    withSetupFee: form.setupFee === true,
    ...(text(selectedOrg?.orgId, 200) ? { orgId: text(selectedOrg.orgId, 200) } : {}),
  };

  if (planCode === 'PRO_TEAM') {
    const seatSelection = normalizeTeamSeats(form);
    if (!seatSelection.ok) return seatSelection;
    payload.seats = seatSelection.seats;
  }

  const couponId = text(form.couponId, 200);
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
