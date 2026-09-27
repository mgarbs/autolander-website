import { spawnSync } from 'node:child_process';
import {
  existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';

export const ACTIONS_NAME = 'github-actions[bot]';
export const ACTIONS_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com';

export function githubAuthArgs(token) {
  if (!token) return [];
  const encoded = Buffer.from(`x-access-token:${token}`, 'utf8').toString('base64');
  return ['-c', `http.https://github.com/.extraheader=AUTHORIZATION: basic ${encoded}`];
}

export function gitChildEnv(env = process.env) {
  const childEnv = { ...env };
  delete childEnv.GITHUB_TOKEN;
  return childEnv;
}

export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function runGit(root, args, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    env: gitChildEnv(),
  });
  if (!allowFailure && result.status !== 0) throw new Error('git operation failed');
  return result;
}

export function fetchAndReset(root, remote, branch, token = '') {
  runGit(root, [
    ...githubAuthArgs(token),
    'fetch', remote, `+refs/heads/${branch}:refs/remotes/${remote}/${branch}`,
  ]);
  runGit(root, ['reset', '--hard', `refs/remotes/${remote}/${branch}`]);
}

export function removeIfUntracked(root, relativePath) {
  if (!relativePath) return;
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) return;
  const tracked = runGit(root, ['ls-files', '--error-unmatch', '--', relativePath], { allowFailure: true });
  if (tracked.status !== 0) unlinkSync(absolutePath);
}

export function changedPaths(root) {
  const result = runGit(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  const records = result.stdout.split('\0');
  const paths = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!record) continue;
    const status = record.slice(0, 2);
    paths.push(record.slice(3).replaceAll('\\', '/'));
    if (/[RC]/.test(status)) {
      const pairedPath = records[++index];
      if (pairedPath) paths.push(pairedPath.replaceAll('\\', '/'));
    }
  }
  return [...new Set(paths)];
}

export function assertChangedPaths(root, allowed) {
  const unexpected = changedPaths(root).filter((path) => !allowed(path));
  if (unexpected.length) throw new Error(`unexpected changed paths: ${unexpected.join(', ')}`);
}

export function commitStaged(root, message) {
  const quiet = runGit(root, ['diff', '--cached', '--quiet'], { allowFailure: true });
  if (quiet.status === 0) return '';
  if (quiet.status !== 1) throw new Error('git staged-diff check failed');
  runGit(root, [
    '-c', `user.name=${ACTIONS_NAME}`,
    '-c', `user.email=${ACTIONS_EMAIL}`,
    'commit', '-m', message,
  ]);
  return runGit(root, ['rev-parse', 'HEAD']).stdout.trim();
}

export function pushHead(root, remote, branch, token = '') {
  return runGit(root, [
    ...githubAuthArgs(token),
    'push', '--porcelain', remote, `HEAD:${branch}`,
  ], { allowFailure: true });
}

export function isPushRejection(result) {
  return /\[rejected\]|non-fast-forward|fetch first|failed to push some refs/i
    .test(`${result.stdout || ''}\n${result.stderr || ''}`);
}

export const defaultSleep = (milliseconds) => new Promise((resolveSleep) => {
  setTimeout(resolveSleep, milliseconds);
});

export const retryDelay = (random) => 5_000 + Math.floor(random() * 10_001);

export function runNode(root, script, args = []) {
  const childEnv = { ...process.env };
  delete childEnv.GITHUB_TOKEN;
  const result = spawnSync(process.execPath, [resolve(root, script), ...args], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    env: childEnv,
  });
  return result;
}
