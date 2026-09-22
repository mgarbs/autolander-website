const ONE_TIME_INTERVALS = new Set(['one_time', 'one-time', 'payment']);
const ANNUAL_INTERVALS = new Set(['annual', 'year', 'yearly']);

export function parseCents(value) {
  if (value === undefined || value === null || typeof value === 'boolean') return null;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && value.trim() === '') return null;

  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0) return null;
  return amount;
}

function firstCents(...values) {
  for (const value of values) {
    const amount = parseCents(value);
    if (amount !== null) return amount;
  }
  return null;
}

export function isOneTimeInterval(interval) {
  return ONE_TIME_INTERVALS.has(String(interval || '').trim().toLowerCase());
}

export function isAnnualInterval(interval) {
  return ANNUAL_INTERVALS.has(String(interval || '').trim().toLowerCase());
}

function isoOrNull(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// `GET /api/pay/:token` carries `trial: { code, days, priceCents, endsAt?,
// timezoneHint? } | null` (design doc §3 cross-lane contract). `endsAt` and
// `timezoneHint` only appear once the Stripe checkout completed, so both are
// nullable here and the success view polls until `endsAt` arrives.
export function normalizeTrial(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const code = typeof raw.code === 'string' ? raw.code.trim() : '';
  if (!code) return null;

  const days = Number(raw.days);
  return {
    code,
    days: Number.isSafeInteger(days) && days > 0 ? days : null,
    priceCents: parseCents(raw.priceCents),
    endsAt: isoOrNull(raw.endsAt),
    timezoneHint: typeof raw.timezoneHint === 'string' && raw.timezoneHint.trim() ? raw.timezoneHint.trim() : null,
  };
}

// The cloud's durable pay-link contract separates subscription and one-time
// totals. `cents`/`amountCents` are retained only as backwards-compatible
// fallbacks for links created before that contract shipped.
export function normalizeSummary(payload) {
  const amount = payload?.amountSummary && typeof payload.amountSummary === 'object'
    ? payload.amountSummary
    : {};
  const interval = payload?.interval || payload?.billingInterval || 'monthly';
  const contractAmount = isOneTimeInterval(interval)
    ? amount.oneTimeCents
    : amount.recurringCents;

  return {
    planName: payload?.planName || payload?.plan?.name || payload?.planCode || 'AutoLander plan',
    amountCents: firstCents(contractAmount, amount.cents, payload?.amountCents),
    currency: amount.currency || payload?.currency || 'usd',
    interval,
    businessName: payload?.businessName || payload?.crmSnapshot?.businessName || '',
    status: payload?.status || 'created',
    livemode: Boolean(payload?.livemode),
    trial: normalizeTrial(payload?.trial),
  };
}

export function formatMoney(cents, currency = 'usd') {
  const numeric = Number(cents);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  const hasFractionalDollars = Math.round(numeric) % 100 !== 0;
  return (numeric / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: String(currency || 'usd').toUpperCase(),
    minimumFractionDigits: hasFractionalDollars ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function amountPresentation(summary) {
  if (!summary || summary.amountCents === null || summary.amountCents === undefined) return null;
  const billed = formatMoney(summary.amountCents, summary.currency);
  if (!billed) return null;

  if (isAnnualInterval(summary.interval)) {
    return {
      // The cloud catalog intentionally exposes annual Stripe prices as their
      // monthly equivalent (for example 8,700 cents for $87/month, billed
      // $1,044 yearly). Keep that contract here and derive only the yearly total.
      amount: billed,
      suffix: '/month',
      detail: `billed ${formatMoney(summary.amountCents * 12, summary.currency)} yearly`,
    };
  }

  if (isOneTimeInterval(summary.interval)) {
    return { amount: billed, suffix: ' one-time', detail: '' };
  }

  return { amount: billed, suffix: '/month', detail: '' };
}

const DEFAULT_TRIAL_DAYS = 3;
const DEFAULT_TRIAL_PRICE_CENTS = 3900;

// Copy for a card-required trial link (design doc §3): "$0 today · 3-day free
// trial · then $39/month (plus any applicable tax) unless you cancel". The
// price comes from `trial.priceCents` (the catalog's expectedRecurringCents),
// falling back to the link's own recurring amount; the browser constant is
// the last resort only when both are missing.
export function trialPresentation(summary) {
  const trial = summary?.trial;
  if (!trial) return null;
  const days = trial.days || DEFAULT_TRIAL_DAYS;
  const priceCents = trial.priceCents ?? summary.amountCents ?? DEFAULT_TRIAL_PRICE_CENTS;
  const monthly = formatMoney(priceCents, summary.currency) || formatMoney(DEFAULT_TRIAL_PRICE_CENTS, summary.currency);
  const zero = formatMoney(0, summary.currency);
  const afterTrial = `then ${monthly}/month (plus any applicable tax) unless you cancel`;
  return {
    days,
    monthly,
    todayLabel: `${zero} today`,
    afterTrial,
    terms: `${zero} today · ${days}-day free trial · ${afterTrial}`,
    endsAt: trial.endsAt,
  };
}
