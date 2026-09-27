import {
  existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync,
} from 'node:fs';
import {
  dirname, isAbsolute, relative, resolve,
} from 'node:path';
import { env as processEnv } from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  buildValidationContext, structuralErrorsForPost, validatePost,
} from './validate-post.mjs';
import { loadBlogPosts } from '../seo/articles/blog-loader.mjs';
import { buildArticlePage } from '../seo/articles/article-system.mjs';
import { renderPage } from '../seo/shell.mjs';
import { ARTICLES as MARKETPLACE_A } from '../seo/articles/data-articles-marketplace-a.mjs';
import { ARTICLES as MARKETPLACE_B } from '../seo/articles/data-articles-marketplace-b.mjs';
import { ARTICLES as PHOTOS } from '../seo/articles/data-articles-photos.mjs';
import { ARTICLES as GROWTH } from '../seo/articles/data-articles-growth.mjs';
import { ARTICLES as META_TOOLS } from '../seo/articles/data-articles-meta-tools.mjs';
import { ARTICLES as COMPARE } from '../seo/articles/data-articles-compare.mjs';

const MODULE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;
const REQUEST_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const ERROR_KINDS = new Set(['usage_limit', 'auth', 'model_unavailable', 'no_output', 'validation', 'other']);
const DRIP_ARTICLES = [...MARKETPLACE_A, ...MARKETPLACE_B, ...PHOTOS, ...GROWTH, ...META_TOOLS, ...COMPARE];
const POST_FIELDS = [
  'slug', 'silo', 'anchor', 'crumb', 'primaryKeyword', 'secondaryKeywords', 'title', 'description',
  'eyebrow', 'h1', 'tldr', 'sections', 'faq', 'cta', 'alsoRelated', 'augmentKeys',
  'alsoOnCompetitors', 'inboundFrom',
];

function parseArgs(argv) {
  const values = { root: MODULE_ROOT, noBuild: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--no-build') values.noBuild = true;
    else if (arg === '--root') values.root = resolve(argv[++index] || '');
    else if (arg === '--request-id') values.requestId = argv[++index];
    else if (arg === '--mode') values.mode = argv[++index];
    else if (arg === '--slug') values.slug = argv[++index];
    else if (arg === '--writer-result') values.writerResult = argv[++index];
    else throw new Error(`unknown argument: ${arg}`);
  }
  return values;
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const toRootPath = (root, path) => (isAbsolute(path) ? path : resolve(root, path));
const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();

function blogPaths(root) {
  const blogDir = resolve(root, 'scripts', 'seo', 'articles', 'blog');
  return existsSync(blogDir) ? readdirSync(blogDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_'))
    .map((entry) => `scripts/seo/articles/blog/${entry.name}`)
    .sort() : [];
}

function trackedBlogPaths(root) {
  const result = spawnSync('git', ['ls-files', '--', 'scripts/seo/articles/blog/*.json'], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  });
  if (result.status !== 0) return [];
  return result.stdout.split(/\r?\n/).filter(Boolean).map((path) => path.replaceAll('\\', '/'));
}

function newPostSlug(root) {
  const manifestPath = resolve(root, '.blog-context', 'pre-files.json');
  const before = existsSync(manifestPath) ? readJson(manifestPath) : [];
  const known = new Set([
    ...before.map((path) => String(path).replaceAll('\\', '/')),
    ...trackedBlogPaths(root),
  ]);
  const created = blogPaths(root).filter((path) => !known.has(path));
  if (created.length !== 1) return null;
  return created[0].split('/').at(-1).replace(/\.json$/, '');
}

function safeWriterFailure(kind) {
  const messages = {
    usage_limit: 'Claude Code usage limit reached.',
    auth: 'Claude Code authentication failed.',
    model_unavailable: 'The requested Claude model was unavailable.',
    no_output: 'The writer did not create exactly one post.',
    validation: 'The draft did not pass validation.',
    other: 'The writer failed before a draft was finalized.',
  };
  return messages[kind] || messages.other;
}

function changedPaths(root) {
  const status = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  });
  if (status.status !== 0) throw new Error('git status failed');
  const records = status.stdout.split('\0');
  const paths = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!record) continue;
    const statusCode = record.slice(0, 2);
    paths.push(record.slice(3).replaceAll('\\', '/'));
    if (/[RC]/.test(statusCode)) {
      const pairedPath = records[++index];
      if (pairedPath) paths.push(pairedPath.replaceAll('\\', '/'));
    }
  }
  return [...new Set(paths)];
}

function writerBlogChanges(root) {
  return changedPaths(root).filter((path) => path.startsWith('scripts/seo/articles/blog/'));
}

function restoreFromHeadOrRemove(root, path) {
  const normalizedPath = path.replaceAll('\\', '/');
  const blogRoot = resolve(root, 'scripts', 'seo', 'articles', 'blog');
  const absolutePath = resolve(root, normalizedPath);
  const withinBlog = relative(blogRoot, absolutePath);
  if (!normalizedPath.startsWith('scripts/seo/articles/blog/')
    || !withinBlog || withinBlog === '..' || withinBlog.startsWith('../')
    || withinBlog.startsWith('..\\') || isAbsolute(withinBlog)) throw new Error('unsafe blog cleanup path');
  restoreRepoPathFromHeadOrRemove(root, normalizedPath);
}

function restoreRepoPathFromHeadOrRemove(root, path) {
  const normalizedPath = path.replaceAll('\\', '/');
  const absolutePath = resolve(root, normalizedPath);
  const withinRoot = relative(root, absolutePath);
  if (!normalizedPath || withinRoot === '..' || withinRoot.startsWith('../')
    || withinRoot.startsWith('..\\') || isAbsolute(withinRoot)) throw new Error('unsafe cleanup path');
  const original = spawnSync('git', ['show', `HEAD:${normalizedPath}`], {
    cwd: root,
    encoding: null,
    shell: false,
  });
  if (original.status === 0) {
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, original.stdout);
  } else if (existsSync(absolutePath)) {
    unlinkSync(absolutePath);
  }
}

function cleanWriterBlogChanges(root, paths = writerBlogChanges(root)) {
  for (const path of paths) restoreFromHeadOrRemove(root, path);
}

function restoreWorkingTreeToHead(root) {
  for (const path of changedPaths(root)) restoreRepoPathFromHeadOrRemove(root, path);
}

function rollbackUnsafeDraft({ root, slug, writerChanges, outputsStarted, noBuild }) {
  cleanWriterBlogChanges(root, writerChanges);
  restoreRepoPathFromHeadOrRemove(root, 'scripts/seo/articles/publish-state.json');
  if (slug) {
    restoreRepoPathFromHeadOrRemove(root, `previews/blog/${slug}.html`);
    restoreRepoPathFromHeadOrRemove(root, `public/og/blog-${slug}.png`);
  }
  restoreRepoPathFromHeadOrRemove(root, 'public/og/manifest.json');
  if (outputsStarted && !noBuild) {
    try {
      runNode(root, 'scripts/build-seo-pages.mjs');
    } catch {
      // The exact tracked snapshot below remains the final safety net if recovery generation fails.
    }
  }
  restoreRepoPathFromHeadOrRemove(root, 'public/data/content-status.json');
  restoreWorkingTreeToHead(root);
}

function projectPost(modelPost) {
  return Object.fromEntries(POST_FIELDS
    .filter((field) => Object.hasOwn(modelPost, field))
    .map((field) => [field, modelPost[field]]));
}

function privateRequestValues(root) {
  const requestPath = resolve(root, '.blog-context', 'request.json');
  if (!existsSync(requestPath)) return [];
  try {
    const request = readJson(requestPath);
    return [request.prompt, request.feedback, request.originalPrompt]
      .filter((value) => typeof value === 'string' && value.length > 0);
  } catch {
    return [];
  }
}

function containsPrivateRequestText(value, privateValues) {
  if (typeof value === 'string') return privateValues.some((item) => value.includes(item));
  if (Array.isArray(value)) return value.some((item) => containsPrivateRequestText(item, privateValues));
  if (value && typeof value === 'object') {
    return Object.values(value).some((item) => containsPrivateRequestText(item, privateValues));
  }
  return false;
}

function requestMarker(root, requestId, values) {
  const marker = {
    requestId,
    mode: values.mode,
    slug: values.slug || '',
    status: values.status,
    errorKind: values.errorKind || null,
    error: String(values.error || '').slice(0, 300),
    finishedAt: now(),
  };
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', `${requestId}.json`), marker);
  return marker;
}

function rawUsage(resultPath) {
  if (!resultPath || !existsSync(resultPath)) return {};
  try {
    const raw = readJson(resultPath);
    const usage = {};
    for (const field of ['num_turns', 'duration_ms', 'total_cost_usd', 'usage']) {
      if (Object.hasOwn(raw, field)) usage[field] = raw[field];
    }
    return usage;
  } catch {
    return {};
  }
}

function runNode(root, script, args = []) {
  const result = spawnSync(process.execPath, [resolve(root, script), ...args], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  });
  if (result.status !== 0) throw new Error(`${script} failed`);
}

function renderPreview(root, slug, post, state, date) {
  const blogDir = resolve(root, 'scripts', 'seo', 'articles', 'blog');
  const blogPosts = loadBlogPosts(blogDir).map((candidate) => (candidate.slug === slug ? post : candidate));
  const articles = [...DRIP_ARTICLES, ...blogPosts];
  const previewState = { ...state, [slug]: { status: 'published', publishedAt: date } };
  let html = renderPage(buildArticlePage(post, articles, previewState, { previewDate: date }));
  html = html.replace('<head>', '<head>\n  <base href="https://autolander.ai/">');
  html = html.replace(
    /<meta name="robots" content="[^"]*" \/>/,
    '<meta name="robots" content="noindex">',
  );
  const path = resolve(root, 'previews', 'blog', `${slug}.html`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html, 'utf8');
}

function buildOutputs(root, slug) {
  runNode(root, 'scripts/build-seo-pages.mjs');
  const og = spawnSync(process.execPath, [
    resolve(root, 'scripts', 'build-og-cards.mjs'), `--only=/blog/${slug}/`,
  ], { cwd: root, encoding: 'utf8', shell: false });
  if (og.status === 0) return;
  const diagnostic = `${og.stderr || ''}\n${og.stdout || ''}`;
  if (/playwright|ERR_MODULE_NOT_FOUND|Cannot find (?:package|module)/i.test(diagnostic)) {
    console.warn('OG card skipped: Playwright is unavailable');
    return;
  }
  throw new Error('OG card generation failed');
}

function unexpectedChanges(root) {
  const allowed = (path) => path.startsWith('scripts/seo/articles/blog/')
    || path === 'scripts/seo/articles/publish-state.json'
    || path === 'public/data/content-status.json'
    || path.startsWith('public/og/')
    || path.startsWith('previews/blog/');
  return changedPaths(root).filter((path) => !allowed(path));
}

function failUnsafeDraft({
  root, requestId, mode, slug, writerChanges, outputsStarted = false, noBuild,
  error = safeWriterFailure('validation'),
}) {
  rollbackUnsafeDraft({ root, slug, writerChanges, outputsStarted, noBuild });
  const marker = requestMarker(root, requestId, {
    mode,
    slug,
    status: 'failed',
    errorKind: 'validation',
    error,
  });
  const unexpected = unexpectedChanges(root);
  return { exitCode: unexpected.length ? 3 : 0, marker, unexpected };
}

export async function finalizeDraft(options) {
  const {
    root, requestId, mode, slug: requestedSlug, writerResult, noBuild,
  } = options;
  if (!REQUEST_ID_RE.test(requestId || '')) throw new Error('valid request id is required');
  if (!['new', 'revise'].includes(mode)) throw new Error('mode must be new or revise');
  if (mode === 'revise' && !SLUG_RE.test(requestedSlug || '')) throw new Error('valid revise slug is required');
  if (!writerResult) throw new Error('writer result path is required');

  const statePath = resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json');
  const state = readJson(statePath);
  if (mode === 'revise' && state[requestedSlug]?.status === 'published') {
    cleanWriterBlogChanges(root);
    return { exitCode: 2, marker: null };
  }

  let writer;
  try {
    writer = readJson(toRootPath(root, writerResult));
  } catch {
    writer = { ok: false, errorKind: 'other' };
  }
  if (!writer.ok) {
    cleanWriterBlogChanges(root);
    const errorKind = ERROR_KINDS.has(writer.errorKind) ? writer.errorKind : 'other';
    const marker = requestMarker(root, requestId, {
      mode, slug: requestedSlug, status: 'failed', errorKind, error: safeWriterFailure(errorKind),
    });
    const unexpected = unexpectedChanges(root);
    return { exitCode: unexpected.length ? 3 : 0, marker, unexpected };
  }

  const slug = mode === 'revise' ? requestedSlug : newPostSlug(root);
  if (!slug || !SLUG_RE.test(slug)) {
    cleanWriterBlogChanges(root);
    const marker = requestMarker(root, requestId, {
      mode, slug: requestedSlug, status: 'failed', errorKind: 'no_output',
      error: safeWriterFailure('no_output'),
    });
    const unexpected = unexpectedChanges(root);
    return { exitCode: unexpected.length ? 3 : 0, marker, unexpected };
  }
  const targetRelativePath = `scripts/seo/articles/blog/${slug}.json`;
  const writerChanges = writerBlogChanges(root);
  if (writerChanges.some((path) => path !== targetRelativePath)) {
    cleanWriterBlogChanges(root, writerChanges);
    const marker = requestMarker(root, requestId, {
      mode, slug, status: 'failed', errorKind: 'other',
      error: 'The writer changed files outside the single target post.',
    });
    const unexpected = unexpectedChanges(root);
    return { exitCode: unexpected.length ? 3 : 0, marker, unexpected };
  }
  if (state[slug]?.status === 'published') {
    cleanWriterBlogChanges(root, writerChanges);
    const marker = requestMarker(root, requestId, {
      mode, slug, status: 'failed', errorKind: 'other',
      error: 'The target slug belongs to published content.',
    });
    const unexpected = unexpectedChanges(root);
    return { exitCode: unexpected.length ? 3 : 0, marker, unexpected };
  }

  const postPath = resolve(root, targetRelativePath);
  if (!existsSync(postPath)) {
    cleanWriterBlogChanges(root, writerChanges);
    const marker = requestMarker(root, requestId, {
      mode, slug, status: 'failed', errorKind: 'no_output', error: safeWriterFailure('no_output'),
    });
    const unexpected = unexpectedChanges(root);
    return { exitCode: unexpected.length ? 3 : 0, marker, unexpected };
  }

  let modelPost;
  try {
    modelPost = readJson(postPath);
    if (modelPost === null || typeof modelPost !== 'object' || Array.isArray(modelPost)) {
      throw new Error('post output must be an object');
    }
  } catch {
    return failUnsafeDraft({
      root, requestId, mode, slug, writerChanges, noBuild,
    });
  }
  if (containsPrivateRequestText(modelPost, privateRequestValues(root))) {
    cleanWriterBlogChanges(root, writerChanges);
    const marker = requestMarker(root, requestId, {
      mode, slug, status: 'failed', errorKind: 'other',
      error: 'The writer reproduced private request text.',
    });
    const unexpected = unexpectedChanges(root);
    return { exitCode: unexpected.length ? 3 : 0, marker, unexpected };
  }
  const post = projectPost(modelPost);
  const structuralErrors = structuralErrorsForPost(post, {
    fileSlug: slug,
    mode,
    requestedSlug,
  });
  if (structuralErrors.length) {
    return failUnsafeDraft({
      root, requestId, mode, slug, writerChanges, noBuild,
    });
  }
  const validationResult = validatePost(post, buildValidationContext({ root, selfSlug: slug }), {
    selfSlug: slug,
    fileSlug: slug,
    mode,
    requestedSlug,
  });
  const validationErrors = [...validationResult.errors];
  const checkedAt = now();
  const date = today();
  let previousMeta = {};
  const existingPath = resolve(root, '.blog-context', 'existing-post.json');
  if (mode === 'revise' && existsSync(existingPath)) {
    try {
      previousMeta = readJson(existingPath).meta || {};
    } catch {
      previousMeta = {};
    }
  }
  post.meta = {
    requestId,
    mode,
    model: typeof writer.model === 'string' ? writer.model : '',
    effort: typeof writer.effort === 'string' ? writer.effort : (processEnv.BLOG_EFFORT || 'max'),
    contextWindow: writer.contextWindow === '1m' ? '1m' : '200k',
    createdAt: mode === 'revise' && previousMeta.createdAt ? previousMeta.createdAt : date,
    updatedAt: date,
    revisionCount: mode === 'revise' ? Number(previousMeta.revisionCount || 0) + 1 : 0,
    validation: { ok: validationErrors.length === 0, errors: validationErrors, checkedAt },
    usage: rawUsage(writer.resultPath),
  };
  writeJson(postPath, post);
  if (!state[slug]) state[slug] = { status: 'draft', publishedAt: null };
  writeJson(statePath, state);

  let outputsStarted = false;
  if (!noBuild) {
    outputsStarted = true;
    try {
      buildOutputs(root, slug);
    } catch {
      return failUnsafeDraft({
        root, requestId, mode, slug, writerChanges, outputsStarted, noBuild,
      });
    }
  }
  try {
    renderPreview(root, slug, post, state, date);
  } catch {
    return failUnsafeDraft({
      root, requestId, mode, slug, writerChanges, outputsStarted, noBuild,
    });
  }

  const valid = post.meta.validation.ok;
  const marker = requestMarker(root, requestId, {
    mode,
    slug,
    status: valid ? 'drafted' : 'needs_attention',
    errorKind: valid ? null : 'validation',
    error: valid ? '' : `Validation failed with ${post.meta.validation.errors.length} error(s).`,
  });
  const unexpected = unexpectedChanges(root);
  return { exitCode: unexpected.length ? 3 : 0, marker, unexpected };
}

async function main() {
  try {
    const result = await finalizeDraft(parseArgs(process.argv.slice(2)));
    if (result.unexpected?.length) console.error(`unexpected changed paths: ${result.unexpected.join(', ')}`);
    process.exitCode = result.exitCode;
  } catch (error) {
    console.error(`finalize failed: ${error.message}`);
    process.exitCode = 1;
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) await main();
