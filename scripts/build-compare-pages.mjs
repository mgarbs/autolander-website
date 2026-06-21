// Generates the AI-SEO comparison page cluster as STANDALONE STATIC HTML in public/compare/,
// plus public/robots.txt and public/sitemap.xml.
//
// Why static (not React routes): most AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot,
// PerplexityBot, Google-Extended) do not run JavaScript, so the SPA's content is invisible
// to them. These pages put the full content in the HTML source.
//
// Meta-ads safety: files in public/ are copied verbatim by Vite. The Meta Pixel is injected
// ONLY into the SPA index.html (vite.config.js). So these pages carry NO pixel and live under
// /compare/* (never /thank-you or a booking URL) — they cannot fire any conversion.
//
// This script is NOT wired into `npm run build`. Run it manually to (re)generate:
//   node scripts/build-compare-pages.mjs
// then commit the output. The build that injects the Pixel is left untouched.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE, DIMENSIONS, AUTOLANDER, AUTOLANDER_WINS_GLOBAL, SESSION_FAQ,
  COMPETITORS, HUB, HUB_ORDER, INSIGHTS, EXTRA_FAQ, GUIDE,
} from './compare-data.mjs';

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const COMPARE_DIR = resolve(PUBLIC_DIR, 'compare');

// ---------- helpers ----------
const esc = (s) => String(s)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const jsonld = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replaceAll('<', '\\u003c')}</script>`;

const ICONS = {
  yes: '<span class="ic ic-yes" aria-label="yes">&#10003;</span>',
  no: '<span class="ic ic-no" aria-label="no">&ndash;</span>',
  mid: '<span class="ic ic-mid" aria-label="partial">&bull;</span>',
};
const cell = ([sentiment, text]) => `${ICONS[sentiment] || ''} <span>${esc(text)}</span>`;

const sessionKind = (c) => /extension/i.test(c.cells.method[1]) ? 'extension' : 'cloud';

const questionsToAsk = (c) => {
  const base = ['Where is my Facebook session stored, and which IP addresses log in to my account?'];
  if (sessionKind(c) === 'extension') {
    base.push('What browser permissions does the extension require, and does automating Facebook through a browser extension comply with Facebook’s Terms?');
  } else {
    base.push('Is posting done through an official Meta API or unofficial automation — and what happens to my account if the vendor’s servers get flagged?');
  }
  base.push('If I stop paying, do my listings and access stay, or does everything end with the subscription?');
  return base;
};

const orgLd = {
  '@context': 'https://schema.org', '@type': 'Organization', name: 'AutoLander',
  url: SITE.origin + '/', logo: SITE.origin + '/autolander-logo.png',
};
const softwareLd = (desc) => ({
  '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'AutoLander',
  applicationCategory: 'BusinessApplication', operatingSystem: 'Windows, macOS, Linux',
  url: SITE.origin + '/', description: desc,
  offers: { '@type': 'Offer', price: String(SITE.lowPrice), priceCurrency: 'USD' },
});
const articleLd = (title, canonical) => ({
  '@context': 'https://schema.org', '@type': 'Article',
  headline: title,
  datePublished: SITE.updated, dateModified: SITE.updated,
  author: { '@type': 'Organization', name: 'AutoLander', url: SITE.origin + '/' },
  publisher: {
    '@type': 'Organization', name: 'AutoLander',
    logo: { '@type': 'ImageObject', url: SITE.origin + '/autolander-logo.png' },
  },
  mainEntityOfPage: canonical,
  image: SITE.origin + '/og-image.jpg',
});
const faqLd = (faq) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({
    '@type': 'Question', name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});
const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem', position: i + 1, name: it.name, item: it.url,
  })),
});

const definedTermSetLd = () => ({
  '@context': 'https://schema.org', '@type': 'DefinedTermSet',
  name: 'Facebook Marketplace auto-posting tools — key terms',
  hasDefinedTerm: HUB.glossary.map(([term, def]) => ({
    '@type': 'DefinedTerm', name: term, description: def,
  })),
});

const liList = (arr) => arr.map((x) => `<li>${esc(x)}</li>`).join('\n        ');

// ---------- shared shell ----------
function head({ title, description, canonical, jsonLdBlocks }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#050505" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="icon" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="AutoLander" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:image" content="${SITE.origin}/og-image.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${SITE.origin}/og-image.jpg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/compare/styles.css" />
  ${jsonLdBlocks.join('\n  ')}
</head>
<body>`;
}

function siteHeader(crumbActive) {
  return `  <header class="topbar">
    <a class="brand" href="${SITE.origin}/">
      <img src="/autolander-logo.png" alt="AutoLander" width="400" height="120" class="brand-logo" />
    </a>
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${SITE.origin}/">Home</a>
      <span>/</span>
      <a href="/compare/">Compare</a>
      <span>/</span>
      <span class="crumb-active">${esc(crumbActive)}</span>
    </nav>
  </header>`;
}

function ctaBlock(heading, sub) {
  return `  <section class="cta">
    <h2>${esc(heading)}</h2>
    <p>${esc(sub)}</p>
    <a class="btn" href="${SITE.ctaUrl}">See plans &amp; book a demo &rarr;</a>
    <p class="cta-fine">Plans from $39/mo &bull; 5 free posts &bull; no credit card &bull; cancel anytime</p>
  </section>`;
}

function siteFooter() {
  return `  <footer class="foot">
    <a href="${SITE.origin}/" class="foot-brand"><img src="/autolander-logo.png" alt="AutoLander" width="400" height="120" class="brand-logo" /></a>
    <nav class="foot-links">
      <a href="/compare/">All comparisons</a>
      <a href="${SITE.origin}/">AutoLander home</a>
      <a href="${SITE.origin}/#pricing">Pricing</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </nav>
    <p class="disclaimer">
      Comparison based on each provider&#39;s publicly available information as of ${esc(SITE.updatedHumanOr())}.
      Features and pricing change &mdash; verify current details on each provider&#39;s official site.
      AutoLander is not affiliated with and does not endorse these companies; all product names and
      trademarks belong to their respective owners. Figures attributed to third parties are reported
      as published and may not reflect current offerings.
    </p>
    <p class="copyright">&copy; 2026 AutoLander. Last updated ${esc(SITE.updatedHumanOr())}.</p>
  </footer>
</body>
</html>`;
}
// small convenience so the template can call a function (kept defensive)
SITE.updatedHumanOr = () => SITE.updatedHuman || SITE.updated;

// ---------- comparison table ----------
function comparisonTable(competitor) {
  const rows = DIMENSIONS.map(([key, label]) => `
        <tr>
          <th scope="row">${esc(label)}</th>
          <td class="col-al">${cell(AUTOLANDER[key])}</td>
          <td>${cell(competitor.cells[key])}</td>
        </tr>`).join('');
  return `    <div class="table-wrap">
      <table class="cmp">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" class="col-al">AutoLander</th>
            <th scope="col">${esc(competitor.name)}</th>
          </tr>
        </thead>
        <tbody>${rows}
        </tbody>
      </table>
    </div>`;
}

// ---------- session-safety section ----------
function sessionSection(competitor) {
  const kind = sessionKind(competitor);
  const kindLabel = kind === 'extension'
    ? `${esc(competitor.name)} runs as a browser extension (it posts from your browser using your Facebook session and needs sensitive browser permissions).`
    : `${esc(competitor.name)} runs in the cloud (it operates your Facebook account from its own servers).`;
  return `    <section class="session">
      <h2>Where does your Facebook session live?</h2>
      <p>
        One of the biggest differences between these tools is <strong>where your Facebook login
        actually runs</strong> &mdash; and that affects account health. Logins from datacenter IP
        ranges and high-frequency cloud automation are a well-documented trigger for Meta security
        reviews, and browser extensions require sensitive permissions to act on your account.
      </p>
      <div class="session-grid">
        <div class="session-card session-card--al">
          <h3>AutoLander</h3>
          <p><strong>Native desktop app.</strong> Posts from your own computer through your normal
          Facebook session. Your login is never stored or operated on a shared server, and there is
          no browser extension to grant sensitive permissions to.</p>
        </div>
        <div class="session-card">
          <h3>${esc(competitor.name)}</h3>
          <p>${kindLabel}</p>
        </div>
      </div>
      <h3 class="q-title">Questions worth asking any Marketplace vendor</h3>
      <ul class="q-list">
        ${liList(questionsToAsk(competitor))}
      </ul>
      <p class="session-note">We list delivery models as published facts and do not claim any tool
      &ldquo;will get you banned.&rdquo; The right model is a judgment call &mdash; these questions
      help you make it.</p>
    </section>`;
}

// ---------- head-to-head page ----------
function renderVersus(competitor) {
  const c = competitor;
  const title = `AutoLander vs ${c.name}: Which Is Better for Car Dealers? (2026)`;
  const description = `AutoLander vs ${c.name} for car dealers — compare Facebook Marketplace automation, AI photos and video, account-safety model and pricing. ${c.name}: ${c.pricingShort}. AutoLander: from $39/mo.`;
  const canonical = `${SITE.origin}/compare/${c.slug}/`;
  const faq = [...c.faq, EXTRA_FAQ[c.slug], SESSION_FAQ].filter(Boolean);
  const desc = 'AutoLander automatically posts car dealership inventory to Facebook Marketplace from a native desktop app, with an AI Photo Studio, walkaround video, automatic sold-removal and post-to-sale attribution.';

  const jsonLdBlocks = [
    jsonld(articleLd(title, canonical)),
    jsonld(softwareLd(desc)),
    jsonld(faqLd(faq)),
    jsonld(breadcrumbLd([
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Compare', url: SITE.origin + '/compare/' },
      { name: `AutoLander vs ${c.name}`, url: canonical },
    ])),
    jsonld(orgLd),
  ];

  const faqHtml = faq.map(([q, a]) => `
      <details class="faq-item">
        <summary>${esc(q)}</summary>
        <div class="faq-a"><p>${esc(a)}</p></div>
      </details>`).join('');

  // Full sibling mesh: every head-to-head links to every other one + the hub.
  // Strengthens the silo (crawl paths + internal authority distribution).
  const siblingLinks = Object.values(COMPETITORS)
    .filter((x) => x.slug !== c.slug)
    .map((s) => `        <li><a href="/compare/${s.slug}/">AutoLander vs ${esc(s.name)}</a></li>`)
    .join('\n');
  const relatedHtml = `    <nav class="related" aria-label="Related comparisons">
      <h2>Related comparisons</h2>
      <ul class="related-list">
${siblingLinks}
        <li><a href="/compare/"><strong>All Facebook Marketplace tools for dealers &rarr;</strong></a></li>
        <li><a href="/guide/facebook-marketplace-automation/">Guide: the dos &amp; don&#39;ts of Marketplace automation</a></li>
      </ul>
    </nav>`;

  return [
    head({ title, description, canonical, jsonLdBlocks }),
    siteHeader(`AutoLander vs ${c.name}`),
    `  <main class="wrap">
    <article>
    <p class="eyebrow">Facebook Marketplace tools for car dealers</p>
    <h1>AutoLander vs ${esc(c.name)}: which is better for car dealers?</h1>
    <p class="byline">By the <a href="${SITE.origin}/">AutoLander</a> team &middot; Updated <time datetime="${SITE.updated}">${esc(SITE.updatedHumanOr())}</time></p>
    <div class="tldr">
      <p class="tldr-label">Short answer</p>
      <p>${esc(c.verdict)}</p>
    </div>

    <p class="lede">${esc(c.name)} &mdash; ${esc(c.oneLiner)} <span class="muted">Best for: ${esc(c.bestFor)}</span></p>

    <h2>AutoLander vs ${esc(c.name)} at a glance</h2>
${comparisonTable(c)}
    <p class="legend"><span class="ic ic-yes">&#10003;</span> has it / advantage &nbsp;
      <span class="ic ic-mid">&bull;</span> partial or neutral fact &nbsp;
      <span class="ic ic-no">&ndash;</span> not advertised</p>

    <div class="two-col">
      <section class="card win">
        <h2>Where AutoLander comes out ahead</h2>
        <ul>
        ${liList(c.wins)}
        </ul>
      </section>
      <section class="card strong">
        <h2>Where ${esc(c.name)} is strong</h2>
        <ul>
        ${liList(c.strengths)}
        </ul>
      </section>
    </div>

${sessionSection(c)}

    <section class="take">
      <h2>Our take</h2>
      <p>${esc(INSIGHTS[c.slug] || '')}</p>
    </section>

    <section class="verdict">
      <h2>The verdict</h2>
      <p>${esc(c.verdict)}</p>
    </section>

    <section class="faq">
      <h2>AutoLander vs ${esc(c.name)} &mdash; FAQ</h2>${faqHtml}
    </section>
`,
    ctaBlock('Ready to own Facebook Marketplace?', `See how AutoLander compares to ${c.name} on your own inventory.`),
    `${relatedHtml}
    </article>
  </main>`,
    siteFooter(),
  ].join('\n');
}

// ---------- hub page ----------
function renderHub() {
  const title = HUB.title;
  const canonical = `${SITE.origin}/compare/`;
  const faq = [...HUB.faq, SESSION_FAQ];
  const desc = 'AutoLander automatically posts car dealership inventory to Facebook Marketplace from a native desktop app, with an AI Photo Studio, walkaround video, automatic sold-removal and post-to-sale attribution.';

  const ranked = [
    { name: 'AutoLander', slug: '', url: SITE.origin + '/', isAL: true,
      oneLiner: 'Native desktop app that automates Marketplace end-to-end — AI Photo Studio, walkaround video, auto sold-removal and post-to-sale attribution, from $39/mo.',
      bestFor: 'Dealers and individual reps who want the most automation and the best photos for the lowest entry price.',
      pricingShort: 'From $39/mo' },
    ...HUB_ORDER.map((slug) => COMPETITORS[slug]),
  ];

  const itemListLd = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    itemListElement: ranked.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name,
      url: t.isAL ? SITE.origin + '/' : `${SITE.origin}/compare/${t.slug}/`,
    })),
  };
  const jsonLdBlocks = [
    jsonld(articleLd(HUB.title, canonical)),
    jsonld(itemListLd),
    jsonld(definedTermSetLd()),
    jsonld(softwareLd(desc)),
    jsonld(faqLd(faq)),
    jsonld(breadcrumbLd([
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Compare', url: canonical },
    ])),
    jsonld(orgLd),
  ];

  const cards = ranked.map((t, i) => {
    const rank = i + 1;
    const link = t.isAL ? `${SITE.origin}/` : `/compare/${t.slug}/`;
    const cta = t.isAL
      ? `<a class="card-cta" href="${SITE.ctaUrl}">See AutoLander plans &rarr;</a>`
      : `<a class="card-cta" href="/compare/${t.slug}/">AutoLander vs ${esc(t.name)} &rarr;</a>`;
    return `      <article class="rank-card${t.isAL ? ' rank-card--al' : ''}">
        <div class="rank-no">#${rank}${t.isAL ? ' <span class="rank-best">Best overall</span>' : ''}</div>
        <h3>${t.isAL ? '' : `<a href="${esc(link)}">`}${esc(t.name)}${t.isAL ? '' : '</a>'}</h3>
        <p class="rank-one">${esc(t.oneLiner)}</p>
        <p class="rank-meta"><strong>Best for:</strong> ${esc(t.bestFor)}</p>
        <p class="rank-meta"><strong>Pricing:</strong> ${esc(t.pricingShort)}</p>
        ${cta}
      </article>`;
  }).join('\n');

  // at-a-glance matrix: key rows × all tools
  const glanceKeys = ['method', 'session', 'photoStudio', 'video', 'soldRemoval', 'attribution', 'entry'];
  const glanceHead = ['', 'AutoLander', ...HUB_ORDER.map((s) => COMPETITORS[s].name)]
    .map((n, i) => `<th scope="col"${i === 1 ? ' class="col-al"' : ''}>${esc(n)}</th>`).join('');
  const glanceRows = glanceKeys.map((key) => {
    const label = DIMENSIONS.find(([k]) => k === key)[1];
    const cells = [`<th scope="row">${esc(label)}</th>`,
      `<td class="col-al">${cell(AUTOLANDER[key])}</td>`,
      ...HUB_ORDER.map((s) => `<td>${cell(COMPETITORS[s].cells[key])}</td>`)];
    return `        <tr>${cells.join('')}</tr>`;
  }).join('\n');

  const faqHtml = faq.map(([q, a]) => `
      <details class="faq-item">
        <summary>${esc(q)}</summary>
        <div class="faq-a"><p>${esc(a)}</p></div>
      </details>`).join('');

  return [
    head({ title, description: HUB.metaDescription, canonical, jsonLdBlocks }),
    siteHeader('Best Marketplace tools'),
    `  <main class="wrap">
    <article>
    <p class="eyebrow">2026 buyer&#39;s guide</p>
    <h1>${esc(HUB.title)}</h1>
    <p class="byline">By the <a href="${SITE.origin}/">AutoLander</a> team &middot; Updated <time datetime="${SITE.updated}">${esc(SITE.updatedHumanOr())}</time></p>
    <div class="tldr">
      <p class="tldr-label">Short answer</p>
      <p>${esc(HUB.tldr)}</p>
    </div>

    <section class="take">
      <h2>Our take</h2>
      <p>${esc(INSIGHTS.hub)}</p>
    </section>

    <section class="context">
      <h2>What a Facebook Marketplace auto-posting tool does</h2>
      ${HUB.context.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
    </section>

    <p class="guidelink">New to automating Marketplace? Start with <a href="/guide/facebook-marketplace-automation/">our honest guide to the dos, don&#39;ts and account-safety risks &rarr;</a></p>

    <h2>The ranking</h2>
    <div class="ranks">
${cards}
    </div>

    <h2>At a glance</h2>
    <div class="table-wrap">
      <table class="cmp glance">
        <thead><tr>${glanceHead}</tr></thead>
        <tbody>
${glanceRows}
        </tbody>
      </table>
    </div>
    <p class="legend"><span class="ic ic-yes">&#10003;</span> has it / advantage &nbsp;
      <span class="ic ic-mid">&bull;</span> partial or neutral fact &nbsp;
      <span class="ic ic-no">&ndash;</span> not advertised</p>

    <figure class="shot">
      <div class="shot-imgs">
        <img src="/preview/studio-before.webp" width="1100" height="733" loading="lazy" decoding="async"
          alt="Raw dealer lot photo of a vehicle before AutoLander AI Photo Studio replaces the background" />
        <img src="/preview/studio-after.webp" width="1100" height="733" loading="lazy" decoding="async"
          alt="The same vehicle after AutoLander AI Photo Studio replaced the lot background with a showroom backdrop" />
      </div>
      <figcaption>AutoLander&#39;s AI Photo Studio: a raw lot photo (left) versus the same car on a showroom backdrop (right) — one of the clearest differences versus extension and cloud posters.</figcaption>
    </figure>

    <section class="card">
      <h2>How we evaluated</h2>
      <ul>
        ${liList(HUB.criteria)}
      </ul>
    </section>

    <section class="session">
      <h2>Where does your Facebook session live?</h2>
      <p>Account safety is mostly about <strong>where your Facebook login actually runs</strong>.
      Logins from datacenter IPs and high-frequency cloud automation are a documented trigger for
      Meta security reviews, and browser extensions need sensitive permissions to act on your account.</p>
      <div class="session-grid session-grid--3">
        <div class="session-card session-card--al"><h3>Native app</h3><p><strong>AutoLander.</strong>
          Posts from your own computer through your normal session. Nothing stored on a shared server.</p></div>
        <div class="session-card"><h3>Browser extension</h3><p>AutoBook.io, Shiftly. Runs in your
          browser with sensitive permissions.</p></div>
        <div class="session-card"><h3>Cloud-operated</h3><p>Sell With Drift, RelayAuto, CARVID,
          Glo3D. Run your account from their servers (Drift advertises a 99.9% safety rate).</p></div>
      </div>
      <p class="session-note">We list delivery models as published facts, not accusations. Ask any
      vendor where your session is stored and how it logs in.</p>
    </section>

    <section class="glossary">
      <h2>Key terms, explained</h2>
      <dl>
        ${HUB.glossary.map(([t, d]) => `<dt>${esc(t)}</dt>\n        <dd>${esc(d)}</dd>`).join('\n        ')}
      </dl>
    </section>

    <section class="faq">
      <h2>Frequently asked questions</h2>${faqHtml}
    </section>
`,
    ctaBlock('See why dealers rank AutoLander #1', 'Automatic posting, studio-grade photos and the best entry price — on your own inventory.'),
    `    </article>
  </main>`,
    siteFooter(),
  ].join('\n');
}

// ---------- guide (educational pillar) ----------
// Original, on-brand SVG diagram (neutral palette — the text carries the trade-offs, not
// color-coding, to keep it fair). Inline so the <text> is crawlable.
const SESSION_DIAGRAM = `<svg viewBox="0 0 960 400" role="img" aria-labelledby="ddt ddd" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
  <title id="ddt">Where your Facebook session runs: browser extension vs cloud tool vs native desktop app</title>
  <desc id="ddd">A browser extension runs in your own browser on your own IP. A cloud tool runs on the vendor's servers and logs in from datacenter IPs. A native desktop app runs on your own computer and your own IP.</desc>
  <rect x="350" y="14" width="260" height="50" rx="12" fill="#0e1117" stroke="#3b82f6" stroke-opacity="0.55"/>
  <text x="480" y="45" text-anchor="middle" fill="#e2e8f0" font-family="Inter,sans-serif" font-size="16" font-weight="700">Your Facebook account</text>
  <path d="M480 64 L480 86 M150 86 L810 86 M150 86 L150 110 M480 86 L480 110 M810 86 L810 110" stroke="#ffffff" stroke-opacity="0.18" fill="none"/>
  ${[
    { cx: 150, t: 'Browser extension', run: 'Your browser', ip: 'Your IP', w: ['Broad browser permissions;', 'breaks when FB changes its UI'] },
    { cx: 480, t: 'Cloud tool', run: "The vendor's servers", ip: 'Datacenter IP', w: ['Session lives on their infra;', 'datacenter logins draw scrutiny'] },
    { cx: 810, t: 'Native desktop app', run: 'Your computer', ip: 'Your IP', w: ['Your PC must stay on;', 'still automation, not an API'] },
  ].map((c) => {
    const x = c.cx - 140; const tx = x + 22;
    return `<g>
    <rect x="${x}" y="110" width="280" height="262" rx="14" fill="#0d0f14" stroke="#ffffff" stroke-opacity="0.10"/>
    <text x="${tx}" y="146" fill="#ffffff" font-family="Inter,sans-serif" font-size="17" font-weight="800">${c.t}</text>
    <line x1="${tx}" y1="160" x2="${x + 258}" y2="160" stroke="#ffffff" stroke-opacity="0.08"/>
    <text x="${tx}" y="192" fill="#60a5fa" font-family="Inter,sans-serif" font-size="11" font-weight="700" letter-spacing="1">RUNS IN</text>
    <text x="${tx}" y="214" fill="#e2e8f0" font-family="Inter,sans-serif" font-size="15">${c.run}</text>
    <text x="${tx}" y="250" fill="#60a5fa" font-family="Inter,sans-serif" font-size="11" font-weight="700" letter-spacing="1">LOGS IN FROM</text>
    <text x="${tx}" y="272" fill="#e2e8f0" font-family="Inter,sans-serif" font-size="15">${c.ip}</text>
    <text x="${tx}" y="308" fill="#60a5fa" font-family="Inter,sans-serif" font-size="11" font-weight="700" letter-spacing="1">WATCH-OUTS</text>
    <text x="${tx}" y="330" fill="#94a3b8" font-family="Inter,sans-serif" font-size="13">${c.w[0]}</text>
    <text x="${tx}" y="349" fill="#94a3b8" font-family="Inter,sans-serif" font-size="13">${c.w[1]}</text>
  </g>`;
  }).join('\n  ')}
</svg>`;

function compareClusterLinks() {
  const spokes = Object.values(COMPETITORS)
    .map((s) => `        <li><a href="/compare/${s.slug}/">AutoLander vs ${esc(s.name)}</a></li>`)
    .join('\n');
  return `      <ul class="related-list">
        <li><a href="/compare/"><strong>Best Facebook Marketplace tools for dealers (the full comparison) &rarr;</strong></a></li>
${spokes}
      </ul>`;
}

function renderGuide() {
  const canonical = `${SITE.origin}/${GUIDE.path}/`;
  const faq = [...GUIDE.faq, SESSION_FAQ];
  const desc = 'AutoLander automatically posts car dealership inventory to Facebook Marketplace from a native desktop app, with an AI Photo Studio, walkaround video, automatic sold-removal and post-to-sale attribution.';

  const jsonLdBlocks = [
    jsonld(articleLd(GUIDE.title, canonical)),
    jsonld(faqLd(faq)),
    jsonld(breadcrumbLd([
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace automation guide', url: canonical },
    ])),
    jsonld(orgLd),
    jsonld(softwareLd(desc)),
  ];

  const faqHtml = faq.map(([q, a]) => `
      <details class="faq-item">
        <summary>${esc(q)}</summary>
        <div class="faq-a"><p>${esc(a)}</p></div>
      </details>`).join('');

  return [
    head({ title: GUIDE.title, description: GUIDE.metaDescription, canonical, jsonLdBlocks }),
    `  <header class="topbar">
    <a class="brand" href="${SITE.origin}/"><img src="/autolander-logo.png" alt="AutoLander" width="400" height="120" class="brand-logo" /></a>
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${SITE.origin}/">Home</a><span>/</span><span>Guide</span><span>/</span>
      <span class="crumb-active">Facebook Marketplace automation</span>
    </nav>
  </header>`,
    `  <main class="wrap">
    <article>
    <p class="eyebrow">Dealer guide</p>
    <h1>The honest guide to putting Facebook Marketplace on autopilot (without torching your account)</h1>
    <p class="byline">By the <a href="${SITE.origin}/">AutoLander</a> team &middot; Updated <time datetime="${SITE.updated}">${esc(SITE.updatedHumanOr())}</time></p>
    <div class="tldr"><p class="tldr-label">In short</p><p>${esc(GUIDE.summary)}</p></div>

    <p class="prose">Facebook Marketplace is one of the highest-intent, lowest-cost places a dealer can put inventory &mdash; which is exactly why &ldquo;auto-posting&rdquo; tools have exploded. But most buying guides skip the part that actually matters: <strong>the risk lives in your account, not in the feature list.</strong> Here&rsquo;s a fair rundown of how this works, what&rsquo;s out there, and how to not learn the hard way.</p>

    <h2>First, the part nobody likes to say out loud</h2>
    <p class="prose">Facebook Marketplace was built for individuals, and Meta has a separate, sanctioned path for dealers: official vehicle inventory / catalog listings through approved Marketplace partners and DMS integrations. That route is the only one that&rsquo;s unambiguously within Meta&rsquo;s rules.</p>
    <p class="prose">Everything else &mdash; automating posts from a personal profile, whether by extension, cloud, or desktop app &mdash; lives in a <strong>gray area</strong>. It&rsquo;s extremely common, lots of dealers do it successfully, but you should go in knowing it&rsquo;s automation of a personal profile, and Meta&rsquo;s Commerce Policies and Marketplace rules can change without notice. Anyone who tells you their tool is &ldquo;100% Meta-approved&rdquo; while auto-posting from your personal profile is overselling it. Fair is fair.</p>

    <h2>The four ways people do it (and the honest trade-offs)</h2>
    <ol class="prose ways">
      <li><strong>Manual posting.</strong> Free, zero ToS risk, totally human. Also a soul-crushing time sink that doesn&rsquo;t scale past a handful of cars and dies the second your one &ldquo;Marketplace person&rdquo; quits.</li>
      <li><strong>Browser extensions</strong> (e.g. tools like <a href="/compare/autobook/">AutoBook</a>, <a href="/compare/shiftly/">Shiftly&rsquo;s Auto Lister</a>). They drive your browser with your logged-in session. <em>Upside:</em> cheap, your own session and IP, nothing stored in someone else&rsquo;s cloud. <em>Risk:</em> they need broad browser permissions, they break whenever Facebook tweaks its UI, and browser automation is still automation in Meta&rsquo;s eyes.</li>
      <li><strong>Cloud / SaaS tools</strong> (e.g. tools like <a href="/compare/drift/">Sell With Drift</a>, <a href="/compare/relayauto/">RelayAuto</a>, <a href="/compare/carvid/">CARVID</a>). Their servers run your account 24/7. <em>Upside:</em> truly hands-off, your computer doesn&rsquo;t need to be on, often the slickest dashboards. <em>Risk:</em> your Facebook session (and sometimes credentials) live on their infrastructure, and the login hits Facebook from datacenter IPs &mdash; one of the more common things that trips Meta&rsquo;s &ldquo;is this really you?&rdquo; detection. If their operation gets flagged, your account is in the blast radius.</li>
      <li><strong>Native desktop apps.</strong> They post from your own machine and your normal session. <em>Upside:</em> your session and home/dealer IP, easier to mimic human pacing, nothing stored in a shared cloud. <em>Risk (being fair):</em> your computer has to actually be on and running, and it&rsquo;s still automation &mdash; it lowers the technical flag triggers, it doesn&rsquo;t make Marketplace automation officially sanctioned.</li>
    </ol>

    <figure class="diagram">
      ${SESSION_DIAGRAM}
      <figcaption>The real dividing line between these tools is <strong>where your Facebook session runs</strong> &mdash; and which IP addresses log in to your account.</figcaption>
    </figure>

    <h2>What actually gets accounts flagged or banned</h2>
    <p class="prose">Not &ldquo;using a tool&rdquo; by itself &mdash; it&rsquo;s the pattern:</p>
    <ul class="prose">
      <li>Logins from datacenter IPs or sudden new locations/devices</li>
      <li>Volume spikes (zero to 200 listings overnight on a cold profile)</li>
      <li>Posting too fast, or duplicate/near-duplicate listings that read as bot output</li>
      <li>Handing your password to something that stores it insecurely</li>
    </ul>
    <p class="prose">And the risk people underestimate most: <strong>the profile that runs your Marketplace automation is often the same personal profile that admins your Business Manager and ad accounts.</strong> If that profile gets restricted, you can lose Marketplace and jeopardize your paid ads at the same time. That cascade is the real worst case &mdash; protect that profile accordingly.</p>

    <div class="dodont">
      <section class="card win">
        <h2>The DOs</h2>
        <ul>
          <li><strong>Know the rules first.</strong> Read Meta&rsquo;s Commerce Policies and look into the official dealer inventory/catalog route before you automate anything.</li>
          <li><strong>Isolate risk.</strong> Don&rsquo;t run aggressive automation on the exact profile that admins your ad accounts.</li>
          <li><strong>Go gradual.</strong> Warm up a profile; ramp volume instead of blasting your whole lot on day one.</li>
          <li><strong>Stay accurate.</strong> Real descriptions, correct prices, and remove sold units promptly.</li>
          <li><strong>Interrogate the vendor</strong> (see the questions below).</li>
          <li><strong>Diversify.</strong> Don&rsquo;t bet your whole lead flow on one channel you don&rsquo;t control.</li>
        </ul>
      </section>
      <section class="card dont">
        <h2>The DON&rsquo;Ts</h2>
        <ul>
          <li><strong>Don&rsquo;t pick on price alone.</strong> A $99/mo tool that gets your account banned is the most expensive software you&rsquo;ll ever buy.</li>
          <li><strong>Don&rsquo;t assume &ldquo;cloud = safer&rdquo; or &ldquo;extension = safer.&rdquo;</strong> It depends on the architecture.</li>
          <li><strong>Don&rsquo;t hand your main credentials to a black box.</strong> No straight answer on where your login is stored? That&rsquo;s your answer.</li>
          <li><strong>Don&rsquo;t run datacenter-IP automation at high frequency.</strong> It&rsquo;s the single most common flag trigger.</li>
          <li><strong>Don&rsquo;t spam.</strong> Duplicate listings, rapid re-posts and bot-sounding copy are what Meta&rsquo;s systems are built to catch.</li>
        </ul>
      </section>
    </div>

    <figure class="shot">
      <div class="shot-imgs">
        <img src="/preview/studio-before.webp" width="1100" height="733" loading="lazy" decoding="async"
          alt="A raw, cluttered dealer lot photo of a vehicle before cleanup" />
        <img src="/preview/studio-after.webp" width="1100" height="733" loading="lazy" decoding="async"
          alt="The same vehicle on a clean showroom backdrop — the kind of accurate, professional listing that performs and stays compliant" />
      </div>
      <figcaption>&ldquo;Stay accurate&rdquo; in practice: clean, honest, professional listings (right) age better with buyers and Meta than messy or misleading ones.</figcaption>
    </figure>

    <section class="qbox">
      <h2>Five questions to ask any vendor before you connect your inventory</h2>
      <ol>
        <li>Where is my Facebook session stored, and what IP addresses log into my account?</li>
        <li>Is posting done through an official Meta API, or unofficial automation of a profile?</li>
        <li>What happens to my account if your servers get flagged?</li>
        <li>Do you store my password, and how?</li>
        <li>If I cancel, do my listings and access stay, or vanish?</li>
      </ol>
      <p class="qnote">A vendor that answers these plainly is one you can trust. A vendor that gets cagey just told you everything you need to know.</p>
    </section>

    <h2>The fair bottom line</h2>
    <p class="prose">There&rsquo;s no risk-free way to fully automate a personal Facebook profile &mdash; the most compliant path is Meta&rsquo;s official dealer inventory route, and every automation tool is a trade-off between convenience and control. Pick based on <strong>where your session lives and how much you trust the vendor with your account</strong>, not the feature grid. The dealers who do this well treat their Facebook profile like the business asset it is.</p>

    <section class="take">
      <h2>Where we land (full disclosure)</h2>
      <p>We build AutoLander, which is a native desktop app &mdash; so we have a point of view, and you should weigh it accordingly. We chose the native-app route specifically so a dealer&rsquo;s Facebook session stays on their own machine instead of a shared cloud server. But we tried to keep this guide fair, and we put a side-by-side comparison of every option &mdash; including the cloud and extension tools, with each one&rsquo;s real strengths &mdash; together so you can judge for yourself: <a href="/compare/">the full Facebook Marketplace tools comparison &rarr;</a></p>
    </section>

    <section class="faq">
      <h2>Frequently asked questions</h2>${faqHtml}
    </section>
`,
    ctaBlock('Want the native-app approach?', 'See how AutoLander keeps your Facebook session on your own machine — with studio-grade photos and post-to-sale attribution.'),
    `    <nav class="related" aria-label="Related reading">
      <h2>Keep reading</h2>
${compareClusterLinks()}
    </nav>
    </article>
  </main>`,
    siteFooter(),
  ].join('\n');
}

// ---------- stylesheet ----------
const STYLES = `:root{color-scheme:dark;--bg:#050505;--panel:rgba(255,255,255,.03);--panel2:rgba(255,255,255,.05);
--line:rgba(255,255,255,.08);--text:#e2e8f0;--muted:#94a3b8;--dim:#64748b;--blue:#3b82f6;--blue2:#60a5fa;--ink:#fff}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text);
font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--blue2);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:880px;margin:0 auto;padding:24px 22px 72px}
h1{font-size:clamp(30px,5vw,46px);line-height:1.08;letter-spacing:-.03em;margin:18px 0 18px;color:var(--ink);font-weight:900}
h2{font-size:clamp(21px,3.2vw,28px);margin:42px 0 14px;color:var(--ink);font-weight:800;letter-spacing:-.02em}
h3{font-size:17px;margin:0 0 8px;color:var(--ink);font-weight:700}
p{color:var(--text)}.muted{color:var(--muted)}
.eyebrow{font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--blue2);margin:0}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
max-width:880px;margin:0 auto;padding:18px 22px;border-bottom:1px solid var(--line)}
.brand{display:inline-flex;align-items:center}
.brand:hover{text-decoration:none}
.brand-logo{height:30px;width:auto;display:block}
.foot-brand{display:inline-block;margin-bottom:16px}
.foot-brand .brand-logo{height:34px}
.crumbs{font-size:13px;color:var(--dim);display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.crumbs a{color:var(--muted)}.crumb-active{color:var(--text)}
.lede{font-size:16px;color:var(--muted);margin:6px 0 8px}
.tldr{background:linear-gradient(135deg,rgba(59,130,246,.12),rgba(79,70,229,.06));
border:1px solid rgba(59,130,246,.28);border-radius:18px;padding:20px 22px;margin:8px 0 8px}
.tldr-label{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--blue2);margin:0 0 6px}
.tldr p:last-child{margin:0;font-size:17px;color:#f1f5f9}
.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:16px;margin:8px 0}
table.cmp{border-collapse:collapse;width:100%;min-width:520px;font-size:14.5px}
table.cmp th,table.cmp td{text-align:left;padding:12px 14px;border-bottom:1px solid var(--line);vertical-align:top}
table.cmp thead th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:800;background:rgba(255,255,255,.02)}
table.cmp tbody th{color:#fff;font-weight:600;width:34%}
table.cmp .col-al{background:rgba(59,130,246,.07)}
table.cmp thead .col-al{color:var(--blue2)}
table.glance{min-width:760px;font-size:13.5px}
table.glance tbody th{width:auto}
.ic{display:inline-block;width:18px;text-align:center;font-weight:900}
.ic-yes{color:var(--blue)}.ic-no{color:var(--dim)}.ic-mid{color:#f59e0b}
.legend{font-size:12.5px;color:var(--dim);margin:8px 2px 0}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:20px 22px}
.card h2{margin-top:0;font-size:19px}
.card ul{margin:0;padding-left:18px}.card li{margin:0 0 9px}
.win{border-color:rgba(59,130,246,.3);background:rgba(59,130,246,.06)}
.session{margin-top:34px;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px}
.session>p{color:var(--muted)}
.session-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0}
.session-grid--3{grid-template-columns:1fr 1fr 1fr}
.session-card{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:14px;padding:16px}
.session-card p{margin:0;font-size:14px;color:var(--muted)}
.session-card--al{border-color:rgba(59,130,246,.4);background:rgba(59,130,246,.08)}
.session-card--al p{color:#e6eefc}
.q-title{margin-top:14px}
.q-list{margin:6px 0 0;padding-left:18px;color:var(--text)}.q-list li{margin:0 0 8px}
.session-note{font-size:13px;color:var(--dim);margin:14px 0 0;font-style:italic}
.verdict{margin-top:30px;border-left:3px solid var(--blue);padding:4px 0 4px 18px}
.verdict h2{margin-top:0}
.byline{font-size:13px;color:var(--dim);margin:0 0 16px}
.byline a{color:var(--muted)}
.take{margin-top:30px;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.25);border-radius:16px;padding:18px 22px}
.take h2{margin-top:0;font-size:19px}
.take p{margin:0;color:#eef2f8}
.shot{margin:18px 0 8px}
.shot-imgs{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.shot-imgs img{width:100%;height:auto;border-radius:12px;border:1px solid var(--line);display:block}
.shot figcaption{font-size:12.5px;color:var(--dim);margin-top:8px;text-align:center}
@media(max-width:520px){.shot-imgs{grid-template-columns:1fr}}
.faq{margin-top:14px}
.faq-item{border:1px solid var(--line);border-radius:14px;padding:4px 18px;margin:10px 0;background:var(--panel)}
.faq-item summary{cursor:pointer;font-weight:700;color:#fff;padding:12px 0;list-style:none}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::before{content:"+";color:var(--blue2);font-weight:900;margin-right:10px}
.faq-item[open] summary::before{content:"\\2212"}
.faq-a{padding:0 0 12px}.faq-a p{margin:0;color:var(--muted);font-size:14.5px}
.ranks{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.rank-card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:18px 20px;display:flex;flex-direction:column}
.rank-card--al{border-color:rgba(59,130,246,.45);background:rgba(59,130,246,.08);grid-column:1/-1}
.rank-no{font-size:12px;font-weight:800;letter-spacing:.08em;color:var(--dim);text-transform:uppercase}
.rank-best{color:#fff;background:var(--blue);border-radius:999px;padding:2px 9px;margin-left:6px;font-size:10px}
.rank-card h3{font-size:20px;margin:6px 0 8px}
.rank-one{margin:0 0 8px;font-size:14.5px;color:var(--text)}
.rank-meta{margin:0 0 4px;font-size:13px;color:var(--muted)}
.rank-card .card-cta{margin-top:auto;padding-top:10px;font-weight:700;font-size:14px}
.cta{max-width:880px;margin:40px auto 0;padding:30px 22px;text-align:center;
background:linear-gradient(135deg,rgba(59,130,246,.14),rgba(79,70,229,.06));
border:1px solid rgba(59,130,246,.28);border-radius:22px}
.cta h2{margin:0 0 8px}.cta p{color:var(--muted);margin:0 auto 16px;max-width:560px}
.btn{display:inline-block;background:var(--blue);color:#fff;font-weight:800;padding:13px 26px;border-radius:14px;font-size:15px}
.btn:hover{background:#2563eb;text-decoration:none}
.cta-fine{font-size:12px;color:var(--dim);margin-top:14px}
.related{margin-top:34px;border-top:1px solid var(--line);padding-top:18px}
.related h2{margin:0 0 12px;font-size:17px}
.related-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:8px 18px}
.related-list a{font-size:14px;font-weight:600}
@media(max-width:520px){.related-list{grid-template-columns:1fr}}
.context p{color:var(--muted);margin:0 0 12px}
.glossary dl{margin:0;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.glossary dt{font-weight:800;color:#fff;padding:14px 18px 2px;background:rgba(255,255,255,.02)}
.glossary dd{margin:0;padding:2px 18px 14px;color:var(--muted);font-size:14.5px;background:rgba(255,255,255,.02);border-bottom:1px solid var(--line)}
.glossary dd:last-child{border-bottom:0}
.prose{font-size:16px;color:var(--text)}
.prose em{color:var(--muted);font-style:italic}
.ways{padding-left:20px}.ways li{margin:0 0 14px}
.diagram{margin:22px 0 8px}
.diagram-svg{width:100%;height:auto;display:block;background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:16px;padding:8px}
.diagram figcaption{font-size:13px;color:var(--dim);margin-top:10px;text-align:center}
.dodont{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
.dodont .card h2{font-size:19px}
.dont{border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.05)}
.qbox{margin-top:34px;background:var(--panel);border:1px solid rgba(59,130,246,.3);border-radius:18px;padding:20px 24px}
.qbox h2{margin-top:0;font-size:19px}
.qbox ol{margin:0;padding-left:22px}.qbox li{margin:0 0 10px;font-weight:600;color:#fff}
.qnote{margin:14px 0 0;color:var(--muted);font-size:14px;font-style:italic}
@media(max-width:640px){.dodont{grid-template-columns:1fr}}
.guidelink{margin:18px 0 0;padding:14px 18px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.25);border-radius:12px;font-size:14.5px;font-weight:600}
.foot{max-width:880px;margin:48px auto 0;padding:24px 22px 40px;border-top:1px solid var(--line)}
.foot-links{display:flex;gap:18px;flex-wrap:wrap;margin-bottom:16px}
.foot-links a{font-size:13px;font-weight:700;color:var(--muted)}
.disclaimer{font-size:12px;color:var(--dim);line-height:1.6;margin:0 0 10px}
.copyright{font-size:12px;color:var(--dim);margin:0}
@media(max-width:640px){.two-col,.ranks,.session-grid,.session-grid--3{grid-template-columns:1fr}
.rank-card--al{grid-column:auto}}
`;

// ---------- robots.txt & sitemap.xml ----------
function robotsTxt() {
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai',
    'Claude-Web', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot',
    'Applebot-Extended', 'Bingbot', 'cohere-ai', 'Amazonbot', 'meta-externalagent'];
  const blocks = aiBots.map((ua) => `User-agent: ${ua}\nAllow: /`).join('\n\n');
  return `# AutoLander robots.txt
# All crawlers are welcome, including AI search & answer engines.
User-agent: *
Allow: /

${blocks}

Sitemap: ${SITE.origin}/sitemap.xml
`;
}

function sitemapXml(slugs) {
  const urls = [
    { loc: SITE.origin + '/', pri: '1.0', freq: 'weekly' },
    { loc: SITE.origin + '/compare/', pri: '0.9', freq: 'weekly' },
    { loc: `${SITE.origin}/${GUIDE.path}/`, pri: '0.8', freq: 'monthly' },
    ...slugs.map((s) => ({ loc: `${SITE.origin}/compare/${s}/`, pri: '0.8', freq: 'monthly' })),
  ];
  const body = urls.map((u) =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${SITE.updated}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// ---------- write everything ----------
function write(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
  console.log('wrote', path.replace(PUBLIC_DIR, 'public'));
}

const slugs = Object.values(COMPETITORS).map((c) => c.slug);

write(resolve(COMPARE_DIR, 'styles.css'), STYLES);
write(resolve(COMPARE_DIR, 'index.html'), renderHub());
for (const c of Object.values(COMPETITORS)) {
  write(resolve(COMPARE_DIR, c.slug, 'index.html'), renderVersus(c));
}
write(resolve(PUBLIC_DIR, GUIDE.path, 'index.html'), renderGuide());
write(resolve(PUBLIC_DIR, 'robots.txt'), robotsTxt());
write(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemapXml(slugs));

console.log(`\nDone. ${slugs.length} head-to-head pages + hub + robots.txt + sitemap.xml.`);
