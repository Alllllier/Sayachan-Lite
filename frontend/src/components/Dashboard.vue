<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { AuthStore } from '../stores/auth'
import type { TaskApiTask } from '../services/tasks/task.rules'
import {
  deriveDashboardTaskProvenance,
  deriveDashboardTaskRowState
} from '../features/dashboard/dashboard.rules'
import { useDashboardFeature } from '../features/dashboard/useDashboardFeature.js'
import EmptyState from './ui/EmptyState.vue'
import OverflowMenu from './ui/OverflowMenu.vue'
import SegmentedControl from './ui/SegmentedControl.vue'
import Toast from './ui/Toast.vue'
import { List, ListSection, ListItem, ItemContent, ItemMeta } from './ui/list'
import { t } from '../i18n/productLocale'

// Toast notifications
const toast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
const auth = useAuthStore() as AuthStore
const accountCacheKey = computed(() => auth.currentUser?._id || auth.currentUser?.email || 'anonymous')

type DashboardTaskWithStringId = TaskApiTask & { _id: string }

function taskId(task: TaskApiTask): string {
  return String(task._id)
}

function taskForMutation(task: TaskApiTask): DashboardTaskWithStringId {
  return {
    ...task,
    _id: taskId(task)
  }
}

function normalizeToastType(type: string | undefined): 'success' | 'error' {
  return type === 'error' ? 'error' : 'success'
}

function showToast(message: string, type?: string): void {
  toastMessage.value = message
  toastType.value = normalizeToastType(type)
  toast.value = true
  setTimeout(() => {
    toast.value = false
  }, 3000)
}

const archiveViewOptions = computed(() => [
  { value: 'active', label: t('common.active') },
  { value: 'archived', label: t('common.archived') }
])

const {
  savedTasks,
  taskMenuOpen,
  isSavedTaskListExpanded,
  quickAddInput,
  isQuickAdding,
  showArchived,
  visibleSavedTasks,
  savedTaskListMode,
  loadSavedTasks,
  setArchiveView,
  handleQuickAddTask,
  handleTaskComplete,
  handleTaskArchive,
  handleTaskDelete,
  toggleTaskMenu,
  closeTaskMenu,
  toggleSavedTaskListExpanded
} = useDashboardFeature({
  cacheUserKey: accountCacheKey,
  notify: showToast
})

const savedTaskToggleCopy = computed(() => {
  if (isSavedTaskListExpanded.value) {
    return t('common.showLess')
  }
  return savedTasks.value.length > 5
    ? t('common.showAll', { total: savedTasks.value.length })
    : t('common.expandDetails')
})

const dashboardTaskActionLabels = computed(() => [
  showArchived.value ? t('common.restore') : t('common.archive'),
  t('common.delete')
])

function getTaskProvenanceTooltip(task: TaskApiTask): string {
  const provenance = deriveDashboardTaskProvenance(task)
  if (provenance.tooltip === 'AI generated') return t('dashboard.taskTooltipAi')
  if (task.originModule === 'dashboard') return t('dashboard.taskTooltipQuickAdd')
  if (task.originModule === 'note') return t('dashboard.taskTooltipNote')
  if (task.originModule === 'project') return t('dashboard.taskTooltipProject')
  return t('dashboard.taskTooltipManual')
}

onMounted(loadSavedTasks)
</script>

<template>
  <Toast :message="toastMessage" :type="toastType" :visible="toast" />

  <div class="card dashboard-list-card">
    <div class="dashboard-quick-add">
      <input
        v-model="quickAddInput"
        :placeholder="t('dashboard.quickAddPlaceholder')"
        @keyup.enter="handleQuickAddTask"
        :disabled="isQuickAdding"
        class="input"
      />
    </div>
    <List
      class="dashboard-card-list"
      :mode="savedTaskListMode"
      @click="closeTaskMenu"
    >
      <ListSection :aria-label="showArchived ? t('dashboard.archivedSavedTasks') : t('dashboard.activeSavedTasks')">
        <template #title>
          <div class="dashboard-list-heading">
            <span class="dashboard-list-heading-text">{{ t('dashboard.savedTasks') }}</span>
            <SegmentedControl
              :model-value="showArchived ? 'archived' : 'active'"
              :options="archiveViewOptions"
              variant="page"
              :aria-label="t('dashboard.archiveViewLabel')"
              @update:model-value="setArchiveView"
            />
          </div>
        </template>

        <template v-if="savedTasks.length > 0" #control>
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            :aria-expanded="isSavedTaskListExpanded"
            @click.stop="toggleSavedTaskListExpanded"
          >
            {{ savedTaskToggleCopy }}
          </button>
        </template>

        <ListItem
          v-for="task in visibleSavedTasks"
          :key="task._id"
          element="div"
          :interactive="deriveDashboardTaskRowState(task, showArchived).interactive"
          :muted="task.completed || task.status === 'completed'"
          :archived="showArchived"
          :raised="taskMenuOpen === task._id"
          :role="deriveDashboardTaskRowState(task, showArchived).role"
          :tabindex="deriveDashboardTaskRowState(task, showArchived).tabindex"
          :aria-pressed="deriveDashboardTaskRowState(task, showArchived).ariaPressed"
          @click="deriveDashboardTaskRowState(task, showArchived).interactive ? handleTaskComplete(taskForMutation(task)) : null"
          @keydown.enter.prevent="deriveDashboardTaskRowState(task, showArchived).interactive ? handleTaskComplete(taskForMutation(task)) : null"
          @keydown.space.prevent="deriveDashboardTaskRowState(task, showArchived).interactive ? handleTaskComplete(taskForMutation(task)) : null"
        >
          <ItemContent :text="task.title" />
          <ItemMeta>
            <span
              class="source-dot"
              :class="deriveDashboardTaskProvenance(task).className"
              :title="getTaskProvenanceTooltip(task)"
            >{{ deriveDashboardTaskProvenance(task).letter }}</span>
            <OverflowMenu
              :open="taskMenuOpen === task._id"
              :title="t('common.actions')"
              @toggle="toggleTaskMenu(taskId(task))"
            >
              <button @click="handleTaskArchive(taskForMutation(task))" class="btn btn-menu-item btn-archive">{{ dashboardTaskActionLabels[0] }}</button>
              <button @click="handleTaskDelete(taskForMutation(task))" class="btn btn-menu-item btn-danger">{{ dashboardTaskActionLabels[1] }}</button>
            </OverflowMenu>
          </ItemMeta>
        </ListItem>
        <li v-if="savedTasks.length === 0" class="dashboard-list-empty">
          <EmptyState :title="showArchived ? t('dashboard.emptyArchivedTitle') : t('dashboard.emptyActiveTitle')" :description="showArchived ? t('dashboard.emptyArchivedDescription') : t('dashboard.emptyActiveDescription')" />
        </li>
      </ListSection>
    </List>
  </div>

</template>

<style scoped>
.dashboard-list-card {
  padding: 0;
  overflow: visible;
}

.dashboard-quick-add {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-subtle);
}

.dashboard-quick-add .input {
  margin-bottom: 0;
}

.dashboard-card-list {
  --dashboard-task-provenance-size: 16px;
  background: transparent;
  border-radius: 0;
}

.dashboard-list-heading {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.dashboard-list-heading-text {
  font-size: var(--font-size-section);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.dashboard-list-empty {
  list-style: none;
}

@media (max-width: 480px) {
  .dashboard-card-list :deep(.list-item) {
    align-items: center;
    flex-direction: row;
  }

  .dashboard-card-list :deep(.item-meta) {
    width: auto;
    justify-content: flex-end;
  }
}

.source-dot {
  width: var(--dashboard-task-provenance-size);
  height: var(--dashboard-task-provenance-size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  background-color: var(--text-muted);
}

.source-dot.provenance-ai {
  background: var(--button-ai-surface);
  border: 1px solid var(--accent-spark);
  color: var(--button-ai-text);
}

</style>
