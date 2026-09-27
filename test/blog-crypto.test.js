import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { env as processEnv, execPath } from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { decryptPayload, encryptPayload, newKeyB64 } from '../shared/blog-crypto.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DECRYPT_SCRIPT = resolve(ROOT, 'scripts', 'blog', 'decrypt-input.mjs');

test('AES-GCM payload round-trips with a 256-bit setup key', async () => {
  const key = newKeyB64();
  const input = { prompt: 'Write about inventory photos.', keyword: 'car dealer photos', count: 2 };
  assert.equal(Buffer.from(key, 'base64').length, 32);
  const encrypted = await encryptPayload(input, key, 'request-123');
  assert.deepEqual(await decryptPayload(encrypted, key, 'request-123'), input);
});

test('decrypt rejects a wrong key, wrong request id, and tampered ciphertext generically', async () => {
  const key = newKeyB64();
  const encrypted = await encryptPayload({ prompt: 'private words' }, key, 'request-123');
  await assert.rejects(
    decryptPayload(encrypted, newKeyB64(), 'request-123'),
    { message: 'blog payload: decrypt failed' },
  );
  await assert.rejects(
    decryptPayload(encrypted, key, 'request-456'),
    { message: 'blog payload: decrypt failed' },
  );

  const tampered = Buffer.from(encrypted, 'base64');
  tampered[13] ^= 0x01;
  await assert.rejects(
    decryptPayload(tampered.toString('base64'), key, 'request-123'),
    { message: 'blog payload: decrypt failed' },
  );
});

test('encrypt uses a fresh random IV for identical payloads', async () => {
  const key = newKeyB64();
  const input = { prompt: 'same input' };
  const first = await encryptPayload(input, key, 'request-123');
  const second = await encryptPayload(input, key, 'request-123');
  assert.notEqual(first, second);
  assert.deepEqual(await decryptPayload(first, key, 'request-123'), input);
  assert.deepEqual(await decryptPayload(second, key, 'request-123'), input);
});

test('decrypt rejects malformed and truncated envelopes with the generic error', async () => {
  const key = newKeyB64();
  for (const payload of ['not base64!', 'AA==']) {
    await assert.rejects(
      decryptPayload(payload, key, 'request-123'),
      { message: 'blog payload: decrypt failed' },
    );
  }
});

test('decrypt-input writes request.json without printing plaintext', async (t) => {
  const scratch = mkdtempSync(join(tmpdir(), 'autolander-blog-crypto-'));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const key = newKeyB64();
  const requestId = '987db69b-27a6-4b44-9707-7ce6d5f01f0d';
  const prompt = 'Confidential dealership prompt marker 7f4d.';
  const payload = await encryptPayload({ prompt, keyword: 'inventory velocity' }, key, requestId);
  const child = spawnSync(execPath, [DECRYPT_SCRIPT], {
    cwd: scratch,
    encoding: 'utf8',
    env: {
      ...processEnv,
      GITHUB_ACTIONS: '',
      BLOG_INPUT_KEY: key,
      BLOG_PAYLOAD: payload,
      BLOG_REQUEST_ID: requestId,
      BLOG_MODE: 'new',
      BLOG_SLUG: '',
    },
  });
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(
    JSON.parse(readFileSync(join(scratch, '.blog-context', 'request.json'), 'utf8')),
    {
      requestId,
      mode: 'new',
      slug: '',
      prompt,
      keyword: 'inventory velocity',
      feedback: '',
      originalPrompt: '',
    },
  );
  assert.match(child.stdout, /^request decrypted \(\d+ chars\)\r?\n$/);
  assert.ok(!child.stdout.includes(prompt));
  assert.ok(!child.stderr.includes(prompt));
});

test('decrypt-input accepts discard mode without a payload or key', (t) => {
  const scratch = mkdtempSync(join(tmpdir(), 'autolander-blog-discard-'));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const child = spawnSync(execPath, [DECRYPT_SCRIPT], {
    cwd: scratch,
    encoding: 'utf8',
    env: {
      ...processEnv,
      GITHUB_ACTIONS: '',
      BLOG_INPUT_KEY: '',
      BLOG_PAYLOAD: '',
      BLOG_REQUEST_ID: 'discard-request',
      BLOG_MODE: 'discard',
      BLOG_SLUG: 'draft-post',
    },
  });
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(
    JSON.parse(readFileSync(join(scratch, '.blog-context', 'request.json'), 'utf8')),
    {
      requestId: 'discard-request',
      mode: 'discard',
      slug: 'draft-post',
      prompt: '',
      keyword: '',
      feedback: '',
      originalPrompt: '',
    },
  );
});
