const DEFAULT_GHL_URL = 'https://services.leadconnectorhq.com';
const DEFAULT_GHL_VERSION = '2021-07-28';
const LOOKUP_TIMEOUT_MS = 10000;

function text(value, maxLength = 500) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function config(env) {
  const token = text(
    env.GHL_PRIVATE_INTEGRATION_TOKEN
      || env.GHL_API_TOKEN
      || env.HIGHLEVEL_API_TOKEN,
    2000,
  );
  const locationId = text(env.GHL_LOCATION_ID, 200);
  const missing = [];
  if (!token) missing.push('GHL_PRIVATE_INTEGRATION_TOKEN');
  if (!locationId) missing.push('GHL_LOCATION_ID');
  return { ok: missing.length === 0, token, locationId, missing };
}

function rowsFromResponse(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.opportunities)) return body.opportunities;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.opportunities)) return body.data.opportunities;
  return [];
}

function pickSnapshot(contact) {
  const fields = {
    email: contact?.email,
    phone: contact?.phone,
    firstName: contact?.firstName,
    lastName: contact?.lastName,
    businessName: contact?.companyName ?? contact?.company,
    website: contact?.website,
  };
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalized = text(value);
    if (normalized) out[key] = normalized;
  }
  return out;
}

export function normalizeGhlOpportunity(row, expectedLocationId) {
  if (!row || typeof row !== 'object') return null;
  const contact = row.contact && typeof row.contact === 'object' ? row.contact : {};
  const opportunityId = text(row.id ?? row.opportunityId, 200);
  const contactId = text(row.contactId ?? contact.id ?? contact.contactId, 200);
  if (!opportunityId || !contactId) return null;

  const locationId = text(row.locationId ?? contact.locationId, 200);
  if (locationId && locationId !== expectedLocationId) return null;

  const firstName = text(contact.firstName);
  const lastName = text(contact.lastName);
  const crmSnapshot = pickSnapshot(contact);
  return {
    opportunityId,
    contactId,
    assignedSalesRepId: text(row.assignedTo ?? row.assignedUserId, 200),
    opportunityName: text(row.name),
    contactName: text(contact.name) || [firstName, lastName].filter(Boolean).join(' '),
    businessName: crmSnapshot.businessName || '',
    email: crmSnapshot.email || '',
    phone: crmSnapshot.phone || '',
    status: text(row.status, 40),
    pipelineId: text(row.pipelineId, 200),
    pipelineStageId: text(row.pipelineStageId, 200),
    crmSnapshot,
  };
}

export async function handleGhlOpportunitySearch(url, env) {
  // HighLevel's GET /opportunities/search contract calls this parameter `q`
  // and caps it at 75 characters. Keep the browser-facing query name aligned
  // with the upstream API instead of silently issuing an unfiltered search.
  const query = text(url.searchParams.get('q'), 75);
  if (query.length < 3) {
    return {
      status: 400,
      body: { ok: false, reason: 'query_too_short', message: 'Enter at least 3 characters.' },
    };
  }

  const ghl = config(env);
  if (!ghl.ok) {
    return {
      status: 503,
      body: { ok: false, reason: 'ghl_not_configured', missing: ghl.missing },
    };
  }

  const version = text(env.GHL_API_VERSION, 40) || DEFAULT_GHL_VERSION;
  const params = new URLSearchParams({ q: query, limit: '25', status: 'all' });
  params.set(version.toLowerCase() === 'v3' ? 'locationId' : 'location_id', ghl.locationId);
  const baseUrl = text(env.GHL_API_BASE_URL, 1000) || DEFAULT_GHL_URL;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, '')}/opportunities/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ghl.token}`,
        Version: version,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
  } catch (err) {
    return {
      status: 502,
      body: {
        ok: false,
        reason: err?.name === 'AbortError' ? 'ghl_timeout' : 'ghl_unreachable',
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      status: 502,
      body: {
        ok: false,
        reason: response.status === 401 || response.status === 403
          ? 'ghl_token_rejected'
          : 'ghl_lookup_failed',
      },
    };
  }
  if (!body || typeof body !== 'object') {
    return { status: 502, body: { ok: false, reason: 'ghl_bad_response' } };
  }

  const seen = new Set();
  const results = [];
  for (const row of rowsFromResponse(body)) {
    const normalized = normalizeGhlOpportunity(row, ghl.locationId);
    if (!normalized || seen.has(normalized.opportunityId)) continue;
    seen.add(normalized.opportunityId);
    results.push(normalized);
    if (results.length >= 25) break;
  }

  return { status: 200, body: { ok: true, results } };
}
