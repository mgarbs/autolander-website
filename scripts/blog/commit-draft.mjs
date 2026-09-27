import {
  existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertChangedPaths,
  changedPaths,
  commitStaged,
  defaultSleep,
  fetchAndReset,
  isPushRejection,
  pushHead,
  readJson,
  removeIfUntracked,
  retryDelay,
  runGit,
  runNode,
  writeJson,
} from './commit-utils.mjs';

const MODULE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REQUEST_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;
const MODES = new Set(['new', 'revise', 'discard']);
const DRAFT_STATUSES = new Set(['drafted', 'needs_attention']);
const MARKER_STATUSES = new Set(['drafted', 'needs_attention', 'failed', 'discarded']);
const STATE_PATH = 'scripts/seo/articles/publish-state.json';
const MANIFEST_PATH = 'public/og/manifest.json';

const allowedDraftPath = (path) => path.startsWith('scripts/seo/articles/blog/')
  || path === STATE_PATH
  || path === 'public/data/content-status.json'
  || path.startsWith('public/og/')
  || path.startsWith('previews/blog/');

const artifactPath = (slug, kind) => {
  if (!slug) return '';
  if (kind === 'post') return `scripts/seo/articles/blog/${slug}.json`;
  if (kind === 'preview') return `previews/blog/${slug}.html`;
  return '';
};

function safeCardPath(value) {
  if (typeof value !== 'string' || !/^\/og\/[a-z0-9-]+\.png$/.test(value)) return '';
  return `public/${value.replace(/^\//, '')}`;
}

function readBuffer(root, path) {
  const absolute = resolve(root, path);
  return path && existsSync(absolute) ? readFileSync(absolute) : null;
}

function writeBuffer(root, path, value) {
  if (!path || value === null) return;
  const absolute = resolve(root, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, value);
}

function removeOwned(root, path) {
  if (!path) return;
  const absolute = resolve(root, path);
  const withinRoot = relative(root, absolute);
  if (withinRoot === '..' || withinRoot.startsWith('../') || withinRoot.startsWith('..\\')
    || isAbsolute(withinRoot)) throw new Error('unsafe artifact path');
  if (existsSync(absolute)) unlinkSync(absolute);
}

function captureArtifacts(root, { requestId, mode, requestedSlug }) {
  const markerPath = `scripts/seo/articles/blog/_requests/${requestId}.json`;
  if (!existsSync(resolve(root, markerPath))) throw new Error('request marker is missing');
  const marker = readJson(resolve(root, markerPath));
  if (marker.requestId !== requestId || marker.mode !== mode || !MARKER_STATUSES.has(marker.status)) {
    throw new Error('request marker does not match this run');
  }
  const slug = marker.slug || requestedSlug || '';
  if (slug && !SLUG_RE.test(slug)) throw new Error('request marker slug is invalid');
  if (mode !== 'new' && slug !== requestedSlug) throw new Error('request marker slug does not match the request');
  if (mode === 'discard' && marker.status !== 'discarded') throw new Error('discard marker is incomplete');

  const postPath = artifactPath(slug, 'post');
  const previewPath = artifactPath(slug, 'preview');
  const manifest = existsSync(resolve(root, MANIFEST_PATH)) ? readJson(resolve(root, MANIFEST_PATH)) : {};
  const route = slug ? `/blog/${slug}/` : '';
  const manifestEntry = route && Object.hasOwn(manifest, route) ? manifest[route] : undefined;
  let cardPath = safeCardPath(manifestEntry);
  if (!cardPath && slug && (mode === 'discard'
    || existsSync(resolve(root, 'public', 'og', `blog-${slug}.png`)))) {
    cardPath = `public/og/blog-${slug}.png`;
  }
  const draft = DRAFT_STATUSES.has(marker.status);
  const post = draft ? readBuffer(root, postPath) : null;
  if (draft && post === null) throw new Error('finalized draft post is missing');
  return {
    requestId,
    mode,
    requestedSlug,
    slug,
    marker,
    markerPath,
    markerBytes: readBuffer(root, markerPath),
    postPath,
    post,
    previewPath,
    preview: draft ? readBuffer(root, previewPath) : null,
    route,
    hasManifestEntry: draft && manifestEntry !== undefined,
    manifestEntry,
    cardPath,
    card: draft ? readBuffer(root, cardPath) : null,
    draft,
    discard: marker.status === 'discarded',
  };
}

function cleanUntrackedArtifacts(root, capsule) {
  for (const path of [
    capsule.markerPath, capsule.postPath, capsule.previewPath, capsule.cardPath,
  ]) removeIfUntracked(root, path);
}

function assertFreshState(capsule, state) {
  const entry = capsule.slug ? state[capsule.slug] : undefined;
  if (capsule.mode === 'revise') {
    if (entry?.status === 'published') return 'published-race';
    if (entry?.status !== 'draft') throw new Error('blog post must still be a draft before push');
  }
  if (capsule.mode === 'discard' && entry !== undefined) {
    if (entry?.status === 'published') throw new Error('published blog posts cannot be discarded');
    if (entry?.status !== 'draft') throw new Error('blog post must still be a draft before push');
  }
  if (capsule.mode === 'new' && entry?.status === 'published') {
    throw new Error('new post slug became published before push');
  }
  return 'normal';
}

function mergeManifest(root, capsule) {
  if (!capsule.route) return;
  const path = resolve(root, MANIFEST_PATH);
  const manifest = existsSync(path) ? readJson(path) : {};
  if (capsule.discard) {
    const currentCard = safeCardPath(manifest[capsule.route]);
    delete manifest[capsule.route];
    if (currentCard) removeOwned(root, currentCard);
    if (existsSync(path) || Object.keys(manifest).length) writeJson(path, manifest);
    return;
  }
  if (capsule.hasManifestEntry) {
    manifest[capsule.route] = capsule.manifestEntry;
    writeJson(path, manifest);
  }
}

function applyCapsule(root, capsule, state) {
  if (capsule.discard) {
    removeOwned(root, capsule.postPath);
    removeOwned(root, capsule.previewPath);
    removeOwned(root, capsule.cardPath);
    delete state[capsule.slug];
  } else if (capsule.draft) {
    writeBuffer(root, capsule.postPath, capsule.post);
    writeBuffer(root, capsule.previewPath, capsule.preview);
    writeBuffer(root, capsule.cardPath, capsule.card);
    if (!state[capsule.slug]) state[capsule.slug] = { status: 'draft', publishedAt: null };
  }
  writeBuffer(root, capsule.markerPath, capsule.markerBytes);
  writeJson(resolve(root, STATE_PATH), state);
  mergeManifest(root, capsule);
}

function publishedRaceMarker(capsule, timestamp) {
  return {
    requestId: capsule.requestId,
    mode: capsule.mode,
    slug: capsule.slug,
    status: 'failed',
    errorKind: 'other',
    error: 'post was published while this revision ran',
    finishedAt: timestamp,
  };
}

async function pushWithRetry({
  root, remote, branch, token, maxAttempts, sleep, random, beforePush, applyAttempt,
}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    fetchAndReset(root, remote, branch, token);
    const attemptResult = applyAttempt(attempt);
    const commit = commitStaged(root, attemptResult.message);
    if (!commit) return { ...attemptResult, attempts: attempt, pushed: false, commit: '' };
    await beforePush?.({ attempt, root, commit });
    const push = pushHead(root, remote, branch, token);
    if (push.status === 0) return {
      ...attemptResult, attempts: attempt, pushed: true, commit,
    };
    if (!isPushRejection(push) || attempt === maxAttempts) throw new Error('git push failed');
    await sleep(retryDelay(random));
  }
  throw new Error('git push retry limit reached');
}

export async function commitDraft({
  root = MODULE_ROOT,
  requestId,
  mode,
  slug: requestedSlug = '',
  remote = 'origin',
  branch = 'main',
  token = process.env.GITHUB_TOKEN || '',
  maxAttempts = 5,
  sleep = defaultSleep,
  random = Math.random,
  now = () => new Date().toISOString(),
  beforePush,
} = {}) {
  if (!REQUEST_ID_RE.test(requestId || '')) throw new Error('valid request id is required');
  if (!MODES.has(mode)) throw new Error('mode must be new, revise, or discard');
  if (mode === 'new' && requestedSlug) throw new Error('new requests cannot provide a slug');
  if (mode !== 'new' && !SLUG_RE.test(requestedSlug)) throw new Error('valid slug is required');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new Error('maxAttempts must be positive');

  const capsule = captureArtifacts(root, { requestId, mode, requestedSlug });
  let raceMarker = null;
  return pushWithRetry({
    root, remote, branch, token, maxAttempts, sleep, random, beforePush,
    applyAttempt: () => {
      cleanUntrackedArtifacts(root, capsule);
      const state = readJson(resolve(root, STATE_PATH));
      const stateResult = assertFreshState(capsule, state);
      if (stateResult === 'published-race') {
        raceMarker ||= publishedRaceMarker(capsule, now());
        writeJson(resolve(root, capsule.markerPath), raceMarker);
        assertChangedPaths(root, (path) => path === capsule.markerPath);
        runGit(root, ['add', '-A', '--', capsule.markerPath]);
        const staged = runGit(root, ['diff', '--cached', '--name-only']).stdout.trim().replaceAll('\\', '/');
        if (staged !== capsule.markerPath) throw new Error('published-race commit must contain only the request marker');
        return {
          message: `blog: ${mode} ${requestId}`,
          publishedRace: true,
          outcome: 'published-race',
          slug: capsule.slug,
        };
      }

      applyCapsule(root, capsule, state);
      const build = runNode(root, 'scripts/build-seo-pages.mjs');
      if (build.status !== 0) throw new Error('scripts/build-seo-pages.mjs failed');
      assertChangedPaths(root, allowedDraftPath);
      runGit(root, ['add', '-A', '--',
        'scripts/seo/articles/blog',
        STATE_PATH,
        'public/data/content-status.json',
        'public/og',
        'previews/blog',
      ]);
      return {
        message: `blog: ${mode} ${requestId}`,
        publishedRace: false,
        outcome: 'pushed',
        slug: capsule.slug,
      };
    },
  });
}

async function main() {
  try {
    await commitDraft({
      root: process.cwd(),
      requestId: process.env.BLOG_REQUEST_ID,
      mode: process.env.BLOG_MODE,
      slug: process.env.BLOG_SLUG || '',
    });
  } catch (error) {
    console.error(`draft commit failed: ${error.message}`);
    process.exitCode = 1;
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) await main();
