import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { siteHeader } from '../scripts/seo/shell.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(resolve(ROOT, relativePath), 'utf8');

test('SiteNav defines the Services disclosure with exactly the two owner-approved links', () => {
  const source = read('src/components/SiteNav.jsx');
  const servicesBlock = source.match(/const SERVICES = \[([\s\S]*?)\];/)?.[1] || '';
  const services = [...servicesBlock.matchAll(/\['([^']+)', '([^']+)'\]/g)]
    .map((match) => ({ href: match[1], label: match[2] }));

  assert.deepEqual(services, [
    { href: '/ai-visibility/', label: 'AI Audit' },
    { href: '/team/', label: 'Team Plans' },
  ]);
  assert.match(source, /aria-expanded=\{desktopServicesOpen\}/);
  assert.match(source, /aria-controls=\{desktopServicesId\}/);
  assert.match(source, /event\.key !== 'Escape'/);
  assert.match(source, /contains\(event\.target\)/);
});

test('the homepage uses the shared navigation and footer', () => {
  const app = read('src/App.jsx');
  assert.match(app, /import SiteNav from ['"]\.\/components\/SiteNav\.jsx['"]/);
  assert.match(app, /const SiteFooter = lazy\(\(\) => import\(['"]\.\/components\/SiteFooter\.jsx['"]\)\)/);
  assert.match(app, /<SiteNav[\s\S]*?page="home"[\s\S]*?\/>/);
  assert.match(app, /<SiteFooter \/>/);
});

test('lazy route styles include the shared navigation responsive utilities', () => {
  for (const stylesheet of ['src/ai/ai.css', 'src/team/team.css']) {
    const css = read(stylesheet);
    assert.match(css, /@source "\.\.\/components\/SiteNav\.jsx";/, stylesheet);
    assert.match(css, /@source "\.\.\/components\/SiteFooter\.jsx";/, stylesheet);
  }
});

test('the static homepage mirror exposes both Services destinations without JavaScript', () => {
  const html = read('index.html');
  const start = html.indexOf('<!--AL_STATIC_HOME_START-->');
  const end = html.indexOf('<!--AL_STATIC_HOME_END-->');
  assert.ok(start >= 0 && end > start, 'static homepage markers must exist');
  const mirror = html.slice(start, end);
  assert.match(mirror, /<a href="\/ai-visibility\/">AI Audit<\/a>/);
  assert.match(mirror, /<a href="\/team\/">Team Plans<\/a>/);
});

test('the SEO shell topnav has a no-JavaScript Services details menu', () => {
  const html = siteHeader([{ name: 'Example', url: '/example/' }]);
  const menu = html.match(/<details class="navdrop">[\s\S]*?<\/details>/)?.[0] || '';
  assert.match(menu, /<summary>Services<\/summary>/);
  assert.match(menu, /<a href="\/ai-visibility\/">AI Audit<\/a>/);
  assert.match(menu, /<a href="\/team\/">Team Plans<\/a>/);
  assert.equal((menu.match(/<a /g) || []).length, 2);
});

test('the independent comparison-page header carries the same Services menu', () => {
  const source = read('scripts/build-compare-pages.mjs');
  assert.match(source, /<details class="navdrop"><summary>Services<\/summary>/);
  assert.match(source, /<a href="\/ai-visibility\/">AI Audit<\/a>/);
  assert.match(source, /<a href="\/team\/">Team Plans<\/a>/);
});
