import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AI_VISIBILITY_UPDATED,
  FAQ,
  META,
  PLANS,
  SMS_CONSENT,
  fmtUsd,
} from '../shared/ai-visibility-content.js';
import * as AI_CONTENT from '../shared/ai-visibility-content.js';
import { TEAM_META } from '../shared/team-content.js';
import {
  AI_VISIBILITY_IMAGES,
  aiVisibilityGraph,
  aiVisibilityHead,
  renderAiVisibilityMarkdown,
} from '../scripts/seo/data-ai-visibility.mjs';
import { teamHead } from '../scripts/seo/data-team.mjs';
import { buildPageShell } from '../scripts/spa-shell.mjs';
import { renderAiVisibilityMirror, renderAiVisibilityMirrorRest } from '../src/ai/static-mirror.js';
import { renderTeamMirror, renderTeamMirrorRest } from '../src/team/static-mirror.js';
import { HTMLParser } from './helpers/html-text.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(ROOT, path), 'utf8');
const text = (html) => new HTMLParser().textOf(html);

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

test('content module keeps the public copy rules and canonical three plan prices', () => {
  assert.deepEqual(PLANS.map(({ name, monthly, setup, availability }) => ({ name, monthly, setup, availability })), [
    { name: 'AI Foundation', monthly: 997, setup: 997, availability: 'open' },
    { name: 'AI Authority', monthly: 2497, setup: 997, availability: 'by-application' },
    { name: 'Market Leader', monthly: 5997, setup: 2997, availability: 'by-application' },
  ]);

  const strings = collectStrings(AI_CONTENT);
  const copy = strings.join('\n');
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
    /\bguarantee\b/i,
    /\bdominate\b/i,
    /\bown your market\b/i,
    /\bAI-proof\b/i,
    /\bGoogle posts\b/i,
    /\bservice credit\b/i,
    /\bmissed promise\b/i,
    /\bofficial APIs?\b/i,
    /\bnot\b[^.!?]{0,120}[.!?]\s+(?:It|It’s|It's|This|That’s|That's)\b/i,
  ];
  banned.forEach((pattern) => assert.doesNotMatch(copy, pattern));

  for (const [name, content] of Object.entries(AI_CONTENT)) {
    if (['WHERE_BUYERS_ASK', 'RESULTS_VIEW'].includes(name)) continue;
    assert.doesNotMatch(collectStrings(content).join('\n'), /\b(?:ChatGPT|Perplexity|Gemini|Copilot)\b/i, name);
  }

  const planTokens = new Set(PLANS.flatMap((plan) => [fmtUsd(plan.monthly), fmtUsd(plan.setup)]));
  const withoutReportIllustration = Object.entries(AI_CONTENT)
    .filter(([name, value]) => typeof value !== 'function' && name !== 'REPORT_MOCK')
    .flatMap(([, value]) => collectStrings(value));
  const dollarTokens = new Set(withoutReportIllustration.join('\n').match(/\$\d{1,3}(?:,\d{3})*/g) || []);
  assert.deepEqual(dollarTokens, planTokens, 'all pricing copy must be derived from PLANS');
});

test('assistant brand names are restricted to the two approved mirror and twin sections', () => {
  const approved = [AI_CONTENT.WHERE_BUYERS_ASK, AI_CONTENT.RESULTS_VIEW];
  const banned = /\b(?:ChatGPT|Perplexity|Gemini|Copilot)\b/i;
  let removed = 0;
  const mirror = renderAiVisibilityMirror().replace(/<section\b[\s\S]*?<\/section>/g, (section) => {
    if (!approved.some(({ h2Lead, h2Grad }) => text(section).includes(`${h2Lead} ${h2Grad}`))) return section;
    removed += 1;
    return '';
  });
  assert.equal(removed, 2);
  assert.doesNotMatch(mirror, banned);
  for (const twin of [renderAiVisibilityMarkdown(), read('public/ai-visibility.md')]) {
    const sections = twin.split(/(?=^## )/m);
    const outside = sections.filter((section) => !approved.some(({ h2Lead, h2Grad }) => section.startsWith(`## ${h2Lead} ${h2Grad}\n`)));
    assert.equal(sections.length - outside.length, 2);
    assert.doesNotMatch(outside.join('\n'), banned);
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
  assert.ok(html.includes('<link rel="canonical" href="https://autolander.ai/ai-visibility/" />'));
  assert.ok(html.includes('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />'));
  assert.ok(html.includes('<link rel="alternate" type="text/markdown" href="/ai-visibility.md" />'));
  assert.equal((html.match(/<meta name="robots"/g) || []).length, 1);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('<form id="scan-form" method="post" action="https://forms.example/api/ai-scan"'));

  const blocks = jsonLdFrom(html);
  assert.equal(blocks.length, 1, 'the homepage JSON-LD must be removed before route JSON-LD is inserted');
  const graph = blocks[0]['@graph'];
  const types = graph.map((node) => node['@type']);
  assert.deepEqual(types, ['WebPage', 'Service', 'FAQPage', 'BreadcrumbList']);
  assert.ok(!types.includes('Product') && !types.includes('AggregateRating') && !types.includes('Review'));

  const service = graph.find((node) => node['@type'] === 'Service');
  const offers = service.hasOfferCatalog.itemListElement;
  assert.equal(offers.length, PLANS.length);
  assert.deepEqual(offers.map((offer) => Number(offer.price)), PLANS.map((plan) => plan.monthly));
  offers.forEach((offer, index) => {
    const components = offer.priceSpecification.priceComponent;
    assert.equal(Number(components[0].price), PLANS[index].monthly);
    assert.equal(Number(components[1].price), PLANS[index].setup);
  });
  assert.equal(graph.find((node) => node['@type'] === 'WebPage').dateModified, AI_VISIBILITY_UPDATED);
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

  const twin = read('public/ai-visibility.md');
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
  for (const file of ['public/ai-visibility.md', 'public/llms.txt', 'public/llms-full.txt', 'public/agents.md']) {
    const contents = read(file);
    assert.ok(!contents.includes('/api/ai-scan'), `${file} must not expose the form endpoint`);
  }

  for (const file of ['public/llms.txt', 'public/llms-full.txt', 'public/agents.md']) {
    const contents = read(file);
    assert.equal((contents.match(/<!-- ai-visibility:start -->/g) || []).length, 1, `${file} start marker`);
    assert.equal((contents.match(/<!-- ai-visibility:end -->/g) || []).length, 1, `${file} end marker`);
  }

  const sitemap = read('public/sitemap.xml');
  assert.ok(sitemap.includes('<loc>https://autolander.ai/ai-visibility/</loc>'));
  assert.ok(!sitemap.includes('<loc>https://autolander.ai/team/</loc>'));
  for (const file of ['public/llms.txt', 'public/llms-full.txt', 'public/agents.md']) {
    assert.ok(!read(file).includes('https://autolander.ai/team/'), `${file} must omit /team/`);
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
  for (const item of AI_VISIBILITY_IMAGES) {
    assert.ok(images.includes(`https://autolander.ai${item.src}`));
  }
});

test('built dedicated shells match generator metadata when dist exists', { skip: !existsSync(resolve(ROOT, 'dist/ai-visibility/index.html')) }, () => {
  const ai = read('dist/ai-visibility/index.html');
  const team = read('dist/team/index.html');
  assert.ok(ai.includes(`<title>${META.title}</title>`));
  assert.ok(ai.includes('content="index, follow, max-image-preview:large, max-snippet:-1"'));
  assert.ok(ai.includes('<div id="root" data-al-hydrate="ai-visibility">') && ai.includes('id="scan-form"'));
  // The no-JS agent layer ships unchanged: the static mirror below the hero is the page's island, byte for byte.
  assert.ok(ai.includes(`<div data-al-island="ai-rest">${renderAiVisibilityMirrorRest()}</div>`));
  assert.ok(team.includes(`<div data-al-island="team-rest">${renderTeamMirrorRest()}</div>`));
  assert.equal((ai.match(/<form id="scan-form" method="post" action="https:\/\/autolander\.ai\/api\/ai-scan"/g) || []).length, 1);

  const planSection = /<section id="plans"[\s\S]*?<\/section>/.exec(ai)?.[0] || '';
  const expectedPrices = new Set(PLANS.flatMap((plan) => [fmtUsd(plan.monthly), fmtUsd(plan.setup)]));
  assert.deepEqual(new Set(planSection.match(/\$\d{1,3}(?:,\d{3})*/g) || []), expectedPrices);

  const service = jsonLdFrom(ai)[0]['@graph'].find((node) => node['@type'] === 'Service');
  assert.deepEqual(
    service.hasOfferCatalog.itemListElement.map((offer) => [
      Number(offer.price),
      Number(offer.priceSpecification.priceComponent[1].price),
    ]),
    PLANS.map((plan) => [plan.monthly, plan.setup]),
  );

  assert.ok(team.includes(`<title>${TEAM_META.title}</title>`));
  assert.ok(team.includes('content="noindex, follow"'));
});
