<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import SegmentedControl from '../components/ui/SegmentedControl.vue'
import type {
  SayaDeskSayachanMemoryRecordDto
} from '@sayachan/contracts'
import { fetchSayachanMemoryRecords } from '../features/sayachan/sayachanMemory.api'
import { useAuthStore } from '../stores/auth'
import type { AuthStore } from '../stores/auth'
import { getCurrentLocale, isSupportedLocale, setLocale, t } from '../i18n/productLocale'

const auth = useAuthStore() as AuthStore
const router = useRouter()

const accountEmail = computed(() => auth.currentUser?.email || '')
const canManageMemory = computed(() => {
  const role = auth.currentUser?.role
  return role === 'owner' || role === 'tester'
})
const currentLanguage = computed(() => getCurrentLocale())
const languageOptions = computed(() => [
  { value: 'zh', label: t('settings.languageZh') },
  { value: 'en', label: t('settings.languageEn') }
])
const memoryRecords = ref<SayaDeskSayachanMemoryRecordDto[]>([])
const memoryLoading = ref(false)
const memoryError = ref('')

function updateLanguage(value: string): void {
  if (isSupportedLocale(value)) {
    setLocale(value)
  }
}

async function loadMemoryEntries(): Promise<void> {
  if (!canManageMemory.value) return
  memoryLoading.value = true
  memoryError.value = ''
  try {
    const result = await fetchSayachanMemoryRecords()
    memoryRecords.value = result.memoryRecords
  } catch (err: unknown) {
    memoryError.value = err instanceof Error ? err.message : String(err)
  } finally {
    memoryLoading.value = false
  }
}

function memoryRecordKindLabel(kind: SayaDeskSayachanMemoryRecordDto['kind']): string {
  if (kind === 'user_fact') return t('settings.memoryKindUserFact')
  if (kind === 'user_preference') return t('settings.memoryKindUserPreference')
  if (kind === 'interaction_preference') return t('settings.memoryKindInteractionPreference')
  if (kind === 'important_event') return t('settings.memoryKindImportantEvent')
  return kind
}

function memoryRecordStatusLabel(status: SayaDeskSayachanMemoryRecordDto['status']): string {
  if (status === 'active') return t('settings.memoryStatusActive')
  if (status === 'archived') return t('settings.memoryStatusArchived')
  if (status === 'resolved') return t('settings.memoryStatusResolved')
  if (status === 'superseded') return t('settings.memoryStatusSuperseded')
  if (status === 'deleted') return t('settings.memoryStatusDeleted')
  if (status === 'candidate') return t('settings.memoryStatusCandidate')
  if (status === 'rejected') return t('settings.memoryStatusRejected')
  if (status === 'corrected') return t('settings.memoryStatusCorrected')
  return status
}

function memoryRecordId(record: SayaDeskSayachanMemoryRecordDto): string {
  return record.memoryId
}

async function logout(): Promise<void> {
  await auth.logout()
  await router.push('/login')
}

onMounted(loadMemoryEntries)
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

      <article v-if="canManageMemory" class="card settings-card settings-memory-card">
        <div class="settings-memory-header">
          <div>
            <h2 class="card-title">{{ t('settings.memoryTitle') }}</h2>
            <p class="card-meta">{{ t('settings.memoryCaption') }}</p>
          </div>
          <button class="btn btn-secondary btn-sm" type="button" :disabled="memoryLoading" @click="loadMemoryEntries">
            {{ t('settings.memoryRefresh') }}
          </button>
        </div>

        <p v-if="memoryLoading" class="card-meta">{{ t('settings.memoryLoading') }}</p>
        <p v-if="memoryError" class="field-helper field-helper--error">{{ memoryError }}</p>
        <p v-if="!memoryLoading && memoryRecords.length === 0" class="card-meta">{{ t('settings.memoryEmpty') }}</p>

        <ul v-if="memoryRecords.length > 0" class="settings-memory-list">
          <li
            v-for="record in memoryRecords"
            :key="memoryRecordId(record)"
            class="settings-memory-item"
            :class="{ 'is-inactive': record.status !== 'active' }"
          >
            <div class="settings-memory-item-header">
              <span class="settings-memory-type">{{ memoryRecordKindLabel(record.kind) }}</span>
              <span class="settings-memory-status">{{ memoryRecordStatusLabel(record.status) }}</span>
            </div>
            <p class="settings-memory-content">{{ record.content }}</p>
          </li>
        </ul>
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

.settings-memory-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.settings-memory-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.settings-memory-header .card-title,
.settings-memory-header .card-meta {
  margin-bottom: 0;
}

.settings-memory-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  list-style: none;
}

.settings-memory-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-default);
}

.settings-memory-item.is-inactive {
  opacity: 0.68;
}

.settings-memory-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.settings-memory-type {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.settings-memory-status {
  flex: 0 0 auto;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.settings-memory-content {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.65;
  white-space: pre-wrap;
}

@media (max-width: 560px) {
  .settings-card--row {
    align-items: flex-start;
    flex-direction: column;
  }

  .settings-card--row .segmented-control {
    align-self: flex-start;
  }

  .settings-actions {
    justify-content: stretch;
  }

  .settings-actions .btn {
    width: 100%;
  }

  .settings-memory-header {
    display: flex;
    align-items: stretch;
    flex-direction: column;
  }

  .settings-memory-header .btn {
    width: 100%;
  }
}
</style>
