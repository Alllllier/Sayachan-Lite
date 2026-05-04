export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const SESSION_TOKEN_KEY = 'sayachan_session_token'

function getStorage() {
  return globalThis.localStorage
}

export function getAuthToken() {
  return getStorage()?.getItem(SESSION_TOKEN_KEY) || null
}

export function setAuthToken(token) {
  if (token) {
    getStorage()?.setItem(SESSION_TOKEN_KEY, token)
  }
}

export function clearAuthToken() {
  getStorage()?.removeItem(SESSION_TOKEN_KEY)
}

export function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const authToken = getAuthToken()
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  }
  const fetchOptions = {
    ...options,
    credentials: 'include'
  }

  if (Object.keys(headers).length > 0) {
    fetchOptions.headers = headers
  }

  return fetch(url, fetchOptions)
}
