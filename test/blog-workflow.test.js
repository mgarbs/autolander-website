import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { env as processEnv, execPath } from 'node:process';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GENERATE_WORKFLOW = resolve(ROOT, '.github', 'workflows', 'generate-blog-post.yml');
const PUBLISH_WORKFLOW = resolve(ROOT, '.github', 'workflows', 'publish-article.yml');
const CHECK_INPUTS = resolve(ROOT, 'scripts', 'blog', 'check-inputs.mjs');
const POST_PUBLISH = resolve(ROOT, 'scripts', 'blog', 'post-publish.mjs');
const PUBLISH_ARTICLE = resolve(ROOT, 'scripts', 'publish-article.mjs');
const VALID_POST = resolve(ROOT, 'test', 'fixtures', 'blog', 'valid-post.json');
const REQUEST_ID = '550e8400-e29b-41d4-a716-446655440000';
const ORIGIN = 'https://autolander.ai';

const read = (path) => readFileSync(path, 'utf8');

function scratchRoot(t, label) {
  const root = mkdtempSync(join(tmpdir(), `autolander-blog-${label}-`));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

// This deliberately parses only YAML run scalars. It handles the plain, literal, and
// folded forms used by Actions, while leaving expressions in env/run-name fields alone.
function runBlocks(yaml) {
  const lines = yaml.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(\s*)run:\s*(?:(\|[-+]?|>[-+]?)\s*)?(.*)$/);
    if (!match) continue;
    const indent = match[1].length;
    const style = match[2] || '';
    const inline = match[3] || '';
    if (!style && inline.trim()) {
      blocks.push({ line: index + 1, body: inline.trim() });
      continue;
    }
    const body = [];
    let cursor = index + 1;
    for (; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      if (!line.trim()) {
        body.push('');
        continue;
      }
      const lineIndent = line.match(/^\s*/)[0].length;
      if (lineIndent <= indent) break;
      body.push(line.slice(Math.min(line.length, indent + 2)));
    }
    blocks.push({ line: index + 1, body: body.join('\n') });
    index = cursor - 1;
  }
  return blocks;
}

function gitAddLists(yaml) {
  return runBlocks(yaml).flatMap(({ body }) => body.split('\n').flatMap((line) => {
    const match = line.match(/^\s*git\s+add\s+(.+?)\s*$/);
    return match ? [match[1].trim().split(/\s+/)] : [];
  }));
}

function assertNoInputExpressionsInRun(yaml, filename) {
  const blocks = runBlocks(yaml);
  assert.ok(blocks.length > 0, `${filename} should contain run blocks`);
  for (const { line, body } of blocks) {
    assert.doesNotMatch(
      body,
      /\$\{\{\s*inputs\./,
      `${filename}:${line} must receive workflow inputs through env, not interpolate them in shell`,
    );
  }
}

function assertOrdered(source, needles) {
  let previous = -1;
  for (const needle of needles) {
    const position = source.indexOf(needle);
    assert.ok(position >= 0, `missing workflow step marker: ${needle}`);
    assert.ok(position > previous, `workflow marker is out of order: ${needle}`);
    previous = position;
  }
}

function probeSideEffectFreeImport(path) {
  const url = pathToFileURL(path).href;
  const env = { ...processEnv };
  for (const key of ['BLOG_MODE', 'BLOG_SLUG', 'BLOG_REQUEST_ID', 'GITHUB_STEP_SUMMARY']) delete env[key];
  const result = spawnSync(
    execPath,
    ['--input-type=module', '--eval', `await import(${JSON.stringify(url)})`],
    { cwd: ROOT, encoding: 'utf8', env },
  );
  assert.equal(result.status, 0, result.stderr || `import exited ${result.status}`);
  assert.equal(result.stdout, '', 'importing a pure API must not write to stdout');
  assert.equal(result.stderr, '', 'importing a pure API must not write to stderr');
}

async function importFresh(path) {
  const url = pathToFileURL(path);
  url.searchParams.set('test', `${Date.now()}-${Math.random()}`);
  return import(url.href);
}

async function loadPostPublishApi() {
  probeSideEffectFreeImport(POST_PUBLISH);
  const api = await importFresh(POST_PUBLISH);
  assert.equal(typeof api.postPublish, 'function', 'post-publish.mjs must export postPublish');
  return api.postPublish;
}

async function loadPublishApi() {
  const source = read(PUBLISH_ARTICLE);
  assert.match(source, /\bassertPublishable\b/, 'publish-article.mjs must export assertPublishable');
  assert.match(source, /\bchangedUrlsFor\b/, 'publish-article.mjs must export changedUrlsFor');
  probeSideEffectFreeImport(PUBLISH_ARTICLE);
  const api = await importFresh(PUBLISH_ARTICLE);
  assert.equal(typeof api.assertPublishable, 'function');
  assert.equal(typeof api.changedUrlsFor, 'function');
  return api;
}

const response = (status, body = '') => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => body,
});

test('generate workflow constrains concurrency, credentials, shell inputs, and commit paths', () => {
  const yaml = read(GENERATE_WORKFLOW);
  assert.match(yaml, /concurrency:\s*\n\s+group:\s*blog-generate\s*\n\s+cancel-in-progress:\s*false\b/);
  assert.match(yaml, /permissions:\s*\n\s+contents:\s*write\b/);
  assert.match(yaml, /CLAUDE_CODE_OAUTH_TOKEN:\s*\$\{\{\s*secrets\.CLAUDE_CODE_OAUTH_TOKEN\s*\}\}/);
  assert.doesNotMatch(yaml, /ANTHROPIC_(?:API_KEY|AUTH_TOKEN)/);
  assertNoInputExpressionsInRun(yaml, 'generate-blog-post.yml');
  assert.match(yaml, /- name: Validate inputs\s*\n\s+id: input_check\b/);
  assert.match(yaml, /if: always\(\) && steps\.input_check\.outcome == 'success' && inputs\.mode != 'discard'/);
  assert.match(yaml, /if: always\(\) && steps\.input_check\.outcome == 'success' && \(steps\.discard\.outcome/);
  assert.match(yaml, /node scripts\/blog\/commit-draft\.mjs/);
  assert.doesNotMatch(yaml, /git pull --rebase|git push origin main|--assert-parent-draft/);

  const addLists = gitAddLists(yaml);
  assert.equal(addLists.length, 0, 'commit-draft.mjs owns the exact staging allowlist');
});

test('publish workflow passes inputs through env and verifies blog publishes after IndexNow', () => {
  const yaml = read(PUBLISH_WORKFLOW);
  assertNoInputExpressionsInRun(yaml, 'publish-article.yml');
  const addLists = gitAddLists(yaml);
  assert.equal(addLists.length, 0, 'commit-publish.mjs owns the publish staging allowlist');
  assert.match(yaml, /node scripts\/blog\/commit-publish\.mjs "\$ARTICLE_SLUG"/);
  assert.doesNotMatch(yaml, /git pull --rebase|git push origin main/);
  assertOrdered(yaml, [
    'Publish from latest main and commit',
    'Build site',
    'actions/deploy-pages@v4',
    'Ping IndexNow with the changed URLs',
    'WebSub ping + live verification (blog posts)',
    'node scripts/blog/post-publish.mjs',
  ]);
});

test('checkInputs validates dispatch fields and the pre-push draft-state guard', async () => {
  probeSideEffectFreeImport(CHECK_INPUTS);
  const { assertMutableDraft, checkInputs } = await importFresh(CHECK_INPUTS);
  assert.equal(typeof checkInputs, 'function');
  assert.equal(typeof assertMutableDraft, 'function');

  assert.doesNotThrow(() => checkInputs({ requestId: REQUEST_ID, mode: 'new', slug: '' }));
  assert.doesNotThrow(() => checkInputs({ requestId: REQUEST_ID, mode: 'revise', slug: 'valid-blog-post' }));
  assert.doesNotThrow(() => checkInputs({ requestId: REQUEST_ID, mode: 'discard', slug: 'valid-blog-post' }));
  assert.throws(
    () => checkInputs({ requestId: 'not-a-uuid', mode: 'new', slug: '' }),
    /request.?id|uuid/i,
  );
  assert.throws(
    () => checkInputs({ requestId: REQUEST_ID, mode: 'publish', slug: '' }),
    /mode/i,
  );
  assert.throws(
    () => checkInputs({ requestId: REQUEST_ID, mode: 'revise', slug: '' }),
    /slug/i,
  );
  assert.throws(
    () => checkInputs({ requestId: REQUEST_ID, mode: 'discard', slug: 'bad slug; echo owned' }),
    /slug/i,
  );

  const draftState = { 'valid-blog-post': { status: 'draft', publishedAt: null } };
  const publishedState = { 'valid-blog-post': { status: 'published', publishedAt: '2026-09-27' } };
  assert.doesNotThrow(() => assertMutableDraft({ mode: 'revise', slug: 'valid-blog-post', state: draftState }));
  assert.doesNotThrow(() => assertMutableDraft({ mode: 'discard', slug: 'valid-blog-post', state: draftState }));
  assert.doesNotThrow(() => assertMutableDraft({ mode: 'new', slug: '', state: publishedState }));
  assert.throws(
    () => assertMutableDraft({ mode: 'revise', slug: 'valid-blog-post', state: publishedState }),
    /draft|published|state/i,
  );
  assert.throws(
    () => assertMutableDraft({ mode: 'discard', slug: 'valid-blog-post', state: {} }),
    /draft|state/i,
  );
});

test('postPublish pings WebSub and verifies the live post, sitemap, and RSS feed', async (t) => {
  const postPublish = await loadPostPublishApi();
  const root = scratchRoot(t, 'post-publish-success');
  const slug = 'verified-blog-post';
  const postUrl = `${ORIGIN}/blog/${slug}/`;
  const summaryPath = resolve(root, 'step-summary.md');
  writeFileSync(resolve(root, '.last-publish.json'), `${JSON.stringify({
    slug, kind: 'blog', publishedAt: '2026-09-27', urls: [postUrl],
  }, null, 2)}\n`);
  const calls = [];
  const fetchImpl = async (input, init = {}) => {
    const url = String(input?.url || input);
    calls.push({ url, init });
    if (url === 'https://pubsubhubbub.appspot.com/') return response(204);
    if (url === postUrl) return response(200, `<html><head><link rel="canonical" href="${postUrl}" /></head></html>`);
    if (url === `${ORIGIN}/sitemap.xml`) return response(200, `<loc>${postUrl}</loc>`);
    if (url === `${ORIGIN}/blog/feed.xml`) return response(200, `<link>${postUrl}</link>`);
    return response(500, 'unexpected URL');
  };
  const sleeps = [];

  await postPublish({
    root,
    fetchImpl,
    sleep: async (milliseconds) => { sleeps.push(milliseconds); },
    summaryPath,
  });

  assert.deepEqual(calls.map(({ url }) => url), [
    'https://pubsubhubbub.appspot.com/',
    postUrl,
    `${ORIGIN}/sitemap.xml`,
    `${ORIGIN}/blog/feed.xml`,
  ]);
  assert.equal(calls[0].init.method, 'POST');
  assert.match(String(calls[0].init.headers?.['content-type'] || calls[0].init.headers?.['Content-Type']), /application\/x-www-form-urlencoded/i);
  assert.equal(
    String(calls[0].init.body),
    'hub.mode=publish&hub.url=https%3A%2F%2Fautolander.ai%2Fblog%2Ffeed.xml',
  );
  assert.deepEqual(sleeps, []);
  const summary = read(summaryPath);
  assert.match(summary, /\|[^|\n]*WebSub[^|\n]*\|/i);
  assert.match(summary, /\|[^|\n]*Live post[^|\n]*\|/i);
  assert.match(summary, /\|[^|\n]*Sitemap[^|\n]*\|/i);
  assert.match(summary, /\|[^|\n]*(?:RSS|feed)[^|\n]*\|/i);
  assert.match(summary, new RegExp(postUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('postPublish fails after persistent live-post 404 responses without real waiting', async (t) => {
  const postPublish = await loadPostPublishApi();
  const root = scratchRoot(t, 'post-publish-404');
  const slug = 'missing-blog-post';
  const postUrl = `${ORIGIN}/blog/${slug}/`;
  const summaryPath = resolve(root, 'step-summary.md');
  writeFileSync(resolve(root, '.last-publish.json'), `${JSON.stringify({
    slug, kind: 'blog', publishedAt: '2026-09-27', urls: [postUrl],
  }, null, 2)}\n`);
  const calls = [];
  const sleeps = [];
  const fetchImpl = async (input) => {
    const url = String(input?.url || input);
    calls.push(url);
    if (url === 'https://pubsubhubbub.appspot.com/') return response(204);
    if (url === postUrl) return response(404, 'not found');
    return response(500, 'verification should stop before this URL');
  };

  await assert.rejects(
    postPublish({
      root,
      fetchImpl,
      sleep: async (milliseconds) => { sleeps.push(milliseconds); },
      summaryPath,
    }),
    /404|live|verification|canonical/i,
  );
  assert.ok(calls.filter((url) => url === postUrl).length > 1, 'live URL should be polled');
  assert.ok(sleeps.length > 0, '404 polling should use the injected sleep');
  assert.ok(sleeps.every((milliseconds) => milliseconds === 15_000));
  assert.ok(sleeps.reduce((sum, milliseconds) => sum + milliseconds, 0) <= 5 * 60_000);
});

test('postPublish bounds a live-page fetch that never settles', { timeout: 1_000 }, async (t) => {
  const postPublish = await loadPostPublishApi();
  const root = scratchRoot(t, 'post-publish-timeout');
  const slug = 'stalled-blog-post';
  const postUrl = `${ORIGIN}/blog/${slug}/`;
  writeFileSync(resolve(root, '.last-publish.json'), `${JSON.stringify({
    slug, kind: 'blog', publishedAt: '2026-09-27', urls: [postUrl],
  }, null, 2)}\n`);
  let liveCalls = 0;
  const fetchImpl = async (input) => {
    const url = String(input?.url || input);
    if (url === 'https://pubsubhubbub.appspot.com/') return response(204);
    if (url === postUrl) {
      liveCalls += 1;
      return new Promise(() => {});
    }
    return response(500);
  };

  await assert.rejects(postPublish({
    root,
    fetchImpl,
    sleep: async () => {},
    pollIntervalMs: 10,
    pollTimeoutMs: 25,
    requestTimeoutMs: 10,
    summaryPath: '',
  }), /live|verification|canonical/i);
  assert.ok(liveCalls >= 1);
});

test('postPublish is a no-op for a non-blog publish', async (t) => {
  const postPublish = await loadPostPublishApi();
  const root = scratchRoot(t, 'post-publish-nonblog');
  const summaryPath = resolve(root, 'step-summary.md');
  writeFileSync(resolve(root, '.last-publish.json'), `${JSON.stringify({
    slug: 'ordinary-guide', kind: 'drip', publishedAt: '2026-09-27', urls: [`${ORIGIN}/guide/ordinary-guide/`],
  }, null, 2)}\n`);
  writeFileSync(summaryPath, 'untouched\n');
  let fetches = 0;
  let sleeps = 0;

  await postPublish({
    root,
    fetchImpl: async () => { fetches += 1; return response(500); },
    sleep: async () => { sleeps += 1; },
    summaryPath,
  });

  assert.equal(fetches, 0);
  assert.equal(sleeps, 0);
  assert.equal(read(summaryPath), 'untouched\n');
});

test('assertPublishable rejects an invalid blog draft with authoritative validator errors', async () => {
  const { assertPublishable } = await loadPublishApi();
  const valid = JSON.parse(read(VALID_POST));
  assert.doesNotThrow(() => assertPublishable(valid, { root: ROOT }));
  const invalid = structuredClone(valid);
  invalid.description = 'Too short.';
  assert.throws(
    () => assertPublishable(invalid, { root: ROOT }),
    /description.*140|140.*description/i,
  );
});

test('changedUrlsFor includes blog surfaces and the silo-aware compare inbound target', async () => {
  const { changedUrlsFor } = await loadPublishApi();
  const post = {
    slug: 'workflow-url-fixture',
    silo: 'blog',
    augmentKeys: [],
    alsoOnCompetitors: [],
    inboundFrom: ['compare-inbound-fixture'],
  };
  const compare = { slug: 'compare-inbound-fixture', silo: 'compare' };
  const state = {
    [post.slug]: { status: 'published', publishedAt: '2026-09-27' },
    [compare.slug]: { status: 'published', publishedAt: '2026-09-20' },
  };
  const urls = new Set(changedUrlsFor(post, [post, compare], state));

  assert.ok(urls.has(`${ORIGIN}/blog/${post.slug}/`));
  assert.ok(urls.has(`${ORIGIN}/blog/`));
  assert.ok(urls.has(`${ORIGIN}/blog/feed.xml`));
  assert.ok(urls.has(`${ORIGIN}/compare/${compare.slug}/`));
  assert.ok(urls.has(`${ORIGIN}/`));
  assert.ok(!urls.has(`${ORIGIN}/guide/${compare.slug}/`));
});
