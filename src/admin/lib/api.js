const RUNTIME_ENV = import.meta.env || {};
const RAW_API_URL = RUNTIME_ENV.VITE_CAPI_URL || RUNTIME_ENV.VITE_CHAT_API_URL || '';
const API_URL = RAW_API_URL.replace(/\/+$/, '');

class ApiError extends Error {
  constructor(message, {
    status,
    reason,
    code,
    param,
    requestId,
    stage,
    serverMessage,
  } = {}) {
    super(message);
    this.status = status;
    this.reason = reason;
    this.code = code;
    this.param = param;
    this.requestId = requestId;
    this.stage = stage;
    this.serverMessage = serverMessage;
  }
}

let sessionToken = '';

export function getStoredToken() {
  return sessionToken;
}

export function setStoredToken(token) {
  sessionToken = token || '';
}

async function request(path, { method = 'GET', body, signal } = {}) {
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
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
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
    const message = typeof json?.message === 'string' && json.message.trim()
      ? json.message.trim().slice(0, 500)
      : reason;
    // Keep the historical error.message contract for every admin consumer.
    // Billing UI code can opt into the sanitized server diagnostic through
    // serverMessage without broadening error exposure on login or other pages.
    throw new ApiError(reason, {
      status: response.status,
      reason,
      code: typeof json?.code === 'string' ? json.code.slice(0, 100) : undefined,
      param: typeof json?.param === 'string' ? json.param.slice(0, 200) : undefined,
      requestId: typeof json?.requestId === 'string' ? json.requestId.slice(0, 200) : undefined,
      stage: typeof json?.stage === 'string' ? json.stage.slice(0, 100) : undefined,
      serverMessage: message,
    });
  }

  return json;
}

export const apiGet = (path, options = {}) => request(path, { ...options, method: 'GET' });
export const apiPost = (path, body) => request(path, { method: 'POST', body });
export const apiPut = (path, body) => request(path, { method: 'PUT', body });
export { ApiError, API_URL };
