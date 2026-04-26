<script setup>
import { computed, ref, onMounted, watch, watchEffect } from 'vue'
import {
  activeTasksSnapshotRef,
  fetchTasks,
  removeTaskFromActiveSnapshot,
  saveTask,
  syncTaskIntoActiveSnapshot,
  tasksRef
} from '../services/taskService'
import {
  applyDashboardTaskUpdate,
  buildDashboardTaskArchivePayload,
  buildDashboardTaskCompletionPayload,
  deriveDashboardTaskProvenance,
  deriveDashboardTaskRowState,
  getDashboardTaskActions,
  getDashboardTaskListMode,
  getDashboardTaskToggleLabel,
  getVisibleDashboardTasks,
  removeDashboardTask
} from './dashboard.behavior.js'
import { useCockpitSignals } from '../stores/cockpitSignals'
import EmptyState from './ui/EmptyState.vue'
import OverflowMenu from './ui/OverflowMenu.vue'
import SegmentedControl from './ui/SegmentedControl.vue'
import Toast from './ui/Toast.vue'
import { List, ListSection, ListItem, ItemContent, ItemMeta } from './ui/list'

const cockpitSignals = useCockpitSignals()

const props = defineProps(['projects'])
const emit = defineEmits(['refreshed'])

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const safeProjects = computed(() => Array.isArray(props.projects) ? props.projects : [])

const savedTasks = tasksRef
const activeTasksForContext = activeTasksSnapshotRef

// Temporary bridge: Dashboard still pre-hydrates cockpit signals for the
// global ChatEntry. Future AI core context-layer work should own this instead.
const activeProjectsCount = computed(() =>
  safeProjects.value.filter(p => !p.archived).length
)
const activeTasksCount = computed(() =>
  activeTasksForContext.value.filter(t => !t.archived && t.status !== 'completed').length
)
const pinnedProjectName = computed(() => {
  const pinned = safeProjects.value.find(p => p.isPinned && !p.archived)
  return pinned?.name || ''
})
const currentNextAction = computed(() => {
  const focusProject = safeProjects.value.find(
    p => !p.archived && p.currentFocusTaskId
  )
  if (focusProject) {
    const focusTask = activeTasksForContext.value.find(
      t => String(t._id) === String(focusProject.currentFocusTaskId)
    )
    if (focusTask?.title) {
      return focusTask.title
    }
  }
  return ''
})

watchEffect(() => {
  cockpitSignals.setSignals({
    activeProjectsCount: activeProjectsCount.value,
    activeTasksCount: activeTasksCount.value,
    pinnedProjectName: pinnedProjectName.value,
    currentNextAction: currentNextAction.value,
  })
})

const taskMenuOpen = ref(null)
const isSavedTaskListExpanded = ref(false)

// Toast notifications
const toast = ref(null)
const toastMessage = ref('')
const toastType = ref('success')

function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  toast.value = true
  setTimeout(() => {
    toast.value = false
  }, 3000)
}

const quickAddInput = ref('')
const isQuickAdding = ref(false)

const showArchived = ref(false)
const archiveViewOptions = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]
const savedTaskToggleLabel = computed(() => getDashboardTaskToggleLabel(savedTasks.value, isSavedTaskListExpanded.value))
const visibleSavedTasks = computed(() => getVisibleDashboardTasks(savedTasks.value, isSavedTaskListExpanded.value))
const savedTaskListMode = computed(() => getDashboardTaskListMode(isSavedTaskListExpanded.value))

onMounted(() => fetchTasks(showArchived.value))

watch(showArchived, (newValue) => {
  isSavedTaskListExpanded.value = false
  closeTaskMenu()
  fetchTasks(newValue)
})

function setArchiveView(view) {
  showArchived.value = view === 'archived'
}

async function handleQuickAddTask() {
  const title = quickAddInput.value.trim()
  if (!title) return

  isQuickAdding.value = true
  try {
    const newTask = await saveTask(title, 'manual', 'dashboard', null)
    if (newTask) {
      showToast('Task added')
      quickAddInput.value = ''
    }
  } catch (e) {
    console.error('Failed to quick add task:', e)
    showToast('Failed to add', 'error')
  } finally {
    isQuickAdding.value = false
  }
}

async function handleTaskComplete(task) {
  try {
    const payload = buildDashboardTaskCompletionPayload(task)
    const res = await fetch(`${API_BASE}/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const updated = await res.json()
    savedTasks.value = applyDashboardTaskUpdate(savedTasks.value, updated)
    syncTaskIntoActiveSnapshot(updated)
    showToast(payload.status === 'completed' ? 'Task completed' : 'Task reactivated')
    // Notify parent to refresh data (for project focus transition)
    emit('refreshed')
  } catch (e) {
    console.error('Failed to update task:', e)
  }
}

async function handleTaskArchive(task) {
  try {
    const payload = buildDashboardTaskArchivePayload(task)
    const res = await fetch(`${API_BASE}/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const updated = await res.json()
    savedTasks.value = removeDashboardTask(savedTasks.value, updated._id)
    syncTaskIntoActiveSnapshot(updated)
    // Fix: Clear menu open state when task is archived/restored
    if (taskMenuOpen.value === task._id) {
      taskMenuOpen.value = null
    }
    showToast(updated.archived ? 'Task archived' : 'Task restored')
  } catch (e) {
    console.error('Failed to archive task:', e)
  }
}

async function handleTaskDelete(task) {
  if (!confirm('Delete this task? This cannot be undone.')) {
    return
  }
  try {
    await fetch(`${API_BASE}/tasks/${task._id}`, {
      method: 'DELETE'
    })
    savedTasks.value = removeDashboardTask(savedTasks.value, task._id)
    removeTaskFromActiveSnapshot(task._id)
    // Fix: Clear menu open state when task is deleted
    if (taskMenuOpen.value === task._id) {
      taskMenuOpen.value = null
    }
    showToast('Task deleted')
  } catch (e) {
    console.error('Failed to delete task:', e)
  }
}

function toggleTaskMenu(taskId) {
  if (taskMenuOpen.value === taskId) {
    taskMenuOpen.value = null
  } else {
    taskMenuOpen.value = taskId
  }
}

function closeTaskMenu() {
  taskMenuOpen.value = null
}

function toggleSavedTaskListExpanded() {
  isSavedTaskListExpanded.value = !isSavedTaskListExpanded.value
  closeTaskMenu()
}
</script>

<template>
  <Toast :message="toastMessage" :type="toastType" :visible="toast" />

  <div class="card dashboard-list-card">
    <div class="dashboard-quick-add">
      <input
        v-model="quickAddInput"
        placeholder="Quick add task... (e.g., 去拿快递)"
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
      <ListSection :aria-label="showArchived ? 'Archived saved tasks' : 'Active saved tasks'">
        <template #title>
          <div class="dashboard-list-heading">
            <span class="dashboard-list-heading-text">Saved Tasks</span>
            <SegmentedControl
              :model-value="showArchived ? 'archived' : 'active'"
              :options="archiveViewOptions"
              variant="page"
              aria-label="Dashboard task archive view"
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
            {{ savedTaskToggleLabel }}
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
          @click="deriveDashboardTaskRowState(task, showArchived).interactive ? handleTaskComplete(task) : null"
          @keydown.enter.prevent="deriveDashboardTaskRowState(task, showArchived).interactive ? handleTaskComplete(task) : null"
          @keydown.space.prevent="deriveDashboardTaskRowState(task, showArchived).interactive ? handleTaskComplete(task) : null"
        >
          <ItemContent :text="task.title" />
          <ItemMeta>
            <span
              class="source-dot"
              :class="deriveDashboardTaskProvenance(task).className"
              :title="deriveDashboardTaskProvenance(task).tooltip"
            >{{ deriveDashboardTaskProvenance(task).letter }}</span>
            <OverflowMenu
              :open="taskMenuOpen === task._id"
              title="Actions"
              @toggle="toggleTaskMenu(task._id)"
            >
              <button @click="handleTaskArchive(task)" class="btn btn-menu-item btn-archive">{{ getDashboardTaskActions(showArchived)[0] }}</button>
              <button @click="handleTaskDelete(task)" class="btn btn-menu-item btn-danger">{{ getDashboardTaskActions(showArchived)[1] }}</button>
            </OverflowMenu>
          </ItemMeta>
        </ListItem>
        <li v-if="savedTasks.length === 0" class="dashboard-list-empty">
          <EmptyState :title="showArchived ? 'No archived tasks' : 'No saved tasks yet'" :description="showArchived ? 'Archive tasks to see them here' : 'Add tasks from quick add above'" />
        </li>
      </ListSection>
    </List>
  </div>

</template>

<style scoped>
.dashboard-list-card {
  padding: 0;
  overflow: hidden;
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
