// Dead internal link crawler for the generated site.
//
// Reads rendered output (HTML pages, Markdown twins, llms*.txt, sitemap.xml) and reports every
// link to an autolander.ai path that the site does not serve. Used two ways:
//   • test/dead-links.test.js: over public/ for the current publish state, over sandbox builds
//     of simulated publish states (first N AEO articles published, random subsets), and over
//     dist/ when a production build is present;
//   • CLI after `npm run build`:  node scripts/seo/link-crawl.mjs dist
//     (exit code 1 and a list when any internal link is dead).
//
// "Served" for a directory of built output = a file at the path, or <path>/index.html. Paths the
// production build adds outside public/ (the SPA homepage, the dedicated SPA shells, /admin/,
// /pay/ and the retired AEO URL stub) are passed in as extra paths by the caller.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE_ORIGINS = ['https://autolander.ai', 'http://autolander.ai', 'https://www.autolander.ai'];

const decodeEntities = (s) => String(s)
  .replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<').replaceAll('&gt;', '>');

// Internal URL path of an href, or null for external / non-navigational links.
export function internalPath(href, fromPath = '/') {
  let h = decodeEntities(href).trim();
  if (!h || h.startsWith('#') || /^(mailto|tel|sms|javascript|data):/i.test(h)) return null;
  const origin = SITE_ORIGINS.find((o) => h === o || h.startsWith(`${o}/`) || h.startsWith(`${o}?`) || h.startsWith(`${o}#`));
  if (origin) h = h.slice(origin.length) || '/';
  else if (/^[a-z][a-z0-9+.-]*:/i.test(h) || h.startsWith('//')) return null;
  let url;
  try { url = new URL(h, `https://site.invalid${fromPath}`); } catch { return null; }
  if (url.hostname !== 'site.invalid') return null;
  try { return decodeURIComponent(url.pathname); } catch { return url.pathname; }
}

// Does a directory of built output serve this URL path?
export function servedBy(dir, urlPath) {
  const rel = urlPath.replace(/^\/+/, '');
  const file = resolve(dir, rel);
  const inside = relative(dir, file);
  if (inside.startsWith('..') || isAbsolute(inside)) return false;
  if (rel && existsSync(file) && statSync(file).isFile()) return true;
  return existsSync(resolve(file, 'index.html'));
}

export function listFiles(dir, { skipDirs = [] } = {}) {
  const out = [];
  if (!existsSync(dir)) return out;
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.includes(relative(dir, p).split('\\').join('/'))) walk(p);
      } else if (entry.isFile()) {
        out.push(p);
      }
    }
  };
  walk(dir);
  return out;
}

// URL path a built file answers at (dir/index.html -> /dir/, file.md -> /file.md).
export function urlPathOf(root, file) {
  const rel = relative(root, file).split('\\').join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

const HREF_RE = /<a\b[^>]*?\shref\s*=\s*"([^"]*)"/gi;
const MD_LINK_RE = /\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
const LOC_RE = /<loc>([^<]+)<\/loc>/g;

// Every link a file carries that points at the site: [{ href, path }].
export function linksIn(file, fromPath) {
  const text = readFileSync(file, 'utf8');
  const hrefs = [];
  if (/\.html?$/i.test(file)) {
    for (const m of text.matchAll(HREF_RE)) hrefs.push(m[1]);
  } else if (/\.(md|txt)$/i.test(file)) {
    for (const m of text.matchAll(MD_LINK_RE)) hrefs.push(m[1]);
  } else if (/sitemap[^/\\]*\.xml$/i.test(file)) {
    for (const m of text.matchAll(LOC_RE)) hrefs.push(m[1]);
  }
  return hrefs
    .map((href) => ({ href, path: internalPath(href, fromPath) }))
    .filter((link) => link.path !== null);
}

// Crawl `files` ([{ file, urlPath }]) and return every dead internal link.
export function crawl(files, isServed) {
  const dead = [];
  for (const { file, urlPath } of files) {
    for (const link of linksIn(file, urlPath)) {
      if (!isServed(link.path)) dead.push({ page: urlPath, href: link.href, path: link.path });
    }
  }
  return dead;
}

// The crawlable files of a built root: HTML pages, Markdown twins, llms*.txt and sitemaps.
export function crawlableFiles(root, options = {}) {
  return listFiles(root, options)
    .filter((file) => /\.(html?|md)$/i.test(file) || /[\\/]llms(-full)?\.txt$/i.test(file) || /[\\/][^\\/]*sitemap[^\\/]*\.xml$/i.test(file))
    .map((file) => ({ file, urlPath: urlPathOf(root, file) }));
}

function main() {
  const target = resolve(process.argv[2] || 'dist');
  if (!existsSync(target)) {
    console.error(`link-crawl: ${target} does not exist (run npm run build first)`);
    process.exitCode = 2;
    return;
  }
  const dead = crawl(crawlableFiles(target), (path) => path === '/' || servedBy(target, path));
  if (dead.length) {
    console.error(`link-crawl: ${dead.length} dead internal link(s) in ${target}:`);
    for (const d of dead) console.error(`  ${d.page} -> ${d.href}`);
    process.exitCode = 1;
    return;
  }
  console.log(`link-crawl: no dead internal links in ${target}`);
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();
