import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { performance } from 'node:perf_hooks';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';

import {
  importStudioLibrary, pairIdentity, readPairFile, selectPairs,
} from '../scripts/studio-library-import.mjs';

const wideJpeg = await sharp({
  create: { width: 900, height: 600, channels: 3, background: '#4477aa' },
}).jpeg().toBuffer();
const narrowJpeg = await sharp({
  create: { width: 799, height: 600, channels: 3, background: '#aa7744' },
}).jpeg().toBuffer();

const quietLogger = { log() {}, warn() {} };
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const write = (path, contents) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
};
const writeJson = (path, value) => write(path, json(value));
const scratch = (t) => {
  const root = mkdtempSync(join(tmpdir(), 'autolander-studio-library-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
};
const pair = (id, overrides = {}) => ({
  id,
  year: 2021,
  make: `Make ${id}`,
  model: `Model ${id}`,
  trim: 'Touring',
  color: 'Blue',
  bodyStyle: 'Sedan',
  vehicleClass: 'Car',
  preset: 'Clean studio',
  sceneKey: 'clean-studio',
  view: 'front three-quarter',
  beforeUrl: `https://images.example/${id}-before.jpg`,
  afterUrl: `https://images.example/${id}-after.jpg`,
  capturedAt: '2026-09-20T12:00:00.000Z',
  ...overrides,
});
const response = (buffer, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  async arrayBuffer() {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  },
});
const seedLibrary = (root, entries = []) => {
  const path = resolve(root, 'public', 'studio', 'library.json');
  writeJson(path, entries);
  return path;
};
const sourceHashesPath = (root) => resolve(root, 'scripts', 'studio-library-source-hashes.json');
const seedSourceHashes = (root, records = []) => writeJson(sourceHashesPath(root), records);

test('pair inputs accept endpoint JSON, arrays, and one-line or multi-line JSONL', (t) => {
  const root = scratch(t);
  const endpoint = resolve(root, 'endpoint.json');
  const array = resolve(root, 'array.json');
  const oneLine = resolve(root, 'one.jsonl');
  const manyLines = resolve(root, 'many.jsonl');
  writeJson(endpoint, { pairs: [pair('endpoint')], nextCursor: 'next' });
  writeJson(array, [pair('array')]);
  write(oneLine, `${JSON.stringify(pair('one'))}\n`);
  write(manyLines, `${JSON.stringify(pair('first'))}\n${JSON.stringify(pair('second'))}\n`);

  assert.deepEqual(readPairFile(endpoint).map((value) => value.id), ['endpoint']);
  assert.deepEqual(readPairFile(array).map((value) => value.id), ['array']);
  assert.deepEqual(readPairFile(oneLine).map((value) => value.id), ['one']);
  assert.deepEqual(readPairFile(manyLines).map((value) => value.id), ['first', 'second']);
});

test('selection is deterministic, respects final variety ratios, and represents RVs and motorcycles', () => {
  const presets = ['Clean studio', 'Showroom', 'Mountain road', 'City dusk'];
  const bodyStyles = ['Sedan', 'SUV', 'Truck', 'Coupe'];
  const candidates = Array.from({ length: 18 }, (_, index) => pair(`variety-${index}`, {
    preset: presets[index % presets.length],
    bodyStyle: bodyStyles[(index + Math.floor(index / 4)) % bodyStyles.length],
  }));
  candidates.push(pair('rv-special', {
    make: 'Coachmen', model: 'Catalina', bodyStyle: 'Travel Trailer', vehicleClass: 'RV', preset: 'Campground',
  }));
  candidates.push(pair('motorcycle-special', {
    make: 'Honda', model: 'Rebel', bodyStyle: 'Motorcycle', vehicleClass: 'Motorcycle', preset: 'Open road',
  }));

  const selected = selectPairs(candidates, [], { target: 10, perModel: 2 });
  const repeated = selectPairs([...candidates].reverse(), [], { target: 10, perModel: 2 });
  assert.equal(selected.length, 10);
  assert.deepEqual(selected.map((value) => value.key), repeated.map((value) => value.key));
  assert.ok(selected.some((value) => /\brv\b/i.test(value.vehicleClass)));
  assert.ok(selected.some((value) => /motorcycle/i.test(`${value.bodyStyle} ${value.vehicleClass}`)));

  for (const field of ['preset', 'bodyStyle']) {
    const counts = new Map();
    for (const value of selected) counts.set(value[field], (counts.get(value[field]) || 0) + 1);
    assert.ok(Math.max(...counts.values()) / selected.length <= 0.35, field);
  }
});

test('scarcity variants fill a feasible target that hash-order greedy matching misses', () => {
  const ids = ['cross-a', 'cross-b', 'cross-c', 'cross-d']
    .sort((left, right) => pairIdentity({ id: left }).hash.localeCompare(pairIdentity({ id: right }).hash));
  const candidates = [
    pair(ids[0], { preset: 'A', bodyStyle: 'X' }),
    pair(ids[1], { preset: 'A', bodyStyle: 'Y' }),
    pair(ids[2], { preset: 'B', bodyStyle: 'X' }),
    pair(ids[3], { preset: 'C', bodyStyle: 'Z' }),
  ];
  const selected = selectPairs(candidates, [], { target: 3, perModel: 1 });
  assert.equal(selected.length, 3);
  assert.deepEqual(new Set(selected.map((value) => value.preset)), new Set(['A', 'B', 'C']));
  assert.deepEqual(new Set(selected.map((value) => value.bodyStyle)), new Set(['X', 'Y', 'Z']));
});

test('bounded scarcity selection fills a crossed-cap selection at the maximum target size', () => {
  const ids = Array.from({ length: 202 }, (_, index) => `max-cross-${index}`)
    .sort((left, right) => pairIdentity({ id: left }).hash.localeCompare(pairIdentity({ id: right }).hash));
  const candidates = [];
  const add = (start, count, preset, bodyStyle) => {
    for (let index = start; index < start + count; index += 1) {
      candidates.push(pair(ids[index], {
        make: `Unique ${index}`, model: 'Vehicle', preset, bodyStyle,
      }));
    }
  };
  add(0, 52, 'A', 'X');
  add(52, 52, 'A', 'Y');
  add(104, 52, 'B', 'X');
  add(156, 46, 'C', 'Z');

  const selected = selectPairs(candidates, [], { target: 150, perModel: 2 });
  assert.equal(selected.length, 150);
  for (const field of ['preset', 'bodyStyle']) {
    const counts = new Map();
    for (const value of selected) counts.set(value[field], (counts.get(value[field]) || 0) + 1);
    assert.ok(Math.max(...counts.values()) <= 52, field);
  }
});

test('bounded scarcity selection fills the 303-candidate grouped-model target quickly', () => {
  const candidates = [];
  let sequence = 0;
  const addGroups = (groups, preset, bodyStyle) => {
    for (let group = 0; group < groups; group += 1) {
      for (let copy = 0; copy < 3; copy += 1) {
        const id = `grouped-${sequence}`;
        sequence += 1;
        candidates.push(pair(id, {
          make: `${preset}${bodyStyle} Make ${group}`,
          model: 'Shared model',
          preset,
          bodyStyle,
        }));
      }
    }
  };
  addGroups(26, 'A', 'X');
  addGroups(26, 'A', 'Y');
  addGroups(26, 'B', 'X');
  addGroups(23, 'C', 'Z');

  const startedAt = performance.now();
  const selected = selectPairs(candidates, [], { target: 150, perModel: 2 });
  const elapsed = performance.now() - startedAt;
  assert.equal(selected.length, 150);
  assert.ok(elapsed < 5000, `selection took ${elapsed.toFixed(1)}ms`);
  const models = new Map();
  for (const value of selected) {
    const key = `${value.make.toLowerCase()} ${value.model.toLowerCase()}`;
    models.set(key, (models.get(key) || 0) + 1);
  }
  assert.ok(Math.max(...models.values()) <= 2);
});

test('balanced model urgency fills the 50-copy coupled target quickly', () => {
  const base = [
    ['M3', 'C', 'Y'],
    ['M2', 'D', 'Y'],
    ['M2', 'C', 'Y'],
    ['M3', 'D', 'X'],
    ['M2', 'B', 'X'],
    ['M3', 'B', 'X'],
    ['M2', 'B', 'X'],
    ['M0', 'B', 'W'],
  ];
  const candidates = [];
  let id = 0;
  for (let copy = 0; copy < 50; copy += 1) {
    for (const [modelGroup, preset, bodyStyle] of base) {
      const token = `rep-50-${id}`;
      id += 1;
      candidates.push(pair(token, {
        make: `${modelGroup}-${copy}`,
        model: 'X',
        preset,
        bodyStyle,
      }));
    }
  }

  const startedAt = performance.now();
  const selected = selectPairs(candidates, [], { target: 150, perModel: 1 });
  const elapsed = performance.now() - startedAt;
  assert.equal(selected.length, 150);
  assert.ok(elapsed < 5000, `selection took ${elapsed.toFixed(1)}ms`);
  for (const field of ['preset', 'bodyStyle']) {
    const counts = new Map();
    for (const value of selected) counts.set(value[field], (counts.get(value[field]) || 0) + 1);
    assert.ok(Math.max(...counts.values()) <= 52, field);
  }
});

test('bounded scarcity selection terminates quickly on a target-150 Hall deficit', () => {
  const candidates = [];
  let sequence = 0;
  const addGroups = (preset, bodyStyle) => {
    for (let group = 0; group < 26; group += 1) {
      for (let copy = 0; copy < 3; copy += 1) {
        const id = `hall-${sequence}`;
        sequence += 1;
        candidates.push(pair(id, {
          make: `${preset}${bodyStyle} Hall ${group}`,
          model: 'Shared model',
          preset,
          bodyStyle,
        }));
      }
    }
  };
  addGroups('A', 'X');
  addGroups('B', 'X');
  addGroups('C', 'Y');
  addGroups('C', 'Z');

  const startedAt = performance.now();
  const selected = selectPairs(candidates, [], { target: 150, perModel: 2 });
  const elapsed = performance.now() - startedAt;
  assert.ok(selected.length < 150);
  assert.ok(elapsed < 5000, `selection took ${elapsed.toFixed(1)}ms`);
});

test('marginal capacity guard skips impossible large two-category sizes quickly', () => {
  const candidates = Array.from({ length: 5000 }, (_, index) => pair(`two-category-${index}`, {
    make: `Unique ${index}`,
    model: 'Vehicle',
    preset: index % 2 ? 'A' : 'B',
    bodyStyle: index % 2 ? 'X' : 'Y',
  }));
  const startedAt = performance.now();
  const selected = selectPairs(candidates, [], { target: 5000, perModel: 1 });
  const elapsed = performance.now() - startedAt;
  assert.equal(selected.length, 2);
  assert.ok(elapsed < 5000, `selection took ${elapsed.toFixed(1)}ms`);
});

test('RV coverage outranks a larger selection when the target cannot include the RV', () => {
  const ids = ['rv-priority-a', 'rv-priority-b', 'rv-priority-c', 'rv-priority-d']
    .sort((left, right) => pairIdentity({ id: left }).hash.localeCompare(pairIdentity({ id: right }).hash));
  const candidates = [
    pair(ids[0], { preset: 'A', bodyStyle: 'X', vehicleClass: 'RV' }),
    pair(ids[1], { preset: 'A', bodyStyle: 'Y' }),
    pair(ids[2], { preset: 'B', bodyStyle: 'X' }),
    pair(ids[3], { preset: 'C', bodyStyle: 'Z' }),
  ];
  const selected = selectPairs(candidates, [], { target: 3, perModel: 1 });
  assert.equal(selected.length, 2);
  assert.ok(selected.some((value) => value.vehicleClass === 'RV'));
});

test('conflicting duplicate keys use URL tie-breakers independent of input order', () => {
  const earlier = pair('same-id', {
    make: 'Same', model: 'Vehicle', beforeUrl: 'https://a.example/before.jpg', afterUrl: 'https://a.example/after.jpg',
  });
  const later = pair('same-id', {
    make: 'Same', model: 'Vehicle', beforeUrl: 'https://z.example/before.jpg', afterUrl: 'https://z.example/after.jpg',
  });
  const forward = selectPairs([later, earlier], [], { target: 1, perModel: 2 });
  const reverse = selectPairs([earlier, later], [], { target: 1, perModel: 2 });
  assert.equal(forward[0].beforeUrl, earlier.beforeUrl);
  assert.equal(reverse[0].beforeUrl, earlier.beforeUrl);

  const spacedMake = pair('slug-collision', { make: 'A B', model: 'Vehicle' });
  const dashedMake = pair('slug-collision', { make: 'A-B', model: 'Vehicle' });
  const collisionForward = selectPairs([dashedMake, spacedMake], [], { target: 1, perModel: 2 });
  const collisionReverse = selectPairs([spacedMake, dashedMake], [], { target: 1, perModel: 2 });
  assert.equal(collisionForward[0].make, spacedMake.make);
  assert.equal(collisionReverse[0].make, spacedMake.make);
});

test('selection counts existing entries against the case and space insensitive per-model cap', () => {
  const existing = [{ make: ' Ford ', model: 'F 150', key: 'existing' }];
  const candidates = [
    pair('ford-one', { make: 'FORD', model: 'F150', preset: 'A', bodyStyle: 'Truck' }),
    pair('ford-two', { make: 'ford', model: 'F 150', preset: 'B', bodyStyle: 'Pickup' }),
    pair('other-one', { preset: 'C', bodyStyle: 'SUV' }),
    pair('other-two', { preset: 'D', bodyStyle: 'Coupe' }),
  ];
  const selected = selectPairs(candidates, existing, { target: 3, perModel: 2 });
  assert.ok(selected.filter((value) => value.make.toLowerCase() === 'ford').length <= 1);
});

test('sets of one and two use the documented one-per-category minimum exception', () => {
  const first = pair('small-one', { preset: 'A', bodyStyle: 'Sedan' });
  const second = pair('small-two', { preset: 'B', bodyStyle: 'SUV' });
  assert.equal(selectPairs([first], [], { target: 1, perModel: 2 }).length, 1);
  const selected = selectPairs([first, second], [], { target: 2, perModel: 2 });
  assert.equal(selected.length, 2);
  assert.equal(new Set(selected.map((value) => value.preset)).size, 2);
  assert.equal(selectPairs([
    first,
    pair('small-same-category', { preset: 'A', bodyStyle: 'Sedan' }),
  ], [], { target: 2, perModel: 2 }).length, 1);
});

test('import writes exact filenames and dimensions, stays private, and is idempotent', async (t) => {
  const root = scratch(t);
  const libraryPath = seedLibrary(root);
  const inputPath = resolve(root, 'pairs.json');
  const source = pair('private-source-id', {
    make: 'Ford',
    model: 'F-150 Lightning',
    orgId: 'private-org',
    vin: 'PRIVATEVIN123',
  });
  writeJson(inputPath, { pairs: [source], nextCursor: null });
  let fetchCalls = 0;
  const fetchImpl = async () => {
    fetchCalls += 1;
    return response(wideJpeg);
  };

  const result = await importStudioLibrary({
    pairPaths: [inputPath],
    root,
    fetchImpl,
    now: () => new Date('2026-09-27T15:30:00.000Z'),
    logger: quietLogger,
  });
  assert.equal(result.imported.length, 1);
  assert.equal(fetchCalls, 2);

  const identity = pairIdentity(source);
  const directory = resolve(root, 'public', 'studio', 'library');
  assert.deepEqual(readdirSync(directory).sort(), [
    `${identity.key}-after-550.webp`,
    `${identity.key}-after.webp`,
    `${identity.key}-before-550.webp`,
    `${identity.key}-before.webp`,
  ]);
  const fullMetadata = await sharp(readFileSync(resolve(directory, `${identity.key}-before.webp`))).metadata();
  const smallMetadata = await sharp(readFileSync(resolve(directory, `${identity.key}-before-550.webp`))).metadata();
  assert.deepEqual([fullMetadata.width, fullMetadata.height], [1100, 733]);
  assert.deepEqual([smallMetadata.width, smallMetadata.height], [550, 367]);

  const manifestText = readFileSync(libraryPath, 'utf8');
  const manifest = JSON.parse(manifestText);
  assert.equal(manifest.length, 1);
  assert.deepEqual(Object.keys(manifest[0]), [
    'key', 'before', 'after', 'before550', 'after550', 'year', 'make', 'model', 'trim',
    'color', 'bodyStyle', 'vehicleClass', 'preset', 'view', 'importedAt',
  ]);
  assert.doesNotMatch(manifestText, /https?:\/\//);
  assert.doesNotMatch(manifestText, /private-source-id|private-org|PRIVATEVIN123/);

  const hashesPath = sourceHashesPath(root);
  const hashesText = readFileSync(hashesPath, 'utf8');
  assert.doesNotMatch(hashesText, /https?:\/\/|private-source-id|private-org|PRIVATEVIN123/);
  assert.deepEqual(Object.keys(JSON.parse(hashesText)[0]), ['key', 'beforeUrlHash']);

  const duplicateSourcePath = resolve(root, 'duplicate-source.json');
  writeJson(duplicateSourcePath, [pair('different-id', {
    make: 'Different', model: 'Vehicle', beforeUrl: source.beforeUrl,
  })]);
  const second = await importStudioLibrary({
    pairPaths: [duplicateSourcePath], root, fetchImpl, logger: quietLogger,
  });
  assert.equal(second.selected.length, 0);
  assert.equal(second.imported.length, 0);
  assert.equal(fetchCalls, 2);
  assert.equal(readFileSync(libraryPath, 'utf8'), manifestText);

  const freshRoot = scratch(t);
  write(resolve(freshRoot, 'public', 'studio', 'library.json'), manifestText);
  write(resolve(freshRoot, 'scripts', 'studio-library-source-hashes.json'), hashesText);
  let freshFetchCalls = 0;
  const fresh = await importStudioLibrary({
    pairPaths: [duplicateSourcePath],
    root: freshRoot,
    fetchImpl: async () => {
      freshFetchCalls += 1;
      return response(wideJpeg);
    },
    logger: quietLogger,
  });
  assert.equal(fresh.selected.length, 0);
  assert.equal(freshFetchCalls, 0);
});

test('source hash records prune stale keys and require one record per manifest entry', async (t) => {
  const root = scratch(t);
  const inputPath = resolve(root, 'empty.json');
  writeJson(inputPath, []);
  seedLibrary(root, [{ key: 'live-key', make: 'Live', model: 'Vehicle' }]);
  seedSourceHashes(root, [
    { key: 'stale-key', beforeUrlHash: 'b'.repeat(64) },
    { key: 'live-key', beforeUrlHash: 'a'.repeat(64) },
  ]);
  await importStudioLibrary({ pairPaths: [inputPath], root, logger: quietLogger });
  assert.deepEqual(JSON.parse(readFileSync(sourceHashesPath(root), 'utf8')), [
    { key: 'live-key', beforeUrlHash: 'a'.repeat(64) },
  ]);

  const missingRoot = scratch(t);
  const missingInput = resolve(missingRoot, 'empty.json');
  writeJson(missingInput, []);
  seedLibrary(missingRoot, [{ key: 'missing-key', make: 'Missing', model: 'Vehicle' }]);
  await assert.rejects(
    importStudioLibrary({ pairPaths: [missingInput], root: missingRoot, logger: quietLogger }),
    /missing source hash/i,
  );

  const emptyRoot = scratch(t);
  const emptyInput = resolve(emptyRoot, 'empty.json');
  writeJson(emptyInput, []);
  seedLibrary(emptyRoot);
  write(sourceHashesPath(emptyRoot), '');
  await assert.doesNotReject(
    importStudioLibrary({ pairPaths: [emptyInput], root: emptyRoot, logger: quietLogger }),
  );
});

test('source hash records reject malformed and duplicate records', async (t) => {
  const cases = [
    [{ key: 'stale', beforeUrlHash: 'bad' }],
    [
      { key: 'same', beforeUrlHash: 'a'.repeat(64) },
      { key: 'same', beforeUrlHash: 'b'.repeat(64) },
    ],
    [
      { key: 'first', beforeUrlHash: 'a'.repeat(64) },
      { key: 'second', beforeUrlHash: 'a'.repeat(64) },
    ],
  ];
  for (const [index, records] of cases.entries()) {
    const root = scratch(t);
    const inputPath = resolve(root, 'empty.json');
    writeJson(inputPath, []);
    seedLibrary(root);
    seedSourceHashes(root, records);
    await assert.rejects(
      importStudioLibrary({ pairPaths: [inputPath], root, logger: quietLogger }),
      /invalid|duplicate/i,
      `case ${index}`,
    );
  }
});

test('download failure retries twice and skips the whole pair without output', async (t) => {
  const root = scratch(t);
  const libraryPath = seedLibrary(root);
  seedSourceHashes(root);
  const inputPath = resolve(root, 'pairs.json');
  const source = pair('failed-download');
  writeJson(inputPath, [source]);
  const calls = new Map();
  const fetchImpl = async (url) => {
    calls.set(url, (calls.get(url) || 0) + 1);
    return url === source.beforeUrl ? response(Buffer.alloc(0), 503) : response(wideJpeg);
  };

  const result = await importStudioLibrary({
    pairPaths: [inputPath], root, fetchImpl, logger: quietLogger,
  });
  assert.equal(calls.get(source.beforeUrl), 3);
  assert.deepEqual(result.imported, []);
  assert.deepEqual(result.skipped, [pairIdentity(source).key]);
  assert.equal(readFileSync(libraryPath, 'utf8'), '[]\n');
  assert.equal(readFileSync(sourceHashesPath(root), 'utf8'), '[]\n');
  assert.ok(!existsSync(resolve(root, 'public', 'studio', 'library')));
});

test('images narrower than 800 pixels reject the whole pair', async (t) => {
  const root = scratch(t);
  const libraryPath = seedLibrary(root);
  const inputPath = resolve(root, 'pairs.jsonl');
  const source = pair('too-narrow');
  write(inputPath, `${JSON.stringify(source)}\n`);

  const result = await importStudioLibrary({
    pairPaths: [inputPath],
    root,
    fetchImpl: async (url) => response(url === source.beforeUrl ? narrowJpeg : wideJpeg),
    logger: quietLogger,
  });
  assert.deepEqual(result.imported, []);
  assert.deepEqual(result.skipped, [pairIdentity(source).key]);
  assert.equal(readFileSync(libraryPath, 'utf8'), '[]\n');
  assert.ok(!existsSync(resolve(root, 'public', 'studio', 'library')));
});

test('the download timeout covers response body consumption and retries twice', async (t) => {
  const root = scratch(t);
  seedLibrary(root);
  const inputPath = resolve(root, 'pairs.json');
  const source = pair('body-timeout');
  writeJson(inputPath, [source]);
  let hangingBodyCalls = 0;
  const result = await importStudioLibrary({
    pairPaths: [inputPath],
    root,
    timeoutMs: 5,
    fetchImpl: async (url) => {
      if (url === source.beforeUrl) {
        hangingBodyCalls += 1;
        return { ok: true, status: 200, arrayBuffer: () => new Promise(() => {}) };
      }
      return response(wideJpeg);
    },
    logger: quietLogger,
  });
  assert.equal(hangingBodyCalls, 3);
  assert.deepEqual(result.imported, []);
  assert.deepEqual(result.skipped, [pairIdentity(source).key]);
});

test('dry run prints only a selection summary and writes or fetches nothing', async (t) => {
  const root = scratch(t);
  const inputPath = resolve(root, 'raw', 'pairs.json');
  writeJson(inputPath, [pair('dry-run')]);
  const logs = [];
  const warnings = [];
  const result = await importStudioLibrary({
    pairPaths: [inputPath],
    root,
    dryRun: true,
    fetchImpl: async () => { throw new Error('dry run fetched'); },
    logger: { log: (line) => logs.push(line), warn: (line) => warnings.push(line) },
  });
  assert.equal(result.selected.length, 1);
  assert.equal(logs.length, 1);
  assert.match(logs[0], /make\/model:[\s\S]*preset:[\s\S]*bodyStyle:[\s\S]*vehicleClass:/);
  assert.deepEqual(warnings, []);
  assert.ok(!existsSync(resolve(root, 'public')));
  assert.ok(!existsSync(resolve(root, '.studio-import')));
});

test('selection skips missing required values and IDs and deduplicates before URLs', () => {
  const valid = pair('valid');
  const duplicateUrl = pair('other-id', { beforeUrl: valid.beforeUrl });
  const selected = selectPairs([
    valid,
    duplicateUrl,
    pair('missing-make', { make: '' }),
    pair('missing-model', { model: '' }),
    pair('missing-before', { beforeUrl: '' }),
    pair('missing-after', { afterUrl: '' }),
    pair(undefined),
  ], [], { target: 10, perModel: 2 });
  assert.equal(selected.length, 1);
  assert.equal(selected[0].beforeUrl, valid.beforeUrl);
});
