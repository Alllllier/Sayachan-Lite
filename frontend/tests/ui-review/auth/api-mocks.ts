import {
  ownerInvites,
  ownerSystemStatus,
  ownerTesters,
  ownerUser,
  testerUser
} from './fixtures.js'
import type { Page } from '@playwright/test'

type ReviewUser = {
  _id: string
  email: string
  role: string
  disabled: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}
type ReviewInvite = {
  _id: string
  codePreview: string
  code?: string
  createdBy: string
  expiresAt: string
  revokedAt: string | null
  usedAt: string | null
  usedBy: string | null
  createdAt: string
}
type ReviewSystemStatus = typeof ownerSystemStatus
type AuthMockOptions = {
  invites?: ReviewInvite[]
  testers?: ReviewUser[]
  currentUser?: ReviewUser | null
  loginStatus?: number
  loginError?: string
  loginUser?: ReviewUser
  registerStatus?: number
  registerError?: string
  registerUser?: ReviewUser
  systemStatus?: ReviewSystemStatus
}

function json(data: unknown, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data)
  }
}

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

export async function installAuthReviewApiMocks(page: Page, options: AuthMockOptions = {}): Promise<void> {
  const invitesById = new Map(clone(options.invites || ownerInvites).map(invite => [invite._id, invite]))
  const testersById = new Map(clone(options.testers || ownerTesters).map(tester => [tester._id, tester]))
  let currentUser = options.currentUser === undefined ? null : options.currentUser
  let createInviteCount = 0

  await page.route('http://localhost:3001/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const pathname = url.pathname

    if (method === 'GET' && pathname === '/auth/me') {
      await route.fulfill(json(currentUser))
      return
    }

    if (method === 'POST' && pathname === '/auth/login') {
      if (options.loginStatus && options.loginStatus >= 400) {
        await route.fulfill(json({ error: options.loginError || 'Invalid email or password' }, options.loginStatus))
        return
      }
      currentUser = options.loginUser || ownerUser
      await route.fulfill(json({ sessionToken: 'review-session-token', user: currentUser }))
      return
    }

    if (method === 'POST' && pathname === '/auth/register') {
      if (options.registerStatus && options.registerStatus >= 400) {
        await route.fulfill(json({ error: options.registerError || 'Invite code is invalid' }, options.registerStatus))
        return
      }
      await route.fulfill(json(options.registerUser || testerUser, 201))
      return
    }

    if (method === 'POST' && pathname === '/auth/logout') {
      currentUser = null
      await route.fulfill({ status: 204 })
      return
    }

    if (method === 'GET' && pathname === '/owner/invites') {
      await route.fulfill(json([...invitesById.values()]))
      return
    }

    if (method === 'POST' && pathname === '/owner/invites') {
      createInviteCount += 1
      const invite = {
        _id: `invite-created-${createInviteCount}`,
        code: `NEW-REVIEW-CODE-${createInviteCount}`,
        codePreview: `NEW${createInviteCount}...CODE`,
        createdBy: ownerUser._id,
        expiresAt: '2026-06-04T10:00:00.000Z',
        revokedAt: null,
        usedAt: null,
        usedBy: null,
        createdAt: '2026-05-04T10:00:00.000Z'
      }
      invitesById.set(invite._id, { ...invite, code: undefined })
      await route.fulfill(json(invite, 201))
      return
    }

    const inviteRevokeMatch = pathname.match(/^\/owner\/invites\/([^/]+)\/revoke$/)
    if (method === 'POST' && inviteRevokeMatch) {
      const invite = invitesById.get(inviteRevokeMatch[1])
      if (!invite) {
        await route.fulfill(json({ error: 'Invite not found' }, 404))
        return
      }
      const revoked = { ...invite, revokedAt: '2026-05-04T10:05:00.000Z' }
      invitesById.set(invite._id, revoked)
      await route.fulfill(json(revoked))
      return
    }

    if (method === 'GET' && pathname === '/owner/testers') {
      await route.fulfill(json([...testersById.values()]))
      return
    }

    const testerStatusMatch = pathname.match(/^\/owner\/testers\/([^/]+)\/(disable|restore)$/)
    if (method === 'POST' && testerStatusMatch) {
      const tester = testersById.get(testerStatusMatch[1])
      if (!tester) {
        await route.fulfill(json({ error: 'Tester not found' }, 404))
        return
      }
      const updated = { ...tester, disabled: testerStatusMatch[2] === 'disable' }
      testersById.set(tester._id, updated)
      await route.fulfill(json(updated))
      return
    }

    if (method === 'GET' && pathname === '/owner/system-status') {
      await route.fulfill(json(options.systemStatus || ownerSystemStatus))
      return
    }

    await route.fulfill(json({ error: `unmocked ${method} ${pathname}` }, 500))
  })
}
