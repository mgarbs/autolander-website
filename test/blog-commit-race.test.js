import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execPath } from 'node:process';
import { fileURLToPath } from 'node:url';

import { commitDraft } from '../scripts/blog/commit-draft.mjs';
import { commitPublish } from '../scripts/blog/commit-publish.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = resolve(ROOT, 'test', 'fixtures', 'blog', 'valid-post.json');
const BLOG_SLUG = 'test-fixture-valid-blog-post';
const PUBLISH_TARGET = 'aged-inventory-used-car-dealers';
const RACING_PUBLISH = 'used-car-merchandising-checklist';
const REQUEST_ID = '550e8400-e29b-41d4-a716-446655440000';
const EXPECTED_PUBLISH_URLS = [
  'https://autolander.ai/guide/aged-inventory-used-car-dealers/',
  'https://autolander.ai/guide/car-dealership-marketing/',
  'https://autolander.ai/guide/car-dealership-marketing-ideas/',
  'https://autolander.ai/',
];

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const write = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, 'utf8');
};
const writeJson = (path, value) => write(path, json(value));

function command(cwd, executable, args, { allowFailure = false } = {}) {
  const result = spawnSync(executable, args, { cwd, encoding: 'utf8' });
  if (!allowFailure) assert.equal(result.status, 0, result.stderr || result.stdout);
  return result;
}

const git = (cwd, args, options) => command(cwd, 'git', args, options);
const node = (cwd, args, options) => command(cwd, execPath, args, options);

function commitAll(root, message) {
  git(root, ['add', '-A']);
  const staged = git(root, ['diff', '--cached', '--quiet'], { allowFailure: true });
  if (staged.status === 0) return false;
  git(root, [
    '-c', 'user.name=Race Test', '-c', 'user.email=race@example.com',
    'commit', '-qm', message,
  ]);
  return true;
}

function raceRepo(t, label) {
  const scratch = mkdtempSync(join(tmpdir(), `autolander-blog-race-${label}-`));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const remote = resolve(scratch, 'remote.git');
  git(scratch, ['init', '--bare', '-q', remote]);
  git(ROOT, ['push', '-q', remote, 'HEAD:refs/heads/main']);
  git(scratch, ['--git-dir', remote, 'symbolic-ref', 'HEAD', 'refs/heads/main']);
  const clone = (name) => {
    const path = resolve(scratch, name);
    git(scratch, ['clone', '-q', '-c', 'core.autocrlf=false', '--branch', 'main', remote, path]);
    return path;
  };
  // These tests exercise git races, not images: start every race from an empty studio library so
  // the "post needs an unused figure" rule never depends on how many real pairs are committed.
  const seeder = clone('seeder');
  write(resolve(seeder, 'public', 'studio', 'library.json'), '[]\n');
  if (commitAll(seeder, 'test: empty studio library')) git(seeder, ['push', '-q', 'origin', 'HEAD:main']);
  return { scratch, remote, clone };
}

function publishAndPush(root, slug, message) {
  node(root, ['scripts/publish-article.mjs', slug]);
  commitAll(root, message);
  git(root, ['push', '-q', 'origin', 'HEAD:main']);
}

function seedDraft(root, { requestId = REQUEST_ID, title = '' } = {}) {
  const post = readJson(FIXTURE);
  if (title) post.title = title;
  const postPath = resolve(root, 'scripts', 'seo', 'articles', 'blog', `${BLOG_SLUG}.json`);
  writeJson(postPath, post);
  const statePath = resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json');
  const state = readJson(statePath);
  state[BLOG_SLUG] = { status: 'draft', publishedAt: null };
  writeJson(statePath, state);
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', `${requestId}.json`), {
    requestId,
    mode: 'new',
    slug: BLOG_SLUG,
    status: 'drafted',
    errorKind: null,
    error: '',
    finishedAt: '2026-09-27T12:00:00.000Z',
  });
  write(resolve(root, 'previews', 'blog', `${BLOG_SLUG}.html`), '<!doctype html><title>draft preview</title>\n');
  node(root, ['scripts/build-seo-pages.mjs']);
  const manifestPath = resolve(root, 'public', 'og', 'manifest.json');
  const manifest = readJson(manifestPath);
  manifest[`/blog/${BLOG_SLUG}/`] = `/og/blog-${BLOG_SLUG}.png`;
  writeJson(manifestPath, manifest);
  write(resolve(root, 'public', 'og', `blog-${BLOG_SLUG}.png`), 'draft og card\n');
}

function assertPublishRecord(record, publishedAt) {
  assert.deepEqual(record, {
    slug: PUBLISH_TARGET,
    publishedAt,
    kind: 'drip',
    urls: EXPECTED_PUBLISH_URLS,
  });
}

test('commitDraft retries a publish race and preserves both the publish and new draft', async (t) => {
  const repo = raceRepo(t, 'generate-publish');
  const publisher = repo.clone('publisher');
  const generator = repo.clone('generator');
  seedDraft(generator);
  let raced = false;
  const delays = [];

  const result = await commitDraft({
    root: generator,
    requestId: REQUEST_ID,
    mode: 'new',
    slug: '',
    token: 'unit-test-github-token',
    sleep: async (milliseconds) => { delays.push(milliseconds); },
    random: () => 0,
    beforePush: async ({ attempt }) => {
      if (attempt !== 1 || raced) return;
      raced = true;
      publishAndPush(publisher, PUBLISH_TARGET, 'race: publish existing drip');
    },
  });

  assert.equal(result.pushed, true);
  assert.equal(result.attempts, 2);
  const localConfig = readFileSync(resolve(generator, '.git', 'config'), 'utf8');
  assert.doesNotMatch(localConfig, /unit-test-github-token|extraheader|AUTHORIZATION/i);
  assert.deepEqual(delays, [5_000]);
  const verify = repo.clone('verify');
  const state = readJson(resolve(verify, 'scripts', 'seo', 'articles', 'publish-state.json'));
  assert.equal(state[PUBLISH_TARGET].status, 'published');
  assert.deepEqual(state[BLOG_SLUG], { status: 'draft', publishedAt: null });
  assert.ok(existsSync(resolve(verify, 'scripts', 'seo', 'articles', 'blog', `${BLOG_SLUG}.json`)));
  assert.ok(existsSync(resolve(verify, 'scripts', 'seo', 'articles', 'blog', '_requests', `${REQUEST_ID}.json`)));
  assert.ok(existsSync(resolve(verify, 'previews', 'blog', `${BLOG_SLUG}.html`)));
  assert.equal(readFileSync(resolve(verify, 'public', 'og', `blog-${BLOG_SLUG}.png`), 'utf8'), 'draft og card\n');
  assert.equal(readJson(resolve(verify, 'public', 'og', 'manifest.json'))[`/blog/${BLOG_SLUG}/`], `/og/blog-${BLOG_SLUG}.png`);
  const status = readJson(resolve(verify, 'public', 'data', 'content-status.json'));
  assert.equal(status.articles.find((row) => row.slug === PUBLISH_TARGET).status, 'published');
  assert.equal(status.articles.find((row) => row.slug === BLOG_SLUG).status, 'draft');
  node(verify, ['scripts/build-seo-pages.mjs']);
  assert.equal(git(verify, ['status', '--porcelain']).stdout, '');
});

test('commitDraft turns a revise-vs-publish race into a marker-only failure', async (t) => {
  const repo = raceRepo(t, 'revise-publish');
  const seed = repo.clone('seed');
  seedDraft(seed, { requestId: '11111111-1111-4111-8111-111111111111' });
  commitAll(seed, 'seed blog draft');
  git(seed, ['push', '-q', 'origin', 'HEAD:main']);

  const publisher = repo.clone('publisher');
  const reviser = repo.clone('reviser');
  const originalPost = readFileSync(resolve(reviser, 'scripts', 'seo', 'articles', 'blog', `${BLOG_SLUG}.json`));
  const originalCard = readFileSync(resolve(reviser, 'public', 'og', `blog-${BLOG_SLUG}.png`));
  const revised = readJson(FIXTURE);
  revised.title = 'Test Fixture Blog Keyword: Revised Workflow';
  writeJson(resolve(reviser, 'scripts', 'seo', 'articles', 'blog', `${BLOG_SLUG}.json`), revised);
  write(resolve(reviser, 'previews', 'blog', `${BLOG_SLUG}.html`), '<!doctype html><title>revised preview</title>\n');
  write(resolve(reviser, 'public', 'og', `blog-${BLOG_SLUG}.png`), 'revised og card\n');
  writeJson(resolve(reviser, 'scripts', 'seo', 'articles', 'blog', '_requests', `${REQUEST_ID}.json`), {
    requestId: REQUEST_ID,
    mode: 'revise',
    slug: BLOG_SLUG,
    status: 'drafted',
    errorKind: null,
    error: '',
    finishedAt: '2026-09-27T12:05:00.000Z',
  });
  node(reviser, ['scripts/build-seo-pages.mjs']);
  let raced = false;

  const result = await commitDraft({
    root: reviser,
    requestId: REQUEST_ID,
    mode: 'revise',
    slug: BLOG_SLUG,
    sleep: async () => {},
    random: () => 0,
    beforePush: async ({ attempt }) => {
      if (attempt !== 1 || raced) return;
      raced = true;
      publishAndPush(publisher, BLOG_SLUG, 'race: publish blog draft');
    },
  });

  assert.equal(result.publishedRace, true);
  assert.equal(result.attempts, 2);
  const verify = repo.clone('verify');
  assert.deepEqual(
    readFileSync(resolve(verify, 'scripts', 'seo', 'articles', 'blog', `${BLOG_SLUG}.json`)),
    originalPost,
  );
  assert.deepEqual(readFileSync(resolve(verify, 'public', 'og', `blog-${BLOG_SLUG}.png`)), originalCard);
  assert.equal(readJson(resolve(verify, 'scripts', 'seo', 'articles', 'publish-state.json'))[BLOG_SLUG].status, 'published');
  const marker = readJson(resolve(verify, 'scripts', 'seo', 'articles', 'blog', '_requests', `${REQUEST_ID}.json`));
  assert.equal(marker.status, 'failed');
  assert.equal(marker.error, 'post was published while this revision ran');
  assert.deepEqual(
    git(verify, ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD']).stdout.trim().split(/\r?\n/),
    [`scripts/seo/articles/blog/_requests/${REQUEST_ID}.json`],
  );
});

test('commitDraft lands a half-deleted discard and removes an orphan card', async (t) => {
  const repo = raceRepo(t, 'discard-half-deleted');
  const seed = repo.clone('seed');
  seedDraft(seed, { requestId: '11111111-1111-4111-8111-111111111111' });
  const statePath = resolve(seed, 'scripts', 'seo', 'articles', 'publish-state.json');
  const state = readJson(statePath);
  delete state[BLOG_SLUG];
  writeJson(statePath, state);
  rmSync(resolve(seed, 'scripts', 'seo', 'articles', 'blog', `${BLOG_SLUG}.json`));
  rmSync(resolve(seed, 'previews', 'blog', `${BLOG_SLUG}.html`));
  const manifestPath = resolve(seed, 'public', 'og', 'manifest.json');
  const manifest = readJson(manifestPath);
  delete manifest[`/blog/${BLOG_SLUG}/`];
  writeJson(manifestPath, manifest);
  node(seed, ['scripts/build-seo-pages.mjs']);
  commitAll(seed, 'seed half-deleted blog draft');
  git(seed, ['push', '-q', 'origin', 'HEAD:main']);

  const discarder = repo.clone('discarder');
  node(discarder, [
    'scripts/blog/discard-post.mjs', BLOG_SLUG,
    '--root', discarder,
    '--request-id', REQUEST_ID,
  ]);
  const result = await commitDraft({
    root: discarder,
    requestId: REQUEST_ID,
    mode: 'discard',
    slug: BLOG_SLUG,
    sleep: async () => {},
    random: () => 0,
  });

  assert.equal(result.pushed, true);
  const verify = repo.clone('verify');
  assert.ok(!readJson(resolve(verify, 'scripts', 'seo', 'articles', 'publish-state.json'))[BLOG_SLUG]);
  assert.ok(!existsSync(resolve(verify, 'scripts', 'seo', 'articles', 'blog', `${BLOG_SLUG}.json`)));
  assert.ok(!existsSync(resolve(verify, 'previews', 'blog', `${BLOG_SLUG}.html`)));
  assert.ok(!existsSync(resolve(verify, 'public', 'og', `blog-${BLOG_SLUG}.png`)));
  assert.ok(!readJson(resolve(verify, 'public', 'og', 'manifest.json'))[`/blog/${BLOG_SLUG}/`]);
  assert.equal(
    readJson(resolve(verify, 'scripts', 'seo', 'articles', 'blog', '_requests', `${REQUEST_ID}.json`)).status,
    'discarded',
  );
  node(verify, ['scripts/build-seo-pages.mjs']);
  assert.equal(git(verify, ['status', '--porcelain']).stdout, '');
});

test('commitPublish retries a competing publish and preserves both state changes', async (t) => {
  const repo = raceRepo(t, 'publish-publish');
  const racer = repo.clone('racer');
  const publisher = repo.clone('publisher');
  let raced = false;

  const result = await commitPublish({
    root: publisher,
    slug: PUBLISH_TARGET,
    sleep: async () => {},
    random: () => 0,
    beforePush: async ({ attempt }) => {
      if (attempt !== 1 || raced) return;
      raced = true;
      publishAndPush(racer, RACING_PUBLISH, 'race: publish adjacent drip');
    },
  });

  assert.equal(result.pushed, true);
  assert.equal(result.attempts, 2);
  const verify = repo.clone('verify');
  const state = readJson(resolve(verify, 'scripts', 'seo', 'articles', 'publish-state.json'));
  assert.equal(state[PUBLISH_TARGET].status, 'published');
  assert.equal(state[RACING_PUBLISH].status, 'published');
  assert.doesNotThrow(() => JSON.parse(readFileSync(resolve(verify, 'public', 'data', 'content-status.json'), 'utf8')));
  assertPublishRecord(readJson(resolve(publisher, '.last-publish.json')), state[PUBLISH_TARGET].publishedAt);
});

test('commitPublish keeps idempotent re-publish behavior and CLI exit code 2', async (t) => {
  const repo = raceRepo(t, 'publish-idempotent');
  const first = repo.clone('first');
  await commitPublish({ root: first, slug: PUBLISH_TARGET, sleep: async () => {}, random: () => 0 });
  const firstRecord = readJson(resolve(first, '.last-publish.json'));
  const firstState = readJson(resolve(first, 'scripts', 'seo', 'articles', 'publish-state.json'));
  assertPublishRecord(firstRecord, firstState[PUBLISH_TARGET].publishedAt);
  const headBefore = git(first, ['rev-parse', 'origin/main']).stdout.trim();
  const second = repo.clone('second');
  const result = await commitPublish({ root: second, slug: PUBLISH_TARGET, sleep: async () => {}, random: () => 0 });
  assert.equal(result.pushed, false);
  assert.equal(result.already, true);
  assert.equal(git(second, ['rev-parse', 'origin/main']).stdout.trim(), headBefore);
  assert.deepEqual(readJson(resolve(second, '.last-publish.json')), firstRecord);

  const script = resolve(second, 'scripts', 'blog', 'commit-publish.mjs');
  const bad = node(second, [script, 'bad slug'], { allowFailure: true });
  assert.equal(bad.status, 2);
  const unknown = node(second, [script, 'valid-but-unknown-slug'], { allowFailure: true });
  assert.equal(unknown.status, 2);

  const brokenSeed = repo.clone('broken-seed');
  const brokenStatePath = resolve(brokenSeed, 'scripts', 'seo', 'articles', 'publish-state.json');
  const brokenState = readJson(brokenStatePath);
  brokenState['known-but-missing-content'] = { status: 'draft', publishedAt: null };
  writeJson(brokenStatePath, brokenState);
  commitAll(brokenSeed, 'seed known slug without content');
  git(brokenSeed, ['push', '-q', 'origin', 'HEAD:main']);
  const broken = repo.clone('broken');
  const missingContent = node(broken, [
    resolve(broken, 'scripts', 'blog', 'commit-publish.mjs'),
    'known-but-missing-content',
  ], { allowFailure: true });
  assert.equal(missingContent.status, 2);
});
