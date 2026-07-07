// Fetch wrapper for the public /api/pay/* Worker proxy routes (design doc §7).
// No auth — these are customer-facing pages. Same VITE_CAPI_URL origin the
// rest of the site already calls (src/lib/tracker.js), never autolander.ai
// directly (that's GitHub Pages and has no /api/*).

const RAW_API_URL = import.meta.env.VITE_CAPI_URL || import.meta.env.VITE_CHAT_API_URL || '';
const API_URL = RAW_API_URL.replace(/\/+$/, '');

export class PayApiError extends Error {
  constructor(message, { status, reason, body } = {}) {
    super(message);
    this.status = status;
    this.reason = reason;
    this.body = body;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'omit',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new PayApiError(err?.message || 'Network error', { status: 0, reason: 'network_error' });
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    /* may be empty */
  }

  if (!response.ok) {
    const reason = json?.reason || `http_${response.status}`;
    throw new PayApiError(json?.message || reason, { status: response.status, reason, body: json });
  }

  return json;
}

export const getPaySummary = (token) => request(`/api/pay/${encodeURIComponent(token)}`);
export const openPaySession = (token, body) =>
  request(`/api/pay/${encodeURIComponent(token)}/session`, { method: 'POST', body });
export const openSelfServeSession = (body) => request('/api/pay/self-serve', { method: 'POST', body });

// Full-page navigation to the Stripe-hosted checkout URL. Kept as a plain
// module-level function (not inlined at the call site) so the redirect is a
// side effect owned outside component/hook scope rather than a direct
// window.location mutation inside a tracked callback body.
export function redirectToCheckout(url) {
  window.location.href = url;
}
