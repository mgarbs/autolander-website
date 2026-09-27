import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;
const MODES = new Set(['new', 'revise', 'discard']);

export function checkInputs({ requestId = '', mode = '', slug = '' } = {}) {
  if (!UUID_RE.test(requestId)) throw new Error('request id must be a UUID');
  if (!MODES.has(mode)) throw new Error('mode must be new, revise, or discard');
  if (mode === 'new' && slug !== '') throw new Error('slug must be empty for new requests');
  if (mode !== 'new' && !SLUG_RE.test(slug)) throw new Error('slug is required and must use the blog slug format');
  return { requestId, mode, slug };
}

function main() {
  try {
    checkInputs({
      requestId: process.env.BLOG_REQUEST_ID,
      mode: process.env.BLOG_MODE,
      slug: process.env.BLOG_SLUG,
    });
  } catch (error) {
    console.error(`invalid blog workflow input: ${error.message}`);
    process.exitCode = 1;
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();
