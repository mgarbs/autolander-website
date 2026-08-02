// Admin-only proxy to the AutoLander cloud ops billing endpoints.
// The browser never sees OPS_ADMIN_TOKEN — every call goes browser -> Worker
// (admin session required in router.js) -> cloud with the server-side token.

const DEFAULT_CLOUD_URL = 'https://autolander-cloud.onrender.com';

function cloudBase(env) {
  return String(env.AUTOLANDER_CLOUD_URL || DEFAULT_CLOUD_URL).replace(/\/+$/, '');
}

function notConfigured() {
  return { status: 503, body: { ok: false, reason: 'ops_not_configured' } };
}

async function proxyOps(env, path, { search = '', method = 'GET', body, signal } = {}) {
  if (!env.OPS_ADMIN_TOKEN) return notConfigured();

  const url = `${cloudBase(env)}/api/ops/billing${path}${search}`;
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
      signal,
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

  // The cloud answers 503 {error:'ops_disabled'} when its own env is unset.
  // Surface that as the same clear flag as a missing Worker token so the UI
  // can show one setup note.
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
    // Normalize cloud error payloads ({error: "..."}) into the {ok, reason}
    // shape the admin SPA's api client reads.
    return {
      status: response.status,
      body: { ok: false, reason: String(json.error || `cloud_http_${response.status}`).slice(0, 200), ...json },
    };
  }

  return { status: response.status, body: json };
}

export function handleOpsUnlinked(request, url, env) {
  return proxyOps(env, '/unlinked', { search: url.search || '', signal: request.signal });
}

export function handleOpsCandidates(request, url, env) {
  return proxyOps(env, '/candidates', { search: url.search || '', signal: request.signal });
}

export async function handleOpsLink(request, env) {
  const raw = await safeJson(request);
  const subscriptionId = normalizeId(raw.subscriptionId || raw.subId);
  const orgId = normalizeId(raw.orgId);

  if (!subscriptionId || !orgId) {
    return {
      status: 400,
      body: { ok: false, reason: 'invalid_link_request', message: 'subscriptionId and orgId are required.' },
    };
  }

  const body = {
    subscriptionId,
    orgId,
    ...(raw.plan ? { plan: normalizeId(raw.plan, 120) } : {}),
    ...(raw.force === true ? { force: true } : {}),
    // The cloud treats anything other than apply === true as a dry run.
    apply: raw.apply === true,
  };

  return proxyOps(env, '/link', { method: 'POST', body });
}

function normalizeId(value, maxLength = 200) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

async function safeJson(request) {
  try {
    return (await request.json()) || {};
  } catch {
    return {};
  }
}
