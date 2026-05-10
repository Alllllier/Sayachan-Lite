<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Chat from './components/Chat.vue'
import { useAuthStore } from './stores/auth'
import type { AuthStore } from './stores/auth'
import { t } from './i18n/productLocale'

const auth = useAuthStore() as AuthStore
const route = useRoute()
const router = useRouter()
const isPublicAuthRoute = computed(() => route.meta.public)
const currentUserEmail = computed(() => auth.currentUser?.email || '')

async function logout(): Promise<void> {
  await auth.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="app" :class="{ 'app--auth': isPublicAuthRoute }">
    <header v-if="!isPublicAuthRoute && auth.isAuthenticated" class="top-shell">
      <div>
        <strong>Sayachan Lite</strong>
        <span>{{ currentUserEmail }}</span>
      </div>
      <div class="top-shell__actions">
        <RouterLink v-if="auth.isOwner" to="/owner" class="btn btn-secondary btn-sm">{{ t('app.owner') }}</RouterLink>
        <button class="btn btn-secondary btn-sm" type="button" @click="logout">{{ t('app.logout') }}</button>
      </div>
    </header>
    <router-view />
    <nav v-if="!isPublicAuthRoute && auth.isAuthenticated" class="bottom-nav">
      <router-link to="/notes" class="nav-item">
        <span class="nav-icon">{{ t('nav.notes') }}</span>
      </router-link>
      <router-link to="/dashboard" class="nav-item">
        <span class="nav-icon">{{ t('nav.dashboard') }}</span>
      </router-link>
      <router-link to="/projects" class="nav-item">
        <span class="nav-icon">{{ t('nav.projects') }}</span>
      </router-link>
    </nav>
    <Chat v-if="!isPublicAuthRoute && auth.isAuthenticated" />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #fafafa;
  color: #333;
}

.app {
  min-height: 100vh;
  padding-top: 56px;
  padding-bottom: 60px;
}

.app--auth {
  padding-top: 0;
  padding-bottom: 0;
}

.top-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
  background: var(--surface-card);
  border-bottom: 1px solid var(--border-default);
  z-index: 100;
}

.top-shell div:first-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.top-shell strong,
.top-shell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-shell strong {
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.top-shell span {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.top-shell__actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.nav-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: #999;
  font-size: 12px;
  transition: color 0.2s;
}

.nav-item.router-link-active {
  color: #42b883;
}

.nav-icon {
  font-weight: 500;
}
</style>
