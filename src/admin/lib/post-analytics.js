const DEFAULT_LIMIT = 50;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function normalizePostResponse(payload, defaults = {}) {
  const body = object(payload);
  const rawRows = Array.isArray(payload)
    ? payload
    : firstArray(body.rows, body.posts, body.deliveries, body.events);
  const rows = rawRows.map((row, index) => normalizePost(row, index)).filter(Boolean);
  const total = finiteNumber(body.total ?? body.summary?.successfulDeliveryReceipts, rows.length);
  const limit = positiveNumber(body.limit, positiveNumber(defaults.limit, DEFAULT_LIMIT));
  const offset = nonNegativeNumber(body.offset, nonNegativeNumber(defaults.offset, 0));
  const timeline = normalizeTimeline(body.timeline);
  const receiptTimeline = normalizeTimeline(body.receiptTimeline);
  const usageTimeline = normalizeTimeline(body.usageTimeline);
  const explicitMeteredPosts = finiteNumber(body.summary?.meteredPosts, null);
  const meteredPosts = explicitMeteredPosts ?? meteredTimelineTotal(usageTimeline) ?? meteredTimelineTotal(timeline);

  return {
    rows,
    total,
    limit,
    offset,
    summary: {
      ...object(body.summary),
      successfulDeliveryReceipts: finiteNumber(
        body.summary?.successfulDeliveryReceipts,
        total,
      ),
      meteredPosts,
      windowDays: clampDays(body.summary?.windowDays ?? body.range?.days ?? defaults.days),
    },
    timeline,
    receiptTimeline,
    usageTimeline,
    basis: object(body.basis),
    coverage: object(body.coverage),
  };
}

export function normalizePost(row, index = 0) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return null;

  const account = normalizeEntity(row.account ?? row.organization ?? row.org, {
    id: row.orgId ?? row.accountId,
    label: row.orgName ?? row.accountName,
  });
  const user = normalizeEntity(row.user ?? row.actor, {
    id: row.userId,
    label: row.userName ?? row.username ?? row.userEmail,
    email: row.userEmail,
  });
  const vehicle = normalizeEntity(row.vehicle ?? row.item, {
    id: row.vehicleId,
    label: row.vehicleName ?? row.vehicleTitle,
    vin: row.vin,
    stockNumber: row.stockNumber ?? row.stock,
  });
  const listingInput = object(row.listing ?? row.post);
  const backgroundInput = object(row.background ?? row.bg ?? row.photoPipeline);
  const videoInput = object(row.video ?? row.videoJob);
  const photosInput = object(row.photos ?? row.photo);
  const descriptionAccuracy = firstText(
    listingInput.descriptionAccuracy,
    row.descriptionAccuracy,
  );
  const descriptionExact = listingInput.descriptionExact === true
    || (
      listingInput.historicalSnapshot === true
      && ['current_listing_state_id_match', 'current_listing_state_url_match', 'exact'].includes(descriptionAccuracy)
    );

  const background = {
    ...backgroundInput,
    requested: normalizeBoolean(backgroundInput.requested ?? row.bgRequested),
    delivered: normalizeBoolean(backgroundInput.delivered ?? row.bgDelivered),
    preset: firstText(backgroundInput.preset, row.bgPreset, row.photoPreset),
    quality: firstText(backgroundInput.quality, backgroundInput.bgQuality, row.bgQuality),
    inputCount: finiteOrNull(backgroundInput.inputCount ?? photosInput.inputCount),
    outputCount: finiteOrNull(backgroundInput.outputCount ?? photosInput.outputCount),
    replacedCount: finiteOrNull(backgroundInput.replacedCount),
    jobId: firstText(backgroundInput.jobId, backgroundInput.id, row.photoPipelineJobId),
    status: firstText(backgroundInput.status, backgroundInput.jobStatus),
  };
  const video = {
    ...videoInput,
    requested: normalizeBoolean(videoInput.requested ?? row.videoRequested),
    delivered: normalizeBoolean(videoInput.delivered ?? row.videoDelivered),
    jobId: firstText(videoInput.jobId, videoInput.id, row.videoJobId),
    status: firstText(videoInput.status, videoInput.jobStatus),
    provider: firstText(videoInput.provider),
    prompt: firstText(videoInput.prompt),
    durationSec: finiteOrNull(videoInput.durationSec ?? videoInput.duration),
    resolution: firstText(videoInput.resolution),
  };
  const photos = {
    ...photosInput,
    inputCount: finiteOrNull(
      photosInput.inputCount
      ?? background.inputCount
      ?? vehicle?.photoCount,
    ),
    outputCount: finiteOrNull(
      photosInput.outputCount
      ?? background.outputCount
      ?? vehicle?.processedPhotoCount,
    ),
    postedCount: finiteOrNull(
      photosInput.postedCount
      ?? background.outputCount
      ?? vehicle?.processedPhotoCount
      ?? vehicle?.photoCount,
    ),
  };

  return {
    ...row,
    id: firstText(row.id, row.deliveryId, row.eventId) || `post-receipt-${index}`,
    occurredAt: firstText(row.occurredAt, row.createdAt, row.timestamp, row.date),
    source: firstText(row.source, row.mode, row.origin),
    account,
    user,
    vehicle,
    listing: {
      ...listingInput,
      id: firstText(listingInput.id, listingInput.postId, row.postId),
      url: firstText(listingInput.url, listingInput.postUrl, row.postUrl),
      description: firstText(listingInput.description, row.description, row.postedDescription),
      descriptionSource: firstText(listingInput.descriptionSource, row.descriptionSource),
      descriptionAccuracy,
      descriptionExact,
      price: finiteOrNull(listingInput.price ?? listingInput.postedPrice ?? row.postedPrice ?? vehicle?.price),
      postedAt: firstText(listingInput.postedAt, row.postedAt, row.occurredAt, row.createdAt),
    },
    photos,
    background,
    video,
    raw: row.raw && typeof row.raw === 'object' ? row.raw : row,
  };
}

/** Build an exact UTC 24-hour, 7-day, or 30-day receipt timeline. */
export function buildPostTimeline(rows, options = {}) {
  const posts = Array.isArray(rows) ? rows : [];
  const days = clampDays(options.days);
  const nowMs = validDateMs(options.now, Date.now());
  const hourly = days === 1;
  const bucketMs = hourly ? HOUR_MS : DAY_MS;
  const bucketCount = hourly ? 24 : days;
  const endMs = hourly ? nowMs + 1 : startOfUtcDay(nowMs) + DAY_MS;
  const startMs = endMs - bucketCount * bucketMs;
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = startMs + index * bucketMs;
    const bucketEnd = bucketStart + bucketMs;
    const startAt = new Date(bucketStart).toISOString();
    const endAt = new Date(bucketEnd).toISOString();
    return {
      key: bucketKey(startAt, endAt),
      startAt,
      endAt,
      label: hourly ? utcHourLabel(bucketStart) : utcDayLabel(bucketStart),
      longLabel: hourly ? utcHourLongLabel(bucketStart) : utcDayLongLabel(bucketStart),
      total: 0,
    };
  });

  for (const post of posts) {
    const occurredAt = postDateMs(post);
    if (occurredAt === null || occurredAt < startMs || occurredAt >= endMs) continue;
    const index = Math.floor((occurredAt - startMs) / bucketMs);
    if (buckets[index]) buckets[index].total += 1;
  }

  return {
    buckets,
    days,
    bucketUnit: hourly ? 'hour' : 'day',
    basis: 'successful_post_delivery_receipts_including_new_posts_renewals_updates',
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
    total: buckets.reduce((sum, bucket) => sum + bucket.total, 0),
  };
}

export function filterPosts(rows, options = {}) {
  const posts = Array.isArray(rows) ? rows : [];
  const range = parseBucketKey(options.bucketKey);
  const accountId = firstText(options.accountId, options.orgId);
  const userId = firstText(options.userId);

  return posts.filter((post) => {
    if (range) {
      const occurredAt = postDateMs(post);
      if (occurredAt === null || occurredAt < range.start || occurredAt >= range.end) return false;
    }
    if (accountId && !entityMatches(post?.account, accountId)) return false;
    if (userId && !entityMatches(post?.user, userId)) return false;
    return true;
  });
}

export function postSourceLabel(value) {
  const source = firstText(value).toLowerCase();
  if (['autopilot', 'auto_pilot', 'auto-pilot'].includes(source)) return 'Auto-pilot';
  if (['manual', 'assisted'].includes(source)) return 'Assisted';
  return source ? source.replace(/[_-]+/g, ' ').replace(/^./, (character) => character.toUpperCase()) : 'Source unknown';
}

function normalizeTimeline(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.buckets)) return null;
  const buckets = value.buckets.map((entry, index) => {
    const startAt = firstText(entry.startAt, entry.start);
    const endAt = firstText(entry.endAt, entry.end);
    const startMs = validDateMs(startAt, null);
    const hourly = String(value.bucketUnit || '').toLowerCase() === 'hour';
    return {
      ...entry,
      key: bucketKey(startAt, endAt) || firstText(entry.key) || `bucket-${index}`,
      startAt,
      endAt,
      label: firstText(entry.label)
        ? formatServerBucketLabel(entry.label, startMs, hourly, false)
        : (hourly ? utcHourLabel(startMs) : utcDayLabel(startMs)),
      longLabel: firstText(entry.longLabel)
        ? (hourly ? ensureUtcSuffix(firstText(entry.longLabel)) : firstText(entry.longLabel))
        : (hourly ? utcHourLongLabel(startMs) : utcDayLongLabel(startMs)),
      total: finiteNumber(entry.total ?? entry.count, 0),
    };
  });
  return {
    ...value,
    buckets,
    total: finiteNumber(value.total, buckets.reduce((sum, bucket) => sum + bucket.total, 0)),
  };
}

function formatServerBucketLabel(label, timestamp, hourly, long) {
  if (timestamp === null) return String(label);
  if (long) return hourly ? utcHourLongLabel(timestamp) : utcDayLongLabel(timestamp);
  return hourly ? utcHourLabel(timestamp) : utcDayLabel(timestamp);
}

function meteredTimelineTotal(timeline) {
  if (!String(timeline?.basis || '').includes('post_usage_metered')) return null;
  return finiteNumber(timeline?.total, null);
}

function normalizeEntity(value, fallback = {}) {
  const entity = object(value);
  const id = firstText(entity.id, entity.orgId, entity.userId, entity.vehicleId, fallback.id);
  const email = firstText(entity.email, fallback.email);
  const username = firstText(entity.username, fallback.username);
  const label = firstText(
    typeof value === 'string' ? value : '',
    entity.label,
    entity.displayName,
    entity.name,
    username,
    email,
    entity.stockNumber,
    entity.vin,
    fallback.label,
    id,
  );
  if (!id && !label) return null;
  return { ...entity, id, label, email, username };
}

function entityMatches(entity, value) {
  if (!entity || !value) return false;
  return [entity.id, entity.orgId, entity.userId, entity.email, entity.username, entity.label]
    .some((candidate) => firstText(candidate) === value);
}

function postDateMs(post) {
  const value = firstText(post?.occurredAt, post?.createdAt, post?.timestamp, post?.date);
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function bucketKey(start, end) {
  return start && end ? `${start}|${end}` : '';
}

function parseBucketKey(value) {
  const [start, end] = firstText(value).split('|');
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  return Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs
    ? { start: startMs, end: endMs }
    : null;
}

function utcHourLabel(value) {
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(value));
  return `${label} UTC`;
}

function utcHourLongLabel(value) {
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(value));
  return `${label} UTC`;
}

function ensureUtcSuffix(value) {
  return /\bUTC\b/i.test(value) ? value : `${value} UTC`;
}

function utcDayLabel(value) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', month: 'short', day: 'numeric',
  }).format(new Date(value));
}

function utcDayLongLabel(value) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(value));
}

function startOfUtcDay(value) {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function clampDays(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 30;
  if (parsed <= 1) return 1;
  if (parsed <= 7) return 7;
  return 30;
}

function validDateMs(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const timestamp = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : fallback;
}

function normalizeBoolean(value) {
  if (value === true || value === false) return value;
  if (value === 1 || value === 0) return Boolean(value);
  const text = firstText(value).toLowerCase();
  if (['true', 'yes', '1'].includes(text)) return true;
  if (['false', 'no', '0'].includes(text)) return false;
  return null;
}

function firstArray(...values) {
  return values.find((value) => Array.isArray(value)) || [];
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function firstText(...values) {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim());
  return value === undefined ? '' : String(value).trim();
}

function finiteOrNull(value) {
  return finiteNumber(value, null);
}

function finiteNumber(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function positiveNumber(value, fallback) {
  const parsed = finiteNumber(value, fallback);
  return parsed > 0 ? parsed : fallback;
}

function nonNegativeNumber(value, fallback) {
  const parsed = finiteNumber(value, fallback);
  return parsed >= 0 ? parsed : fallback;
}
