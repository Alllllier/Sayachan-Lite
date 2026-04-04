<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { generateWeeklyReview, recommendFocus, generateActionPlan, generateTaskDrafts } from '../services/aiService'
import { tasksRef, fetchTasks } from '../services/taskService'

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

onMounted(fetchTasks)

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
    await fetch(`${API_BASE}/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' })
    })
    savedTasks.value = savedTasks.value.filter(t => t._id !== task._id)
    taskActionSuccess.value = 'Task archived'
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

function getSourceColor(task) {
  // Priority: use new creationMode field
  if (task.creationMode === 'ai') {
    return '#DAA520'
  }
  if (task.creationMode === 'manual') {
    return '#6b7280'
  }
  // Legacy: fallback to old source field for historical data
  if (task.source === 'ai') {
    return '#DAA520'
  }
  if (task.source === 'manual') {
    return '#6b7280'
  }
  return '#999' // Ultimate fallback
}

function getSourceLetter(task) {
  // Priority: use new originModule field
  const originModule = task.originModule?.toLowerCase() || ''
  if (originModule.includes('note')) {
    return 'N'
  }
  if (originModule.includes('project')) {
    return 'P'
  }
  // Legacy: fallback to old sourceDetail field for historical data
  const sourceDetail = task.sourceDetail?.toLowerCase() || task.projectName?.toLowerCase() || ''
  if (sourceDetail.includes('note')) {
    return 'N'
  }
  if (sourceDetail.includes('project')) {
    return 'P'
  }
  return '?' // Ultimate fallback
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
          originLabel: draft.originLabel || '',
          // Legacy fields for compatibility
          source: draft.creationMode || draft.source || 'manual',
          sourceDetail: draft.originModule || '',
          projectId: null,
          projectName: ''
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

    <div class="tasks-execution-zone">
      <div class="zone-header">
        <h3 class="zone-title">Saved Tasks</h3>
        <div v-if="taskActionSuccess" class="task-action-success">{{ taskActionSuccess }}</div>
      </div>
      <div v-if="savedTasks.length > 0" class="saved-tasks-list" @click="closeTaskMenu">
        <div class="saved-task-item" :class="{ completed: task.status === 'completed' }" v-for="task in savedTasks" :key="task._id">
          <input type="checkbox" class="task-checkbox" :checked="task.status === 'completed'" @change="handleTaskComplete(task)" @click.stop>
          <span class="task-title">{{ task.title }}</span>
          <span class="source-dot" :style="{ backgroundColor: getSourceColor(task) }" :title="task.originModule || task.sourceDetail">{{ getSourceLetter(task) }}</span>
          <div class="task-menu-container">
            <button @click="toggleTaskMenu(task._id)" class="task-menu-btn" :class="{ active: taskMenuOpen === task._id }" @click.stop title="Actions">
              <span class="menu-icon">⋯</span>
            </button>
            <div v-if="taskMenuOpen === task._id" class="task-menu-dropdown" @click.stop>
              <button @click="handleTaskArchive(task)" class="menu-item">Archive</button>
              <button @click="handleTaskDelete(task)" class="menu-item delete">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-tasks">No saved tasks yet</div>
    </div>

    <div class="recent-section">
      <h3>Recent Notes</h3>
      <div v-if="recentNotes.length === 0" class="empty">No notes yet</div>
      <div v-for="note in recentNotes" :key="note._id" class="mini-item">
        <strong>{{ note.title }}</strong>
        <span class="date">{{ new Date(note.createdAt).toLocaleDateString() }}</span>
      </div>
    </div>

    <div class="recent-section">
      <h3>Projects</h3>
      <div v-if="recentProjects.length === 0" class="empty">No projects yet</div>
      <div v-for="project in recentProjects" :key="project._id" class="mini-item">
        <strong>{{ project.name }}</strong>
        <span class="status">{{ project.status }}</span>
      </div>
    </div>

    <div class="ai-workflow">
      <h3 class="ai-section-title">AI Assistant</h3>

      <div class="workflow-step">
        <div class="step-header">
          <h4 class="step-title">1. Weekly Review</h4>
        </div>
        <button @click="handleGenerateReview" class="ai-btn" :disabled="isLoading">
          {{ isLoading ? 'Generating...' : 'Generate Review' }}
        </button>
        <div v-if="reviewSuccess" class="step-success">{{ reviewSuccess }}</div>
        <div v-if="weeklyReview" class="weekly-review">{{ weeklyReview }}</div>
      </div>

      <div class="workflow-step">
        <div class="step-header">
          <h4 class="step-title">2. Focus</h4>
        </div>
        <button @click="handleRecommendFocus" class="ai-btn" :disabled="isLoadingFocus">
          {{ isLoadingFocus ? 'Analyzing...' : 'Get Focus' }}
        </button>
        <div v-if="focusSuccess" class="step-success">{{ focusSuccess }}</div>
        <div v-if="focusRecommendation" class="focus-recommendation">{{ focusRecommendation }}</div>
      </div>

      <div class="workflow-step">
        <div class="step-header">
          <h4 class="step-title">3. Action Plan</h4>
        </div>
        <button @click="handleGenerateActionPlan" class="ai-btn" :disabled="isLoadingAction">
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
        <button @click="handleGenerateTaskDrafts" class="ai-btn" :disabled="isLoadingDrafts">
          {{ isLoadingDrafts ? 'Generating...' : 'Create Drafts' }}
        </button>
        <div v-if="draftsSuccess" class="step-success">{{ draftsSuccess }}</div>
        <div v-if="taskDrafts.length > 0" class="task-drafts">
          <div class="draft-item" v-for="(draft, idx) in taskDrafts" :key="idx">
            <span class="draft-title">{{ draft.title }}</span>
            <span class="draft-source">[{{ draft.source }}]</span>
          </div>
          <button @click="handleSaveDraftsAsTasks" class="save-btn" :disabled="isSavingTasks">
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

.recent-section {
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.recent-section h3 {
  font-size: 14px;
  margin: 0 0 10px;
  color: #333;
  font-weight: 600;
}

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

.empty {
  color: #999;
  padding: 12px;
  font-size: 12px;
  text-align: center;
}

.empty-tasks {
  color: #999;
  padding: 20px;
  font-size: 13px;
  text-align: center;
  background: #fafafa;
  border-radius: 6px;
  border: 1px dashed #ddd;
}

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

.ai-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: opacity 0.15s;
}

.ai-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.ai-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  opacity: 0.7;
}

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
  margin-top: 6px;
  background: #6366f1;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: opacity 0.15s;
}

.save-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.save-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  opacity: 0.7;
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
