import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'
import { useChatStore } from './chat'
import { useCockpitSignals } from './cockpitSignals'
import * as authApi from '../features/auth/auth.api'

vi.mock('../features/auth/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  registerTester: vi.fn(),
  bootstrapOwner: vi.fn()
}))

const loginMock = vi.mocked(authApi.login)
const logoutMock = vi.mocked(authApi.logout)

describe('auth store account-scoped runtime reset', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('clears chat and cockpit signals on logout', async () => {
    const auth = useAuthStore()
    const chat = useChatStore()
    const cockpitSignals = useCockpitSignals()
    auth.currentUser = { _id: 'owner-1', email: 'owner@example.com' }
    chat.openChat()
    chat.appendMessage({ role: 'user', content: 'owner context' })
    cockpitSignals.setSignals({
      activeProjectsCount: 2,
      activeTasksCount: 3,
      pinnedProjectName: 'Owner project',
      currentNextAction: 'Owner task'
    })
    logoutMock.mockResolvedValue(null)

    await auth.logout()

    expect(chat.isOpen).toBe(false)
    expect(chat.messages).toEqual([])
    expect(cockpitSignals.hasHydrated).toBe(false)
    expect(cockpitSignals.pinnedProjectName).toBe('')
    expect(auth.currentUser).toBe(null)
  })

  it('clears chat and cockpit signals when logging into a different account', async () => {
    const auth = useAuthStore()
    const chat = useChatStore()
    const cockpitSignals = useCockpitSignals()
    auth.currentUser = { _id: 'owner-1', email: 'owner@example.com' }
    chat.appendMessage({ role: 'assistant', content: 'owner answer' })
    cockpitSignals.setSignals({ pinnedProjectName: 'Owner project' })
    loginMock.mockResolvedValue({ _id: 'tester-1', email: 'tester@example.com' })

    await auth.login({ email: 'tester@example.com', password: 'long-enough' })

    expect(chat.messages).toEqual([])
    expect(cockpitSignals.pinnedProjectName).toBe('')
    expect(auth.currentUser._id).toBe('tester-1')
  })
})
