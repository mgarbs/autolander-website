import test from 'node:test';
import assert from 'node:assert/strict';

const HELPERS_URL = new URL('../src/admin/lib/blog-studio.js', import.meta.url);
let helperPromise;
const helpers = () => {
  helperPromise ||= import(HELPERS_URL.href);
  return helperPromise;
};

const request = (extra = {}) => ({
  requestId: '11111111-1111-4111-8111-111111111111',
  mode: 'new',
  prompt: 'Write a practical Facebook Marketplace guide for independent car dealers.',
  createdAt: '2026-09-27T12:03:05.000Z',
  ...extra,
});

test('filterDripArticles keeps the legacy publisher limited to non-blog rows', async () => {
  const { filterDripArticles } = await helpers();
  const drip = { slug: 'guide-one', kind: 'drip' };
  const legacy = { slug: 'legacy-guide' };
  const blog = { slug: 'blog-one', kind: 'blog' };

  assert.deepEqual(filterDripArticles([drip, blog, legacy]), [drip, legacy]);
  assert.deepEqual(filterDripArticles(null), []);
});

test('composer validation mirrors the Worker limits', async () => {
  const { canWriteDraft, canSendRevision } = await helpers();

  assert.equal(canWriteDraft(' x '.repeat(6), ''), false, 'trimmed prompts below 20 chars stay disabled');
  assert.equal(canWriteDraft('x'.repeat(20), ''), true);
  assert.equal(canWriteDraft('x'.repeat(6001), ''), false);
  assert.equal(canWriteDraft('x'.repeat(20), 'k'.repeat(80)), true);
  assert.equal(canWriteDraft('x'.repeat(20), 'k'.repeat(81)), false);

  assert.equal(canSendRevision('four'), false);
  assert.equal(canSendRevision(' five! '), true);
  assert.equal(canSendRevision('x'.repeat(4001)), false);
});

test('requestPresentation gives terminal markers precedence over workflow lag', async () => {
  const { requestPresentation } = await helpers();
  const now = Date.parse('2026-09-27T12:05:07.000Z');

  const writing = requestPresentation(request({
    run: { status: 'in_progress', conclusion: null },
  }), now);
  assert.equal(writing.state, 'writing');
  assert.equal(writing.label, 'writing… 02:02');

  const drafted = requestPresentation(request({
    status: 'drafted',
    run: { status: 'in_progress', conclusion: null },
  }), now);
  assert.equal(drafted.state, 'drafted');
  assert.equal(drafted.label, 'drafted');

  const attention = requestPresentation(request({ status: 'needs_attention' }), now);
  assert.equal(attention.state, 'needs_attention');
  assert.equal(attention.label, 'needs attention');

  const failedRun = requestPresentation(request({
    run: { status: 'completed', conclusion: 'failure' },
  }), now);
  assert.equal(failedRun.state, 'failed');
  assert.equal(failedRun.label, 'failed');

  const waitingForMarker = requestPresentation(request({
    run: { status: 'completed', conclusion: 'success' },
  }), now);
  assert.equal(waitingForMarker.state, 'writing');
});

test('failure copy distinguishes subscription usage and authentication failures', async () => {
  const { blogFailureMessage } = await helpers();

  assert.equal(
    blogFailureMessage('usage_limit', 'ignored'),
    'Claude subscription limit reached. Try again after your usage window resets.',
  );
  assert.equal(
    blogFailureMessage('auth', 'ignored'),
    'Subscription token expired or revoked. Reconnect it (claude setup-token → repo secret CLAUDE_CODE_OAUTH_TOKEN).',
  );
  assert.equal(blogFailureMessage('validation', 'The validator still found two issues.'), 'The validator still found two issues.');
  assert.match(blogFailureMessage('other', ''), /workflow run/i);
});

test('request excerpts are admin-safe, bounded, and useful for revisions', async () => {
  const { promptExcerpt } = await helpers();

  assert.equal(promptExcerpt(request({ prompt: '  Short prompt.  ' })), 'Short prompt.');
  const long = promptExcerpt(request({ prompt: 'x'.repeat(100) }));
  assert.equal(long.length, 80);
  assert.ok(long.endsWith('…'));
  assert.equal(
    promptExcerpt(request({ mode: 'revise', prompt: undefined, feedback: '  Add a checklist.  ' })),
    'Add a checklist.',
  );
});

test('requests sort newest first without mutating the API payload', async () => {
  const { sortBlogRequests } = await helpers();
  const older = request({ requestId: '11111111-1111-4111-8111-111111111111', createdAt: '2026-09-27T10:00:00Z' });
  const newer = request({ requestId: '22222222-2222-4222-8222-222222222222', createdAt: '2026-09-27T11:00:00Z' });
  const input = [older, newer];

  assert.deepEqual(sortBlogRequests(input).map((row) => row.requestId), [newer.requestId, older.requestId]);
  assert.deepEqual(input, [older, newer]);
});

test('polling covers queued work, commit settling, and local optimistic dispatches', async () => {
  const { isBlogActivityInFlight } = await helpers();
  const id = '11111111-1111-4111-8111-111111111111';
  const now = Date.parse('2026-09-27T12:05:07.000Z');

  assert.equal(isBlogActivityInFlight({ blogRuns: [], blogRequests: [] }, true, now), true);
  assert.equal(isBlogActivityInFlight({
    blogRuns: [{ requestId: id, status: 'queued', conclusion: null }],
    blogRequests: [],
  }, false, now), true);
  assert.equal(isBlogActivityInFlight({
    blogRuns: [{ requestId: id, status: 'completed', conclusion: 'success' }],
    blogRequests: [request({ requestId: id })],
  }, false, now), true, 'a successful run keeps polling until its committed marker appears');
  assert.equal(isBlogActivityInFlight({
    blogRuns: [{ requestId: id, status: 'completed', conclusion: 'success' }],
    blogRequests: [request({ requestId: id, status: 'drafted' })],
  }, false, now), false);
  assert.equal(isBlogActivityInFlight({
    blogRuns: [{ requestId: id, status: 'completed', conclusion: 'failure' }],
    blogRequests: [request({ requestId: id })],
  }, false, now), false);
});

test('stale requests and completed runs stop presenting or polling as writing', async () => {
  const { isBlogActivityInFlight, requestPresentation } = await helpers();
  const now = Date.parse('2026-09-27T14:00:00.000Z');
  const completed = request({
    createdAt: '2026-09-27T12:00:00.000Z',
    run: {
      status: 'completed',
      conclusion: 'success',
      createdAt: '2026-09-27T12:30:00.000Z',
    },
  });
  const orphaned = request({ createdAt: '2026-09-27T12:00:00.000Z', run: null });

  assert.equal(requestPresentation(completed, now).state, 'failed');
  assert.equal(requestPresentation(orphaned, now).state, 'failed');
  assert.equal(isBlogActivityInFlight({ blogRequests: [completed], blogRuns: [] }, false, now), false);
  assert.equal(isBlogActivityInFlight({ blogRequests: [orphaned], blogRuns: [] }, false, now), false);

  const serverAhead = request({ createdAt: '2026-09-27T14:05:00.000Z', run: null });
  assert.equal(requestPresentation(serverAhead, now).state, 'writing');
  assert.equal(isBlogActivityInFlight({ blogRequests: [serverAhead], blogRuns: [] }, false, now), true);
});

test('a long successful writer run keeps settling within the workflow envelope', async () => {
  const { isBlogActivityInFlight, requestPresentation } = await helpers();
  const now = Date.parse('2026-09-27T14:00:00.000Z');
  const longRun = request({
    createdAt: '2026-09-27T13:00:00.000Z',
    run: {
      status: 'completed',
      conclusion: 'success',
      createdAt: '2026-09-27T13:00:00.000Z',
    },
  });

  assert.equal(requestPresentation(longRun, now).state, 'writing');
  assert.equal(isBlogActivityInFlight({ blogRequests: [longRun], blogRuns: [] }, false, now), true);

  const longQueuedRun = request({
    createdAt: '2026-09-27T08:00:00.000Z',
    run: {
      status: 'completed',
      conclusion: 'success',
      createdAt: '2026-09-27T08:00:00.000Z',
      updatedAt: '2026-09-27T13:59:00.000Z',
    },
  });
  assert.equal(requestPresentation(longQueuedRun, now).state, 'writing');
  assert.equal(isBlogActivityInFlight({ blogRequests: [longQueuedRun], blogRuns: [] }, false, now), true);
});

test('terminal request markers poll until the content snapshot reflects the same mutation', async () => {
  const { isBlogActivityInFlight } = await helpers();
  const now = Date.parse('2026-09-27T12:06:00.000Z');
  const drafted = request({
    status: 'drafted',
    slug: 'new-blog-post',
    finishedAt: '2026-09-27T12:05:00.000Z',
  });
  const discarded = request({
    mode: 'discard',
    status: 'discarded',
    slug: 'old-blog-post',
    finishedAt: '2026-09-27T12:05:00.000Z',
  });

  assert.equal(isBlogActivityInFlight({ articles: [], blogRequests: [drafted] }, false, now), true);
  assert.equal(isBlogActivityInFlight({
    articles: [{ kind: 'blog', slug: 'new-blog-post', requestId: drafted.requestId }],
    blogRequests: [drafted],
  }, false, now), false);
  assert.equal(isBlogActivityInFlight({
    articles: [{ kind: 'blog', slug: 'new-blog-post', requestId: '22222222-2222-4222-8222-222222222222' }],
    blogRequests: [drafted],
  }, false, now), true);
  assert.equal(isBlogActivityInFlight({
    articles: [{ kind: 'blog', slug: 'old-blog-post' }],
    blogRequests: [discarded],
  }, false, now), true);
  assert.equal(isBlogActivityInFlight({ articles: [], blogRequests: [discarded] }, false, now), false);
});

test('only the newest request for a slug can hold content coherence pending', async () => {
  const { isBlogActivityInFlight, isBlogSlugInFlight } = await helpers();
  const now = Date.parse('2026-09-27T12:08:00.000Z');
  const slug = 'new-blog-post';
  const older = request({
    slug,
    status: 'drafted',
    createdAt: '2026-09-27T12:01:00.000Z',
    finishedAt: '2026-09-27T12:03:00.000Z',
  });
  const newer = request({
    requestId: '22222222-2222-4222-8222-222222222222',
    mode: 'revise',
    slug,
    status: 'drafted',
    createdAt: '2026-09-27T12:04:00.000Z',
    finishedAt: '2026-09-27T12:07:00.000Z',
  });
  const current = {
    articles: [{ kind: 'blog', slug, requestId: newer.requestId }],
    blogRequests: [newer, older],
  };
  assert.equal(isBlogActivityInFlight(current, false, now), false);
  assert.equal(isBlogSlugInFlight(current, slug, [], now), false);

  const stale = {
    ...current,
    articles: [{ kind: 'blog', slug, requestId: older.requestId }],
  };
  assert.equal(isBlogActivityInFlight(stale, false, now), true);
  assert.equal(isBlogSlugInFlight(stale, slug, [], now), true);

  const discarded = {
    ...newer,
    requestId: '33333333-3333-4333-8333-333333333333',
    mode: 'discard',
    status: 'discarded',
    createdAt: '2026-09-27T12:06:00.000Z',
    finishedAt: '2026-09-27T12:07:30.000Z',
  };
  const removed = { articles: [], blogRequests: [discarded, newer, older] };
  assert.equal(isBlogActivityInFlight(removed, false, now), false);
  assert.equal(isBlogSlugInFlight(removed, slug, [], now), false);
});

test('per-post activity and publish presentation gate conflicting draft actions', async () => {
  const { hasNewPublishRun, isBlogSlugInFlight, publishPresentation } = await helpers();
  const now = Date.parse('2026-09-27T12:06:00.000Z');
  const slug = 'new-blog-post';
  const article = { kind: 'blog', slug, status: 'draft' };
  const queued = {
    articles: [article],
    runs: [{ id: 11, title: `publish: ${slug}`, status: 'queued', conclusion: null, createdAt: '2026-09-27T12:05:00.000Z', url: 'https://example.test/run' }],
    blogRequests: [],
  };
  assert.equal(publishPresentation(queued, article, now).state, 'publishing');
  assert.equal(isBlogSlugInFlight(queued, slug, [], now), true);

  const failed = {
    ...queued,
    runs: [{ ...queued.runs[0], status: 'completed', conclusion: 'failure' }],
  };
  assert.equal(publishPresentation(failed, article, now).state, 'failed');
  assert.equal(publishPresentation(failed, { ...article, status: 'published' }, now).state, 'failed');
  assert.equal(isBlogSlugInFlight(failed, slug, [], now), false);
  assert.equal(isBlogSlugInFlight({ articles: [article] }, slug, new Set([slug]), now), true);
  assert.equal(hasNewPublishRun(failed, slug, [failed.runs[0].id]), false);
  assert.equal(
    hasNewPublishRun(failed, slug, [], Date.parse('2026-09-27T12:06:00.000Z')),
    false,
    'an older completed run omitted from the dispatch snapshot is not the new run',
  );
  assert.equal(hasNewPublishRun({
    runs: [...failed.runs, { ...failed.runs[0], id: 22, status: 'queued' }],
  }, slug, [failed.runs[0].id], Date.parse('2026-09-27T12:06:00.000Z')), true);

  const revising = request({ mode: 'revise', slug, run: { status: 'in_progress', conclusion: null } });
  assert.equal(isBlogSlugInFlight({ articles: [article], blogRequests: [revising] }, slug, [], now), true);
});
