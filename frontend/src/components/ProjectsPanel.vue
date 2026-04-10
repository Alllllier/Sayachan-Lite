<script setup>
import { ref, onMounted, defineEmits, defineProps, watch } from 'vue'
import { saveTask, fetchProjectTasks } from '../services/taskService.js'
import Toast from './ui/Toast.vue'
import EmptyState from './ui/EmptyState.vue'

const props = defineProps(['projects'])

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const projects = ref([])
const projectForm = ref({ name: '', summary: '', status: 'pending', nextAction: '' })
const editingProjectId = ref(null)
const loading = ref(false)
const error = ref(null)
const aiSuggestions = ref({})
const aiLoadingProjects = ref(new Set())
const savedSuggestions = ref(new Set())
const saveSuccessMessages = ref({})
const applyingFocus = ref(new Set())
const savingFocusAsTask = ref(new Set())
const manualTaskProjects = ref(new Set())
const addingManualTasks = ref(new Set())
const manualTaskInputs = ref({})
const manualTaskSuccess = ref({})

// Unified Task Capture (Single/Batch mode)
const taskCaptureOpen = ref(new Set()) // 记录哪些 project 打开了 capture 区域
const taskCaptureMode = ref({}) // { [projectId]: 'single' | 'batch' }
const batchTaskInputs = ref({})
const addingBatchTasks = ref(new Set())
const batchTaskSuccess = ref({})
const projectTasks = ref({})
const loadingProjectTasks = ref(new Set())

// Toast notifications
const toast = ref(null)
const toastMessage = ref('')
const toastType = ref('success') // success, error

// Hotfix-1: Track AI-generated focus provenance (client-side only, no DB schema change)
const aiGeneratedFocusMap = ref({}) // { [projectId]: boolean }

// P0-Fix-1: Store original project data for cancel restore
const editingOriginalData = ref({})

function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  toast.value = true
  setTimeout(() => {
    toast.value = false
  }, 3000)
}

// Status mapping: internal enum → user-friendly language and color
function formatStatus(status) {
  const statusMap = {
    'pending': 'Planning',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'on_hold': 'Paused'
  }
  return statusMap[status] || status
}

function getStatusClass(status) {
  const classMap = {
    'pending': 'status-planning',
    'in_progress': 'status-active',
    'completed': 'status-completed',
    'on_hold': 'status-paused'
  }
  return classMap[status] || 'status-default'
}

const emit = defineEmits(['refreshed'])

async function fetchProjects() {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/projects`)
    const fetchedProjects = await response.json()
    projects.value = fetchedProjects
    emit('refreshed', projects.value)
  } catch (e) {
    error.value = 'Failed to load projects'
  } finally {
    loading.value = false
  }
}

// Watch props.projects to sync from parent (App.vue refreshAllData)
watch(() => props.projects, (newProjects) => {
  if (Array.isArray(newProjects)) {
    projects.value = [...newProjects]
    // Fetch tasks for all projects
    projects.value.forEach(project => {
      if (!projectTasks.value[project._id]) {
        fetchProjectTasksForCard(project._id)
      }
    })
  }
}, { deep: true })

async function createProject() {
  if (!projectForm.value.name.trim() || !projectForm.value.summary.trim()) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectForm.value)
    })
    if (!response.ok) throw new Error('Create failed')
    const project = await response.json()
    projects.value.unshift(project)
    projectForm.value = { name: '', summary: '', status: 'pending', nextAction: '' }
    emit('refreshed', projects.value)
    showToast('Project created')
    // Initialize empty task list for new project
    projectTasks.value[project._id] = []
  } catch (e) {
    showToast('Failed to create project. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function updateProject(project) {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/projects/${project._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })
    if (!response.ok) throw new Error('Update failed')
    const updated = await response.json()
    const index = projects.value.findIndex(p => p._id === project._id)
    if (index !== -1) projects.value[index] = updated
    projects.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    editingProjectId.value = null
    // Hotfix-1: When user manually edits project, clear AI-generated flag (manual intervention)
    aiGeneratedFocusMap.value[project._id] = false
    emit('refreshed', projects.value)
    showToast('Project updated')
  } catch (e) {
    showToast('Failed to update project. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Delete failed')
    projects.value = projects.value.filter(p => p._id !== id)
    emit('refreshed', projects.value)
    showToast('Project deleted')
  } catch (e) {
    showToast('Failed to delete project. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

function startEditingProject(project) {
  editingProjectId.value = project._id
  // P0-Fix-1: Store original data for restore on cancel
  editingOriginalData.value[project._id] = {
    name: project.name,
    summary: project.summary,
    nextAction: project.nextAction,
    status: project.status
  }
}

onMounted(async () => {
  fetchProjects()
  if (!props.projects || props.projects.length === 0) {
    await fetchProjects()
  } else {
    projects.value = [...props.projects]
  }
  // Fetch tasks for all projects
  projects.value.forEach(project => {
    fetchProjectTasksForCard(project._id)
  })
})

function cancelEditProject(project) {
  // P0-Fix-1: Restore original data before closing edit mode
  if (project && editingOriginalData.value[project._id]) {
    project.name = editingOriginalData.value[project._id].name
    project.summary = editingOriginalData.value[project._id].summary
    project.nextAction = editingOriginalData.value[project._id].nextAction
    project.status = editingOriginalData.value[project._id].status
    // Clean up stored original data
    delete editingOriginalData.value[project._id]
  }
  editingProjectId.value = null
}

// Close AI suggestions by clearing data (allows reopening)
function closeAISuggestions(projectId) {
  delete aiSuggestions.value[projectId]
}

async function fetchProjectTasksForCard(projectId) {
  loadingProjectTasks.value.add(projectId)
  try {
    const tasks = await fetchProjectTasks(projectId)
    projectTasks.value[projectId] = tasks
  } catch (e) {
    console.error('Failed to fetch project tasks:', e)
    projectTasks.value[projectId] = []
  } finally {
    loadingProjectTasks.value.delete(projectId)
  }
}

async function handleAISuggest(project) {
  aiLoadingProjects.value.add(project._id)
  try {
    const response = await fetch(`${API_BASE}/ai/projects/next-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })
    const result = await response.json()
    aiSuggestions.value[project._id] = result.suggestions || []
  } catch (e) {
    aiSuggestions.value[project._id] = ['Failed to get AI suggestion']
  } finally {
    aiLoadingProjects.value.delete(project._id)
  }
}

async function saveSuggestionAsTask(projectId, suggestion) {
  if (savedSuggestions.value.has(suggestion)) {
    return
  }
  savedSuggestions.value.add(suggestion)
  const project = projects.value.find(p => p._id === projectId)
  const newTask = await saveTask(
    suggestion,
    'ai',           // creationMode
    'project',       // originModule
    projectId,         // originId
    project?.name || '',  // originLabel
    projectId,          // linkedProjectId
    project?.name || ''   // linkedProjectName
  )
  if (newTask) {
    saveSuccessMessages.value[`${projectId}_focus`] = 'Focus saved as task'
    setTimeout(() => { delete saveSuccessMessages.value[`${projectId}_focus`] }, 2000)
  } else {
    savedSuggestions.value.delete(suggestion)
  }
}

async function saveCurrentFocusAsTask(project) {
  if (!project.nextAction || !project.nextAction.trim()) {
    return
  }
  savingFocusAsTask.value.add(project._id)
  try {
    // Hotfix-1: Check if this focus was AI-generated
    const isAIGenerated = aiGeneratedFocusMap.value[project._id] === true
    const newTask = await saveTask(
      project.nextAction,
      isAIGenerated ? 'ai' : 'manual',  // creationMode: ai if from suggestion, manual if user-typed
      isAIGenerated ? 'project_suggestion' : 'project_focus',  // originModule: distinguish source
      project._id,       // originId
      project.name || '',  // originLabel
      project._id,          // linkedProjectId
      project.name || ''   // linkedProjectName
    )
    if (newTask) {
      saveSuccessMessages.value[`${project._id}_focus`] = 'Focus saved as task'
      setTimeout(() => { delete saveSuccessMessages.value[`${project._id}_focus`] }, 2000)
      // Refresh project tasks to show new task immediately
      await fetchProjectTasksForCard(project._id)
    }
  } catch (e) {
    error.value = 'Failed to save focus as task'
  } finally {
    savingFocusAsTask.value.delete(project._id)
  }
}

async function useAsCurrentFocus(project, suggestion) {
  applyingFocus.value.add(project._id)
  try {
    const projectToUpdate = {
      ...project,
      nextAction: suggestion,
      // Auto-move to in_progress if currently pending
      status: project.status === 'pending' ? 'in_progress' : project.status
    }
    const response = await fetch(`${API_BASE}/projects/${project._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectToUpdate)
    })
    const updated = await response.json()
    const index = projects.value.findIndex(p => p._id === project._id)
    if (index !== -1) projects.value[index] = updated
    projects.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    // Hotfix-1: Mark this focus as AI-generated since it came from AI suggestion
    aiGeneratedFocusMap.value[project._id] = true
    emit('refreshed', projects.value)
  } catch (e) {
    error.value = 'Failed to update current focus'
  } finally {
    applyingFocus.value.delete(project._id)
  }
}

function openTaskCapture(projectId) {
  taskCaptureOpen.value.add(projectId)
  // 默认从 single 模式开始
  taskCaptureMode.value[projectId] = 'single'
  manualTaskInputs.value[projectId] = ''
  manualTaskProjects.value.add(projectId)
}

function closeTaskCapture(projectId) {
  taskCaptureOpen.value.delete(projectId)
  delete taskCaptureMode.value[projectId]
  delete manualTaskInputs.value[projectId]
  delete batchTaskInputs.value[projectId]
  manualTaskProjects.value.delete(projectId)
}

function setTaskCaptureMode(projectId, mode) {
  taskCaptureMode.value[projectId] = mode
  if (mode === 'single') {
    manualTaskProjects.value.add(projectId)
    if (!manualTaskInputs.value[projectId]) {
      manualTaskInputs.value[projectId] = ''
    }
    delete batchTaskInputs.value[projectId]
  } else {
    manualTaskProjects.value.delete(projectId)
    if (!batchTaskInputs.value[projectId]) {
      batchTaskInputs.value[projectId] = ''
    }
  }
}

async function addManualTask(project) {
  const taskTitle = manualTaskInputs.value[project._id]?.trim()
  if (!taskTitle) return

  addingManualTasks.value.add(project._id)
  try {
    const newTask = await saveTask(
      taskTitle,
      'manual',        // creationMode
      'project',       // originModule
      project._id,       // originId
      project.name,      // originLabel
      project._id,          // linkedProjectId
      project.name         // linkedProjectName
    )
    if (newTask) {
      manualTaskSuccess.value[project._id] = 'Task added'
      // Close capture area after successful save
      closeTaskCapture(project._id)
      // Refresh project tasks
      await fetchProjectTasksForCard(project._id)
      setTimeout(() => { delete manualTaskSuccess.value[project._id] }, 2000)
    }
  } catch (e) {
    error.value = 'Failed to add task'
  } finally {
    addingManualTasks.value.delete(project._id)
  }
}

// toggleBatchTaskInput removed - replaced by unified task capture

async function addBatchTasks(project) {
  const inputText = batchTaskInputs.value[project._id]?.trim()
  if (!inputText) return

  // Split by newlines and filter empty lines
  const taskTitles = inputText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  if (taskTitles.length === 0) return

  addingBatchTasks.value.add(project._id)
  try {
    let successCount = 0
    for (const title of taskTitles) {
      const newTask = await saveTask(
        title,
        'manual',        // creationMode
        'project',       // originModule
        project._id,       // originId
        project.name,      // originLabel
        project._id,          // linkedProjectId
        project.name         // linkedProjectName
      )
      if (newTask) successCount++
    }

    batchTaskSuccess.value[project._id] = `Added ${successCount} task(s)`
    // Close capture area after successful batch save
    closeTaskCapture(project._id)
    // Refresh project tasks
    await fetchProjectTasksForCard(project._id)
    setTimeout(() => { delete batchTaskSuccess.value[project._id] }, 2000)
  } catch (e) {
    error.value = 'Failed to add tasks'
  } finally {
    addingBatchTasks.value.delete(project._id)
  }
}
</script>

<template>
  <!-- Toast Notification -->
  <Toast :message="toastMessage" :type="toastType" :visible="toast" />

  <div v-if="error" class="error">{{ error }}</div>

  <div class="projects-section">
    <h2>Projects ({{ projects.length }})</h2>
    <EmptyState v-if="projects.length === 0" title="No projects yet" />
    <div v-for="project in projects" :key="project._id" class="card card-accent-blue project-card">
      <div v-if="editingProjectId === project._id">
         <input v-model="project.name" placeholder="Project name" class="input" />
        <textarea
          v-model="project.summary"
          placeholder="Summary"
          rows="2"
          class="textarea"
        ></textarea>
        <input v-model="project.nextAction" placeholder="Current focus" class="input" />
        <select v-model="project.status" class="input">
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        <div class="card-buttons">
          <button @click="updateProject(project)" :disabled="loading" class="btn btn-primary">Save</button>
          <button @click="cancelEditProject(project)" :disabled="loading" class="btn btn-secondary cancel">Cancel</button>
        </div>
      </div>
      <div v-else>
        <h3 class="card-title">{{ project.name }}</h3>
        <p class="card-content">{{ project.summary }}</p>

        <!-- Meta Row: Status and Date -->
        <div class="meta-row">
          <span class="status-badge" :class="getStatusClass(project.status)">{{ formatStatus(project.status) }}</span>
          <span class="date-meta">{{ new Date(project.createdAt).toLocaleDateString() }}</span>
        </div>

        <!-- Current Focus - Primary Decision Layer -->
        <div class="focus-section">
          <div class="focus-main">
            <span class="focus-label">Current Focus</span>
            <span class="focus-value">{{ project.nextAction || 'No active focus' }}</span>
          </div>
          <button v-if="project.nextAction" @click="saveCurrentFocusAsTask(project)" class="btn btn-primary btn-sm save-focus-btn" :disabled="savingFocusAsTask.has(project._id)">
            {{ savingFocusAsTask.has(project._id) ? 'Saving...' : 'Save as Task' }}
          </button>
        </div>

        <!-- Focus History - Tertiary Trail (De-emphasized) -->
        <div v-if="project.focusHistory && project.focusHistory.length > 0" class="focus-history compact">
          <span class="history-label">Previous:</span>
          <span class="history-trail">{{ project.focusHistory.slice(-2).reverse().join(' → ') }}</span>
        </div>

        <!-- Project Tasks Preview -->
        <div v-if="projectTasks[project._id] && projectTasks[project._id].length > 0" class="project-tasks-preview">
          <div class="tasks-preview-header">
            <span class="tasks-preview-title">Tasks ({{ projectTasks[project._id].length }})</span>
          </div>
          <div class="tasks-preview-list">
            <div
              v-for="task in projectTasks[project._id].slice(0, 3)"
              :key="task._id"
              class="task-preview-item"
              :class="{ completed: task.completed }"
            >
              <span class="task-preview-text">{{ task.title }}</span>
            </div>
          </div>
        </div>

        <!-- Main Action: Add Task / Cancel -->
        <div class="card-buttons main-actions">
          <button
            v-if="!taskCaptureOpen.has(project._id)"
            @click="openTaskCapture(project._id)"
            class="btn btn-primary add-task-btn"
          >
            + Add Task
          </button>
          <button
            v-else
            @click="closeTaskCapture(project._id)"
            class="btn btn-secondary add-task-btn"
          >
            Cancel
          </button>
        </div>

        <!-- Task Capture Area: Single/Batch Mode Switch (shown below the main button) -->
        <div v-if="taskCaptureOpen.has(project._id)" class="task-capture-area">
          <!-- Mode Switch -->
          <div class="capture-mode-switch">
            <button
              @click="setTaskCaptureMode(project._id, 'single')"
              class="mode-btn"
              :class="{ active: taskCaptureMode[project._id] === 'single' }"
            >
              Single
            </button>
            <button
              @click="setTaskCaptureMode(project._id, 'batch')"
              class="mode-btn"
              :class="{ active: taskCaptureMode[project._id] === 'batch' }"
            >
              Batch
            </button>
          </div>

          <!-- Single Mode Input -->
          <div v-if="taskCaptureMode[project._id] === 'single'" class="single-task-input">
            <input
              v-model="manualTaskInputs[project._id]"
              placeholder="Task title..."
              @keyup.enter="addManualTask(project)"
              :disabled="addingManualTasks.has(project._id)"
              class="input task-input"
            />
            <div class="manual-task-actions">
              <button @click="addManualTask(project)" class="btn btn-primary btn-sm save-task-btn" :disabled="addingManualTasks.has(project._id)">
                {{ addingManualTasks.has(project._id) ? 'Saving...' : 'Save' }}
              </button>
              <div v-if="manualTaskSuccess[project._id]" class="manual-task-success">{{ manualTaskSuccess[project._id] }}</div>
            </div>
          </div>

          <!-- Batch Mode Input -->
          <div v-if="taskCaptureMode[project._id] === 'batch'" class="batch-task-input">
            <textarea
              v-model="batchTaskInputs[project._id]"
              placeholder="One task per line..."
              :disabled="addingBatchTasks.has(project._id)"
              class="textarea"
              rows="3"
            ></textarea>
            <div class="batch-task-actions">
              <button @click="addBatchTasks(project)" class="btn btn-primary btn-sm save-task-btn" :disabled="addingBatchTasks.has(project._id)">
                {{ addingBatchTasks.has(project._id) ? 'Saving...' : 'Save All' }}
              </button>
              <div v-if="batchTaskSuccess[project._id]" class="batch-task-success">{{ batchTaskSuccess[project._id] }}</div>
            </div>
          </div>
        </div>

        <!-- Secondary Actions -->
        <div class="card-buttons secondary-actions">
          <button @click="startEditingProject(project)" class="btn btn-secondary secondary-btn">Edit</button>
          <button @click="deleteProject(project._id)" class="btn btn-danger secondary-btn delete-btn">Delete</button>
          <button @click="handleAISuggest(project)" class="btn-ai-icon" :disabled="aiLoadingProjects.has(project._id)" title="Generate with AI">
            <span v-if="aiLoadingProjects.has(project._id)" class="icon-loading">⋯</span>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </button>
        </div>

        <!-- AI Suggestions with close/reopen support -->
        <div v-if="aiSuggestions[project._id] && aiSuggestions[project._id].length > 0" class="ai-suggestions">
          <div class="ai-suggestions-header">
            <strong>AI Suggestions ({{ aiSuggestions[project._id].length }})</strong>
            <div class="ai-suggestions-actions">
              <span v-if="saveSuccessMessages[`${project._id}_focus`]" class="save-success">{{ saveSuccessMessages[`${project._id}_focus`] }}</span>
              <button @click="closeAISuggestions(project._id)" class="btn-ai-dismiss" title="Close">×</button>
            </div>
          </div>
          <div v-for="(suggestion, idx) in aiSuggestions[project._id]" :key="idx" :class="['ai-suggestion-item', { applied: project.nextAction === suggestion }]">
            <div class="suggestion-content">{{ suggestion }}</div>
            <div class="suggestion-actions">
              <button @click="useAsCurrentFocus(project, suggestion)" class="btn btn-secondary btn-sm" :disabled="applyingFocus.has(project._id) || project.nextAction === suggestion">
                {{ project.nextAction === suggestion ? 'Applied' : (applyingFocus.has(project._id) ? 'Setting...' : 'Use as Current Focus') }}
              </button>
              <button @click="saveSuggestionAsTask(project._id, suggestion)" class="btn btn-secondary btn-sm" :disabled="savedSuggestions.has(suggestion)">
                {{ savedSuggestions.has(suggestion) ? 'Saved' : 'Save as Task' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="form-section project-form">
    <h2>New Project</h2>
    <input v-model="projectForm.name" placeholder="Project name" class="input" />
    <textarea
      v-model="projectForm.summary"
      placeholder="Summary"
      rows="2"
      class="textarea"
    ></textarea>
    <input v-model="projectForm.nextAction" placeholder="Current focus" class="input" />
    <select v-model="projectForm.status" class="input">
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="on_hold">On Hold</option>
    </select>
    <div class="form-buttons">
      <button @click="createProject" :disabled="loading" class="btn btn-primary">Add Project</button>
    </div>
  </div>
</template>

<style scoped>
.projects-section, .project-form {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background: #f9f9f9;
  margin-bottom: 24px;
}

.projects-section h2, .project-form h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 16px;
}

.form-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
  color: #333;
}

/* Focus Section - Primary Decision Layer */
.focus-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 3px solid #42b883;
  border-radius: 6px;
}

.focus-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
}

.focus-label {
  font-size: 11px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.focus-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.save-focus-btn {
  /* Layout only: uses global .btn .btn-primary .btn-sm for colors */
  margin-left: 12px;
  flex-shrink: 0;
}

/* Meta Row: Status and Date - Secondary Context */
.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 12px;
}

.status-badge {
  font-size: 11px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-meta {
  font-size: 11px;
  color: #999;
}

/* Status Color Coding */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-planning {
  background: #e3f2fd;
  color: #1976d2;
}

.status-active {
  background: #e8f5e9;
  color: #388e3c;
}

.status-completed {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-paused {
  background: #fff3e0;
  color: #f57c00;
}

.card-buttons {
  display: flex;
  gap: 8px;
}

/* Polish-1: Compact button row layout */
.main-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.secondary-actions {
  margin-top: 8px;
  justify-content: flex-end;
}

/* .secondary-btn uses global .btn .btn-secondary .btn-compact baseline */
/* .secondary-btn layout preserved, colors from global .btn .btn-secondary */

.icon-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* .edit-btn uses global .btn .btn-secondary */

/* Polish-1: Unified compact button styles for task capture */
.add-task-btn {
  /* Layout specific for task capture area */
  height: 40px;
  line-height: 1;  
  flex: 1 1 0;
  min-width: 90px;
  white-space: nowrap;
}

/* button.cancel uses global .btn .btn-secondary */

.ai-suggestions {
  margin-top: 12px;
  padding: 10px;
  background: #f0e6ff;
  border-radius: 4px;
  font-size: 13px;
  color: #6b3fa0;
}

.ai-suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ai-suggestions-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-success {
  color: #10b981;
  font-size: 11px;
}

.btn-ai-dismiss {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(107, 63, 160, 0.15);
  color: #6b3fa0;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.btn-ai-dismiss:hover {
  background: rgba(107, 63, 160, 0.25);
}

/* AI Suggestion Item - Vertical hierarchy (content first) */
.ai-suggestion-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
  gap: 10px;
}

.ai-suggestion-item:last-child {
  margin-bottom: 0;
}

.ai-suggestion-item.applied {
  background: #e8f5e9;
  border-left: 2px solid #4caf50;
}

.suggestion-content {
  font-size: 12px;
  color: #555;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
}

.suggestion-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Empty state uses EmptyState component */

.error {
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

/* .project-card uses .card and .card-accent-blue baseline */

.focus-history {
  margin: 8px 0;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.focus-history.compact {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0 12px;
  padding: 4px 10px;
  background: transparent;
  border-left: 2px solid #ddd;
}

.history-label {
  font-size: 11px;
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-trail {
  font-size: 11px;
  color: #999;
  font-style: italic;
}

.project-tasks-preview {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.tasks-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tasks-preview-title {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.tasks-preview-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-preview-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  border-left: 2px solid #42b883;
}

.task-preview-item.completed {
  opacity: 0.6;
  text-decoration: line-through;
  border-left-color: #ccc;
}

.task-preview-text {
  flex: 1;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Polish-1: Unified compact input area styling */
.manual-task-input {
  margin-top: 12px;
  padding: 0;
  background: transparent;
  border: none;
}

.task-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}

.task-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.manual-task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* .save-task-btn uses global .btn .btn-primary .btn-sm */

.manual-task-success {
  color: #10b981;
  font-size: 11px;
}

/* Task Capture Area: Unified Single/Batch Mode */
.task-capture-area {
  margin-top: 8px;
  padding: 8px 12px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.capture-mode-switch {
  display: flex;
  gap: 0;
  margin-bottom: 8px;
  align-items: center;
}

.mode-btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  background: #e9ecef;
  color: #666;
  border: 1px solid #dee2e6;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.15s;
}

.mode-btn:first-child {
  border-radius: 4px 0 0 4px;
  border-right: none;
}

.mode-btn:last-child {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.mode-btn:hover:not(:disabled):not(.active) {
  background: #dee2e6;
}

.mode-btn.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
}

.mode-btn.active:first-child,
.mode-btn.active:last-child {
  border-color: #42b883;
}

/* Single Task Input */
.single-task-input {
  padding: 0;
  background: transparent;
  border: none;
}

/* Batch Task Input - Aligned with Notes textarea */
.batch-task-input {
  padding: 0;
  background: transparent;
  border: none;
}

.batch-task-input textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: none;
  overflow-y: auto;
  min-height: 80px;
  max-height: 400px;
  line-height: 1.5;
  /* Modern browsers: native auto-grow */
  field-sizing: content;
}

.batch-task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-task-success {
  color: #10b981;
  font-size: 11px;
}
</style>
