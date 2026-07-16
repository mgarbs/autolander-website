const RUNTIME_ENV = import.meta.env || {};
const RAW_API_URL = RUNTIME_ENV.VITE_CAPI_URL || RUNTIME_ENV.VITE_CHAT_API_URL || '';
const API_URL = RAW_API_URL.replace(/\/+$/, '');

class ApiError extends Error {
  constructor(message, { status, reason } = {}) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

let sessionToken = '';

export function getStoredToken() {
  return sessionToken;
}

export function setStoredToken(token) {
  sessionToken = token || '';
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getStoredToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const workerPath = path.replace(/^\/admin(?=\/|$)/, '/admin-api');

  let response;
  try {
    response = await fetch(`${API_URL}${workerPath}`, {
      method,
      credentials: 'include',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(err?.message || 'Network error', { status: 0 });
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    /* may be empty */
  }

  if (!response.ok) {
    const reason = json?.reason || `http_${response.status}`;
    throw new ApiError(reason, { status: response.status, reason });
  }

  return json;
}

export const apiGet = (path) => request(path, { method: 'GET' });
export const apiPost = (path, body) => request(path, { method: 'POST', body });
export { ApiError, API_URL };
