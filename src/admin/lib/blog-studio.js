const TERMINAL_REQUEST_STATES = new Set([
  'drafted',
  'needs_attention',
  'failed',
  'discarded',
]);

const ACTIVE_RUN_STATES = new Set(['queued', 'in_progress']);
const REQUEST_WINDOW_MS = 75 * 60 * 1000;
const SETTLE_WINDOW_MS = 15 * 60 * 1000;
const PUBLISH_WINDOW_MS = 30 * 60 * 1000;
const MAX_ELAPSED_SECONDS = (99 * 60) + 59;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function timestamp(value) {
  const parsed = Date.parse(typeof value === 'string' ? value : '');
  return Number.isFinite(parsed) ? parsed : null;
}

function isTerminal(request) {
  return TERMINAL_REQUEST_STATES.has(request?.status);
}

function isRecent(value, now, windowMs) {
  const createdAt = timestamp(value);
  if (createdAt === null) return false;
  const age = now - createdAt;
  return age <= windowMs;
}

function elapsedLabel(createdAt, now) {
  const startedAt = timestamp(createdAt);
  const safeNow = Number.isFinite(now) ? now : Date.now();
  const seconds = startedAt === null
    ? 0
    : Math.min(MAX_ELAPSED_SECONDS, Math.max(0, Math.floor((safeNow - startedAt) / 1000)));
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainder = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function optimisticActivity(value) {
  if (value === true) return true;
  if (Array.isArray(value) || value instanceof Set || value instanceof Map) return value.size > 0 || value.length > 0;
  return typeof value === 'number' && value > 0;
}

function articlesFor(data) {
  return (Array.isArray(data?.articles) ? data.articles : [])
    .filter((article) => article?.kind === 'blog');
}

function newestPublishRun(data, slug) {
  const title = `publish: ${slug}`;
  return [...(Array.isArray(data?.runs) ? data.runs : [])]
    .filter((run) => String(run?.title || '').trim() === title)
    .sort((left, right) => (
      (timestamp(right?.createdAt) ?? 0) - (timestamp(left?.createdAt) ?? 0)
      || Number(right?.id || 0) - Number(left?.id || 0)
    ))[0] || null;
}

function completedRunIsSettling(request, run, now) {
  if (timestamp(run?.updatedAt) !== null) {
    return isRecent(run.updatedAt, now, SETTLE_WINDOW_MS);
  }
  return isRecent(request?.createdAt, now, REQUEST_WINDOW_MS);
}

function terminalSnapshotPending(request, data, now) {
  if (!isTerminal(request) || !isRecent(request?.finishedAt, now, SETTLE_WINDOW_MS)) return false;
  const article = articlesFor(data).find((row) => row.slug === request.slug);
  if (request.status === 'discarded') return Boolean(article);
  if (request.status === 'drafted' || request.status === 'needs_attention') {
    return !article || article.requestId !== request.requestId;
  }
  return false;
}

function optimisticHasSlug(value, slug) {
  if (Array.isArray(value)) return value.includes(slug);
  if (value instanceof Set || value instanceof Map) return value.has(slug);
  return false;
}

function newestRequestsBySlug(requests) {
  const newest = new Map();
  for (const request of requests) {
    if (typeof request?.slug !== 'string' || !request.slug) continue;
    const current = newest.get(request.slug);
    const requestTime = timestamp(request.createdAt) ?? timestamp(request.finishedAt) ?? 0;
    const currentTime = timestamp(current?.createdAt) ?? timestamp(current?.finishedAt) ?? 0;
    if (!current || requestTime > currentTime
      || (requestTime === currentTime
        && String(request.requestId || '').localeCompare(String(current.requestId || '')) > 0)) {
      newest.set(request.slug, request);
    }
  }
  return newest;
}

export function filterDripArticles(articles) {
  if (!Array.isArray(articles)) return [];
  return articles.filter((article) => article?.kind !== 'blog');
}

export function canWriteDraft(prompt, keyword = '') {
  if (typeof prompt !== 'string' || typeof keyword !== 'string') return false;
  const promptLength = prompt.trim().length;
  return promptLength >= 20 && promptLength <= 6000 && keyword.trim().length <= 80;
}

export function canSendRevision(feedback) {
  if (typeof feedback !== 'string') return false;
  const length = feedback.trim().length;
  return length >= 5 && length <= 4000;
}

export function requestPresentation(request, now = Date.now()) {
  const terminal = request?.status;
  if (terminal === 'drafted') return { state: 'drafted', label: 'drafted', inFlight: false };
  if (terminal === 'needs_attention') {
    return { state: 'needs_attention', label: 'needs attention', inFlight: false };
  }
  if (terminal === 'failed') return { state: 'failed', label: 'failed', inFlight: false };
  if (terminal === 'discarded') return { state: 'discarded', label: 'discarded', inFlight: false };

  const run = request?.run;
  if (run?.status === 'completed' && run.conclusion !== 'success') {
    return { state: 'failed', label: 'failed', inFlight: false };
  }

  const safeNow = Number.isFinite(now) ? now : Date.now();
  if (run?.status === 'completed') {
    if (!completedRunIsSettling(request, run, safeNow)) {
      return { state: 'failed', label: 'failed', inFlight: false };
    }
  } else if (!ACTIVE_RUN_STATES.has(run?.status)
    && !isRecent(request?.createdAt, safeNow, REQUEST_WINDOW_MS)) {
    return { state: 'failed', label: 'failed', inFlight: false };
  }

  return {
    state: 'writing',
    label: `writing… ${elapsedLabel(request?.createdAt, safeNow)}`,
    inFlight: true,
  };
}

export function blogFailureMessage(errorKind, error) {
  if (errorKind === 'usage_limit') {
    return 'Claude subscription limit reached. Try again after your usage window resets.';
  }
  if (errorKind === 'auth') {
    return 'Subscription token expired or revoked. Reconnect it (claude setup-token → repo secret CLAUDE_CODE_OAUTH_TOKEN).';
  }
  const detail = text(error);
  return detail ? detail.slice(0, 300) : 'The workflow run failed. Open the run for details.';
}

export function promptExcerpt(request) {
  const preferred = request?.mode === 'revise' ? request?.feedback : request?.prompt;
  const fallback = request?.mode === 'revise' ? request?.prompt : request?.feedback;
  const value = text(preferred || fallback).replace(/\s+/g, ' ');
  if (value.length <= 80) return value;
  return `${value.slice(0, 79).trimEnd()}…`;
}

export function sortBlogRequests(requests) {
  if (!Array.isArray(requests)) return [];
  return [...requests].sort((left, right) => {
    const leftTime = timestamp(left?.createdAt) ?? 0;
    const rightTime = timestamp(right?.createdAt) ?? 0;
    return rightTime - leftTime
      || String(right?.requestId || '').localeCompare(String(left?.requestId || ''));
  });
}

export function publishPresentation(data, article, now = Date.now()) {
  const run = newestPublishRun(data, article?.slug);
  if (ACTIVE_RUN_STATES.has(run?.status)) {
    return { state: 'publishing', label: 'publishing…', inFlight: true, run };
  }
  if (run?.status === 'completed' && run.conclusion !== 'success') {
    return { state: 'failed', label: 'last publish failed', inFlight: false, run };
  }
  if (article?.status === 'published') {
    return { state: 'published', label: 'published', inFlight: false, run };
  }
  const safeNow = Number.isFinite(now) ? now : Date.now();
  if (run?.status === 'completed' && run.conclusion === 'success'
    && (timestamp(run.updatedAt) !== null
      ? isRecent(run.updatedAt, safeNow, SETTLE_WINDOW_MS)
      : isRecent(run.createdAt, safeNow, PUBLISH_WINDOW_MS))) {
    return { state: 'publishing', label: 'publishing…', inFlight: true, run };
  }
  return { state: 'idle', label: 'draft', inFlight: false, run };
}

export function hasNewPublishRun(data, slug, knownRunIds = [], startedAt = 0) {
  const known = new Set((Array.isArray(knownRunIds) ? knownRunIds : []).map(String));
  const title = `publish: ${slug}`;
  return (Array.isArray(data?.runs) ? data.runs : []).some((run) => {
    if (String(run?.title || '').trim() !== title
      || run?.id === undefined || known.has(String(run.id))) return false;
    if (ACTIVE_RUN_STATES.has(run.status)) return true;
    const createdAt = timestamp(run.createdAt);
    return !startedAt || (createdAt !== null && createdAt >= startedAt);
  });
}

export function isBlogSlugInFlight(data, slug, optimisticSlugs = [], now = Date.now()) {
  if (optimisticHasSlug(optimisticSlugs, slug)) return true;
  const safeNow = Number.isFinite(now) ? now : Date.now();
  const article = articlesFor(data).find((row) => row.slug === slug) || { slug, status: 'draft' };
  if (publishPresentation(data, article, safeNow).inFlight) return true;

  const runs = new Map((Array.isArray(data?.blogRuns) ? data.blogRuns : [])
    .filter((run) => typeof run?.requestId === 'string')
    .map((run) => [run.requestId.toLowerCase(), run]));
  const latest = newestRequestsBySlug(
    Array.isArray(data?.blogRequests) ? data.blogRequests : [],
  ).get(slug);
  if (!latest) return false;
  if (terminalSnapshotPending(latest, data, safeNow)) return true;
  if (isTerminal(latest)) return false;
  const requestId = typeof latest.requestId === 'string' ? latest.requestId.toLowerCase() : '';
  const enriched = latest.run || !runs.has(requestId)
    ? latest
    : { ...latest, run: runs.get(requestId) };
  return requestPresentation(enriched, safeNow).inFlight;
}

export function isBlogActivityInFlight(data, optimistic = false, now = Date.now()) {
  if (optimisticActivity(optimistic)) return true;

  const safeNow = Number.isFinite(now) ? now : Date.now();
  const requests = Array.isArray(data?.blogRequests) ? data.blogRequests : [];
  const requestById = new Map(requests
    .filter((request) => typeof request?.requestId === 'string')
    .map((request) => [request.requestId.toLowerCase(), request]));
  const runs = Array.isArray(data?.blogRuns) ? data.blogRuns : [];
  const runIds = new Set();
  const latestBySlug = newestRequestsBySlug(requests);

  if ([...latestBySlug.values()].some(
    (request) => terminalSnapshotPending(request, data, safeNow),
  )) return true;

  for (const run of runs) {
    const requestId = typeof run?.requestId === 'string' ? run.requestId.toLowerCase() : '';
    if (requestId) runIds.add(requestId);
    const request = requestById.get(requestId);
    if (request?.slug && latestBySlug.get(request.slug) !== request) continue;
    if (request && isTerminal(request)) continue;
    if (ACTIVE_RUN_STATES.has(run?.status)) return true;
    if (run?.status === 'completed' && run.conclusion === 'success' && request) {
      if (completedRunIsSettling(request, run, safeNow)) return true;
    }
    if (run?.status === 'completed' && run.conclusion === 'success'
      && run?.mode === 'discard' && isRecent(run.createdAt, safeNow, REQUEST_WINDOW_MS)) {
      return true;
    }
  }

  for (const request of requests) {
    if (request?.slug && latestBySlug.get(request.slug) !== request) continue;
    if (isTerminal(request)) continue;
    const nestedRun = request?.run;
    if (ACTIVE_RUN_STATES.has(nestedRun?.status)) return true;
    if (nestedRun?.status === 'completed') {
      if (nestedRun.conclusion === 'success'
        && completedRunIsSettling(request, nestedRun, safeNow)) {
        return true;
      }
      continue;
    }
    const requestId = typeof request?.requestId === 'string' ? request.requestId.toLowerCase() : '';
    if (!runIds.has(requestId) && isRecent(request?.createdAt, safeNow, REQUEST_WINDOW_MS)) return true;
  }

  if (articlesFor(data).some((article) => publishPresentation(data, article, safeNow).inFlight)) return true;

  return false;
}
