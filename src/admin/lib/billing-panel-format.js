const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function ordinal(value) {
  const day = Number(value);
  if (!Number.isInteger(day)) return '';

  const lastTwo = Math.abs(day) % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${day}th`;

  const suffix = {
    1: 'st',
    2: 'nd',
    3: 'rd',
  }[Math.abs(day) % 10] || 'th';

  return `${day}${suffix}`;
}

export function billingDay(value) {
  const date = billingDate(value);
  return date ? date.getUTCDate() : null;
}

export function billingDayOrdinal(value) {
  const day = billingDay(value);
  return day === null ? '' : ordinal(day);
}

export function formatBillingDate(value, { includeYear = true } = {}) {
  const date = billingDate(value);
  if (!date) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(date);
}

export function formatBillingAmount(amountCents, currency = 'usd') {
  const cents = Number(amountCents);
  if (!Number.isFinite(cents)) return '—';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: String(currency || 'usd').toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${String(currency || 'usd').toUpperCase()}`;
  }
}

export function buildBillingConfirmCopy({
  mode,
  nextBillingDate,
  amountCents,
  unpaidAmountCents = amountCents,
  currency = 'usd',
}) {
  const date = formatBillingDate(nextBillingDate);
  const recurringDate = formatBillingDate(nextBillingDate, { includeYear: false });
  const charge = formatBillingAmount(amountCents, currency);
  const day = billingDayOrdinal(nextBillingDate);

  if (mode === 'schedulable') {
    return `Move the next charge to ${date}? · Nothing is charged until then · ${charge} on ${recurringDate}, then the ${day} of every month · They keep full access the whole time.`;
  }

  if (mode === 'past_due') {
    const unpaid = formatBillingAmount(unpaidAmountCents, currency);
    return `Forgive the unpaid ${unpaid} bill and move billing to ${date}? · The unpaid bill is canceled — they owe nothing today · ${charge} on ${recurringDate}, then the ${day} of every month · Posting turns back on right away.`;
  }

  return '';
}

export function buildBillingSuccessCopy({ mode, nextBillingDate }) {
  const date = formatBillingDate(nextBillingDate);
  const day = billingDayOrdinal(nextBillingDate);

  if (mode === 'schedulable') {
    return `Done. Next charge: ${date} — monthly on the ${day} from then on.`;
  }

  if (mode === 'past_due') {
    return `Done. Unpaid bill forgiven. Next charge: ${date} — monthly on the ${day}. Posting is back on.`;
  }

  return '';
}

function billingDate(value) {
  if (value === undefined || value === null || value === '') return null;

  if (typeof value === 'string') {
    const match = DATE_ONLY_PATTERN.exec(value.trim());
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (
        date.getUTCFullYear() !== year
        || date.getUTCMonth() !== month - 1
        || date.getUTCDate() !== day
      ) return null;
      return date;
    }
  }

  const numeric = typeof value === 'number' ? value : null;
  const date = new Date(numeric !== null && Math.abs(numeric) < 1e12 ? numeric * 1000 : value);
  return Number.isNaN(date.getTime()) ? null : date;
}
