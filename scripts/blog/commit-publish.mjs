import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertChangedPaths,
  commitStaged,
  defaultSleep,
  fetchAndReset,
  isPushRejection,
  pushHead,
  readJson,
  retryDelay,
  runGit,
  runNode,
} from './commit-utils.mjs';

const MODULE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;
const STATE_PATH = 'scripts/seo/articles/publish-state.json';
const PUBLISH_PATHS = [
  'public',
  STATE_PATH,
  'scripts/seo/articles/blog',
  'index.html',
  'src/generated',
];

const allowedPublishPath = (path) => path === 'index.html'
  || path === STATE_PATH
  || path.startsWith('public/')
  || path.startsWith('scripts/seo/articles/blog/')
  || path.startsWith('src/generated/');

export async function commitPublish({
  root = MODULE_ROOT,
  slug,
  remote = 'origin',
  branch = 'main',
  maxAttempts = 5,
  sleep = defaultSleep,
  random = Math.random,
  beforePush,
} = {}) {
  if (!SLUG_RE.test(slug || '')) {
    const error = new Error('usage: node scripts/blog/commit-publish.mjs <slug>');
    error.exitCode = 2;
    throw error;
  }
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new Error('maxAttempts must be positive');

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    fetchAndReset(root, remote, branch);
    const state = readJson(resolve(root, STATE_PATH));
    if (!(slug in state)) {
      const error = new Error(`unknown slug: ${slug}`);
      error.exitCode = 2;
      throw error;
    }
    const already = state[slug]?.status === 'published';
    const publish = runNode(root, 'scripts/publish-article.mjs', [slug]);
    if (publish.status !== 0) {
      const error = new Error('publish-article.mjs failed');
      error.exitCode = publish.status || 1;
      throw error;
    }
    if (!existsSync(resolve(root, '.last-publish.json'))) throw new Error('publish result is missing');
    assertChangedPaths(root, allowedPublishPath);
    runGit(root, ['add', '-A', '--', ...PUBLISH_PATHS]);
    const commit = commitStaged(root, `publish: ${slug}`);
    if (!commit) return {
      attempts: attempt,
      pushed: false,
      commit: '',
      already,
      slug,
    };

    await beforePush?.({ attempt, root, commit });
    const push = pushHead(root, remote, branch);
    if (push.status === 0) return {
      attempts: attempt,
      pushed: true,
      commit,
      already,
      slug,
    };
    if (!isPushRejection(push) || attempt === maxAttempts) throw new Error('git push failed');
    await sleep(retryDelay(random));
  }
  throw new Error('git push retry limit reached');
}

async function main() {
  try {
    await commitPublish({ root: process.cwd(), slug: process.argv[2] });
  } catch (error) {
    console.error(`publish commit failed: ${error.message}`);
    process.exitCode = error.exitCode || 1;
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) await main();
