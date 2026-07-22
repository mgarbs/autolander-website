import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildLegacyFeedFailures,
  humanizeFailureValue,
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
      vehicle: { id: 'vehicle-1', vin: '1TESTVIN', stockNumber: 'A-100' },
      user: { id: 'user-1', displayName: 'Pat Dealer' },
      diagnostics: { httpStatus: 429, attempt: 2 },
      recentFailures: 4,
    }],
    total: 8,
    limit: 50,
    offset: 0,
    summary: { recoverableCount: 6, nonRecoverableCount: 2, uniqueSignatures: 3, days: 30 },
  });

  assert.equal(response.total, 8);
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
    },
  );
  assert.equal(response.rows[0].user.label, 'Pat Dealer');
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
      stock: 'B-200',
      username: 'dealer-user',
      context: { selector: '[aria-label="Post"]' },
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
  assert.equal(failure.user.label, 'dealer-user');
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
    },
  ]);

  assert.equal(failures.length, 1);
  assert.equal(failures[0].code, 'missing_vin_column');
  assert.equal(failures[0].message, 'CSV header VIN is missing');
  assert.equal(failures[0].stage, 'feed_sync');
  assert.equal(failures[0].legacy, true);
  assert.equal(failures[0].diagnostics.feedId, 'feed-bad');
  assert.equal(failures[0].raw.label, 'Cars feed');
});

test('humanizes machine values while preserving a useful empty fallback', () => {
  assert.equal(humanizeFailureValue('publish_listing'), 'Publish listing');
  assert.equal(humanizeFailureValue('facebookSessionExpired'), 'Facebook Session Expired');
  assert.equal(humanizeFailureValue('', 'Not reported'), 'Not reported');
});
