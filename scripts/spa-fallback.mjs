import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
copyFileSync(indexPath, fallbackPath);
mkdirSync(adminDir, { recursive: true });
copyFileSync(indexPath, adminIndexPath);
// Same trick for the bare /pay route (self-serve picker). /pay/:token deep
// links still rely on the 404.html SPA-fallback above — GitHub Pages can't
// pre-generate a page per token — but the exact /pay path gets this same
// zero-redirect shell the /admin path already has.
mkdirSync(payDir, { recursive: true });
copyFileSync(indexPath, payIndexPath);
