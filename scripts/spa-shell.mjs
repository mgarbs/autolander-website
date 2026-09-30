import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export const STATIC_HOME_BLOCK = /<!--AL_STATIC_HOME_START-->[\s\S]*?<!--AL_STATIC_HOME_END-->/;
// The whole #root element of index.html (the static home block and the whitespace around it).
export const STATIC_HOME_ROOT = /<div id="root">\s*<!--AL_STATIC_HOME_START-->[\s\S]*?<!--AL_STATIC_HOME_END-->\s*<\/div>/;
// Vite's entry tag, which it places in <head>.
export const ENTRY_SCRIPT = /\s*<script type="module" crossorigin src="(\/assets\/index-[\w-]+\.js)"><\/script>/;

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
  rootHtml,
  hydrate,
  cssHref,
  jsHref,
  modulePreloadHrefs = [],
  disabledCssHrefs = [],
  noscriptHtml = '<noscript></noscript>',
}) {
  let html = appShell;
  const homeMatches = occurrences(html, STATIC_HOME_BLOCK);
  if (homeMatches.length !== 1) {
    throw new Error(`spa-shell: expected exactly one static homepage block, found ${homeMatches.length}`);
  }
  if (hydrate) {
    // React's prerendered page is the whole of #root, with nothing (not even whitespace) around it: hydration
    // adopts #root's children as they are. The page markers sit outside #root.
    if (occurrences(html, STATIC_HOME_ROOT).length !== 1) throw new Error('spa-shell: expected exactly one #root block');
    if (!rootHtml || /^\s|\s$/.test(rootHtml)) throw new Error('spa-shell: rootHtml must be React markup with no outer whitespace');
    html = html.replace(STATIC_HOME_ROOT, () => `<!--AL_STATIC_PAGE_START--><div id="root" data-al-hydrate="${esc(hydrate)}">${rootHtml}</div><!--AL_STATIC_PAGE_END-->`);
  } else {
    html = html.replace(STATIC_HOME_BLOCK, () => mirrorHtml);
  }

  for (const [name, pattern] of Object.entries(HEAD_PATTERNS)) {
    html = removeExactlyOnce(html, name, pattern);
  }

  const assets = [
    cssHref ? `<link rel="stylesheet" crossorigin href="${esc(cssHref)}" />` : '',
    jsHref ? `<link rel="modulepreload" data-al-route-entry crossorigin href="${esc(jsHref)}" />` : '',
    ...modulePreloadHrefs.map((href) => `<link rel="modulepreload" crossorigin href="${esc(href)}" />`),
    // Already inlined: `disabled` keeps it from being fetched or applied, and its presence stops Vite's
    // preload helper from appending (and waiting on) a second copy when the route chunk loads.
    ...disabledCssHrefs.map((href) => `<link rel="stylesheet" href="${esc(href)}" disabled data-al-inlined-css />`),
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

// Loads the app after the first paint. The shell's HTML is the finished first screen (prerendered React on
// /ai-visibility/ and /team/, the static home block on /), so no script is on the path to it: the entry module
// (and the route chunks it will import) are requested once the browser has painted, or after 3 s at the latest
// (a background tab never paints). Taps on a demo button before the app is up are remembered and replayed by
// the app on mount (App.jsx, TeamApp.jsx).
const BOOT_SCRIPT = `(function(){var s=document.currentScript,d=document,w=window,done=0;`
  + `function go(){if(done)return;done=1;var h=d.head,p=(s.getAttribute('data-al-preload')||'').split(' ');`
  + `for(var i=0;i<p.length;i++)if(p[i]){var l=d.createElement('link');l.rel='modulepreload';l.crossOrigin='';l.href=p[i];h.appendChild(l)}`
  + `var e=d.createElement('script');e.type='module';e.crossOrigin='';e.src=s.getAttribute('data-al-entry');h.appendChild(e)}`
  + `function soon(){setTimeout(go,0)}`
  + `w.addEventListener('click',function(v){var t=v.target;if(!w.__alHydrated&&t&&t.closest&&t.closest('[data-demo-application-trigger]'))w.__alPendingDemo=true},true);`
  + `try{if((PerformanceObserver.supportedEntryTypes||[]).indexOf('paint')<0)throw 0;`
  + `new PerformanceObserver(function(l,o){if(l.getEntriesByName('first-contentful-paint').length){o.disconnect();soon()}}).observe({type:'paint',buffered:true})}`
  + `catch(x){requestAnimationFrame(soon)}setTimeout(go,3000)})();`;

export function bootLoaderHtml({ entryHref, preloadHrefs = [], routeEntryHref = '' }) {
  return `<script data-al-boot data-al-entry="${esc(entryHref)}"${routeEntryHref ? ` data-al-route-entry="${esc(routeEntryHref)}"` : ''}`
    + `${preloadHrefs.length ? ` data-al-preload="${esc(preloadHrefs.join(' '))}"` : ''}>${BOOT_SCRIPT}</script>`;
}

// Moves Vite's head entry <script type="module"> to the post-paint loader at the end of <body>.
export function deferEntryToPaint(html, { preloadHrefs = [], routeEntryHref = '' } = {}) {
  const tags = occurrences(html, ENTRY_SCRIPT);
  if (tags.length !== 1) throw new Error(`spa-shell: expected exactly one entry module script, found ${tags.length}`);
  const entryHref = tags[0][1];
  let out = html.replace(ENTRY_SCRIPT, '');
  if (!/<\/body>/i.test(out)) throw new Error('spa-shell: </body> is missing');
  out = out.replace(/<\/body>/i, () => `  ${bootLoaderHtml({ entryHref, preloadHrefs, routeEntryHref })}\n  </body>`);
  return out;
}
