// Admin-only proxy to the AutoLander cloud centralized billing-link endpoints
// (POST/GET /api/billing-links, GET /api/billing-links/:id, disable, recreate).
// The browser never sees OPS_ADMIN_TOKEN — every call goes browser -> Worker
// (admin session required in router.js) -> cloud with the server-side token.
// Mirrors admin/ops-linking.js exactly.

const DEFAULT_CLOUD_URL = 'https://autolander-cloud.onrender.com';

function cloudBase(env) {
  return String(env.AUTOLANDER_CLOUD_URL || DEFAULT_CLOUD_URL).replace(/\/+$/, '');
}

function notConfigured() {
  return { status: 503, body: { ok: false, reason: 'ops_not_configured' } };
}

async function proxyBillingLinks(env, path, { search = '', method = 'GET', body } = {}) {
  if (!env.OPS_ADMIN_TOKEN) return notConfigured();

  const url = `${cloudBase(env)}/api/billing-links${path}${search}`;
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${env.OPS_ADMIN_TOKEN}`,
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    return {
      status: 502,
      body: {
        ok: false,
        reason: 'cloud_unreachable',
        message: String(err?.message || err).slice(0, 200),
      },
    };
  }

  const json = await response.json().catch(() => null);

  // The cloud answers 503 {error:'ops_disabled'} when its own env is unset —
  // same convention as /api/ops/billing/*. Surface it as the same clear flag
  // as a missing Worker token so the UI can show one setup note.
  if (response.status === 503 && (json?.error === 'ops_disabled' || json?.reason === 'ops_disabled')) {
    return notConfigured();
  }

  if (json === null || typeof json !== 'object') {
    return { status: 502, body: { ok: false, reason: 'cloud_bad_response' } };
  }

  // A cloud 401/403 means OUR server-side token is wrong — not the admin's
  // session. Re-status it so the SPA cannot mistake it for a logged-out state.
  if (response.status === 401 || response.status === 403) {
    return { status: 502, body: { ok: false, reason: 'ops_token_rejected' } };
  }

  if (!response.ok && !json.reason) {
    return {
      status: response.status,
      body: { ok: false, reason: String(json.error || `cloud_http_${response.status}`).slice(0, 200), ...json },
    };
  }

  return { status: response.status, body: json };
}

export function handleBillingLinksList(url, env) {
  return proxyBillingLinks(env, '', { search: url.search || '' });
}

export async function handleBillingLinksCreate(request, env) {
  const body = await safeJson(request);
  return proxyBillingLinks(env, '', { method: 'POST', body });
}

export function handleBillingLinkDetail(env, id) {
  if (!id) {
    return Promise.resolve({ status: 400, body: { ok: false, reason: 'missing_id' } });
  }
  return proxyBillingLinks(env, `/${encodeURIComponent(id)}`);
}

export function handleBillingLinkDisable(env, id) {
  if (!id) {
    return Promise.resolve({ status: 400, body: { ok: false, reason: 'missing_id' } });
  }
  return proxyBillingLinks(env, `/${encodeURIComponent(id)}/disable`, { method: 'POST', body: {} });
}

export function handleBillingLinkRecreate(env, id) {
  if (!id) {
    return Promise.resolve({ status: 400, body: { ok: false, reason: 'missing_id' } });
  }
  return proxyBillingLinks(env, `/${encodeURIComponent(id)}/recreate`, { method: 'POST', body: {} });
}

async function safeJson(request) {
  try {
    return (await request.json()) || {};
  } catch {
    return {};
  }
}
