import {
  existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MODULE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;
const REQUEST_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

function parseArgs(argv) {
  const values = { root: MODULE_ROOT, noBuild: false, slug: argv[0] };
  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--no-build') values.noBuild = true;
    else if (arg === '--root') values.root = resolve(argv[++index] || '');
    else if (arg === '--request-id') values.requestId = argv[++index];
    else throw new Error(`unknown argument: ${arg}`);
  }
  return values;
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const removeFile = (path) => {
  if (existsSync(path)) unlinkSync(path);
};

function writeMarker(root, requestId, slug) {
  writeJson(resolve(root, 'scripts', 'seo', 'articles', 'blog', '_requests', `${requestId}.json`), {
    requestId,
    mode: 'discard',
    slug,
    status: 'discarded',
    errorKind: null,
    error: '',
    finishedAt: new Date().toISOString(),
  });
}

function refreshGeneratedPages(root) {
  const result = spawnSync(process.execPath, [resolve(root, 'scripts', 'build-seo-pages.mjs')], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  });
  if (result.status !== 0) throw new Error('scripts/build-seo-pages.mjs failed');
}

function unexpectedChanges(root) {
  const status = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  });
  if (status.status !== 0) throw new Error('git status failed');
  const allowed = (path) => path.startsWith('scripts/seo/articles/blog/')
    || path === 'scripts/seo/articles/publish-state.json'
    || path === 'public/data/content-status.json'
    || path.startsWith('public/og/')
    || path.startsWith('previews/blog/');
  return status.stdout.split(/\r?\n/).filter(Boolean)
    .map((line) => line.slice(3).replaceAll('\\', '/'))
    .filter((path) => !allowed(path));
}

export function discardPost({ root, slug, requestId, noBuild }) {
  if (!SLUG_RE.test(slug || '')) throw new Error('valid slug is required');
  if (!REQUEST_ID_RE.test(requestId || '')) throw new Error('valid request id is required');
  const statePath = resolve(root, 'scripts', 'seo', 'articles', 'publish-state.json');
  const state = readJson(statePath);
  if (state[slug]?.status === 'published') return { exitCode: 2 };

  removeFile(resolve(root, 'scripts', 'seo', 'articles', 'blog', `${slug}.json`));
  delete state[slug];
  writeJson(statePath, state);
  removeFile(resolve(root, 'previews', 'blog', `${slug}.html`));

  const manifestPath = resolve(root, 'public', 'og', 'manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    const route = `/blog/${slug}/`;
    const card = manifest[route];
    if (typeof card === 'string' && /^\/og\/[a-z0-9-]+\.png$/.test(card)) {
      removeFile(resolve(root, 'public', card.replace(/^\//, '')));
    }
    delete manifest[route];
    writeJson(manifestPath, manifest);
  }
  removeFile(resolve(root, 'public', 'og', `blog-${slug}.png`));

  if (!noBuild) refreshGeneratedPages(root);
  writeMarker(root, requestId, slug);
  const unexpected = unexpectedChanges(root);
  return { exitCode: unexpected.length ? 3 : 0, unexpected };
}

function main() {
  try {
    const result = discardPost(parseArgs(process.argv.slice(2)));
    if (result.unexpected?.length) console.error(`unexpected changed paths: ${result.unexpected.join(', ')}`);
    process.exitCode = result.exitCode;
  } catch (error) {
    console.error(`discard failed: ${error.message}`);
    process.exitCode = 1;
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();
