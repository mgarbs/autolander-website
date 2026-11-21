// Dealership rename from the admin dashboard (Notion #198, 2026-11-21).
// The AI sales replies sign with the dealership name, so a rep who moved stores kept
// the old one (#186, "Classic Chevrolet"). Clay renames the account here; the Worker
// forwards to the cloud lever POST /api/ops/orgs/rename with the server-only ops token.
//
// Same rules as login-email.js: the ops token and the audit actor come only from the
// Worker (never from the browser body), the body is a fixed whitelist, apply happens
// only for the literal boolean true (dry-run otherwise), and a write never forwards the
// browser abort signal (the cloud finishes a write the browser stopped waiting for).
import { buildActor } from './login-email.js';

const DEFAULT_CLOUD_URL = 'https://autolander-cloud.onrender.com';

function cloudBase(env) {
  return String(env.AUTOLANDER_CLOUD_URL || DEFAULT_CLOUD_URL).replace(/\/+$/, '');
}

function notConfigured() {
  return { status: 503, body: { ok: false, reason: 'ops_not_configured' } };
}

export async function proxyOrgRename(env, body) {
  if (!env.OPS_ADMIN_TOKEN) return notConfigured();

  let response;
  try {
    response = await fetch(`${cloudBase(env)}/api/ops/orgs/rename`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPS_ADMIN_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      status: 502,
      body: { ok: false, reason: 'cloud_unreachable', message: String(err?.message || err).slice(0, 200) },
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
    // The cloud lever answers { error, reasons: [...] } or { error, message }.
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

export async function handleOrgRename(request, env, auth) {
  const raw = await safeJson(request);
  return proxyOrgRename(env, {
    orgId: raw.orgId,
    expectCurrentName: raw.expectCurrentName,
    name: raw.name,
    by: raw.by,
    actor: buildActor(request, auth),
    ...(raw.apply === true ? { apply: true } : {}),
  });
}

async function safeJson(request) {
  try {
    return (await request.json()) || {};
  } catch {
    return {};
  }
}
