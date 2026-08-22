import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');
const fallbackPath = join(distDir, '404.html');
const adminDir = join(distDir, 'admin');
const adminIndexPath = join(adminDir, 'index.html');
const payDir = join(distDir, 'pay');
const payIndexPath = join(payDir, 'index.html');

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html was not found. Run this after vite build.');
}

function inlineAppStyles(htmlPath) {
  const html = readFileSync(htmlPath, 'utf8');
  const stylesheetPattern = /(\s*)<link rel="stylesheet"[^>]*href="([^"]*\/assets\/index-[^"]+\.css)"[^>]*>\s*/;
  const match = html.match(stylesheetPattern);

  if (!match) return;

  const cssHref = match[2].replace(/^\//, '');
  const cssPath = join(distDir, cssHref);
  if (!existsSync(cssPath)) return;

  const css = readFileSync(cssPath, 'utf8').replace(/<\/style/gi, '<\\/style');
  const styleTag = `${match[1]}<style data-inline-app-css>\n${css}\n${match[1]}</style>\n`;
  writeFileSync(htmlPath, html.replace(stylesheetPattern, styleTag));
}

inlineAppStyles(indexPath);
const appShell = readFileSync(indexPath, 'utf8');

// index.html carries a static replica of the homepage hero inside #root (see the comment there):
// it gives "/" a crawlable body and paints something other than black while the bundle loads.
// These derived shells are NOT the homepage — 404.html backs /pay/:token and /ref/* deep links,
// and /admin + /pay render their own apps — so a marketing hero would flash on a payment link
// before the real UI mounts. Strip it back to the empty #root those routes expect.
const STATIC_HOME_BLOCK = /<!--AL_STATIC_HOME_START-->[\s\S]*?<!--AL_STATIC_HOME_END-->/;
function stripStaticHome(html) {
  if (!STATIC_HOME_BLOCK.test(html)) {
    throw new Error(
      'spa-fallback: the AL_STATIC_HOME_START/END markers are missing from dist/index.html. If the '
      + 'static home block was renamed or removed, update STATIC_HOME_BLOCK — otherwise '
      + '/pay/:token and /admin would ship with the marketing hero in their shell.',
    );
  }
  return html.replace(STATIC_HOME_BLOCK, '');
}

const noindexShell = stripStaticHome(appShell)
  .replace(/\s*<link rel="canonical" href="https:\/\/autolander\.ai\/" \/>/, '')
  .replace('    <meta name="description"', '    <meta name="robots" content="noindex, nofollow, noarchive" />\n    <meta name="description"');

// GitHub Pages serves 404.html for dynamic SPA paths such as /pay/:token and
// referral links. These utility/customer-specific routes must never compete
// with the public marketing pages in search.
writeFileSync(fallbackPath, noindexShell, 'utf8');
mkdirSync(adminDir, { recursive: true });
writeFileSync(adminIndexPath, noindexShell, 'utf8');
// Same trick for the bare /pay route (self-serve picker). /pay/:token deep
// links still rely on the 404.html SPA-fallback above — GitHub Pages can't
// pre-generate a page per token — but the exact /pay path gets this same
// zero-redirect shell the /admin path already has.
mkdirSync(payDir, { recursive: true });
writeFileSync(payIndexPath, noindexShell, 'utf8');
