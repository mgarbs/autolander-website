import assert from 'node:assert/strict';
import test from 'node:test';
import { compareSemver } from '../src/admin/lib/version.js';

test('numeric semver comparison handles older, equal, newer, and leading v versions', () => {
  assert.equal(compareSemver('3.9.10', '3.10.0'), -1);
  assert.equal(compareSemver('v3.10.0', '3.10.0'), 0);
  assert.equal(compareSemver('4.0.0', '3.10.0'), 1);
  assert.equal(compareSemver('3.10.0-beta.1', 'v3.10.0'), 0);
});

test('numeric semver comparison returns null when either version is unknown', () => {
  assert.equal(compareSemver('', '3.10.0'), null);
  assert.equal(compareSemver('3.10', '3.10.0'), null);
});
