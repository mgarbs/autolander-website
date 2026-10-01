import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AEO_GEO,
  AI_VISIBILITY_PUBLISHED,
  AI_VISIBILITY_UPDATED,
  FAQ,
  HERO,
  META,
  PLANS,
  PLANS_UPDATED,
  REVIEW,
  SMS_CONSENT,
  fmtUsd,
} from '../shared/ai-visibility-content.js';
import * as AI_CONTENT from '../shared/ai-visibility-content.js';
import {
  AI_VISIBILITY_DIR,
  AI_VISIBILITY_MD_PATH,
  AI_VISIBILITY_PATH,
} from '../shared/ai-visibility-route.js';
import { TEAM_META } from '../shared/team-content.js';
import {
  AI_VISIBILITY_IMAGES,
  TERM_SAME_AS,
  aiVisibilityGraph,
  aiVisibilityHead,
  renderAiVisibilityMarkdown,
} from '../scripts/seo/data-ai-visibility.mjs';
import { teamHead } from '../scripts/seo/data-team.mjs';
import { buildPageShell } from '../scripts/spa-shell.mjs';
import { renderAiVisibilityMirror, renderAiVisibilityMirrorRest } from '../src/ai/static-mirror.js';
import { PAGE_UPDATED } from '../src/ai/page-updated.js';
import { renderTeamMirror, renderTeamMirrorRest } from '../src/team/static-mirror.js';
import { HTMLParser } from './helpers/html-text.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(ROOT, path), 'utf8');
const text = (html) => new HTMLParser().textOf(html);
const CANONICAL = 'https://autolander.ai/aeo-geo-for-car-dealers/';
const TWIN_URL = 'https://autolander.ai/aeo-geo-for-car-dealers.md';
const TWIN_FILE = `public${AI_VISIBILITY_MD_PATH}`;
// The retired page URL in any form (absolute, or a relative href/Markdown link), never the images that stay in
// the old folder (/ai-visibility/<slug>-<w>.<fmt>) or the OG card (/og/ai-visibility.jpg).
const OLD_PAGE_URL = /(?:autolander\.ai|["'(])\/ai-visibility(?:\.md|\/?(?![\w/.-]))/;

function collectStrings(value, into = []) {
  if (typeof value === 'string') into.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, into));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, into));
  return into;
}

function jsonLdFrom(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1].replaceAll('\\u003c', '<')));
}

function productionShell({ title, headHtml, mirrorHtml }) {
  const viteLikeShell = read('index.html').replace('  </head>', '</head>');
  return buildPageShell(viteLikeShell, {
    title,
    headHtml,
    mirrorHtml,
    cssHref: '/assets/page-test.css',
    jsHref: '/assets/page-test.js',
  });
}

const sectionById = (html, id) => new RegExp(`<section id="${id}"[\\s\\S]*?</section>`).exec(html)?.[0] || '';

test('the page URL lives in one route module and the content module re-exports it', () => {
  assert.equal(AI_VISIBILITY_PATH, '/aeo-geo-for-car-dealers/');
  assert.equal(AI_VISIBILITY_DIR, 'aeo-geo-for-car-dealers');
  assert.equal(AI_VISIBILITY_MD_PATH, '/aeo-geo-for-car-dealers.md');
  assert.equal(AI_CONTENT.AI_VISIBILITY_PATH, AI_VISIBILITY_PATH);
  assert.ok(AI_CONTENT.AGENT_GUIDANCE.handoff.includes(`${CANONICAL}#scan-form`));
});

test('content module keeps the public copy rules and canonical three plan prices', () => {
  assert.deepEqual(PLANS.map(({ name, monthly, setup, availability }) => ({ name, monthly, setup, availability })), [
    { name: 'AI Foundation', monthly: 997, setup: 997, availability: 'open' },
    { name: 'AI Authority', monthly: 2497, setup: 997, availability: 'by-application' },
    { name: 'Market Leader', monthly: 5997, setup: 2997, availability: 'by-application' },
  ]);

  const strings = collectStrings(AI_CONTENT);
  const copy = strings.join('\n');
  // Only the "guarantee" pattern skips the allow-listed FAQ questions; every other pattern (dashes, cadence and the
  // rest) still runs over every string, those questions included.
  const allowedQuestions = new Set(FAQ.filter((item) => item.allow).map((item) => item.q));
  const copyForGuarantee = strings.filter((value) => !allowedQuestions.has(value)).join('\n');
  const guarantee = /\bguarantee\b/i;
  const banned = [
    /[\u2013\u2014]/u,
    /\bpowered by\b/i,
    /\bearned media\b/i,
    /\bpress coverage\b/i,
    /\bfeatured in\b/i,
    /\bas seen in\b/i,
    /\bbacklinks?\b/i,
    /\bauthority links?\b/i,
    /\blink building\b/i,
    /\b#1\b/i,
    guarantee,
    /\bdominate\b/i,
    /\bown your market\b/i,
    /\bAI-proof\b/i,
    /\bGoogle posts\b/i,
    /\bservice credit\b/i,
    // Michael, 2026-09-30: no credit of any kind is offered on this page (results credit removed).
    /\bcredit(?:s|ed)?\b(?! card)/i,
    /\bmissed promise\b/i,
    /\bofficial APIs?\b/i,
    /\bnot\b[^.!?]{0,120}[.!?]\s+(?:It|It’s|It's|This|That’s|That's)\b/i,
    // Michael is "co-founder", never "founder".
    /(?<!co-)\bfounder\b/i,
  ];
  banned.forEach((pattern) => assert.doesNotMatch(pattern === guarantee ? copyForGuarantee : copy, pattern));

  // The one "guarantee" question is answered with a plain No, and no answer anywhere uses the word.
  const guaranteeItems = FAQ.filter((item) => /guarantee/i.test(item.q));
  assert.equal(guaranteeItems.length, 1);
  assert.ok(guaranteeItems.every((item) => item.allow && item.a.startsWith('No.')));
  FAQ.forEach((item) => assert.doesNotMatch(item.a, /guarantee/i, item.q));
  // No ranking or placement promises in any answer: every "promise" is a "no one can promise" style denial.
  for (const item of FAQ) {
    for (const match of item.a.matchAll(/[^.!?]*\bpromise\b[^.!?]*[.!?]/gi)) {
      assert.match(match[0], /\b(?:no one|nobody|can’t|cannot|never)\b/i, `${item.q}: ${match[0]}`);
    }
  }

  // Michael, 2026-09-30: assistants are named throughout the copy, but the free scan is described honestly.
  const scanScope = FAQ.find((item) => item.q === 'Which AI assistants do you check?');
  assert.match(scanScope.a, /^Two: ChatGPT, made by OpenAI, and Claude, made by Anthropic/);
  assert.match(scanScope.a, /doesn’t measure Google Gemini, AI Overviews or Perplexity/);

  const planTokens = new Set(PLANS.flatMap((plan) => [fmtUsd(plan.monthly), fmtUsd(plan.setup)]));
  const withoutReportIllustration = Object.entries(AI_CONTENT)
    .filter(([name, value]) => typeof value !== 'function' && name !== 'REPORT_MOCK')
    .flatMap(([, value]) => collectStrings(value));
  const dollarTokens = new Set(withoutReportIllustration.join('\n').match(/\$\d{1,3}(?:,\d{3})*/g) || []);
  assert.deepEqual(dollarTokens, planTokens, 'all pricing copy must be derived from PLANS');
});

test('title and H1 lead with the niche, and the FAQ has 16 questions', () => {
  assert.ok(META.title.length <= 60, META.title);
  assert.ok(!META.title.includes('&'));
  assert.ok(META.description.length <= 155);
  assert.match(META.title, /^AEO and GEO for car dealers/i);
  assert.match(`${HERO.h1Lead} ${HERO.h1Grad}`, /^AEO and GEO for car dealers/i);
  assert.equal(FAQ.length, 16);
  assert.equal(FAQ[0].q, 'What is AEO for car dealers?');
});

test('the page names Google Gemini, ChatGPT, Claude and Perplexity and never the bare model name GPT', () => {
  // Michael, 2026-09-30: name every major assistant; keep the meta description short enough to show whole.
  assert.ok(META.description.length <= 150, `meta description is ${META.description.length} chars`);
  for (const source of [renderAiVisibilityMirror(), renderAiVisibilityMarkdown(), read(TWIN_FILE)]) {
    for (const brand of ['Gemini', 'ChatGPT', 'Claude', 'Perplexity']) assert.match(source, new RegExp(String.raw`\b${brand}\b`), brand);
    assert.doesNotMatch(source, /(?<!Chat)\bGPT\b(?!-)/, 'no bare GPT');
  }
});

test('AI and team mirrors and their production shells contain no broken text characters', () => {
  for (const [title, headHtml, mirrorHtml] of [
    [META.title, aiVisibilityHead(), renderAiVisibilityMirror()],
    [TEAM_META.title, teamHead(), renderTeamMirror()],
  ]) {
    // Check raw mirrors as well as visible shell text. The shell also contains
    // valid script URLs such as js?id=..., which are not damaged page copy.
    for (const html of [mirrorHtml, text(productionShell({ title, headHtml, mirrorHtml }))]) {
      assert.doesNotMatch(html, /\w\?\w|\uFFFD/u, title);
    }
    assert.doesNotMatch(productionShell({ title, headHtml, mirrorHtml }), /\uFFFD/u, title);
  }
  assert.ok(renderTeamMirror().includes('who’s online'));
});

test('AI Visibility dedicated shell is indexable and carries only its route graph', () => {
  const mirror = renderAiVisibilityMirror({ capiUrl: 'https://forms.example' });
  const html = productionShell({
    title: META.title,
    headHtml: aiVisibilityHead(),
    mirrorHtml: mirror,
  });

  assert.match(html, new RegExp(`<title>${META.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`));
  assert.ok(html.includes(`<meta name="description" content="${META.description}" />`));
  assert.ok(html.includes(`<link rel="canonical" href="${CANONICAL}" />`));
  assert.ok(html.includes('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />'));
  assert.ok(html.includes('<link rel="alternate" type="text/markdown" href="/aeo-geo-for-car-dealers.md" />'));
  assert.ok(html.includes(`<meta property="og:url" content="${CANONICAL}" />`));
  assert.ok(html.includes(`<meta property="og:title" content="${META.ogTitle}" />`));
  assert.ok(html.includes(`<meta property="og:description" content="${META.ogDescription}" />`));
  assert.ok(html.includes(`<meta name="twitter:title" content="${META.ogTitle}" />`));
  assert.ok(!html.includes('/ai-visibility.md') && !html.includes('https://autolander.ai/ai-visibility/"'));
  assert.equal((html.match(/<meta name="robots"/g) || []).length, 1);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('<form id="scan-form" method="post" action="https://forms.example/api/ai-scan"'));

  const blocks = jsonLdFrom(html);
  assert.equal(blocks.length, 1, 'the homepage JSON-LD must be removed before route JSON-LD is inserted');
  const graph = blocks[0]['@graph'];
  const types = graph.map((node) => node['@type']);
  assert.deepEqual(types, ['WebPage', 'Service', 'DefinedTermSet', 'FAQPage', 'BreadcrumbList', 'Organization', 'WebSite', ...(REVIEW.enabled ? ['Person'] : [])]);
  assert.ok(!types.includes('Product') && !types.includes('AggregateRating') && !types.includes('Review'));
  assert.ok(graph.every((node) => !('@context' in node)), 'one @context, on the graph');

  const service = graph.find((node) => node['@type'] === 'Service');
  const offers = service.hasOfferCatalog.itemListElement;
  assert.equal(offers.length, PLANS.length);
  assert.deepEqual(offers.map((offer) => Number(offer.price)), PLANS.map((plan) => plan.monthly));
  offers.forEach((offer, index) => {
    const components = offer.priceSpecification.priceComponent;
    assert.equal(Number(components[0].price), PLANS[index].monthly);
    assert.equal(Number(components[1].price), PLANS[index].setup);
    assert.ok(offer.url.startsWith(`${CANONICAL}#plan-`));
  });
  assert.match(service.name, /AEO and GEO/);
  assert.match(service.serviceType, /answer engine optimization and generative engine optimization/i);
  assert.equal(service.url, CANONICAL);

  const webpage = graph.find((node) => node['@type'] === 'WebPage');
  assert.equal(webpage['@id'], `${CANONICAL}#webpage`);
  assert.equal(webpage.url, CANONICAL);
  // The page date moves forward with each published AEO article (src/ai/page-updated.js).
  assert.equal(webpage.dateModified, PAGE_UPDATED);
  assert.ok(PAGE_UPDATED >= AI_VISIBILITY_UPDATED);
  assert.equal(webpage.datePublished, AI_VISIBILITY_PUBLISHED);
  assert.ok(webpage.speakable.cssSelector.includes('.al-aeo-def'));
  assert.ok(webpage.speakable.cssSelector.includes('.al-aeo-lead'));
  assert.deepEqual(webpage.about.map((ref) => ref['@id']), [`${CANONICAL}#service`, `${CANONICAL}#term-aeo`, `${CANONICAL}#term-geo`, `${CANONICAL}#term-seo`]);

  // Every @id this page references resolves inside its own graph.
  const ids = new Set(graph.flatMap((node) => [node['@id'], ...(node.hasDefinedTerm || []).map((term) => term['@id'])]));
  for (const ref of JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)) {
    assert.ok(ids.has(ref[1]), `dangling reference ${ref[1]}`);
  }
  const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList');
  assert.deepEqual(breadcrumb.itemListElement.map((item) => [item.name, item.item]), [['Home', 'https://autolander.ai/'], [META.breadcrumb, CANONICAL]]);
  const org = graph.find((node) => node['@type'] === 'Organization');
  assert.equal(org['@id'], 'https://autolander.ai/#organization');
  assert.ok(org.knowsAbout.includes('Answer engine optimization (AEO) for car dealers'));
});

test('SEO, AEO and GEO are defined once, verbatim, in the visible section, the twin and the DefinedTermSet', () => {
  const mirror = renderAiVisibilityMirror();
  const section = sectionById(mirror, AEO_GEO.anchor);
  assert.ok(section, 'the mirror carries the AEO and GEO section');
  assert.equal((mirror.match(/<section id="what-is-aeo-geo"/g) || []).length, 1);
  assert.doesNotMatch(section.slice(1), /<section\b/, 'no nested <section>');
  const twin = read(TWIN_FILE);
  const graph = aiVisibilityGraph()['@graph'];
  const set = graph.find((node) => node['@type'] === 'DefinedTermSet');
  assert.equal(set['@id'], `${CANONICAL}#aeo-geo-terms`);
  assert.equal(set.url, `${CANONICAL}#what-is-aeo-geo`);
  assert.deepEqual(set.hasDefinedTerm.map((term) => term['@id']), ['aeo', 'geo', 'seo'].map((id) => `${CANONICAL}#term-${id}`));
  const visibleDefs = [...section.matchAll(/<span class="al-aeo-def">([\s\S]*?)<\/span>/g)].map((match) => text(match[1]));
  assert.deepEqual(visibleDefs, AEO_GEO.terms.map(({ definition }) => definition));
  for (const term of AEO_GEO.terms) {
    assert.ok(text(section).includes(term.definition), `${term.id}: mirror`);
    assert.ok(twin.includes(`### ${term.question}\n\n${term.definition} ${term.detail}\n`), `${term.id}: twin`);
    assert.ok(section.includes(`id="term-${term.id}"`), `${term.id}: anchor`);
    const node = set.hasDefinedTerm.find((defined) => defined['@id'] === `${CANONICAL}#term-${term.id}`);
    assert.equal(node.description, term.definition, `${term.id}: DefinedTerm description`);
    assert.equal(node.termCode, term.abbr);
    assert.deepEqual(node.sameAs, TERM_SAME_AS[term.id]);
    assert.ok(node.sameAs.every((url) => url.startsWith('https://www.wikidata.org/wiki/Q') || url.startsWith('https://en.wikipedia.org/wiki/')));
    assert.deepEqual(node.inDefinedTermSet, { '@id': set['@id'] });
  }
  // The comparison is a real table: one, with a row header per row, and the same rows in the twin.
  assert.equal((section.match(/<table\b/g) || []).length, 1);
  assert.equal((section.match(/<th scope="row"/g) || []).length, AEO_GEO.table.rows.length);
  assert.equal(AEO_GEO.table.rows.length, 4);
  assert.ok(section.includes(`<caption class="p-5 text-left font-bold text-white">${AEO_GEO.table.caption}</caption>`));
  for (const row of AEO_GEO.table.rows) assert.ok(twin.includes(`| ${row.join(' | ')} |`), row[0]);
  assert.ok(twin.includes('| | SEO | AEO | GEO |'));
  // Plain visible text: nothing collapsed.
  assert.doesNotMatch(section, /<details\b/);
  for (const { url } of AEO_GEO.sources) assert.ok(section.includes(`href="${url}"`) && twin.includes(`(${url})`), url);
  // The section is first below the hero, in the mirror, the React tree and the twin.
  assert.ok(renderAiVisibilityMirrorRest().startsWith('<section id="what-is-aeo-geo"'));
  const app = read('src/ai/AiVisibilityApp.jsx');
  assert.match(app, /<>\s*<AeoGeoSection \/>\s*<ShiftSection \/>/);
  assert.ok(twin.indexOf(`## ${AEO_GEO.h2Lead} ${AEO_GEO.h2Grad}`) < twin.indexOf(`## ${AI_CONTENT.SHIFT.h2Lead}`));
});

test('dates: the page shows when it was updated, and the prices line keeps its own date', () => {
  const mirror = renderAiVisibilityMirror();
  assert.ok(sectionById(mirror, AEO_GEO.anchor).includes(`datetime="${PAGE_UPDATED}"`));
  assert.ok(sectionById(mirror, 'plans').includes(`datetime="${PLANS_UPDATED}"`));
  assert.ok(!sectionById(mirror, 'plans').includes(`datetime="${PAGE_UPDATED}"`) || PLANS_UPDATED === PAGE_UPDATED);
  assert.ok(AI_VISIBILITY_PUBLISHED <= PLANS_UPDATED && PLANS_UPDATED <= AI_VISIBILITY_UPDATED);
  const twin = read(TWIN_FILE);
  assert.match(twin, /\nPublished: September 28, 2026\nUpdated: /);
  const sections = read('src/ai/AiSections.jsx');
  assert.match(sections, /Prices and plans updated <time dateTime=\{PLANS_UPDATED\}>\{PLANS_UPDATED_HUMAN\}<\/time>/);
});

test('the co-founder byline ships only when REVIEW is enabled', () => {
  assert.equal(REVIEW.enabled, false, 'D2: off until Michael confirms he reviewed the page');
  const graph = aiVisibilityGraph()['@graph'];
  const webpage = graph.find((node) => node['@type'] === 'WebPage');
  assert.ok(!('reviewedBy' in webpage) && !('lastReviewed' in webpage));
  assert.ok(!graph.some((node) => node['@type'] === 'Person'));
  assert.deepEqual(webpage.author, { '@id': 'https://autolander.ai/#organization' });
  for (const surface of [renderAiVisibilityMirror(), renderAiVisibilityMarkdown(), JSON.stringify(graph)]) {
    assert.doesNotMatch(surface, /Reviewed by/);
  }
  assert.match(REVIEW.role, /^co-founder\b/);
});

test('FAQPage answers are byte-identical to the crawlable visible FAQ answers', () => {
  const mirror = renderAiVisibilityMirror();
  const visible = [...mirror.matchAll(/<div class="al-faq-a[^>]*>([\s\S]*?)<\/div>/g)]
    .map((match) => text(match[1]));
  const graph = aiVisibilityGraph()['@graph'];
  const schema = graph.find((node) => node['@type'] === 'FAQPage').mainEntity;

  assert.deepEqual(visible, FAQ.map(({ a }) => a));
  assert.deepEqual(schema.map((item) => item.name), FAQ.map(({ q }) => q));
  assert.deepEqual(schema.map((item) => item.acceptedAnswer.text), FAQ.map(({ a }) => a));
  // The FAQ has a visible heading in the mirror and the twin.
  const faq = sectionById(mirror, 'faq');
  assert.ok(text(faq).includes(`${AI_CONTENT.FAQ_HEADING.h2Lead} ${AI_CONTENT.FAQ_HEADING.h2Grad}`));
  assert.equal((faq.match(/<h2\b/g) || []).length, 1);
  assert.ok(read(TWIN_FILE).includes(`## ${AI_CONTENT.FAQ_HEADING.h2Lead} ${AI_CONTENT.FAQ_HEADING.h2Grad}\n`));
});

test('related guides are linked from the page bottom in the mirror and the twin', () => {
  const mirror = renderAiVisibilityMirror();
  const twin = read(TWIN_FILE);
  for (const { label, href } of AI_CONTENT.RELATED.links) {
    assert.ok(mirror.includes(`href="${href}">${label}</a>`), href);
    assert.ok(twin.includes(`- [${label}](https://autolander.ai${href})`), href);
  }
  assert.ok(twin.indexOf('## Related guides for dealers') > twin.indexOf(`## ${AI_CONTENT.FAQ_HEADING.h2Lead}`));
});

test('static mirror form uses the native, accessible, agent-readable contract', () => {
  const html = renderAiVisibilityMirror({ capiUrl: 'https://autolander.ai/' });
  assert.match(html, /<form id="scan-form" method="post" action="https:\/\/autolander\.ai\/api\/ai-scan"/);
  assert.ok(html.includes('toolname="request_ai_visibility_scan"'));
  assert.ok(!html.includes('toolautosubmit'));

  for (const name of ['dealershipName', 'website', 'location', 'fullName', 'role', 'email', 'phone']) {
    assert.ok(html.includes(`id="scan-${name}"`), `${name} needs the stable field id`);
    assert.ok(html.includes(`name="${name}"`), `${name} needs its JSON field name`);
    assert.ok(html.includes(`scan-${name}-hint`), `${name} needs a visible hint`);
    assert.ok(html.includes(`scan-${name}-error`), `${name} needs an inline error`);
  }
  assert.ok(html.includes('name="company"'));
  assert.ok(html.includes(`name="smsConsentVersion" value="${SMS_CONSENT.version}"`));
  assert.ok(html.includes('name="submittedVia" value="form"'));
  assert.match(html, /name="smsConsent" type="checkbox" value="true"/);
  assert.ok(!/name="smsConsent"[^>]*\srequired(?:\s|>)/.test(html));
});

test('team gets its own readable noindex shell and metadata', () => {
  const html = productionShell({
    title: TEAM_META.title,
    headHtml: teamHead(),
    mirrorHtml: renderTeamMirror(),
  });
  assert.ok(html.includes(`<title>${TEAM_META.title}</title>`));
  assert.ok(html.includes(`<meta name="description" content="${TEAM_META.description}" />`));
  assert.ok(html.includes('<meta name="robots" content="noindex, follow" />'));
  assert.ok(html.includes('<link rel="canonical" href="https://autolander.ai/team/" />'));
  assert.ok(html.includes('https://autolander.ai/og/team.jpg'));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(!text(renderTeamMirror()).includes(TEAM_META.description), 'approved removal of the duplicate mirror-only paragraph');
});

test('plan prices do not drift across renderer and generated agent surfaces', () => {
  const mirrorPlans = /<section id="plans"[\s\S]*?<\/section>/.exec(renderAiVisibilityMirror())?.[0] || '';
  const allowed = new Set(PLANS.flatMap((plan) => [fmtUsd(plan.monthly), fmtUsd(plan.setup)]));
  const mirrorTokens = new Set(mirrorPlans.match(/\$\d{1,3}(?:,\d{3})*/g) || []);
  assert.deepEqual(mirrorTokens, allowed);

  const graphOffers = aiVisibilityGraph()['@graph']
    .find((node) => node['@type'] === 'Service').hasOfferCatalog.itemListElement;
  assert.deepEqual(graphOffers.map((offer) => [Number(offer.price), Number(offer.priceSpecification.priceComponent[1].price)]),
    PLANS.map((plan) => [plan.monthly, plan.setup]));

  const twin = read(TWIN_FILE);
  assert.equal(twin, renderAiVisibilityMarkdown());
  const llms = read('public/llms.txt');
  const block = /<!-- ai-visibility:start -->([\s\S]*?)<!-- ai-visibility:end -->/.exec(llms)?.[1] || '';
  const llmsTokens = new Set(block.match(/\$\d{1,3}(?:,\d{3})*/g) || []);
  assert.deepEqual(llmsTokens, allowed);
  for (const plan of PLANS) {
    for (const value of [fmtUsd(plan.monthly), fmtUsd(plan.setup)]) {
      assert.ok(twin.includes(value), `Markdown twin is missing ${plan.name} ${value}`);
    }
  }
});

test('agent files exclude the form endpoint and index only AI Visibility', () => {
  assert.ok(!existsSync(resolve(ROOT, 'public/ai-visibility.md')), 'the old twin is removed (the Worker 301s its URL)');
  for (const file of [TWIN_FILE, 'public/llms.txt', 'public/llms-full.txt', 'public/agents.md']) {
    const contents = read(file);
    assert.ok(!contents.includes('/api/ai-scan'), `${file} must not expose the form endpoint`);
  }

  for (const file of ['public/llms.txt', 'public/llms-full.txt', 'public/agents.md']) {
    const contents = read(file);
    assert.equal((contents.match(/<!-- ai-visibility:start -->/g) || []).length, 1, `${file} start marker`);
    assert.equal((contents.match(/<!-- ai-visibility:end -->/g) || []).length, 1, `${file} end marker`);
    assert.ok(contents.includes(TWIN_URL), `${file} links the new Markdown twin`);
    assert.doesNotMatch(contents, OLD_PAGE_URL, `${file} still points at the retired URL`);
  }

  const sitemap = read('public/sitemap.xml');
  assert.ok(sitemap.includes(`<loc>${CANONICAL}</loc>`));
  assert.ok(!sitemap.includes('<loc>https://autolander.ai/ai-visibility/</loc>'));
  assert.match(sitemap, new RegExp(`<loc>${CANONICAL}</loc>\\s*<lastmod>${PAGE_UPDATED}</lastmod>`));
  assert.ok(!sitemap.includes('<loc>https://autolander.ai/team/</loc>'));
  for (const file of ['public/llms.txt', 'public/llms-full.txt', 'public/agents.md']) {
    assert.ok(!read(file).includes('https://autolander.ai/team/'), `${file} must omit /team/`);
  }
});

test('no generated page or agent file links the retired /ai-visibility/ page URL', () => {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
  const files = walk(resolve(ROOT, 'public'))
    .filter((file) => /\.(?:html|md|txt|xml|json)$/.test(file) && !/[\\/]public[\\/]ai-visibility[\\/]/.test(file));
  files.push(resolve(ROOT, 'index.html'));
  assert.ok(files.length > 100, 'walked the generated site');
  for (const file of files) assert.doesNotMatch(readFileSync(file, 'utf8'), OLD_PAGE_URL, file);
  // Sanity: the pattern catches the old forms and spares the images that stay in the old folder.
  for (const bad of ['https://autolander.ai/ai-visibility/', 'https://autolander.ai/ai-visibility.md', 'href="/ai-visibility/"', '(https://autolander.ai/ai-visibility/#scan-form)', '<loc>https://autolander.ai/ai-visibility/</loc>']) {
    assert.match(bad, OLD_PAGE_URL, bad);
  }
  for (const ok of ['https://autolander.ai/ai-visibility/ai-chat-phone-1600.webp', 'src="/ai-visibility/report-preview-640.avif"', 'https://autolander.ai/og/ai-visibility.jpg', '<!-- ai-visibility:start -->']) {
    assert.doesNotMatch(ok, OLD_PAGE_URL, ok);
  }
});

test('robots and image sitemap carry the generated AI crawler additions', () => {
  const robots = read('public/robots.txt');
  for (const bot of ['ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'DuckAssistBot', 'MistralAI-User', 'Amzn-SearchBot', 'meta-webindexer']) {
    assert.match(robots, new RegExp(`User-agent: ${bot}\\nAllow: /`));
  }
  assert.ok(!robots.includes('User-agent: anthropic-ai'));
  assert.ok(!robots.includes('User-agent: Claude-Web'));

  const images = read('public/image-sitemap.xml');
  // The page moved; its images did not.
  assert.ok(images.includes(`<loc>${CANONICAL}</loc>`));
  assert.ok(!images.includes('<loc>https://autolander.ai/ai-visibility/</loc>'));
  for (const item of AI_VISIBILITY_IMAGES) {
    assert.ok(images.includes(`https://autolander.ai${item.src}`));
    assert.ok(item.src.startsWith('/ai-visibility/'), item.src);
  }
});

test('built dedicated shells match generator metadata when dist exists', { skip: !existsSync(resolve(ROOT, `dist/${AI_VISIBILITY_DIR}/index.html`)) }, () => {
  const ai = read(`dist/${AI_VISIBILITY_DIR}/index.html`);
  const team = read('dist/team/index.html');
  assert.ok(ai.includes(`<title>${META.title}</title>`));
  assert.ok(ai.includes('content="index, follow, max-image-preview:large, max-snippet:-1"'));
  assert.ok(ai.includes(`<link rel="canonical" href="${CANONICAL}" />`));
  assert.ok(ai.includes('<div id="root" data-al-hydrate="ai-visibility">') && ai.includes('id="scan-form"'));
  // The no-JS agent layer ships unchanged: the static mirror below the hero is the page's island, byte for byte.
  assert.ok(ai.includes(`<div data-al-island="ai-rest">${renderAiVisibilityMirrorRest()}</div>`));
  assert.ok(team.includes(`<div data-al-island="team-rest">${renderTeamMirrorRest()}</div>`));
  assert.equal((ai.match(/<form id="scan-form" method="post" action="https:\/\/autolander\.ai\/api\/ai-scan"/g) || []).length, 1);

  const planSection = /<section id="plans"[\s\S]*?<\/section>/.exec(ai)?.[0] || '';
  const expectedPrices = new Set(PLANS.flatMap((plan) => [fmtUsd(plan.monthly), fmtUsd(plan.setup)]));
  assert.deepEqual(new Set(planSection.match(/\$\d{1,3}(?:,\d{3})*/g) || []), expectedPrices);

  const graph = jsonLdFrom(ai)[0]['@graph'];
  const service = graph.find((node) => node['@type'] === 'Service');
  assert.deepEqual(
    service.hasOfferCatalog.itemListElement.map((offer) => [
      Number(offer.price),
      Number(offer.priceSpecification.priceComponent[1].price),
    ]),
    PLANS.map((plan) => [plan.monthly, plan.setup]),
  );
  assert.ok(graph.some((node) => node['@type'] === 'DefinedTermSet'));
  assert.ok(graph.some((node) => node['@type'] === 'FAQPage'));

  assert.ok(team.includes(`<title>${TEAM_META.title}</title>`));
  assert.ok(team.includes('content="noindex, follow"'));
});
