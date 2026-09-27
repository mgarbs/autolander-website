import {
  existsSync, readFileSync, readdirSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMPETITORS } from '../compare-data.mjs';
import {
  articlePath, SUGGESTED_ORDER,
} from '../seo/articles/article-system.mjs';
import { loadBlogPosts } from '../seo/articles/blog-loader.mjs';
import {
  collectText, CONTRAST_TIC_RE, EM_DASH_RE, FORBIDDEN_CLAIMS, MUSE_TIER_RE,
} from '../seo/articles/content-rules.mjs';
import { ARTICLES as MARKETPLACE_A } from '../seo/articles/data-articles-marketplace-a.mjs';
import { ARTICLES as MARKETPLACE_B } from '../seo/articles/data-articles-marketplace-b.mjs';
import { ARTICLES as PHOTOS } from '../seo/articles/data-articles-photos.mjs';
import { ARTICLES as GROWTH } from '../seo/articles/data-articles-growth.mjs';
import { ARTICLES as META_TOOLS } from '../seo/articles/data-articles-meta-tools.mjs';
import { ARTICLES as COMPARE_ARTICLES } from '../seo/articles/data-articles-compare.mjs';
import { NAV } from '../seo/registry.mjs';
import {
  isStructurallyRenderable, structuralErrorsForPost,
} from '../seo/articles/blog-post-structure.mjs';

export { isStructurallyRenderable, structuralErrorsForPost };

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '..', '..');
export const SECTION_TYPES = [
  'prose', 'qa', 'bullets', 'features', 'steps', 'table', 'callout', 'quotes', 'twocol', 'figure', 'image',
];

const DRIP_ARTICLES = [
  ...MARKETPLACE_A,
  ...MARKETPLACE_B,
  ...PHOTOS,
  ...GROWTH,
  ...META_TOOLS,
  ...COMPARE_ARTICLES,
];
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;
const ALL_LINK_RE = /\]\(([^)\s]+)\)/g;
const REPORT_PATH = '/facebook-marketplace-used-car-report-2026/';
const MONEY_PATHS = new Set([NAV.category.path, NAV.pricing.path, '/#pricing']);

const normalizedKeyword = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
const wordsIn = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;

const nestedStrings = (value, out = []) => {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => nestedStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => nestedStrings(item, out));
  return out;
};

const humanText = (post) => [
  post.title, post.description, post.anchor, post.crumb, post.eyebrow, post.h1, post.tldr,
  ...nestedStrings(post.secondaryKeywords || []),
  ...nestedStrings(post.sections || []),
  ...nestedStrings(post.faq || []),
  ...nestedStrings(post.cta || {}),
].filter((value) => typeof value === 'string');

const decodeEntities = (value) => String(value || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const pageFileForPath = (root, pathname) => {
  if (pathname === '/') return resolve(root, 'index.html');
  if (pathname.endsWith('.html')) return resolve(root, 'public', pathname.replace(/^\//, ''));
  return resolve(root, 'public', pathname.replace(/^\//, ''), 'index.html');
};

function sitemapPaths(root) {
  const sitemapPath = resolve(root, 'public', 'sitemap.xml');
  if (!existsSync(sitemapPath)) return [];
  const xml = readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    try {
      const url = new URL(match[1]);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return '';
    }
  }).filter(Boolean);
}

function htmlH1Keywords(root, paths) {
  const out = [];
  for (const pathname of paths) {
    const file = pageFileForPath(root, pathname);
    if (!existsSync(file)) continue;
    const html = readFileSync(file, 'utf8');
    const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = decodeEntities(match?.[1]);
    if (h1) out.push([h1, pathname]);
  }
  return out;
}

function blogPostsAt(root) {
  const dir = resolve(root, 'scripts', 'seo', 'articles', 'blog');
  return existsSync(dir) ? loadBlogPosts(dir) : [];
}

function studioFilesAt(root) {
  const dir = resolve(root, 'public', 'studio');
  if (!existsSync(dir)) return new Set();
  return new Set(readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => `/studio/${entry.name}`));
}

export function buildValidationContext({ root = ROOT, selfSlug = '' } = {}) {
  const statePath = resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json');
  const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : {};
  const blogPosts = blogPostsAt(root);
  const articles = [...DRIP_ARTICLES, ...blogPosts.filter((post) => post.slug !== selfSlug)];
  const paths = sitemapPaths(root);
  const liveUrls = new Set([...paths, '/', '/#pricing']);
  const navKeys = new Set(Object.keys(NAV));
  const navPaths = new Set(Object.values(NAV).map((entry) => entry.path));
  const competitorSlugs = new Set(Object.values(COMPETITORS).map((competitor) => competitor.slug));
  const publishedSlugs = new Set(Object.entries(state)
    .filter(([, value]) => value?.status === 'published')
    .map(([slug]) => slug));
  const allSlugs = new Set([
    ...SUGGESTED_ORDER,
    ...Object.keys(state).filter((slug) => slug !== selfSlug),
    ...blogPosts.filter((post) => post.slug !== selfSlug).map((post) => post.slug),
  ]);
  const slugOwners = new Map(articles.map((article) => [article.slug, articlePath(article)]));
  const existingKeywords = new Map();
  for (const article of articles) {
    const keyword = normalizedKeyword(article.primaryKeyword);
    if (keyword) existingKeywords.set(keyword, articlePath(article));
  }
  for (const entry of Object.values(NAV)) {
    const keyword = normalizedKeyword(entry.anchor);
    if (keyword) existingKeywords.set(keyword, entry.path);
  }
  for (const [h1, pathname] of htmlH1Keywords(root, paths)) {
    const keyword = normalizedKeyword(h1);
    if (keyword) existingKeywords.set(keyword, pathname);
  }
  return {
    root,
    liveUrls,
    navKeys,
    navPaths,
    competitorSlugs,
    publishedSlugs,
    allSlugs,
    slugOwners,
    existingKeywords,
    studioFiles: studioFilesAt(root),
    sectionTypes: new Set(SECTION_TYPES),
  };
}

const ownPaths = (slug) => new Set([`/blog/${slug}/`, `/guide/${slug}/`, `/compare/${slug}/`]);

function validateRequired(post, errors) {
  for (const field of ['slug', 'silo', 'anchor', 'crumb', 'primaryKeyword', 'title', 'description', 'eyebrow', 'h1', 'tldr']) {
    if (typeof post?.[field] !== 'string' || !post[field].trim()) errors.push(`required field ${field} is missing`);
  }
  if (!Array.isArray(post?.secondaryKeywords)) errors.push('required field secondaryKeywords must be an array');
  else if (post.secondaryKeywords.some((value) => typeof value !== 'string')) errors.push('secondaryKeywords entries must be strings');
  if (!Array.isArray(post?.sections)) errors.push('required field sections must be an array');
  if (!Array.isArray(post?.faq)) errors.push('required field faq must be an array');
  if (!post?.cta || typeof post.cta !== 'object' || !post.cta.heading || !post.cta.sub) errors.push('required field cta must include heading and sub');
  for (const field of ['alsoRelated', 'augmentKeys', 'alsoOnCompetitors']) {
    if (!Array.isArray(post?.[field])) errors.push(`required field ${field} must be an array`);
  }
  if (!Array.isArray(post?.inboundFrom)) errors.push('required field inboundFrom must be an array');
}

function validateImages(post, ctx, errors) {
  const checkPath = (path, label) => {
    if (typeof path !== 'string' || !path.startsWith('/studio/')) {
      errors.push(`${label} image must use a /studio/ path`);
      return;
    }
    if (!ctx.studioFiles.has(path)) errors.push(`${label} image does not exist: ${path}`);
    const variant = path.replace(/\.webp$/i, '-550.webp');
    if (variant === path || !ctx.studioFiles.has(variant)) errors.push(`${label} image is missing its -550 variant: ${path}`);
  };
  for (const [index, section] of (post.sections || []).entries()) {
    if (section?.type === 'figure') {
      if (!section.beforeAlt || !section.afterAlt || !section.caption) errors.push(`figure section ${index + 1} needs alt text and a caption`);
      checkPath(section.before, `figure section ${index + 1} before`);
      checkPath(section.after, `figure section ${index + 1} after`);
    }
    if (section?.type === 'image') {
      if (!section.alt || !section.caption) errors.push(`image section ${index + 1} needs alt text and a caption`);
      checkPath(section.src, `image section ${index + 1}`);
    }
  }
}

function validatePercentages(texts, errors) {
  for (const text of texts) {
    for (const match of String(text).matchAll(/\b\d+(?:\.\d+)?%/g)) {
      const after = String(text).slice((match.index || 0) + match[0].length);
      if (!after.includes(`](${REPORT_PATH})`)) {
        errors.push(`percentage ${match[0]} must be followed by a link to the 2026 report in the same paragraph`);
      }
    }
  }
}

export function validatePost(post, ctx, {
  selfSlug = post?.slug, fileSlug = '', mode = '', requestedSlug = '',
} = {}) {
  const errors = structuralErrorsForPost(post, { fileSlug, mode, requestedSlug });
  validateRequired(post, errors);
  const sections = Array.isArray(post?.sections) ? post.sections : [];
  const faq = Array.isArray(post?.faq) ? post.faq : [];
  const texts = humanText(post || {});
  let collected = [];
  try {
    collected = collectText(post || {});
  } catch {
    errors.push('section content does not match the supported section schema');
  }
  const words = wordsIn(collected.join(' '));

  if (post?.silo !== 'blog') errors.push("silo must equal 'blog'");
  if (!SLUG_RE.test(post?.slug || '') || post?.slug === 'feed') errors.push('slug must be 3-81 lowercase letters, numbers, or hyphens and cannot be feed');
  const slugOwner = ctx.slugOwners?.get(post?.slug);
  const isOwnBlogSlug = post?.slug === selfSlug && slugOwner === `/blog/${selfSlug}/`;
  if (post?.slug && ctx.allSlugs.has(post.slug) && !isOwnBlogSlug) errors.push(`slug collides with an existing article: ${post.slug}`);
  if (post?.slug && [...ctx.navPaths].some((path) => path.split('/').filter(Boolean).at(-1) === post.slug)) errors.push(`slug collides with a NAV path: ${post.slug}`);
  if (post?.slug && ctx.competitorSlugs.has(post.slug)) errors.push(`slug collides with a competitor slug: ${post.slug}`);

  for (const [index, section] of sections.entries()) {
    if (!ctx.sectionTypes.has(section?.type)) errors.push(`unsupported section type at section ${index + 1}: ${section?.type || '(missing)'}`);
  }
  validateImages({ ...post, sections }, ctx, errors);

  if (String(post?.title || '').length > 60) errors.push(`title must be 60 characters or fewer (${post.title.length})`);
  const descriptionLength = String(post?.description || '').length;
  if (descriptionLength < 140 || descriptionLength > 160) errors.push(`description must be 140-160 characters (${descriptionLength})`);
  const tldrWords = wordsIn(post?.tldr);
  if (tldrWords < 40 || tldrWords > 90) errors.push(`tldr must be 40-90 words (${tldrWords})`);
  if (words < 900) errors.push(`body must contain at least 900 words (${words})`);
  if (sections.length < 5) errors.push(`sections must contain at least 5 entries (${sections.length})`);
  if (faq.length < 4) errors.push(`faq must contain at least 4 entries (${faq.length})`);
  if (faq.some((entry) => !Array.isArray(entry) || entry.length !== 2 || entry.some((value) => typeof value !== 'string' || !value.trim()))) {
    errors.push('faq entries must be non-empty question and answer pairs');
  }

  const keyword = normalizedKeyword(post?.primaryKeyword);
  const firstSectionText = nestedStrings(sections[0] || {}).join(' ');
  const keywordSurfaces = [post?.title, post?.h1, firstSectionText].map(normalizedKeyword);
  if (keyword && !keywordSurfaces.some((surface) => surface.includes(keyword))) errors.push('primaryKeyword must appear in the title, h1, or first section');
  const keywordOwner = ctx.existingKeywords.get(keyword);
  if (keyword && keywordOwner && !ownPaths(selfSlug).has(keywordOwner)) errors.push(`primaryKeyword cannibalizes existing page ${keywordOwner}`);

  const internalLinks = new Set();
  const externalLinks = new Set();
  for (const text of texts) {
    for (const match of String(text).matchAll(ALL_LINK_RE)) {
      const href = match[1];
      if (href.startsWith('/')) {
        internalLinks.add(href);
        if (!ctx.liveUrls.has(href)) errors.push(`internal link is not a live page: ${href}`);
      } else if (href.startsWith('https://')) {
        externalLinks.add(href);
      } else {
        errors.push(`external link must use https://: ${href}`);
      }
    }
  }
  if (internalLinks.size < 6) errors.push(`post needs at least 6 distinct internal links (${internalLinks.size})`);
  if (![...internalLinks].some((href) => ctx.navPaths.has(href))) errors.push('post needs at least 1 internal link to a NAV hub');
  if (![...internalLinks].some((href) => MONEY_PATHS.has(href))) errors.push('post needs at least 1 internal link to a money page');
  if (externalLinks.size > 3) errors.push(`post may contain at most 3 external links (${externalLinks.size})`);

  const alsoRelated = Array.isArray(post?.alsoRelated) ? post.alsoRelated : [];
  for (const slug of alsoRelated) {
    if (slug === selfSlug || !ctx.publishedSlugs.has(slug)) errors.push(`alsoRelated must contain published slugs only: ${slug}`);
  }
  const augmentKeys = Array.isArray(post?.augmentKeys) ? post.augmentKeys : [];
  if (augmentKeys.length > 3 || augmentKeys.some((key) => !ctx.navKeys.has(key))) errors.push('augmentKeys must contain at most 3 NAV keys');
  const competitorLinks = Array.isArray(post?.alsoOnCompetitors) ? post.alsoOnCompetitors : [];
  if (competitorLinks.some((slug) => !ctx.competitorSlugs.has(slug))) errors.push('alsoOnCompetitors must contain competitor slugs only');
  const inboundFrom = Array.isArray(post?.inboundFrom) ? post.inboundFrom : [];
  const uniqueInbound = new Set(inboundFrom);
  if (inboundFrom.length < 2 || inboundFrom.length > 6 || uniqueInbound.size !== inboundFrom.length
    || inboundFrom.some((slug) => slug === selfSlug || !ctx.publishedSlugs.has(slug))) {
    errors.push('inboundFrom must contain 2-6 distinct published slugs and cannot contain the post itself');
  }

  const joined = texts.join('\n');
  if (EM_DASH_RE.test(joined)) errors.push('house style: em dash or en dash is not allowed');
  if (CONTRAST_TIC_RE.test(joined)) errors.push("house style: 'not X. It's Y.' cadence is not allowed");
  for (const pattern of FORBIDDEN_CLAIMS) {
    if (pattern.test(joined)) errors.push(`forbidden product claim matches ${pattern}`);
  }
  if (MUSE_TIER_RE.test(joined)) errors.push('Muse prices, free tiers, or tokens are not allowed');
  validatePercentages(texts, errors);

  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    stats: {
      words,
      internalLinks: internalLinks.size,
      externalLinks: externalLinks.size,
    },
  };
}

async function main() {
  const slug = process.argv[2];
  if (!SLUG_RE.test(slug || '')) {
    console.error('slug argument is required');
    process.exitCode = 1;
    return;
  }
  const file = resolve(ROOT, 'scripts', 'seo', 'articles', 'blog', `${slug}.json`);
  if (!existsSync(file)) {
    console.error(`blog post not found: ${slug}`);
    process.exitCode = 1;
    return;
  }
  let post;
  try {
    post = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    console.error(`blog post is not valid JSON: ${slug}`);
    process.exitCode = 1;
    return;
  }
  const result = validatePost(post, buildValidationContext({ selfSlug: slug }), {
    selfSlug: slug,
    fileSlug: slug,
  });
  if (result.ok) {
    console.log(`OK (${result.stats.words} words, ${result.stats.internalLinks} internal links)`);
    return;
  }
  for (const error of result.errors) console.error(error);
  process.exitCode = 1;
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) await main();
