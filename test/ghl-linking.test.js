import assert from 'node:assert/strict';
import test from 'node:test';
import {
  handleGhlOpportunitySearch,
  normalizeGhlOpportunity,
} from '../worker/src/admin/ghl-linking.js';

const ENV = {
  GHL_PRIVATE_INTEGRATION_TOKEN: 'server-secret-token',
  GHL_LOCATION_ID: 'location_123',
};

test('normalizes only canonical opportunity/contact pairs from the configured location', () => {
  const result = normalizeGhlOpportunity({
    id: 'opp_123',
    locationId: 'location_123',
    name: 'Example Motors - Dealer Plan',
    assignedTo: 'user_123',
    status: 'open',
    pipelineId: 'pipeline_123',
    pipelineStageId: 'stage_123',
    contact: {
      id: 'contact_123',
      name: 'Jamie Buyer',
      firstName: 'Jamie',
      lastName: 'Buyer',
      companyName: 'Example Motors',
      email: 'buyer@example.com',
      phone: '+15555550123',
    },
  }, 'location_123');

  assert.deepEqual(result, {
    opportunityId: 'opp_123',
    contactId: 'contact_123',
    assignedSalesRepId: 'user_123',
    opportunityName: 'Example Motors - Dealer Plan',
    contactName: 'Jamie Buyer',
    businessName: 'Example Motors',
    email: 'buyer@example.com',
    phone: '+15555550123',
    status: 'open',
    pipelineId: 'pipeline_123',
    pipelineStageId: 'stage_123',
    crmSnapshot: {
      email: 'buyer@example.com',
      phone: '+15555550123',
      firstName: 'Jamie',
      lastName: 'Buyer',
      businessName: 'Example Motors',
    },
  });

  assert.equal(normalizeGhlOpportunity({ id: 'opp', contactId: 'contact', locationId: 'other' }, 'location_123'), null);
  assert.equal(normalizeGhlOpportunity({ id: 'opp', locationId: 'location_123' }, 'location_123'), null);
});

test('server search keeps the token private, scopes the location, and filters malformed rows', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({
      opportunities: [
        {
          id: 'opp_123',
          locationId: 'location_123',
          contactId: 'contact_123',
          name: 'Example Motors',
          contact: { id: 'contact_123', email: 'buyer@example.com' },
        },
        { id: 'missing-contact' },
        { id: 'wrong-location', contactId: 'contact_2', locationId: 'location_999' },
      ],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  const result = await handleGhlOpportunitySearch(
    new URL('https://autolander.ai/admin-api/ghl/opportunities?q=Example'),
    ENV,
  );

  assert.equal(result.status, 200);
  assert.equal(result.body.results.length, 1);
  assert.equal(result.body.results[0].opportunityId, 'opp_123');
  assert.equal(calls.length, 1);
  const calledUrl = new URL(calls[0].url);
  assert.equal(calledUrl.pathname, '/opportunities/search');
  assert.equal(calledUrl.searchParams.get('location_id'), 'location_123');
  assert.equal(calledUrl.searchParams.get('q'), 'Example');
  assert.equal(calledUrl.searchParams.has('query'), false);
  assert.equal(calls[0].init.headers.Authorization, 'Bearer server-secret-token');
  assert.equal(JSON.stringify(result.body).includes('server-secret-token'), false);
});

test('GHL free-text lookup is capped at the upstream 75-character limit', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url) => {
    calls.push(String(url));
    return new Response(JSON.stringify({ opportunities: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  const result = await handleGhlOpportunitySearch(
    new URL(`https://autolander.ai/admin-api/ghl/opportunities?q=${'a'.repeat(100)}`),
    ENV,
  );

  assert.equal(result.status, 200);
  assert.equal(new URL(calls[0]).searchParams.get('q'), 'a'.repeat(75));
});

test('short queries and missing server configuration fail before any GHL request', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('fetch should not run');
  });

  const short = await handleGhlOpportunitySearch(
    new URL('https://autolander.ai/admin-api/ghl/opportunities?q=ab'),
    ENV,
  );
  const missing = await handleGhlOpportunitySearch(
    new URL('https://autolander.ai/admin-api/ghl/opportunities?q=Example'),
    {},
  );

  assert.equal(short.status, 400);
  assert.equal(short.body.reason, 'query_too_short');
  assert.equal(missing.status, 503);
  assert.equal(missing.body.reason, 'ghl_not_configured');
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('GHL authorization errors are normalized without leaking the upstream body', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(
    JSON.stringify({ message: 'secret diagnostic' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } },
  ));

  const result = await handleGhlOpportunitySearch(
    new URL('https://autolander.ai/admin-api/ghl/opportunities?q=Example'),
    ENV,
  );
  assert.deepEqual(result, {
    status: 502,
    body: { ok: false, reason: 'ghl_token_rejected' },
  });
});
