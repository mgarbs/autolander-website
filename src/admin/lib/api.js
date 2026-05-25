const RAW_API_URL = import.meta.env.VITE_CAPI_URL || import.meta.env.VITE_CHAT_API_URL || '';
const API_URL = RAW_API_URL.replace(/\/+$/, '');
const TOKEN_STORAGE_KEY = 'al_admin_token';

class ApiError extends Error {
  constructor(message, { status, reason } = {}) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

export function getStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

async function request(path, { method = 'GET', body } = {}) {
  if (!API_URL) {
    throw new ApiError('Admin API URL is not configured. Set VITE_CAPI_URL.', { status: 0 });
  }

  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getStoredToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
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
