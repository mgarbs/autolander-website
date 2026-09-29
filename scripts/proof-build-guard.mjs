import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PROOF } from '../shared/ai-visibility-proof.js';

function* filesIn(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) yield* filesIn(path);
    else yield path;
  }
}

// Check serialized JS, source maps, HTML, and plain text, including escaped copy.
const normalize = (text) => text
  .replace(/\\u([\da-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  .replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, hex, decimal) => String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10)))
  .replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&amp;', '&')
  .replaceAll('\\"', '"').replaceAll("\\'", "'");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function assertNoUnverifiedProof(distDir, entries) {
  const unverified = entries.filter((entry) => entry.verified !== true);
  if (!unverified.length) return;
  for (const path of filesIn(distDir)) {
    const contents = normalize(readFileSync(path, 'utf8'));
    const leaked = contents.includes(PROOF.h2Lead) || unverified.some((entry) =>
      (entry.quote && contents.includes(entry.quote)) ||
      (contents.includes(entry.dealer) && entry.metrics.some(({ after }) =>
        // Match a metric string or visible text, not digits inside IDs or bundled code.
        new RegExp(`(^|[\\s"'\x60>])${escapeRegExp(after)}($|[\\s"'\x60<])`).test(contents))));
    if (leaked) throw new Error(`Unverified proof leaked into production: ${relative(distDir, path)}`);
  }
}
