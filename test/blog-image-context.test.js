import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execPath } from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PREPARE = resolve(ROOT, 'scripts', 'blog', 'prepare-context.mjs');
const WRITER_RULES = resolve(ROOT, 'scripts', 'blog', 'writer-rules.md');

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const write = (path, contents = '') => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
};
const writeJson = (path, value) => write(path, json(value));
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

function scratchRoot(t) {
  const root = mkdtempSync(join(tmpdir(), 'autolander-blog-images-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function studioFiles(root, paths) {
  for (const path of paths) write(resolve(root, 'public', path.replace(/^\/+/, '')), 'webp');
}

function libraryEntry(stem, overrides = {}) {
  return {
    key: stem,
    before: `/studio/library/${stem}-before.webp`,
    after: `/studio/library/${stem}-after.webp`,
    before550: `/studio/library/${stem}-before-550.webp`,
    after550: `/studio/library/${stem}-after-550.webp`,
    year: 2021,
    make: 'Toyota',
    model: 'Tacoma',
    trim: 'TRD',
    color: 'Blue',
    bodyStyle: 'pickup_truck',
    vehicleClass: 'light_duty_truck',
    preset: 'golden_hour_lot',
    view: 'front_three_quarter',
    importedAt: '2026-09-27T00:00:00.000Z',
    ...overrides,
  };
}

function blogPost(slug, sections) {
  return {
    slug,
    silo: 'blog',
    anchor: 'Image usage fixture',
    crumb: 'Image usage fixture',
    primaryKeyword: 'image usage fixture',
    secondaryKeywords: [],
    title: 'Image usage fixture',
    description: 'Image usage fixture for the private writer context packet.',
    eyebrow: 'AutoLander blog',
    h1: 'Image usage fixture',
    tldr: 'This fixture reserves image pairs for a draft.',
    sections,
    faq: [],
    cta: { heading: 'Fixture CTA', sub: 'Fixture CTA text.' },
    alsoRelated: [],
    augmentKeys: [],
    alsoOnCompetitors: [],
    inboundFrom: [],
  };
}

function figure(before, after) {
  return {
    type: 'figure', before, after, beforeAlt: 'Before', afterAlt: 'After', caption: 'Fixture',
  };
}

function runPrepare(root, args) {
  return spawnSync(execPath, [PREPARE, '--root', root, '--out', '.blog-context', '--no-build', ...args], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('images.json contains only unused labeled pairs, library first, with no private fields', (t) => {
  const root = scratchRoot(t);
  const context = resolve(root, '.blog-context');
  const available = libraryEntry('toyota-tacoma-a1b2c3d4', {
    id: 'private-pair-id',
    orgId: 'private-org-id',
    vin: 'PRIVATEVIN123',
    beforeUrl: 'https://private.example/before.jpg',
    afterUrl: 'https://private.example/after.jpg',
  });
  const used = libraryEntry('honda-civic-e5f6a7b8', {
    year: 2022, make: 'Honda', model: 'Civic', trim: 'EX', color: 'Red',
  });
  writeJson(resolve(root, 'public', 'studio', 'library.json'), [available, used]);
  studioFiles(root, [
    available.before, available.after, available.before550, available.after550,
    used.before, used.after, used.before550, used.after550,
    '/studio/subaru-outback-before.webp',
    '/studio/subaru-outback-after.webp',
    '/studio/subaru-outback-before-550.webp',
    '/studio/subaru-outback-after-550.webp',
    '/studio/mazda-cx-5-before.webp',
    '/studio/mazda-cx-5-after.webp',
    '/studio/mazda-cx-5-before-550.webp',
    '/studio/mazda-cx-5-after-550.webp',
  ]);
  const slug = 'draft-that-reserves-pairs';
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${slug}.json`), blogPost(slug, [
    figure(used.before, used.after),
    figure('/studio/mazda-cx-5-before.webp', '/studio/mazda-cx-5-after.webp'),
  ]));
  writeJson(resolve(context, 'request.json'), {
    requestId: 'images-new', mode: 'new', prompt: 'Write a truck photo post.', keyword: '',
  });

  const result = runPrepare(root, ['--mode', 'new']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /context images\.json: 2 unused pairs/);
  assert.doesNotMatch(result.stdout, /context images\.json: \d+ bytes/);

  const images = readJson(resolve(context, 'images.json'));
  assert.equal(Array.isArray(images), true);
  assert.deepEqual(images.map((pair) => pair.before), [
    available.before,
    '/studio/subaru-outback-before.webp',
  ]);
  assert.deepEqual(Object.keys(images[0]), [
    'before', 'after', 'before550', 'after550', 'vehicle', 'color', 'bodyStyle',
    'vehicleClass', 'background', 'view', 'altHints',
  ]);
  assert.deepEqual(images[0], {
    before: available.before,
    after: available.after,
    before550: available.before550,
    after550: available.after550,
    vehicle: '2021 Toyota Tacoma TRD',
    color: 'Blue',
    bodyStyle: 'pickup truck',
    vehicleClass: 'light duty truck',
    background: 'golden hour lot',
    view: 'front three quarter',
    altHints: {
      before: 'Blue 2021 Toyota Tacoma TRD shown in a front three quarter view before AutoLander photo editing',
      after: 'The same blue 2021 Toyota Tacoma TRD shown in a front three quarter view after AutoLander photo editing in the golden hour lot',
    },
  });
  assert.equal(images[1].vehicle, 'Subaru Outback');
  assert.match(images[1].altHints.before, /Subaru Outback/);
  assert.match(images[1].altHints.after, /Subaru Outback/);
  const serialized = JSON.stringify(images);
  for (const privateValue of [
    'private-pair-id', 'private-org-id', 'PRIVATEVIN123', 'https://private.example',
  ]) assert.ok(!serialized.includes(privateValue), privateValue);

  writeJson(resolve(context, 'request.json'), {
    requestId: 'images-revise', mode: 'revise', slug, feedback: 'Keep the existing images.',
  });
  const revise = runPrepare(root, ['--mode', 'revise', '--slug', slug]);
  assert.equal(revise.status, 0, revise.stderr);
  const reviseImages = readJson(resolve(context, 'images.json'));
  assert.ok(reviseImages.some((pair) => pair.before === used.before));
  assert.ok(reviseImages.some((pair) => pair.before === '/studio/mazda-cx-5-before.webp'));
});

test('writer rules require topic-fit unique figures with grounded alt text and captions', () => {
  const rules = readFileSync(WRITER_RULES, 'utf8');
  assert.match(rules, /include one or two `figure` sections/i);
  assert.match(rules, /trucks for a truck post[\s\S]*SUVs for family buyers[\s\S]*RVs for RV posts/i);
  assert.match(rules, /alt text[\s\S]*vehicle[\s\S]*color[\s\S]*background/i);
  assert.match(rules, /caption[\s\S]*background, lighting, or clutter/i);
  assert.match(rules, /without claiming anything the images do not show/i);
  assert.match(rules, /Never use a pair that is absent from `images\.json`/i);
  assert.match(rules, /Each pair is used by exactly one page/i);
  assert.match(rules, /Never name or imply the dealership/i);
  assert.doesNotMatch(rules, /Images are optional/i);
});
