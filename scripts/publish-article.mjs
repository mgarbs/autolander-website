// Publish one Avalanche article: flip its publish-state entry, regenerate the whole
// static silo (pages, hub links, sitemap, llms.txt, content-status.json), and record
// which URLs changed for the IndexNow ping.
//
//   node scripts/publish-article.mjs <slug>            # flip + regenerate
//   node scripts/publish-article.mjs <slug> --dry-run  # show what would happen
//
// Normally invoked by .github/workflows/publish-article.yml (dispatched from the
// /admin Content Publisher), which then commits, deploys Pages, and pings IndexNow.
// Running it locally is equally valid — commit and push the result yourself.
//
// Re-running on an already-published slug is a safe no-op regenerate (idempotent), so a
// retried workflow never double-stamps a publish date.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PUBLISH_STATE_PATH, SILOS, articleUrl } from './seo/articles/article-system.mjs';
import { SITE, NAV } from './seo/registry.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHANGED_URLS_PATH = resolve(ROOT, '.last-publish.json');

const slug = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!slug || !/^[a-z0-9][a-z0-9-]{2,80}$/.test(slug)) {
  console.error('usage: node scripts/publish-article.mjs <slug> [--dry-run]');
  process.exit(2);
}

const state = JSON.parse(readFileSync(PUBLISH_STATE_PATH, 'utf8'));
if (!(slug in state)) {
  console.error(`[publish] unknown slug "${slug}". Known slugs:\n  ${Object.keys(state).join('\n  ')}`);
  process.exit(2);
}

const already = state[slug].status === 'published';
const publishedAt = already ? state[slug].publishedAt : new Date().toISOString().slice(0, 10);

if (dryRun) {
  console.log(`[dry-run] would ${already ? 're-generate (already published ' + publishedAt + ')' : 'publish'} ${articleUrl(slug)}`);
  process.exit(0);
}

if (!already) {
  state[slug] = { status: 'published', publishedAt };
  writeFileSync(PUBLISH_STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
  console.log(`[publish] ${slug} -> published (${publishedAt})`);
} else {
  console.log(`[publish] ${slug} already published ${publishedAt} — regenerating only`);
}

// Regenerate everything from the new state (renders the article, re-links hubs and
// published siblings, sitemap, llms.txt, markdown twins, content-status.json).
execFileSync(process.execPath, [resolve(ROOT, 'scripts', 'build-seo-pages.mjs')], { stdio: 'inherit' });

// URLs whose content changed with this publish — the article itself plus the hub pages
// that just gained a link to it. submit-indexnow.mjs --changed reads this file.
// (Resolve the silo lazily AFTER the regenerate so a content-module error surfaces there.)
const { ARTICLES: A } = await import('./seo/articles/data-articles-marketplace-a.mjs');
const { ARTICLES: B } = await import('./seo/articles/data-articles-marketplace-b.mjs');
const { ARTICLES: P } = await import('./seo/articles/data-articles-photos.mjs');
const { ARTICLES: G } = await import('./seo/articles/data-articles-growth.mjs');
const content = [...A, ...B, ...P, ...G].find((c) => c.slug === slug);
const silo = content ? SILOS[content.silo] : null;
const urls = [
  articleUrl(slug),
  ...(silo ? silo.augmentKeys.map((key) => SITE.origin + NAV[key].path) : []),
];
writeFileSync(CHANGED_URLS_PATH, JSON.stringify({ slug, publishedAt, urls }, null, 2) + '\n', 'utf8');
console.log(`[publish] changed URLs recorded -> ${CHANGED_URLS_PATH}\n  ${urls.join('\n  ')}`);
console.log('[publish] done. Commit public/ + scripts/seo/articles/publish-state.json, deploy, then: npm run seo:indexnow -- --changed');
