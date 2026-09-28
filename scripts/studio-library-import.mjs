import { createHash } from 'node:crypto';
import {
  existsSync, mkdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DEFAULT_TARGET = 150;
const DEFAULT_PER_MODEL = 2;
const FETCH_TIMEOUT_MS = 20_000;
const FETCH_RETRIES = 2;
const MIN_IMAGE_WIDTH = 800;

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = resolve(dirname(SCRIPT_PATH), '..');

export const slugify = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const sha256 = (value) => createHash('sha256').update(String(value ?? '')).digest('hex');
const beforeUrlHash = (value) => sha256(String(value ?? '').trim());

export function pairIdentity(pair) {
  const make = String(pair?.make ?? '').trim();
  const model = String(pair?.model ?? '').trim();
  const hash = sha256(pair?.id);
  const vehicleSlug = [slugify(make), slugify(model)].filter(Boolean).join('-');
  return {
    hash,
    id8: hash.slice(0, 8),
    key: vehicleSlug ? `${vehicleSlug}-${hash.slice(0, 8)}` : '',
  };
}

const compactKey = (value) => String(value ?? '').toLowerCase().replace(/\s+/g, '');
const modelKey = (pair) => `${compactKey(pair.make)}\u0000${compactKey(pair.model)}`;
const categoryKey = (value) => compactKey(value) || '(unknown)';
const displayValue = (value) => String(value ?? '').trim() || 'Unknown';
const displayModel = (pair) => [displayValue(pair.make), displayValue(pair.model)].join(' ');

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

export function readPairFile(path) {
  const source = readFileSync(path, 'utf8').replace(/^\uFEFF/, '').trim();
  if (!source) return [];

  try {
    const parsed = JSON.parse(source);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.pairs)) return parsed.pairs;
    if (parsed && typeof parsed === 'object') {
      if (Object.hasOwn(parsed, 'pairs')) {
        throw new Error('endpoint JSON must contain a pairs array');
      }
      return [parsed];
    }
    throw new Error('JSON input must contain pair objects');
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  return source.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => {
    try {
      const parsed = JSON.parse(line);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error('line is not a pair object');
      }
      return parsed;
    } catch (error) {
      throw new Error(`${path}: invalid JSONL on line ${index + 1}: ${error.message}`);
    }
  });
}

function readLibrary(path) {
  if (!existsSync(path)) return [];
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error(`${path} must contain a JSON array`);
  return parsed;
}

function readSourceHashRecords(path, library) {
  const manifestKeys = new Set();
  for (const entry of library) {
    if (!entry || typeof entry.key !== 'string' || !entry.key) {
      throw new Error('library.json contains an entry without a valid key');
    }
    if (manifestKeys.has(entry.key)) throw new Error(`library.json contains duplicate key ${entry.key}`);
    manifestKeys.add(entry.key);
  }

  if (!existsSync(path)) {
    if (manifestKeys.size) throw new Error(`${path} is missing source hashes for library.json`);
    return { records: [], changed: false };
  }
  const source = readFileSync(path, 'utf8').trim();
  if (!source) {
    if (manifestKeys.size) throw new Error(`${path} is missing source hashes for library.json`);
    return { records: [], changed: false };
  }
  const parsed = JSON.parse(source);
  if (!Array.isArray(parsed)) throw new Error(`${path} must contain a JSON array`);

  const recordKeys = new Set();
  const hashes = new Set();
  for (const record of parsed) {
    const fields = record && typeof record === 'object' && !Array.isArray(record)
      ? Object.keys(record).sort()
      : [];
    if (fields.join(',') !== 'beforeUrlHash,key'
      || typeof record.key !== 'string' || !record.key
      || typeof record.beforeUrlHash !== 'string'
      || !/^[a-f0-9]{64}$/.test(record.beforeUrlHash)) {
      throw new Error(`${path} contains an invalid source hash record`);
    }
    if (recordKeys.has(record.key)) throw new Error(`${path} contains duplicate key ${record.key}`);
    if (hashes.has(record.beforeUrlHash)) throw new Error(`${path} contains duplicate before URL hash`);
    recordKeys.add(record.key);
    hashes.add(record.beforeUrlHash);
  }

  const records = parsed
    .filter((record) => manifestKeys.has(record.key))
    .sort((left, right) => (left.key < right.key ? -1 : left.key > right.key ? 1 : 0));
  const retainedKeys = new Set(records.map((record) => record.key));
  for (const key of manifestKeys) {
    if (!retainedKeys.has(key)) throw new Error(`${path} is missing source hash for ${key}`);
  }
  const changed = records.length !== parsed.length
    || records.some((record, index) => record !== parsed[index]);
  return { records, changed };
}

function writeSourceHashRecords(path, records) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, json([...records].sort((left, right) => (
    left.key < right.key ? -1 : left.key > right.key ? 1 : 0
  ))), 'utf8');
}

function cleanCandidate(pair) {
  if (!pair || typeof pair !== 'object' || Array.isArray(pair)) return null;
  if (pair.id === undefined || pair.id === null || !String(pair.id).trim()) return null;
  const make = String(pair.make ?? '').trim();
  const model = String(pair.model ?? '').trim();
  const beforeUrl = String(pair.beforeUrl ?? '').trim();
  const afterUrl = String(pair.afterUrl ?? '').trim();
  if (!make || !model || !beforeUrl || !afterUrl) return null;

  const identity = pairIdentity({ ...pair, make, model });
  if (!identity.key) return null;
  // The cloud leaves TrainingSample.preset null on validated rows; the background the pipeline
  // actually rendered is sceneKey. Every background cap and the stored label use this value.
  const preset = String(pair.preset ?? '').trim() || String(pair.sceneKey ?? '').trim() || null;
  return {
    ...pair,
    make,
    model,
    beforeUrl,
    afterUrl,
    preset,
    ...identity,
  };
}

function categoryLimit(selectionSize) {
  // A literal 35% maximum is impossible for sets of one or two. In those cases,
  // one item per category is the smallest possible exception.
  if (selectionSize <= 2) return 1;
  return Math.max(1, Math.floor(selectionSize * 0.35));
}

function specialKinds(pair) {
  const description = `${pair.bodyStyle ?? ''} ${pair.vehicleClass ?? ''}`.toLowerCase();
  const kinds = [];
  if (/\b(?:rv|motorhome|camper)\b|recreational\s+vehicle|travel\s+trailer/.test(description)) {
    kinds.push('rv');
  }
  if (/\b(?:motorcycle|motorbike)\b/.test(description)) kinds.push('motorcycle');
  return kinds;
}

function specialMask(pair) {
  const kinds = specialKinds(pair);
  return (kinds.includes('rv') ? 1 : 0) | (kinds.includes('motorcycle') ? 2 : 0);
}

function compareCandidates(left, right) {
  for (const field of [
    'hash', 'key', 'make', 'model', 'beforeUrl', 'afterUrl', 'preset', 'bodyStyle',
    'vehicleClass', 'view', 'color', 'trim', 'year',
  ]) {
    const leftValue = String(left[field] ?? '');
    const rightValue = String(right[field] ?? '');
    if (leftValue < rightValue) return -1;
    if (leftValue > rightValue) return 1;
  }
  return 0;
}

function greedySelection(candidates, desiredSize, existingModelCounts, perModel, seeds = []) {
  const categoryCap = categoryLimit(desiredSize);
  const selected = [];
  const selectedKeys = new Set();
  const selectedModels = new Map();
  const presets = new Map();
  const bodyStyles = new Map();

  const add = (candidate) => {
    if (selected.length >= desiredSize || selectedKeys.has(candidate.key)) return false;
    const vehicle = modelKey(candidate);
    const modelCount = (existingModelCounts.get(vehicle) || 0) + (selectedModels.get(vehicle) || 0);
    if (modelCount >= perModel) return false;

    const preset = categoryKey(candidate.preset);
    const bodyStyle = categoryKey(candidate.bodyStyle);
    if ((presets.get(preset) || 0) >= categoryCap) return false;
    if ((bodyStyles.get(bodyStyle) || 0) >= categoryCap) return false;

    selected.push(candidate);
    selectedKeys.add(candidate.key);
    selectedModels.set(vehicle, (selectedModels.get(vehicle) || 0) + 1);
    presets.set(preset, (presets.get(preset) || 0) + 1);
    bodyStyles.set(bodyStyle, (bodyStyles.get(bodyStyle) || 0) + 1);
    return true;
  };

  for (const seed of seeds) {
    if (!add(seed)) return [];
  }
  for (const candidate of candidates) {
    if (selected.length >= desiredSize) break;
    add(candidate);
  }
  return selected;
}

const SUPPLY_ORDERS = [
  ['preset', 'bodyStyle', 'model'],
  ['preset', 'model', 'bodyStyle'],
  ['bodyStyle', 'preset', 'model'],
  ['bodyStyle', 'model', 'preset'],
  ['model', 'preset', 'bodyStyle'],
  ['model', 'bodyStyle', 'preset'],
];

function candidateOrders(candidates) {
  const supplies = {
    preset: new Map(),
    bodyStyle: new Map(),
    model: new Map(),
  };
  const valueFor = {
    preset: (pair) => categoryKey(pair.preset),
    bodyStyle: (pair) => categoryKey(pair.bodyStyle),
    model: modelKey,
  };
  for (const candidate of candidates) {
    for (const dimension of Object.keys(supplies)) {
      const value = valueFor[dimension](candidate);
      supplies[dimension].set(value, (supplies[dimension].get(value) || 0) + 1);
    }
  }

  const orders = [[...candidates], [...candidates].reverse()];
  for (const dimensions of SUPPLY_ORDERS) {
    for (const supplyDirection of [1, -1]) {
      for (const tieDirection of [1, -1]) {
        orders.push([...candidates].sort((left, right) => {
          for (const dimension of dimensions) {
            const leftSupply = supplies[dimension].get(valueFor[dimension](left));
            const rightSupply = supplies[dimension].get(valueFor[dimension](right));
            if (leftSupply !== rightSupply) {
              return supplyDirection * (leftSupply - rightSupply);
            }
          }
          return tieDirection * compareCandidates(left, right);
        }));
      }
    }
  }

  const unique = new Map();
  for (const order of orders) {
    const signature = order.map((pair) => pair.key).join('\u0000');
    if (!unique.has(signature)) unique.set(signature, order);
  }
  return [...unique.values()];
}

function bitCount(mask) {
  return (mask & 1 ? 1 : 0) + (mask & 2 ? 1 : 0);
}

function selectionMask(selection) {
  return selection.reduce((mask, pair) => mask | specialMask(pair), 0);
}

function betterSelection(candidate, current, availableSpecialMask) {
  if (!current.length) return true;
  const candidateCoverage = bitCount(selectionMask(candidate) & availableSpecialMask);
  const currentCoverage = bitCount(selectionMask(current) & availableSpecialMask);
  if (candidateCoverage !== currentCoverage) return candidateCoverage > currentCoverage;
  return candidate.length > current.length;
}

function seedSetsFor(order) {
  const rv = order.find((pair) => specialMask(pair) & 1);
  const motorcycle = order.find((pair) => specialMask(pair) & 2);
  const seedSets = [[]];
  if (rv && motorcycle) {
    seedSets.push(
      rv.key === motorcycle.key ? [rv] : [rv, motorcycle],
      rv.key === motorcycle.key ? [rv] : [motorcycle, rv],
    );
  }
  if (rv) seedSets.push([rv]);
  if (motorcycle && motorcycle.key !== rv?.key) seedSets.push([motorcycle]);
  return seedSets;
}

function greedyAttempts(order, desiredSize, existingModelCounts, perModel) {
  return seedSetsFor(order).map((seeds) => (
    greedySelection(order, desiredSize, existingModelCounts, perModel, seeds)
  ));
}

function balancedSelection(candidates, desiredSize, existingModelCounts, perModel, seeds = []) {
  const categoryCap = categoryLimit(desiredSize);
  const selected = [];
  const selectedKeys = new Set();
  const selectedModels = new Map();
  const presets = new Map();
  const bodyStyles = new Map();
  const orderIndex = new Map(candidates.map((candidate, index) => [candidate.key, index]));

  const canAdd = (candidate) => {
    if (selectedKeys.has(candidate.key)) return false;
    const vehicle = modelKey(candidate);
    const modelCount = (existingModelCounts.get(vehicle) || 0) + (selectedModels.get(vehicle) || 0);
    return modelCount < perModel
      && (presets.get(categoryKey(candidate.preset)) || 0) < categoryCap
      && (bodyStyles.get(categoryKey(candidate.bodyStyle)) || 0) < categoryCap;
  };
  const add = (candidate) => {
    if (!canAdd(candidate)) return false;
    const vehicle = modelKey(candidate);
    const preset = categoryKey(candidate.preset);
    const bodyStyle = categoryKey(candidate.bodyStyle);
    selected.push(candidate);
    selectedKeys.add(candidate.key);
    selectedModels.set(vehicle, (selectedModels.get(vehicle) || 0) + 1);
    presets.set(preset, (presets.get(preset) || 0) + 1);
    bodyStyles.set(bodyStyle, (bodyStyles.get(bodyStyle) || 0) + 1);
    return true;
  };

  for (const seed of seeds) {
    if (!add(seed)) return [];
  }
  while (selected.length < desiredSize) {
    const viable = candidates.filter(canAdd);
    if (!viable.length) break;

    const modelAlternatives = new Map();
    const cellModels = new Map();
    for (const candidate of viable) {
      const vehicle = modelKey(candidate);
      const cell = `${categoryKey(candidate.preset)}\u0000${categoryKey(candidate.bodyStyle)}`;
      if (!modelAlternatives.has(vehicle)) modelAlternatives.set(vehicle, new Set());
      modelAlternatives.get(vehicle).add(cell);
      if (!cellModels.has(cell)) cellModels.set(cell, new Set());
      cellModels.get(cell).add(vehicle);
    }

    let choice = null;
    let choiceScore = null;
    for (const candidate of viable) {
      const vehicle = modelKey(candidate);
      const preset = categoryKey(candidate.preset);
      const bodyStyle = categoryKey(candidate.bodyStyle);
      const presetCount = presets.get(preset) || 0;
      const bodyCount = bodyStyles.get(bodyStyle) || 0;
      const cell = `${preset}\u0000${bodyStyle}`;
      const score = [
        modelAlternatives.get(vehicle).size,
        Math.max(presetCount, bodyCount),
        presetCount + bodyCount,
        cellModels.get(cell).size,
        orderIndex.get(candidate.key),
      ];
      let comparison = 0;
      if (choiceScore) {
        for (let index = 0; index < score.length; index += 1) {
          if (score[index] !== choiceScore[index]) {
            comparison = score[index] - choiceScore[index];
            break;
          }
        }
        if (comparison === 0) comparison = compareCandidates(candidate, choice);
      }
      if (!choice || comparison < 0) {
        choice = candidate;
        choiceScore = score;
      }
    }
    add(choice);
  }
  return selected;
}

function balancedAttempts(order, desiredSize, existingModelCounts, perModel) {
  return seedSetsFor(order).map((seeds) => (
    balancedSelection(order, desiredSize, existingModelCounts, perModel, seeds)
  ));
}

function marginalCapacityCheck(candidates, existingModelCounts, perModel) {
  const presetSupply = new Map();
  const bodySupply = new Map();
  const modelSupply = new Map();
  for (const candidate of candidates) {
    const preset = categoryKey(candidate.preset);
    const bodyStyle = categoryKey(candidate.bodyStyle);
    const vehicle = modelKey(candidate);
    presetSupply.set(preset, (presetSupply.get(preset) || 0) + 1);
    bodySupply.set(bodyStyle, (bodySupply.get(bodyStyle) || 0) + 1);
    modelSupply.set(vehicle, (modelSupply.get(vehicle) || 0) + 1);
  }
  let modelCapacity = 0;
  for (const [vehicle, supply] of modelSupply) {
    const remaining = Math.max(0, perModel - (existingModelCounts.get(vehicle) || 0));
    modelCapacity += Math.min(supply, remaining);
  }
  const categoryCapacity = (supply, cap) => {
    let total = 0;
    for (const count of supply.values()) total += Math.min(count, cap);
    return total;
  };
  return (desiredSize) => {
    const cap = categoryLimit(desiredSize);
    return modelCapacity >= desiredSize
      && categoryCapacity(presetSupply, cap) >= desiredSize
      && categoryCapacity(bodySupply, cap) >= desiredSize;
  };
}

export function selectPairs(rawPairs, existingLibrary, {
  target = DEFAULT_TARGET,
  perModel = DEFAULT_PER_MODEL,
  seenBeforeUrlHashes = [],
} = {}) {
  const existingKeys = new Set(existingLibrary.map((entry) => entry?.key).filter(Boolean));
  const existingBeforeUrls = new Set(
    existingLibrary.map((entry) => entry?.beforeUrl).filter((value) => typeof value === 'string' && value),
  );
  const existingBeforeUrlHashes = new Set(seenBeforeUrlHashes);
  for (const value of existingBeforeUrls) existingBeforeUrlHashes.add(beforeUrlHash(value));
  const existingModelCounts = new Map();
  for (const entry of existingLibrary) {
    const key = modelKey(entry || {});
    existingModelCounts.set(key, (existingModelCounts.get(key) || 0) + 1);
  }

  const sorted = rawPairs
    .map(cleanCandidate)
    .filter(Boolean)
    .filter((pair) => !existingKeys.has(pair.key) && !existingBeforeUrlHashes.has(beforeUrlHash(pair.beforeUrl)))
    .sort(compareCandidates);

  const candidates = [];
  const seenKeys = new Set(existingKeys);
  const seenBeforeHashes = new Set(existingBeforeUrlHashes);
  for (const pair of sorted) {
    const sourceHash = beforeUrlHash(pair.beforeUrl);
    if (seenKeys.has(pair.key) || seenBeforeHashes.has(sourceHash)) continue;
    seenKeys.add(pair.key);
    seenBeforeHashes.add(sourceHash);
    candidates.push(pair);
  }

  const eligibleCandidates = candidates.filter((pair) => (
    (existingModelCounts.get(modelKey(pair)) || 0) < perModel
  ));
  const orders = candidateOrders(eligibleCandidates);
  const canReachSize = marginalCapacityCheck(eligibleCandidates, existingModelCounts, perModel);
  const availableSpecialMask = eligibleCandidates.reduce((mask, pair) => mask | specialMask(pair), 0);
  const maximumCoverage = bitCount(availableSpecialMask);
  const maximum = Math.min(target, eligibleCandidates.length);
  let best = [];
  if (canReachSize(maximum)) {
    for (const order of orders) {
      for (const selected of balancedAttempts(order, maximum, existingModelCounts, perModel)) {
        if (selected.length !== maximum) continue;
        if (betterSelection(selected, best, availableSpecialMask)) best = [...selected];
        if (bitCount(selectionMask(best) & availableSpecialMask) === maximumCoverage) {
          return best.sort(compareCandidates);
        }
      }
    }
  }
  for (let desired = maximum; desired > 0; desired -= 1) {
    if (!canReachSize(desired)) continue;
    for (const order of orders) {
      for (const selected of greedyAttempts(order, desired, existingModelCounts, perModel)) {
        if (selected.length !== desired) continue;
        if (betterSelection(selected, best, availableSpecialMask)) best = [...selected];
        if (bitCount(selectionMask(best) & availableSpecialMask) === maximumCoverage) {
          return best.sort(compareCandidates);
        }
      }
    }
  }
  return best.sort(compareCandidates);
}

function countsFor(selection, valueFor) {
  const values = new Map();
  for (const pair of selection) {
    const normalized = categoryKey(valueFor(pair));
    const current = values.get(normalized);
    if (current) current.count += 1;
    else values.set(normalized, { label: displayValue(valueFor(pair)), count: 1 });
  }
  return [...values.values()].sort((left, right) => (
    left.label.localeCompare(right.label, 'en', { sensitivity: 'base' })
  ));
}

export function selectionSummary(selection, target) {
  const groups = [
    ['make/model', (pair) => displayModel(pair)],
    ['preset', (pair) => pair.preset],
    ['bodyStyle', (pair) => pair.bodyStyle],
    ['vehicleClass', (pair) => pair.vehicleClass],
  ];
  const lines = [`Selected ${selection.length} new pair(s) (target ${target})`];
  for (const [name, valueFor] of groups) {
    lines.push(`${name}:`);
    const counts = countsFor(selection, valueFor);
    if (!counts.length) lines.push('  (none)');
    else for (const entry of counts) lines.push(`  ${entry.label}: ${entry.count}`);
  }
  return lines.join('\n');
}

async function fetchBuffer(url, fetchImpl, {
  timeoutMs = FETCH_TIMEOUT_MS,
  retries = FETCH_RETRIES,
} = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error(`download timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    try {
      const download = async () => {
        const response = await fetchImpl(url, { signal: controller.signal });
        if (!response?.ok) throw new Error(`HTTP ${response?.status ?? 'error'}`);
        return Buffer.from(await response.arrayBuffer());
      };
      return await Promise.race([download(), timeout]);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

async function imageOutputs(buffer) {
  const metadata = await sharp(buffer).metadata();
  if (!Number.isFinite(metadata.width) || metadata.width < MIN_IMAGE_WIDTH) {
    throw new Error(`image width ${metadata.width ?? 'unknown'} is below ${MIN_IMAGE_WIDTH}px`);
  }
  return Promise.all([
    sharp(buffer).resize(1100, 733, { fit: 'cover' }).webp({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(550, 367, { fit: 'cover' }).webp({ quality: 78 }).toBuffer(),
  ]);
}

function publicPaths(pair) {
  const base = `/studio/library/${pair.key}`;
  return {
    before: `${base}-before.webp`,
    after: `${base}-after.webp`,
    before550: `${base}-before-550.webp`,
    after550: `${base}-after-550.webp`,
  };
}

function manifestEntry(pair, importedAt) {
  return {
    key: pair.key,
    ...publicPaths(pair),
    year: pair.year ?? '',
    make: pair.make,
    model: pair.model,
    trim: pair.trim ?? '',
    color: pair.color ?? '',
    bodyStyle: pair.bodyStyle ?? '',
    vehicleClass: pair.vehicleClass ?? '',
    preset: pair.preset ?? '',
    view: pair.view ?? '',
    importedAt,
  };
}

function cleanExistingEntry(entry) {
  return {
    key: entry.key ?? '',
    before: entry.before ?? '',
    after: entry.after ?? '',
    before550: entry.before550 ?? '',
    after550: entry.after550 ?? '',
    year: entry.year ?? '',
    make: entry.make ?? '',
    model: entry.model ?? '',
    trim: entry.trim ?? '',
    color: entry.color ?? '',
    bodyStyle: entry.bodyStyle ?? '',
    vehicleClass: entry.vehicleClass ?? '',
    preset: entry.preset ?? '',
    view: entry.view ?? '',
    importedAt: entry.importedAt ?? '',
  };
}

function writePairFiles(libraryDir, pair, outputs) {
  const names = [
    `${pair.key}-before.webp`,
    `${pair.key}-before-550.webp`,
    `${pair.key}-after.webp`,
    `${pair.key}-after-550.webp`,
  ];
  mkdirSync(libraryDir, { recursive: true });
  for (let index = 0; index < names.length; index += 1) {
    writeFileSync(resolve(libraryDir, names[index]), outputs[index]);
  }
}

export async function importStudioLibrary({
  pairPaths,
  root = DEFAULT_ROOT,
  target = DEFAULT_TARGET,
  perModel = DEFAULT_PER_MODEL,
  dryRun = false,
  fetchImpl = globalThis.fetch,
  now = () => new Date(),
  logger = console,
  timeoutMs = FETCH_TIMEOUT_MS,
  retries = FETCH_RETRIES,
  sourceHashesPath,
} = {}) {
  if (!Array.isArray(pairPaths) || pairPaths.length === 0) {
    throw new Error('at least one --pairs file is required');
  }
  if (!Number.isInteger(target) || target < 0) throw new Error('--target must be a non-negative integer');
  if (!Number.isInteger(perModel) || perModel < 1) throw new Error('--per-model must be a positive integer');

  const libraryPath = resolve(root, 'public', 'studio', 'library.json');
  const libraryDir = resolve(root, 'public', 'studio', 'library');
  const hashesPath = resolve(root, sourceHashesPath || 'scripts/studio-library-source-hashes.json');
  const existingLibrary = readLibrary(libraryPath);
  const sourceHashState = readSourceHashRecords(hashesPath, existingLibrary);
  const seenBeforeUrlHashes = new Set(sourceHashState.records.map((record) => record.beforeUrlHash));
  const rawPairs = pairPaths.flatMap((path) => readPairFile(resolve(path)));
  const selected = selectPairs(rawPairs, existingLibrary, {
    target, perModel, seenBeforeUrlHashes,
  });
  logger.log(selectionSummary(selected, target));

  if (dryRun) {
    return { selected, imported: [], skipped: [] };
  }
  if (selected.length === 0) {
    if (sourceHashState.changed) writeSourceHashRecords(hashesPath, sourceHashState.records);
    return { selected, imported: [], skipped: [] };
  }
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');

  const imported = [];
  const skipped = [];
  for (const pair of selected) {
    try {
      const [beforeBuffer, afterBuffer] = await Promise.all([
        fetchBuffer(pair.beforeUrl, fetchImpl, { timeoutMs, retries }),
        fetchBuffer(pair.afterUrl, fetchImpl, { timeoutMs, retries }),
      ]);
      const [[before, before550], [after, after550]] = await Promise.all([
        imageOutputs(beforeBuffer),
        imageOutputs(afterBuffer),
      ]);
      const timestamp = now();
      const importedAt = timestamp instanceof Date ? timestamp.toISOString() : String(timestamp);
      writePairFiles(libraryDir, pair, [before, before550, after, after550]);
      imported.push(manifestEntry(pair, importedAt));
      logger.log(`Imported ${pair.key}`);
    } catch {
      skipped.push(pair.key);
      logger.warn(`Skipped ${pair.key}: download or image validation failed`);
    }
  }

  if (imported.length > 0) {
    const merged = [...existingLibrary.map(cleanExistingEntry), ...imported]
      .sort((left, right) => (left.key < right.key ? -1 : left.key > right.key ? 1 : 0));
    const importedKeys = new Set(imported.map((entry) => entry.key));
    const records = [...sourceHashState.records];
    for (const pair of selected) {
      if (importedKeys.has(pair.key)) {
        records.push({ key: pair.key, beforeUrlHash: beforeUrlHash(pair.beforeUrl) });
      }
    }
    // Write hashes first. If the manifest write is interrupted, these become
    // harmless stale records that the next run can prune. The inverse order
    // could leave a manifest entry with no recoverable source URL hash.
    writeSourceHashRecords(hashesPath, records);
    mkdirSync(dirname(libraryPath), { recursive: true });
    writeFileSync(libraryPath, json(merged), 'utf8');
  } else if (sourceHashState.changed) {
    writeSourceHashRecords(hashesPath, sourceHashState.records);
  }
  logger.log(`Imported ${imported.length} pair(s); skipped ${skipped.length}`);
  return { selected, imported, skipped };
}

export function parseCliArgs(argv) {
  const values = {
    pairPaths: [], target: DEFAULT_TARGET, perModel: DEFAULT_PER_MODEL, dryRun: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      values.dryRun = true;
      continue;
    }
    if (arg === '--pairs' || arg === '--target' || arg === '--per-model') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} needs a value`);
      index += 1;
      if (arg === '--pairs') values.pairPaths.push(value);
      else if (arg === '--target') values.target = Number(value);
      else values.perModel = Number(value);
      continue;
    }
    throw new Error(`unknown argument: ${arg}`);
  }
  return values;
}

async function main() {
  try {
    const options = parseCliArgs(process.argv.slice(2));
    if (!options.pairPaths.length) {
      console.error('usage: node scripts/studio-library-import.mjs --pairs <file> [--pairs <file> ...] [--target 150] [--per-model 2] [--dry-run]');
      process.exitCode = 2;
      return;
    }
    await importStudioLibrary(options);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) await main();
