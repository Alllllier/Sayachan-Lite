<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Toast from '../components/ui/Toast.vue'
import SegmentedControl from '../components/ui/SegmentedControl.vue'
import type {
  MemoryEntryDto,
  MemoryEntryType
} from '@sayachan/contracts'
import {
  activateMemoryEntry,
  createMemoryEntry,
  deactivateMemoryEntry,
  deleteMemoryEntry,
  fetchMemoryEntries,
  updateMemoryEntry
} from '../features/memory/memory.api'
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
const memoryTypeOptions = computed<Array<{ value: MemoryEntryType, label: string }>>(() => [
  { value: 'preference', label: t('settings.memoryTypePreference') },
  { value: 'continuity_hint', label: t('settings.memoryTypeContinuity') }
])
const memoryEntries = ref<MemoryEntryDto[]>([])
const memoryLoading = ref(false)
const memoryError = ref('')
const memoryForm = reactive({
  type: 'preference' as MemoryEntryType,
  content: ''
})
const memoryDrafts = ref<Record<string, { type: MemoryEntryType, content: string }>>({})
const toast = ref<{ visible: boolean, message: string, type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' })

function updateLanguage(value: string): void {
  if (isSupportedLocale(value)) {
    setLocale(value)
  }
}

function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  toast.value = { visible: true, message, type }
  window.setTimeout(() => {
    toast.value.visible = false
  }, 2200)
}

function memoryEntryId(entry: MemoryEntryDto): string {
  return String(entry._id)
}

function syncMemoryDrafts(entries: MemoryEntryDto[]): void {
  memoryDrafts.value = Object.fromEntries(entries.map(entry => [
    memoryEntryId(entry),
    {
      type: entry.type,
      content: entry.content
    }
  ]))
}

async function loadMemoryEntries(): Promise<void> {
  if (!canManageMemory.value) return
  memoryLoading.value = true
  memoryError.value = ''
  try {
    const entries = await fetchMemoryEntries()
    memoryEntries.value = entries
    syncMemoryDrafts(entries)
  } catch (err: unknown) {
    memoryError.value = err instanceof Error ? err.message : String(err)
  } finally {
    memoryLoading.value = false
  }
}

async function handleCreateMemory(): Promise<void> {
  const content = memoryForm.content.trim()
  if (!content) {
    showToast(t('settings.memoryValidationContent'), 'error')
    return
  }

  try {
    await createMemoryEntry({
      type: memoryForm.type,
      content,
      active: true
    })
    memoryForm.content = ''
    await loadMemoryEntries()
    showToast(t('settings.memoryToastCreated'))
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : String(err), 'error')
  }
}

async function handleSaveMemory(entry: MemoryEntryDto): Promise<void> {
  const draft = memoryDrafts.value[memoryEntryId(entry)]
  if (!draft || !draft.content.trim()) {
    showToast(t('settings.memoryValidationContent'), 'error')
    return
  }

  try {
    await updateMemoryEntry(memoryEntryId(entry), {
      type: draft.type,
      content: draft.content.trim()
    })
    await loadMemoryEntries()
    showToast(t('settings.memoryToastUpdated'))
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : String(err), 'error')
  }
}

async function handleToggleMemory(entry: MemoryEntryDto): Promise<void> {
  try {
    if (entry.active) {
      await deactivateMemoryEntry(memoryEntryId(entry))
      showToast(t('settings.memoryToastDeactivated'))
    } else {
      await activateMemoryEntry(memoryEntryId(entry))
      showToast(t('settings.memoryToastActivated'))
    }
    await loadMemoryEntries()
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : String(err), 'error')
  }
}

async function handleDeleteMemory(entry: MemoryEntryDto): Promise<void> {
  if (!window.confirm(t('settings.memoryConfirmDelete'))) return
  try {
    await deleteMemoryEntry(memoryEntryId(entry))
    await loadMemoryEntries()
    showToast(t('settings.memoryToastDeleted'))
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : String(err), 'error')
  }
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

        <form class="settings-memory-form" @submit.prevent="handleCreateMemory">
          <select v-model="memoryForm.type" class="input" :aria-label="t('settings.memoryTypeLabel')">
            <option v-for="option in memoryTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <textarea
            v-model="memoryForm.content"
            class="textarea"
            :placeholder="t('settings.memoryPlaceholder')"
            rows="3"
          ></textarea>
          <button class="btn btn-primary" type="submit" :disabled="memoryLoading">
            {{ t('settings.memoryAdd') }}
          </button>
        </form>

        <p v-if="memoryLoading" class="card-meta">{{ t('settings.memoryLoading') }}</p>
        <p v-if="memoryError" class="field-helper field-helper--error">{{ memoryError }}</p>
        <p v-if="!memoryLoading && memoryEntries.length === 0" class="card-meta">{{ t('settings.memoryEmpty') }}</p>

        <ul v-if="memoryEntries.length > 0" class="settings-memory-list">
          <li
            v-for="entry in memoryEntries"
            :key="memoryEntryId(entry)"
            class="settings-memory-item"
            :class="{ 'is-inactive': !entry.active }"
          >
            <template v-if="memoryDrafts[memoryEntryId(entry)]">
              <div class="settings-memory-item-header">
                <select v-model="memoryDrafts[memoryEntryId(entry)].type" class="input input-sm" :aria-label="t('settings.memoryTypeLabel')">
                  <option v-for="option in memoryTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <span class="settings-memory-status">{{ entry.active ? t('settings.memoryActive') : t('settings.memoryInactive') }}</span>
              </div>
              <textarea
                v-model="memoryDrafts[memoryEntryId(entry)].content"
                class="textarea textarea-sm"
                rows="2"
              ></textarea>
              <div class="settings-memory-actions">
                <button class="btn btn-secondary btn-sm" type="button" :disabled="memoryLoading" @click="handleSaveMemory(entry)">
                  {{ t('common.save') }}
                </button>
                <button class="btn btn-archive btn-sm" type="button" :disabled="memoryLoading" @click="handleToggleMemory(entry)">
                  {{ entry.active ? t('settings.memoryDeactivate') : t('settings.memoryActivate') }}
                </button>
                <button class="btn btn-danger btn-sm" type="button" :disabled="memoryLoading" @click="handleDeleteMemory(entry)">
                  {{ t('common.delete') }}
                </button>
              </div>
            </template>
          </li>
        </ul>
      </article>

      <div class="settings-actions">
        <button class="btn btn-danger" type="button" @click="logout">{{ t('app.logout') }}</button>
      </div>
    </section>

    <Toast :message="toast.message" :type="toast.type" :visible="toast.visible" />
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
.settings-memory-header .card-meta,
.settings-memory-form .input,
.settings-memory-form .textarea,
.settings-memory-item .input,
.settings-memory-item .textarea {
  margin-bottom: 0;
}

.settings-memory-form {
  display: grid;
  grid-template-columns: minmax(140px, 180px) 1fr auto;
  align-items: start;
  gap: var(--space-sm);
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

.settings-memory-item-header .input {
  width: min(100%, 200px);
}

.settings-memory-status {
  flex: 0 0 auto;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.settings-memory-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: flex-end;
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

  .settings-memory-header,
  .settings-memory-form {
    display: flex;
    align-items: stretch;
    flex-direction: column;
  }

  .settings-memory-actions,
  .settings-memory-actions .btn,
  .settings-memory-header .btn {
    width: 100%;
  }
}
</style>
