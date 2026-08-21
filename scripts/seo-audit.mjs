import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const PUBLIC = join(ROOT, 'public');
const ORIGIN = 'https://autolander.ai';
const problems = [];
const warnings = [];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function decodeEntities(value = '') {
  const named = {
    amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', nbsp: ' ',
    mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘',
    rdquo: '”', ldquo: '“', bull: '•', hellip: '…',
  };
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match)
    .replace(/<[^>]+>/g, '')
    .trim();
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match?.[2] ?? '';
}

function metaContent(html, selectorName, selectorValue) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    if (attribute(tag, selectorName).toLowerCase() === selectorValue.toLowerCase()) {
      return decodeEntities(attribute(tag, 'content'));
    }
  }
  return '';
}

function canonicalHref(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (attribute(tag, 'rel').toLowerCase() === 'canonical') return attribute(tag, 'href');
  }
  return '';
}

function fileUrl(file) {
  if (file === join(ROOT, 'index.html')) return '/';
  const rel = relative(PUBLIC, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

function label(file) {
  return relative(ROOT, file).split(sep).join('/');
}

// Search-engine ownership-verification token files (e.g. google<token>.html) are bare
// single-line files by spec — exclude them from the page audit.
const isVerificationToken = (file) => /[\\/]google[0-9a-f]{16}\.html$/i.test(file);
const documents = [join(ROOT, 'index.html'), ...walk(PUBLIC).filter((file) => extname(file) === '.html' && !isVerificationToken(file))]
  .map((file) => ({ file, url: fileUrl(file), html: readFileSync(file, 'utf8') }));

function isIndexable(html) {
  return !metaContent(html, 'name', 'robots').toLowerCase().includes('noindex');
}

function normalizedUrl(value) {
  try {
    const url = new URL(value, ORIGIN);
    url.hash = '';
    url.search = '';
    return url.href;
  } catch {
    return '';
  }
}

const indexableDocuments = documents.filter(({ html }) => isIndexable(html));
const canonicalOwners = new Map();
const titleOwners = new Map();

for (const document of indexableDocuments) {
  const canonical = normalizedUrl(canonicalHref(document.html));
  const title = decodeEntities(document.html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  if (canonical) {
    const owner = canonicalOwners.get(canonical);
    if (owner) problems.push(`${label(document.file)}: duplicate canonical also used by ${label(owner.file)} (${canonical})`);
    else canonicalOwners.set(canonical, document);
  }
  if (title) {
    const owner = titleOwners.get(title.toLowerCase());
    if (owner) problems.push(`${label(document.file)}: duplicate title also used by ${label(owner.file)} (${title})`);
    else titleOwners.set(title.toLowerCase(), document);
  }
}

function inspectSchema(value, file) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.primaryImageOfPage === 'string') {
    problems.push(`${label(file)}: primaryImageOfPage must be an ImageObject, not a URL string`);
  }
  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  // The risk this guards is a FABRICATED rating, not a missing one. Google requires an
  // aggregateRating/review for the SoftwareApplication *rich result*, but emitting the type
  // without one is valid schema and is what lets an answer engine understand "AutoLander" and a
  // competitor as software products in a named category — exactly what an "X vs Y" prompt needs.
  // So: allow the node, and fail loudly the moment a rating appears that isn't backed by real
  // published review data. Flip REVIEWS_ARE_VERIFIED only when genuine reviews exist on-site.
  const REVIEWS_ARE_VERIFIED = false;
  if (types.includes('SoftwareApplication') && !REVIEWS_ARE_VERIFIED
      && (value.aggregateRating || value.review)) {
    problems.push(`${label(file)}: SoftwareApplication carries an aggregateRating/review but no verified review data exists — remove it or set REVIEWS_ARE_VERIFIED once real reviews are published`);
  }
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) child.forEach((item) => inspectSchema(item, file));
    else if (child && typeof child === 'object') inspectSchema(child, file);
  }
}

for (const document of documents) {
  const { file, html, url } = document;
  const robots = metaContent(html, 'name', 'robots').toLowerCase();
  const indexable = !robots.includes('noindex');
  const title = decodeEntities(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = metaContent(html, 'name', 'description');
  const canonical = canonicalHref(html);
  const h1Count = [...html.matchAll(/<h1(?:\s|>)/gi)].length;

  if (!title) problems.push(`${label(file)}: missing title`);
  if (indexable && title.length > 60) problems.push(`${label(file)}: title is ${title.length} characters (max 60)`);
  if (indexable && !description) problems.push(`${label(file)}: missing meta description`);
  if (indexable && description.length > 155) problems.push(`${label(file)}: meta description is ${description.length} characters (max 155)`);
  if (indexable && !canonical) problems.push(`${label(file)}: missing canonical`);
  if (indexable && url !== '/' && h1Count !== 1) problems.push(`${label(file)}: expected one H1, found ${h1Count}`);
  if (indexable && !metaContent(html, 'property', 'og:title')) problems.push(`${label(file)}: missing og:title`);
  if (indexable && !metaContent(html, 'name', 'twitter:card')) problems.push(`${label(file)}: missing twitter:card`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=\s*(["'])/i.test(match[0])) problems.push(`${label(file)}: image is missing alt attribute`);
  }

  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      inspectSchema(JSON.parse(match[2]), file);
    } catch (error) {
      problems.push(`${label(file)}: invalid JSON-LD (${error.message})`);
    }
  }

  if (url === '/' && h1Count === 0) warnings.push('index.html: H1 is client-rendered by React; verify it in the browser audit');
}

const dynamicPrefixes = ['/admin', '/pay', '/r/'];
function internalTargetExists(pathname) {
  if (pathname === '/') return true;
  if (dynamicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return true;
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  const clean = decoded.replace(/^\/+/, '');
  const candidates = [
    join(PUBLIC, clean),
    join(PUBLIC, clean, 'index.html'),
    join(PUBLIC, clean.replace(/\/$/, ''), 'index.html'),
  ];
  return candidates.some((candidate) => existsSync(candidate));
}

const inboundLinks = new Map([...canonicalOwners.keys()].map((canonical) => [canonical, new Set()]));

for (const document of documents) {
  const sourceCanonical = normalizedUrl(canonicalHref(document.html));
  for (const match of document.html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])([\s\S]*?)\1/gi)) {
    const href = decodeEntities(match[2]);
    if (!href || href.startsWith('#') || /^(mailto:|tel:|autolander:)/i.test(href)) continue;
    let target;
    try {
      target = new URL(href, `${ORIGIN}${document.url}`);
    } catch {
      problems.push(`${label(document.file)}: invalid href ${href}`);
      continue;
    }
    if (target.origin !== ORIGIN) continue;
    const normalizedTarget = normalizedUrl(target.href);
    if (inboundLinks.has(normalizedTarget) && normalizedTarget !== sourceCanonical) {
      inboundLinks.get(normalizedTarget).add(sourceCanonical || document.url);
    }
    if (!internalTargetExists(target.pathname)) {
      problems.push(`${label(document.file)}: broken internal link ${href}`);
    }
  }
}

for (const [canonical, sources] of inboundLinks) {
  if (canonical !== `${ORIGIN}/` && sources.size === 0) {
    problems.push(`${label(canonicalOwners.get(canonical).file)}: indexable page has no crawlable internal inlinks`);
  }
}

const sitemapPath = join(PUBLIC, 'sitemap.xml');
if (!existsSync(sitemapPath)) {
  problems.push('public/sitemap.xml: missing');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeEntities(match[1])));
  for (const document of documents) {
    const robots = metaContent(document.html, 'name', 'robots').toLowerCase();
    if (robots.includes('noindex')) continue;
    const canonical = canonicalHref(document.html);
    if (canonical && !listed.has(canonical)) problems.push(`${label(document.file)}: indexable canonical missing from sitemap (${canonical})`);
  }
}

if (warnings.length) {
  console.log('SEO audit warnings:');
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (problems.length) {
  console.error(`SEO audit failed with ${problems.length} issue(s):`);
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exitCode = 1;
} else {
  const indexableCount = indexableDocuments.length;
  console.log(`SEO audit passed: ${indexableCount} indexable HTML pages, valid metadata/schema, crawlable links, and complete sitemap coverage.`);
}
