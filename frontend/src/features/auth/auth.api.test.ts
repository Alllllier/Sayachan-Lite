import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createInvite,
  disableTester,
  fetchCurrentUser,
  fetchInvites,
  fetchSystemStatus,
  fetchTesters,
  login,
  logout,
  registerTester,
  restoreTester,
  revokeInvite
} from './auth.api'

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? status : status || 500,
    headers: { 'Content-Type': 'application/json' }
  })
}

function createLocalStorageMock(): Storage {
  const values = new Map<string, string>()
  return {
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key: string) => values.get(key) || null),
    key: vi.fn((index: number) => Array.from(values.keys())[index] || null),
    get length() {
      return values.size
    },
    removeItem: vi.fn((key: string) => {
      values.delete(key)
    }),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, String(value))
    })
  } as Storage
}

function mockedFetch() {
  return vi.mocked(fetch)
}

describe('auth api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('localStorage', createLocalStorageMock())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads current user and sends login/logout through session-backed endpoints', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse({ email: 'owner@example.com', role: 'owner' }))
    await expect(fetchCurrentUser()).resolves.toEqual({ email: 'owner@example.com', role: 'owner' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/auth/me', { credentials: 'include' })

    mockedFetch().mockResolvedValueOnce(jsonResponse({
      sessionToken: 'session-token',
      user: { email: 'owner@example.com', role: 'owner' }
    }))
    await expect(login({ email: 'owner@example.com', password: 'long-enough' }))
      .resolves.toEqual({ email: 'owner@example.com', role: 'owner' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', password: 'long-enough' })
    })
    expect(localStorage.getItem('sayachan_session_token')).toBe('session-token')

    mockedFetch().mockResolvedValueOnce(jsonResponse({ email: 'owner@example.com', role: 'owner' }))
    await fetchCurrentUser()
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/auth/me', {
      credentials: 'include',
      headers: { Authorization: 'Bearer session-token' }
    })

    mockedFetch().mockResolvedValueOnce({ ok: true, status: 204 } as Response)
    await expect(logout()).resolves.toBe(null)
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { Authorization: 'Bearer session-token' }
    })
    expect(localStorage.getItem('sayachan_session_token')).toBe(null)
  })

  it('registers testers with an invite code', async () => {
    const payload = { email: 'tester@example.com', password: 'long-enough', inviteCode: 'INVITE' }
    mockedFetch().mockResolvedValueOnce(jsonResponse({ email: payload.email, role: 'tester' }, true, 201))

    await expect(registerTester(payload)).resolves.toEqual({ email: payload.email, role: 'tester' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  })

  it('keeps owner management calls behind owner endpoints', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse({ code: 'NEW-CODE' }, true, 201))
    await createInvite()
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/invites', {
      method: 'POST',
      credentials: 'include'
    })

    mockedFetch().mockResolvedValueOnce(jsonResponse([]))
    await fetchInvites()
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/invites', { credentials: 'include' })

    mockedFetch().mockResolvedValueOnce(jsonResponse({ _id: 'invite-1', revokedAt: 'now' }))
    await revokeInvite('invite-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/invites/invite-1/revoke', {
      method: 'POST',
      credentials: 'include'
    })

    mockedFetch().mockResolvedValueOnce(jsonResponse([]))
    await fetchTesters()
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/testers', { credentials: 'include' })

    mockedFetch().mockResolvedValueOnce(jsonResponse({ _id: 'tester-1', disabled: true }))
    await disableTester('tester-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/testers/tester-1/disable', {
      method: 'POST',
      credentials: 'include'
    })

    mockedFetch().mockResolvedValueOnce(jsonResponse({ _id: 'tester-1', disabled: false }))
    await restoreTester('tester-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/testers/tester-1/restore', {
      method: 'POST',
      credentials: 'include'
    })

    mockedFetch().mockResolvedValueOnce(jsonResponse({ userCount: 2 }))
    await fetchSystemStatus()
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/system-status', { credentials: 'include' })
  })
})
