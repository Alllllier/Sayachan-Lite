<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import SegmentedControl from '../components/ui/SegmentedControl.vue'
import { useAuthStore } from '../stores/auth'
import type { AuthStore } from '../stores/auth'
import { getCurrentLocale, isSupportedLocale, setLocale, t } from '../i18n/productLocale'

const auth = useAuthStore() as AuthStore
const router = useRouter()

const accountEmail = computed(() => auth.currentUser?.email || '')
const currentLanguage = computed(() => getCurrentLocale())
const languageOptions = computed(() => [
  { value: 'zh', label: t('settings.languageZh') },
  { value: 'en', label: t('settings.languageEn') }
])

function updateLanguage(value: string): void {
  if (isSupportedLocale(value)) {
    setLocale(value)
  }
}

async function logout(): Promise<void> {
  await auth.logout()
  await router.push('/login')
}
</script>

<template>
  <main class="settings-page">
    <section class="settings-header">
      <h1>{{ t('settings.title') }}</h1>
    </section>

    <section class="settings-stack">
      <article class="card settings-card">
        <div>
          <h2 class="card-title">{{ t('settings.emailLabel') }}</h2>
        </div>
        <p class="settings-value">{{ accountEmail }}</p>
      </article>

      <article class="card settings-card settings-card--row">
        <div>
          <h2 class="card-title">{{ t('settings.languageControl') }}</h2>
        </div>
        <SegmentedControl
          :model-value="currentLanguage"
          :options="languageOptions"
          variant="inline"
          :aria-label="t('settings.languageControl')"
          @update:model-value="updateLanguage"
        />
      </article>

      <article v-if="auth.isOwner" class="card settings-card settings-card--row">
        <div>
          <h2 class="card-title">{{ t('settings.managementEntry') }}</h2>
        </div>
        <RouterLink to="/owner" class="btn btn-secondary">{{ t('settings.managementEntry') }}</RouterLink>
      </article>

      <div class="settings-actions">
        <button class="btn btn-danger" type="button" @click="logout">{{ t('app.logout') }}</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.settings-page {
  width: min(100%, 720px);
  margin: 0 auto;
  padding: var(--space-lg);
}

.settings-header {
  margin-bottom: var(--space-lg);
}

.settings-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
}

.settings-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.settings-card {
  margin-bottom: 0;
}

.settings-card--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.settings-card .card-title {
  margin-bottom: 0;
}

.settings-value {
  margin-top: var(--space-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  word-break: break-word;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 560px) {
  .settings-card--row {
    align-items: stretch;
    flex-direction: column;
  }

  .settings-actions {
    justify-content: stretch;
  }

  .settings-actions .btn {
    width: 100%;
  }
}
</style>
