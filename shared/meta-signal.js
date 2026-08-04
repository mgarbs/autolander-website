const PRODUCTION_META_HOSTNAMES = Object.freeze([
  'autolander.ai',
  'www.autolander.ai',
]);

const PRODUCTION_META_ORIGINS = Object.freeze([
  'https://autolander.ai',
  'https://www.autolander.ai',
]);

const VISITOR_ID_PATTERN = /^v_[a-z0-9]{12,40}$/i;

export function isProductionMetaHostname(value) {
  const hostname = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return PRODUCTION_META_HOSTNAMES.includes(hostname);
}

export function isProductionMetaUrl(value) {
  try {
    const url = new URL(value);
    return PRODUCTION_META_ORIGINS.includes(url.origin);
  } catch {
    return false;
  }
}

export function isProductionMetaRequest(request, { requireOrigin = true } = {}) {
  if (!request || !isProductionMetaUrl(request.url)) return false;
  const origin = request.headers?.get?.('Origin') || '';
  if (!origin) return !requireOrigin;
  return isProductionMetaUrl(origin);
}

export function canonicalMetaExternalId(pixelId, visitorId) {
  const pixel = String(pixelId || '').trim();
  const visitor = String(visitorId || '').trim().toLowerCase();
  if (!pixel || !VISITOR_ID_PATTERN.test(visitor)) return '';
  return `${pixel}:${visitor}`;
}

export function isCanonicalMetaExternalId(value, pixelId) {
  const externalId = typeof value === 'string' ? value.trim().toLowerCase() : '';
  const separator = externalId.indexOf(':');
  if (separator < 1) return false;
  const visitorId = externalId.slice(separator + 1);
  return externalId === canonicalMetaExternalId(pixelId, visitorId);
}
