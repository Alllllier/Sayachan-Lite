import { apiFetch, clearAuthToken, setAuthToken } from '../../services/apiClient'

async function parseJsonResponse(response, errorMessage) {
  if (!response.ok) {
    let message = errorMessage
    try {
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

export async function fetchCurrentUser() {
  const response = await apiFetch('/auth/me')
  return parseJsonResponse(response, 'Fetch current user failed')
}

export async function login(credentials) {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
  const result = await parseJsonResponse(response, 'Login failed')
  if (result?.sessionToken) {
    setAuthToken(result.sessionToken)
    return result.user
  }
  return result
}

export async function logout() {
  try {
    const response = await apiFetch('/auth/logout', { method: 'POST' })
    return await parseJsonResponse(response, 'Logout failed')
  } finally {
    clearAuthToken()
  }
}

export async function registerTester(payload) {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return parseJsonResponse(response, 'Registration failed')
}

export async function bootstrapOwner(payload) {
  const response = await apiFetch('/auth/bootstrap-owner', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return parseJsonResponse(response, 'Owner bootstrap failed')
}

export async function createInvite() {
  const response = await apiFetch('/owner/invites', { method: 'POST' })
  return parseJsonResponse(response, 'Create invite failed')
}

export async function fetchInvites() {
  const response = await apiFetch('/owner/invites')
  return parseJsonResponse(response, 'Fetch invites failed')
}

export async function revokeInvite(inviteId) {
  const response = await apiFetch(`/owner/invites/${inviteId}/revoke`, { method: 'POST' })
  return parseJsonResponse(response, 'Revoke invite failed')
}

export async function fetchTesters() {
  const response = await apiFetch('/owner/testers')
  return parseJsonResponse(response, 'Fetch testers failed')
}

export async function disableTester(testerId) {
  const response = await apiFetch(`/owner/testers/${testerId}/disable`, { method: 'POST' })
  return parseJsonResponse(response, 'Disable tester failed')
}

export async function restoreTester(testerId) {
  const response = await apiFetch(`/owner/testers/${testerId}/restore`, { method: 'POST' })
  return parseJsonResponse(response, 'Restore tester failed')
}

export async function fetchSystemStatus() {
  const response = await apiFetch('/owner/system-status')
  return parseJsonResponse(response, 'Fetch system status failed')
}
