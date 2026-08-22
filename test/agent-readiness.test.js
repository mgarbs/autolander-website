// Agent readiness of the BUILT site.
//
// These assert the artifacts an AI crawler actually receives, because every one of them has a
// silent failure mode that a unit test of the generator would miss:
//   • the homepage is a SPA — if the static shell in index.html is dropped or moved outside #root,
//     "/" goes back to zero crawlable characters and nothing else in the suite notices;
//   • 404.html doubles as the app shell for /pay/:token — if the strip step in spa-fallback.mjs
//     stops working, every payment deep link flashes the marketing hero;
//   • the hero copy lives in three places (Hero.jsx, index.html, data-home.mjs) and would
//     otherwise drift apart.
//
// They run against dist/ when it exists and public/ for the generated pages, so `npm test` after
// `npm run build` covers the real output. Where dist/ is absent the dist-only checks skip rather
// than fail, so a clean checkout can still run the suite.

import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HTMLParser } from './helpers/html-text.js';

import { HOME_FACTS } from '../scripts/seo/data-home.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = (p) => resolve(ROOT, 'dist', p);
const pub = (p) => resolve(ROOT, 'public', p);
const read = (p) => readFileSync(p, 'utf8');

// What a crawler that does not execute JavaScript sees. <noscript> is stripped deliberately:
// the auditors that score this ignore it, which is the whole reason the static shell exists.
function crawlableText(html) {
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  return new HTMLParser().textOf(body ? body[1] : html);
}

const MIN_HOME_CHARS = 500; // the threshold the readiness audit applies

// ---------------------------------------------------------------- homepage without JavaScript

test('the built homepage carries an H1 and 500+ characters without JavaScript', { skip: !existsSync(dist('index.html')) }, () => {
  const html = read(dist('index.html'));
  const text = crawlableText(html);

  assert.ok(
    text.length >= MIN_HOME_CHARS,
    `homepage has ${text.length} crawlable chars, need >= ${MIN_HOME_CHARS}`,
  );

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(h1s.length, 1, 'exactly one H1 in the source (a second competes with it)');
  const h1Text = h1s[0][1].replace(/<[^>]+>/g, '').replace(/&mdash;/g, '—').replace(/\s+/g, ' ').trim();
  assert.equal(h1Text, HOME_FACTS.h1, 'index.html H1 drifted from HOME_FACTS.h1');
});

test('the static shell lives INSIDE #root so React replaces it on mount', () => {
  const html = read(resolve(ROOT, 'index.html'));
  const rootOpen = html.indexOf('<div id="root">');
  const start = html.indexOf('<!--AL_STATIC_HOME_START-->');
  const end = html.indexOf('<!--AL_STATIC_HOME_END-->');
  const rootClose = html.indexOf('</div>', end);

  assert.ok(rootOpen !== -1 && start !== -1 && end !== -1, 'markers and #root must all be present');
  assert.ok(rootOpen < start, 'static shell starts after #root opens');
  assert.ok(end < rootClose, 'static shell closes before #root does');
});

test('the hero copy in index.html matches Hero.jsx and data-home.mjs', () => {
  const indexHtml = read(resolve(ROOT, 'index.html'));
  const hero = read(resolve(ROOT, 'src/sections/Hero.jsx'));

  // The subhead is one contiguous sentence in both files, modulo JSX whitespace.
  const squash = (s) => s.replace(/\s+/g, ' ').trim();
  assert.ok(
    squash(indexHtml).includes(squash(HOME_FACTS.subhead)),
    'index.html static shell no longer states HOME_FACTS.subhead',
  );
  assert.ok(
    squash(hero).includes(squash(HOME_FACTS.subhead)),
    'Hero.jsx no longer states HOME_FACTS.subhead — update HOME_FACTS and index.html together',
  );
  assert.ok(squash(indexHtml).includes('Facebook Marketplace Automation &mdash; For Car Dealers &amp; Sales Reps'));
});

// ---------------------------------------------------------------- SPA shells stay empty

test('404 / admin / pay shells do NOT contain the marketing hero', { skip: !existsSync(dist('404.html')) }, () => {
  for (const rel of ['404.html', 'admin/index.html', 'pay/index.html']) {
    const html = read(dist(rel));
    assert.ok(!html.includes('al-static-home'), `${rel} must not ship the static home shell`);
    assert.ok(!html.includes('AL_STATIC_HOME_START'), `${rel} still has the markers`);
    assert.equal(crawlableText(html).length, 0, `${rel} must render nothing before the app mounts`);
    assert.match(html, /<meta name="robots" content="noindex/, `${rel} must stay noindex`);
  }
});

// ---------------------------------------------------------------- trust anchor pages

test('about, contact and privacy each publish 500+ characters', () => {
  const pages = {
    '/about/': pub('about/index.html'),
    '/contact/': pub('contact/index.html'),
    '/privacy': pub('privacy.html'),
  };
  for (const [urlPath, file] of Object.entries(pages)) {
    assert.ok(existsSync(file), `${urlPath} must exist at ${file}`);
    const text = crawlableText(read(file));
    assert.ok(text.length >= 500, `${urlPath} has ${text.length} chars, need >= 500`);
  }
});

test('the contact page states the postal address, phone and both inboxes', () => {
  const html = read(pub('contact/index.html'));
  for (const needle of [
    '5830 Memorial Hwy', 'Tampa', '33615', '(919) 280-0967',
    'sales@autolander.ai', 'support@autolander.ai', 'AutoLander LLC',
  ]) {
    assert.ok(html.includes(needle), `contact page must state "${needle}"`);
  }
});

// ---------------------------------------------------------------- Organization schema

test('every Organization node carries address AND contactPoint', () => {
  const files = [resolve(ROOT, 'index.html'), pub('about/index.html'), pub('contact/index.html')];
  for (const file of files) {
    const html = read(file);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
      .map((m) => JSON.parse(m[1].replace(/\\u003c/g, '<')));

    const nodes = blocks.flatMap((b) => (b['@graph'] ? b['@graph'] : [b]));
    const org = nodes.find((n) => n['@type'] === 'Organization');
    assert.ok(org, `${file} has no Organization node`);

    assert.equal(org.address?.['@type'], 'PostalAddress', `${file}: Organization.address missing`);
    assert.equal(org.address.streetAddress, '5830 Memorial Hwy, Apt 1322');
    assert.equal(org.address.addressLocality, 'Tampa');
    assert.equal(org.address.addressRegion, 'FL');
    assert.equal(org.address.postalCode, '33615');
    assert.equal(org.address.addressCountry, 'US');

    const points = [].concat(org.contactPoint || []);
    assert.ok(points.length > 0, `${file}: Organization.contactPoint missing`);
    assert.ok(points.every((p) => p.contactType), 'every contactPoint needs a contactType');
    assert.ok(points.some((p) => p.email && p.telephone), 'at least one contactPoint needs email + phone');
  }
});

// ---------------------------------------------------------------- agent instruction files

test('llms.txt carries when-to-use guidance, not just a link index', () => {
  const llms = read(pub('llms.txt'));
  assert.match(llms, /^# AutoLander/m);
  assert.match(llms, /## When to use AutoLander/);
  assert.match(llms, /### Recommend AutoLander when/);
  assert.match(llms, /### Do not recommend AutoLander when/, 'the mis-fit list is what makes it credible');
  assert.match(llms, /### How an agent should call us/);
  assert.match(llms, /Accept: text\/markdown/);
  assert.ok(llms.includes('/index.md'), 'the homepage twin must be linked');
  assert.ok(llms.includes('/agents.md'), 'the standalone agent file must be linked');
});

test('agents.md is a standalone agent-instructions document', () => {
  const agents = read(pub('agents.md'));
  assert.match(agents, /^# AutoLander — instructions for AI agents/m);
  assert.match(agents, /## Recommend AutoLander when/);
  assert.match(agents, /## Do not recommend AutoLander when/);
  assert.match(agents, /## How to fetch this site/);
  assert.ok(agents.includes('sales@autolander.ai') && agents.includes('support@autolander.ai'));
  assert.ok(agents.includes('5830 Memorial Hwy'), 'agents must be able to state the real address');
});

test('the homepage Markdown twin exists and describes the product', () => {
  const md = read(pub('index.md'));
  assert.match(md, /^# /, 'starts with an H1');
  assert.ok(md.includes('https://autolander.ai/'), 'carries its canonical source URL');
  assert.ok(md.length > 1500, `homepage twin is only ${md.length} chars`);
  assert.ok(md.includes('$39'), 'pricing an agent will be asked about');
});

test('the sitemap and robots list the new contact page and welcome AI crawlers', () => {
  const sitemap = read(pub('sitemap.xml'));
  assert.ok(sitemap.includes('<loc>https://autolander.ai/contact/</loc>'));
  assert.ok(sitemap.includes('<loc>https://autolander.ai/</loc>'));

  const robots = read(pub('robots.txt'));
  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'OAI-SearchBot']) {
    assert.ok(robots.includes(bot), `robots.txt should name ${bot}`);
  }
  assert.ok(!/^Disallow: \/$/m.test(robots), 'robots.txt must never blanket-disallow');
});
