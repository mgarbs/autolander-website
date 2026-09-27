import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isStructurallyRenderable } from './blog-post-structure.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BLOG_DIR = resolve(HERE, 'blog');

export function loadBlogPosts(dir = BLOG_DIR) {
  if (!existsSync(dir)) return [];
  const posts = [];
  const entries = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_'))
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    let post;
    try {
      post = JSON.parse(readFileSync(resolve(dir, entry.name), 'utf8'));
    } catch {
      console.warn(`Skipping blog file ${entry.name}: invalid JSON`);
      continue;
    }
    const fileSlug = entry.name.replace(/\.json$/, '');
    if (post?.slug !== fileSlug) {
      console.warn(`Skipping blog file ${entry.name}: slug must match file name`);
      continue;
    }
    if (!isStructurallyRenderable(post)) {
      console.warn(`Skipping blog file ${entry.name}: post is not structurally renderable`);
      continue;
    }
    posts.push(post);
  }
  return posts.sort((a, b) => a.slug.localeCompare(b.slug));
}
