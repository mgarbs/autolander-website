import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPostTimeline,
  filterPosts,
  normalizePostResponse,
  postSourceLabel,
} from '../src/admin/lib/post-analytics.js';

const NOW = '2026-07-26T18:35:00.000Z';

test('normalizes delivery receipts and every supported media parameter', () => {
  const response = normalizePostResponse({
    total: 1,
    summary: { meteredPosts: 3, windowDays: 7 },
    rows: [{
      id: 'delivery-1',
      occurredAt: '2026-07-26T17:10:00.000Z',
      source: 'autopilot',
      account: { id: 'org-1', name: 'North Motors' },
      user: { id: 'user-1', displayName: 'Sam', email: 'sam@example.test' },
      vehicle: { id: 'vehicle-1', label: '2025 Honda Civic', photoCount: 12, price: 26995 },
      listing: {
        postId: 'fb-42', postUrl: 'https://facebook.example/item/42',
        description: 'Clean Civic', descriptionAccuracy: 'current_listing_state_id_match',
        postedPrice: 25995,
      },
      background: {
        requested: true, delivered: true, preset: 'OUTDOOR_SUNSET', bgQuality: 'HIGH',
        inputCount: 12, outputCount: 10, replacedCount: 10, jobId: 'photo-1', jobStatus: 'COMPLETED',
      },
      video: {
        requested: true, delivered: true, jobId: 'video-1', jobStatus: 'DONE',
        provider: 'kling', prompt: 'Slow orbit', durationSec: 10, resolution: '1920x1080',
      },
    }],
  });

  assert.equal(response.total, 1);
  assert.equal(response.summary.meteredPosts, 3);
  const post = response.rows[0];
  assert.equal(post.account.label, 'North Motors');
  assert.equal(post.user.label, 'Sam');
  assert.equal(post.listing.id, 'fb-42');
  assert.equal(post.listing.url, 'https://facebook.example/item/42');
  assert.equal(post.listing.descriptionExact, false);
  assert.equal(post.listing.price, 25995);
  assert.deepEqual(post.photos, { inputCount: 12, outputCount: 10, postedCount: 10 });
  assert.equal(post.background.quality, 'HIGH');
  assert.equal(post.background.status, 'COMPLETED');
  assert.equal(post.video.status, 'DONE');
  assert.equal(post.video.prompt, 'Slow orbit');
  assert.equal(postSourceLabel(post.source), 'Auto-pilot');
});

test('builds an exact 24-hour UTC timeline and filters the selected hour', () => {
  const rows = [
    receipt('one', '2026-07-26T17:40:00.000Z', 'org-a', 'user-a'),
    receipt('two', '2026-07-26T17:50:00.000Z', 'org-a', 'user-b'),
    receipt('old', '2026-07-25T18:10:00.000Z', 'org-b', 'user-c'),
  ];
  const timeline = buildPostTimeline(rows, { days: 1, now: NOW });
  assert.equal(timeline.bucketUnit, 'hour');
  assert.equal(timeline.buckets.length, 24);
  assert.equal(timeline.total, 2);
  const bucket = timeline.buckets.find((entry) => entry.total === 2);
  assert.ok(bucket);
  assert.match(bucket.label, /UTC$/);
  assert.match(bucket.longLabel, /UTC$/);
  assert.deepEqual(filterPosts(rows, { bucketKey: bucket.key }).map((row) => row.id), ['one', 'two']);
});

test('never relabels delivery receipts as metered new posts', () => {
  const receiptOnly = normalizePostResponse({
    total: 4,
    rows: [receipt('one', '2026-07-26T17:10:00.000Z', 'org-a', 'user-a')],
  });
  assert.equal(receiptOnly.summary.meteredPosts, null);

  const meteredTimeline = normalizePostResponse({
    total: 4,
    usageTimeline: {
      basis: 'post_usage_metered_new_posts_utc_day',
      total: 2,
      bucketUnit: 'day',
      buckets: [],
    },
  });
  assert.equal(meteredTimeline.summary.meteredPosts, 2);
});

test('uses daily 7/30-day buckets and clamps unsupported windows to 30 days', () => {
  const rows = [
    receipt('today', '2026-07-26T10:00:00.000Z', 'org-a', 'user-a'),
    receipt('week', '2026-07-20T10:00:00.000Z', 'org-a', 'user-a'),
    receipt('month', '2026-06-28T10:00:00.000Z', 'org-b', 'user-b'),
    receipt('expired', '2026-06-20T10:00:00.000Z', 'org-b', 'user-b'),
  ];
  const seven = buildPostTimeline(rows, { days: 7, now: NOW });
  assert.equal(seven.buckets.length, 7);
  assert.equal(seven.total, 2);
  const capped = buildPostTimeline(rows, { days: 90, now: NOW });
  assert.equal(capped.days, 30);
  assert.equal(capped.buckets.length, 30);
  assert.equal(capped.total, 3);
});

test('filters receipts by customer and user without cross-matching', () => {
  const rows = [
    receipt('a1', '2026-07-26T10:00:00.000Z', 'org-a', 'user-a'),
    receipt('a2', '2026-07-26T11:00:00.000Z', 'org-a', 'user-b'),
    receipt('b1', '2026-07-26T12:00:00.000Z', 'org-b', 'user-a'),
  ];
  assert.deepEqual(filterPosts(rows, { accountId: 'org-a' }).map((row) => row.id), ['a1', 'a2']);
  assert.deepEqual(filterPosts(rows, { accountId: 'org-a', userId: 'user-a' }).map((row) => row.id), ['a1']);
});

function receipt(id, occurredAt, orgId, userId) {
  return {
    id,
    occurredAt,
    account: { id: orgId, label: orgId },
    user: { id: userId, label: userId },
  };
}
