<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { generateWeeklyReview, recommendFocus, generateActionPlan, generateTaskDrafts } from '../services/aiService'
import { tasksRef, fetchTasks } from '../services/taskService'
import EmptyState from './ui/EmptyState.vue'

const props = defineProps(['notes', 'projects'])
const emit = defineEmits(['refreshed'])

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const safeNotes = computed(() => Array.isArray(props.notes) ? props.notes : [])
const safeProjects = computed(() => Array.isArray(props.projects) ? props.projects : [])

const recentNotes = computed(() => safeNotes.value.slice(0, 3))
const recentProjects = computed(() => safeProjects.value.slice(0, 3))

const weeklyReview = ref('')
const isLoading = ref(false)
const focusRecommendation = ref('')
const isLoadingFocus = ref(false)
const actionPlan = ref([])
const isLoadingAction = ref(false)
const taskDrafts = ref([])
const isLoadingDrafts = ref(false)

const savedTasks = tasksRef
const isSavingTasks = ref(false)

const saveSuccess = ref('')
const reviewSuccess = ref('')
const focusSuccess = ref('')
const actionSuccess = ref('')
const draftsSuccess = ref('')
const taskActionSuccess = ref('')
const taskMenuOpen = ref(null)

// P0-2: Task Expand
const expandedTasks = ref(new Set())

// P0-1: Quick Add Task
const quickAddInput = ref('')
const isQuickAdding = ref(false)
const quickAddSuccess = ref('')

// P0-B: Archive visibility toggle
const showArchived = ref(false)

onMounted(() => fetchTasks(showArchived.value))

// P0-B: Watch toggle and refetch tasks
watch(showArchived, (newValue) => {
  fetchTasks(newValue)
})

async function handleQuickAddTask() {
  const title = quickAddInput.value.trim()
  if (!title) return

  isQuickAdding.value = true
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        creationMode: 'manual',
        originModule: 'dashboard',
        originId: null,
        originLabel: ''
      })
    })
    const newTask = await res.json()
    if (newTask) {
      tasksRef.value.unshift(newTask)
      quickAddSuccess.value = 'Task added'
      quickAddInput.value = ''
      setTimeout(() => { quickAddSuccess.value = '' }, 2000)
    }
  } catch (e) {
    console.error('Failed to quick add task:', e)
    quickAddSuccess.value = 'Failed to add'
    setTimeout(() => { quickAddSuccess.value = '' }, 2000)
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
    task.status = updated.status
    task.completed = updated.completed
    taskActionSuccess.value = newStatus === 'completed' ? 'Task completed' : 'Task reactivated'
    setTimeout(() => { taskActionSuccess.value = '' }, 2000)
    // Notify parent to refresh data (for project focus transition)
    emit('refreshed')
  } catch (e) {
    console.error('Failed to update task:', e)
  }
}

async function handleTaskArchive(task) {
  try {
    const newStatus = task.status === 'archived' ? 'active' : 'archived'
    await fetch(`${API_BASE}/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    savedTasks.value = savedTasks.value.filter(t => t._id !== task._id)
    // Fix: Clear menu open state when task is archived/restored
    if (taskMenuOpen.value === task._id) {
      taskMenuOpen.value = null
    }
    taskActionSuccess.value = newStatus === 'archived' ? 'Task archived' : 'Task restored'
    setTimeout(() => { taskActionSuccess.value = '' }, 2000)
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
    savedTasks.value = savedTasks.value.filter(t => t._id !== task._id)
    // Fix: Clear menu open state when task is deleted
    if (taskMenuOpen.value === task._id) {
      taskMenuOpen.value = null
    }
    taskActionSuccess.value = 'Task deleted'
    setTimeout(() => { taskActionSuccess.value = '' }, 2000)
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

// P0-2: Toggle task expand
function toggleTaskExpand(taskId) {
  if (expandedTasks.value.has(taskId)) {
    expandedTasks.value.delete(taskId)
  } else {
    expandedTasks.value.add(taskId)
  }
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
    if (task.originModule === 'project_suggestion') {
      return 'AI suggestion → Focus'
    }
    return 'AI generated'
  }
  if (task.originModule === 'project_focus') {
    return 'Manual focus'
  }
  if (task.originModule === 'dashboard') {
    return 'Dashboard quick add'
  }
  return task.originModule || 'Manual'
}

async function handleSaveDraftsAsTasks() {
  isSavingTasks.value = true
  try {
    for (const draft of taskDrafts.value) {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          creationMode: draft.creationMode || draft.source || 'manual',
          originModule: draft.originModule || '',
          originId: draft.originId || null,
          originLabel: draft.originLabel || ''
        })
      })
    }
    await fetchTasks()
    saveSuccess.value = `Saved ${taskDrafts.value.length} task(s)`
    taskDrafts.value = []
    setTimeout(() => { saveSuccess.value = '' }, 3000)
  } catch (e) {
    saveSuccess.value = 'Failed to save tasks'
    setTimeout(() => { saveSuccess.value = '' }, 3000)
  } finally {
    isSavingTasks.value = false
  }
}

async function handleGenerateReview() {
  isLoading.value = true
  reviewSuccess.value = ''
  try {
    const { review } = await generateWeeklyReview(safeNotes.value, safeProjects.value)
    weeklyReview.value = review
    reviewSuccess.value = 'Review generated'
    setTimeout(() => { reviewSuccess.value = '' }, 2000)
  } catch (e) {
    weeklyReview.value = 'Failed to generate review'
  } finally {
    isLoading.value = false
  }
}

async function handleRecommendFocus() {
  isLoadingFocus.value = true
  focusSuccess.value = ''
  try {
    const { recommendation } = await recommendFocus(safeNotes.value, safeProjects.value)
    focusRecommendation.value = recommendation
    focusSuccess.value = 'Focus recommended'
    setTimeout(() => { focusSuccess.value = '' }, 2000)
  } catch (e) {
    focusRecommendation.value = 'Failed to get recommendation'
  } finally {
    isLoadingFocus.value = false
  }
}

async function handleGenerateActionPlan() {
  isLoadingAction.value = true
  actionSuccess.value = ''
  try {
    const { actions } = await generateActionPlan(
      safeNotes.value,
      safeProjects.value,
      focusRecommendation.value || undefined
    )
    actionPlan.value = actions
    actionSuccess.value = 'Action plan generated'
    setTimeout(() => { actionSuccess.value = '' }, 2000)
  } catch (e) {
    actionPlan.value = ['Failed to generate action plan']
  } finally {
    isLoadingAction.value = false
  }
}

async function handleGenerateTaskDrafts() {
  isLoadingDrafts.value = true
  draftsSuccess.value = ''
  try {
    const { drafts } = await generateTaskDrafts(
      safeNotes.value,
      safeProjects.value,
      actionPlan.value || undefined
    )
    taskDrafts.value = drafts
    draftsSuccess.value = 'Drafts generated'
    setTimeout(() => { draftsSuccess.value = '' }, 2000)
  } catch (e) {
    taskDrafts.value = [{ title: 'Failed to generate drafts', source: 'error' }]
  } finally {
    isLoadingDrafts.value = false
  }
}
</script>

<template>
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
      <div v-if="quickAddSuccess" class="quick-add-success">{{ quickAddSuccess }}</div>
    </div>

    <div class="tasks-execution-zone">
      <div class="zone-header">
        <h3 class="zone-title">Saved Tasks</h3>
        <div class="zone-controls">
          <div v-if="taskActionSuccess" class="task-action-success">{{ taskActionSuccess }}</div>
          <div class="archive-toggle">
            <button
              @click="showArchived = false"
              :class="['toggle-btn', { active: !showArchived }]"
            >Active</button>
            <button
              @click="showArchived = true"
              :class="['toggle-btn', { active: showArchived }]"
            >Archived</button>
          </div>
        </div>
      </div>
      <div v-if="savedTasks.length > 0" class="saved-tasks-list" @click="closeTaskMenu">
        <div
          class="saved-task-item"
          :class="{ completed: task.completed, expanded: expandedTasks.has(task._id) }"
          v-for="task in savedTasks"
          :key="task._id"
          @click="toggleTaskExpand(task._id)"
        >
          <input v-if="!showArchived" type="checkbox" class="task-checkbox" :checked="task.completed" @change="handleTaskComplete(task)" @click.stop>
          <span class="task-title" :title="task.title">{{ task.title }}</span>
          <span
            class="source-dot"
            :class="getProvenanceClass(task)"
            :title="getSourceTooltip(task)"
          >{{ getSourceLetter(task) }}</span>
          <div class="task-menu-container">
            <button @click="toggleTaskMenu(task._id)" class="task-menu-btn" :class="{ active: taskMenuOpen === task._id }" @click.stop title="Actions">
              <span class="menu-icon">⋯</span>
            </button>
            <div v-if="taskMenuOpen === task._id" class="task-menu-dropdown" @click.stop>
              <button @click="handleTaskArchive(task)" class="menu-item">{{ showArchived ? 'Restore' : 'Archive' }}</button>
              <button @click="handleTaskDelete(task)" class="menu-item delete">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else :title="showArchived ? 'No archived tasks' : 'No saved tasks yet'" :description="showArchived ? 'Archive tasks to see them here' : 'Add tasks from AI drafts or quick add above'" />
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
        <div v-if="reviewSuccess" class="step-success">{{ reviewSuccess }}</div>
        <div v-if="weeklyReview" class="weekly-review">{{ weeklyReview }}</div>
      </div>

      <div class="workflow-step">
        <div class="step-header">
          <h4 class="step-title">2. Focus</h4>
        </div>
        <button @click="handleRecommendFocus" class="btn btn-ai ai-btn" :disabled="isLoadingFocus">
          {{ isLoadingFocus ? 'Analyzing...' : 'Get Focus' }}
        </button>
        <div v-if="focusSuccess" class="step-success">{{ focusSuccess }}</div>
        <div v-if="focusRecommendation" class="focus-recommendation">{{ focusRecommendation }}</div>
      </div>

      <div class="workflow-step">
        <div class="step-header">
          <h4 class="step-title">3. Action Plan</h4>
        </div>
        <button @click="handleGenerateActionPlan" class="btn btn-ai ai-btn" :disabled="isLoadingAction">
          {{ isLoadingAction ? 'Generating...' : 'Create Plan' }}
        </button>
        <div v-if="actionSuccess" class="step-success">{{ actionSuccess }}</div>
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
        <div v-if="draftsSuccess" class="step-success">{{ draftsSuccess }}</div>
        <div v-if="taskDrafts.length > 0" class="task-drafts">
          <div class="draft-item" v-for="(draft, idx) in taskDrafts" :key="idx">
            <span class="draft-title">{{ draft.title }}</span>
            <span class="draft-source">[{{ draft.source }}]</span>
          </div>
          <button @click="handleSaveDraftsAsTasks" class="btn btn-primary save-btn" :disabled="isSavingTasks">
            {{ isSavingTasks ? 'Saving...' : 'Save to Tasks' }}
          </button>
          <div v-if="saveSuccess" class="save-success">{{ saveSuccess }}</div>
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
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 2px solid #42b883;
  box-shadow: 0 2px 8px rgba(66, 184, 131, 0.1);
}

.zone-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zone-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zone-title {
  font-size: 16px;
  margin: 0;
  color: #42b883;
  font-weight: 600;
}

.task-action-success {
  color: #10b981;
  font-size: 12px;
}

/* P0-B: Archive toggle */
.archive-toggle {
  display: flex;
  gap: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.toggle-btn {
  padding: 6px 12px;
  font-size: 12px;
  border: none;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}

.toggle-btn:hover {
  background: #e8e8e8;
}

.toggle-btn.active {
  background: #42b883;
  color: white;
}

.saved-tasks-list {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.saved-task-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.saved-task-item:last-child {
  border-bottom: none;
}

.saved-task-item.completed .task-title {
  text-decoration: line-through;
  opacity: 0.5;
}

.task-checkbox {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.task-title {
  flex: 1;
  font-size: 13px;
  color: #333;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  line-height: 1.5;
  padding: 2px 0;
}

/* Hotfix-3: Expanded state - only change white-space, no display change to avoid drift */
.saved-task-item.expanded .task-title {
  white-space: normal;
  word-break: break-word;
  overflow: visible;
}

.source-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: white;
  margin-left: 6px;
  flex-shrink: 0;
  background-color: var(--text-muted); /* Default fallback */
}

/* Provenance color variants using semantic tokens */
.source-dot.provenance-ai {
  background-color: var(--provenance-ai) !important;
}

.source-dot.provenance-manual {
  background-color: var(--provenance-manual) !important;
}

.source-dot.provenance-project {
  background-color: var(--provenance-project) !important;
}

.source-dot.provenance-note {
  background-color: var(--provenance-note) !important;
}

.task-menu-container {
  position: relative;
  margin-left: 4px;
}

.task-menu-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: background 0.15s;
}

.task-menu-btn:hover {
  background: #f5f5f5;
}

.task-menu-btn.active {
  background: #e5e5e5;
}

.menu-icon {
  font-size: 18px;
  line-height: 1;
}

.task-menu-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 10;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  padding: 10px 16px;
  background: white;
  border: none;
  text-align: left;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.delete {
  color: #dc2626;
}

.menu-item.delete:hover {
  background: #fee2e2;
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
