import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const walk = (directory) => readdirSync(directory).flatMap((file) => {
  const path = join(directory, file);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const EXEMPT = /(google[0-9a-f]+\.html|404\.html|thank-you\.html)$/;
const BLOG_LINK = /href="(?:https:\/\/autolander\.ai)?\/blog\/"/;
const RSS_LINK = /<link[^>]+type="application\/rss\+xml"[^>]+href="https:\/\/autolander\.ai\/blog\/feed\.xml"/;

const indexablePages = () => walk(join(ROOT, 'public'))
  .filter((path) => path.endsWith('.html') && !EXEMPT.test(path))
  .filter((path) => !/<meta[^>]+name="robots"[^>]+noindex/i.test(readFileSync(path, 'utf8')));

test('every indexable static page links to /blog/', () => {
  const pages = indexablePages();
  const missing = pages.filter((path) => {
    const html = readFileSync(path, 'utf8');
    return !BLOG_LINK.test(html);
  });
  assert.deepEqual(missing.map((path) => path.slice(ROOT.length)), []);
  assert.ok(pages.length > 60);
});

test('every indexable static page advertises the blog RSS feed', () => {
  const missing = indexablePages().filter((path) => !RSS_LINK.test(readFileSync(path, 'utf8')));
  assert.deepEqual(missing.map((path) => path.slice(ROOT.length)), []);
});

test('the SPA navbar, footer and index.html reach /blog/', () => {
  assert.match(readFileSync(join(ROOT, 'src/App.jsx'), 'utf8'), /href="\/blog\/"/);
  assert.match(readFileSync(join(ROOT, 'src/sections/DeferredLandingSections.jsx'), 'utf8'), /\/blog\//);
  assert.match(readFileSync(join(ROOT, 'index.html'), 'utf8'), /application\/rss\+xml/);
});
