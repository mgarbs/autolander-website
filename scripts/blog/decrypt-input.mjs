import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { decryptPayload } from '../../shared/blog-crypto.js';

const {
  BLOG_INPUT_KEY = '',
  BLOG_PAYLOAD = '',
  BLOG_REQUEST_ID = '',
  BLOG_MODE = '',
  BLOG_SLUG = '',
  GITHUB_ACTIONS = '',
} = process.env;

const decrypted = BLOG_MODE === 'discard'
  ? {}
  : await decryptPayload(BLOG_PAYLOAD, BLOG_INPUT_KEY, BLOG_REQUEST_ID);

const stringValue = (value) => (typeof value === 'string' ? value : '');
const request = {
  requestId: BLOG_REQUEST_ID,
  mode: BLOG_MODE,
  slug: BLOG_SLUG,
  prompt: stringValue(decrypted.prompt),
  keyword: stringValue(decrypted.keyword),
  feedback: stringValue(decrypted.feedback),
  originalPrompt: stringValue(decrypted.originalPrompt),
};

function workflowCommandValue(value) {
  return value.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}

if (GITHUB_ACTIONS) {
  for (const value of [request.prompt, request.feedback, request.originalPrompt]) {
    for (const line of value.split(/\r\n|\r|\n/)) {
      if (line.length > 0) console.log(`::add-mask::${workflowCommandValue(line)}`);
    }
  }
}

const contextDirectory = resolve('.blog-context');
mkdirSync(contextDirectory, { recursive: true });
writeFileSync(resolve(contextDirectory, 'request.json'), `${JSON.stringify(request, null, 2)}\n`, 'utf8');

const sensitiveCharacterCount = request.prompt.length + request.keyword.length
  + request.feedback.length + request.originalPrompt.length;
console.log(`request decrypted (${sensitiveCharacterCount} chars)`);
