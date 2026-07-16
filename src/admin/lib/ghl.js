import { ApiError, apiGet } from './api.js';

export function isGhlLookupNotConfigured(err) {
  return err instanceof ApiError && err.reason === 'ghl_not_configured';
}

export async function searchGhlOpportunities(query) {
  const q = String(query || '').trim();
  const payload = await apiGet(`/admin/ghl/opportunities?q=${encodeURIComponent(q)}`);
  return normalizeGhlOpportunities(payload);
}

export function normalizeGhlOpportunities(payload) {
  const rows = firstArray(payload, ['results', 'opportunities', 'rows']);
  return rows
    .map((row) => {
      const crmSnapshot = row?.crmSnapshot && typeof row.crmSnapshot === 'object'
        ? row.crmSnapshot
        : {};
      return {
        opportunityId: text(row?.opportunityId ?? row?.id),
        contactId: text(row?.contactId),
        assignedSalesRepId: text(row?.assignedSalesRepId ?? row?.assignedTo),
        opportunityName: text(row?.opportunityName ?? row?.name),
        contactName: text(row?.contactName),
        businessName: text(row?.businessName ?? crmSnapshot.businessName),
        email: text(row?.email ?? crmSnapshot.email),
        phone: text(row?.phone ?? crmSnapshot.phone),
        status: text(row?.status),
        pipelineId: text(row?.pipelineId),
        pipelineStageId: text(row?.pipelineStageId),
        crmSnapshot: {
          ...pickText(crmSnapshot, ['email', 'phone', 'firstName', 'lastName', 'businessName', 'website']),
        },
      };
    })
    .filter((row) => row.opportunityId && row.contactId);
}

function firstArray(payload, keys) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function pickText(value, keys) {
  const out = {};
  for (const key of keys) {
    const normalized = text(value?.[key]);
    if (normalized) out[key] = normalized;
  }
  return out;
}

function text(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}
