<script setup>
import { computed, ref, onMounted, watch, watchEffect } from 'vue'
import { generateWeeklyReview, recommendFocus, generateActionPlan, generateTaskDrafts } from '../services/aiService'
import {
  activeTasksSnapshotRef,
  fetchTasks,
  removeTaskFromActiveSnapshot,
  saveTask,
  syncTaskIntoActiveSnapshot,
  tasksRef
} from '../services/taskService'
import { applyDashboardTaskUpdate, removeDashboardTask } from './dashboard.behavior.js'
import { useCockpitSignals } from '../stores/cockpitSignals'
import EmptyState from './ui/EmptyState.vue'
import SegmentedControl from './ui/SegmentedControl.vue'
import Toast from './ui/Toast.vue'
import { List, ListSection, ListItem, ItemContent, ItemMeta } from './ui/list'

const cockpitSignals = useCockpitSignals()

const props = defineProps(['notes', 'projects'])
const emit = defineEmits(['refreshed'])

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const safeNotes = computed(() => Array.isArray(props.notes) ? props.notes : [])
const safeProjects = computed(() => Array.isArray(props.projects) ? props.projects : [])

const recentNotes = computed(() => safeNotes.value.slice(0, 3))
const recentProjects = computed(() => safeProjects.value.slice(0, 3))

const savedTasks = tasksRef
const activeTasksForContext = activeTasksSnapshotRef

// Cockpit signals: lightweight dashboard context for global chat
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

const weeklyReview = ref('')
const isLoading = ref(false)
const focusRecommendation = ref('')
const isLoadingFocus = ref(false)
const actionPlan = ref([])
const isLoadingAction = ref(false)
const taskDrafts = ref([])
const isLoadingDrafts = ref(false)

const isSavingTasks = ref(false)
const taskMenuOpen = ref(null)
const isSavedTaskListExpanded = ref(false)
const savedTaskPreviewLimit = 5

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

// P0-1: Quick Add Task
const quickAddInput = ref('')
const isQuickAdding = ref(false)

// P0-B: Archive visibility toggle
const showArchived = ref(false)
const archiveViewOptions = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]
const hasSavedTaskOverflow = computed(() => savedTasks.value.length > savedTaskPreviewLimit)
const savedTaskToggleLabel = computed(() => {
  if (isSavedTaskListExpanded.value) {
    return 'Show less'
  }
  return hasSavedTaskOverflow.value
    ? `Show all (${savedTasks.value.length})`
    : 'Expand details'
})
const visibleSavedTasks = computed(() => (
  isSavedTaskListExpanded.value
    ? savedTasks.value
    : savedTasks.value.slice(0, savedTaskPreviewLimit)
))
const savedTaskListMode = computed(() => (
  isSavedTaskListExpanded.value ? 'expanded' : 'preview'
))

onMounted(() => fetchTasks(showArchived.value))

// P0-B: Watch toggle and refetch tasks
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
    const newStatus = task.status === 'completed' ? 'active' : 'completed'
    const res = await fetch(`${API_BASE}/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: newStatus === 'completed', status: newStatus })
    })
    const updated = await res.json()
    savedTasks.value = applyDashboardTaskUpdate(savedTasks.value, updated)
    syncTaskIntoActiveSnapshot(updated)
    showToast(newStatus === 'completed' ? 'Task completed' : 'Task reactivated')
    // Notify parent to refresh data (for project focus transition)
    emit('refreshed')
  } catch (e) {
    console.error('Failed to update task:', e)
  }
}

async function handleTaskArchive(task) {
  try {
    const willArchive = !task.archived
    const res = await fetch(`${API_BASE}/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(willArchive ? { archived: true } : { archived: false })
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

// Status mapping: internal enum → user-friendly language
function formatStatus(status) {
  const statusMap = {
    'pending': 'Planning',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'on_hold': 'Paused'
  }
  return statusMap[status] || status
}

function getSourceColor(task) {
  // Priority: use new creationMode field
  if (task.creationMode === 'ai') {
    return '#DAA520'
  }
  if (task.creationMode === 'manual') {
    return '#6b7280'
  }
  return '#999' // Ultimate fallback
}

function getSourceLetter(task) {
  // Canonical: only use originModule field
  const originModule = task.originModule?.toLowerCase() || ''
  if (originModule.includes('note')) {
    return 'N'
  }
  if (originModule.includes('project')) {
    return 'P'
  }
  if (originModule === 'dashboard') {
    return 'D'
  }
  return '?' // Ultimate fallback
}

// Hotfix-1: Helper to get provenance class for semantic styling
function getProvenanceClass(task) {
  // Canonical: only use creationMode
  if (task.creationMode === 'ai') {
    return 'provenance-ai'
  }
  if (task.creationMode === 'manual') {
    return 'provenance-manual'
  }
  return ''
}

// Hotfix-1: Helper to get tooltip text for source dot
function getSourceTooltip(task) {
  if (task.creationMode === 'ai') {
    return 'AI generated'
  }
  if (task.originModule === 'dashboard') {
    return 'Dashboard quick add'
  }
  if (task.originModule === 'note') {
    return 'Note task'
  }
  if (task.originModule === 'project') {
    return 'Project task'
  }
  return 'Manual'
}

async function handleSaveDraftsAsTasks() {
  isSavingTasks.value = true
  try {
    for (const draft of taskDrafts.value) {
      await saveTask(
        draft.title,
        draft.creationMode || 'ai',
        draft.originModule || 'dashboard',
        draft.originId || null
      )
    }
    await fetchTasks(showArchived.value)
    showToast(`Saved ${taskDrafts.value.length} task(s)`)
    taskDrafts.value = []
  } catch (e) {
    showToast('Failed to save tasks', 'error')
  } finally {
    isSavingTasks.value = false
  }
}

async function handleGenerateReview() {
  isLoading.value = true
  try {
    const { review } = await generateWeeklyReview(safeNotes.value, safeProjects.value)
    weeklyReview.value = review
    showToast('Review generated')
  } catch (e) {
    weeklyReview.value = 'Failed to generate review'
  } finally {
    isLoading.value = false
  }
}

async function handleRecommendFocus() {
  isLoadingFocus.value = true
  try {
    const { recommendation } = await recommendFocus(safeNotes.value, safeProjects.value)
    focusRecommendation.value = recommendation
    showToast('Focus recommended')
  } catch (e) {
    focusRecommendation.value = 'Failed to get recommendation'
  } finally {
    isLoadingFocus.value = false
  }
}

async function handleGenerateActionPlan() {
  isLoadingAction.value = true
  try {
    const { actions } = await generateActionPlan(
      safeNotes.value,
      safeProjects.value,
      focusRecommendation.value || undefined
    )
    actionPlan.value = actions
    showToast('Action plan generated')
  } catch (e) {
    actionPlan.value = ['Failed to generate action plan']
  } finally {
    isLoadingAction.value = false
  }
}

async function handleGenerateTaskDrafts() {
  isLoadingDrafts.value = true
  try {
    const { drafts } = await generateTaskDrafts(
      safeNotes.value,
      safeProjects.value,
      actionPlan.value || undefined
    )
    taskDrafts.value = drafts
    showToast('Drafts generated')
  } catch (e) {
    taskDrafts.value = [{ title: 'Failed to generate drafts', source: 'error' }]
  } finally {
    isLoadingDrafts.value = false
  }
}
</script>

<template>
  <Toast :message="toastMessage" :type="toastType" :visible="toast" />

  <div class="dashboard">
    <h2 class="dashboard-title">Today</h2>

    <!-- Quick Add Task - P0-1 -->
    <div class="quick-add-section">
      <input
        v-model="quickAddInput"
        placeholder="Quick add task... (e.g., 去拿快递)"
        @keyup.enter="handleQuickAddTask"
        :disabled="isQuickAdding"
        class="input quick-add-input"
      />
    </div>

    <div class="card tasks-execution-zone">
      <List
        class="dashboard-saved-task-list"
        :mode="savedTaskListMode"
        @click="closeTaskMenu"
      >
        <ListSection
          class="dashboard-saved-task-section"
          :aria-label="showArchived ? 'Archived saved tasks' : 'Active saved tasks'"
        >
          <template #title>
            <div class="dashboard-saved-task-section-heading">
              <span class="dashboard-saved-task-section-heading-text">Saved Tasks</span>
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
              class="btn btn-ghost btn-sm dashboard-saved-task-toggle"
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
            :interactive="!showArchived"
            :muted="task.completed || task.status === 'completed'"
            :archived="showArchived"
            :raised="taskMenuOpen === task._id"
            :role="!showArchived ? 'button' : undefined"
            :tabindex="!showArchived ? 0 : undefined"
            :aria-pressed="!showArchived ? task.completed || task.status === 'completed' : undefined"
            @click="!showArchived ? handleTaskComplete(task) : null"
            @keydown.enter.prevent="!showArchived ? handleTaskComplete(task) : null"
            @keydown.space.prevent="!showArchived ? handleTaskComplete(task) : null"
          >
            <ItemContent :text="task.title" />
            <ItemMeta>
              <span
                class="source-dot"
                :class="getProvenanceClass(task)"
                :title="getSourceTooltip(task)"
              >{{ getSourceLetter(task) }}</span>
              <div class="task-menu-container" @click.stop @keydown.stop>
                <button @click.stop="toggleTaskMenu(task._id)" class="btn btn-overflow task-menu-btn" :class="{ active: taskMenuOpen === task._id }" title="Actions">
                  <svg class="menu-icon-svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
                </button>
                <div v-if="taskMenuOpen === task._id" class="task-menu-dropdown panel-surface-menu" @click.stop>
                  <button @click="handleTaskArchive(task)" class="btn btn-menu-item btn-archive menu-item">{{ showArchived ? 'Restore' : 'Archive' }}</button>
                  <button @click="handleTaskDelete(task)" class="btn btn-menu-item btn-danger menu-item delete">Delete</button>
                </div>
              </div>
            </ItemMeta>
          </ListItem>
          <li v-if="savedTasks.length === 0" class="dashboard-saved-task-empty">
            <EmptyState :title="showArchived ? 'No archived tasks' : 'No saved tasks yet'" :description="showArchived ? 'Archive tasks to see them here' : 'Add tasks from AI drafts or quick add above'" />
          </li>
        </ListSection>
      </List>
    </div>

    <div class="card">
      <h3 class="card-title">Recent Notes</h3>
      <EmptyState v-if="recentNotes.length === 0" title="No notes yet" />
      <div v-for="note in recentNotes" :key="note._id" class="mini-item">
        <strong>{{ note.title }}</strong>
        <span class="date">{{ new Date(note.createdAt).toLocaleDateString() }}</span>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">Projects</h3>
      <EmptyState v-if="recentProjects.length === 0" title="No projects yet" />
      <div v-for="project in recentProjects" :key="project._id" class="mini-item">
        <strong>{{ project.name }}</strong>
        <span class="status">{{ formatStatus(project.status) }}</span>
      </div>
    </div>

    <div class="ai-workflow">
      <h3 class="ai-section-title">AI Assistant</h3>

      <div class="workflow-step">
        <div class="step-header">
          <h4 class="step-title">1. Weekly Review</h4>
        </div>
        <button @click="handleGenerateReview" class="btn btn-ai ai-btn" :disabled="isLoading">
          {{ isLoading ? 'Generating...' : 'Generate Review' }}
        </button>
        <div v-if="weeklyReview" class="weekly-review">{{ weeklyReview }}</div>
      </div>

      <div class="workflow-step">
        <div class="step-header">
          <h4 class="step-title">2. Focus</h4>
        </div>
        <button @click="handleRecommendFocus" class="btn btn-ai ai-btn" :disabled="isLoadingFocus">
          {{ isLoadingFocus ? 'Analyzing...' : 'Get Focus' }}
        </button>
        <div v-if="focusRecommendation" class="focus-recommendation">{{ focusRecommendation }}</div>
      </div>

      <div class="workflow-step">
        <div class="step-header">
          <h4 class="step-title">3. Action Plan</h4>
        </div>
        <button @click="handleGenerateActionPlan" class="btn btn-ai ai-btn" :disabled="isLoadingAction">
          {{ isLoadingAction ? 'Generating...' : 'Create Plan' }}
        </button>
        <div v-if="actionPlan.length > 0" class="action-plan">
          <div class="action-item" v-for="(action, idx) in actionPlan" :key="idx">{{ idx + 1 }}. {{ action }}</div>
        </div>
      </div>

      <div class="workflow-step">
        <div class="step-header">
          <h4 class="step-title">4. Task Drafts</h4>
        </div>
        <button @click="handleGenerateTaskDrafts" class="btn btn-ai ai-btn" :disabled="isLoadingDrafts">
          {{ isLoadingDrafts ? 'Generating...' : 'Create Drafts' }}
        </button>
        <div v-if="taskDrafts.length > 0" class="task-drafts">
          <div class="draft-item" v-for="(draft, idx) in taskDrafts" :key="idx">
            <span class="draft-title">{{ draft.title }}</span>
            <span class="draft-source">[{{ draft.source }}]</span>
          </div>
          <button @click="handleSaveDraftsAsTasks" class="btn btn-primary save-btn" :disabled="isSavingTasks">
            {{ isSavingTasks ? 'Saving...' : 'Save to Tasks' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.dashboard {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background: #f9f9f9;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
}

/* Hotfix-2: Quick Add Section - Light weight, integrated style */
.quick-add-section {
  margin-bottom: 16px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.quick-add-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.quick-add-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.15), 0 2px 4px rgba(0, 0, 0, 0.05);
}

.quick-add-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.quick-add-success {
  margin-top: 6px;
  font-size: 11px;
  color: #10b981;
  padding-left: 4px;
}

/* .recent-section now uses .card baseline */

.mini-item {
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.mini-item .date, .mini-item .status {
  color: #999;
  font-size: 11px;
}

/* Empty states use EmptyState component */

.ai-workflow {
  margin-top: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.ai-section-title {
  font-size: 13px;
  margin: 0 0 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.workflow-step {
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.workflow-step > * {
  flex: 1 1 100%;
}

.workflow-step .step-header {
  flex: 1 1 auto;
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.workflow-step .ai-btn,
.workflow-step .btn-ai {
  flex: 0 0 auto;
  margin-left: auto;
}

.workflow-step:last-child {
  margin-bottom: 0;
}

.step-header {
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.step-title {
  font-size: 13px;
  margin: 0;
  color: #666;
  font-weight: 500;
}

.step-success {
  margin-top: 6px;
  color: #10b981;
  font-size: 11px;
}

/* .ai-btn now uses global .btn .btn-ai baseline */

.weekly-review {
  margin-top: 8px;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
  border-left: 2px solid #42b883;
}

.focus-recommendation {
  margin-top: 8px;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
  border-left: 2px solid #6366f1;
}

.action-plan {
  margin-top: 8px;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
  border-left: 2px solid #f59e0b;
}

.action-item {
  padding: 3px 0;
}

.task-drafts {
  margin-top: 8px;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
  border-left: 2px solid #ec4899;
}

.draft-item {
  padding: 4px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.draft-source {
  font-size: 10px;
  color: #ec4899;
  background: #fdf2f8;
  padding: 2px 6px;
  border-radius: 3px;
}

.save-btn {
  /* Uses global .btn .btn-primary for color/styles */
  margin-top: 6px;
  padding: 5px 10px;
  font-size: 11px;
}

.save-success {
  margin-top: 6px;
  color: #10b981;
  font-size: 11px;
}

.tasks-execution-zone {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.task-action-success {
  color: #10b981;
  font-size: 12px;
}

.dashboard-saved-task-list {
  --dashboard-task-provenance-size: 16px;
  border: none;
}

.dashboard-saved-task-section-heading {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.dashboard-saved-task-section-heading-text {
  font-size: var(--font-size-section);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.dashboard-saved-task-empty {
  list-style: none;
}

@media (max-width: 480px) {
  .dashboard-saved-task-list :deep(.list-item) {
    align-items: center;
    flex-direction: row;
  }

  .dashboard-saved-task-list :deep(.item-meta) {
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
  background-color: var(--text-muted); /* Default fallback */
}

/* Provenance color variants using semantic tokens */
.source-dot.provenance-ai {
  background-color: #DAA520 !important;
}

.source-dot.provenance-manual {
  background-color: #6b7280 !important;
}

.source-dot.provenance-project {
  background-color: #3498db !important;
}

.source-dot.provenance-note {
  background-color: #9b59b6 !important;
}

.task-menu-container {
  position: relative;
  margin-left: 4px;
}

.menu-item {
  box-shadow: none;
}

.menu-item.delete {
  font-weight: var(--font-weight-medium);
}

.empty-tasks {
  color: #999;
  padding: 16px;
  font-size: 12px;
  text-align: center;
  background: white;
  border-radius: 8px;
  border: 1px dashed #ddd;
}
</style>
