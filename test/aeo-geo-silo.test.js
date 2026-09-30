// AEO and GEO for car dealers (silo aeoGeo, 2026-09-30): the numbering, linking and house-rule
// contract of the 50-article drip library.
//
// The rule that matters most (Michael, 2026-09-30: "numbered so I can publish them and there
// won't be any dead links"): every article has a publish number, in-body links between articles
// point only BACKWARD to lower numbers, and forward connections come only from publish-aware
// machinery (alsoRelated, Keep exploring, hub and home directory), so publishing top to bottom
// never renders a link to an unpublished page. test/dead-links.test.js proves the same thing on
// real builds; this file pins it on the content.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SILOS, SUGGESTED_ORDER, articlePath, siloNumberingProblems, SIBLING_TOKEN_RE,
} from '../scripts/seo/articles/article-system.mjs';
import {
  collectText, EM_DASH_RE, CONTRAST_TIC_RE, FORBIDDEN_CLAIMS,
} from '../scripts/seo/articles/content-rules.mjs';
import { ARTICLES as AEO } from '../scripts/seo/articles/data-articles-aeo-geo.mjs';
import { DRIP_ARTICLES } from '../scripts/seo/articles/drip-articles.mjs';
import { NAV } from '../scripts/seo/registry.mjs';

const MONEY = NAV.aiVisibility.path; // /aeo-geo-for-car-dealers/
const BY_SLUG = new Map(AEO.map((a) => [a.slug, a]));
const CLUSTER_KEYS = SILOS.aeoGeo.clusters.map(([key]) => key);

// Strings the shell renders through fmt() (markdown links become <a>). Headings, qa.q, intros,
// table cells and captions are escaped, so a link there would print as raw markdown.
function linkableFields(a) {
  const out = [a.tldr];
  for (const s of a.sections) {
    if (s.type === 'prose') out.push(...[].concat(s.paras));
    if (s.type === 'qa') out.push(...[].concat(s.a));
    if (s.type === 'bullets') out.push(...s.items);
    if (s.type === 'features') out.push(...s.cards.map((c) => c.body));
    if (s.type === 'steps') out.push(...s.steps.map((st) => st.body));
    if (s.type === 'callout') out.push(s.body);
    if (s.type === 'twocol') out.push(...s.left.items, ...s.right.items);
  }
  for (const [, answer] of a.faq) out.push(...[].concat(answer));
  return out.filter((x) => typeof x === 'string');
}
function escapedFields(a) {
  const out = [a.title, a.description, a.h1, a.anchor, a.crumb, a.cta?.heading, a.cta?.sub];
  for (const s of a.sections) {
    out.push(s.h2, s.q, s.intro, s.caption, s.title, s.note, s.left?.h2, s.right?.h2);
    for (const row of s.rows || []) out.push(...row);
    out.push(...(s.head || []), ...(s.cards || []).map((c) => c.title), ...(s.steps || []).map((st) => st.title));
  }
  for (const [q] of a.faq) out.push(q);
  return out.filter((x) => typeof x === 'string');
}
const tokensIn = (strings) => strings.flatMap((s) => [...String(s).matchAll(SIBLING_TOKEN_RE)].map((m) => m[2]));
const bodyText = (a) => [a.title, a.description, a.h1, a.anchor, a.crumb, ...collectText(a), a.cta?.heading, a.cta?.sub]
  .filter(Boolean).join('\n');
const sentences = (text) => String(text).split(/(?<=[.!?])\s+/);
const plainWords = (s) => String(s).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').split(/\s+/).filter(Boolean).length;

// ---- numbering -------------------------------------------------------------------------------

test('50 AEO articles, numbered 1 to 50, appended to SUGGESTED_ORDER in exactly that order', () => {
  assert.equal(AEO.length, 50);
  assert.deepEqual(AEO.map((a) => a.publishOrder), Array.from({ length: 50 }, (_, i) => i + 1));
  const aeoInOrder = SUGGESTED_ORDER.filter((slug) => BY_SLUG.has(slug));
  assert.deepEqual(aeoInOrder, AEO.map((a) => a.slug));
  // after the 36 Marketplace-era slugs, never interleaved with them
  assert.deepEqual(SUGGESTED_ORDER.slice(36), aeoInOrder);
  assert.deepEqual(siloNumberingProblems(DRIP_ARTICLES), []);
});

test('cluster pillars are #1 to #9, one per cluster, in the silo cluster order', () => {
  const pillars = AEO.filter((a) => a.publishOrder <= CLUSTER_KEYS.length);
  assert.deepEqual(pillars.map((a) => a.cluster), CLUSTER_KEYS);
  for (const key of CLUSTER_KEYS) {
    assert.ok(AEO.filter((a) => a.cluster === key).length >= 3, `cluster ${key} has fewer than 3 articles`);
  }
});

test('every article sits in a known cluster, under /aeo-geo/, with no image sections', () => {
  for (const a of AEO) {
    assert.equal(a.silo, 'aeoGeo', a.slug);
    assert.ok(CLUSTER_KEYS.includes(a.cluster), `${a.slug}: unknown cluster ${a.cluster}`);
    assert.match(a.slug, /^[a-z0-9][a-z0-9-]{2,80}$/);
    assert.equal(articlePath(a), `/aeo-geo/${a.slug}/`);
    assert.ok(a.sections.every((s) => s.type !== 'figure' && s.type !== 'image'), `${a.slug}: image section`);
    assert.ok(a.cta.heading && a.cta.sub, `${a.slug}: cta needs heading + sub (the silo supplies the button)`);
  }
});

// ---- links: backward-only in body, forward only through publish-aware machinery ---------------

test('in-body sibling links are (@slug) tokens that point ONLY to lower publish numbers', () => {
  for (const a of AEO) {
    const tokens = tokensIn(linkableFields(a));
    assert.equal(tokensIn(escapedFields(a)).length, 0, `${a.slug}: a token sits in an escaped field`);
    assert.equal(tokensIn(collectText(a)).length, tokens.length, `${a.slug}: a token sits outside a linkable field`);
    for (const slug of tokens) {
      const target = BY_SLUG.get(slug);
      assert.ok(target, `${a.slug} (#${a.publishOrder}): token to unknown or non-AEO slug ${slug}`);
      assert.ok(target.publishOrder < a.publishOrder,
        `${a.slug} (#${a.publishOrder}) links FORWARD to #${target.publishOrder} ${slug}: a dead link until it is published`);
    }
  }
});

test('article #1 links no sibling; #2 links the one before it; every later article has 2 to 4 backward links', () => {
  for (const a of AEO) {
    const distinct = new Set(tokensIn(linkableFields(a)));
    if (a.publishOrder === 1) assert.equal(distinct.size, 0, 'article #1 must link only the money page and live pages');
    else if (a.publishOrder === 2) assert.ok(distinct.size >= 1, '#2 links #1');
    else assert.ok(distinct.size >= 2 && distinct.size <= 4, `${a.slug} (#${a.publishOrder}): ${distinct.size} backward links`);
  }
});

test('backward links reach the same cluster first when an earlier same-cluster article exists', () => {
  for (const a of AEO) {
    const earlierSameCluster = AEO.some((b) => b.cluster === a.cluster && b.publishOrder < a.publishOrder);
    if (!earlierSameCluster) continue;
    const tokens = tokensIn(linkableFields(a));
    assert.ok(tokens.some((slug) => BY_SLUG.get(slug).cluster === a.cluster),
      `${a.slug} (#${a.publishOrder}): no link to an earlier ${a.cluster} article`);
  }
});

test('no hand-written href to an article: only live NAV pages, money-page anchors and https sources', () => {
  const live = new Set([
    ...Object.values(NAV).map((n) => n.path),
    ...['#scan-form', '#plans', '#faq', '#what-is-aeo-geo'].map((hash) => MONEY + hash),
  ]);
  const articlePaths = new Set(DRIP_ARTICLES.map((a) => articlePath(a)));
  for (const a of AEO) {
    for (const text of collectText(a)) {
      for (const m of String(text).matchAll(/\]\(([^)\s]+)\)/g)) {
        const href = m[1];
        if (href.startsWith('@')) continue;
        if (href.startsWith('https://')) continue;
        assert.ok(live.has(href), `${a.slug}: internal href ${href} is not a live page`);
        assert.ok(!articlePaths.has(href.replace(/[#?].*$/, '')), `${a.slug}: hand-written article href ${href}`);
      }
    }
  }
});

test('every article links UP to the money page in body copy; exact-match anchor on 25 to 40% of articles', () => {
  const variants = [
    `[AEO and GEO for car dealers](${MONEY})`,
    `[AEO for car dealerships](${MONEY})`,
    `[generative engine optimization for dealers](${MONEY})`,
    `[AI visibility scan for car dealers](${MONEY}#scan-form)`,
    `[AutoLander’s AEO and GEO service](${MONEY})`,
  ];
  let exact = 0;
  for (const a of AEO) {
    const body = linkableFields(a).join('\n');
    assert.ok(body.includes(`](${MONEY}`), `${a.slug}: no in-body link to ${MONEY}`);
    assert.ok(variants.some((v) => body.includes(v)), `${a.slug}: none of the planned up-link anchors`);
    if (body.includes(variants[0])) exact += 1;
  }
  const share = exact / AEO.length;
  assert.ok(share >= 0.25 && share <= 0.4, `exact anchor on ${exact}/${AEO.length} articles`);
});

test('alsoRelated: 2 to 6 real articles each, and every article after #1 is listed by an EARLIER one', () => {
  const allSlugs = new Set(DRIP_ARTICLES.map((a) => a.slug));
  for (const a of AEO) {
    assert.ok(a.alsoRelated.length >= 2 && a.alsoRelated.length <= 6, `${a.slug}: ${a.alsoRelated.length} alsoRelated`);
    assert.equal(new Set(a.alsoRelated).size, a.alsoRelated.length, `${a.slug}: duplicate alsoRelated`);
    for (const slug of a.alsoRelated) {
      assert.ok(allSlugs.has(slug) && slug !== a.slug, `${a.slug}: alsoRelated ${slug} is not another drip article`);
    }
    if (a.publishOrder > 1) {
      assert.ok(AEO.some((b) => b.publishOrder < a.publishOrder && b.alsoRelated.includes(a.slug)),
        `#${a.publishOrder} ${a.slug}: no earlier article lists it, so nothing live links it on publish day`);
    }
  }
});

test('augmentKeys: cluster pillars only, valid hub keys, never the inert SPA money page', () => {
  for (const a of AEO) {
    for (const key of a.augmentKeys || []) {
      assert.ok(NAV[key] && !NAV[key].spa, `${a.slug}: augmentKey ${key}`);
    }
    if ((a.augmentKeys || []).length) assert.ok(a.publishOrder <= CLUSTER_KEYS.length, `${a.slug}: only pillars augment hubs`);
  }
});

// ---- answer-first structure -----------------------------------------------------------------

test('answer-first: each question heading is followed by a 40 to 60 word direct answer', () => {
  for (const a of AEO) {
    const ids = new Set();
    for (const s of a.sections) {
      if (s.type === 'qa') {
        assert.match(String(s.q).trim(), /\?$/, `${a.slug}: qa heading is not a question: ${s.q}`);
        assert.match(s.id || '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${a.slug}: qa "${s.q}" needs a stable kebab id`);
        assert.ok(!ids.has(s.id), `${a.slug}: duplicate id ${s.id}`);
        ids.add(s.id);
        const n = plainWords([].concat(s.a)[0]);
        assert.ok(n >= 40 && n <= 60, `${a.slug}: "${s.q}" opens with ${n} words`);
      }
      if (['bullets', 'steps', 'table'].includes(s.type) && String(s.h2).trim().endsWith('?')) {
        const n = plainWords(s.intro || '');
        assert.ok(n >= 40 && n <= 60, `${a.slug}: "${s.h2}" intro has ${n} words`);
      }
    }
  }
});

// ---- keywords --------------------------------------------------------------------------------

test('one primary keyword per article, no cannibalization of existing articles or the money page', () => {
  const norm = (k) => String(k).toLowerCase().replace(/\s+/g, ' ').trim();
  const others = DRIP_ARTICLES.filter((a) => a.silo !== 'aeoGeo');
  const taken = new Map();
  for (const o of others) for (const k of [o.primaryKeyword, ...(o.secondaryKeywords || [])]) taken.set(norm(k), o.slug);
  const moneyTerms = new Set([
    'aeo for car dealers', 'geo for car dealers', 'aeo and geo for car dealers', 'ai visibility for car dealers',
    'answer engine optimization for car dealers', 'generative engine optimization for car dealers',
  ]);
  const seen = new Map();
  for (const a of AEO) {
    const k = norm(a.primaryKeyword);
    assert.ok(!seen.has(k), `${a.slug}: primary keyword "${k}" also used by ${seen.get(k)}`);
    seen.set(k, a.slug);
    assert.ok(!taken.has(k), `${a.slug}: "${k}" is already targeted by ${taken.get(k)}`);
    assert.ok(!moneyTerms.has(k), `${a.slug}: "${k}" is the money page's head term`);
  }
});

// ---- house rules ------------------------------------------------------------------------------

test('house style: no dashes, no contrast cadence, no forbidden claims', () => {
  for (const a of AEO) {
    const body = bodyText(a);
    assert.ok(!EM_DASH_RE.test(body), `${a.slug}: em or en dash`);
    assert.ok(!CONTRAST_TIC_RE.test(body), `${a.slug}: contrast cadence at ${body.match(CONTRAST_TIC_RE)?.[0]}`);
    for (const re of FORBIDDEN_CLAIMS) assert.ok(!re.test(body), `${a.slug}: forbidden claim ${re}`);
  }
});

test('assistants are named correctly: no bare "GPT" product, no retired product names', () => {
  for (const a of AEO) {
    const body = bodyText(a);
    assert.ok(!/(?<!Chat)\bGPT\b(?!-)/.test(body), `${a.slug}: bare GPT at ${body.match(/.{0,30}(?<!Chat)\bGPT\b(?!-).{0,30}/)?.[0]}`);
    assert.ok(!/\b(?:Bard|SGE|Search Generative Experience|Bing Chat)\b/.test(body), `${a.slug}: retired product name`);
  }
});

test('never a promise: every sentence with promise or guarantee carries a denial', () => {
  const denial = /(no one|nobody|can[’']t|cannot|never|doesn[’']t|does not)/i;
  for (const a of AEO) {
    for (const text of [a.title, a.description, ...collectText(a)]) {
      for (const s of sentences(text)) {
        if (/\b(?:promis|guarante)/i.test(s)) assert.ok(denial.test(s), `${a.slug}: "${s}"`);
      }
    }
  }
});

test('banned phrases from the money page and the service terms never appear', () => {
  const banned = [
    /powered by/i, /earned media/i, /press coverage/i, /featured in/i, /as seen in/i, /backlinks?/i,
    /authority links/i, /link building/i, /#1\b/, /\bdominat/i, /own your market/i, /AI-proof/i,
    /Google posts/i, /service credit/i, /missed promise/i, /official API/i, /(?<!co-)\bfounder/i,
    /money[- ]back/i, /if we miss/i, /\b(?:service|account|results?) credits?\b/i,
  ];
  for (const a of AEO) {
    const body = bodyText(a);
    for (const re of banned) assert.ok(!re.test(body), `${a.slug}: banned phrase ${re}`);
  }
});

test('scan honesty: a sentence naming the free scan with another assistant says the scan does not measure it', () => {
  for (const a of AEO) {
    for (const text of collectText(a)) {
      for (const s of sentences(text)) {
        if (!/(free scan|the scan\b|AI visibility scan)/i.test(s)) continue;
        if (!/(Gemini|Perplexity|Copilot|AI Overviews|AI Mode|Ask Maps)/.test(s)) continue;
        assert.ok(/\b(?:not|never|doesn[’']t|does not|only|no)\b/i.test(s), `${a.slug}: "${s}"`);
      }
    }
  }
});

test('plan prices: only the published plan figures appear next to a plan name', () => {
  const allowed = new Set(['$997', '$2,497', '$5,997', '$2,997']);
  for (const a of AEO) {
    for (const text of collectText(a)) {
      for (const s of sentences(text)) {
        if (!/(AI Foundation|AI Authority|Market Leader)/.test(s)) continue;
        for (const price of s.match(/\$[\d,]+/g) || []) assert.ok(allowed.has(price), `${a.slug}: ${price} in "${s}"`);
      }
    }
  }
});
