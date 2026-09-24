// Public pay-page proxy to the AutoLander cloud billing-link endpoints
// (packages/cloud). No secrets are required here — /api/pay/:token and
// /api/pay/self-serve are public by design (a customer opens them with no
// login). We only enrich the attribution object the browser sends with
// server-observed fields the browser can't see itself (CF-Connecting-IP,
// User-Agent), then forward same-path to the cloud. Mirrors the proxy
// pattern in admin/ops-linking.js, minus the bearer token.

const DEFAULT_CLOUD_URL = 'https://autolander-cloud.onrender.com';
const FETCH_TIMEOUT_MS = 10000;
// Stripe Checkout Session id (`cs_live_…` / `cs_test_…`). Same pattern as the cloud's
// services/billing-links.js and the client's src/pay/lib/checkout-session.js — change all three
// together if Stripe ever changes its id format.
const CHECKOUT_SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]{1,250}$/;

function cloudBase(env) {
  return String(env.AUTOLANDER_CLOUD_URL || DEFAULT_CLOUD_URL).replace(/\/+$/, '');
}

async function proxyToCloud(env, path, { method = 'GET', body, search = '' } = {}) {
  const url = `${cloudBase(env)}${path}${search}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err?.name === 'AbortError';
    return {
      status: 502,
      body: {
        ok: false,
        reason: timedOut ? 'cloud_timeout' : 'cloud_unreachable',
        message: String(err?.message || err).slice(0, 200),
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }

  const json = await response.json().catch(() => null);
  if (json === null || typeof json !== 'object') {
    return { status: 502, body: { ok: false, reason: 'cloud_bad_response' } };
  }

  return { status: response.status, body: json };
}

// Enrich the attribution object with server-observed fields the browser
// cannot see itself. Never overwrite a value the browser already sent
// (defense-in-depth only — client_ip/user_agent aren't browser-settable
// on a same-shape request anyway).
function enrichAttribution(request, rawBody) {
  const body = rawBody && typeof rawBody === 'object' ? rawBody : {};
  const attribution = body.attribution && typeof body.attribution === 'object' ? body.attribution : {};
  const clientIp = request.headers.get('CF-Connecting-IP') || '';
  const userAgent = request.headers.get('User-Agent') || '';

  return {
    ...body,
    attribution: {
      ...attribution,
      ...(clientIp && !attribution.client_ip ? { client_ip: clientIp } : {}),
      ...(userAgent && !attribution.user_agent ? { user_agent: userAgent } : {}),
    },
  };
}

// GET /api/pay/:token[?session_id=cs_…] -> GET {cloud}/api/pay/:token[?session_id=cs_…]
// Only a well-formed Checkout Session id is ever forwarded (the cloud reveals the payer e-mail on
// the success page only when that id belongs to the link); no other client query reaches the
// cloud. A missing or malformed id is dropped, which is exactly today's request.
export async function getPaySummary(env, token, { sessionId = '' } = {}) {
  const search = typeof sessionId === 'string' && CHECKOUT_SESSION_ID_PATTERN.test(sessionId)
    ? `?session_id=${encodeURIComponent(sessionId)}`
    : '';
  return proxyToCloud(env, `/api/pay/${encodeURIComponent(token)}`, { search });
}

// POST /api/pay/:token/session -> POST {cloud}/api/pay/:token/session
export async function openPaySession(env, request, token) {
  const raw = await safeJson(request);
  const body = enrichAttribution(request, raw);
  return proxyToCloud(env, `/api/pay/${encodeURIComponent(token)}/session`, { method: 'POST', body });
}

// POST /api/pay/self-serve -> POST {cloud}/api/pay/self-serve
export async function openSelfServeSession(env, request) {
  const raw = await safeJson(request);
  const body = enrichAttribution(request, raw);
  return proxyToCloud(env, '/api/pay/self-serve', { method: 'POST', body });
}

async function safeJson(request) {
  try {
    return (await request.json()) || {};
  } catch {
    return {};
  }
}
