import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchAllAccountFailures } from '../src/admin/lib/analytics.js';

test('loads every account failure page up to the explicit safety cap', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url) => {
    const parsed = new URL(String(url), 'https://admin.example.test');
    requests.push({
      offset: Number(parsed.searchParams.get('offset')),
      limit: Number(parsed.searchParams.get('limit')),
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
      { offset: 0, limit: 2 },
      { offset: 2, limit: 2 },
      { offset: 4, limit: 2 },
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
      { offset: 0, limit: 2 },
      { offset: 2, limit: 1 },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
