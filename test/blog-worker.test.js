// AI Blog Studio Worker endpoints: validation, encrypted workflow dispatch,
// private request history, previews, content-list merging, and admin routing.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { decryptPayload, newKeyB64 } from '../shared/blog-crypto.js';
import { handleContentList } from '../worker/src/admin/content.js';

const REPO = 'example/autolander-site';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORIGINAL_REQUEST_ID = '11111111-1111-4111-8111-111111111111';
const CURRENT_REQUEST_ID = '22222222-2222-4222-8222-222222222222';

const blogApi = () => import('../worker/src/admin/blog.js');

function jsonRequest(body, path = '/admin/blog/generate') {
  return new Request(`https://autolander.ai${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function withFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

class MemoryKv {
  constructor(entries = {}) {
    this.values = new Map(Object.entries(entries).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    ]));
    this.puts = [];
    this.deletes = [];
    this.lists = [];
  }

  async get(key, options) {
    const value = this.values.get(key);
    if (value === undefined) return null;
    if (options === 'json' || options?.type === 'json') return JSON.parse(value);
    return value;
  }

  async put(key, value, options) {
    this.values.set(key, value);
    this.puts.push({ key, value, options });
  }

  async delete(key) {
    this.values.delete(key);
    this.deletes.push(key);
  }

  async list(options = {}) {
    this.lists.push(options);
    const prefix = options.prefix || '';
    return {
      keys: [...this.values.keys()].filter((key) => key.startsWith(prefix)).map((name) => ({ name })),
      list_complete: true,
      cursor: '',
    };
  }
}

function workerEnv(kv = new MemoryKv()) {
  return {
    GITHUB_TOKEN: 'github-secret',
    BLOG_INPUT_KEY: newKeyB64(),
    CONTENT_REPO: REPO,
    TRACKING: kv,
  };
}

test('blog generate is disabled without either required secret and validates private input', async () => {
  const { handleBlogGenerate } = await blogApi();
  const key = newKeyB64();

  const noToken = await handleBlogGenerate(
    jsonRequest({ prompt: 'A sufficiently long prompt for a useful blog post.' }),
    { BLOG_INPUT_KEY: key, TRACKING: new MemoryKv() },
  );
  assert.equal(noToken.status, 503);
  assert.equal(noToken.body.reason, 'blog_disabled');

  const noKey = await handleBlogGenerate(
    jsonRequest({ prompt: 'A sufficiently long prompt for a useful blog post.' }),
    { GITHUB_TOKEN: 'token', TRACKING: new MemoryKv() },
  );
  assert.equal(noKey.status, 503);
  assert.equal(noKey.body.reason, 'blog_disabled');

  const env = workerEnv();
  const short = await handleBlogGenerate(jsonRequest({ prompt: 'nineteen chars' }), env);
  assert.equal(short.status, 400);
  assert.equal(short.body.ok, false);

  const longKeyword = await handleBlogGenerate(jsonRequest({
    prompt: 'This prompt is comfortably over the twenty character minimum.',
    keyword: 'k'.repeat(81),
  }), env);
  assert.equal(longKeyword.status, 400);
});

test('blog generate encrypts dispatch input, stores the private request with TTL, and returns 202', async () => {
  const { handleBlogGenerate } = await blogApi();
  const kv = new MemoryKv();
  const env = workerEnv(kv);
  const prompt = 'Explain a practical Facebook Marketplace inventory workflow for dealers.';
  const keyword = 'facebook marketplace inventory workflow';
  const calls = [];

  await withFetch(async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return new Response(null, { status: 204 });
  }, async () => {
    const result = await handleBlogGenerate(jsonRequest({ prompt: `  ${prompt}  `, keyword }), env);
    assert.equal(result.status, 202);
    assert.equal(result.body.ok, true);
    assert.match(result.body.requestId, UUID_RE);
    assert.equal(
      result.body.message,
      'Writing with Opus 5.5 at max effort. Usually 5 to 15 minutes.',
    );
    assert.doesNotMatch(JSON.stringify(result.body), new RegExp(prompt, 'i'));
  });

  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    `https://api.github.com/repos/${REPO}/actions/workflows/generate-blog-post.yml/dispatches`,
  );
  assert.equal(calls[0].init.method, 'POST');
  const rawDispatch = String(calls[0].init.body);
  assert.ok(!rawDispatch.includes(prompt), 'workflow dispatch must not expose prompt plaintext');
  assert.ok(!rawDispatch.includes(keyword), 'workflow dispatch must not expose keyword plaintext');
  const dispatch = JSON.parse(rawDispatch);
  assert.equal(dispatch.ref, 'main');
  assert.match(dispatch.inputs.request_id, UUID_RE);
  assert.equal(dispatch.inputs.mode, 'new');
  assert.equal(dispatch.inputs.slug, '');
  assert.deepEqual(
    await decryptPayload(dispatch.inputs.payload, env.BLOG_INPUT_KEY, dispatch.inputs.request_id),
    { prompt, keyword },
  );

  assert.equal(kv.puts.length, 1);
  assert.equal(kv.puts[0].key, `blogreq:${dispatch.inputs.request_id}`);
  assert.deepEqual(kv.puts[0].options, { expirationTtl: 7_776_000 });
  const stored = JSON.parse(kv.puts[0].value);
  assert.equal(stored.requestId, dispatch.inputs.request_id);
  assert.equal(stored.mode, 'new');
  assert.equal(stored.prompt, prompt);
  assert.equal(stored.keyword, keyword);
  assert.ok(Number.isFinite(Date.parse(stored.createdAt)));
});

test('a failed generation dispatch removes its private KV record without echoing upstream text', async () => {
  const { handleBlogGenerate } = await blogApi();
  const kv = new MemoryKv();
  const env = workerEnv(kv);
  const prompt = 'Keep this failed workflow prompt private from every response.';

  await withFetch(async () => new Response(`upstream echoed: ${prompt}`, { status: 500 }), async () => {
    const result = await handleBlogGenerate(jsonRequest({ prompt }), env);
    assert.equal(result.status, 502);
    assert.equal(result.body.reason, 'dispatch_failed');
    assert.ok(!JSON.stringify(result.body).includes(prompt));
  });

  assert.equal(kv.puts.length, 1);
  assert.deepEqual(kv.deletes, [kv.puts[0].key]);
  assert.equal(kv.values.has(kv.puts[0].key), false);
});

test('blog revise validates the slug and feedback, then includes the original prompt only inside ciphertext', async () => {
  const { handleBlogRevise } = await blogApi();
  const originalPrompt = 'Write the original private dealer operations article.';
  const feedback = 'Add a checklist and make the opening more direct.';
  const kv = new MemoryKv({
    [`blogreq:${ORIGINAL_REQUEST_ID}`]: {
      requestId: ORIGINAL_REQUEST_ID,
      mode: 'new',
      prompt: originalPrompt,
      keyword: 'dealer operations',
      createdAt: '2026-09-26T12:00:00.000Z',
    },
  });
  const env = workerEnv(kv);

  const badSlug = await handleBlogRevise(jsonRequest(
    { slug: '../private', feedback },
    '/admin/blog/revise',
  ), env);
  assert.equal(badSlug.status, 400);

  const shortFeedback = await handleBlogRevise(jsonRequest(
    { slug: 'dealer-operations-guide', feedback: 'four' },
    '/admin/blog/revise',
  ), env);
  assert.equal(shortFeedback.status, 400);

  let dispatch;
  const urls = [];
  await withFetch(async (url, init = {}) => {
    const value = String(url);
    urls.push(value);
    if (value.includes('/contents/scripts/seo/articles/blog/dealer-operations-guide.json')) {
      assert.equal(new URL(value).searchParams.get('ref'), 'main');
      return new Response(JSON.stringify({
        slug: 'dealer-operations-guide',
        meta: { requestId: ORIGINAL_REQUEST_ID },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (value.includes('/contents/scripts/seo/articles/publish-state.json')) {
      return new Response(JSON.stringify({
        'dealer-operations-guide': { status: 'draft', publishedAt: null },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    assert.ok(value.endsWith('/actions/workflows/generate-blog-post.yml/dispatches'));
    dispatch = JSON.parse(init.body);
    return new Response(null, { status: 204 });
  }, async () => {
    const result = await handleBlogRevise(jsonRequest(
      { slug: 'dealer-operations-guide', feedback: ` ${feedback} ` },
      '/admin/blog/revise',
    ), env);
    assert.equal(result.status, 202);
    assert.equal(result.body.ok, true);
  });

  assert.equal(urls.length, 3);
  assert.equal(dispatch.inputs.mode, 'revise');
  assert.equal(dispatch.inputs.slug, 'dealer-operations-guide');
  assert.match(dispatch.inputs.request_id, UUID_RE);
  const rawDispatch = JSON.stringify(dispatch);
  assert.ok(!rawDispatch.includes(feedback), 'revision feedback must remain encrypted');
  assert.ok(!rawDispatch.includes(originalPrompt), 'original prompt must remain encrypted');
  const cleartext = await decryptPayload(
    dispatch.inputs.payload,
    env.BLOG_INPUT_KEY,
    dispatch.inputs.request_id,
  );
  assert.equal(cleartext.feedback, feedback);
  assert.equal(cleartext.originalPrompt, originalPrompt);

  const revisionPut = kv.puts.find(({ key }) => key === `blogreq:${dispatch.inputs.request_id}`);
  assert.ok(revisionPut);
  assert.equal(revisionPut.options.expirationTtl, 7_776_000);
  const stored = JSON.parse(revisionPut.value);
  assert.equal(stored.mode, 'revise');
  assert.equal(stored.slug, 'dealer-operations-guide');
  assert.equal(stored.feedback, feedback);
  assert.equal(stored.previousRequestId, ORIGINAL_REQUEST_ID);

  const followupFeedback = 'Shorten the checklist introduction in the next revision.';
  let followupDispatch;
  await withFetch(async (url, init = {}) => {
    const value = String(url);
    if (value.includes('/contents/scripts/seo/articles/blog/dealer-operations-guide.json')) {
      return new Response(JSON.stringify({
        slug: 'dealer-operations-guide',
        meta: { requestId: dispatch.inputs.request_id },
      }), { status: 200 });
    }
    if (value.includes('/contents/scripts/seo/articles/publish-state.json')) {
      return new Response(JSON.stringify({
        'dealer-operations-guide': { status: 'draft', publishedAt: null },
      }), { status: 200 });
    }
    followupDispatch = JSON.parse(init.body);
    return new Response(null, { status: 204 });
  }, async () => {
    const followup = await handleBlogRevise(jsonRequest(
      { slug: 'dealer-operations-guide', feedback: followupFeedback },
      '/admin/blog/revise',
    ), env);
    assert.equal(followup.status, 202);
  });
  assert.deepEqual(
    await decryptPayload(
      followupDispatch.inputs.payload,
      env.BLOG_INPUT_KEY,
      followupDispatch.inputs.request_id,
    ),
    { feedback: followupFeedback, originalPrompt },
  );
  const followupStored = JSON.parse(kv.values.get(`blogreq:${followupDispatch.inputs.request_id}`));
  assert.equal(followupStored.previousRequestId, dispatch.inputs.request_id);
  assert.equal(followupStored.originalRequestId, ORIGINAL_REQUEST_ID);

  const putsBeforeRefusal = kv.puts.length;
  let publishedDispatches = 0;
  await withFetch(async (url) => {
    const value = String(url);
    if (value.includes('/contents/scripts/seo/articles/blog/dealer-operations-guide.json')) {
      return new Response(JSON.stringify({
        slug: 'dealer-operations-guide',
        meta: { requestId: ORIGINAL_REQUEST_ID },
      }), { status: 200 });
    }
    if (value.includes('/contents/scripts/seo/articles/publish-state.json')) {
      return new Response(JSON.stringify({
        'dealer-operations-guide': { status: 'published', publishedAt: '2026-09-27' },
      }), { status: 200 });
    }
    publishedDispatches += 1;
    return new Response(null, { status: 204 });
  }, async () => {
    const refused = await handleBlogRevise(jsonRequest(
      { slug: 'dealer-operations-guide', feedback },
      '/admin/blog/revise',
    ), env);
    assert.equal(refused.status, 409);
    assert.equal(refused.body.reason, 'published_post');
  });
  assert.equal(publishedDispatches, 0);
  assert.equal(kv.puts.length, putsBeforeRefusal);
});

test('blog discard validates its slug and dispatches an empty encrypted-payload field', async () => {
  const { handleBlogDiscard } = await blogApi();
  const kv = new MemoryKv();
  const env = workerEnv(kv);

  const invalid = await handleBlogDiscard(jsonRequest(
    { slug: 'Bad Slug' },
    '/admin/blog/discard',
  ), env);
  assert.equal(invalid.status, 400);

  let dispatch;
  await withFetch(async (_url, init = {}) => {
    dispatch = JSON.parse(init.body);
    return new Response(null, { status: 204 });
  }, async () => {
    const result = await handleBlogDiscard(jsonRequest(
      { slug: 'dealer-operations-guide' },
      '/admin/blog/discard',
    ), env);
    assert.equal(result.status, 202);
  });

  assert.equal(dispatch.ref, 'main');
  assert.match(dispatch.inputs.request_id, UUID_RE);
  assert.deepEqual(dispatch.inputs, {
    request_id: dispatch.inputs.request_id,
    mode: 'discard',
    slug: 'dealer-operations-guide',
    payload: '',
  });
  const stored = JSON.parse(kv.values.get(`blogreq:${dispatch.inputs.request_id}`));
  assert.equal(stored.mode, 'discard');
  assert.equal(stored.slug, 'dealer-operations-guide');
  assert.ok(Number.isFinite(Date.parse(stored.createdAt)));
  assert.equal(kv.puts.at(-1).options.expirationTtl, 7_776_000);
});

test('blog preview reads raw HTML from main and handles invalid or missing previews', async () => {
  const { handleBlogPreview } = await blogApi();
  const env = workerEnv();
  const html = '<!doctype html><title>Private preview</title>';
  const seen = [];

  await withFetch(async (url, init = {}) => {
    seen.push({ url: String(url), init });
    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
  }, async () => {
    const result = await handleBlogPreview(
      new URL('https://autolander.ai/admin/blog/preview?slug=dealer-operations-guide'),
      env,
    );
    assert.deepEqual(result, { status: 200, body: { ok: true, html } });
  });

  assert.equal(seen.length, 1);
  assert.match(seen[0].url, /\/contents\/previews\/blog\/dealer-operations-guide\.html\?ref=main$/);
  assert.equal(new Headers(seen[0].init.headers).get('Accept'), 'application/vnd.github.raw');

  const invalid = await handleBlogPreview(
    new URL('https://autolander.ai/admin/blog/preview?slug=../secret'),
    env,
  );
  assert.equal(invalid.status, 400);

  await withFetch(async () => new Response('missing', { status: 404 }), async () => {
    const missing = await handleBlogPreview(
      new URL('https://autolander.ai/admin/blog/preview?slug=missing-preview'),
      env,
    );
    assert.equal(missing.status, 404);
    assert.equal(missing.body.ok, false);
  });
});

test('content list merges generation runs with the newest 20 private KV requests and completed statuses', async () => {
  const records = {
    'blogreq:not-a-uuid': {
      requestId: 'not-a-uuid',
      mode: 'new',
      prompt: 'Malformed records must not displace valid request history.',
      createdAt: '2099-01-01T00:00:00.000Z',
    },
    [`blogreq:${CURRENT_REQUEST_ID}`]: {
      requestId: CURRENT_REQUEST_ID,
      mode: 'revise',
      slug: 'dealer-operations-guide',
      feedback: 'Tighten the checklist.',
      createdAt: '2026-09-27T12:00:00.000Z',
    },
    [`blogreq:${ORIGINAL_REQUEST_ID}`]: {
      requestId: ORIGINAL_REQUEST_ID,
      mode: 'new',
      prompt: 'Private original prompt.',
      keyword: 'dealer operations',
      createdAt: '2026-09-26T12:00:00.000Z',
    },
  };
  for (let day = 1; day <= 19; day += 1) {
    const id = `${String(day).padStart(8, '0')}-0000-4000-8000-${String(day).padStart(12, '0')}`;
    records[`blogreq:${id}`] = {
      requestId: id,
      mode: 'new',
      prompt: `Older private prompt ${day}`,
      createdAt: `2026-09-${String(day).padStart(2, '0')}T12:00:00.000Z`,
    };
  }
  const kv = new MemoryKv(records);
  const env = workerEnv(kv);
  const fetchedStatusIds = [];

  await withFetch(async (url) => {
    const value = String(url);
    if (value.includes('/contents/public/data/content-status.json')) {
      return new Response(JSON.stringify({
        generatedAt: '2026-09-27',
        articles: [{ slug: 'dealer-operations-guide', kind: 'blog', status: 'draft' }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (value.includes('/actions/workflows/publish-article.yml/runs')) {
      return new Response(JSON.stringify({ workflow_runs: [] }), { status: 200 });
    }
    if (value.includes('/actions/workflows/generate-blog-post.yml/runs')) {
      return new Response(JSON.stringify({ workflow_runs: [
        {
          id: 202,
          display_title: `blog: revise ${CURRENT_REQUEST_ID}`,
          status: 'in_progress',
          conclusion: null,
          created_at: '2026-09-27T12:01:00.000Z',
          updated_at: '2026-09-27T12:02:00.000Z',
          html_url: 'https://github.example/runs/202',
        },
        {
          id: 101,
          display_title: `blog: new ${ORIGINAL_REQUEST_ID}`,
          status: 'completed',
          conclusion: 'success',
          created_at: '2026-09-26T12:01:00.000Z',
          html_url: 'https://github.example/runs/101',
        },
        {
          id: 100,
          display_title: `blog: new ${ORIGINAL_REQUEST_ID}`,
          status: 'in_progress',
          conclusion: null,
          created_at: '2026-09-26T11:59:00.000Z',
          html_url: 'https://github.example/runs/100',
        },
        {
          id: 303,
          display_title: 'unrelated workflow title',
          status: 'completed',
          conclusion: 'success',
          created_at: '2026-09-25T12:01:00.000Z',
          html_url: 'https://github.example/runs/303',
        },
      ] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const statusMatch = value.match(/\/contents\/scripts\/seo\/articles\/blog\/_requests\/([^/?]+)\.json/);
    if (statusMatch) {
      fetchedStatusIds.push(statusMatch[1]);
      if (statusMatch[1] === ORIGINAL_REQUEST_ID) {
        return new Response(JSON.stringify({
          requestId: ORIGINAL_REQUEST_ID,
          mode: 'new',
          slug: 'dealer-operations-guide',
          status: 'drafted',
          errorKind: null,
          error: '',
          finishedAt: '2026-09-26T12:10:00.000Z',
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('missing', { status: 404 });
    }
    throw new Error(`Unexpected fetch: ${value}`);
  }, async () => {
    const result = await handleContentList(env);
    assert.equal(result.status, 200);
    assert.equal(result.body.blogRuns.length, 2, 'unrelated run titles are excluded');
    assert.deepEqual(
      result.body.blogRuns.map(({ mode, requestId }) => ({ mode, requestId })),
      [
        { mode: 'revise', requestId: CURRENT_REQUEST_ID },
        { mode: 'new', requestId: ORIGINAL_REQUEST_ID },
      ],
    );
    assert.equal(result.body.blogRuns[0].updatedAt, '2026-09-27T12:02:00.000Z');

    assert.equal(result.body.blogRequests.length, 20);
    assert.equal(result.body.blogRequests[0].requestId, CURRENT_REQUEST_ID);
    assert.equal(result.body.blogRequests[1].requestId, ORIGINAL_REQUEST_ID);
    assert.ok(!result.body.blogRequests.some(({ createdAt }) => createdAt.startsWith('2026-09-01')));
    const completed = result.body.blogRequests.find(({ requestId }) => requestId === ORIGINAL_REQUEST_ID);
    assert.equal(completed.prompt, 'Private original prompt.');
    assert.equal(completed.status, 'drafted');
    assert.equal(completed.slug, 'dealer-operations-guide');
  });

  assert.deepEqual(fetchedStatusIds, [ORIGINAL_REQUEST_ID]);
  assert.ok(kv.lists.some(({ prefix }) => prefix === 'blogreq:'));
});

test('blog activity ignores a committed marker whose request identity does not match', async () => {
  const { loadBlogActivity } = await blogApi();
  const kv = new MemoryKv({
    [`blogreq:${ORIGINAL_REQUEST_ID}`]: {
      requestId: ORIGINAL_REQUEST_ID,
      mode: 'new',
      prompt: 'Private prompt that belongs to the original request.',
      keyword: '',
      createdAt: '2026-09-26T12:00:00.000Z',
    },
  });
  const env = workerEnv(kv);

  await withFetch(async (url) => {
    const value = String(url);
    if (value.includes('/actions/workflows/generate-blog-post.yml/runs')) {
      return new Response(JSON.stringify({ workflow_runs: [{
        id: 101,
        display_title: `blog: new ${ORIGINAL_REQUEST_ID}`,
        status: 'completed',
        conclusion: 'success',
        created_at: '2026-09-26T12:01:00.000Z',
        html_url: 'https://github.example/runs/101',
      }] }), { status: 200 });
    }
    if (value.includes(`/_requests/${ORIGINAL_REQUEST_ID}.json`)) {
      return new Response(JSON.stringify({
        requestId: CURRENT_REQUEST_ID,
        mode: 'new',
        slug: 'wrong-request-post',
        status: 'drafted',
        errorKind: null,
        error: '',
        finishedAt: '2026-09-26T12:10:00.000Z',
      }), { status: 200 });
    }
    throw new Error(`Unexpected fetch: ${value}`);
  }, async () => {
    const activity = await loadBlogActivity(env);
    assert.equal(activity.blogRequests.length, 1);
    assert.equal(activity.blogRequests[0].requestId, ORIGINAL_REQUEST_ID);
    assert.equal(activity.blogRequests[0].status, undefined);
    assert.equal(activity.blogRequests[0].slug, undefined);
  });
});

test('content list returns empty blog arrays when the blog token or KV integration is unavailable', async () => {
  await withFetch(async (url) => {
    const value = String(url);
    if (value.includes('raw.githubusercontent.com')) {
      return new Response(JSON.stringify({ generatedAt: '2026-09-27', articles: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw new Error(`Unexpected fetch without blog configuration: ${value}`);
  }, async () => {
    const result = await handleContentList({});
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.blogRuns, []);
    assert.deepEqual(result.body.blogRequests, []);
  });
});

test('admin router exposes all four blog routes only after the existing admin gate', async () => {
  const source = await readFile(new URL('../worker/src/admin/router.js', import.meta.url), 'utf8');
  assert.match(source, /handleBlogGenerate/);
  assert.match(source, /path === ['"]\/admin\/blog\/generate['"] && request\.method === ['"]POST['"]/);
  assert.match(source, /path === ['"]\/admin\/blog\/revise['"] && request\.method === ['"]POST['"]/);
  assert.match(source, /path === ['"]\/admin\/blog\/discard['"] && request\.method === ['"]POST['"]/);
  assert.match(source, /path === ['"]\/admin\/blog\/preview['"] && request\.method === ['"]GET['"]/);

  const { handleAdmin } = await import('../worker/src/admin/router.js');
  const kv = new MemoryKv();
  const env = {
    ...workerEnv(kv),
    ADMIN_PASSWORD: 'admin-password',
    ADMIN_SESSION_SECRET: 'admin-session-secret',
  };
  let fetches = 0;

  await withFetch(async (url) => {
    fetches += 1;
    if (String(url).includes('/contents/previews/blog/router-preview.html')) {
      return new Response('<p>router preview</p>', { status: 200 });
    }
    return new Response(null, { status: 204 });
  }, async () => {
    const anonymous = await handleAdmin(jsonRequest(
      { prompt: 'This anonymous prompt must never reach the dispatch endpoint.' },
      '/admin-api/blog/generate',
    ), env, {});
    assert.equal(anonymous.status, 401);
    assert.equal(fetches, 0);
    assert.equal(kv.puts.length, 0);

    const login = await handleAdmin(jsonRequest(
      { password: env.ADMIN_PASSWORD },
      '/admin-api/login',
    ), env, {});
    assert.equal(login.status, 200);
    const { token } = await login.json();
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const generated = await handleAdmin(new Request('https://autolander.ai/admin-api/blog/generate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ prompt: 'This authenticated request is long enough to dispatch.' }),
    }), env, {});
    assert.equal(generated.status, 202);

    const preview = await handleAdmin(new Request(
      'https://autolander.ai/admin-api/blog/preview?slug=router-preview',
      { headers: authHeaders },
    ), env, {});
    assert.equal(preview.status, 200);
    assert.equal((await preview.json()).html, '<p>router preview</p>');
  });

  assert.equal(fetches, 2);
});
