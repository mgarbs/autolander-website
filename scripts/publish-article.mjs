// Publish one Avalanche article: flip its publish-state entry, regenerate the static
// silos, and record the URLs that changed for IndexNow and blog verification.
//
//   node scripts/publish-article.mjs <slug>            # flip + regenerate
//   node scripts/publish-article.mjs <slug> --dry-run  # validate and show the target

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SILOS, articleUrl, backlinkedFrom, blogInboundTargets, isPublished,
} from './seo/articles/article-system.mjs';
import { SITE, NAV } from './seo/registry.mjs';
import { ARTICLES as ART_MKT_A } from './seo/articles/data-articles-marketplace-a.mjs';
import { ARTICLES as ART_MKT_B } from './seo/articles/data-articles-marketplace-b.mjs';
import { ARTICLES as ART_PHOTOS } from './seo/articles/data-articles-photos.mjs';
import { ARTICLES as ART_GROWTH } from './seo/articles/data-articles-growth.mjs';
import { ARTICLES as ART_META } from './seo/articles/data-articles-meta-tools.mjs';
import { ARTICLES as ART_COMPARE } from './seo/articles/data-articles-compare.mjs';
import { loadBlogPosts } from './seo/articles/blog-loader.mjs';
import { buildValidationContext, validatePost } from './blog/validate-post.mjs';

const MODULE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;
const STATIC_ARTICLE_CONTENT = [
  ...ART_MKT_A, ...ART_MKT_B, ...ART_PHOTOS, ...ART_GROWTH, ...ART_META, ...ART_COMPARE,
];

function workflowError(message, exitCode = 1) {
  const error = new Error(message);
  error.exitCode = exitCode;
  return error;
}

export function assertPublishable(content, { root = MODULE_ROOT, context } = {}) {
  if (content?.silo !== 'blog') return { ok: true, errors: [] };
  const validationContext = context || buildValidationContext({ root, selfSlug: content.slug });
  const result = validatePost(content, validationContext, { selfSlug: content.slug });
  if (!result.ok) {
    const error = workflowError(`blog post failed authoritative validation:\n${result.errors.join('\n')}`);
    error.validationErrors = result.errors;
    throw error;
  }
  return result;
}

export function changedUrlsFor(content, articles, state) {
  const silo = content && typeof content === 'object' ? SILOS[content.silo] : null;
  const hubKeys = silo
    ? [...new Set([...(silo.augmentKeys || []), ...(content.augmentKeys || [])])]
    : [];
  const backlinks = content && typeof content === 'object'
    ? backlinkedFrom(content.slug, articles)
      .filter((otherSlug) => isPublished(state, otherSlug))
      .map((otherSlug) => articles.find((article) => article.slug === otherSlug))
      .filter(Boolean)
    : [];
  const blogUrls = content?.silo === 'blog'
    ? [
      SITE.origin + NAV.blog.path,
      `${SITE.origin}/blog/feed.xml`,
      ...blogInboundTargets(content, articles, state).map((article) => articleUrl(article)),
    ]
    : [];

  return [...new Set([
    articleUrl(content),
    ...hubKeys.map((key) => SITE.origin + NAV[key].path),
    ...(content?.silo === 'compare' ? [SITE.origin + '/compare/'] : []),
    ...(content?.alsoOnCompetitors || []).map((competitor) => `${SITE.origin}/compare/${competitor}/`),
    ...backlinks.map((article) => articleUrl(article)),
    ...blogUrls,
    SITE.origin + '/',
  ])];
}

function articlesAt(root) {
  const blogDirectory = resolve(root, 'scripts', 'seo', 'articles', 'blog');
  return [
    ...STATIC_ARTICLE_CONTENT,
    ...(existsSync(blogDirectory) ? loadBlogPosts(blogDirectory) : []),
  ];
}

export function publishArticle({
  root = MODULE_ROOT,
  slug,
  dryRun = false,
  noBuild = false,
  today = new Date().toISOString().slice(0, 10),
} = {}) {
  if (!SLUG_RE.test(slug || '')) {
    throw workflowError('usage: node scripts/publish-article.mjs <slug> [--dry-run]', 2);
  }

  const statePath = resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json');
  const changedUrlsPath = resolve(root, '.last-publish.json');
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  if (!(slug in state)) {
    throw workflowError(`[publish] unknown slug "${slug}". Known slugs:\n  ${Object.keys(state).join('\n  ')}`, 2);
  }

  const articles = articlesAt(root);
  const content = articles.find((article) => article.slug === slug);
  if (!content) throw workflowError(`[publish] content is missing for known slug "${slug}"`, 2);
  assertPublishable(content, { root });

  const already = state[slug].status === 'published';
  const publishedAt = already ? state[slug].publishedAt : today;
  if (dryRun) {
    console.log(`[dry-run] would ${already ? `re-generate (already published ${publishedAt})` : 'publish'} ${articleUrl(content)}`);
    return { slug, publishedAt, already, dryRun: true };
  }

  if (!already) {
    state[slug] = { status: 'published', publishedAt };
    writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
    console.log(`[publish] ${slug} -> published (${publishedAt})`);
  } else {
    console.log(`[publish] ${slug} already published ${publishedAt}; regenerating only`);
  }

  if (!noBuild) {
    execFileSync(process.execPath, [resolve(root, 'scripts', 'build-compare-pages.mjs')], {
      cwd: root,
      stdio: 'inherit',
    });
    execFileSync(process.execPath, [resolve(root, 'scripts', 'build-seo-pages.mjs')], {
      cwd: root,
      stdio: 'inherit',
    });
  }

  const urls = changedUrlsFor(content, articles, state);
  const kind = content.silo === 'blog' ? 'blog' : 'drip';
  writeFileSync(changedUrlsPath, `${JSON.stringify({ slug, publishedAt, kind, urls }, null, 2)}\n`, 'utf8');
  console.log(`[publish] changed URLs recorded -> ${changedUrlsPath}\n  ${urls.join('\n  ')}`);
  console.log('[publish] done. Commit generated public files, publish state, and homepage outputs; deploy; then run IndexNow.');
  return { slug, publishedAt, kind, urls, already, dryRun: false };
}

function cliOptions(argv) {
  const rootIndex = argv.indexOf('--root');
  return {
    slug: argv[0],
    dryRun: argv.includes('--dry-run'),
    noBuild: argv.includes('--no-build'),
    root: rootIndex >= 0 && argv[rootIndex + 1] ? resolve(argv[rootIndex + 1]) : MODULE_ROOT,
  };
}

function main() {
  try {
    publishArticle(cliOptions(process.argv.slice(2)));
  } catch (error) {
    console.error(error.message);
    process.exitCode = error.exitCode || 1;
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();
