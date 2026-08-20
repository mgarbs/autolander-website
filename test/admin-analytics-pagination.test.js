import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fetchAccountFeedFailures,
  fetchAccountPosts,
  fetchAllAccountFailures,
  fetchGlobalFailures,
  fetchGlobalPosts,
} from '../src/admin/lib/analytics.js';

test('requests account feed failures with an encoded account and preserves unavailable responses', async () => {
  const originalFetch = globalThis.fetch;
  let request;
  let requestSignal;
  globalThis.fetch = async (url, options) => {
    request = new URL(String(url), 'https://admin.example.test');
    requestSignal = options?.signal;
    return {
      ok: true,
      status: 200,
      json: async () => ({ available: false }),
    };
  };

  try {
    const controller = new AbortController();
    const response = await fetchAccountFeedFailures('org/42', {
      days: 7,
      limit: 25,
      offset: 5,
      signal: controller.signal,
    });
    assert.deepEqual(response, { available: false });
    assert.equal(request.pathname, '/admin-api/analytics/accounts/org%2F42/feed-failures');
    assert.deepEqual(
      Object.fromEntries(request.searchParams),
      { days: '7', limit: '25', offset: '5' },
    );
    assert.equal(requestSignal, controller.signal);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('loads every account failure page up to the explicit safety cap', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url) => {
    const parsed = new URL(String(url), 'https://admin.example.test');
    requests.push({
      offset: Number(parsed.searchParams.get('offset')),
      limit: Number(parsed.searchParams.get('limit')),
      knownTotal: parsed.searchParams.get('knownTotal'),
    });
    const offset = Number(parsed.searchParams.get('offset'));
    const limit = Number(parsed.searchParams.get('limit'));
    const allRows = Array.from({ length: 5 }, (_, index) => ({
      id: `failure-${index + 1}`,
      occurredAt: `2026-07-${String(23 - index).padStart(2, '0')}T12:00:00Z`,
      code: 'POST_FAILED',
    }));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        rows: allRows.slice(offset, offset + limit),
        total: allRows.length,
        limit,
        offset,
      }),
    };
  };

  try {
    const complete = await fetchAllAccountFailures('org-42', {
      days: 30,
      limit: 2,
      maxRows: 10,
    });
    assert.deepEqual(complete.rows.map((row) => row.id), [
      'failure-1',
      'failure-2',
      'failure-3',
      'failure-4',
      'failure-5',
    ]);
    assert.equal(complete.truncated, false);
    assert.deepEqual(requests, [
      { offset: 0, limit: 2, knownTotal: null },
      { offset: 2, limit: 2, knownTotal: '5' },
      { offset: 4, limit: 1, knownTotal: '5' },
    ]);

    requests.length = 0;
    const capped = await fetchAllAccountFailures('org-42', {
      days: 30,
      limit: 2,
      maxRows: 3,
    });
    assert.equal(capped.rows.length, 3);
    assert.equal(capped.total, 5);
    assert.equal(capped.truncated, true);
    assert.deepEqual(requests, [
      { offset: 0, limit: 2, knownTotal: null },
      { offset: 2, limit: 1, knownTotal: '5' },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('loads bounded post-receipt pages from the encoded account endpoint', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url) => {
    const parsed = new URL(String(url), 'https://admin.example.test');
    const offset = Number(parsed.searchParams.get('offset'));
    const limit = Number(parsed.searchParams.get('limit'));
    requests.push({
      pathname: parsed.pathname,
      days: parsed.searchParams.get('days'),
      offset,
      limit,
      knownTotal: parsed.searchParams.get('knownTotal'),
    });
    const allRows = Array.from({ length: 4 }, (_, index) => ({
      id: `post-${index + 1}`,
      occurredAt: `2026-07-${String(28 - index).padStart(2, '0')}T12:00:00Z`,
      account: { id: 'org/42' },
    }));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        rows: allRows.slice(offset, offset + limit),
        total: allRows.length,
        limit,
        offset,
        summary: { meteredPosts: 4 },
      }),
    };
  };

  try {
    const result = await fetchAccountPosts('org/42', {
      days: 90,
      limit: 2,
      maxRows: 3,
    });
    assert.equal(result.rows.length, 3);
    assert.equal(result.total, 4);
    assert.equal(result.truncated, true);
    assert.equal(result.source, 'account_post_deliveries');
    assert.deepEqual(requests, [
      {
        pathname: '/admin-api/analytics/accounts/org%2F42/posts',
        days: '90',
        offset: 0,
        limit: 2,
        knownTotal: null,
      },
      {
        pathname: '/admin-api/analytics/accounts/org%2F42/posts',
        days: '90',
        offset: 2,
        limit: 1,
        knownTotal: '4',
      },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('sends the 90-day window to the aggregated post endpoint', async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url) => {
    request = new URL(String(url), 'https://admin.example.test');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        rows: [],
        total: 0,
        limit: Number(request.searchParams.get('limit')),
        offset: 0,
      }),
    };
  };

  try {
    const result = await fetchGlobalPosts({ days: 90, limit: 200, maxRows: 200 });
    assert.equal(result.source, 'global_post_deliveries');
    assert.equal(result.summary.windowDays, 90);
    assert.equal(request.pathname, '/admin-api/analytics/posts');
    assert.equal(request.searchParams.get('days'), '90');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('honors the server-applied page cap during a rolling backend deployment', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url) => {
    const parsed = new URL(String(url), 'https://admin.example.test');
    const offset = Number(parsed.searchParams.get('offset'));
    const requestedLimit = Number(parsed.searchParams.get('limit'));
    const appliedLimit = Math.min(requestedLimit, 200);
    requests.push({ offset, requestedLimit });
    const allRows = Array.from({ length: 600 }, (_, index) => ({
      id: `failure-${index}`,
      occurredAt: `2026-07-31T${String(index % 24).padStart(2, '0')}:00:00Z`,
      code: 'POST_FAILED',
    }));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        rows: allRows.slice(offset, offset + appliedLimit),
        total: allRows.length,
        limit: appliedLimit,
        offset,
      }),
    };
  };

  try {
    const result = await fetchGlobalFailures({ limit: 1_000, maxRows: 600 });
    assert.equal(result.rows.length, 600);
    assert.deepEqual(result.rows.map((row) => row.id), (
      Array.from({ length: 600 }, (_, index) => `failure-${index}`)
    ));
    assert.deepEqual(requests, [
      { offset: 0, requestedLimit: 1_000 },
      { offset: 200, requestedLimit: 200 },
      { offset: 400, requestedLimit: 200 },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fills gaps when later rollout instances apply a smaller page cap', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url) => {
    const parsed = new URL(String(url), 'https://admin.example.test');
    const offset = Number(parsed.searchParams.get('offset'));
    const requestedLimit = Number(parsed.searchParams.get('limit'));
    const appliedLimit = offset === 0 ? requestedLimit : Math.min(requestedLimit, 2);
    requests.push({ offset, requestedLimit, appliedLimit });
    const allRows = Array.from({ length: 12 }, (_, index) => ({
      id: `failure-${index}`,
      occurredAt: `2026-07-31T${String(index % 24).padStart(2, '0')}:00:00Z`,
      code: 'POST_FAILED',
    }));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        rows: allRows.slice(offset, offset + appliedLimit),
        total: allRows.length,
        limit: appliedLimit,
        offset,
      }),
    };
  };

  try {
    const result = await fetchAllAccountFailures('org-42', { limit: 5, maxRows: 12 });
    assert.deepEqual(
      result.rows.map((row) => row.id),
      Array.from({ length: 12 }, (_, index) => `failure-${index}`),
    );
    assert.equal(result.truncated, false);
    assert.deepEqual(requests.map((request) => request.offset), [0, 5, 10, 7, 9]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('loads remaining detail pages with concurrency capped at four and preserves order', async () => {
  const originalFetch = globalThis.fetch;
  const pending = new Map();
  const startedOffsets = [];
  let active = 0;
  let maxActive = 0;

  function responseFor(offset, limit) {
    const allRows = Array.from({ length: 12 }, (_, index) => ({
      id: `failure-${index}`,
      occurredAt: `2026-07-${String(31 - index).padStart(2, '0')}T12:00:00Z`,
      code: 'POST_FAILED',
    }));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        rows: allRows.slice(offset, offset + limit),
        total: allRows.length,
        limit,
        offset,
      }),
    };
  }

  globalThis.fetch = async (url) => {
    const parsed = new URL(String(url), 'https://admin.example.test');
    const offset = Number(parsed.searchParams.get('offset'));
    const limit = Number(parsed.searchParams.get('limit'));
    if (offset === 0) return responseFor(offset, limit);

    startedOffsets.push(offset);
    active += 1;
    maxActive = Math.max(maxActive, active);
    return new Promise((resolve) => {
      pending.set(offset, () => {
        pending.delete(offset);
        active -= 1;
        resolve(responseFor(offset, limit));
      });
    });
  };

  try {
    const resultPromise = fetchAllAccountFailures('org-42', {
      days: 30,
      limit: 2,
      maxRows: 12,
    });

    await waitFor(() => pending.size === 4);
    assert.deepEqual(startedOffsets, [2, 4, 6, 8]);
    assert.equal(maxActive, 4);

    pending.get(2)();
    await waitFor(() => pending.has(10));
    assert.deepEqual(startedOffsets, [2, 4, 6, 8, 10]);
    assert.equal(maxActive, 4);

    for (const release of [...pending.values()]) release();
    const result = await resultPromise;
    assert.deepEqual(
      result.rows.map((row) => row.id),
      Array.from({ length: 12 }, (_, index) => `failure-${index}`),
    );
    assert.equal(result.truncated, false);
  } finally {
    for (const release of [...pending.values()]) release();
    globalThis.fetch = originalFetch;
  }
});

async function waitFor(predicate, attempts = 100) {
  for (let index = 0; index < attempts; index += 1) {
    if (predicate()) return;
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
  }
  throw new Error('Timed out waiting for pagination work.');
}
