// Admin-only proxy to AutoLander cloud support adjustment endpoints.
// The browser never sees OPS_ADMIN_TOKEN; every call goes browser -> Worker
// (admin session required in router.js) -> cloud with the server-side token.

const DEFAULT_CLOUD_URL = 'https://autolander-cloud.onrender.com';

function cloudBase(env) {
  return String(env.AUTOLANDER_CLOUD_URL || DEFAULT_CLOUD_URL).replace(/\/+$/, '');
}

function notConfigured() {
  return { status: 503, body: { ok: false, reason: 'ops_not_configured' } };
}

async function proxySupportAdjustments(env, path, { search = '', method = 'GET', body } = {}) {
  if (!env.OPS_ADMIN_TOKEN) return notConfigured();

  const url = `${cloudBase(env)}/api/ops/support-adjustments${path}${search}`;
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
    return {
      status: response.status,
      body: { ok: false, reason: String(json.error || `cloud_http_${response.status}`).slice(0, 200), ...json },
    };
  }

  return { status: response.status, body: json };
}

export function handleSupportAdjustmentCandidates(url, env) {
  return proxySupportAdjustments(env, '/candidates', { search: url.search || '' });
}

export async function handleSupportCreditGrant(request, env) {
  const raw = await safeJson(request);
  const orgId = normalizeText(raw.orgId);
  const amount = Number(raw.amount ?? raw.credits);
  const idempotencyKey = normalizeText(raw.idempotencyKey || raw.refId, 160);

  if (!orgId || !Number.isInteger(amount) || amount <= 0 || !idempotencyKey) {
    return {
      status: 400,
      body: { ok: false, reason: 'invalid_credit_grant', message: 'orgId, amount, and idempotencyKey are required.' },
    };
  }

  return proxySupportAdjustments(env, '/credits', {
    method: 'POST',
    body: {
      orgId,
      amount,
      idempotencyKey,
      ...(raw.note || raw.reason ? { note: normalizeText(raw.note || raw.reason, 500) } : {}),
    },
  });
}

export async function handleSupportDiscount(request, env) {
  const raw = await safeJson(request);
  const orgId = normalizeText(raw.orgId);
  const percentOff = Number(raw.percentOff ?? raw.percent);

  if (!orgId || !Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100) {
    return {
      status: 400,
      body: { ok: false, reason: 'invalid_discount', message: 'orgId and percentOff from 1 to 100 are required.' },
    };
  }

  return proxySupportAdjustments(env, '/discount', {
    method: 'POST',
    body: {
      orgId,
      percentOff,
      ...(raw.note || raw.reason ? { note: normalizeText(raw.note || raw.reason, 500) } : {}),
    },
  });
}

function normalizeText(value, maxLength = 200) {
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
