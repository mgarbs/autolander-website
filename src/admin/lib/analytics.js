import { apiGet, apiPost, apiPut } from './api.js';
import { normalizeFailureResponse } from './failure-diagnostics.js';
export { isOpsNotConfigured, OPS_SETUP_NOTE } from './ops.js';

const BASE = '/admin/analytics';

export async function fetchOverview() {
  const payload = await apiGet(`${BASE}/overview`);
  return payload?.overview && typeof payload.overview === 'object' ? payload.overview : payload || {};
}

export async function fetchAnalyticsMeta() {
  const payload = await apiGet(`${BASE}/meta`);
  return payload?.meta && typeof payload.meta === 'object' ? payload.meta : payload || {};
}

export async function fetchAccounts(params = {}) {
  const payload = await apiGet(`${BASE}/accounts${queryString(params)}`);
  return {
    rows: Array.isArray(payload?.rows) ? payload.rows : [],
    total: finiteNumber(payload?.total),
    limit: finiteNumber(payload?.limit, finiteNumber(params.limit, 25)),
    offset: finiteNumber(payload?.offset, finiteNumber(params.offset, 0)),
  };
}

export async function fetchAccount(orgId) {
  const payload = await apiGet(`${BASE}/accounts/${encodeURIComponent(orgId)}`);
  return payload?.account && typeof payload.account === 'object' ? payload.account : payload || {};
}

export async function fetchPostsDaily(orgId, days = 30) {
  const payload = await apiGet(
    `${BASE}/accounts/${encodeURIComponent(orgId)}/posts-daily?days=${encodeURIComponent(days)}`,
  );
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.days)) return payload.days;
  return [];
}

export async function fetchTickets(orgId) {
  const payload = await apiGet(`${BASE}/accounts/${encodeURIComponent(orgId)}/tickets?limit=10&offset=0`);
  return {
    rows: Array.isArray(payload?.rows) ? payload.rows : Array.isArray(payload?.tickets) ? payload.tickets : [],
    total: finiteNumber(payload?.total),
    limit: finiteNumber(payload?.limit, 10),
    offset: finiteNumber(payload?.offset, 0),
    sheetUrl: text(payload?.sheetUrl),
  };
}

export async function fetchAccountFailures(orgId, params = {}) {
  const request = {
    days: params.days ?? 30,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  };
  const payload = await apiGet(
    `${BASE}/accounts/${encodeURIComponent(orgId)}/failures${queryString(request)}`,
  );
  return normalizeFailureResponse(payload, request);
}

export function saveNote(orgId, note) {
  return apiPost(`${BASE}/accounts/${encodeURIComponent(orgId)}/notes`, note);
}

export function saveCsMeta(orgId, meta) {
  return apiPut(`${BASE}/accounts/${encodeURIComponent(orgId)}/cs`, meta);
}

function queryString(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue;
    query.set(key, String(value));
  }
  const value = query.toString();
  return value ? `?${value}` : '';
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function text(value) {
  return value === undefined || value === null ? '' : String(value);
}
