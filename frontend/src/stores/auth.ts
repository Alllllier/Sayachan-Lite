import { defineStore } from 'pinia'
import * as authApi from '../features/auth/auth.api'
import type {
  AuthCredentialsDto,
  PublicUserDto,
  RegisterTesterDto
} from '../types/api-dtos'
import { clearResourceCache } from '../services/resourceCache'
import { useChatStore } from './chat'
import { useCockpitSignals } from './cockpitSignals'

function resetAccountScopedRuntimeState() {
  clearResourceCache()
  useChatStore().resetChat()
  useCockpitSignals().resetSignals()
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
