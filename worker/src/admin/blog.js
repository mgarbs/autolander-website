import { encryptPayload } from '../../../shared/blog-crypto.js';

const DEFAULT_REPO = 'mgarbs/autolander-website';
const WORKFLOW_FILE = 'generate-blog-post.yml';
const REQUEST_TTL_SECONDS = 7_776_000;
const REQUEST_LIMIT = 20;
const RUN_LIMIT = 100;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RUN_TITLE_RE = /^blog: (new|revise|discard) ([0-9a-f-]+)$/i;
const WRITING_MESSAGE = 'Writing with Opus 5.5 at max effort. Usually 5 to 15 minutes.';
const REQUEST_MODES = new Set(['new', 'revise', 'discard']);
const REQUEST_STATUSES = new Set(['drafted', 'needs_attention', 'failed', 'discarded']);
const ERROR_KINDS = new Set(['usage_limit', 'auth', 'model_unavailable', 'no_output', 'validation', 'other']);

const contentRepo = (env) => env.CONTENT_REPO || DEFAULT_REPO;

function ghHeaders(token, accept = 'application/vnd.github+json') {
  return {
    Authorization: `Bearer ${token}`,
    Accept: accept,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'autolander-admin-worker',
  };
}

function errorResult(status, reason, message) {
  return {
    status,
    body: {
      ok: false,
      reason,
      ...(message ? { message } : {}),
    },
  };
}

function disabled() {
  return errorResult(
    503,
    'blog_disabled',
    'AI Blog Studio is not configured.',
  );
}

function hasBlogConfig(env) {
  return Boolean(env?.GITHUB_TOKEN && env?.BLOG_INPUT_KEY && env?.TRACKING);
}

async function requestBody(request) {
  try {
    const value = await request.json();
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function stringInput(value) {
  return typeof value === 'string' ? value.trim() : null;
}

function newRequestId() {
  return globalThis.crypto.randomUUID();
}

async function storeRequest(env, record) {
  await env.TRACKING.put(
    `blogreq:${record.requestId}`,
    JSON.stringify(record),
    { expirationTtl: REQUEST_TTL_SECONDS },
  );
}

async function cleanFailedDispatch(env, record) {
  const key = `blogreq:${record.requestId}`;
  if (typeof env.TRACKING.delete === 'function') {
    try {
      await env.TRACKING.delete(key);
      return;
    } catch {
      // Fall back to a terminal record so the request never looks in progress forever.
    }
  }
  try {
    await storeRequest(env, {
      ...record,
      status: 'failed',
      errorKind: 'other',
      error: 'The workflow dispatch failed.',
      finishedAt: new Date().toISOString(),
    });
  } catch {
    // The endpoint still returns a generic dispatch failure without exposing private text.
  }
}

async function dispatchWorkflow(env, inputs) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${contentRepo(env)}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: 'POST',
        headers: { ...ghHeaders(env.GITHUB_TOKEN), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: 'main', inputs }),
      },
    );
    return response.status === 204;
  } catch {
    return false;
  }
}

async function encryptedPayload(value, env, requestId) {
  try {
    return await encryptPayload(value, env.BLOG_INPUT_KEY, requestId);
  } catch {
    return null;
  }
}

export async function handleBlogGenerate(request, env) {
  if (!hasBlogConfig(env)) return disabled();

  const body = await requestBody(request);
  const prompt = stringInput(body?.prompt);
  const keyword = body?.keyword === undefined ? '' : stringInput(body.keyword);
  if (prompt === null || prompt.length < 20 || prompt.length > 6000) {
    return errorResult(400, 'invalid_prompt');
  }
  if (keyword === null || keyword.length > 80) {
    return errorResult(400, 'invalid_keyword');
  }

  const requestId = newRequestId();
  const payload = await encryptedPayload({ prompt, keyword }, env, requestId);
  if (!payload) return disabled();

  const record = {
    requestId,
    mode: 'new',
    prompt,
    keyword,
    createdAt: new Date().toISOString(),
  };
  try {
    await storeRequest(env, record);
  } catch {
    return errorResult(502, 'request_store_failed', 'The writing request could not be saved. Try again.');
  }

  const dispatched = await dispatchWorkflow(env, {
    request_id: requestId,
    mode: 'new',
    slug: '',
    payload,
  });
  if (!dispatched) {
    await cleanFailedDispatch(env, record);
    return errorResult(502, 'dispatch_failed', 'The writing workflow could not be started. Try again.');
  }

  return {
    status: 202,
    body: { ok: true, requestId, message: WRITING_MESSAGE },
  };
}

async function fetchRawJson(env, path) {
  let response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${contentRepo(env)}/contents/${path}?ref=main`,
      {
        headers: {
          ...ghHeaders(env.GITHUB_TOKEN, 'application/vnd.github.raw'),
          'Cache-Control': 'no-cache',
        },
        cf: { cacheTtl: 0, cacheEverything: false },
      },
    );
  } catch {
    return { ok: false, status: 0 };
  }
  if (!response.ok) return { ok: false, status: response.status };
  try {
    return { ok: true, value: await response.json() };
  } catch {
    return { ok: false, status: 502 };
  }
}

async function kvJson(kv, key) {
  try {
    const value = await kv.get(key, { type: 'json' });
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {
    // Private request history is optional when revising an otherwise valid draft.
  }
  return null;
}

async function originalRequest(kv, startingRequestId, targetSlug) {
  let requestId = typeof startingRequestId === 'string' && UUID_RE.test(startingRequestId)
    ? startingRequestId.toLowerCase()
    : '';
  const seen = new Set();

  for (let depth = 0; requestId && depth < 20 && !seen.has(requestId); depth += 1) {
    seen.add(requestId);
    const record = await kvJson(kv, `blogreq:${requestId}`);
    if (!record) break;
    if (record.requestId !== undefined
      && (typeof record.requestId !== 'string' || record.requestId.toLowerCase() !== requestId)) {
      break;
    }
    if (record.mode === 'new' && typeof record.prompt === 'string' && record.prompt) {
      return { prompt: record.prompt.slice(0, 6000), requestId };
    }
    if (record.mode !== 'revise' || record.slug !== targetSlug) break;
    const parent = [record.originalRequestId, record.previousRequestId]
      .find((value) => typeof value === 'string' && UUID_RE.test(value));
    requestId = parent ? parent.toLowerCase() : '';
  }

  return { prompt: '', requestId: '' };
}

export async function handleBlogRevise(request, env) {
  if (!hasBlogConfig(env)) return disabled();

  const body = await requestBody(request);
  const slug = stringInput(body?.slug);
  const feedback = stringInput(body?.feedback);
  if (slug === null || !SLUG_RE.test(slug)) return errorResult(400, 'invalid_slug');
  if (feedback === null || feedback.length < 5 || feedback.length > 4000) {
    return errorResult(400, 'invalid_feedback');
  }

  const postResult = await fetchRawJson(
    env,
    `scripts/seo/articles/blog/${encodeURIComponent(slug)}.json`,
  );
  if (!postResult.ok) {
    if (postResult.status === 404) return errorResult(404, 'blog_post_not_found');
    return errorResult(502, 'blog_post_fetch_failed', 'The draft could not be read. Try again.');
  }

  const stateResult = await fetchRawJson(env, 'scripts/seo/articles/publish-state.json');
  if (!stateResult.ok || !stateResult.value || typeof stateResult.value !== 'object') {
    return errorResult(502, 'publish_state_fetch_failed', 'The draft status could not be checked. Try again.');
  }
  const publishEntry = stateResult.value[slug];
  if (publishEntry?.status === 'published') {
    return errorResult(409, 'published_post', 'Published posts cannot be revised.');
  }
  if (publishEntry?.status !== 'draft') {
    return errorResult(502, 'publish_state_missing', 'The draft status could not be confirmed. Try again.');
  }

  const previousRequestId = typeof postResult.value?.meta?.requestId === 'string'
    && UUID_RE.test(postResult.value.meta.requestId)
    ? postResult.value.meta.requestId.toLowerCase()
    : '';
  const original = await originalRequest(env.TRACKING, previousRequestId, slug);
  const originalPrompt = original.prompt;
  const requestId = newRequestId();
  const payload = await encryptedPayload({ feedback, originalPrompt }, env, requestId);
  if (!payload) return disabled();

  const record = {
    requestId,
    mode: 'revise',
    slug,
    feedback,
    originalRequestId: original.requestId || previousRequestId,
    previousRequestId,
    createdAt: new Date().toISOString(),
  };
  try {
    await storeRequest(env, record);
  } catch {
    return errorResult(502, 'request_store_failed', 'The revision request could not be saved. Try again.');
  }

  const dispatched = await dispatchWorkflow(env, {
    request_id: requestId,
    mode: 'revise',
    slug,
    payload,
  });
  if (!dispatched) {
    await cleanFailedDispatch(env, record);
    return errorResult(502, 'dispatch_failed', 'The revision workflow could not be started. Try again.');
  }

  return {
    status: 202,
    body: { ok: true, requestId, message: WRITING_MESSAGE },
  };
}

export async function handleBlogDiscard(request, env) {
  if (!hasBlogConfig(env)) return disabled();

  const body = await requestBody(request);
  const slug = stringInput(body?.slug);
  if (slug === null || !SLUG_RE.test(slug)) return errorResult(400, 'invalid_slug');

  const requestId = newRequestId();
  const dispatched = await dispatchWorkflow(env, {
    request_id: requestId,
    mode: 'discard',
    slug,
    payload: '',
  });
  if (!dispatched) {
    return errorResult(502, 'dispatch_failed', 'The discard workflow could not be started. Try again.');
  }

  return { status: 202, body: { ok: true, requestId } };
}

export async function handleBlogPreview(input, env) {
  if (!hasBlogConfig(env)) return disabled();

  let url;
  try {
    url = input instanceof URL ? input : new URL(input.url || input);
  } catch {
    return errorResult(400, 'invalid_slug');
  }
  const slug = url.searchParams.get('slug') || '';
  if (!SLUG_RE.test(slug)) return errorResult(400, 'invalid_slug');

  let response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${contentRepo(env)}/contents/previews/blog/${encodeURIComponent(slug)}.html?ref=main`,
      {
        headers: {
          ...ghHeaders(env.GITHUB_TOKEN, 'application/vnd.github.raw'),
          'Cache-Control': 'no-cache',
        },
        cf: { cacheTtl: 0, cacheEverything: false },
      },
    );
  } catch {
    return errorResult(502, 'preview_fetch_failed', 'The preview could not be loaded. Try again.');
  }
  if (response.status === 404) return errorResult(404, 'preview_not_found');
  if (!response.ok) {
    return errorResult(502, 'preview_fetch_failed', 'The preview could not be loaded. Try again.');
  }

  try {
    return { status: 200, body: { ok: true, html: await response.text() } };
  } catch {
    return errorResult(502, 'preview_fetch_failed', 'The preview could not be loaded. Try again.');
  }
}

function parseRun(run) {
  const title = typeof run?.display_title === 'string' ? run.display_title : '';
  const match = title.match(RUN_TITLE_RE);
  if (!match || !UUID_RE.test(match[2])) return null;
  return {
    id: run.id,
    title,
    mode: match[1].toLowerCase(),
    requestId: match[2].toLowerCase(),
    status: run.status,
    conclusion: run.conclusion,
    createdAt: run.created_at,
    url: run.html_url,
  };
}

async function loadRuns(env) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${contentRepo(env)}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=${RUN_LIMIT}`,
      { headers: ghHeaders(env.GITHUB_TOKEN) },
    );
    if (!response.ok) return [];
    const value = await response.json();
    const parsed = (Array.isArray(value?.workflow_runs) ? value.workflow_runs : [])
      .map(parseRun)
      .filter(Boolean);
    parsed.sort((left, right) => (
      requestTime(right) - requestTime(left)
      || Number(right.id || 0) - Number(left.id || 0)
    ));
    const seen = new Set();
    return parsed.filter((run) => {
      if (seen.has(run.requestId)) return false;
      seen.add(run.requestId);
      return true;
    });
  } catch {
    return [];
  }
}

async function listRequestKeys(kv) {
  const names = [];
  let cursor;
  do {
    const page = await kv.list({
      prefix: 'blogreq:',
      ...(cursor ? { cursor } : {}),
    });
    for (const key of page?.keys || []) {
      if (typeof key?.name === 'string') names.push(key.name);
    }
    cursor = page?.list_complete === false && page.cursor ? page.cursor : '';
  } while (cursor);
  return names;
}

function requestTime(record) {
  const time = Date.parse(record?.createdAt || '');
  return Number.isFinite(time) ? time : 0;
}

async function loadRequests(kv) {
  let keys;
  try {
    keys = await listRequestKeys(kv);
  } catch {
    return [];
  }
  const records = await Promise.all(keys.map(async (key) => {
    const keyRequestId = key.slice('blogreq:'.length).toLowerCase();
    if (!UUID_RE.test(keyRequestId)) return null;
    const record = await kvJson(kv, key);
    if (!record) return null;
    if (record.requestId !== undefined
      && (typeof record.requestId !== 'string' || record.requestId.toLowerCase() !== keyRequestId)) {
      return null;
    }
    if (!['new', 'revise'].includes(record.mode) || !Number.isFinite(Date.parse(record.createdAt || ''))) {
      return null;
    }
    if (record.mode === 'new' && typeof record.prompt !== 'string') return null;
    if (record.mode === 'revise'
      && (!SLUG_RE.test(record.slug || '') || typeof record.feedback !== 'string')) return null;
    return {
      ...record,
      requestId: keyRequestId,
    };
  }));
  return records
    .filter(Boolean)
    .sort((left, right) => (
      requestTime(right) - requestTime(left)
      || String(right.requestId).localeCompare(String(left.requestId))
    ))
    .slice(0, REQUEST_LIMIT);
}

async function loadRequestStatus(env, requestId) {
  if (!UUID_RE.test(requestId)) return null;
  const result = await fetchRawJson(
    env,
    `scripts/seo/articles/blog/_requests/${encodeURIComponent(requestId)}.json`,
  );
  if (!result.ok || !result.value || typeof result.value !== 'object') return null;
  const marker = result.value;
  if (typeof marker.requestId !== 'string' || marker.requestId.toLowerCase() !== requestId.toLowerCase()
    || !REQUEST_MODES.has(marker.mode)
    || !REQUEST_STATUSES.has(marker.status)
    || typeof marker.slug !== 'string'
    || (marker.slug && !SLUG_RE.test(marker.slug))
    || (marker.errorKind !== null && marker.errorKind !== undefined && !ERROR_KINDS.has(marker.errorKind))) {
    return null;
  }
  return marker;
}

export async function loadBlogActivity(env) {
  if (!env?.GITHUB_TOKEN || !env?.TRACKING) return { blogRuns: [], blogRequests: [] };

  const [blogRuns, requests] = await Promise.all([
    loadRuns(env),
    loadRequests(env.TRACKING),
  ]);
  const runByRequest = new Map(blogRuns.map((run) => [run.requestId, run]));
  const completedRequests = requests.filter((record) => (
    runByRequest.get(String(record.requestId).toLowerCase())?.status === 'completed'
  ));
  const statuses = new Map((await Promise.all(completedRequests.map(async (record) => [
    record.requestId,
    await loadRequestStatus(env, record.requestId),
  ]))).filter(([, status]) => status));

  const blogRequests = requests.map((record) => {
    const normalizedRequestId = String(record.requestId).toLowerCase();
    const run = runByRequest.get(normalizedRequestId) || null;
    const status = statuses.get(record.requestId);
    const marker = status?.mode === record.mode ? {
      ...(typeof status.slug === 'string' ? { slug: status.slug } : {}),
      status: status.status,
      ...(typeof status.errorKind === 'string' || status.errorKind === null
        ? { errorKind: status.errorKind }
        : {}),
      ...(typeof status.error === 'string' ? { error: status.error } : {}),
      ...(typeof status.finishedAt === 'string' ? { finishedAt: status.finishedAt } : {}),
    } : {};
    return {
      ...record,
      ...marker,
      run,
    };
  });

  return { blogRuns, blogRequests };
}
