import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertNoUnverifiedProof } from './proof-build-guard.mjs';
import { leanBaseCss, assertClassCoverage } from './route-css.mjs';
import { loadEnv } from 'vite';
import { META } from '../shared/ai-visibility-content.js';
import { TEAM_META } from '../shared/team-content.js';
import { renderAiVisibilityMirror } from '../src/ai/static-mirror.js';
import { renderTeamMirror } from '../src/team/static-mirror.js';
import { aiVisibilityHead } from './seo/data-ai-visibility.mjs';
import { teamHead } from './seo/data-team.mjs';
import {
  buildPageShell,
  isPreviewShell,
} from './spa-shell.mjs';

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
const alTagsTag = /<script\b[^>]*src="\/al-tags-v1\.js"[^>]*><\/script>/;
if (!alTagsTag.test(noindexShell)) throw new Error('spa-fallback: missing al-tags tag');
const adminShell = noindexShell.replace(alTagsTag, '');
writeFileSync(adminIndexPath, adminShell, 'utf8');
// Same trick for the bare /pay route (self-serve picker). /pay/:token deep
// links still rely on the 404.html SPA-fallback above — GitHub Pages can't
// pre-generate a page per token — but the exact /pay path gets this same
// zero-redirect shell the /admin path already has.
mkdirSync(payDir, { recursive: true });
writeFileSync(payIndexPath, noindexShell, 'utf8');
// Dedicated readable shells for the two exact-path lazy routes. The utility shells above remain
// empty and noindex; these marketing routes carry their own metadata and crawlable static body.
const preview = isPreviewShell(appShell);
const env = loadEnv(preview ? 'preview' : 'production', process.cwd(), '');
const capiUrl = env.VITE_CAPI_URL || 'https://autolander.ai';
const manifest = JSON.parse(readFileSync(join(distDir, '.vite/manifest.json'), 'utf8'));
const indexCssFiles = new Set(manifest['index.html'].css || []);
const cssAllowlist = JSON.parse(readFileSync(new URL('./route-css-allowlist.json', import.meta.url), 'utf8'));

// Keep the existing mirrors and React boot. Only these two marketing routes
// receive lean CSS; the homepage and utility shells retain the full stylesheet.
function leanRouteShell(moduleId, mirrorHtml) {
  const entry = manifest[moduleId];
  if (!entry) throw new Error(`Missing route module: ${moduleId}`);
  const seen = new Set();
  const visit = (key) => {
    if (seen.has(key)) return;
    seen.add(key);
    if (!manifest[key]) throw new Error(`Missing manifest import: ${key}`);
    for (const child of manifest[key].imports || []) visit(child);
  };
  visit(moduleId);
  const cssFiles = [...new Set([...seen].flatMap((key) => manifest[key].css || []))]
    .filter((file) => !indexCssFiles.has(file));
  const styles = [...appShell.matchAll(/<style data-inline-app-css>([\s\S]*?)<\/style>/g)];
  if (styles.length !== 1 || !cssFiles.length) throw new Error('Expected app CSS and route CSS');
  for (const file of [entry.file, ...cssFiles]) {
    const path = resolve(distDir, file);
    if (!path.startsWith(resolve(distDir, 'assets') + sep) || !existsSync(path)) throw new Error(`Missing route asset: ${file}`);
  }
  const css = leanBaseCss(styles[0][1]) + cssFiles.map((file) => readFileSync(join(distDir, file), 'utf8')).join('\n');
  assertClassCoverage(mirrorHtml, css, cssAllowlist);
  return {
    shell: appShell.replace(styles[0][0], () => `<style data-inline-route-css>${css.replace(/<\/style/gi, '<\\/style')}</style>`),
    jsHref: '/' + entry.file,
  };
}

const teamDir = join(distDir, 'team');
mkdirSync(teamDir, { recursive: true });
const teamMirror = renderTeamMirror();
const teamAssets = leanRouteShell('src/team/TeamApp.jsx', teamMirror);
writeFileSync(join(teamDir, 'index.html'), buildPageShell(teamAssets.shell, {
  title: TEAM_META.title,
  headHtml: teamHead({ preview }),
  mirrorHtml: teamMirror,
  jsHref: teamAssets.jsHref,
}), 'utf8');

const aiDir = join(distDir, 'ai-visibility');
mkdirSync(aiDir, { recursive: true });
const aiMirror = renderAiVisibilityMirror({ capiUrl });
const aiAssets = leanRouteShell('src/ai/AiVisibilityApp.jsx', aiMirror);
writeFileSync(join(aiDir, 'index.html'), buildPageShell(aiAssets.shell, {
  title: META.title,
  headHtml: aiVisibilityHead({ preview }),
  mirrorHtml: aiMirror,
  jsHref: aiAssets.jsHref,
}), 'utf8');

// The bundler must never read local proof in production. This separate post-build
// audit reads it only to ensure none of its unverified claims escaped into dist.
const localProof = join(process.cwd(), 'shared/ai-visibility-proof.local.js');
if (!preview && existsSync(localProof)) {
  const { PROOF_ENTRIES } = await import(pathToFileURL(localProof).href);
  assertNoUnverifiedProof(distDir, PROOF_ENTRIES);
}

// Only remove the two known build-owned paths; leave unexpected contents to fail.
unlinkSync(join(distDir, '.vite/manifest.json'));
rmdirSync(join(distDir, '.vite'));
