import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildFailureReport,
  buildFailureTimeline,
  buildLegacyFeedFailures,
  filterFailures,
  humanizeFailureValue,
  normalizeFailure,
  normalizeFailureResponse,
} from '../src/admin/lib/failure-diagnostics.js';

test('normalizes the current failure diagnostics response and summary', () => {
  const response = normalizeFailureResponse({
    rows: [{
      id: 'failure-1',
      occurredAt: '2026-07-21T12:00:00.000Z',
      code: 'FB_RATE_LIMIT',
      message: 'Facebook temporarily limited posting.',
      source: 'marketplace',
      stage: 'publish_listing',
      area: 'posting',
      recoverable: true,
      appVersion: '3.64.1',
      platform: 'win32',
      fingerprint: 'fp-rate-limit',
      vehicle: {
        id: 'vehicle-1',
        vin: '1TESTVIN',
        stockNumber: 'A-100',
        url: 'https://inventory.example/vehicles/vehicle-1',
      },
      user: {
        id: 'user-1',
        displayName: 'Pat Dealer',
        mobilePhone: '+1 555 010 2000',
      },
      diagnostics: {
        httpStatus: 429,
        attempt: 2,
        feed: { sourceUrl: 'https://feeds.example/dealer.csv' },
      },
      recentFailures: 4,
      orgId: 'org-1',
      orgName: 'Pat Motors',
      slug: 'pat-motors',
      customerPhone: '+1 555 010 3000',
    }],
    total: 8,
    limit: 50,
    offset: 0,
    summary: { recoverableCount: 6, nonRecoverableCount: 2, uniqueSignatures: 3, days: 30 },
  });

  assert.equal(response.total, 8);
  assert.equal(response.available, true);
  assert.equal(response.summary.recoverable, 6);
  assert.equal(response.summary.nonRecoverable, 2);
  assert.equal(response.summary.uniqueFingerprints, 3);
  assert.equal(response.summary.windowDays, 30);
  assert.deepEqual(
    response.rows[0].vehicle,
    {
      id: 'vehicle-1',
      vin: '1TESTVIN',
      stockNumber: 'A-100',
      label: 'A-100',
      email: '',
      username: '',
      phone: '',
      url: 'https://inventory.example/vehicles/vehicle-1',
    },
  );
  assert.equal(response.rows[0].user.label, 'Pat Dealer');
  assert.equal(response.rows[0].user.phone, '+1 555 010 2000');
  assert.equal(response.rows[0].feedUrl, 'https://feeds.example/dealer.csv');
  assert.equal(response.rows[0].vehicleUrl, 'https://inventory.example/vehicles/vehicle-1');
  assert.deepEqual(response.rows[0].account, {
    id: 'org-1',
    orgId: 'org-1',
    label: 'Pat Motors',
    name: 'Pat Motors',
    slug: 'pat-motors',
    phone: '+1 555 010 3000',
  });
  assert.equal(response.rows[0].recoverable, true);
  assert.equal(response.rows[0].recentFailures, 4);
  assert.equal(response.rows[0].raw.diagnostics.httpStatus, 429);
});

test('accepts legacy payload and field aliases without hiding raw diagnostics', () => {
  const response = normalizeFailureResponse({
    failures: [{
      eventId: 'legacy-event',
      timestamp: '2026-07-20T08:30:00.000Z',
      error: { code: 'selector_missing', message: 'Post button was not found.' },
      component: 'facebook_automation',
      operation: 'clickPost',
      category: 'browser',
      retryable: 'false',
      clientVersion: '3.60.0',
      os: 'darwin',
      signature: 'selector-post-button',
      listingId: 'listing-9',
      listingUrl: 'https://dealer.example/inventory/listing-9',
      stock: 'B-200',
      username: 'dealer-user',
      userPhoneNumber: '555-010-9999',
      context: {
        selector: '[aria-label="Post"]',
        metadata: {
          inventoryFeed: { href: 'https://feeds.example/inventory.xml' },
        },
      },
      occurrences: [1, 2, 3],
    }],
  }, { days: 14, limit: 25 });

  const failure = response.rows[0];
  assert.equal(failure.id, 'legacy-event');
  assert.equal(failure.code, 'selector_missing');
  assert.equal(failure.message, 'Post button was not found.');
  assert.equal(failure.source, 'facebook_automation');
  assert.equal(failure.stage, 'clickPost');
  assert.equal(failure.area, 'browser');
  assert.equal(failure.recoverable, false);
  assert.equal(failure.vehicle.id, 'listing-9');
  assert.equal(failure.vehicle.stockNumber, 'B-200');
  assert.equal(failure.vehicle.url, 'https://dealer.example/inventory/listing-9');
  assert.equal(failure.vehicleUrl, 'https://dealer.example/inventory/listing-9');
  assert.equal(failure.user.label, 'dealer-user');
  assert.equal(failure.user.phone, '555-010-9999');
  assert.equal(failure.feedUrl, 'https://feeds.example/inventory.xml');
  assert.equal(failure.diagnostics.selector, '[aria-label="Post"]');
  assert.equal(failure.recentFailures, 3);
  assert.equal(response.summary.windowDays, 14);
  assert.equal(response.limit, 25);
});

test('builds a diagnostic fallback from legacy feed sync errors only', () => {
  const failures = buildLegacyFeedFailures([
    { id: 'feed-ok', name: 'Healthy feed', lastSyncAt: '2026-07-21T10:00:00Z' },
    {
      feedId: 'feed-bad',
      label: 'Cars feed',
      lastSyncError: 'CSV header VIN is missing',
      lastSyncErrorCode: 'missing_vin_column',
      lastSyncAt: '2026-07-21T09:00:00Z',
      healthState: 'failing',
      inventoryUrl: 'https://feeds.example/cars.csv',
    },
  ]);

  assert.equal(failures.length, 1);
  assert.equal(failures[0].code, 'missing_vin_column');
  assert.equal(failures[0].message, 'CSV header VIN is missing');
  assert.equal(failures[0].stage, 'feed_sync');
  assert.equal(failures[0].legacy, true);
  assert.equal(failures[0].feedUrl, 'https://feeds.example/cars.csv');
  assert.equal(failures[0].diagnostics.feedUrl, 'https://feeds.example/cars.csv');
  assert.equal(failures[0].diagnostics.feedId, 'feed-bad');
  assert.equal(failures[0].raw.label, 'Cars feed');
});

test('humanizes machine values while preserving a useful empty fallback', () => {
  assert.equal(humanizeFailureValue('publish_listing'), 'Publish listing');
  assert.equal(humanizeFailureValue('facebookSessionExpired'), 'Facebook Session Expired');
  assert.equal(humanizeFailureValue('', 'Not reported'), 'Not reported');
});

test('keeps a successful empty response available and honors an explicit unavailable response', () => {
  const empty = normalizeFailureResponse({ rows: [], total: 0 }, { days: 7 });
  assert.equal(empty.available, true);
  assert.equal(empty.total, 0);
  assert.deepEqual(empty.rows, []);
  assert.equal(empty.summary.windowDays, 7);

  const unavailable = normalizeFailureResponse(
    { rows: [], available: false },
    { days: 30 },
  );
  assert.equal(unavailable.available, false);
});

test('finds canonical URLs through safe nested feed and item aliases and preserves raw', () => {
  const raw = {
    eventId: 'nested-urls',
    errorCode: 'vehicle_fetch_failed',
    metadata: {
      source: {
        inventoryFeedUrl: 'https://feeds.example/source.json',
      },
      request: {
        listing: {
          link: 'https://inventory.example/listings/42',
        },
      },
      documentationUrl: 'https://docs.example/errors/vehicle-fetch',
    },
    user: {
      email: 'owner@example.com',
      phone_number: '(555) 010-4141',
    },
    organization: {
      organizationId: 'org-42',
      organizationName: 'Example Auto',
      mobile: '555-010-4242',
    },
  };

  const failure = normalizeFailure(raw);
  assert.equal(failure.feedUrl, 'https://feeds.example/source.json');
  assert.equal(failure.vehicleUrl, 'https://inventory.example/listings/42');
  assert.equal(failure.user.phone, '(555) 010-4141');
  assert.equal(failure.account.id, 'org-42');
  assert.equal(failure.account.phone, '555-010-4242');
  assert.equal(failure.raw, raw);
});

test('builds hourly timeline series, groups lower-ranked errors, and filters drilldowns', () => {
  const failures = [
    diagnostic('a-1', 'alpha_error', '2026-07-23T12:05:00Z', 'user-a'),
    diagnostic('a-2', 'alpha_error', '2026-07-23T12:15:00Z', 'user-b'),
    diagnostic('b-1', 'beta_error', '2026-07-23T11:05:00Z', 'user-a'),
    diagnostic('c-1', 'charlie_error', '2026-07-23T11:15:00Z', 'user-a'),
    diagnostic('old', 'alpha_error', '2026-07-22T12:00:00Z', 'user-a'),
  ];
  const timeline = buildFailureTimeline(failures, {
    days: 1,
    now: '2026-07-23T12:34:00Z',
    topTypes: 2,
  });

  assert.equal(timeline.bucketUnit, 'hour');
  assert.equal(timeline.buckets.length, 24);
  assert.equal(timeline.total, 4);
  assert.deepEqual(timeline.types.map((type) => type.label), [
    'Alpha error',
    'Beta error',
    'Other',
  ]);
  const noon = timeline.buckets.find((bucket) => bucket.start === '2026-07-23T12:00:00.000Z');
  const eleven = timeline.buckets.find((bucket) => bucket.start === '2026-07-23T11:00:00.000Z');
  assert.equal(noon.total, 2);
  assert.equal(noon.counts[timeline.types[0].key], 2);
  assert.equal(eleven.counts[timeline.types[1].key], 1);
  assert.equal(eleven.counts[timeline.types[2].key], 1);

  assert.deepEqual(
    filterFailures(failures, {
      bucketKey: eleven.key,
      type: timeline.types[1].key,
      userId: 'user-a',
    }).map((failure) => failure.id),
    ['b-1'],
  );
  assert.deepEqual(
    filterFailures(failures, {
      bucketKey: eleven.key,
      type: timeline.types[2].key,
    }).map((failure) => failure.id),
    ['c-1'],
  );
});

test('builds exactly one UTC daily bucket per requested day', () => {
  const timeline = buildFailureTimeline([
    diagnostic('today', 'feed_error', '2026-07-23T08:00:00Z', 'user-a'),
    diagnostic('week-start', 'feed_error', '2026-07-17T08:00:00Z', 'user-a'),
    diagnostic('outside', 'feed_error', '2026-07-16T23:59:59Z', 'user-a'),
  ], {
    days: 7,
    now: '2026-07-23T12:00:00Z',
  });

  assert.equal(timeline.bucketUnit, 'day');
  assert.equal(timeline.buckets.length, 7);
  assert.equal(timeline.buckets[0].start, '2026-07-17T00:00:00.000Z');
  assert.equal(timeline.buckets.at(-1).start, '2026-07-23T00:00:00.000Z');
  assert.equal(timeline.total, 2);
});

test('builds an AI-ready report with URLs and raw events while deeply redacting secrets', () => {
  const failure = normalizeFailure({
    id: 'secret-event',
    occurredAt: '2026-07-23T12:00:00Z',
    code: 'feed_download_failed',
    feedUrl: 'https://feeds.example/cars.csv?dealer=42&api_key=feed-secret',
    itemUrl: 'https://inventory.example/car/42?access_token=item-secret',
    user: {
      id: 'user-42',
      email: 'owner@example.com',
      phone: '555-010-0042',
    },
    diagnostics: {
      authorization: 'Bearer secret',
      headers: {
        Cookie: 'session=secret',
        'X-Trace-ID': 'safe-trace',
      },
      credentials: {
        password: 'secret-password',
        refresh_token: 'refresh-secret',
      },
      key: 'generic-key-secret',
      signature: 'signed-secret',
      session: 'session-secret',
      endpoint: 'https://feeds.example/private.csv?key=query-secret&signature=query-signature',
      note: 'password=inline-secret Bearer abcdefghijklmnop',
    },
  });
  const report = buildFailureReport({
    failures: [failure],
    account: { id: 'org-42', name: 'Example Auto', phone: '555-010-4242' },
    user: failure.user,
    windowDays: 30,
    total: 12,
    loaded: 1,
    legacyFeeds: [{
      url: 'https://feeds.example/legacy.csv?access_token=legacy-secret',
      apiKey: 'legacy-api-secret',
    }],
    generatedAt: '2026-07-23T13:00:00Z',
  });
  const serialized = JSON.stringify(report);

  assert.equal(report.schemaVersion, 'autolander.failure-diagnostics.v1');
  assert.equal(report.generatedAt, '2026-07-23T13:00:00.000Z');
  assert.deepEqual(report.window, {
    days: 30,
    total: 12,
    loaded: 1,
    included: 1,
    truncated: true,
  });
  assert.equal(report.user.phone, '555-010-0042');
  assert.match(report.urls.feeds[0], /^https:\/\/feeds\.example\/cars\.csv\?/);
  assert.match(report.urls.vehicles[0], /^https:\/\/inventory\.example\/car\/42\?/);
  assert.equal(report.failures[0].diagnostics.authorization, '[REDACTED]');
  assert.equal(report.failures[0].diagnostics.headers.Cookie, '[REDACTED]');
  assert.equal(report.failures[0].diagnostics.headers['X-Trace-ID'], 'safe-trace');
  assert.equal(report.failures[0].diagnostics.credentials, '[REDACTED]');
  assert.equal(report.feedSnapshot[0].apiKey, '[REDACTED]');
  assert.ok(report.failures[0].raw);
  assert.doesNotMatch(
    serialized,
    /feed-secret|item-secret|legacy-secret|secret-password|refresh-secret|generic-key-secret|signed-secret|session-secret|query-secret|query-signature|inline-secret|abcdefghijklmnop/,
  );
  assert.match(serialized, /feeds\.example/);
  assert.match(serialized, /inventory\.example/);
});

test('preserves an explicit source-cap warning in a scoped diagnostic report', () => {
  const failure = diagnostic(
    'capped-event',
    'post_failed',
    '2026-07-23T12:00:00Z',
    'user-a',
  );
  const report = buildFailureReport({
    failures: [failure],
    windowDays: 30,
    total: 1,
    loaded: 1,
    truncated: true,
  });

  assert.equal(report.window.truncated, true);
});

function diagnostic(id, code, occurredAt, userId) {
  return normalizeFailure({
    id,
    code,
    occurredAt,
    user: { id: userId, displayName: userId },
  });
}
