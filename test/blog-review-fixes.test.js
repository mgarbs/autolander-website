// Second adversarial review (2026-09-27) non-blocking findings, pinned before rollout:
// usage-limit classification on the fallback run, cleanup between the 1M attempt and the 200K
// fallback, a failed OG card never discards a valid draft, request-row Discard never deletes a
// healthy draft, discard refuses drip slugs, and the container-only deny rules fail loudly.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { env as processEnv, execPath } from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { classifyWriterError, runWriter } from '../scripts/blog/run-writer.mjs';
import { canDiscardFromRequest } from '../src/admin/lib/blog-studio.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = resolve(ROOT, 'test', 'fixtures', 'blog', 'valid-post.json');
const FAKE_CLAUDE = resolve(ROOT, 'test', 'fixtures', 'blog', 'fake-claude.mjs');
const FINALIZE = resolve(ROOT, 'scripts', 'blog', 'finalize-draft.mjs');
const DISCARD = resolve(ROOT, 'scripts', 'blog', 'discard-post.mjs');
const SLUG = 'test-fixture-valid-blog-post';
const DRIP_SLUG = 'sell-rvs-on-facebook-marketplace';

const write = (path, contents) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
};
const writeJson = (path, value) => write(path, `${JSON.stringify(value, null, 2)}\n`);
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const git = (root, args) => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
};
const commitAll = (root, message) => {
  git(root, ['add', '.']);
  git(root, ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', message]);
};
const scratch = (t, label) => {
  const root = mkdtempSync(join(tmpdir(), `autolander-blog-fix-${label}-`));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
};
const writerEnv = (extra) => ({
  ...processEnv,
  BLOG_MODEL: 'claude-opus-5-5[1m]',
  BLOG_MODEL_FALLBACK: 'claude-opus-5-5',
  BLOG_EFFORT: 'max',
  BLOG_MAX_TURNS: '80',
  ...extra,
});

test('a usage-limit message on the 200K fallback is classified as usage_limit', () => {
  const message = 'usage limit reached, enable extra usage to continue';
  // The 1M attempt still treats "extra usage" as a reason to try the fallback...
  assert.equal(classifyWriterError(message), 'model_unavailable');
  // ...but on the fallback model the same text is a plain subscription limit.
  assert.equal(classifyWriterError(message, { oneMillion: false }), 'usage_limit');
  assert.equal(classifyWriterError('model is not available', { oneMillion: false }), 'model_unavailable');
});

test('runWriter reports usage_limit when both the 1M attempt and the fallback hit the limit', async (t) => {
  const root = scratch(t, 'usage-extra');
  const contextDir = resolve(root, '.blog-context');
  write(resolve(contextDir, 'task.md'), 'Write scripts/seo/articles/blog/<slug>.json\n');
  write(resolve(contextDir, 'rules.md'), 'rules\n');
  const result = await runWriter({
    claudeCmd: [execPath, FAKE_CLAUDE],
    env: writerEnv({ FAKE_CLAUDE_MODE: 'usage-extra' }),
    contextDir,
  });
  assert.equal(result.ok, false);
  assert.equal(result.model, 'claude-opus-5-5');
  assert.equal(result.errorKind, 'usage_limit');
});

test('the 200K fallback starts from a clean blog directory', async (t) => {
  const root = scratch(t, 'fallback-clean');
  write(resolve(root, 'scripts', 'seo', 'articles', 'blog', '.gitkeep'), '');
  write(resolve(root, '.gitignore'), '.blog-context/\n');
  git(root, ['init', '-q']);
  commitAll(root, 'baseline');
  const contextDir = resolve(root, '.blog-context');
  write(resolve(contextDir, 'task.md'), `Write scripts/seo/articles/blog/${SLUG}.json\n`);
  write(resolve(contextDir, 'rules.md'), 'rules\n');
  writeJson(resolve(contextDir, 'pre-files.json'), []);
  const result = await runWriter({
    claudeCmd: [execPath, FAKE_CLAUDE],
    env: writerEnv({
      FAKE_CLAUDE_MODE: 'nomodel1m',
      FAKE_CLAUDE_1M_ERROR: 'prompt is too long for the 1m context request',
      FAKE_CLAUDE_1M_PARTIAL: 'scripts/seo/articles/blog/half-written-attempt.json',
    }),
    contextDir,
  });
  assert.equal(result.ok, true);
  assert.equal(result.contextWindow, '200k');
  assert.ok(!existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', 'half-written-attempt.json')));
  assert.ok(existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`)));
});

test('an OG card crash skips the card and keeps the valid draft', (t) => {
  const root = scratch(t, 'og-crash');
  write(resolve(root, '.gitignore'), '.blog-context/\n');
  write(resolve(root, 'public', 'sitemap.xml'), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset>',
    ...[
      '/', '/facebook-marketplace-for-car-dealers/', '/facebook-marketplace-auto-poster-pricing/',
      '/dealer-inventory-management/', '/facebook-marketplace-inventory-sync/', '/ai-car-photo-editor/',
      '/guide/how-to-sell-cars-on-facebook-marketplace/', '/facebook-marketplace-auto-poster/',
      '/facebook-marketplace-listing-software/', '/guide/car-dealership-marketing/',
    ].map((path) => `  <url><loc>https://autolander.ai${path}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'));
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'), {
    'facebook-marketplace-car-listing-limits': { status: 'published', publishedAt: '2026-09-01' },
    'how-to-take-pictures-of-a-car-to-sell': { status: 'published', publishedAt: '2026-09-02' },
    'post-a-car-on-facebook-marketplace-dealer': { status: 'published', publishedAt: '2026-09-03' },
  });
  write(resolve(root, 'public', 'data', 'content-status.json'), 'seed content status\n');
  mkdirSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests'), { recursive: true });
  write(resolve(root, 'scripts', 'build-seo-pages.mjs'), [
    "import { writeFileSync } from 'node:fs';",
    "writeFileSync('public/data/content-status.json', 'rebuilt content status\\n');",
    '',
  ].join('\n'));
  write(resolve(root, 'scripts', 'build-og-cards.mjs'), "console.error('Target page, context or browser has been closed'); process.exit(1);\n");
  git(root, ['init', '-q']);
  commitAll(root, 'baseline');
  writeJson(resolve(root, '.blog-context', 'pre-files.json'), []);
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), readJson(FIXTURE));
  const resultPath = resolve(root, '.blog-context', 'result.json');
  writeJson(resultPath, { type: 'result', subtype: 'success', num_turns: 3 });
  writeJson(resolve(root, '.blog-context', 'writer.json'), {
    ok: true, exitCode: 0, model: 'claude-opus-5-5[1m]', contextWindow: '1m', errorKind: null, resultPath,
  });

  const result = spawnSync(execPath, [FINALIZE,
    '--root', root, '--request-id', 'request-og-crash', '--mode', 'new',
    '--writer-result', resolve(root, '.blog-context', 'writer.json'),
  ], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const marker = readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-og-crash.json'));
  assert.equal(marker.status, 'drafted');
  assert.ok(existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`)));
  assert.equal(readJson(resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'))[SLUG].status, 'draft');
});

test('request-row Discard only appears for an orphaned failed draft', () => {
  const articles = [{ slug: 'healthy-draft', kind: 'blog' }];
  const failedRevise = { mode: 'revise', slug: 'healthy-draft', status: 'failed' };
  const orphan = { mode: 'new', slug: 'orphaned-draft', status: 'failed' };
  const attention = { mode: 'new', slug: 'orphaned-draft', status: 'needs_attention' };
  assert.equal(canDiscardFromRequest(failedRevise, { state: 'failed' }, articles), false);
  assert.equal(canDiscardFromRequest(orphan, { state: 'failed' }, articles), true);
  assert.equal(canDiscardFromRequest(attention, { state: 'needs_attention' }, articles), true);
  assert.equal(canDiscardFromRequest({ ...orphan, status: 'drafted' }, { state: 'drafted' }, articles), false);
  assert.equal(canDiscardFromRequest({ mode: 'new', status: 'failed' }, { state: 'failed' }, articles), false);
  const studio = readFileSync(resolve(ROOT, 'src', 'admin', 'BlogStudio.jsx'), 'utf8');
  assert.match(studio, /canDiscardFromRequest\(/);
});

test('discard refuses a drip article slug and leaves publish state untouched', (t) => {
  const root = scratch(t, 'discard-drip');
  const statePath = resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json');
  writeJson(statePath, { [DRIP_SLUG]: { status: 'draft', publishedAt: null } });
  write(resolve(root, 'public', 'data', 'content-status.json'), 'seed\n');
  mkdirSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests'), { recursive: true });
  git(root, ['init', '-q']);
  commitAll(root, 'baseline');
  const before = readFileSync(statePath);
  const result = spawnSync(execPath, [DISCARD, DRIP_SLUG, '--root', root, '--request-id', 'request-drip', '--no-build'], {
    cwd: root, encoding: 'utf8',
  });
  assert.equal(result.status, 2, result.stderr);
  assert.deepEqual(readFileSync(statePath), before);
});

test('writer deny rules also cover the runner temp and GitHub home paths', () => {
  const settings = readJson(resolve(ROOT, 'scripts', 'blog', 'writer-settings.json'));
  assert.ok(settings.permissions.deny.includes('Read(//__w/_temp/**)'));
  assert.ok(settings.permissions.deny.includes('Read(//github/**)'));
});

test('the generate workflow fails loudly unless it runs in the container workspace', () => {
  const yml = readFileSync(resolve(ROOT, '.github', 'workflows', 'generate-blog-post.yml'), 'utf8');
  const preflight = yml.indexOf('GITHUB_WORKSPACE');
  const writer = yml.indexOf('name: Write with Claude');
  assert.ok(preflight > 0 && preflight < writer, 'preflight must run before the writer');
  assert.match(yml, /\/__w\//);
});

// ---- 2026-09-27 first live run: finalize died on `git status` (container runs as root over a
// runner-owned checkout -> "dubious ownership"), and the writer failed in ~4s with no evidence in
// the log because its stderr is private by design.

test('the generate workflow trusts the container workspace for git before any git use', () => {
  const yml = readFileSync(resolve(ROOT, '.github', 'workflows', 'generate-blog-post.yml'), 'utf8');
  const trust = yml.search(/git config --global --add safe\.directory "\$GITHUB_WORKSPACE"/);
  assert.ok(trust > 0, 'safe.directory step missing');
  assert.ok(trust > yml.indexOf('actions/checkout@v4'), 'must run after checkout');
  assert.ok(trust < yml.indexOf('name: Build writer context'), 'must run before prepare-context');
});

test('writer diagnostics are logged safely: outcome, masked stderr head, no request text or tokens', async (t) => {
  const { writerDiagnostics } = await import('../scripts/blog/run-writer.mjs');
  const root = scratch(t, 'diag');
  const contextDir = resolve(root, '.blog-context');
  const prompt = 'Write a playbook about secret-topic-4471 for dealers';
  writeJson(resolve(contextDir, 'request.json'), {
    requestId: 'r1', mode: 'new', slug: '', prompt, keyword: 'kw-9931', feedback: '', originalPrompt: '',
  });
  write(resolve(contextDir, 'writer.stderr'), [
    '\u001b[31mError:\u001b[0m could not start',
    `echoed: ${prompt}`,
    'token sk-ant-oat01-AAAAAAAAAAAAAAAAAAAA and kw-9931',
  ].join('\n'));
  writeJson(resolve(contextDir, 'result.json'), { type: 'result', subtype: 'error_during_execution', is_error: true, result: prompt });
  const lines = writerDiagnostics({
    ok: false, exitCode: 1, model: 'claude-opus-5-5', contextWindow: '200k', errorKind: 'other',
    resultPath: resolve(contextDir, 'result.json'),
  }, { contextDir });
  const text = lines.join('\n');
  assert.match(text, /ok=false exit=1 model=claude-opus-5-5 context=200k errorKind=other/);
  assert.match(text, /subtype=error_during_execution is_error=true/);
  assert.match(text, /could not start/);
  assert.doesNotMatch(text, /secret-topic-4471|kw-9931|sk-ant-oat01/);
  assert.ok(!text.includes('\u001b'), 'ANSI escapes must be stripped');
  assert.ok(text.length < 1200);
  const ok = writerDiagnostics({ ok: true, exitCode: 0, model: 'm', contextWindow: '1m', errorKind: null, resultPath: resolve(contextDir, 'none.json') }, { contextDir });
  assert.equal(ok.length, 1);
});

// Second live run: both attempts failed with "Claude Code 2.1.233 does not support this model;
// version 2.1.280 or newer is required" (Opus 5.5 needs >= 2.1.280). The message sat in the
// result JSON's `result` field, which the diagnostics did not show.

test('the workflow pins a Claude Code version that supports Opus 5.5 (>= 2.1.280)', () => {
  const yml = readFileSync(resolve(ROOT, '.github', 'workflows', 'generate-blog-post.yml'), 'utf8');
  const pin = yml.match(/@anthropic-ai\/claude-code@(\d+)\.(\d+)\.(\d+)/);
  assert.ok(pin, 'Claude Code must be pinned to an exact version');
  const [major, minor, patch] = pin.slice(1).map(Number);
  assert.ok(major > 2 || (major === 2 && (minor > 1 || (minor === 1 && patch >= 280))), `pinned ${pin[0]} is older than 2.1.280`);
});

test('writer diagnostics show the masked error text from an is_error result', async (t) => {
  const { writerDiagnostics } = await import('../scripts/blog/run-writer.mjs');
  const root = scratch(t, 'diag-result');
  const contextDir = resolve(root, '.blog-context');
  writeJson(resolve(contextDir, 'request.json'), { prompt: 'topic-secret-5512 for dealers', keyword: '', feedback: '', originalPrompt: '' });
  writeJson(resolve(contextDir, 'result.json'), {
    type: 'result', subtype: 'success', is_error: true, num_turns: 1,
    result: 'API Error: 400 Claude Code 2.1.233 does not support this model; version 2.1.280 or newer is required. topic-secret-5512',
  });
  const text = writerDiagnostics({
    ok: false, exitCode: 1, model: 'claude-opus-5-5', contextWindow: '200k', errorKind: 'model_unavailable',
    resultPath: resolve(contextDir, 'result.json'),
  }, { contextDir }).join('\n');
  assert.match(text, /does not support this model; version 2\.1\.280 or newer is required/);
  assert.doesNotMatch(text, /topic-secret-5512/);
});
