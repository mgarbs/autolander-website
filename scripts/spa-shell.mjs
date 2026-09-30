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
// /aeo-geo-for-car-dealers/ and /team/, the static home block on /), so no script is on the path to it: the entry module
// (and the route chunks it will import) are requested once the browser has painted, or after 3 s at the latest
// (a background tab never paints). Taps on a demo button before the app is up are remembered and replayed by
// the app on mount (App.jsx, TeamApp.jsx). Input (scroll, touch, key) since the page's last fragment navigation is
// noted in __alInput, so the app does not scroll a visitor who has moved back to that fragment (lib/use-live.js).
const BOOT_SCRIPT = `(function(){var s=document.currentScript,d=document,w=window,done=0;`
  + `function go(){if(done)return;done=1;var h=d.head,p=(s.getAttribute('data-al-preload')||'').split(' ');`
  + `for(var i=0;i<p.length;i++)if(p[i]){var l=d.createElement('link');l.rel='modulepreload';l.crossOrigin='';l.href=p[i];h.appendChild(l)}`
  + `var e=d.createElement('script');e.type='module';e.crossOrigin='';e.src=s.getAttribute('data-al-entry');h.appendChild(e)}`
  + `function soon(){setTimeout(go,0)}`
  + `w.addEventListener('click',function(v){var t=v.target;if(!w.__alHydrated&&t&&t.closest&&t.closest('[data-demo-application-trigger]'))w.__alPendingDemo=true},true);`
  + `var ev=['wheel','touchstart','keydown','pointerdown'];for(var j=0;j<ev.length;j++)w.addEventListener(ev[j],function(){w.__alInput=1},{capture:true,passive:true});w.addEventListener('hashchange',function(){w.__alInput=0});`
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

// Cloudflare Web Analytics for the pages the Worker serves with Cache-Control: no-transform (worker/src/agent/
// no-transform.js), where the edge no longer injects it: the same beacon with the same settings the edge injects
// today, added once the page has loaded and gone idle (first interaction or 1.5 s after `load`), so it is never on
// the path to the first paint. The `version` key makes it report to the zone's own /cdn-cgi/rum (same origin, as the
// edge beacon does); without it the beacon posts to cloudflareinsights.com, which rejects this zone's token (404,
// no CORS header). It stands down if the edge beacon is present (kill switch off) and never runs off production.
export const CF_WEB_ANALYTICS_TOKEN = '901f8ba358dc4edaa9f834e9e9ce8b8b';
const BEACON_SCRIPT = `(function(w,d){if(location.hostname!=='autolander.ai')return;var done=0,t,ev=['pointerdown','keydown','touchstart','scroll'];`
  + `function add(){if(done)return;done=1;clearTimeout(t);for(var i=0;i<ev.length;i++)w.removeEventListener(ev[i],go,true);`
  + `if(w.__cfBeacon||d.querySelector('script[data-cf-beacon]'))return;`
  + `var s=d.createElement('script');s.defer=true;s.src='https://static.cloudflareinsights.com/beacon.min.js';`
  + `s.setAttribute('data-cf-beacon','{"version":"2024.11.0","token":"${CF_WEB_ANALYTICS_TOKEN}","r":1,"spa":2}');d.body.appendChild(s)}`
  + `function go(){if(w.requestIdleCallback)w.requestIdleCallback(add,{timeout:2000});else setTimeout(add,1)}`
  + `function arm(){t=setTimeout(go,1500);for(var i=0;i<ev.length;i++)w.addEventListener(ev[i],go,{capture:true,passive:true})}`
  + `if(d.readyState==='complete')arm();else w.addEventListener('load',arm,{once:true})})(window,document);`;

export function beaconLoaderHtml() {
  return `<script data-al-cf-beacon-loader>${BEACON_SCRIPT}</script>`;
}

// A retired marketing URL (shared/ai-visibility-route.js AI_VISIBILITY_LEGACY_PATHS) as a static page. The Worker
// answers the old URL with a 301 (worker/src/agent/moved-pages.js) before GitHub Pages is asked; this page only serves
// when the Worker fails open or is off, and on the Pages preview. It forwards at once, keeping ?query and #hash, with a
// no-JS meta refresh and a visible link. The target is relative, so the preview stays on its own host; the canonical
// names the new URL. Deliberately no al-tags, Zaraz, beacon loader, email address or robots noindex: a redirect is
// not a page view, and the canonical carries the signal.
export function legacyRedirectHtml({ target, canonical, title, label }) {
  if (!/^\/[a-z0-9-]+\/$/.test(String(target))) throw new Error(`spa-shell: legacy redirect target must be a site path, got ${target}`);
  const script = `(function(){var d='${target}'+(location.search||'')+(location.hash||'');try{location.replace(d)}catch(e){location.href=d}})();`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <link rel="canonical" href="${esc(canonical)}" />
  <script>${script}</script>
  <noscript><meta http-equiv="refresh" content="0; url=${esc(target)}" /></noscript>
  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#050505;color:#f8fafc;font:16px/1.6 system-ui,sans-serif}a{color:#93c5fd}</style>
</head>
<body>
  <main>
    <p><a id="moved-link" href="${esc(target)}">This page moved: ${esc(label)}</a></p>
  </main>
  <script>(function(){var a=document.getElementById('moved-link');if(a)a.href=a.getAttribute('href')+(location.search||'')+(location.hash||'');})();</script>
</body>
</html>
`;
}

export function appendBeaconLoader(html) {
  if (html.includes('data-al-cf-beacon-loader')) throw new Error('spa-shell: beacon loader already present');
  if (!/<\/body>/i.test(html)) throw new Error('spa-shell: </body> is missing');
  return html.replace(/<\/body>/i, () => `  ${beaconLoaderHtml()}\n  </body>`);
}
