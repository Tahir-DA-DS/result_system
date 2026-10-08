// The one place that talks to the backend: adds the token, reports slow responses, turns failures into errors.
import { API_URL } from '../config.js';
import { session } from '../state/session.js';

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (session.token) headers.Authorization = 'Bearer ' + session.token;

  // The free server sleeps when idle; tell the UI if a request is taking long so it can show a message.
  const slow = setTimeout(() => dispatchEvent(new CustomEvent('api:slow', { detail: true })), 4000);
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Cannot reach the server. Check your internet connection and try again.', 0);
  } finally {
    clearTimeout(slow);
    dispatchEvent(new CustomEvent('api:slow', { detail: false }));
  }

  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && session.token) { session.clear(); dispatchEvent(new Event('session:expired')); }
  if (!res.ok) throw new ApiError(data.error || 'Something went wrong', res.status);
  return data;
}
