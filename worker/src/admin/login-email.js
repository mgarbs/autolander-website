// The ops token and audit actor are supplied only by the authenticated Worker.
// Writes never forward the browser abort signal: the cloud finishes a write the
// browser stopped waiting for (same rule as analytics.js).
const DEFAULT_CLOUD_URL = 'https://autolander-cloud.onrender.com';

function cloudBase(env) {
  return String(env.AUTOLANDER_CLOUD_URL || DEFAULT_CLOUD_URL).replace(/\/+$/, '');
}

function notConfigured() {
  return { status: 503, body: { ok: false, reason: 'ops_not_configured' } };
}

export async function proxyLoginEmail(
  env,
  path,
  { method = 'GET', search = '', body, signal } = {},
) {
  if (!env.OPS_ADMIN_TOKEN) return notConfigured();

  const url = `${cloudBase(env)}/api/ops/login-email${path}${search}`;
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
  if (response.status === 503 && (json?.error === 'ops_disabled' || json?.reason === 'ops_disabled')) {
    return notConfigured();
  }
  if (json === null || typeof json !== 'object') {
    return { status: 502, body: { ok: false, reason: 'cloud_bad_response' } };
  }
  if (response.status === 401 || response.status === 403) {
    return { status: 502, body: { ok: false, reason: 'ops_token_rejected' } };
  }
  if (!response.ok && !json.reason) {
    // api.js exposes reason, while cloud service refusals carry a reasons array.
    return {
      status: response.status,
      body: {
        ...json,
        ok: false,
        reason: String(json.reasons?.[0] || json.error || `cloud_http_${response.status}`).slice(0, 200),
      },
    };
  }
  return { status: response.status, body: json };
}

export function buildActor(request, auth) {
  const actor = {};
  const { uid, exp } = auth?.session || {};
  const sessionId = auth?.sessionId;
  const ip = request.headers.get('CF-Connecting-IP');
  if (typeof uid === 'string' && /^[A-Za-z0-9_-]{1,32}$/.test(uid)) actor.uid = uid;
  if (typeof sessionId === 'string' && /^[a-f0-9]{16,64}$/.test(sessionId)) actor.sessionId = sessionId;
  if (Number.isInteger(exp) && exp >= 1e9 && exp <= 1e10) actor.sessionExp = exp;
  if (typeof ip === 'string' && /^[0-9A-Fa-f:.]{2,45}$/.test(ip)) actor.ip = ip;
  return actor;
}

export function handleLoginEmailStatus(request, url, env) {
  const params = new URLSearchParams();
  for (const key of ['orgId', 'userId']) {
    if (url.searchParams.has(key)) params.set(key, url.searchParams.get(key));
  }
  return proxyLoginEmail(env, '/status', {
    search: `?${params.toString()}`,
    signal: request.signal,
  });
}

export async function handleLoginEmailStart(request, env, auth) {
  const raw = await safeJson(request);
  return proxyLoginEmail(env, '/start', {
    method: 'POST',
    body: {
      orgId: raw.orgId,
      userId: raw.userId,
      expectCurrentEmail: raw.expectCurrentEmail,
      newEmail: raw.newEmail,
      verification: {
        method: raw.verification?.method,
        phoneAttested: raw.verification?.phoneAttested,
        cardLast4: raw.verification?.cardLast4,
      },
      by: raw.by,
      note: raw.note,
      actor: buildActor(request, auth),
      ...(raw.apply === true ? { apply: true } : {}),
    },
  });
}

export async function handleLoginEmailCancel(request, env, auth) {
  const raw = await safeJson(request);
  return proxyLoginEmail(env, '/cancel', {
    method: 'POST',
    body: {
      orgId: raw.orgId,
      userId: raw.userId,
      pendingId: raw.pendingId,
      by: raw.by,
      actor: buildActor(request, auth),
      ...(raw.apply === true ? { apply: true } : {}),
    },
  });
}

export async function handleLoginEmailSendReset(request, env, auth) {
  const raw = await safeJson(request);
  return proxyLoginEmail(env, '/send-reset', {
    method: 'POST',
    body: {
      orgId: raw.orgId,
      userId: raw.userId,
      expectCurrentEmail: raw.expectCurrentEmail,
      by: raw.by,
      actor: buildActor(request, auth),
      ...(raw.apply === true ? { apply: true } : {}),
    },
  });
}

async function safeJson(request) {
  try {
    return (await request.json()) || {};
  } catch {
    return {};
  }
}
