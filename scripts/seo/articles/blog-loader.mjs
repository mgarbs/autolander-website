import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BLOG_DIR = resolve(HERE, 'blog');

export function loadBlogPosts(dir = BLOG_DIR) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_'))
    .map((entry) => JSON.parse(readFileSync(resolve(dir, entry.name), 'utf8')))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
