import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'
import { useChatStore } from './chat'
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

  it('clears chat on logout', async () => {
    const auth = useAuthStore()
    const chat = useChatStore()
    auth.currentUser = { _id: 'owner-1', email: 'owner@example.com' }
    chat.openChat()
    chat.appendMessage({ role: 'user', content: 'owner context' })
    logoutMock.mockResolvedValue(null)

    await auth.logout()

    expect(chat.isOpen).toBe(false)
    expect(chat.messages).toEqual([])
    expect(auth.currentUser).toBe(null)
  })

  it('clears chat when logging into a different account', async () => {
    const auth = useAuthStore()
    const chat = useChatStore()
    auth.currentUser = { _id: 'owner-1', email: 'owner@example.com' }
    chat.appendMessage({ role: 'assistant', content: 'owner answer' })
    loginMock.mockResolvedValue({ _id: 'tester-1', email: 'tester@example.com' })

    await auth.login({ email: 'tester@example.com', password: 'long-enough' })

    expect(chat.messages).toEqual([])
    expect(auth.currentUser._id).toBe('tester-1')
  })
})
