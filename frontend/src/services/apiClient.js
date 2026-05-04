export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
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
