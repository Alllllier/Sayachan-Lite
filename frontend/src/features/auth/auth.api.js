// @ts-check
import { apiFetch, clearAuthToken, setAuthToken } from '../../services/apiClient'

/**
 * @typedef {Record<string, unknown>} JsonObject
 * @typedef {{ error?: string, sessionToken?: string, user?: unknown }} AuthResponseBody
 * @typedef {{ email: string, password: string }} LoginCredentials
 * @typedef {{ email: string, password: string, inviteCode: string }} RegisterTesterPayload
 * @typedef {JsonObject} BootstrapOwnerPayload
 */

/**
 * @param {Response} response
 * @param {string} errorMessage
 * @returns {Promise<unknown>}
 */
async function parseJsonResponse(response, errorMessage) {
  if (!response.ok) {
    let message = errorMessage
    try {
      /** @type {AuthResponseBody} */
      const body = await response.json()
      message = body.error || message
    } catch {
      message = errorMessage
    }
    throw new Error(message || `Auth request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

/**
 * @returns {Promise<unknown>}
 */
export async function fetchCurrentUser() {
  const response = await apiFetch('/auth/me')
  return parseJsonResponse(response, 'Fetch current user failed')
}

/**
 * @param {LoginCredentials} credentials
 * @returns {Promise<unknown>}
 */
export async function login(credentials) {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
  const result = /** @type {AuthResponseBody | null} */ (await parseJsonResponse(response, 'Login failed'))
  if (result?.sessionToken) {
    setAuthToken(result.sessionToken)
    return result.user
  }
  return result
}

/**
 * @returns {Promise<unknown>}
 */
export async function logout() {
  try {
    const response = await apiFetch('/auth/logout', { method: 'POST' })
    return await parseJsonResponse(response, 'Logout failed')
  } finally {
    clearAuthToken()
  }
}

/**
 * @param {RegisterTesterPayload} payload
 * @returns {Promise<unknown>}
 */
export async function registerTester(payload) {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return parseJsonResponse(response, 'Registration failed')
}

/**
 * @param {BootstrapOwnerPayload} payload
 * @returns {Promise<unknown>}
 */
export async function bootstrapOwner(payload) {
  const response = await apiFetch('/auth/bootstrap-owner', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return parseJsonResponse(response, 'Owner bootstrap failed')
}

/**
 * @returns {Promise<unknown>}
 */
export async function createInvite() {
  const response = await apiFetch('/owner/invites', { method: 'POST' })
  return parseJsonResponse(response, 'Create invite failed')
}

/**
 * @returns {Promise<unknown>}
 */
export async function fetchInvites() {
  const response = await apiFetch('/owner/invites')
  return parseJsonResponse(response, 'Fetch invites failed')
}

/**
 * @param {string} inviteId
 * @returns {Promise<unknown>}
 */
export async function revokeInvite(inviteId) {
  const response = await apiFetch(`/owner/invites/${inviteId}/revoke`, { method: 'POST' })
  return parseJsonResponse(response, 'Revoke invite failed')
}

/**
 * @returns {Promise<unknown>}
 */
export async function fetchTesters() {
  const response = await apiFetch('/owner/testers')
  return parseJsonResponse(response, 'Fetch testers failed')
}

/**
 * @param {string} testerId
 * @returns {Promise<unknown>}
 */
export async function disableTester(testerId) {
  const response = await apiFetch(`/owner/testers/${testerId}/disable`, { method: 'POST' })
  return parseJsonResponse(response, 'Disable tester failed')
}

/**
 * @param {string} testerId
 * @returns {Promise<unknown>}
 */
export async function restoreTester(testerId) {
  const response = await apiFetch(`/owner/testers/${testerId}/restore`, { method: 'POST' })
  return parseJsonResponse(response, 'Restore tester failed')
}

/**
 * @returns {Promise<unknown>}
 */
export async function fetchSystemStatus() {
  const response = await apiFetch('/owner/system-status')
  return parseJsonResponse(response, 'Fetch system status failed')
}
