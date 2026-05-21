import { defineStore } from 'pinia'
import * as authApi from '../features/auth/auth.api'
import type {
  AuthCredentialsDto,
  PublicUserDto,
  RegisterTesterDto
} from '@sayachan/contracts'
import { clearResourceCache } from '../services/resourceCache'
import { useChatStore } from './chat'

export type AuthStore = {
  currentUser: PublicUserDto | null
  loading: boolean
  initialized: boolean
  error: string
  isAuthenticated: boolean
  isOwner: boolean
  loadCurrentUser: () => Promise<void>
  login: (credentials: AuthCredentialsDto) => Promise<PublicUserDto | null>
  logout: () => Promise<void>
  registerTester: (payload: RegisterTesterDto) => Promise<PublicUserDto | null>
  bootstrapOwner: (payload: AuthCredentialsDto) => Promise<PublicUserDto | null>
}

function resetAccountScopedRuntimeState() {
  clearResourceCache()
  useChatStore().resetChat()
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as PublicUserDto | null,
    loading: false,
    initialized: false,
    error: ''
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser),
    isOwner: (state) => state.currentUser?.role === 'owner'
  },
  actions: {
    async loadCurrentUser() {
      this.loading = true
      this.error = ''
      try {
        const previousUserId = this.currentUser?._id || null
        this.currentUser = await authApi.fetchCurrentUser()
        const nextUserId = this.currentUser?._id || null
        if (previousUserId && nextUserId && previousUserId !== nextUserId) {
          resetAccountScopedRuntimeState()
        }
      } catch (error: unknown) {
        this.currentUser = null
        resetAccountScopedRuntimeState()
        this.error = error instanceof Error ? error.message : String(error)
      } finally {
        this.loading = false
        this.initialized = true
      }
    },
    async login(credentials: AuthCredentialsDto) {
      this.loading = true
      this.error = ''
      try {
        const previousUserId = this.currentUser?._id || null
        this.currentUser = await authApi.login(credentials)
        const nextUserId = this.currentUser?._id || null
        if (previousUserId !== nextUserId) {
          resetAccountScopedRuntimeState()
        }
        this.initialized = true
        return this.currentUser
      } catch (error: unknown) {
        this.currentUser = null
        resetAccountScopedRuntimeState()
        this.error = error instanceof Error ? error.message : String(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await authApi.logout()
      this.currentUser = null
      resetAccountScopedRuntimeState()
      this.initialized = true
    },
    async registerTester(payload: RegisterTesterDto) {
      return authApi.registerTester(payload)
    },
    async bootstrapOwner(payload: AuthCredentialsDto) {
      return authApi.bootstrapOwner(payload)
    }
  }
})
