import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (!args.includes('-p') || !args.includes('--model')) process.exit(0);
const valueAfter = (flag) => args[args.indexOf(flag) + 1] || '';
const model = valueAfter('--model');
const taskText = valueAfter('-p');
const mode = process.env.FAKE_CLAUDE_MODE || 'ok';

if (mode === 'usage') {
  console.error('Claude usage limit reached');
  process.exit(1);
}
if (mode === 'auth') {
  console.error('OAuth token has expired');
  process.exit(1);
}
if (mode === 'nomodel1m' && model.endsWith('[1m]')) {
  console.error('model not available');
  process.exit(1);
}

const target = taskText.match(/scripts\/seo\/articles\/blog\/[a-z0-9-]+\.json/)?.[0]
  || 'scripts/seo/articles/blog/test-fixture-valid-blog-post.json';
const destination = resolve(target);
mkdirSync(dirname(destination), { recursive: true });
copyFileSync(resolve(HERE, 'valid-post.json'), destination);
console.log(JSON.stringify({
  type: 'result',
  subtype: 'success',
  num_turns: 3,
  duration_ms: 1000,
  total_cost_usd: 0,
  result: 'DONE test-fixture-valid-blog-post',
}));
