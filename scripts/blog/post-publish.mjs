import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://autolander.ai';
const FEED_URL = `${ORIGIN}/blog/feed.xml`;
const HUB_URL = 'https://pubsubhubbub.appspot.com/';
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;

const delay = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds));

function statusDetail(response) {
  return response ? `HTTP ${response.status}` : 'network error';
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replace(/[\r\n]+/g, ' ');
}

function cacheBusted(url, timestamp) {
  const value = new URL(url);
  value.searchParams.set('cb', String(Math.trunc(timestamp)));
  return value.href;
}

const noCacheGet = () => ({
  headers: { 'Cache-Control': 'no-cache' },
  cache: 'no-store',
});

function summaryFor(postUrl, checks) {
  const row = (label, check) => `| ${label} | ${check.ok ? 'PASS' : 'FAIL'} | ${escapeCell(check.detail)} |`;
  return [
    '## Blog post-publish verification',
    '',
    `Post: ${postUrl}`,
    '',
    '| Check | Result | Detail |',
    '| --- | --- | --- |',
    row('WebSub', checks.webSub),
    row('Live post and canonical', checks.livePost),
    row('Sitemap', checks.sitemap),
    row('RSS feed', checks.feed),
    '',
  ].join('\n');
}

async function fetchCheck(fetchImpl, url, init = {}, timeoutMs = 30_000) {
  const controller = new AbortController();
  let timeout;
  try {
    const request = Promise.resolve()
      .then(() => fetchImpl(url, { ...init, signal: controller.signal }))
      .catch(() => null);
    const deadline = new Promise((done) => {
      timeout = setTimeout(() => {
        controller.abort();
        done(null);
      }, Math.max(1, timeoutMs));
    });
    return await Promise.race([request, deadline]);
  } finally {
    clearTimeout(timeout);
  }
}

async function responseText(response) {
  if (!response) return '';
  try {
    return await response.text();
  } catch {
    return '';
  }
}

export async function postPublish({
  root = process.cwd(),
  fetchImpl = globalThis.fetch,
  sleep = delay,
  pollIntervalMs = 15_000,
  pollTimeoutMs = 300_000,
  requestTimeoutMs = 30_000,
  nowImpl = Date.now,
  summaryPath = process.env.GITHUB_STEP_SUMMARY || '',
} = {}) {
  const record = JSON.parse(readFileSync(resolve(root, '.last-publish.json'), 'utf8'));
  if (record.kind !== 'blog') return { ok: true, skipped: true, checks: {} };
  if (!SLUG_RE.test(record.slug || '')) throw new Error('blog publish record has an invalid slug');
  if (typeof fetchImpl !== 'function') throw new Error('post-publish verification requires fetch');
  if (!Number.isFinite(pollIntervalMs) || pollIntervalMs <= 0
    || !Number.isFinite(pollTimeoutMs) || pollTimeoutMs < 0
    || !Number.isFinite(requestTimeoutMs) || requestTimeoutMs <= 0) {
    throw new Error('post-publish timing values are invalid');
  }

  const postUrl = `${ORIGIN}/blog/${record.slug}/`;
  const form = new URLSearchParams([
    ['hub.mode', 'publish'],
    ['hub.url', FEED_URL],
  ]);
  const hubResponse = await fetchCheck(fetchImpl, HUB_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: form.toString(),
  }, requestTimeoutMs);
  const checks = {
    webSub: {
      ok: Boolean(hubResponse?.ok),
      detail: statusDetail(hubResponse),
    },
  };

  const pollStartedAt = nowImpl();
  const postCheckUrl = cacheBusted(postUrl, pollStartedAt);
  const sitemapCheckUrl = cacheBusted(`${ORIGIN}/sitemap.xml`, pollStartedAt);
  const feedCheckUrl = cacheBusted(FEED_URL, pollStartedAt);
  const maxAttempts = Math.floor(pollTimeoutMs / pollIntervalMs) + 1;
  const pollDeadline = pollStartedAt + pollTimeoutMs;
  let postResponse = null;
  let canonicalFound = false;
  let attempts = 0;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0 && nowImpl() >= pollDeadline) break;
    attempts += 1;
    const remainingMs = Math.max(1, pollDeadline - nowImpl());
    postResponse = await fetchCheck(
      fetchImpl,
      postCheckUrl,
      noCacheGet(),
      Math.min(requestTimeoutMs, remainingMs),
    );
    const html = await responseText(postResponse);
    canonicalFound = postResponse?.ok === true
      && postResponse.status === 200
      && html.includes(`<link rel="canonical" href="${postUrl}"`);
    if (canonicalFound) break;
    const afterRequestMs = nowImpl();
    if (attempt + 1 >= maxAttempts || afterRequestMs >= pollDeadline) break;
    await sleep(Math.min(pollIntervalMs, pollDeadline - afterRequestMs));
  }
  checks.livePost = {
    ok: canonicalFound,
    detail: `${statusDetail(postResponse)}; canonical ${canonicalFound ? 'found' : 'missing'} after ${attempts} attempt${attempts === 1 ? '' : 's'}`,
  };

  const sitemapResponse = await fetchCheck(
    fetchImpl,
    sitemapCheckUrl,
    noCacheGet(),
    requestTimeoutMs,
  );
  const sitemapText = await responseText(sitemapResponse);
  checks.sitemap = {
    ok: Boolean(sitemapResponse?.ok && sitemapText.includes(postUrl)),
    detail: `${statusDetail(sitemapResponse)}; post URL ${sitemapText.includes(postUrl) ? 'found' : 'missing'}`,
  };

  const feedResponse = await fetchCheck(fetchImpl, feedCheckUrl, noCacheGet(), requestTimeoutMs);
  const feedText = await responseText(feedResponse);
  checks.feed = {
    ok: Boolean(feedResponse?.ok && feedText.includes(postUrl)),
    detail: `${statusDetail(feedResponse)}; post URL ${feedText.includes(postUrl) ? 'found' : 'missing'}`,
  };

  const summary = summaryFor(postUrl, checks);
  if (summaryPath) appendFileSync(summaryPath, summary, 'utf8');

  const failures = Object.entries(checks).filter(([, check]) => !check.ok).map(([name]) => name);
  if (failures.length) {
    throw new Error(`blog live verification failed: ${failures.join(', ')} (${statusDetail(postResponse)})`);
  }
  return { ok: true, skipped: false, postUrl, attempts, checks, summary };
}

export const runPostPublish = postPublish;

async function main() {
  try {
    const result = await postPublish();
    if (result.skipped) console.log('post-publish verification skipped for non-blog article');
    else console.log(`blog post-publish verification passed: ${result.postUrl}`);
  } catch (error) {
    console.error(`[post-publish] ${error.message}`);
    process.exitCode = 1;
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) await main();
