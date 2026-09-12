// Content-quality gate for the Avalanche article modules. Runs on every `npm test`, so a
// future article edit that breaks a link, drops below the quality bar, or references a
// missing studio image fails CI-style instead of shipping.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SUGGESTED_ORDER, SILOS } from '../scripts/seo/articles/article-system.mjs';
import { NAV } from '../scripts/seo/registry.mjs';
import { ARTICLES as A } from '../scripts/seo/articles/data-articles-marketplace-a.mjs';
import { ARTICLES as B } from '../scripts/seo/articles/data-articles-marketplace-b.mjs';
import { ARTICLES as P } from '../scripts/seo/articles/data-articles-photos.mjs';
import { ARTICLES as G } from '../scripts/seo/articles/data-articles-growth.mjs';
import { ARTICLES as M } from '../scripts/seo/articles/data-articles-meta-tools.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALL = [...A, ...B, ...P, ...G, ...M];

// Inline links may point only at evergreen pages (drafts would 404). Sibling links are
// injected by the build system, never hand-written.
const WHITELIST = new Set([
  ...Object.values(NAV).map((n) => n.path),
  '/', '/#pricing', '/compare/',
]);

const collectText = (art) => {
  const out = [];
  const push = (v) => { if (typeof v === 'string') out.push(v); };
  push(art.tldr);
  for (const s of art.sections || []) {
    push(s.q); push(s.a); push(s.intro); push(s.body); push(s.caption); push(s.h2);
    (Array.isArray(s.a) ? s.a : []).forEach(push);
    (s.paras || []).forEach(push);
    (s.items || []).forEach(push);
    (s.cards || []).forEach((c) => { push(c.title); push(c.body); });
    (s.steps || []).forEach((st) => { push(st.title); push(st.body); });
    (s.rows || []).forEach((r) => r.forEach(push));
    if (s.left) s.left.items.forEach(push);
    if (s.right) s.right.items.forEach(push);
    (s.files || []).forEach((f) => { push(f.label); push(f.desc); });
  }
  for (const [q, a] of art.faq || []) { push(q); push(a); }
  return out;
};

test('all 32 articles exist, slugs match the drip order exactly', () => {
  assert.equal(ALL.length, 32);
  assert.deepEqual(ALL.map((a) => a.slug).sort(), [...SUGGESTED_ORDER].sort());
});

// House style for the 2026-09-12 Meta-tools articles (Michael): no em-dashes, and none of the
// "that's not X. It's Y." negation-then-reveal cadence. Both read as machine-written.
test('the Meta-tools articles carry no em-dashes and no negation-reveal cadence', () => {
  const contrastTic = /\b(?:is|are|was|were|it’s|it's|that’s|that's)\s+not\s+(?:about\s+)?[^.!?]{1,60}[.!?]\s+(?:It|That|This)\s+(?:is|’s|'s)\b/i;
  for (const art of M) {
    const body = [art.title, art.description, art.h1, ...collectText(art)].join('\n');
    assert.ok(!body.includes('—'), `${art.slug}: contains an em-dash`);
    assert.ok(!body.includes('–'), `${art.slug}: contains an en-dash`);
    assert.ok(!contrastTic.test(body), `${art.slug}: "not X. It's Y." cadence at ${body.match(contrastTic)?.[0]}`);
  }
});

test('every article carries the required fields and a valid silo', () => {
  for (const art of ALL) {
    for (const f of ['slug', 'silo', 'anchor', 'crumb', 'primaryKeyword', 'title', 'description', 'h1', 'tldr', 'sections', 'faq', 'cta']) {
      assert.ok(art[f], `${art.slug} missing ${f}`);
    }
    assert.ok(SILOS[art.silo], `${art.slug}: unknown silo ${art.silo}`);
    assert.ok(art.title.length <= 70, `${art.slug}: title too long (${art.title.length})`);
    assert.ok(art.description.length >= 110 && art.description.length <= 175, `${art.slug}: description ${art.description.length} chars`);
    assert.ok(art.faq.length >= 3, `${art.slug}: only ${art.faq.length} FAQ entries`);
    assert.ok(art.sections.length >= 4, `${art.slug}: only ${art.sections.length} sections`);
    assert.ok(art.cta.heading && art.cta.sub, `${art.slug}: incomplete cta`);
  }
});

// A /guide/ path is a sibling article unless the registry owns it (the evergreen guides live in
// NAV; drip articles never do). Derived from NAV so a new evergreen guide does not need this
// list touched — the 2026-09-03 guides had silently fallen off the old hardcoded version.
const EVERGREEN_GUIDE_PATHS = new Set(Object.values(NAV).map((n) => n.path).filter((p) => p.startsWith('/guide/')));

test('inline links stay on the evergreen whitelist (no hand-written sibling links)', () => {
  for (const art of ALL) {
    for (const text of collectText(art)) {
      for (const m of String(text).matchAll(/\]\((\/[^)\s]*)\)/g)) {
        const href = m[1];
        assert.ok(WHITELIST.has(href), `${art.slug}: inline link ${href} not on whitelist`);
        assert.ok(!href.startsWith('/guide/') || EVERGREEN_GUIDE_PATHS.has(href),
          `${art.slug}: links a sibling article directly (${href})`);
      }
    }
  }
});

test('figure/image sections reference studio files that exist (with -550 variants)', () => {
  for (const art of ALL) {
    for (const s of art.sections) {
      const paths = [];
      if (s.type === 'figure') paths.push(s.before, s.after);
      if (s.type === 'image') paths.push(s.src);
      for (const p of paths) {
        assert.ok(p.startsWith('/studio/'), `${art.slug}: image outside /studio/ (${p})`);
        assert.ok(existsSync(resolve(ROOT, 'public', p.replace(/^\//, ''))), `${art.slug}: missing file ${p}`);
        if (s.type === 'figure') {
          const variant = p.replace(/\.webp$/, '-550.webp');
          assert.ok(existsSync(resolve(ROOT, 'public', variant.replace(/^\//, ''))), `${art.slug}: missing ${variant}`);
        }
      }
      if (s.type === 'figure') {
        assert.ok(s.beforeAlt && s.afterAlt && s.caption, `${art.slug}: figure missing alt/caption`);
      }
    }
  }
});

test('substance floor: each article carries at least 700 words of body text', () => {
  for (const art of ALL) {
    const words = collectText(art).join(' ').split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 700, `${art.slug}: only ${words} words`);
  }
});

test('the forbidden-claims tripwires stay silent', () => {
  // AutoLander never touches the Marketplace inbox and never guarantees account safety.
  const forbidden = [
    /auto[- ]?respond/i, /autoresponder/i, /replies? for you/i, /answers? (?:your |buyers.? )?messages? automatically/i,
    /AutoLander (?:reads|routes|answers|responds to|replies to)/i,
    /never (?:get|be) banned/i, /guaranteed? (?:not )?to (?:not )?(?:get )?bann/i, /ban[- ]?proof/i,
  ];
  for (const art of ALL) {
    const body = collectText(art).join('\n');
    for (const re of forbidden) {
      assert.ok(!re.test(body), `${art.slug}: forbidden claim matches ${re}`);
    }
  }
});
