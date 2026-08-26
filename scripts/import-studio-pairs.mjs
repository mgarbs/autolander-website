// Import real before/after pairs from the AutoLander training bucket into public/studio/,
// converted to the site's image convention (1100x733 webp + 550w variant).
//
// Step 1 (monorepo, needs prod creds — run it yourself):
//   node packages/cloud/scripts/export-training-set.js --limit 400 --out manifest.jsonl
// Step 2 (this repo):
//   node scripts/import-studio-pairs.mjs --manifest ../autolander/manifest.jsonl --limit 20
//
// Picks bgValidationPass samples that have both a source (before) and final (after) stage,
// skips vehicles already present in public/studio/, downloads from the R2 public base the
// manifest embeds, and writes <make-model>-before/-after[.‑550].webp. Then reference the
// new pairs from article figure sections and rebuild.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STUDIO_DIR = resolve(ROOT, 'public', 'studio');

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => (
  a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : null
)).filter(Boolean));

const manifestPath = args.manifest;
const limit = Number(args.limit || 20);
if (!manifestPath || !existsSync(manifestPath)) {
  console.error('usage: node scripts/import-studio-pairs.mjs --manifest <manifest.jsonl> [--limit 20]');
  process.exit(2);
}

const slugify = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const lines = readFileSync(manifestPath, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));
const seen = new Set();
const picks = [];
for (const s of lines) {
  if (picks.length >= limit) break;
  if (!s.bgValidationPass) continue;
  const before = s.stages?.source?.url;
  const after = s.stages?.final?.url;
  if (!before || !after) continue;
  const name = slugify(`${s.make} ${s.model}`);
  if (!name || seen.has(name)) continue;
  if (existsSync(resolve(STUDIO_DIR, `${name}-before.webp`))) continue; // already on site
  seen.add(name);
  picks.push({ name, before, after, vehicle: `${s.year || ''} ${s.make} ${s.model}`.trim() });
}

if (!picks.length) {
  console.log('No new qualifying pairs found (bgValidationPass + source + final + not already in public/studio/).');
  process.exit(0);
}

mkdirSync(STUDIO_DIR, { recursive: true });

async function toWebp(buf, outBase) {
  await sharp(buf).resize(1100, 733, { fit: 'cover' }).webp({ quality: 80 }).toFile(`${outBase}.webp`);
  await sharp(buf).resize(550, 367, { fit: 'cover' }).webp({ quality: 78 }).toFile(`${outBase}-550.webp`);
}

const manifestOut = [];
for (const p of picks) {
  try {
    const [b, a] = await Promise.all([fetch(p.before), fetch(p.after)]);
    if (!b.ok || !a.ok) { console.warn(`skip ${p.name}: HTTP ${b.status}/${a.status}`); continue; }
    await toWebp(Buffer.from(await b.arrayBuffer()), resolve(STUDIO_DIR, `${p.name}-before`));
    await toWebp(Buffer.from(await a.arrayBuffer()), resolve(STUDIO_DIR, `${p.name}-after`));
    manifestOut.push(p);
    console.log(`pair ${p.name} (${p.vehicle}) -> public/studio/${p.name}-{before,after}[-550].webp`);
  } catch (err) {
    console.warn(`skip ${p.name}: ${err.message}`);
  }
}

writeFileSync(resolve(STUDIO_DIR, 'imported-pairs.local.json'), JSON.stringify(manifestOut, null, 2) + '\n');
console.log(`\nDone: ${manifestOut.length} new pair(s). Reference them in article figure sections, then rebuild + commit.`);
