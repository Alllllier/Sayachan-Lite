export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const SESSION_TOKEN_KEY = 'sayachan_session_token'

type ApiHeaderMap = Record<string, string>
type FetchOptions = NonNullable<Parameters<typeof fetch>[1]>
type ApiFetchOptions = Omit<FetchOptions, 'headers'> & {
  headers?: ApiHeaderMap
}

function getStorage(): Storage | undefined {
  return globalThis.localStorage
}

export function getAuthToken(): string | null {
  return getStorage()?.getItem(SESSION_TOKEN_KEY) || null
}

export function setAuthToken(token: string | null | undefined): void {
  if (token) {
    getStorage()?.setItem(SESSION_TOKEN_KEY, token)
  }
}

export function clearAuthToken(): void {
  getStorage()?.removeItem(SESSION_TOKEN_KEY)
}

export function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const authToken = getAuthToken()
  const headers: ApiHeaderMap = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  }
  const fetchOptions: FetchOptions = {
    ...options,
    credentials: 'include'
  }

  if (Object.keys(headers).length > 0) {
    fetchOptions.headers = headers
  }

  return fetch(url, fetchOptions)
}
