import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validatePost, buildValidationContext, isStructurallyRenderable,
} from '../scripts/blog/validate-post.mjs';

const ctx = buildValidationContext();
const base = () => JSON.parse(readFileSync(new URL('./fixtures/blog/valid-post.json', import.meta.url), 'utf8'));
const errs = (mutate) => { const post = base(); mutate(post); return validatePost(post, ctx).errors.join('\n'); };

test('the fixture passes', () => {
  const result = validatePost(base(), ctx);
  assert.deepEqual(result.errors, []);
  assert.ok(result.ok && result.stats.words >= 900 && result.stats.internalLinks >= 6);
});

test('link to a non-live path fails', () => assert.match(errs((post) => { post.sections[0].a = 'See [x](/guide/not-a-real-page/).'; }), /not a live page/));

test('link to a DRAFT article fails', () => {
  const state = JSON.parse(readFileSync(new URL('../scripts/seo/articles/publish-state.json', import.meta.url), 'utf8'));
  const draft = Object.keys(state).find((slug) => state[slug].status !== 'published');
  if (!draft) return;
  assert.match(errs((post) => { post.sections[0].a = `See [x](/guide/${draft}/).`; }), /not a live page/);
});

test('em-dash fails', () => assert.match(errs((post) => { post.tldr += ' a — b'; }), /dash/));
test('contrast tic fails', () => assert.match(errs((post) => { post.tldr += " That's not a tool. It's a system."; }), /cadence/));
test('autoresponder claim fails', () => assert.match(errs((post) => { post.tldr += ' AutoLander replies to buyers automatically.'; }), /forbidden/));
test('Muse tier fails', () => assert.match(errs((post) => { post.tldr += ' Meta Muse costs $20 a month.'; }), /Muse/));
test('percentage without report link fails', () => assert.match(errs((post) => { post.sections[1].a = 'Sales rose 42% last year.'; }), /report/));
test('cannibalized keyword fails', () => assert.match(errs((post) => { post.primaryKeyword = 'Facebook Marketplace auto poster for car dealers'; }), /cannibal/i));
test('title over 60 chars fails', () => assert.match(errs((post) => { post.title = 'x'.repeat(61); }), /title/));
test('description outside 140-160 fails', () => assert.match(errs((post) => { post.description = 'short'; }), /description/));
test('unsupported section type fails', () => assert.match(errs((post) => { post.sections.push({ type: 'html', html: '<b>x</b>' }); }), /section type/));
test('missing studio image fails', () => assert.match(errs((post) => { post.sections.push({ type: 'image', src: '/studio/nope.webp', alt: 'a', caption: 'c' }); }), /image/));

test('inboundFrom must be 2-6 published slugs, not self', () => {
  assert.match(errs((post) => { post.inboundFrom = [post.slug]; }), /inboundFrom/);
  assert.match(errs((post) => { post.inboundFrom = ['no-such-slug', 'nor-this']; }), /inboundFrom/);
});

test('slug collisions and reserved slugs fail', () => {
  assert.match(errs((post) => { post.slug = 'feed'; }), /slug/);
  assert.match(errs((post) => { post.slug = 'Bad Slug'; }), /slug/);
  assert.match(errs((post) => { post.slug = 'post-a-car-on-facebook-marketplace-dealer'; }), /collides/);
});

test('augmentKeys must be NAV keys, max 3', () => assert.match(errs((post) => { post.augmentKeys = ['nope']; }), /augmentKeys/));
test('too short fails', () => assert.match(errs((post) => { post.sections = post.sections.slice(0, 2); }), /words|sections/));

test('malformed nested section content reports an error instead of throwing', () => {
  const post = base();
  post.sections[0] = { type: 'twocol', left: {}, right: {} };
  assert.doesNotThrow(() => validatePost(post, ctx));
  assert.match(validatePost(post, ctx).errors.join('\n'), /section 1 shape/);
});

test('structural validation rejects renderer-unsafe section shapes with indexed errors', () => {
  const cases = [
    { type: 'prose', paras: ['ok', 7] },
    { type: 'bullets', h2: 'Bullets', items: ['ok', 7] },
    { type: 'features', h2: 'Features', cards: [{ title: 'Card' }] },
    { type: 'steps', h2: 'Steps', steps: [{ title: 'Step', body: 7 }] },
    { type: 'table', h2: 'Table', head: ['A', 'B'], rows: [['one', 'two'], 'bad-row'] },
    { type: 'quotes', h2: 'Quotes', quotes: [{ text: 'Quote' }] },
    { type: 'twocol', left: { h2: 'Left', items: ['ok'] }, right: { h2: 'Right', items: 'bad' } },
  ];
  for (const section of cases) {
    const post = base();
    post.sections[0] = section;
    const result = validatePost(post, ctx);
    assert.equal(isStructurallyRenderable(post), false, section.type);
    assert.match(result.errors.join('\n'), /section 1 shape/, section.type);
  }
});

test('structural validation enforces faq pairs and target slug identity', () => {
  const malformedFaq = base();
  malformedFaq.faq[0] = ['question only'];
  assert.equal(isStructurallyRenderable(malformedFaq), false);
  assert.match(validatePost(malformedFaq, ctx).errors.join('\n'), /faq.*shape/i);

  const fileMismatch = base();
  assert.match(
    validatePost(fileMismatch, ctx, { selfSlug: fileMismatch.slug, fileSlug: 'different-file' }).errors.join('\n'),
    /slug must match file name/,
  );

  const reviseMismatch = base();
  reviseMismatch.slug = 'writer-changed-the-slug';
  assert.match(
    validatePost(reviseMismatch, ctx, {
      selfSlug: 'test-fixture-valid-blog-post',
      fileSlug: 'test-fixture-valid-blog-post',
      mode: 'revise',
      requestedSlug: 'test-fixture-valid-blog-post',
    }).errors.join('\n'),
    /revise must keep slug/,
  );
});
