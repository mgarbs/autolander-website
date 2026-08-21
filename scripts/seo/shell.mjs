// Shared render shell for the SEO silo. Owned by the orchestrator.
// Agents write DECLARATIVE content (page objects) — never HTML. renderPage() turns a page
// object into a complete, crawlable static HTML document with correct meta, JSON-LD, breadcrumbs,
// CTA and silo interlinking. Visual base reuses /compare/styles.css; new components live in
// /seo/styles.css (SEO_STYLES below).
//
// ---- PAGE OBJECT CONTRACT ----
// {
//   key,            // NAV key (registry) — drives canonical, related, breadcrumb tail when path omitted
//   path,           // explicit URL path (trailing slash) — required for integration spokes
//   title,          // <title> + og:title + twitter:title  (UNIQUE per page)
//   description,    // meta description + og/twitter description (UNIQUE per page)
//   eyebrow,        // small label above H1
//   h1,
//   tldr,           // short-answer box text (string) — AI-answer optimized
//   bylineUpdated,  // bool, show "Updated <date>" byline
//   breadcrumbs,    // [{name,url}] full trail INCLUDING Home and self
//   sections,       // [Section] (see renderSection)
//   faq,            // [[q,a], ...]
//   faqHeading,     // optional override
//   cta,            // {heading, sub}
//   related,        // [{href,text}] (defaults to relatedFor(key))
//   schema,         // {software?:desc, itemList?:[{name,url}]} (software is held until verified reviews exist)
//   ogType,         // default 'website'
// }
//
// ---- SECTION TYPES ----
//  {type:'prose', paras:[...]}                         paragraphs
//  {type:'qa', q, a}                                   question H2 + answer (a: string | string[])
//  {type:'bullets', h2, intro?, items:[...], variant?} bulleted list ('win' variant = highlighted)
//  {type:'features', h2, intro?, cards:[{title,body}]} feature card grid
//  {type:'steps', h2, intro?, steps:[{title,body}]}    numbered process
//  {type:'table', h2, intro?, head:[...], rows:[[...]], note?, alCol?:idx} comparison/pricing table
//  {type:'callout', title?, body}                      highlighted note box
//  {type:'figure', before, after, caption}             before/after studio images
//  {type:'twocol', left:{h2,items}, right:{h2,items}}  do/don't or wins/strengths
//  {type:'html', html}                                 trusted prebuilt HTML (orchestrator only)

import { SITE, NAV, relatedFor } from './registry.mjs';

export { SITE, NAV };

export const esc = (s) => String(s)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export const jsonld = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replaceAll('<', '\\u003c')}</script>`;

// fmt = esc THEN linkify a safe markdown subset for inline contextual links in body text:
//   [anchor text](/internal/path/) or [anchor](https://external). esc runs first so any real
//   <,>,",' in the text are already neutralized; we only emit anchors whose href is a controlled
//   internal path or an https URL (never javascript:). Use fmt for human-readable body copy only,
//   never for attributes (alt/title/meta) — those stay esc().
const linkify = (escaped) => escaped.replace(
  /\[([^\]]+)\]\((\/[A-Za-z0-9\-/#?=&.]*|https:\/\/[^\s)]+)\)/g,
  '<a href="$2">$1</a>',
);
export const fmt = (s) => linkify(esc(s));
// stripmd = plain-text form of our markdown-link subset (keeps anchor text, drops the URL).
// Used for JSON-LD text (FAQ answers etc.) so structured data stays clean prose, never markdown.
export const stripmd = (s) => String(s).replace(/\[([^\]]+)\]\((?:\/[^)]*|https:\/\/[^)\s]+)\)/g, '$1');

const updatedHuman = () => SITE.updatedHuman || SITE.updated;

// ---------- schema.org builders ----------
export const orgLd = {
  '@context': 'https://schema.org', '@type': 'Organization', name: 'AutoLander',
  legalName: 'AutoLander LLC', url: SITE.origin + '/', logo: SITE.origin + '/autolander-logo.png',
  email: 'sales@autolander.ai',
};
export const faqLd = (faq) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({
    '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: stripmd(a) },
  })),
});
export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem', position: i + 1, name: it.name, item: it.url,
  })),
});
export const itemListLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'ItemList',
  itemListElement: items.map((t, i) => ({
    '@type': 'ListItem', position: i + 1, name: t.name, url: t.url,
  })),
});
export const webPageLd = (title, canonical, desc) => ({
  '@context': 'https://schema.org', '@type': 'WebPage',
  name: title, url: canonical, description: desc,
  isPartOf: { '@type': 'WebSite', name: 'AutoLander', url: SITE.origin + '/' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: SITE.origin + '/og-image.jpg',
  },
  dateModified: SITE.updated,
});

// ---------- helpers ----------
const liList = (arr) => arr.map((x) => `<li>${fmt(x)}</li>`).join('\n        ');
const paras = (a) => (Array.isArray(a) ? a : [a]).map((p) => `<p>${fmt(p)}</p>`).join('\n      ');

// ---------- document head ----------
export function head({ title, description, canonical, jsonLdBlocks, ogType = 'website' }) {
  return `<!doctype html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-30H80LZMCH"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-30H80LZMCH');
  </script>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#050505" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="icon" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta property="og:type" content="${esc(ogType)}" />
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
  <link rel="stylesheet" href="/seo/styles.css" />
  ${jsonLdBlocks.join('\n  ')}
</head>
<body>`;
}

export function siteHeader(breadcrumbs) {
  const crumbs = breadcrumbs.map((c, i) => {
    const last = i === breadcrumbs.length - 1;
    const sep = i > 0 ? '<span>/</span>\n      ' : '';
    return last
      ? `${sep}<span class="crumb-active">${esc(c.name)}</span>`
      : `${sep}<a href="${esc(c.url)}">${esc(c.name)}</a>`;
  }).join('\n      ');
  return `  <header class="topbar">
    <a class="brand" href="${SITE.origin}/">
      <img src="/autolander-logo.png" alt="AutoLander" width="400" height="120" class="brand-logo" />
    </a>
    <nav class="crumbs" aria-label="Breadcrumb">
      ${crumbs}
    </nav>
  </header>`;
}

export function ctaBlock(heading, sub) {
  return `  <section class="cta">
    <h2>${esc(heading)}</h2>
    <p>${esc(sub)}</p>
    <a class="btn" href="${SITE.ctaUrl}">See plans &amp; book a demo &rarr;</a>
    <p class="cta-fine">Plans from $39/mo &bull; 5 free posts &bull; no credit card &bull; cancel anytime</p>
  </section>`;
}

export function siteFooter() {
  return `  <footer class="foot">
    <a href="${SITE.origin}/" class="foot-brand"><img src="/autolander-logo.png" alt="AutoLander" width="400" height="120" class="brand-logo" /></a>
    <nav class="foot-links">
      <a href="${NAV.category.path}">FB Marketplace auto poster</a>
      <a href="${NAV.listingSw.path}">Listing software</a>
      <a href="${NAV.dealers.path}">For car dealers</a>
      <a href="${NAV.compareHub.path}">Compare tools</a>
      <a href="${NAV.integHub.path}">Integrations</a>
      <a href="${NAV.inventory.path}">Inventory sync</a>
      <a href="${NAV.automation.path}">Automation</a>
      <a href="${NAV.mktgHub.path}">Dealership marketing</a>
      <a href="${NAV.report2026.path}">2026 Marketplace Report</a>
      <a href="${NAV.aiChat.path}">AI chat for dealers</a>
      <a href="${NAV.photoEditor.path}">AI car photo editor</a>
      <a href="${NAV.rvDealers.path}">RV dealer software</a>
      <a href="${NAV.sellGuide.path}">How to sell cars</a>
      <a href="${NAV.guide.path}">Guide</a>
      <a href="${SITE.origin}/">AutoLander home</a>
      <a href="${SITE.origin}/#pricing">Pricing</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </nav>
    <p class="disclaimer">
      AutoLander is a native desktop app for car dealers. Third-party product names, DMS and feed
      providers (e.g. CarGurus, Cars.com, vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK, Tekion)
      are trademarks of their respective owners; AutoLander is not affiliated with or endorsed by them.
      Facebook and Facebook Marketplace are trademarks of Meta Platforms, Inc. AutoLander does not
      override Meta eligibility, listing limits or terms &mdash; see our <a href="${NAV.guide.path}">policy and safety guide</a>.
    </p>
    <p class="copyright">&copy; 2026 AutoLander. Last updated ${esc(updatedHuman())}.</p>
  </footer>
</body>
</html>`;
}

// ---------- section renderer ----------
export function renderSection(s) {
  switch (s.type) {
    case 'prose':
      return `    <section class="prose-block">\n      ${paras(s.paras)}\n    </section>`;
    case 'qa':
      return `    <section class="qa">\n      <h2>${esc(s.q)}</h2>\n      ${paras(s.a)}\n    </section>`;
    case 'bullets':
      return `    <section class="card${s.variant === 'win' ? ' win' : ''}">
      <h2>${esc(s.h2)}</h2>${s.intro ? `\n      <p>${esc(s.intro)}</p>` : ''}
      <ul>
        ${liList(s.items)}
      </ul>
    </section>`;
    case 'features':
      return `    <section class="feature-wrap">
      <h2>${esc(s.h2)}</h2>${s.intro ? `\n      <p class="sec-intro">${esc(s.intro)}</p>` : ''}
      <div class="feature-grid">
        ${s.cards.map((c) => `<div class="feature-card"><h3>${esc(c.title)}</h3><p>${fmt(c.body)}</p></div>`).join('\n        ')}
      </div>
    </section>`;
    case 'steps':
      return `    <section class="steps-wrap">
      <h2>${esc(s.h2)}</h2>${s.intro ? `\n      <p class="sec-intro">${esc(s.intro)}</p>` : ''}
      <ol class="steps">
        ${s.steps.map((st) => `<li><span class="step-h">${esc(st.title)}</span><span class="step-b">${fmt(st.body)}</span></li>`).join('\n        ')}
      </ol>
    </section>`;
    case 'table': {
      const alCol = s.alCol;
      const thead = s.head.map((h, i) => `<th scope="col"${i === alCol ? ' class="col-al"' : ''}>${esc(h)}</th>`).join('');
      const rows = s.rows.map((r) => `        <tr>${r.map((cellVal, i) => {
        const tag = i === 0 ? 'th scope="row"' : 'td';
        const cls = i === alCol ? ' class="col-al"' : '';
        const close = i === 0 ? 'th' : 'td';
        return `<${tag}${cls}>${esc(cellVal)}</${close}>`;
      }).join('')}</tr>`).join('\n');
      return `    <section class="table-section">
      <h2>${esc(s.h2)}</h2>${s.intro ? `\n      <p class="sec-intro">${esc(s.intro)}</p>` : ''}
      <div class="table-wrap">
        <table class="cmp">
          <thead><tr>${thead}</tr></thead>
          <tbody>\n${rows}\n          </tbody>
        </table>
      </div>${s.note ? `\n      <p class="legend">${esc(s.note)}</p>` : ''}
    </section>`;
    }
    case 'callout':
      return `    <aside class="callout">${s.title ? `<h3>${esc(s.title)}</h3>` : ''}<p>${fmt(s.body)}</p></aside>`;
    case 'twocol':
      return `    <div class="two-col">
      <section class="card win"><h2>${esc(s.left.h2)}</h2><ul>${s.left.items.map((x) => `<li>${fmt(x)}</li>`).join('')}</ul></section>
      <section class="card"><h2>${esc(s.right.h2)}</h2><ul>${s.right.items.map((x) => `<li>${fmt(x)}</li>`).join('')}</ul></section>
    </div>`;
    case 'figure': {
      // Responsive: browser pulls 550w on low-DPR/desktop (display slot ~413px) and 1100w on retina.
      const srcset = (src) => `${esc(src.replace(/\.webp$/, '-550.webp'))} 550w, ${esc(src)} 1100w`;
      const sizes = '(max-width:520px) 92vw, 413px';
      return `    <figure class="shot">
      <div class="shot-imgs">
        <img src="${esc(s.before)}" srcset="${srcset(s.before)}" sizes="${sizes}" width="1100" height="733" loading="lazy" decoding="async" alt="${esc(s.beforeAlt || 'Before')}" />
        <img src="${esc(s.after)}" srcset="${srcset(s.after)}" sizes="${sizes}" width="1100" height="733" loading="lazy" decoding="async" alt="${esc(s.afterAlt || 'After')}" />
      </div>
      <figcaption>${esc(s.caption)}</figcaption>
    </figure>`;
    }
    case 'image': {
      // Single showcase image, same -550.webp srcset convention as 'figure'.
      const srcset1 = `${esc(s.src.replace(/\.webp$/, '-550.webp'))} 550w, ${esc(s.src)} 1100w`;
      return `    <figure class="shot shot-single">
      <div class="shot-imgs">
        <img src="${esc(s.src)}" srcset="${srcset1}" sizes="(max-width:720px) 92vw, 680px" width="1100" height="733" loading="lazy" decoding="async" alt="${esc(s.alt)}" />
      </div>
      <figcaption>${esc(s.caption)}</figcaption>
    </figure>`;
    }
    case 'html':
      return s.html; // trusted (orchestrator-supplied) only
    default:
      return '';
  }
}

export function relatedNav(links, heading = 'Related') {
  return `    <nav class="related" aria-label="Related pages">
      <h2>${esc(heading)}</h2>
      <ul class="related-list">
${links.map((l) => `        <li><a href="${esc(l.href)}">${esc(l.text)}</a></li>`).join('\n')}
      </ul>
    </nav>`;
}

function faqSection(faq, heading = 'Frequently asked questions') {
  const items = faq.map(([q, a]) => `
      <details class="faq-item">
        <summary>${esc(q)}</summary>
        <div class="faq-a"><p>${fmt(a)}</p></div>
      </details>`).join('');
  return `    <section class="faq">
      <h2>${esc(heading)}</h2>${items}
    </section>`;
}

// ---------- full page ----------
export function renderPage(page) {
  const nav = page.key ? NAV[page.key] : null;
  const path = page.path || (nav && nav.path);
  const canonical = SITE.origin + path;
  const jsonLdBlocks = [];
  jsonLdBlocks.push(jsonld(webPageLd(page.title, canonical, page.description)));
  // Google requires a genuine aggregateRating or review for SoftwareApplication rich results.
  // AutoLander does not currently publish verified review data, so do not emit that type until it does.
  if (page.schema?.itemList) jsonLdBlocks.push(jsonld(itemListLd(page.schema.itemList)));
  if (page.faq && page.faq.length) jsonLdBlocks.push(jsonld(faqLd(page.faq)));
  if (page.breadcrumbs) jsonLdBlocks.push(jsonld(breadcrumbLd(page.breadcrumbs)));
  jsonLdBlocks.push(jsonld(orgLd));

  const related = page.related || (page.key ? relatedFor(page.key) : []);
  const sectionsHtml = (page.sections || []).map(renderSection).join('\n\n');

  return [
    head({ title: page.title, description: page.description, canonical, jsonLdBlocks, ogType: page.ogType }),
    siteHeader(page.breadcrumbs.map(({ name, url }) => ({ name, url }))),
    `  <main class="wrap">
    <article>
    ${page.eyebrow ? `<p class="eyebrow">${esc(page.eyebrow)}</p>` : ''}
    <h1>${esc(page.h1)}</h1>
    ${page.bylineUpdated ? `<p class="byline">By the <a href="${SITE.origin}/">AutoLander</a> team &middot; Updated <time datetime="${SITE.updated}">${esc(updatedHuman())}</time></p>` : ''}
    ${page.tldr ? `<div class="tldr"><p class="tldr-label">Short answer</p><p>${fmt(page.tldr)}</p></div>` : ''}

${sectionsHtml}

${page.faq && page.faq.length ? faqSection(page.faq, page.faqHeading) : ''}
`,
    ctaBlock(page.cta.heading, page.cta.sub),
    `${related.length ? relatedNav(related, page.relatedHeading || 'Keep exploring') : ''}
    </article>
  </main>`,
    siteFooter(),
  ].join('\n');
}

// ---------- supplemental stylesheet (new components; base comes from /compare/styles.css) ----------
export const SEO_STYLES = `/* SEO silo supplemental styles — base in /compare/styles.css */
.prose-block p{font-size:16px;color:var(--text);margin:0 0 14px}
.qa{margin-top:8px}
.qa h2{margin-bottom:8px}
.qa p{color:var(--text);margin:0 0 12px}
.sec-intro{color:var(--muted);margin:0 0 14px;font-size:15.5px}
.feature-wrap{margin-top:36px}
.feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:6px}
.feature-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 20px}
.feature-card h3{margin:0 0 6px;font-size:16px}
.feature-card p{margin:0;color:var(--muted);font-size:14.5px}
.steps-wrap{margin-top:36px}
.steps{counter-reset:s;list-style:none;margin:0;padding:0;display:grid;gap:12px}
.steps li{counter-increment:s;position:relative;background:var(--panel);border:1px solid var(--line);
border-radius:14px;padding:16px 18px 16px 56px}
.steps li::before{content:counter(s);position:absolute;left:16px;top:16px;width:28px;height:28px;border-radius:8px;
background:rgba(59,130,246,.16);color:var(--blue2);font-weight:900;display:flex;align-items:center;justify-content:center;font-size:14px}
.step-h{display:block;font-weight:700;color:#fff;margin-bottom:3px}
.step-b{display:block;color:var(--muted);font-size:14.5px}
.callout{margin:22px 0;background:rgba(59,130,246,.07);border:1px solid rgba(59,130,246,.28);border-radius:14px;padding:16px 20px}
.callout h3{margin:0 0 6px;font-size:15px;color:var(--blue2)}
.callout p{margin:0;color:#e6eefc;font-size:14.5px}
.table-section{margin-top:36px}
.feature-card h3,.step-h{letter-spacing:-.01em}
.shot-single .shot-imgs{grid-template-columns:1fr;max-width:680px;margin:0 auto}
@media(max-width:640px){.feature-grid{grid-template-columns:1fr}}
`;
