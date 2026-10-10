// The Organization sameAs list lives twice: PROFILES in scripts/seo/shell.mjs feeds every generated
// page, and index.html carries a hand-written copy for the homepage's static JSON-LD. AI engines and
// knowledge graphs resolve the brand from these links, so the two copies must never drift apart.

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROFILES } from '../scripts/seo/shell.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('homepage sameAs matches PROFILES exactly', () => {
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  const lists = [...html.matchAll(/"sameAs"\s*:\s*\[([^\]]*)\]/g)]
    .map((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
  const org = lists.find((list) => list.includes('https://www.linkedin.com/company/autolander/'));
  assert.ok(org, 'index.html must carry the Organization sameAs list');
  assert.deepEqual(org, PROFILES);
});

test('every profile is an https URL and none repeats', () => {
  assert.equal(new Set(PROFILES).size, PROFILES.length);
  for (const url of PROFILES) assert.equal(new URL(url).protocol, 'https:', url);
});
