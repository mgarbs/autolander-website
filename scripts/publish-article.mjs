// Publish one Avalanche article: flip its publish-state entry, regenerate the whole
// static silo (pages, hub links, sitemap, llms.txt, content-status.json), and record
// which URLs changed for the IndexNow ping. The compare generator runs first because
// its hub and versus pages now carry publish-aware links; build-seo-pages runs last so
// its unified sitemap remains authoritative.
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

import {
  PUBLISH_STATE_PATH, SILOS, articleUrl, backlinkedFrom, isPublished,
} from './seo/articles/article-system.mjs';
import { SITE, NAV } from './seo/registry.mjs';
import { ARTICLES as ART_MKT_A } from './seo/articles/data-articles-marketplace-a.mjs';
import { ARTICLES as ART_MKT_B } from './seo/articles/data-articles-marketplace-b.mjs';
import { ARTICLES as ART_PHOTOS } from './seo/articles/data-articles-photos.mjs';
import { ARTICLES as ART_GROWTH } from './seo/articles/data-articles-growth.mjs';
import { ARTICLES as ART_META } from './seo/articles/data-articles-meta-tools.mjs';
import { ARTICLES as ART_COMPARE } from './seo/articles/data-articles-compare.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHANGED_URLS_PATH = resolve(ROOT, '.last-publish.json');

const slug = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
const ARTICLE_CONTENT = [
  ...ART_MKT_A, ...ART_MKT_B, ...ART_PHOTOS, ...ART_GROWTH, ...ART_META, ...ART_COMPARE,
];

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
const content = ARTICLE_CONTENT.find((c) => c.slug === slug);

if (dryRun) {
  console.log(`[dry-run] would ${already ? 're-generate (already published ' + publishedAt + ')' : 'publish'} ${articleUrl(content || slug)}`);
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
execFileSync(process.execPath, [resolve(ROOT, 'scripts', 'build-compare-pages.mjs')], { stdio: 'inherit' });
execFileSync(process.execPath, [resolve(ROOT, 'scripts', 'build-seo-pages.mjs')], { stdio: 'inherit' });

// URLs whose content changed with this publish — the article itself plus the hub pages
// that just gained a link to it. submit-indexnow.mjs --changed reads this file.
const silo = content ? SILOS[content.silo] : null;
const hubKeys = silo
  ? [...new Set([...(silo.augmentKeys || []), ...(content.augmentKeys || [])])]
  : [];
const backlinks = backlinkedFrom(slug, ARTICLE_CONTENT)
  .filter((otherSlug) => isPublished(state, otherSlug))
  .map((otherSlug) => ARTICLE_CONTENT.find((a) => a.slug === otherSlug))
  .filter(Boolean);
const urls = [...new Set([
  articleUrl(content || slug),
  ...hubKeys.map((key) => SITE.origin + NAV[key].path),
  ...(content?.silo === 'compare' ? [SITE.origin + '/compare/'] : []),
  ...(content?.alsoOnCompetitors || []).map((competitor) => `${SITE.origin}/compare/${competitor}/`),
  ...backlinks.map((article) => articleUrl(article)),
  // The homepage directory just gained a link to this article (see seo/home-directory.mjs).
  SITE.origin + '/',
])];
writeFileSync(CHANGED_URLS_PATH, JSON.stringify({ slug, publishedAt, urls }, null, 2) + '\n', 'utf8');
console.log(`[publish] changed URLs recorded -> ${CHANGED_URLS_PATH}\n  ${urls.join('\n  ')}`);
console.log('[publish] done. Commit public/ (including public/compare/) + scripts/seo/articles/publish-state.json + index.html + src/generated/, deploy, then: npm run seo:indexnow -- --changed');
