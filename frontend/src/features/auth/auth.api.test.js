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

function jsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body)
  }
}

describe('auth api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads current user and sends login/logout through cookie-backed endpoints', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ email: 'owner@example.com', role: 'owner' }))
    await expect(fetchCurrentUser()).resolves.toEqual({ email: 'owner@example.com', role: 'owner' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/auth/me', { credentials: 'include' })

    fetch.mockResolvedValueOnce(jsonResponse({ email: 'owner@example.com', role: 'owner' }))
    await login({ email: 'owner@example.com', password: 'long-enough' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', password: 'long-enough' })
    })

    fetch.mockResolvedValueOnce({ ok: true, status: 204 })
    await expect(logout()).resolves.toBe(null)
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  })

  it('registers testers with an invite code', async () => {
    const payload = { email: 'tester@example.com', password: 'long-enough', inviteCode: 'INVITE' }
    fetch.mockResolvedValueOnce(jsonResponse({ email: payload.email, role: 'tester' }, true, 201))

    await expect(registerTester(payload)).resolves.toEqual({ email: payload.email, role: 'tester' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  })

  it('keeps owner management calls behind owner endpoints', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ code: 'NEW-CODE' }, true, 201))
    await createInvite()
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/invites', {
      method: 'POST',
      credentials: 'include'
    })

    fetch.mockResolvedValueOnce(jsonResponse([]))
    await fetchInvites()
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/invites', { credentials: 'include' })

    fetch.mockResolvedValueOnce(jsonResponse({ _id: 'invite-1', revokedAt: 'now' }))
    await revokeInvite('invite-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/invites/invite-1/revoke', {
      method: 'POST',
      credentials: 'include'
    })

    fetch.mockResolvedValueOnce(jsonResponse([]))
    await fetchTesters()
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/testers', { credentials: 'include' })

    fetch.mockResolvedValueOnce(jsonResponse({ _id: 'tester-1', disabled: true }))
    await disableTester('tester-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/testers/tester-1/disable', {
      method: 'POST',
      credentials: 'include'
    })

    fetch.mockResolvedValueOnce(jsonResponse({ _id: 'tester-1', disabled: false }))
    await restoreTester('tester-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/testers/tester-1/restore', {
      method: 'POST',
      credentials: 'include'
    })

    fetch.mockResolvedValueOnce(jsonResponse({ userCount: 2 }))
    await fetchSystemStatus()
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/owner/system-status', { credentials: 'include' })
  })
})
