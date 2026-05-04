import { defineStore } from 'pinia'
import * as authApi from '../features/auth/auth.api'
import { useChatStore } from './chat'
import { useCockpitSignals } from './cockpitSignals'

function resetAccountScopedRuntimeState() {
  useChatStore().resetChat()
  useCockpitSignals().resetSignals()
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
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
      } catch (error) {
        this.currentUser = null
        resetAccountScopedRuntimeState()
        this.error = error.message
      } finally {
        this.loading = false
        this.initialized = true
      }
    },
    async login(credentials) {
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
      } catch (error) {
        this.currentUser = null
        resetAccountScopedRuntimeState()
        this.error = error.message
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
    async registerTester(payload) {
      return authApi.registerTester(payload)
    },
    async bootstrapOwner(payload) {
      return authApi.bootstrapOwner(payload)
    }
  }
})
