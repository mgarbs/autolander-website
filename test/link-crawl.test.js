// Negative control for scripts/seo/link-crawl.mjs (the dead-link crawler test/dead-links.test.js trusts).
//
// dead-links.test.js proves "no dead links" by crawling real builds and finding NOTHING. That only means
// something if the crawler can find a dead link when one is there. This file builds a tiny site on disk
// with known dead links in every form the crawler claims to read (root-relative, ../ relative, Markdown
// ](/path/), absolute https://autolander.ai/..., www and http origins, llms.txt, sitemap <loc>) next to live
// links, externals and non-navigational hrefs, and requires the crawler (library and CLI) to report
// exactly the dead ones.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execPath } from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  crawl, crawlableFiles, internalPath, servedBy, urlPathOf,
} from '../scripts/seo/link-crawl.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = resolve(ROOT, 'scripts', 'seo', 'link-crawl.mjs');

const page = (body) => `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>\n`;

// Every dead link the fixture plants: [page it sits on, href as written, path it resolves to].
const PLANTED = [
  ['/', '/missing/', '/missing/'],
  ['/', 'https://autolander.ai/gone/', '/gone/'],
  ['/', 'https://www.autolander.ai/gone-www/', '/gone-www/'],
  ['/', 'http://autolander.ai/gone-http/?utm_source=x#top', '/gone-http/'],
  ['/', '/missing-file.pdf', '/missing-file.pdf'],
  ['/a/b/', '../gone-rel/', '/a/gone-rel/'],
  ['/a/b/', 'sibling-missing/', '/a/b/sibling-missing/'],
  ['/guide.md', '/missing-md/', '/missing-md/'],
  ['/guide.md', 'https://autolander.ai/gone-md/', '/gone-md/'],
  ['/llms.txt', 'https://autolander.ai/missing-llms.md', '/missing-llms.md'],
  ['/sitemap.xml', 'https://autolander.ai/missing-sitemap/', '/missing-sitemap/'],
];

function fixture(t, { dead = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'al-linkcrawl-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const put = (rel, text) => {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  };
  // Live targets.
  put('live/index.html', page('<p>live</p>'));
  put('a/live/index.html', page('<p>a live</p>'));
  put('a/b/index.html', page([
    '<a href="../live/">relative live</a>',
    '<a href="../../live/">up two, live</a>',
    '<a href="./">self</a>',
    ...(dead ? ['<a href="../gone-rel/">relative dead</a>', '<a href="sibling-missing/">bare relative dead</a>'] : []),
  ].join('\n')));
  put('files/report.pdf', 'pdf');
  put('index.html', page([
    '<a href="/live/">live</a>',
    '<a class="x" href="https://autolander.ai/live/">absolute live</a>',
    '<a href="https://autolander.ai/">origin root</a>',
    '<a href="/files/report.pdf">file</a>',
    '<a href="#top">hash</a>',
    '<a href="mailto:sales@autolander.ai">mail</a>',
    '<a href="tel:+19192800967">tel</a>',
    '<a href="https://example.com/missing/">external</a>',
    '<a href="//cdn.example.com/x.js">protocol-relative external</a>',
    '<a href="https://autolander.ai.example.com/gone/">look-alike host</a>',
    '<link rel="canonical" href="https://autolander.ai/not-a-link/" />',
    ...(dead ? [
      '<a href="/missing/">root-relative dead</a>',
      '<a href="https://autolander.ai/gone/">absolute dead</a>',
      '<a href="https://www.autolander.ai/gone-www/">www dead</a>',
      '<a href="http://autolander.ai/gone-http/?utm_source=x#top">http dead with query</a>',
      '<a href="/missing-file.pdf">missing file</a>',
    ] : []),
  ].join('\n')));
  put('guide.md', [
    '# Guide',
    '',
    '[live](/live/) and [absolute live](https://autolander.ai/live/) and [outside](https://example.com/nope/)',
    ...(dead ? ['[dead](/missing-md/) and [absolute dead](https://autolander.ai/gone-md/)'] : []),
    '',
  ].join('\n'));
  put('llms.txt', [
    '# Site',
    '- [Live](https://autolander.ai/live/): ok',
    ...(dead ? ['- [Dead](https://autolander.ai/missing-llms.md): gone'] : []),
    '',
  ].join('\n'));
  put('sitemap.xml', `<?xml version="1.0"?><urlset><url><loc>https://autolander.ai/live/</loc></url>${dead ? '<url><loc>https://autolander.ai/missing-sitemap/</loc></url>' : ''}</urlset>\n`);
  // Not a crawlable file type: its "dead" link must not count.
  put('notes.txt', '[ignored](/not-crawled/)\n');
  put('data.json', '{"href":"/not-crawled-json/"}\n');
  return dir;
}

const served = (dir) => (path) => path === '/' || servedBy(dir, path);

test('internalPath resolves every internal href form and ignores externals and non-navigational links', () => {
  assert.equal(internalPath('/missing/'), '/missing/');
  assert.equal(internalPath('../gone-rel/', '/a/b/'), '/a/gone-rel/');
  assert.equal(internalPath('sibling/', '/a/b/'), '/a/b/sibling/');
  assert.equal(internalPath('https://autolander.ai/gone/'), '/gone/');
  assert.equal(internalPath('https://autolander.ai'), '/');
  assert.equal(internalPath('https://www.autolander.ai/gone-www/?q=1#x'), '/gone-www/');
  assert.equal(internalPath('http://autolander.ai/gone-http/'), '/gone-http/');
  assert.equal(internalPath('/a%20b/'), '/a b/');
  assert.equal(internalPath('/x/?a=1&amp;b=2'), '/x/');
  for (const href of ['#top', 'mailto:a@b.c', 'tel:1', 'sms:1', 'javascript:void(0)', 'data:text/plain,x',
    'https://example.com/x/', '//cdn.example.com/x.js', 'https://autolander.ai.example.com/gone/', '']) {
    assert.equal(internalPath(href, '/a/'), null, href);
  }
});

test('the crawler reports every planted dead link (root-relative, ../ relative, Markdown, absolute, llms, sitemap) and nothing else', (t) => {
  const dir = fixture(t);
  const files = crawlableFiles(dir);
  const urlPaths = files.map((f) => f.urlPath).sort();
  assert.deepEqual(urlPaths, ['/', '/a/b/', '/a/live/', '/guide.md', '/live/', '/llms.txt', '/sitemap.xml'].sort(),
    'crawls HTML, Markdown, llms.txt and sitemaps only');
  const dead = crawl(files, served(dir));
  const found = dead.map((d) => [d.page, d.href, d.path]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const expected = [...PLANTED].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  assert.deepEqual(found, expected);
});

test('the same site with the dead links removed crawls clean (no false positives)', (t) => {
  const dir = fixture(t, { dead: false });
  assert.deepEqual(crawl(crawlableFiles(dir), served(dir)), []);
});

test('servedBy and urlPathOf: a file, a directory index, and never a path outside the root', (t) => {
  const dir = fixture(t, { dead: false });
  assert.ok(servedBy(dir, '/live/'));
  assert.ok(servedBy(dir, '/live'), 'a directory with an index.html serves the path without its slash too');
  assert.ok(servedBy(dir, '/files/report.pdf'));
  assert.ok(!servedBy(dir, '/files/'), 'a directory without index.html is not a page');
  assert.ok(!servedBy(dir, '/missing/'));
  assert.ok(!servedBy(dir, '/../outside/'));
  assert.equal(urlPathOf(dir, join(dir, 'index.html')), '/');
  assert.equal(urlPathOf(dir, join(dir, 'a', 'b', 'index.html')), '/a/b/');
  assert.equal(urlPathOf(dir, join(dir, 'guide.md')), '/guide.md');
});

test('the CLI exits 1 and names each dead link, and exits 0 on a clean tree', (t) => {
  const dirty = spawnSync(execPath, [CLI, fixture(t)], { encoding: 'utf8' });
  assert.equal(dirty.status, 1, dirty.stderr);
  assert.match(dirty.stderr, new RegExp(`${PLANTED.length} dead internal link\\(s\\)`));
  for (const [from, href] of PLANTED) assert.ok(dirty.stderr.includes(`${from} -> ${href}`), `${from} -> ${href}`);

  const clean = spawnSync(execPath, [CLI, fixture(t, { dead: false })], { encoding: 'utf8' });
  assert.equal(clean.status, 0, clean.stderr);
  assert.match(clean.stdout, /no dead internal links/);

  const missing = spawnSync(execPath, [CLI, join(tmpdir(), 'al-linkcrawl-does-not-exist')], { encoding: 'utf8' });
  assert.equal(missing.status, 2);
});
