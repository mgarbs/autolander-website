import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  validatePost, buildValidationContext, isStructurallyRenderable,
} from '../scripts/blog/validate-post.mjs';
import {
  imageUsage, normalizeStudioPath, studioFilesAt,
} from '../scripts/seo/articles/image-usage.mjs';

// General-rule tests pin an EMPTY studio pool: the real library grows and shrinks as posts use
// pairs, so "a figure is required" must not depend on repo state here. The image rules below build
// their own contexts with explicit pairs.
const ctx = { ...buildValidationContext(), studioPairs: [] };
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

const testPair = (key) => ({
  key,
  before: `/studio/library/${key}-before.webp`,
  after: `/studio/library/${key}-after.webp`,
  before550: `/studio/library/${key}-before-550.webp`,
  after550: `/studio/library/${key}-after-550.webp`,
  source: 'library',
});

const contextWithPairs = (pairs, imageUsages = new Map()) => ({
  ...ctx,
  studioFiles: new Set([
    ...ctx.studioFiles,
    ...pairs.flatMap((pair) => [pair.before, pair.after, pair.before550, pair.after550]),
  ]),
  studioPairs: pairs,
  imageUsages,
});

const addFigure = (post, before, after) => post.sections.push({
  type: 'figure',
  before,
  after,
  beforeAlt: 'Vehicle before studio processing',
  afterAlt: 'Vehicle after studio processing',
  caption: 'The background and lighting were cleaned up.',
});

test('image usage covers figures and images and normalizes -550 variants', () => {
  const usage = imageUsage({
    articles: [{
      slug: 'drip-guide',
      sections: [
        { type: 'figure', before: '/studio/a-before-550.webp', after: '/studio/a-after.webp' },
        { type: 'image', src: '/studio/single-550.webp' },
      ],
    }],
    extraUsages: [{ slug: 'home', paths: ['/studio/home-550.webp'] }],
  });
  assert.deepEqual(usage.get('/studio/a-before.webp'), ['drip-guide']);
  assert.deepEqual(usage.get('/studio/a-after.webp'), ['drip-guide']);
  assert.deepEqual(usage.get('/studio/single.webp'), ['drip-guide']);
  assert.deepEqual(usage.get('/studio/home.webp'), ['home']);
  assert.equal(normalizeStudioPath('/studio/a-before-550.webp'), '/studio/a-before.webp');
});

test('reuse of a drip image fails with the owner and path', () => {
  const pair = testPair('drip-pair');
  const post = base();
  addFigure(post, pair.before, pair.after);
  const usage = imageUsage({ articles: [{ slug: 'existing-drip', sections: [{ type: 'figure', ...pair }] }] });
  const result = validatePost(post, contextWithPairs([pair], usage));
  assert.ok(result.errors.includes(`image already used by existing-drip: ${pair.before}`));
  assert.ok(result.errors.includes(`image already used by existing-drip: ${pair.after}`));
});

test('reuse of another blog post image fails whether that post is draft or published', () => {
  for (const status of ['draft', 'published']) {
    const pair = testPair(`${status}-pair`);
    const post = base();
    addFigure(post, pair.before, pair.after);
    const usage = imageUsage({
      articles: [{ slug: `${status}-blog-post`, meta: { status }, sections: [{ type: 'figure', ...pair }] }],
    });
    assert.match(
      validatePost(post, contextWithPairs([pair], usage)).errors.join('\n'),
      new RegExp(`image already used by ${status}-blog-post`),
    );
  }
});

test('using the other half of a pair in an image section still counts as reuse', () => {
  const pair = testPair('split-image-pair');
  const post = base();
  post.sections.push({
    type: 'image', src: pair.after, alt: 'Vehicle after editing', caption: 'A cleaned-up background.',
  });
  const usage = imageUsage({
    articles: [{ slug: 'page-using-before-half', sections: [{ type: 'image', src: pair.before }] }],
  });
  const result = validatePost(post, contextWithPairs([pair], usage));
  assert.ok(result.errors.includes(`image already used by page-using-before-half: ${pair.after}`));
});

test('a revision may keep the same post image', () => {
  const pair = testPair('own-pair');
  const post = base();
  addFigure(post, pair.before, pair.after);
  const usage = imageUsage({ articles: [{ slug: post.slug, sections: [{ type: 'figure', ...pair }] }] });
  const result = validatePost(post, contextWithPairs([pair], usage), { selfSlug: post.slug });
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});

test('a figure cannot mix halves from different pairs', () => {
  const first = testPair('first-pair');
  const second = testPair('second-pair');
  const post = base();
  addFigure(post, first.before, second.after);
  assert.match(
    validatePost(post, contextWithPairs([first, second])).errors.join('\n'),
    /same studio pair/,
  );
});

test('a figure is required only while an unused pair exists', () => {
  const pair = testPair('available-pair');
  assert.ok(
    validatePost(base(), contextWithPairs([pair])).errors
      .includes('post needs at least one unused before/after figure'),
  );
  const used = new Map([[pair.before, ['other-page']]]);
  assert.equal(
    validatePost(base(), contextWithPairs([pair], used)).errors
      .includes('post needs at least one unused before/after figure'),
    false,
  );
});

test('validation context finds studio files and pairs in the library subdirectory', () => {
  const root = mkdtempSync(join(tmpdir(), 'studio-ledger-'));
  try {
    const pair = testPair('nested-pair');
    const dir = join(root, 'public', 'studio', 'library');
    mkdirSync(dir, { recursive: true });
    for (const path of [pair.before, pair.after, pair.before550, pair.after550]) {
      writeFileSync(join(root, 'public', ...path.split('/').filter(Boolean)), 'image');
    }
    writeFileSync(
      join(root, 'public', 'studio', 'library.json'),
      `${JSON.stringify([{ ...pair, source: undefined }])}\n`,
    );
    const files = studioFilesAt(root);
    const built = buildValidationContext({ root, selfSlug: 'new-post' });
    assert.ok(files.has(pair.before550));
    assert.ok(built.studioFiles.has(pair.after));
    assert.equal(built.studioPairs[0].key, pair.key);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
