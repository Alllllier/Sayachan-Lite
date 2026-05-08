import { apiFetch, clearAuthToken, setAuthToken } from '../../services/apiClient'
import { assertApiResponse } from '../../services/apiResponse'
import {
  authLoginResponseSchema,
  createdInviteSchema,
  ownerSystemStatusSchema,
  publicInviteListSchema,
  publicInviteSchema,
  publicUserListSchema,
  publicUserSchema
} from '@sayachan/contracts'
import type {
  AuthCredentialsDto,
  AuthLoginResponseDto,
  CreatedInviteDto,
  OwnerSystemStatusDto,
  PublicInviteDto,
  PublicUserDto,
  RegisterTesterDto
} from '@sayachan/contracts'

type ApiSchema<T> = Parameters<typeof assertApiResponse<T>>[1]

async function parseJsonResponse<T>(
  response: Response,
  errorMessage: string,
  schema?: ApiSchema<T>
): Promise<T | null> {
  if (!response.ok) {
    let message = errorMessage
    try {
      const body = assertApiResponse(await response.json() as unknown, authLoginResponseSchema, 'auth error')
      message = body.error || message
    } catch {
      message = errorMessage
    }
    throw new Error(message || `Auth request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  const payload = await response.json() as unknown
  if (payload === null) {
    return null
  }
  return schema ? assertApiResponse(payload, schema, errorMessage) : payload as T
}

export async function fetchCurrentUser(): Promise<PublicUserDto | null> {
  const response = await apiFetch('/auth/me')
  return parseJsonResponse<PublicUserDto>(response, 'Fetch current user failed', publicUserSchema)
}

export async function login(credentials: AuthCredentialsDto): Promise<PublicUserDto | null> {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
  const result = await parseJsonResponse<AuthLoginResponseDto>(response, 'Login failed', authLoginResponseSchema)
  if (result?.sessionToken) {
    setAuthToken(result.sessionToken)
    return result.user || null
  }
  return result?.user || null
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
  return parseJsonResponse<PublicUserDto>(response, 'Registration failed', publicUserSchema)
}

export async function bootstrapOwner(payload: AuthCredentialsDto): Promise<PublicUserDto | null> {
  const response = await apiFetch('/auth/bootstrap-owner', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return parseJsonResponse<PublicUserDto>(response, 'Owner bootstrap failed', publicUserSchema)
}

export async function createInvite(): Promise<CreatedInviteDto | null> {
  const response = await apiFetch('/owner/invites', { method: 'POST' })
  return parseJsonResponse<CreatedInviteDto>(response, 'Create invite failed', createdInviteSchema)
}

export async function fetchInvites(): Promise<PublicInviteDto[] | null> {
  const response = await apiFetch('/owner/invites')
  return parseJsonResponse<PublicInviteDto[]>(response, 'Fetch invites failed', publicInviteListSchema)
}

export async function revokeInvite(inviteId: string): Promise<PublicInviteDto | null> {
  const response = await apiFetch(`/owner/invites/${inviteId}/revoke`, { method: 'POST' })
  return parseJsonResponse<PublicInviteDto>(response, 'Revoke invite failed', publicInviteSchema)
}

export async function fetchTesters(): Promise<PublicUserDto[] | null> {
  const response = await apiFetch('/owner/testers')
  return parseJsonResponse<PublicUserDto[]>(response, 'Fetch testers failed', publicUserListSchema)
}

export async function disableTester(testerId: string): Promise<PublicUserDto | null> {
  const response = await apiFetch(`/owner/testers/${testerId}/disable`, { method: 'POST' })
  return parseJsonResponse<PublicUserDto>(response, 'Disable tester failed', publicUserSchema)
}

export async function restoreTester(testerId: string): Promise<PublicUserDto | null> {
  const response = await apiFetch(`/owner/testers/${testerId}/restore`, { method: 'POST' })
  return parseJsonResponse<PublicUserDto>(response, 'Restore tester failed', publicUserSchema)
}

export async function fetchSystemStatus(): Promise<OwnerSystemStatusDto | null> {
  const response = await apiFetch('/owner/system-status')
  return parseJsonResponse<OwnerSystemStatusDto>(response, 'Fetch system status failed', ownerSystemStatusSchema)
}
