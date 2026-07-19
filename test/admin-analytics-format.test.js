import assert from 'node:assert/strict';
import test from 'node:test';
import { feedHealthState, healthReasons } from '../src/admin/lib/analytics-format.js';

test('feed health preserves the per-account API state for display', () => {
  for (const state of ['ok', 'stale', 'failing', 'paused', 'unchanged', 'unknown']) {
    assert.equal(feedHealthState(state), state);
  }

  assert.equal(feedHealthState({ healthState: 'FAILING' }), 'failing');
  assert.equal(feedHealthState(null), 'unknown');
  assert.equal(feedHealthState('unexpected'), 'unknown');
});

test('health reasons use customer-facing labels for known server codes', () => {
  assert.deepEqual(
    healthReasons({ reasons: ['no_fb_activity_7d', 'trial_never_activated'] }),
    [
      'No FB activity in 7+ days (posts, renewals, or updates)',
      'Trial — never activated',
    ],
  );
});

test('health reasons preserve unknown server codes', () => {
  assert.deepEqual(
    healthReasons({ health: { reasons: ['future_reason_code', 'toString'] } }),
    ['future_reason_code', 'toString'],
  );
});
