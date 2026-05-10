<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Chat from './components/Chat.vue'
import { useAuthStore } from './stores/auth'
import type { AuthStore } from './stores/auth'
import { t } from './i18n/productLocale'

const auth = useAuthStore() as AuthStore
const route = useRoute()
const isPublicAuthRoute = computed(() => route.meta.public)
</script>

<template>
  <div class="app" :class="{ 'app--auth': isPublicAuthRoute }">
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
      <router-link to="/settings" class="nav-item">
        <span class="nav-icon">{{ t('nav.settings') }}</span>
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
  padding-bottom: 60px;
}

.app--auth {
  padding-top: 0;
  padding-bottom: 0;
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
