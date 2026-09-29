// One-time migration, safe to rerun. Only the old generated GA block is replaced.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function htmlFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}
const files = await htmlFiles('public');
let count = 0;
for (const path of files) {
  if (path.replaceAll('\\', '/').endsWith('/thank-you.html')) continue;
  const html = await readFile(path, 'utf8');
  const updated = html.replace(/^  <!-- Google tag \(gtag.js\) -->\r?\n[\s\S]*?^  <\/script>/m,
    '  <script defer src="/al-tags-v1.js"></script>');
  if (html !== updated) { await writeFile(path, updated); count++; }
  if (updated.includes('G-30H80LZMCH')) throw new Error(`Unconverted GA block: ${path}`);
}
console.log(`${count} pages updated`);
