import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFeedFailureReport } from '../src/admin/lib/feed-failure-diagnostics.js';

test('builds a complete feed-failure report without altering machine diagnostics', () => {
  const diagnostics = {
    feedName: 'Primary inventory',
    pagesFetched: 4,
    chromeResolution: {
      outcome: 'missing',
      engine: 'system-chrome',
    },
    challengesThisRun: [
      { vendor: 'datadome', count: 2, surfaced: true, solved: false },
    ],
    nested: {
      authorization: 'contract-retained-value',
    },
  };
  const row = {
    id: 'feed-failure-1',
    feedId: 'feed-1',
    feedName: 'Primary inventory',
    dealerHost: 'dealer.example',
    detectedPlatform: 'dealer-com',
    code: 'FEED_SYNC_CHALLENGE_BLOCKED',
    stage: 'challenge',
    message: 'Challenge could not be solved.',
    recoverable: true,
    occurrenceCount: 3,
    firstSeenAt: '2026-07-29T12:00:00.000Z',
    lastSeenAt: '2026-07-30T12:00:00.000Z',
    appVersion: '4.0.0',
    platform: 'win32',
    diagnostics,
  };

  const report = buildFeedFailureReport({
    feedFailures: [row],
    account: { id: 'org-42', name: 'Example Motors' },
    windowDays: 7,
    total: 4,
    loaded: 1,
    summary: {
      total: 4,
      windowDays: 7,
      byCode: {
        FEED_SYNC_CHALLENGE_BLOCKED: 4,
      },
    },
    truncated: true,
    generatedAt: '2026-07-30T13:00:00.000Z',
  });

  assert.equal(report.schemaVersion, 'autolander.feed-failure-diagnostics.v1');
  assert.equal(report.generatedAt, '2026-07-30T13:00:00.000Z');
  assert.deepEqual(report.window, {
    days: 7,
    total: 4,
    loaded: 1,
    included: 1,
    truncated: true,
  });
  assert.deepEqual(report.summary, {
    total: 4,
    windowDays: 7,
    byCode: {
      FEED_SYNC_CHALLENGE_BLOCKED: 4,
    },
  });
  assert.equal(report.feedFailures[0], row);
  assert.equal(report.feedFailures[0].diagnostics, diagnostics);
  assert.equal(
    report.feedFailures[0].diagnostics.nested.authorization,
    'contract-retained-value',
  );
});

test('derives a stable code summary when the endpoint summary is absent', () => {
  const report = buildFeedFailureReport({
    feedFailures: [
      { id: 'failure-1', code: 'FEED_SYNC_TIMEOUT', diagnostics: null },
      { id: 'failure-2', code: 'FEED_SYNC_TIMEOUT', diagnostics: {} },
      { id: 'failure-3', diagnostics: { phase: 'nav' } },
    ],
    available: false,
    generatedAt: '2026-07-30T13:00:00.000Z',
  });

  assert.equal(report.available, false);
  assert.deepEqual(report.summary.byCode, {
    FEED_SYNC_TIMEOUT: 2,
    unknown_error: 1,
  });
  assert.equal(report.window.total, 3);
  assert.equal(report.window.loaded, 3);
  assert.equal(report.window.truncated, false);
});
