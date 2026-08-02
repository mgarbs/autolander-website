// Admin-only proxy to the AutoLander cloud customer-activity endpoints.
// OPS_ADMIN_TOKEN remains in Worker secrets: browser -> authenticated Worker
// -> cloud /api/ops/analytics/*.

const DEFAULT_CLOUD_URL = 'https://autolander-cloud.onrender.com';

function cloudBase(env) {
  return String(env.AUTOLANDER_CLOUD_URL || DEFAULT_CLOUD_URL).replace(/\/+$/, '');
}

function notConfigured() {
  return { status: 503, body: { ok: false, reason: 'ops_not_configured' } };
}

export async function handleAnalyticsProxy(request, url, env, suffix) {
  if (!env.OPS_ADMIN_TOKEN) return notConfigured();

  const method = request.method.toUpperCase();
  const body = method === 'POST' || method === 'PUT' ? await safeJson(request) : undefined;
  const target = `${cloudBase(env)}/api/ops/analytics${suffix}${url.search || ''}`;

  let response;
  try {
    response = await fetch(target, {
      method,
      headers: {
        Authorization: `Bearer ${env.OPS_ADMIN_TOKEN}`,
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: method === 'GET' ? request.signal : undefined,
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

  if (response.status === 503 && (json?.error === 'ops_disabled' || json?.reason === 'ops_disabled')) {
    return notConfigured();
  }

  if (response.status === 401 || response.status === 403) {
    return { status: 502, body: { ok: false, reason: 'ops_token_rejected' } };
  }

  if (json === null || typeof json !== 'object') {
    return { status: 502, body: { ok: false, reason: 'cloud_bad_response' } };
  }

  if (!response.ok && !json.reason) {
    return {
      status: response.status,
      body: { ok: false, reason: String(json.error || `cloud_http_${response.status}`).slice(0, 200), ...json },
    };
  }

  return { status: response.status, body: json };
}

async function safeJson(request) {
  try {
    return (await request.json()) || {};
  } catch {
    return {};
  }
}
