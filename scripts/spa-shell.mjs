import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export const STATIC_HOME_BLOCK = /<!--AL_STATIC_HOME_START-->[\s\S]*?<!--AL_STATIC_HOME_END-->/;

export const HEAD_PATTERNS = {
  description: /\s*<meta name="description"[^>]*\/>/i,
  canonical: /\s*<link rel="canonical"[^>]*\/>/i,
  openGraph: /\s*<!-- Open Graph \(Facebook, iMessage, Slack, LinkedIn, etc\.\) -->[\s\S]*?(?=\s*<!-- Twitter Card -->)/i,
  twitter: /\s*<!-- Twitter Card -->[\s\S]*?<meta name="twitter:image:alt"[^>]*\/>/i,
  jsonLd: /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
  title: /\s*<title>[\s\S]*?<\/title>/i,
  noscript: /\s*<noscript>[\s\S]*?<\/noscript>/i,
};

function occurrences(html, pattern) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  return [...html.matchAll(new RegExp(pattern.source, flags))];
}

export function removeExactlyOnce(html, name, pattern) {
  const matches = occurrences(html, pattern);
  if (matches.length !== 1) {
    throw new Error(`spa-shell: expected exactly one ${name}, found ${matches.length}`);
  }
  return html.replace(pattern, '');
}

export function stripStaticHome(html) {
  return removeExactlyOnce(html, 'AL_STATIC_HOME_START/END block', STATIC_HOME_BLOCK);
}

export function findChunkAsset(distDir, chunkName, extension) {
  const assetsDir = join(distDir, 'assets');
  const suffix = extension.startsWith('.') ? extension : `.${extension}`;
  const matches = readdirSync(assetsDir)
    .filter((name) => name.startsWith(`${chunkName}-`) && name.endsWith(suffix));
  if (matches.length !== 1) {
    throw new Error(`spa-shell: expected one ${chunkName}${suffix} asset, found ${matches.length}: ${matches.join(', ')}`);
  }
  return `/assets/${matches[0]}`;
}

export function isPreviewShell(html) {
  return html.includes('autolander-preview.pages.dev')
    || /<meta name="robots" content="noindex, nofollow"\s*\/>/i.test(html);
}

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

export function buildPageShell(appShell, {
  title,
  headHtml,
  mirrorHtml,
  cssHref,
  jsHref,
  noscriptHtml = '<noscript></noscript>',
}) {
  let html = appShell;
  const homeMatches = occurrences(html, STATIC_HOME_BLOCK);
  if (homeMatches.length !== 1) {
    throw new Error(`spa-shell: expected exactly one static homepage block, found ${homeMatches.length}`);
  }
  html = html.replace(STATIC_HOME_BLOCK, mirrorHtml);

  for (const [name, pattern] of Object.entries(HEAD_PATTERNS)) {
    html = removeExactlyOnce(html, name, pattern);
  }

  const assets = [
    cssHref ? `<link rel="stylesheet" crossorigin href="${esc(cssHref)}" />` : '',
    jsHref ? `<link rel="modulepreload" data-al-route-entry crossorigin href="${esc(jsHref)}" />` : '',
  ].filter(Boolean).join('\n    ');
  const insert = `    <title>${esc(title)}</title>\n${headHtml}${assets ? `\n    ${assets}` : ''}\n`;
  if (!/<\/head>/i.test(html)) throw new Error('spa-shell: </head> is missing');
  html = html.replace(/<\/head>/i, `${insert}</head>`);
  if (!html.includes(`<title>${esc(title)}</title>`)) {
    throw new Error('spa-shell: route title insertion failed');
  }
  if (headHtml && !html.includes(headHtml)) {
    throw new Error('spa-shell: route metadata insertion failed');
  }

  if (!/<\/body>/i.test(html)) throw new Error('spa-shell: </body> is missing');
  html = html.replace(/<\/body>/i, `${noscriptHtml}\n  </body>`);

  const robots = occurrences(html, /<meta name="robots"[^>]*>/i);
  if (robots.length > 1) {
    throw new Error(`spa-shell: generated page carries ${robots.length} robots meta tags`);
  }
  return html;
}
