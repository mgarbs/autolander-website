import {
  copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  dirname, extname, join, relative, resolve, sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMPETITORS } from '../compare-data.mjs';
import { articlePath } from '../seo/articles/article-system.mjs';
import { loadBlogPosts } from '../seo/articles/blog-loader.mjs';
import { DRIP_ARTICLES } from '../seo/articles/drip-articles.mjs';
import {
  imageUsage, PAGE_STUDIO_USAGES, studioPairsAt, unusedStudioPairs,
} from '../seo/articles/image-usage.mjs';
import { NAV } from '../seo/registry.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '..', '..');
const ORIGIN = 'https://autolander.ai';
const BLOG_RELATIVE_DIR = join('scripts', 'seo', 'articles', 'blog');

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const posixPath = (value) => value.split(sep).join('/');

function parseArgs(argv) {
  const options = {
    root: DEFAULT_ROOT,
    out: '.blog-context',
    mode: '',
    slug: '',
    noBuild: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--no-build') {
      options.noBuild = true;
      continue;
    }
    if (['--root', '--out', '--mode', '--slug'].includes(argument)) {
      if (index + 1 >= argv.length) throw new Error(`${argument} requires a value`);
      options[argument.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`unknown argument: ${argument}`);
  }
  options.root = resolve(options.root);
  options.out = resolve(options.root, options.out);
  if (!['new', 'revise'].includes(options.mode)) throw new Error('--mode must be new or revise');
  if (options.mode === 'revise' && !/^[a-z0-9][a-z0-9-]{2,80}$/.test(options.slug)) {
    throw new Error('--slug is required for revise mode');
  }
  if (options.mode === 'new' && options.slug) throw new Error('--slug is only valid in revise mode');
  return options;
}

function runGenerator(root, script) {
  const scriptPath = resolve(root, 'scripts', script);
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`${script} failed with exit code ${result.status ?? 'unknown'}`);
  }
}

function walkFiles(directory, predicate, output = []) {
  if (!existsSync(directory)) return output;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) walkFiles(path, predicate, output);
    else if (entry.isFile() && predicate(path)) output.push(path);
  }
  return output;
}

function decodeEntities(value) {
  const named = {
    amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"',
  };
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 16)))
    .replace(/&#([0-9]+);/g, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 10)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
}

function textFromFragment(value) {
  return decodeEntities(String(value || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function attribute(tag, name) {
  const match = String(tag).match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match?.[2] || '';
}

function firstTagText(html, tagName) {
  const match = String(html).match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return textFromFragment(match?.[1]);
}

function metaDescription(html) {
  for (const tag of String(html).match(/<meta\b[^>]*>/gi) || []) {
    if (attribute(tag, 'name').toLowerCase() === 'description') return decodeEntities(attribute(tag, 'content')).trim();
  }
  return '';
}

function isNoIndex(html) {
  return (String(html).match(/<meta\b[^>]*>/gi) || []).some((tag) => (
    attribute(tag, 'name').toLowerCase() === 'robots'
      && /(?:^|[\s,])noindex(?:$|[\s,])/i.test(attribute(tag, 'content'))
  ));
}

function canonicalUrl(html, fallback) {
  for (const tag of String(html).match(/<link\b[^>]*>/gi) || []) {
    const rel = attribute(tag, 'rel').toLowerCase().split(/\s+/);
    if (rel.includes('canonical') && attribute(tag, 'href')) return attribute(tag, 'href');
  }
  return fallback;
}

function readableHtml(html) {
  return decodeEntities(String(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function sitemapUrls(root) {
  const sitemap = resolve(root, 'public', 'sitemap.xml');
  if (!existsSync(sitemap)) return [];
  const urls = [...readFileSync(sitemap, 'utf8').matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => decodeEntities(match[1]).trim())
    .filter(Boolean);
  return [...new Set(urls)];
}

function pathForUrl(value) {
  try {
    const url = new URL(value, ORIGIN);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '';
  }
}

function htmlFileForUrl(root, value) {
  let url;
  try {
    url = new URL(value, ORIGIN);
  } catch {
    return '';
  }
  if (url.pathname === '/') return resolve(root, 'index.html');
  if (extname(url.pathname).toLowerCase() === '.html') {
    return resolve(root, 'public', url.pathname.replace(/^\/+/, ''));
  }
  return resolve(root, 'public', url.pathname.replace(/^\/+|\/+$/g, ''), 'index.html');
}

function fallbackCanonical(publicDir, file) {
  const parent = posixPath(relative(publicDir, dirname(file)));
  return `${ORIGIN}/${parent === '.' ? '' : `${parent}/`}`;
}

function htmlPage(root, url) {
  const file = htmlFileForUrl(root, url);
  if (!file || !existsSync(file)) return null;
  const html = readFileSync(file, 'utf8');
  if (isNoIndex(html)) return null;
  const canonical = canonicalUrl(html, new URL(url, ORIGIN).href);
  return {
    url: canonical,
    path: pathForUrl(canonical),
    title: firstTagText(html, 'title'),
    h1: firstTagText(html, 'h1'),
    description: metaDescription(html),
    h2: [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map((match) => textFromFragment(match[1]))
      .filter(Boolean),
    html,
  };
}

function readJsonIfPresent(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function blogPostsAt(root) {
  const directory = resolve(root, BLOG_RELATIVE_DIR);
  return existsSync(directory) ? loadBlogPosts(directory) : [];
}

function publishedArticles(root) {
  const state = readJsonIfPresent(
    resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'),
    {},
  );
  return [...DRIP_ARTICLES, ...blogPostsAt(root)]
    .filter((article) => state?.[article.slug]?.status === 'published')
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

function articleInventory(root) {
  return Object.fromEntries(publishedArticles(root).map((article) => [article.slug, {
    path: articlePath(article),
    anchor: article.anchor,
    silo: article.silo,
    primaryKeyword: article.primaryKeyword,
  }]));
}

function navInventory() {
  return Object.fromEntries(Object.entries(NAV).map(([key, entry]) => [key, {
    path: entry.path,
    anchor: entry.anchor,
  }]));
}

function competitorInventory() {
  return Object.fromEntries(Object.values(COMPETITORS)
    .sort((left, right) => left.slug.localeCompare(right.slug))
    .map((competitor) => [competitor.slug, {
      name: competitor.name,
      path: `/compare/${competitor.slug}/`,
      oneLiner: competitor.oneLiner,
      bestFor: competitor.bestFor,
    }]));
}

const LEGACY_MODEL_PREFIXES = new Set(['cr', 'cx', 'f', 'gx', 'hr', 'mx', 'nx', 'rx']);
const LEGACY_ACRONYMS = new Map([
  ['bmw', 'BMW'],
  ['gmc', 'GMC'],
  ['rv', 'RV'],
  ['suv', 'SUV'],
]);

function label(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function plainWords(value) {
  return label(value)
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function legacyVehicle(key) {
  const parts = label(key).split('-').filter(Boolean);
  const words = [];
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index].toLowerCase();
    const next = parts[index + 1];
    if (LEGACY_MODEL_PREFIXES.has(part) && /^\d+$/.test(next || '')) {
      words.push(`${part.toUpperCase()}-${next}`);
      index += 1;
    } else if (LEGACY_ACRONYMS.has(part)) {
      words.push(LEGACY_ACRONYMS.get(part));
    } else if (/^(?=.*\d)[a-z\d]+$/.test(part)) {
      words.push(part.toUpperCase());
    } else {
      words.push(part.charAt(0).toUpperCase() + part.slice(1));
    }
  }
  return words.join(' ');
}

function angleWords(value) {
  const view = plainWords(value);
  if (!view) return '';
  return /\bview$/.test(view) ? view : `${view} view`;
}

function altHints({ vehicle, color, background, view }) {
  const colorLabel = label(color).toLowerCase();
  const subject = [colorLabel, label(vehicle)].filter(Boolean).join(' ');
  const angle = angleWords(view);
  const anglePhrase = angle ? ` shown in a ${angle}` : '';
  const beforeSubject = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Vehicle';
  const afterSetting = background ? ` in the ${background}` : '';
  return {
    before: `${beforeSubject}${anglePhrase} before AutoLander photo editing`,
    after: `The same ${subject || 'vehicle'}${anglePhrase} after AutoLander photo editing${afterSetting}`,
  };
}

function contextImagePair(pair) {
  const isLegacy = pair.source === 'legacy';
  const result = {
    before: pair.before,
    after: pair.after,
    before550: pair.before550,
    after550: pair.after550,
    vehicle: isLegacy
      ? legacyVehicle(pair.key)
      : [pair.year, pair.make, pair.model, pair.trim].map(label).filter(Boolean).join(' '),
    color: isLegacy ? '' : label(pair.color),
    bodyStyle: isLegacy ? '' : plainWords(pair.bodyStyle),
    vehicleClass: isLegacy ? '' : plainWords(pair.vehicleClass),
    background: isLegacy ? '' : plainWords(pair.preset || pair.sceneKey),
    view: isLegacy ? '' : plainWords(pair.view),
  };
  return { ...result, altHints: altHints(result) };
}

function imageInventory(root, { selfSlug = '' } = {}) {
  const articles = [...DRIP_ARTICLES, ...blogPostsAt(root)];
  const usage = imageUsage({ articles, extraUsages: PAGE_STUDIO_USAGES });
  const pairs = unusedStudioPairs({ pairs: studioPairsAt(root), usage, selfSlug });
  return pairs.map(contextImagePair);
}

function normalizeUrlHeaders(contents) {
  return String(contents).replace(
    /^Source:[ \t]*(https?:\/\/\S+)[ \t]*$/gim,
    (_, url) => `URL: ${url.trim()}`,
  );
}

function wrapContextText(value, width = 120) {
  const words = String(value).split(/\s+/).filter(Boolean)
    .flatMap((word) => word.match(new RegExp(`.{1,${width}}`, 'g')) || []);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

function siteFull(root) {
  const publicDir = resolve(root, 'public');
  const llmsPath = resolve(publicDir, 'llms-full.txt');
  const homePath = resolve(publicDir, 'index.md');
  const llms = existsSync(llmsPath)
    ? normalizeUrlHeaders(readFileSync(llmsPath, 'utf8')).trim()
    : '';
  const home = existsSync(homePath)
    ? normalizeUrlHeaders(readFileSync(homePath, 'utf8')).trim()
    : '';
  const coveredUrls = new Set([llms, home].flatMap((contents) => (
    [...contents.matchAll(/^URL:[ \t]*(https?:\/\/\S+)[ \t]*$/gim)].map((match) => match[1].trim())
  )));
  const additions = [];
  const indexFiles = walkFiles(publicDir, (path) => path.toLowerCase().endsWith(`${sep}index.html`))
    .sort((left, right) => left.localeCompare(right));
  for (const file of indexFiles) {
    const html = readFileSync(file, 'utf8');
    if (isNoIndex(html)) continue;
    const canonical = canonicalUrl(html, fallbackCanonical(publicDir, file));
    if (coveredUrls.has(canonical)) continue;
    const title = firstTagText(html, 'title') || firstTagText(html, 'h1') || canonical;
    const text = readableHtml(html);
    if (!text) continue;
    additions.push(`# ${title}\nURL: ${canonical}\n\n${wrapContextText(text)}`);
  }
  return [llms, home, ...additions].filter(Boolean).join('\n\n---\n\n') + '\n';
}

function indexableHtmlUrls(root) {
  const publicDir = resolve(root, 'public');
  const files = [
    resolve(root, 'index.html'),
    ...walkFiles(publicDir, (path) => path.toLowerCase().endsWith(`${sep}index.html`)),
  ].filter((path) => existsSync(path));
  return files.flatMap((file) => {
    const html = readFileSync(file, 'utf8');
    if (isNoIndex(html)) return [];
    const fallback = file === resolve(root, 'index.html') ? `${ORIGIN}/` : fallbackCanonical(publicDir, file);
    return [canonicalUrl(html, fallback)];
  });
}

function buildSitePages(root, urls) {
  return urls.map((url) => htmlPage(root, url)).filter(Boolean);
}

function keywordsInventory(root, pages) {
  const articleByPath = new Map(publishedArticles(root).map((article) => [articlePath(article), article]));
  return Object.fromEntries(pages.map((page) => {
    const article = articleByPath.get(page.path);
    return [page.path, {
      primary: article?.primaryKeyword || page.h1 || page.title,
      secondary: article?.secondaryKeywords || [],
    }];
  }));
}

function siteIndex(pages, keywords) {
  const entries = pages.map((page) => {
    const details = keywords[page.path] || { primary: page.h1 || page.title };
    return [
      `## ${page.title || page.h1 || page.url}`,
      `URL: ${page.url}`,
      `Title: ${page.title}`,
      `H1: ${page.h1}`,
      `Meta description: ${page.description}`,
      `H2 outline: ${page.h2.length ? page.h2.join(' | ') : '(none)'}`,
      `Primary keyword: ${details.primary || ''}`,
    ].join('\n');
  });
  return `# Live site index\n\n${entries.join('\n\n')}\n`;
}

function preFiles(root) {
  const directory = resolve(root, BLOG_RELATIVE_DIR);
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_'))
    .map((entry) => posixPath(relative(root, resolve(directory, entry.name))))
    .sort();
}

function stringField(value) {
  return typeof value === 'string' ? value : '';
}

function taskMarkdown({ mode, slug, request }) {
  const today = new Date().toISOString().slice(0, 10);
  if (mode === 'new') {
    return [
      '# Blog writing task',
      '',
      `Date: ${today}`,
      'Mode: new',
      'Target file: `scripts/seo/articles/blog/<slug>.json` (choose a new, non-cannibalizing slug).',
      '',
      '## Request',
      '',
      stringField(request.prompt),
      '',
      '## Optional target keyword',
      '',
      stringField(request.keyword) || '(none supplied)',
      '',
      'Write only one post JSON object to the target file. Do not write `meta`.',
      'Run the validator and fix every error until it prints OK.',
      'Finish with exactly `DONE <slug>`, replacing `<slug>` with the slug you chose.',
      '',
    ].join('\n');
  }
  return [
    '# Blog revision task',
    '',
    `Date: ${today}`,
    'Mode: revise',
    `Target file: \`scripts/seo/articles/blog/${slug}.json\`.`,
    'Current draft: `.blog-context/existing-post.json`.',
    '',
    '## Original request',
    '',
    stringField(request.originalPrompt) || '(unavailable)',
    '',
    '## Revision feedback',
    '',
    stringField(request.feedback),
    '',
    'Revise only the target post JSON. Do not write `meta`.',
    'Run the validator and fix every error until it prints OK.',
    `Finish with exactly \`DONE ${slug}\`.`,
    '',
  ].join('\n');
}

function copyContextAsset(root, outputDir, name, outputName = name) {
  const rootAsset = resolve(root, 'scripts', 'blog', name);
  const source = existsSync(rootAsset) ? rootAsset : resolve(HERE, name);
  if (!existsSync(source)) throw new Error(`required context asset is missing: ${name}`);
  copyFileSync(source, resolve(outputDir, outputName));
}

function writeContextFile(outputDir, name, contents) {
  const path = resolve(outputDir, name);
  writeFileSync(path, contents, 'utf8');
  return statSync(path).size;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  mkdirSync(options.out, { recursive: true });
  if (!options.noBuild) {
    runGenerator(options.root, 'build-compare-pages.mjs');
    runGenerator(options.root, 'build-seo-pages.mjs');
  }

  const requestPath = resolve(options.out, 'request.json');
  if (!existsSync(requestPath)) throw new Error('request.json is required in the context directory');
  let request;
  try {
    request = JSON.parse(readFileSync(requestPath, 'utf8'));
  } catch {
    throw new Error('request.json is invalid');
  }
  if (request.mode && request.mode !== options.mode) throw new Error('request mode does not match --mode');
  if (options.mode === 'revise' && request.slug && request.slug !== options.slug) {
    throw new Error('request slug does not match --slug');
  }

  const sitemap = sitemapUrls(options.root);
  const livePaths = [...new Set([...sitemap.map(pathForUrl).filter(Boolean), '/#pricing'])];
  const articles = articleInventory(options.root);
  const pageUrls = [...new Set([...sitemap, ...indexableHtmlUrls(options.root)])];
  const pages = buildSitePages(options.root, pageUrls);
  const keywords = keywordsInventory(options.root, pages);
  const images = imageInventory(options.root, {
    selfSlug: options.mode === 'revise' ? options.slug : '',
  });
  const outputs = new Map();

  outputs.set('site-full.md', siteFull(options.root));
  outputs.set('site-index.md', siteIndex(pages, keywords));
  outputs.set('live-urls.json', json(livePaths));
  outputs.set('nav-keys.json', json(navInventory()));
  outputs.set('competitors.json', json(competitorInventory()));
  outputs.set('articles.json', json(articles));
  outputs.set('images.json', json(images));
  outputs.set('keywords.json', json(keywords));
  outputs.set('task.md', taskMarkdown({ mode: options.mode, slug: options.slug, request }));
  outputs.set('pre-files.json', json(preFiles(options.root)));

  if (options.mode === 'revise') {
    const existingPath = resolve(options.root, BLOG_RELATIVE_DIR, `${options.slug}.json`);
    if (!existsSync(existingPath)) throw new Error(`draft does not exist: ${options.slug}`);
    outputs.set('existing-post.json', readFileSync(existingPath, 'utf8'));
  }

  for (const [name, contents] of outputs) {
    const bytes = writeContextFile(options.out, name, contents);
    if (name === 'images.json') console.log(`context images.json: ${images.length} unused pairs`);
    else console.log(`context ${name}: ${bytes} bytes`);
  }
  for (const [source, target] of [
    ['post-schema.json', 'post-schema.json'],
    ['writer-rules.md', 'rules.md'],
    ['writer-settings.json', 'settings.json'],
  ]) {
    copyContextAsset(options.root, options.out, source, target);
    console.log(`context ${target}: ${statSync(resolve(options.out, target)).size} bytes`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'context preparation failed');
  process.exitCode = 1;
}
