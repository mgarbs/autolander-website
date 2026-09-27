import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { env as processEnv, execPath } from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { buildClaudeArgs, classifyWriterError, runWriter } from '../scripts/blog/run-writer.mjs';
import { publishArticle } from '../scripts/publish-article.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = resolve(ROOT, 'test', 'fixtures', 'blog', 'valid-post.json');
const FAKE_CLAUDE = resolve(ROOT, 'test', 'fixtures', 'blog', 'fake-claude.mjs');
const PREPARE = resolve(ROOT, 'scripts', 'blog', 'prepare-context.mjs');
const FINALIZE = resolve(ROOT, 'scripts', 'blog', 'finalize-draft.mjs');
const DISCARD = resolve(ROOT, 'scripts', 'blog', 'discard-post.mjs');
const WRITER_SETTINGS = resolve(ROOT, 'scripts', 'blog', 'writer-settings.json');
const WRITER_RULES = resolve(ROOT, 'scripts', 'blog', 'writer-rules.md');
const SLUG = 'test-fixture-valid-blog-post';
const SECRET = 'private prompt marker 74d03a';
const ALLOWED_TOOLS = 'Read,Glob,Grep,Edit(scripts/seo/articles/blog/**),Bash(node scripts/blog/validate-post.mjs *)';

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const write = (path, contents) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
};
const writeJson = (path, value) => write(path, json(value));
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const scratchRoot = (t, label) => {
  const root = mkdtempSync(join(tmpdir(), `autolander-blog-${label}-`));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
};
const runNode = (script, args, options = {}) => spawnSync(execPath, [script, ...args], {
  cwd: options.cwd || ROOT,
  encoding: 'utf8',
  env: { ...processEnv, ...options.env },
});
const git = (root, args) => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
};

const livePaths = [
  '/',
  '/facebook-marketplace-for-car-dealers/',
  '/facebook-marketplace-auto-poster-pricing/',
  '/dealer-inventory-management/',
  '/facebook-marketplace-inventory-sync/',
  '/ai-car-photo-editor/',
  '/guide/how-to-sell-cars-on-facebook-marketplace/',
  '/facebook-marketplace-auto-poster/',
  '/facebook-marketplace-listing-software/',
  '/guide/car-dealership-marketing/',
];

const publishedState = () => ({
  'facebook-marketplace-car-listing-limits': { status: 'published', publishedAt: '2026-09-01' },
  'how-to-take-pictures-of-a-car-to-sell': { status: 'published', publishedAt: '2026-09-02' },
  'post-a-car-on-facebook-marketplace-dealer': { status: 'published', publishedAt: '2026-09-03' },
});

function seedRoot(t, label, { post = null, state = publishedState(), preview = false, og = false } = {}) {
  const root = scratchRoot(t, label);
  write(resolve(root, '.gitignore'), '.blog-context/\n');
  write(resolve(root, 'public', 'sitemap.xml'), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset>',
    ...livePaths.map((path) => `  <url><loc>https://autolander.ai${path}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'));
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'), state);
  write(resolve(root, 'public', 'data', 'content-status.json'), 'seed content status\n');
  mkdirSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests'), { recursive: true });
  if (post) writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${post.slug}.json`), post);
  if (preview) write(resolve(root, 'previews', 'blog', `${SLUG}.html`), 'old preview\n');
  if (og) {
    write(resolve(root, 'public', 'og', `blog-${SLUG}.png`), 'fake png');
    writeJson(resolve(root, 'public', 'og', 'manifest.json'), { [`/blog/${SLUG}/`]: `/og/blog-${SLUG}.png` });
  }
  git(root, ['init', '-q']);
  git(root, ['add', '.']);
  git(root, ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'baseline']);
  return root;
}

function seedWriterResult(root, overrides = {}) {
  const context = resolve(root, '.blog-context');
  mkdirSync(context, { recursive: true });
  const resultPath = resolve(context, 'result.json');
  writeJson(resultPath, {
    type: 'result', subtype: 'success', num_turns: 3, duration_ms: 1000,
    total_cost_usd: 0, usage: { input_tokens: 20, output_tokens: 10 },
  });
  const wrapper = {
    ok: true,
    exitCode: 0,
    model: 'claude-opus-5-5[1m]',
    contextWindow: '1m',
    errorKind: null,
    resultPath,
    ...overrides,
  };
  const wrapperPath = resolve(context, 'writer.json');
  writeJson(wrapperPath, wrapper);
  return wrapperPath;
}

function manifestBefore(root, paths = []) {
  writeJson(resolve(root, '.blog-context', 'pre-files.json'), paths);
}

function allTextFiles(root, { excludeContext = false } = {}) {
  const values = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === '.git' || (excludeContext && entry.name === '.blog-context')) continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (!entry.name.endsWith('.png')) values.push(readFileSync(path, 'utf8'));
    }
  };
  visit(root);
  return values.join('\n');
}

test('buildClaudeArgs uses verified constrained Claude Code flags', () => {
  const args = buildClaudeArgs({
    model: 'claude-opus-5-5[1m]', effort: 'max', maxTurns: 80,
    taskText: SECRET, rulesPath: '.blog-context/rules.md', settingsPath: '.blog-context/settings.json',
  });
  assert.deepEqual(args, [
    '-p', SECRET,
    '--model', 'claude-opus-5-5[1m]',
    '--effort', 'max',
    '--max-turns', '80',
    '--output-format', 'json',
    '--permission-mode', 'dontAsk',
    '--append-system-prompt-file', '.blog-context/rules.md',
    '--settings', '.blog-context/settings.json',
    '--allowedTools', ALLOWED_TOOLS,
    '--disallowedTools', 'WebFetch,WebSearch',
  ]);
  assert.ok(!args.includes('--dangerously-skip-permissions'));
  assert.ok(!args.join(' ').includes('Write(scripts/seo/articles/blog/**)'));
});

test('writer settings deny sensitive host and private request paths', () => {
  assert.deepEqual(readJson(WRITER_SETTINGS), {
    permissions: {
      blockReadsOutsideWorkingDirectories: true,
      deny: [
        'Read(//proc/**)',
        'Read(//etc/**)',
        'Read(//home/**)',
        'Read(//root/**)',
        'Read(~/**)',
        'Read(.git/**)',
        'Read(//tmp/**)',
        'Read(//__w/_temp/**)',
        'Read(//github/**)',
        'Read(.blog-context/request.json)',
      ],
    },
  });
});

test('classifyWriterError recognizes safe operational categories', () => {
  assert.equal(classifyWriterError('Claude usage limit reached'), 'usage_limit');
  assert.equal(classifyWriterError('OAuth token has expired'), 'auth');
  assert.equal(classifyWriterError('model is not available'), 'model_unavailable');
  for (const message of [
    'context length exceeded',
    'context window is unavailable',
    'prompt is too long',
    'extra usage is required',
    'usage credits are required',
    '1m context requires an account upgrade',
    'usage limit reached, enable extra usage to continue',
  ]) assert.equal(classifyWriterError(message), 'model_unavailable', message);
  assert.equal(classifyWriterError('unexpected process failure'), 'other');
});

test('runWriter captures output privately and reports a 1m success', async (t) => {
  const root = scratchRoot(t, 'writer-ok');
  const contextDir = resolve(root, '.blog-context');
  mkdirSync(contextDir, { recursive: true });
  write(resolve(contextDir, 'task.md'), `${SECRET}\nWrite scripts/seo/articles/blog/<slug>.json\n`);
  write(resolve(contextDir, 'rules.md'), 'rules\n');
  const result = await runWriter({
    claudeCmd: [execPath, FAKE_CLAUDE],
    env: {
      ...processEnv,
      FAKE_CLAUDE_MODE: 'ok',
      BLOG_MODEL: 'claude-opus-5-5[1m]',
      BLOG_MODEL_FALLBACK: 'claude-opus-5-5',
      BLOG_EFFORT: 'max',
      BLOG_MAX_TURNS: '80',
    },
    contextDir,
  });
  assert.equal(result.ok, true);
  assert.equal(result.contextWindow, '1m');
  assert.equal(result.model, 'claude-opus-5-5[1m]');
  assert.equal(JSON.parse(readFileSync(result.resultPath, 'utf8')).num_turns, 3);
  assert.ok(!readFileSync(resolve(contextDir, 'writer.stderr'), 'utf8').includes(SECRET));
  assert.ok(existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`)));
});

test('runWriter retries unavailable 1m context once with the fallback model', async (t) => {
  const root = scratchRoot(t, 'writer-fallback');
  const contextDir = resolve(root, '.blog-context');
  mkdirSync(contextDir, { recursive: true });
  write(resolve(contextDir, 'task.md'), 'Write scripts/seo/articles/blog/<slug>.json\n');
  write(resolve(contextDir, 'rules.md'), 'rules\n');
  const taskLog = resolve(contextDir, 'attempts.ndjson');
  const result = await runWriter({
    claudeCmd: [execPath, FAKE_CLAUDE],
    env: {
      ...processEnv,
      FAKE_CLAUDE_MODE: 'nomodel1m',
      FAKE_CLAUDE_1M_ERROR: 'prompt is too long for the 1m context request',
      FAKE_CLAUDE_TASK_LOG: taskLog,
      BLOG_MODEL: 'claude-opus-5-5[1m]',
      BLOG_MODEL_FALLBACK: 'claude-opus-5-5',
      BLOG_EFFORT: 'max',
      BLOG_MAX_TURNS: '80',
    },
    contextDir,
  });
  assert.equal(result.ok, true);
  assert.equal(result.model, 'claude-opus-5-5');
  assert.equal(result.contextWindow, '200k');
  const attempts = readFileSync(taskLog, 'utf8').trim().split(/\r?\n/)
    .map((line) => JSON.parse(line));
  assert.equal(attempts.length, 2);
  assert.equal(attempts[0].model, 'claude-opus-5-5[1m]');
  assert.doesNotMatch(attempts[0].taskText, /200K fallback context mode/);
  assert.equal(attempts[1].model, 'claude-opus-5-5');
  assert.match(attempts[1].taskText, /200K fallback context mode/);
  assert.match(attempts[1].taskText, /Read `\.blog-context\/site-index\.md` completely/);
  assert.match(attempts[1].taskText, /Never read `\.blog-context\/site-full\.md` as a whole/);
  assert.match(attempts[1].taskText, /Grep.*`URL:` header/i);
  assert.match(attempts[1].taskText, /Read with offset and limit/i);
  assert.match(attempts[1].taskText, /every page you link/i);
  assert.equal(readFileSync(resolve(contextDir, 'task.md'), 'utf8'), 'Write scripts/seo/articles/blog/<slug>.json\n');
});

test('writer rules reserve the complete site-full read for 1M mode', () => {
  const rules = readFileSync(WRITER_RULES, 'utf8');
  assert.match(rules, /1M context mode[\s\S]*site-full\.md` completely/i);
  assert.match(rules, /200K fallback[\s\S]*overrides this instruction/i);
});

test('runWriter classifies usage and authentication failures', async (t) => {
  for (const [mode, expected] of [['usage', 'usage_limit'], ['auth', 'auth']]) {
    const root = scratchRoot(t, `writer-${mode}`);
    const contextDir = resolve(root, '.blog-context');
    mkdirSync(contextDir, { recursive: true });
    write(resolve(contextDir, 'task.md'), 'task\n');
    write(resolve(contextDir, 'rules.md'), 'rules\n');
    const result = await runWriter({
      claudeCmd: [execPath, FAKE_CLAUDE],
      env: {
        ...processEnv,
        FAKE_CLAUDE_MODE: mode,
        BLOG_MODEL: 'claude-opus-5-5[1m]',
        BLOG_MODEL_FALLBACK: 'claude-opus-5-5',
        BLOG_EFFORT: 'max',
        BLOG_MAX_TURNS: '80',
      },
      contextDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.errorKind, expected);
  }
});

test('prepare-context builds the private writer packet without logging its request', (t) => {
  const root = scratchRoot(t, 'prepare');
  const context = resolve(root, '.blog-context');
  writeJson(resolve(context, 'request.json'), {
    requestId: 'prepare-1', mode: 'new', slug: '', prompt: SECRET,
    keyword: 'dealer workflow', feedback: '', originalPrompt: '',
  });
  write(resolve(root, 'public', 'llms-full.txt'), '# Existing shell corpus\nSource: https://autolander.ai/from-llms/  \n');
  write(resolve(root, 'public', 'index.md'), '# Homepage corpus\nSource: https://autolander.ai/  \n');
  write(resolve(root, 'public', 'sitemap.xml'), '<urlset><url><loc>https://autolander.ai/compare/sample/</loc></url></urlset>\n');
  write(resolve(root, 'public', 'compare', 'sample', 'index.html'), [
    '<!doctype html><html><head><title>Sample comparison</title>',
    '<meta name="description" content="A useful sample page.">',
    '<link rel="canonical" href="https://autolander.ai/compare/sample/"></head>',
    '<body><header>Skip header</header><main><h1>Sample H1</h1><h2>Useful details</h2>',
    `<p>${'Visible comparison text. '.repeat(20)}</p>`,
    '<script>secretScript()</script></main><footer>Skip footer</footer></body></html>',
  ].join(''));
  const result = runNode(PREPARE, ['--root', root, '--out', '.blog-context', '--mode', 'new', '--no-build'], { cwd: root });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!result.stdout.includes(SECRET));
  for (const name of [
    'site-full.md', 'site-index.md', 'live-urls.json', 'nav-keys.json', 'competitors.json',
    'articles.json', 'images.json', 'keywords.json', 'post-schema.json', 'rules.md',
    'settings.json', 'task.md', 'pre-files.json',
  ]) assert.ok(existsSync(resolve(context, name)), name);
  assert.deepEqual(readJson(resolve(context, 'settings.json')), readJson(WRITER_SETTINGS));
  assert.match(readFileSync(resolve(context, 'task.md'), 'utf8'), /DONE <slug>/);
  assert.match(readFileSync(resolve(context, 'task.md'), 'utf8'), new RegExp(SECRET));
  const siteFull = readFileSync(resolve(context, 'site-full.md'), 'utf8');
  assert.match(siteFull, /^URL: https:\/\/autolander\.ai\/from-llms\/$/m);
  assert.match(siteFull, /^URL: https:\/\/autolander\.ai\/$/m);
  assert.match(siteFull, /^URL: https:\/\/autolander\.ai\/compare\/sample\/$/m);
  assert.doesNotMatch(siteFull, /^Source:\s*https?:\/\//m);
  assert.match(siteFull, /Visible comparison text/);
  assert.ok(Math.max(...siteFull.split(/\r?\n/).map((line) => line.length)) <= 160);
  assert.ok(!siteFull.includes('secretScript'));
  assert.ok(!siteFull.includes('Skip header'));
  const siteIndexText = readFileSync(resolve(context, 'site-index.md'), 'utf8');
  const indexedUrls = [...siteIndexText.matchAll(/^URL:\s*(https?:\/\/\S+)\s*$/gm)]
    .map((match) => match[1]);
  for (const url of indexedUrls) {
    const fullHeaders = [...siteFull.matchAll(/^URL:\s*(https?:\/\/\S+)\s*$/gm)]
      .filter((match) => match[1] === url);
    assert.equal(fullHeaders.length, 1, `${url} must map to exactly one full-context section`);
  }
});

test('finalize-draft stamps a valid new draft and keeps request plaintext out of outputs', (t) => {
  const root = seedRoot(t, 'finalize-new');
  const post = readJson(FIXTURE);
  post.meta = { prompt: SECRET, model: 'model-written metadata' };
  post.prompt = SECRET;
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), post);
  manifestBefore(root);
  const writerResult = seedWriterResult(root);
  const result = runNode(FINALIZE, [
    '--root', root, '--no-build', '--request-id', 'request-new', '--mode', 'new',
    '--writer-result', writerResult,
  ], { cwd: root });
  assert.equal(result.status, 0, result.stderr);

  const finalized = readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`));
  assert.equal(finalized.meta.requestId, 'request-new');
  assert.equal(finalized.meta.mode, 'new');
  assert.equal(finalized.meta.model, 'claude-opus-5-5[1m]');
  assert.equal(finalized.meta.contextWindow, '1m');
  assert.equal(finalized.meta.revisionCount, 0);
  assert.equal(finalized.meta.validation.ok, true);
  assert.ok(!Object.hasOwn(finalized, 'prompt'));
  assert.deepEqual(finalized.meta.usage, {
    num_turns: 3, duration_ms: 1000, total_cost_usd: 0,
    usage: { input_tokens: 20, output_tokens: 10 },
  });
  assert.deepEqual(readJson(resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'))[SLUG], {
    status: 'draft', publishedAt: null,
  });
  assert.equal(readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-new.json')).status, 'drafted');
  const preview = readFileSync(resolve(root, 'previews', 'blog', `${SLUG}.html`), 'utf8');
  assert.match(preview, /<base href="https:\/\/autolander\.ai\/">/);
  assert.match(preview, /<meta name="robots" content="noindex">/);
  assert.ok(!allTextFiles(root).includes(SECRET));
});

test('finalize-draft records validation and no-output outcomes', (t) => {
  const invalidRoot = seedRoot(t, 'finalize-invalid');
  const invalid = readJson(FIXTURE);
  invalid.description = 'too short';
  invalid.primaryKeyword = 'car dealership photography tips';
  invalid.title = 'Car Dealership Photography Tips for a Better Workflow';
  writeJson(resolve(invalidRoot, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), invalid);
  manifestBefore(invalidRoot);
  const invalidResult = runNode(FINALIZE, [
    '--root', invalidRoot, '--no-build', '--request-id', 'request-invalid', '--mode', 'new',
    '--writer-result', seedWriterResult(invalidRoot),
  ], { cwd: invalidRoot });
  assert.equal(invalidResult.status, 0, invalidResult.stderr);
  const invalidMarker = readJson(resolve(invalidRoot, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-invalid.json'));
  assert.equal(invalidMarker.status, 'needs_attention');
  assert.equal(invalidMarker.errorKind, 'validation');
  const invalidErrors = readJson(
    resolve(invalidRoot, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`),
  ).meta.validation.errors;
  assert.ok(invalidErrors.some((error) => error.includes('cannibalizes existing page')));

  const emptyRoot = seedRoot(t, 'finalize-empty');
  manifestBefore(emptyRoot);
  const emptyResult = runNode(FINALIZE, [
    '--root', emptyRoot, '--no-build', '--request-id', 'request-empty', '--mode', 'new',
    '--writer-result', seedWriterResult(emptyRoot),
  ], { cwd: emptyRoot });
  assert.equal(emptyResult.status, 0, emptyResult.stderr);
  const emptyMarker = readJson(resolve(emptyRoot, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-empty.json'));
  assert.equal(emptyMarker.status, 'failed');
  assert.equal(emptyMarker.errorKind, 'no_output');
});

test('finalize-draft fails and rolls back all three renderer-breaking reviewer repros', (t) => {
  const cases = [
    {
      label: 'filename-mismatch',
      mode: 'new',
      requestedSlug: '',
      fileSlug: 'different-file-name',
      mutate: () => {},
    },
    {
      label: 'malformed-table-row',
      mode: 'new',
      requestedSlug: '',
      fileSlug: SLUG,
      mutate: (post) => {
        post.sections[0] = { type: 'table', h2: 'Unsafe table', head: ['A'], rows: ['not-an-array'] };
      },
    },
    {
      label: 'revise-changed-slug',
      mode: 'revise',
      requestedSlug: SLUG,
      fileSlug: SLUG,
      mutate: (post) => { post.slug = 'writer-changed-the-slug'; },
    },
  ];

  for (const repro of cases) {
    const original = readJson(FIXTURE);
    const state = repro.mode === 'revise'
      ? { ...publishedState(), [SLUG]: { status: 'draft', publishedAt: null } }
      : publishedState();
    const root = seedRoot(t, `repro-${repro.label}`, {
      post: repro.mode === 'revise' ? original : null,
      state,
    });
    const originalPostPath = resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`);
    const originalPostBytes = repro.mode === 'revise' ? readFileSync(originalPostPath) : null;
    const statePath = resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json');
    const contentStatusPath = resolve(root, 'public', 'data', 'content-status.json');
    const stateBytes = readFileSync(statePath);
    const contentStatusBytes = readFileSync(contentStatusPath);
    manifestBefore(root, repro.mode === 'revise' ? [`scripts/seo/articles/blog/${SLUG}.json`] : []);
    if (repro.mode === 'revise') writeJson(resolve(root, '.blog-context', 'existing-post.json'), original);
    const written = readJson(FIXTURE);
    repro.mutate(written);
    writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${repro.fileSlug}.json`), written);

    const args = [
      '--root', root, '--no-build', '--request-id', `request-${repro.label}`, '--mode', repro.mode,
      '--writer-result', seedWriterResult(root),
    ];
    if (repro.requestedSlug) args.push('--slug', repro.requestedSlug);
    const result = runNode(FINALIZE, args, { cwd: root });
    assert.equal(result.status, 0, result.stderr);
    const marker = readJson(resolve(
      root, 'scripts', 'seo', 'articles', 'blog', '_requests', `request-${repro.label}.json`,
    ));
    assert.equal(marker.status, 'failed', repro.label);
    assert.equal(marker.errorKind, 'validation', repro.label);
    assert.equal(marker.error, 'The draft did not pass validation.', repro.label);
    assert.deepEqual(readFileSync(statePath), stateBytes, repro.label);
    assert.deepEqual(readFileSync(contentStatusPath), contentStatusBytes, repro.label);
    const remaining = readdirSync(resolve(root, 'scripts', 'seo', 'articles', 'blog'))
      .filter((name) => name.endsWith('.json'));
    if (repro.mode === 'revise') {
      assert.deepEqual(readFileSync(originalPostPath), originalPostBytes, repro.label);
      assert.deepEqual(remaining, [`${SLUG}.json`], repro.label);
    } else {
      assert.deepEqual(remaining, [], repro.label);
    }
  }
});

test('a build failure is a validation failure and restores generated state before the marker', (t) => {
  const root = seedRoot(t, 'finalize-build-failure');
  const statePath = resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json');
  const contentStatusPath = resolve(root, 'public', 'data', 'content-status.json');
  const stateBytes = readFileSync(statePath);
  const contentStatusBytes = readFileSync(contentStatusPath);
  write(resolve(root, 'scripts', 'build-seo-pages.mjs'), [
    "import { existsSync, mkdirSync, writeFileSync } from 'node:fs';",
    "import { dirname, resolve } from 'node:path';",
    "const count = resolve('.blog-context/build-once');",
    "const output = resolve('public/data/content-status.json');",
    "mkdirSync(dirname(output), { recursive: true });",
    "if (!existsSync(count)) { writeFileSync(count, '1'); writeFileSync(output, 'partial output\\n'); process.exit(1); }",
    "writeFileSync(output, 'seed content status\\n');",
    '',
  ].join('\n'));
  write(resolve(root, 'scripts', 'build-og-cards.mjs'), 'process.exit(0);\n');
  git(root, ['add', '.']);
  git(root, ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'build stubs']);
  manifestBefore(root);
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), readJson(FIXTURE));

  const result = runNode(FINALIZE, [
    '--root', root, '--request-id', 'request-build-failure', '--mode', 'new',
    '--writer-result', seedWriterResult(root),
  ], { cwd: root });
  assert.equal(result.status, 0, result.stderr);
  const marker = readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-build-failure.json'));
  assert.equal(marker.status, 'failed');
  assert.equal(marker.errorKind, 'validation');
  assert.deepEqual(readFileSync(statePath), stateBytes);
  assert.deepEqual(readFileSync(contentStatusPath), contentStatusBytes);
  assert.ok(!existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`)));
});

test('a second recovery build failure still leaves exactly HEAD plus the failed marker', (t) => {
  const root = seedRoot(t, 'finalize-double-build-failure');
  write(resolve(root, 'public', 'blog', 'index.html'), 'seed blog index\n');
  write(resolve(root, 'scripts', 'build-seo-pages.mjs'), [
    "import { mkdirSync, writeFileSync } from 'node:fs';",
    "import { dirname, resolve } from 'node:path';",
    "for (const [path, value] of [",
    "  ['public/data/content-status.json', 'partial status\\n'],",
    "  ['public/blog/index.html', 'partial tracked page\\n'],",
    "  ['public/blog/partial.html', 'partial untracked page\\n'],",
    "]) { const output = resolve(path); mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, value); }",
    'process.exit(1);',
    '',
  ].join('\n'));
  write(resolve(root, 'scripts', 'build-og-cards.mjs'), 'process.exit(0);\n');
  git(root, ['add', '.']);
  git(root, ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'always failing build']);
  manifestBefore(root);
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), readJson(FIXTURE));

  const result = runNode(FINALIZE, [
    '--root', root, '--request-id', 'request-double-build-failure', '--mode', 'new',
    '--writer-result', seedWriterResult(root),
  ], { cwd: root });
  assert.equal(result.status, 0, result.stderr);
  const markerPath = 'scripts/seo/articles/blog/_requests/request-double-build-failure.json';
  const marker = readJson(resolve(root, markerPath));
  assert.equal(marker.status, 'failed');
  assert.equal(marker.errorKind, 'validation');
  assert.equal(git(root, ['status', '--porcelain=v1', '--untracked-files=all']), `?? ${markerPath}\n`);
  assert.equal(readFileSync(resolve(root, 'public', 'blog', 'index.html'), 'utf8'), 'seed blog index\n');
  assert.ok(!existsSync(resolve(root, 'public', 'blog', 'partial.html')));
});

test('finalize-draft refuses to revise a published post without changing it', (t) => {
  const post = readJson(FIXTURE);
  const state = { ...publishedState(), [SLUG]: { status: 'published', publishedAt: '2026-09-20' } };
  const root = seedRoot(t, 'finalize-published', { post, state });
  manifestBefore(root, [`scripts/seo/articles/blog/${SLUG}.json`]);
  const writerResult = seedWriterResult(root);
  const beforePost = readFileSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), 'utf8');
  const beforeState = readFileSync(resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'), 'utf8');
  const result = runNode(FINALIZE, [
    '--root', root, '--no-build', '--request-id', 'request-revise', '--mode', 'revise',
    '--slug', SLUG, '--writer-result', writerResult,
  ], { cwd: root });
  assert.equal(result.status, 2);
  assert.equal(readFileSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), 'utf8'), beforePost);
  assert.equal(readFileSync(resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'), 'utf8'), beforeState);
  assert.ok(!existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-revise.json')));
});

test('finalize-draft preserves revision history for a valid draft revision', (t) => {
  const original = readJson(FIXTURE);
  original.meta = {
    requestId: 'request-original', mode: 'new', model: 'older-model', effort: 'max',
    contextWindow: '200k', createdAt: '2026-09-20', updatedAt: '2026-09-20',
    revisionCount: 2, validation: { ok: true, errors: [], checkedAt: '2026-09-20T00:00:00.000Z' },
    usage: {},
  };
  const state = { ...publishedState(), [SLUG]: { status: 'draft', publishedAt: null } };
  const root = seedRoot(t, 'finalize-revision', { post: original, state });
  manifestBefore(root, [`scripts/seo/articles/blog/${SLUG}.json`]);
  writeJson(resolve(root, '.blog-context', 'existing-post.json'), original);
  const revised = readJson(FIXTURE);
  revised.title = 'Test Fixture Blog Keyword: Revised Dealer Guide';
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), revised);
  const result = runNode(FINALIZE, [
    '--root', root, '--no-build', '--request-id', 'request-revision', '--mode', 'revise',
    '--slug', SLUG, '--writer-result', seedWriterResult(root),
  ], { cwd: root });
  assert.equal(result.status, 0, result.stderr);
  const finalized = readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`));
  assert.equal(finalized.meta.createdAt, '2026-09-20');
  assert.equal(finalized.meta.revisionCount, 3);
  assert.equal(finalized.meta.requestId, 'request-revision');
  assert.equal(readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-revision.json')).status, 'drafted');
});

test('finalize-draft removes partial, extra, and malformed writer output before recording failure', (t) => {
  const failedRoot = seedRoot(t, 'finalize-partial');
  manifestBefore(failedRoot);
  writeJson(resolve(failedRoot, 'scripts', 'seo', 'articles', 'blog', 'partial-output.json'), {
    meta: { prompt: SECRET },
  });
  const failedResult = runNode(FINALIZE, [
    '--root', failedRoot, '--no-build', '--request-id', 'request-partial', '--mode', 'new',
    '--writer-result', seedWriterResult(failedRoot, { ok: false, exitCode: 1, errorKind: 'usage_limit' }),
  ], { cwd: failedRoot });
  assert.equal(failedResult.status, 0, failedResult.stderr);
  assert.ok(!existsSync(resolve(failedRoot, 'scripts', 'seo', 'articles', 'blog', 'partial-output.json')));
  assert.equal(readJson(resolve(failedRoot, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-partial.json')).errorKind, 'usage_limit');
  assert.ok(!allTextFiles(failedRoot).includes(SECRET));

  const multipleRoot = seedRoot(t, 'finalize-multiple');
  manifestBefore(multipleRoot);
  writeJson(resolve(multipleRoot, 'scripts', 'seo', 'articles', 'blog', 'first-output.json'), { secret: SECRET });
  writeJson(resolve(multipleRoot, 'scripts', 'seo', 'articles', 'blog', 'second-output.json'), { secret: SECRET });
  const multipleResult = runNode(FINALIZE, [
    '--root', multipleRoot, '--no-build', '--request-id', 'request-multiple', '--mode', 'new',
    '--writer-result', seedWriterResult(multipleRoot),
  ], { cwd: multipleRoot });
  assert.equal(multipleResult.status, 0, multipleResult.stderr);
  assert.ok(!existsSync(resolve(multipleRoot, 'scripts', 'seo', 'articles', 'blog', 'first-output.json')));
  assert.ok(!existsSync(resolve(multipleRoot, 'scripts', 'seo', 'articles', 'blog', 'second-output.json')));
  assert.equal(readJson(resolve(multipleRoot, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-multiple.json')).errorKind, 'no_output');
  assert.ok(!allTextFiles(multipleRoot).includes(SECRET));

  const malformedRoot = seedRoot(t, 'finalize-malformed');
  manifestBefore(malformedRoot);
  write(resolve(malformedRoot, 'scripts', 'seo', 'articles', 'blog', 'malformed-output.json'), `{${SECRET}`);
  const malformedResult = runNode(FINALIZE, [
    '--root', malformedRoot, '--no-build', '--request-id', 'request-malformed', '--mode', 'new',
    '--writer-result', seedWriterResult(malformedRoot),
  ], { cwd: malformedRoot });
  assert.equal(malformedResult.status, 0, malformedResult.stderr);
  assert.ok(!existsSync(resolve(malformedRoot, 'scripts', 'seo', 'articles', 'blog', 'malformed-output.json')));
  const malformedMarker = readJson(resolve(malformedRoot, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-malformed.json'));
  assert.equal(malformedMarker.status, 'failed');
  assert.equal(malformedMarker.errorKind, 'validation');
  assert.ok(!allTextFiles(malformedRoot).includes(SECRET));

  const nullRoot = seedRoot(t, 'finalize-null');
  manifestBefore(nullRoot);
  write(resolve(nullRoot, 'scripts', 'seo', 'articles', 'blog', 'null-output.json'), 'null\n');
  const nullResult = runNode(FINALIZE, [
    '--root', nullRoot, '--no-build', '--request-id', 'request-null', '--mode', 'new',
    '--writer-result', seedWriterResult(nullRoot),
  ], { cwd: nullRoot });
  assert.equal(nullResult.status, 0, nullResult.stderr);
  assert.ok(!existsSync(resolve(nullRoot, 'scripts', 'seo', 'articles', 'blog', 'null-output.json')));

  const oddNamesRoot = seedRoot(t, 'finalize-odd-names');
  manifestBefore(oddNamesRoot);
  writeJson(resolve(oddNamesRoot, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), readJson(FIXTURE));
  write(resolve(oddNamesRoot, 'scripts', 'seo', 'articles', 'blog', 'raw secret..txt'), SECRET);
  write(resolve(oddNamesRoot, 'scripts', 'seo', 'articles', 'blog', 'raw secret file.txt'), SECRET);
  const oddNamesResult = runNode(FINALIZE, [
    '--root', oddNamesRoot, '--no-build', '--request-id', 'request-odd-names', '--mode', 'new',
    '--writer-result', seedWriterResult(oddNamesRoot),
  ], { cwd: oddNamesRoot });
  assert.equal(oddNamesResult.status, 0, oddNamesResult.stderr);
  assert.ok(!existsSync(resolve(oddNamesRoot, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`)));
  assert.ok(!existsSync(resolve(oddNamesRoot, 'scripts', 'seo', 'articles', 'blog', 'raw secret..txt')));
  assert.ok(!existsSync(resolve(oddNamesRoot, 'scripts', 'seo', 'articles', 'blog', 'raw secret file.txt')));
  assert.ok(!allTextFiles(oddNamesRoot).includes(SECRET));
});

test('finalize-draft restores a non-target blog file instead of committing it', (t) => {
  const existing = readJson(FIXTURE);
  existing.slug = 'existing-blog-draft';
  existing.primaryKeyword = 'existing draft fixture keyword';
  existing.title = 'Existing Draft Fixture Keyword Guide';
  existing.h1 = 'Existing draft fixture keyword guide';
  const state = { ...publishedState(), [existing.slug]: { status: 'draft', publishedAt: null } };
  const root = seedRoot(t, 'finalize-unrelated', { post: existing, state });
  const existingPath = resolve(root, 'scripts', 'seo', 'articles', 'blog', `${existing.slug}.json`);
  const before = readFileSync(existingPath, 'utf8');
  manifestBefore(root, [`scripts/seo/articles/blog/${existing.slug}.json`]);
  const changed = { ...existing, meta: { prompt: SECRET } };
  writeJson(existingPath, changed);
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), readJson(FIXTURE));
  const result = runNode(FINALIZE, [
    '--root', root, '--no-build', '--request-id', 'request-unrelated', '--mode', 'new',
    '--writer-result', seedWriterResult(root),
  ], { cwd: root });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(existingPath, 'utf8'), before);
  assert.ok(!existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`)));
  const marker = readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-unrelated.json'));
  assert.equal(marker.status, 'failed');
  assert.equal(marker.errorKind, 'other');
  assert.ok(!allTextFiles(root).includes(SECRET));
});

test('finalize-draft rejects a draft that reproduces private request text', (t) => {
  const root = seedRoot(t, 'finalize-request-leak');
  manifestBefore(root);
  writeJson(resolve(root, '.blog-context', 'request.json'), {
    requestId: 'request-leak', mode: 'new', slug: '', prompt: SECRET,
    keyword: '', feedback: '', originalPrompt: '',
  });
  const post = readJson(FIXTURE);
  post.sections[0].privatePrompt = SECRET;
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), post);
  const result = runNode(FINALIZE, [
    '--root', root, '--no-build', '--request-id', 'request-leak', '--mode', 'new',
    '--writer-result', seedWriterResult(root),
  ], { cwd: root });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`)));
  const marker = readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-leak.json'));
  assert.equal(marker.status, 'failed');
  assert.equal(marker.errorKind, 'other');
  assert.ok(!allTextFiles(root, { excludeContext: true }).includes(SECRET));
});

test('finalize-draft rejects secret-like content before unknown fields are projected away', (t) => {
  const secretLikeValues = [
    'sk-ant-Abcdefgh_123',
    'CLAUDE_CODE_OAUTH_TOKEN',
    `ghp_${'A'.repeat(20)}`,
    `gho_${'B'.repeat(20)}`,
    `ghu_${'C'.repeat(20)}`,
    `ghs_${'D'.repeat(20)}`,
    `ghr_${'E'.repeat(20)}`,
    `github_pat_${'F'.repeat(20)}`,
    'x-access-token',
    'AUTHORIZATION: basic hidden',
    '-----BEGIN RSA PRIVATE KEY-----',
  ];

  for (const [index, secretLike] of secretLikeValues.entries()) {
    const root = seedRoot(t, `finalize-secret-${index}`);
    manifestBefore(root);
    const post = readJson(FIXTURE);
    post.untrustedWriterField = secretLike;
    writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), post);

    const result = runNode(FINALIZE, [
      '--root', root, '--no-build', '--request-id', `request-secret-${index}`, '--mode', 'new',
      '--writer-result', seedWriterResult(root),
    ], { cwd: root });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(!existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`)));
    const marker = readJson(resolve(
      root, 'scripts', 'seo', 'articles', 'blog', '_requests', `request-secret-${index}.json`,
    ));
    assert.equal(marker.status, 'failed');
    assert.equal(marker.errorKind, 'validation');
    assert.equal(marker.error, 'post contained secret-like content');
    assert.ok(!allTextFiles(root, { excludeContext: true }).includes(secretLike));
  }
});

test('finalize-draft exits 3 when any changed path is outside the commit allowlist', (t) => {
  const root = seedRoot(t, 'finalize-allowlist');
  manifestBefore(root);
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`), readJson(FIXTURE));
  write(resolve(root, 'unexpected.txt'), 'unrelated change\n');
  const result = runNode(FINALIZE, [
    '--root', root, '--no-build', '--request-id', 'request-allowlist', '--mode', 'new',
    '--writer-result', seedWriterResult(root),
  ], { cwd: root });
  assert.equal(result.status, 3);
  assert.match(result.stderr, /unexpected\.txt/);
});

test('discard-post removes a draft and refuses a published post', (t) => {
  const post = readJson(FIXTURE);
  const draftState = { ...publishedState(), [SLUG]: { status: 'draft', publishedAt: null } };
  const root = seedRoot(t, 'discard-draft', { post, state: draftState, preview: true, og: true });
  const result = runNode(DISCARD, [SLUG, '--root', root, '--no-build', '--request-id', 'request-discard'], { cwd: root });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!existsSync(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${SLUG}.json`)));
  assert.ok(!existsSync(resolve(root, 'previews', 'blog', `${SLUG}.html`)));
  assert.ok(!existsSync(resolve(root, 'public', 'og', `blog-${SLUG}.png`)));
  assert.ok(!readJson(resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'))[SLUG]);
  assert.ok(!readJson(resolve(root, 'public', 'og', 'manifest.json'))[`/blog/${SLUG}/`]);
  assert.equal(readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-discard.json')).status, 'discarded');

  const publishedStateValue = { ...publishedState(), [SLUG]: { status: 'published', publishedAt: '2026-09-20' } };
  const publishedRoot = seedRoot(t, 'discard-published', { post, state: publishedStateValue, preview: true, og: true });
  const before = allTextFiles(publishedRoot);
  const refused = runNode(DISCARD, [
    SLUG, '--root', publishedRoot, '--no-build', '--request-id', 'request-refused',
  ], { cwd: publishedRoot });
  assert.equal(refused.status, 2);
  assert.equal(allTextFiles(publishedRoot), before);
});

test('discard-post succeeds when every per-post artifact is already missing', (t) => {
  const root = seedRoot(t, 'discard-half-deleted');
  const result = runNode(DISCARD, [
    SLUG, '--root', root, '--no-build', '--request-id', 'request-half-deleted',
  ], { cwd: root });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', 'request-half-deleted.json')).status,
    'discarded',
  );
});

test('publishing a drip article succeeds while malformed blog files are skipped', (t) => {
  const state = {
    ...publishedState(),
    'facebook-marketplace-car-listing-limits': { status: 'draft', publishedAt: null },
  };
  const root = seedRoot(t, 'publish-with-malformed-blog', { state });
  write(resolve(root, 'scripts', 'seo', 'articles', 'blog', 'bad-json.json'), '{');
  assert.doesNotThrow(() => publishArticle({
    root,
    slug: 'facebook-marketplace-car-listing-limits',
    noBuild: true,
    today: '2026-09-27',
  }));
  assert.equal(readJson(resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'))['facebook-marketplace-car-listing-limits'].status, 'published');
});

test('a full drip publish rebuild succeeds with malformed blog JSON present', (t) => {
  const root = scratchRoot(t, 'publish-full-build-malformed-blog');
  git(ROOT, ['clone', '-q', '--no-local', '-c', 'core.autocrlf=false', ROOT, root]);
  write(resolve(root, 'scripts', 'seo', 'articles', 'blog', 'bad-json.json'), '{');
  const slug = 'aged-inventory-used-car-dealers';

  const result = runNode(resolve(root, 'scripts', 'publish-article.mjs'), [slug], { cwd: root });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stderr, /Skipping blog file bad-json\.json: invalid JSON/);
  assert.equal(readJson(resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json'))[slug].status, 'published');
  const status = readJson(resolve(root, 'public', 'data', 'content-status.json'));
  assert.equal(status.articles.filter((row) => row.kind === 'drip').length, 36);
  assert.equal(status.articles.find((row) => row.slug === slug).status, 'published');
});
