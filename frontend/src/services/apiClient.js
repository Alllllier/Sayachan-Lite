export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const SESSION_TOKEN_KEY = 'sayachan_session_token'

/**
 * @typedef {Record<string, string>} ApiHeaderMap
 * @typedef {Omit<RequestInit, 'headers'> & {
 *   headers?: ApiHeaderMap
 * }} ApiFetchOptions
 */

/**
 * @returns {Storage | undefined}
 */
function getStorage() {
  return globalThis.localStorage
}

/**
 * @returns {string | null}
 */
export function getAuthToken() {
  return getStorage()?.getItem(SESSION_TOKEN_KEY) || null
}

/**
 * @param {string | null | undefined} token
 * @returns {void}
 */
export function setAuthToken(token) {
  if (token) {
    getStorage()?.setItem(SESSION_TOKEN_KEY, token)
  }
}

/**
 * @returns {void}
 */
export function clearAuthToken() {
  getStorage()?.removeItem(SESSION_TOKEN_KEY)
}

/**
 * @param {string} path
 * @param {ApiFetchOptions} [options]
 * @returns {Promise<Response>}
 */
export function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const authToken = getAuthToken()
  /** @type {ApiHeaderMap} */
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  }
  /** @type {RequestInit} */
  const fetchOptions = {
    ...options,
    credentials: 'include'
  }

  if (Object.keys(headers).length > 0) {
    fetchOptions.headers = headers
  }

  return fetch(url, fetchOptions)
}
