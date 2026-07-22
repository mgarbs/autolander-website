const DEFAULT_LIMIT = 50;

export function normalizeFailureResponse(payload, defaults = {}) {
  const body = object(payload);
  const rawRows = Array.isArray(payload)
    ? payload
    : firstArray(body.rows, body.failures, body.events, body.failures?.rows, body.events?.rows);
  const rows = rawRows
    .map((row, index) => normalizeFailure(row, index))
    .filter(Boolean);
  const total = finiteNumber(body.total ?? body.count, rows.length);
  const limit = positiveNumber(body.limit, positiveNumber(defaults.limit, DEFAULT_LIMIT));
  const offset = nonNegativeNumber(body.offset, nonNegativeNumber(defaults.offset, 0));

  return {
    rows,
    total,
    limit,
    offset,
    summary: normalizeFailureSummary(body.summary, rows, total, defaults.days),
  };
}

export function normalizeFailure(row, index = 0) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return null;

  const error = object(row.error);
  const diagnostics = diagnosticObject(
    row.diagnostics ?? row.context ?? row.metadata ?? row.meta ?? row.details,
  );
  const code = firstText(
    row.code,
    row.errorCode,
    error.code,
    row.reason,
    row.type,
    diagnostics.code,
  ) || 'unknown_error';
  const message = firstText(
    row.message,
    row.errorMessage,
    error.message,
    typeof row.error === 'string' ? row.error : '',
    row.detail,
    diagnostics.message,
  ) || humanizeFailureValue(code, 'Unknown failure');
  const fingerprint = firstText(
    row.fingerprint,
    row.signature,
    row.groupKey,
    row.errorHash,
    diagnostics.fingerprint,
  );

  return {
    id: firstText(row.id, row.eventId, row.failureId, row.requestId)
      || `${fingerprint || code}-${index}`,
    occurredAt: firstText(
      row.occurredAt,
      row.createdAt,
      row.timestamp,
      row.date,
      row.lastSeenAt,
    ),
    code,
    message,
    source: firstText(row.source, row.origin, row.provider, row.component, diagnostics.source),
    stage: firstText(row.stage, row.operation, row.action, row.step, diagnostics.stage),
    area: firstText(row.area, row.category, row.domain, diagnostics.area),
    recoverable: normalizeBoolean(row.recoverable ?? row.retryable ?? diagnostics.recoverable),
    appVersion: firstText(
      row.appVersion,
      row.version,
      row.clientVersion,
      diagnostics.appVersion,
    ),
    platform: firstText(row.platform, row.os, diagnostics.platform, diagnostics.os),
    fingerprint,
    vehicle: normalizeEntity(row.vehicle ?? row.listing, {
      id: row.vehicleId ?? row.listingId,
      label: row.vehicleName ?? row.vehicleTitle,
      vin: row.vin,
      stockNumber: row.stockNumber ?? row.stock,
    }),
    user: normalizeEntity(row.user, {
      id: row.userId,
      label: row.userName ?? row.username ?? row.userEmail,
      email: row.userEmail,
      username: row.username,
    }),
    diagnostics,
    recentFailures: normalizeRecentFailures(
      row.recentFailures ?? row.occurrences ?? row.recentCount ?? row.failureCount,
    ),
    legacy: Boolean(row.legacy),
    raw: row.raw && typeof row.raw === 'object' ? row.raw : row,
  };
}

export function buildLegacyFeedFailures(feeds) {
  if (!Array.isArray(feeds)) return [];

  return feeds
    .map((feed, index) => {
      if (!feed || typeof feed !== 'object') return null;
      const message = firstText(feed.lastSyncError, feed.syncError, feed.errorMessage);
      if (!message) return null;
      const feedId = firstText(feed.id, feed.feedId);
      const feedName = firstText(feed.name, feed.label) || `Feed ${index + 1}`;
      return normalizeFailure({
        id: `legacy-feed-${feedId || index}`,
        occurredAt: feed.lastSyncAt ?? feed.updatedAt,
        code: feed.lastSyncErrorCode ?? feed.errorCode ?? 'feed_sync_error',
        message,
        source: feed.source ?? feed.type ?? feedName,
        stage: 'feed_sync',
        area: 'inventory_feed',
        recoverable: feed.recoverable,
        appVersion: feed.appVersion,
        platform: feed.platform,
        fingerprint: feed.fingerprint,
        diagnostics: {
          feedId: feedId || null,
          feedName,
          healthState: feed.healthState ?? feed.health ?? null,
          lastSyncAt: feed.lastSyncAt ?? null,
        },
        legacy: true,
        raw: feed,
      }, index);
    })
    .filter(Boolean);
}

export function humanizeFailureValue(value, fallback = 'Unknown') {
  const text = firstText(value);
  if (!text) return fallback;
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function normalizeFailureSummary(value, rows, total, days) {
  const summary = object(value);
  const recoverableFallback = rows.filter((row) => row.recoverable === true).length;
  const nonRecoverableFallback = rows.filter((row) => row.recoverable === false).length;
  const unknownFallback = rows.length - recoverableFallback - nonRecoverableFallback;
  const fingerprints = new Set(rows.map(failureSignature).filter(Boolean));

  return {
    ...summary,
    total: finiteNumber(summary.total ?? summary.failureCount, total),
    recoverable: finiteNumber(
      summary.recoverable ?? summary.recoverableCount ?? summary.retryable,
      recoverableFallback,
    ),
    nonRecoverable: finiteNumber(
      summary.nonRecoverable
        ?? summary.nonRecoverableCount
        ?? summary.unrecoverable
        ?? summary.fatal,
      nonRecoverableFallback,
    ),
    unknown: finiteNumber(summary.unknown ?? summary.unknownCount, unknownFallback),
    uniqueFingerprints: finiteNumber(
      summary.uniqueFingerprints ?? summary.uniqueSignatures ?? summary.groups,
      fingerprints.size,
    ),
    windowDays: positiveNumber(summary.windowDays ?? summary.days, positiveNumber(days, 30)),
  };
}

function failureSignature(row) {
  return row.fingerprint || [row.code, row.stage, row.message].filter(Boolean).join('|');
}

function normalizeEntity(value, fallback) {
  const entity = object(value);
  const base = object(fallback);
  const id = firstText(entity.id, entity.vehicleId, entity.userId, base.id);
  const vin = firstText(entity.vin, base.vin);
  const stockNumber = firstText(entity.stockNumber, entity.stock, base.stockNumber);
  const email = firstText(entity.email, base.email);
  const username = firstText(entity.username, base.username);
  const label = firstText(
    typeof value === 'string' ? value : '',
    entity.label,
    entity.name,
    entity.title,
    entity.displayName,
    username,
    email,
    stockNumber,
    vin,
    id,
    base.label,
  );

  if (!id && !label && !vin && !stockNumber && !email && !username) return null;
  return { ...entity, id, label, vin, stockNumber, email, username };
}

function normalizeBoolean(value) {
  if (value === true || value === false) return value;
  if (value === 1 || value === 0) return Boolean(value);
  const text = firstText(value).toLowerCase();
  if (['true', 'yes', 'retryable', 'recoverable'].includes(text)) return true;
  if (['false', 'no', 'fatal', 'unrecoverable', 'non_recoverable'].includes(text)) return false;
  return null;
}

function normalizeRecentFailures(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') {
    return finiteNumber(value.count ?? value.total, null);
  }
  return finiteNumber(value, null);
}

function diagnosticObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  const text = firstText(value);
  return text ? { detail: text } : {};
}

function firstArray(...values) {
  return values.find(Array.isArray) || [];
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

function finiteNumber(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function positiveNumber(value, fallback) {
  const number = finiteNumber(value, fallback);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonNegativeNumber(value, fallback) {
  const number = finiteNumber(value, fallback);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
