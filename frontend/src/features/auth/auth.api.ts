import { apiFetch, clearAuthToken, setAuthToken } from '../../services/apiClient'
import type {
  AuthCredentialsDto,
  AuthLoginResponseDto,
  CreatedInviteDto,
  OwnerSystemStatusDto,
  PublicInviteDto,
  PublicUserDto,
  RegisterTesterDto
} from '../../types/api-dtos'

async function parseJsonResponse<T>(response: Response, errorMessage: string): Promise<T | null> {
  if (!response.ok) {
    let message = errorMessage
    try {
      const body = await response.json() as AuthLoginResponseDto
      message = body.error || message
    } catch {
      message = errorMessage
    }
    throw new Error(message || `Auth request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json() as Promise<T>
}

export async function fetchCurrentUser(): Promise<PublicUserDto | null> {
  const response = await apiFetch('/auth/me')
  return parseJsonResponse<PublicUserDto>(response, 'Fetch current user failed')
}

export async function login(credentials: AuthCredentialsDto): Promise<PublicUserDto | AuthLoginResponseDto | null> {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
  const result = await parseJsonResponse<AuthLoginResponseDto>(response, 'Login failed')
  if (result?.sessionToken) {
    setAuthToken(result.sessionToken)
    return result.user || null
  }
  return result
}

export async function logout(): Promise<null> {
  try {
    const response = await apiFetch('/auth/logout', { method: 'POST' })
    return await parseJsonResponse(response, 'Logout failed')
  } finally {
    clearAuthToken()
  }
}

export async function registerTester(payload: RegisterTesterDto): Promise<PublicUserDto | null> {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return parseJsonResponse<PublicUserDto>(response, 'Registration failed')
}

export async function bootstrapOwner(payload: AuthCredentialsDto): Promise<PublicUserDto | null> {
  const response = await apiFetch('/auth/bootstrap-owner', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return parseJsonResponse<PublicUserDto>(response, 'Owner bootstrap failed')
}

export async function createInvite(): Promise<CreatedInviteDto | null> {
  const response = await apiFetch('/owner/invites', { method: 'POST' })
  return parseJsonResponse<CreatedInviteDto>(response, 'Create invite failed')
}

export async function fetchInvites(): Promise<PublicInviteDto[] | null> {
  const response = await apiFetch('/owner/invites')
  return parseJsonResponse<PublicInviteDto[]>(response, 'Fetch invites failed')
}

export async function revokeInvite(inviteId: string): Promise<PublicInviteDto | null> {
  const response = await apiFetch(`/owner/invites/${inviteId}/revoke`, { method: 'POST' })
  return parseJsonResponse<PublicInviteDto>(response, 'Revoke invite failed')
}

export async function fetchTesters(): Promise<PublicUserDto[] | null> {
  const response = await apiFetch('/owner/testers')
  return parseJsonResponse<PublicUserDto[]>(response, 'Fetch testers failed')
}

export async function disableTester(testerId: string): Promise<PublicUserDto | null> {
  const response = await apiFetch(`/owner/testers/${testerId}/disable`, { method: 'POST' })
  return parseJsonResponse<PublicUserDto>(response, 'Disable tester failed')
}

export async function restoreTester(testerId: string): Promise<PublicUserDto | null> {
  const response = await apiFetch(`/owner/testers/${testerId}/restore`, { method: 'POST' })
  return parseJsonResponse<PublicUserDto>(response, 'Restore tester failed')
}

export async function fetchSystemStatus(): Promise<OwnerSystemStatusDto | null> {
  const response = await apiFetch('/owner/system-status')
  return parseJsonResponse<OwnerSystemStatusDto>(response, 'Fetch system status failed')
}
