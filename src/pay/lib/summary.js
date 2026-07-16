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
