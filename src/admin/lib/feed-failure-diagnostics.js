const DEFAULT_WINDOW_DAYS = 30;

/**
 * Build a stable, serializable support report for account-scoped feed failures.
 *
 * Feed failure rows are deliberately retained verbatim. In particular, the
 * diagnostics object is not normalized, filtered, redacted, or truncated: it
 * is the machine-specific evidence this report exists to carry.
 */
export function buildFeedFailureReport({
  feedFailures,
  account,
  windowDays,
  total,
  loaded,
  summary,
  available,
  truncated,
  generatedAt,
  source,
} = {}) {
  const rows = Array.isArray(feedFailures) ? feedFailures : [];
  const responseSummary = object(summary);
  const loadedCount = nonNegativeNumber(loaded, rows.length);
  const totalCount = nonNegativeNumber(
    total,
    nonNegativeNumber(responseSummary.total, loadedCount),
  );
  const days = positiveNumber(
    windowDays,
    positiveNumber(responseSummary.windowDays, DEFAULT_WINDOW_DAYS),
  );

  return {
    schemaVersion: 'autolander.feed-failure-diagnostics.v1',
    generatedAt: validIsoDate(generatedAt),
    source: firstText(source, 'feed_failure_events'),
    available: available !== false,
    account: account ?? null,
    window: {
      days,
      total: totalCount,
      loaded: loadedCount,
      included: rows.length,
      truncated: Boolean(truncated) || totalCount > loadedCount,
    },
    summary: {
      ...responseSummary,
      total: totalCount,
      windowDays: days,
      byCode: responseSummary.byCode ?? countByCode(rows),
    },
    feedFailures: rows,
  };
}

function countByCode(rows) {
  const counts = {};
  rows.forEach((row) => {
    const code = firstText(row?.code, 'unknown_error');
    counts[code] = (counts[code] || 0) + 1;
  });
  return counts;
}

function validIsoDate(value) {
  const parsed = value instanceof Date
    ? value.getTime()
    : value === undefined || value === null
      ? NaN
      : Date.parse(value);
  return new Date(Number.isFinite(parsed) ? parsed : Date.now()).toISOString();
}

function firstText(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (!['string', 'number', 'boolean'].includes(typeof value)) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}

function nonNegativeNumber(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function positiveNumber(value, fallback) {
  const number = nonNegativeNumber(value, fallback);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
