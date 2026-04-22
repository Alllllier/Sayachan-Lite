<script setup>
import { ref, onMounted, defineEmits, defineProps, watch } from 'vue'
import { saveTask, fetchProjectCardTasks } from '../services/taskService.js'
import {
  canSetProjectFocus,
  getProjectArchivedPreviewTasks,
  getProjectFocusTitle,
  getProjectPrimaryPreviewTasks,
  getProjectTaskBuckets
} from './projectsPanel.behavior.js'
import Card from './ui/Card.vue'
import DirectiveBlock from './ui/DirectiveBlock.vue'
import SectionBlock from './ui/SectionBlock.vue'
import ActionRow from './ui/ActionRow.vue'
import ObjectActionArea from './ui/ObjectActionArea.vue'
import Toast from './ui/Toast.vue'
import EmptyState from './ui/EmptyState.vue'
import SegmentedControl from './ui/SegmentedControl.vue'

const props = defineProps(['projects'])

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const projects = ref([])
const projectForm = ref({ name: '', summary: '', status: 'pending' })
const editingProjectId = ref(null)
const loading = ref(false)
const error = ref(null)
const showArchived = ref(false)
const aiSuggestions = ref({})
const aiLoadingProjects = ref(new Set())
const savedSuggestions = ref(new Set())
const menuOpenProjectId = ref(null)
const manualTaskProjects = ref(new Set())
const addingManualTasks = ref(new Set())
const manualTaskInputs = ref({})

// Unified Task Capture (Single/Batch mode)
const taskCaptureOpen = ref(new Set()) // 记录哪些 project 打开了 capture 区域
const taskCaptureMode = ref({}) // { [projectId]: 'single' | 'batch' }
const batchTaskInputs = ref({})
const addingBatchTasks = ref(new Set())
const projectTasks = ref({})
const loadingProjectTasks = ref(new Set())

// Project task preview expansion and filter state
const expandedProjects = ref(new Set())
const previewFilter = ref({}) // { [projectId]: 'active' | 'completed' }

// Toast notifications
const toast = ref(null)
const toastMessage = ref('')
const toastType = ref('success') // success, error

const archiveViewOptions = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]

const previewFilterOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' }
]

const taskCaptureModeOptions = [
  { value: 'single', label: 'Single' },
  { value: 'batch', label: 'Batch' }
]

// Focus Source Unification: task-only focus, no ephemeral suggestion state

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

function toggleProjectMenu(projectId) {
  if (menuOpenProjectId.value === projectId) {
    menuOpenProjectId.value = null
  } else {
    menuOpenProjectId.value = projectId
  }
}

function closeProjectMenu() {
  menuOpenProjectId.value = null
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

// Focus Source Unification: canonical task-based focus only
function getCurrentFocusDisplay(project) {
  return getProjectFocusTitle(project, projectTasks.value[project._id] || [])
}

const emit = defineEmits(['refreshed'])

async function fetchProjects() {
  loading.value = true
  try {
    const url = showArchived.value
      ? `${API_BASE}/projects?archived=true`
      : `${API_BASE}/projects`
    const response = await fetch(url)
    const fetchedProjects = await response.json()
    projects.value = fetchedProjects
    // Refresh tasks for all projects to avoid stale cache when tab/status changes
    await Promise.all(fetchedProjects.map(p => fetchProjectTasksForCard(p._id)))
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
    // Refresh tasks for all projects to avoid stale cache when status changes
    projects.value.forEach(project => {
      fetchProjectTasksForCard(project._id)
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
    projectForm.value = { name: '', summary: '', status: 'pending' }
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
    // Sort: pinned first, then by updatedAt
    projects.value.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
    editingProjectId.value = null
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

async function archiveProject(project) {
  if (!confirm(`Archive "${project.name}"? All related tasks will be archived too.`)) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/projects/${project._id}/archive`, { method: 'PUT' })
    if (!response.ok) throw new Error('Archive failed')
    await fetchProjects()
    showToast('Project archived')
    emit('refreshed', projects.value)
  } catch (e) {
    showToast('Failed to archive project. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function restoreProject(project) {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/projects/${project._id}/restore`, { method: 'PUT' })
    if (!response.ok) throw new Error('Restore failed')
    await fetchProjects()
    // Refresh tasks for this project after restore (cascade restore tasks)
    await fetchProjectTasksForCard(project._id)
    showToast('Project restored')
    emit('refreshed', projects.value)
  } catch (e) {
    showToast('Failed to restore project. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function pinProject(project) {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/projects/${project._id}/pin`, { method: 'PUT' })
    if (!response.ok) throw new Error('Pin failed')
    await fetchProjects()
    showToast('Project pinned')
  } catch (e) {
    showToast('Failed to pin project', 'error')
  } finally {
    loading.value = false
  }
}

async function unpinProject(project) {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/projects/${project._id}/unpin`, { method: 'PUT' })
    if (!response.ok) throw new Error('Unpin failed')
    await fetchProjects()
    showToast('Project unpinned')
  } catch (e) {
    showToast('Failed to unpin project', 'error')
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

function getProjectAIState(projectId) {
  if (aiLoadingProjects.value.has(projectId)) return 'pending'
  if (aiSuggestions.value[projectId] && aiSuggestions.value[projectId].length > 0) return 'active'
  return 'idle'
}

async function fetchProjectTasksForCard(projectId) {
  loadingProjectTasks.value.add(projectId)
  try {
    const project = projects.value.find(p => p._id === projectId)
    const archived = project?.archived === true
    const tasks = await fetchProjectCardTasks(projectId, archived)
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
    'ai',
    'project',
    projectId
  )
  if (newTask) {
    showToast('Saved as task')
    await fetchProjectTasksForCard(projectId)
  } else {
    savedSuggestions.value.delete(suggestion)
  }
}

async function setTaskAsFocus(project, task) {
  if (!task || task.status !== 'active') return
  try {
    const response = await fetch(`${API_BASE}/projects/${project._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: project.name,
        summary: project.summary,
        status: project.status,
        currentFocusTaskId: task._id
      })
    })
    const updated = await response.json()
    const index = projects.value.findIndex(p => p._id === project._id)
    if (index !== -1) {
      projects.value[index] = updated
    }
    emit('refreshed', projects.value)
  } catch (e) {
    error.value = 'Failed to set focus'
  }
}

function getActiveTasks(projectId) {
  return getProjectTaskBuckets(projectTasks.value[projectId] || []).active
}

function getCompletedTasks(projectId) {
  return getProjectTaskBuckets(projectTasks.value[projectId] || []).completed
}

function getArchivedTasks(projectId) {
  return getProjectTaskBuckets(projectTasks.value[projectId] || []).archived
}

function getPreviewFilter(projectId) {
  return previewFilter.value[projectId] || 'active'
}

function setProjectArchiveView(view) {
  showArchived.value = view === 'archived'
  fetchProjects()
}

function getPrimaryPreviewTasks(projectId) {
  const project = projects.value.find(p => p._id === projectId)
  return getProjectPrimaryPreviewTasks(
    project,
    projectTasks.value[projectId] || [],
    getPreviewFilter(projectId),
    expandedProjects.value.has(projectId)
  )
}

function getArchivedPreviewTasks(projectId) {
  const project = projects.value.find(p => p._id === projectId)
  return getProjectArchivedPreviewTasks(
    project,
    projectTasks.value[projectId] || [],
    expandedProjects.value.has(projectId)
  )
}

function toggleProjectPreview(projectId) {
  if (expandedProjects.value.has(projectId)) {
    expandedProjects.value.delete(projectId)
  } else {
    expandedProjects.value.add(projectId)
  }
}

function setPreviewFilter(projectId, filter) {
  previewFilter.value[projectId] = filter
}

function isFocusTask(project, task) {
  return String(project.currentFocusTaskId) === String(task._id)
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
      'manual',
      'project',
      project._id
    )
    if (newTask) {
      showToast('Task added')
      // Close capture area after successful save
      closeTaskCapture(project._id)
      // Refresh project tasks
      await fetchProjectTasksForCard(project._id)
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
        'manual',
        'project',
        project._id
      )
      if (newTask) successCount++
    }

    showToast(`Added ${successCount} task(s)`)
    // Close capture area after successful batch save
    closeTaskCapture(project._id)
    // Refresh project tasks
    await fetchProjectTasksForCard(project._id)
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
    <div class="section-header">
      <h2>Projects ({{ projects.length }})</h2>
      <SegmentedControl
        :model-value="showArchived ? 'archived' : 'active'"
        :options="archiveViewOptions"
        variant="page"
        aria-label="Projects archive view"
        @update:model-value="setProjectArchiveView"
      />
    </div>
    <EmptyState v-if="projects.length === 0" :title="showArchived ? 'No archived projects' : 'No projects yet'" />
    <Card
      v-for="project in projects"
      :key="project._id"
      :class="['project-card', { archived: project.archived }]"
      @click="closeProjectMenu"
    >
      <template #header>
        <div class="card-heading-row">
          <div class="card-heading-copy">
            <h3 class="card-title">{{ project.name }}</h3>
            <p class="card-content">{{ project.summary }}</p>
          </div>
          <button
            v-if="!project.archived"
            @click.stop="project.isPinned ? unpinProject(project) : pinProject(project)"
            class="panel-surface-icon-btn pin-icon-btn"
            :class="{ pinned: project.isPinned }"
            :title="project.isPinned ? 'Unpin project' : 'Pin project'"
          >
            <svg v-if="project.isPinned" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/>
            </svg>
            <svg v-else class="icon-stroke" viewBox="0 0 24 24">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/>
            </svg>
          </button>
        </div>
      </template>

      <template #meta>
        <div class="meta-row">
          <span class="status-badge" :class="getStatusClass(project.status)">{{ formatStatus(project.status) }}</span>
          <span class="date-meta">{{ new Date(project.updatedAt).toLocaleDateString() }}</span>
        </div>
      </template>

      <template #body>
        <div v-if="editingProjectId === project._id && !project.archived" class="project-edit-form">
          <input v-model="project.name" placeholder="Project name" class="input" />
          <textarea
            v-model="project.summary"
            placeholder="Summary"
            rows="2"
            class="textarea"
          ></textarea>
          <select v-model="project.status" class="input">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div v-else>
          <DirectiveBlock class="project-focus-directive">
            <div class="focus-section">
              <div class="focus-main">
                <span class="focus-label">Current Focus</span>
                <span class="focus-value">{{ getCurrentFocusDisplay(project) || 'No active focus' }}</span>
              </div>
            </div>
          </DirectiveBlock>

          <DirectiveBlock
            v-if="getActiveTasks(project._id).length > 0 || getCompletedTasks(project._id).length > 0 || getArchivedTasks(project._id).length > 0"
            class="project-tasks-directive"
          >
            <div class="project-tasks-preview" :class="{ 'preview-expanded': expandedProjects.has(project._id) }">
              <div class="tasks-preview-header">
                <div class="preview-header-left">
                  <span class="tasks-preview-title">Tasks</span>
                  <SegmentedControl
                    v-if="!project.archived"
                    :model-value="getPreviewFilter(project._id)"
                    :options="previewFilterOptions"
                    variant="inline"
                    aria-label="Task preview filter"
                    @update:model-value="setPreviewFilter(project._id, $event)"
                  />
                </div>
                <button
                  @click.stop="toggleProjectPreview(project._id)"
                  class="btn btn-ghost btn-sm preview-toggle-btn"
                >
                  {{ expandedProjects.has(project._id) ? '收起' : '展开' }}
                </button>
              </div>

              <div class="tasks-preview-list">
                <div v-if="getPrimaryPreviewTasks(project._id).length > 0" class="preview-task-section">
                  <div
                    v-for="task in getPrimaryPreviewTasks(project._id)"
                    :key="task._id"
                    class="task-preview-item"
                    :class="{
                      completed: task.status === 'completed',
                      'is-focus': isFocusTask(project, task),
                      'can-focus': task.status === 'active' && !task.archived
                    }"
                    @click.stop="canSetProjectFocus(task) ? setTaskAsFocus(project, task) : null"
                  >
                    <span class="task-preview-text">{{ task.title }}</span>
                    <span v-if="isFocusTask(project, task)" class="focus-badge">Current Focus</span>
                  </div>
                </div>

                <div v-if="getArchivedPreviewTasks(project._id).length > 0" class="preview-task-section preview-task-section-archived">
                  <div v-if="!project.archived" class="preview-section-label">Archived</div>
                  <div
                    v-for="task in getArchivedPreviewTasks(project._id)"
                    :key="task._id"
                    class="task-preview-item archived"
                    :class="{
                      completed: task.status === 'completed',
                      'is-focus': isFocusTask(project, task)
                    }"
                  >
                    <span class="task-preview-text">{{ task.title }}</span>
                    <span v-if="!project.archived" class="task-preview-state-chip" :class="task.status === 'completed' ? 'state-completed' : 'state-active'">
                      {{ task.status === 'completed' ? 'Completed' : 'Active' }}
                    </span>
                    <span v-if="isFocusTask(project, task)" class="focus-badge">Current Focus</span>
                  </div>
                </div>
              </div>
            </div>
          </DirectiveBlock>

        </div>
      </template>

      <template #actions v-if="editingProjectId === project._id && !project.archived">
        <ActionRow class="card-buttons edit-actions">
          <button @click="cancelEditProject(project)" :disabled="loading" class="btn btn-secondary cancel">Cancel</button>
          <button @click="updateProject(project)" :disabled="loading" class="btn btn-primary">Save</button>
        </ActionRow>
      </template>

      <template #actions v-else>
        <ObjectActionArea
          v-if="!project.archived"
          class="main-actions"
          variant="primary"
          :state="taskCaptureOpen.has(project._id) ? 'active' : 'idle'"
          idle-label="+ Add Task"
          active-label="Cancel"
          :button-class="'add-task-btn'"
          @activate="openTaskCapture(project._id)"
          @cancel="closeTaskCapture(project._id)"
        >
          <SectionBlock class="task-capture-area">
            <SegmentedControl
              class="capture-mode-switch"
              :model-value="taskCaptureMode[project._id]"
              :options="taskCaptureModeOptions"
              variant="mode"
              aria-label="Task capture mode"
              @update:model-value="setTaskCaptureMode(project._id, $event)"
            />

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
              </div>
            </div>

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
              </div>
            </div>
          </SectionBlock>
        </ObjectActionArea>

        <template v-if="project.archived">
          <ActionRow class="card-buttons secondary-actions">
            <button @click="restoreProject(project)" class="btn btn-secondary secondary-btn">Restore</button>
            <button @click="deleteProject(project._id)" class="btn btn-danger secondary-btn delete-btn">Delete</button>
          </ActionRow>
        </template>
        <ObjectActionArea
          v-else
          class="project-ai-action secondary-actions"
          variant="ai"
          active-kind="icon"
          :state="getProjectAIState(project._id)"
          @activate="handleAISuggest(project)"
          @cancel="closeAISuggestions(project._id)"
        >
          <template #idle-icon>
            <svg class="icon-stroke" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </template>
          <template #trailing>
            <div class="task-menu-container">
              <button @click.stop="toggleProjectMenu(project._id)" class="btn btn-overflow task-menu-btn" :class="{ active: menuOpenProjectId === project._id }" title="Actions">
                <svg class="menu-icon-svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
              </button>
              <div v-if="menuOpenProjectId === project._id" class="task-menu-dropdown panel-surface-menu" @click.stop>
                <button @click="startEditingProject(project)" class="btn btn-menu-item btn-secondary menu-item">Edit</button>
                <button @click="archiveProject(project)" class="btn btn-menu-item btn-archive menu-item">Archive</button>
                <button @click="deleteProject(project._id)" class="btn btn-menu-item btn-danger menu-item delete">Delete</button>
              </div>
            </div>
          </template>
          <SectionBlock v-if="aiSuggestions[project._id] && aiSuggestions[project._id].length > 0" class="ai-suggestions project-ai-suggestions">
            <div class="ai-suggestions-header">
              <strong>AI Suggestions ({{ aiSuggestions[project._id].length }})</strong>
            </div>
            <div v-for="(suggestion, idx) in aiSuggestions[project._id]" :key="idx" class="ai-suggestion-item">
              <div class="suggestion-content">{{ suggestion }}</div>
              <div class="suggestion-actions">
                <button @click="saveSuggestionAsTask(project._id, suggestion)" class="btn btn-secondary btn-sm" :disabled="savedSuggestions.has(suggestion)">
                  {{ savedSuggestions.has(suggestion) ? 'Saved' : 'Save as Task' }}
                </button>
              </div>
            </div>
          </SectionBlock>
        </ObjectActionArea>
      </template>
    </Card>
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
    <select v-model="projectForm.status" class="input">
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="on_hold">On Hold</option>
    </select>
    <ActionRow class="form-buttons">
      <button @click="createProject" :disabled="loading" class="btn btn-primary">Add Project</button>
    </ActionRow>
  </div>
</template>

<style scoped>
.projects-section, .project-form {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  padding: var(--space-lg);
  background: var(--surface-panel);
  margin-bottom: var(--space-lg);
}

.projects-section h2, .project-form h2 {
  font-size: var(--font-size-title);
  margin-top: 0;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

/* Archived Project Card Styles - Uses semantic tokens */
.project-card {
  position: relative;
}

.project-card.archived {
  opacity: 0.75;
  background: var(--surface-panel);
  border-color: var(--border-default);
}

.project-card.archived .focus-section {
  background: linear-gradient(135deg, var(--surface-panel) 0%, var(--surface-hover) 100%);
}

.project-card.archived .focus-value {
  color: var(--text-secondary);
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
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-hover) 100%);
  border-radius: var(--radius-block);
}

.focus-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
}

.focus-label {
  font-size: var(--font-size-meta);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.focus-value {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
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
  font-size: var(--font-size-chip);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-meta {
  font-size: var(--font-size-meta);
  color: var(--text-muted);
}

/* Status Color Coding */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-chip);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-planning {
  background: var(--identity-primary-soft);
  color: var(--text-emphasis);
}

.status-active {
  background: rgba(218, 165, 32, 0.12);
  color: #8e6514;
}

.status-completed {
  background: var(--surface-hover);
  color: var(--text-secondary);
}

.status-paused {
  background: var(--surface-panel);
  color: var(--text-muted);
}

.card-buttons {
  display: flex;
  gap: 8px;
}

/* Edit actions - align to right */
.card-buttons.edit-actions {
  justify-content: flex-end;
}

/* Polish-1: Compact button row layout */
.main-actions {
  margin-top: 12px;
}

.secondary-actions {
  margin-top: 8px;
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

.ai-suggestions-header {
  margin-bottom: 8px;
}

.save-success {
  color: #10b981;
  font-size: 11px;
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

/* .project-card uses the shared .card baseline */

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
  padding: var(--space-md);
  background: var(--surface-panel);
  border-radius: var(--radius-block);
  box-shadow: none;
}

.tasks-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tasks-preview-title {
  font-size: var(--font-size-section);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.tasks-preview-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-task-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-task-section-archived {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #d8dee6;
}

.preview-section-label {
  font-size: var(--font-size-meta);
  font-weight: var(--font-weight-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--surface-card);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-chip);
  border-left: 2px solid var(--identity-primary);
}

.task-preview-item.completed {
  opacity: 0.75;
  border-left-color: var(--border-default);
}

.task-preview-item.completed .task-preview-text {
  text-decoration: line-through;
}

.task-preview-item.archived {
  opacity: 0.72;
  border-left-color: var(--identity-primary-muted);
  background: var(--surface-panel);
}

.task-preview-text {
  flex: 1;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-preview-state-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-meta);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.2px;
}

.task-preview-state-chip.state-active {
  background: var(--identity-primary-soft);
  color: var(--text-emphasis);
}

.task-preview-state-chip.state-completed {
  background: var(--surface-hover);
  color: var(--text-secondary);
}

.set-focus-btn {
  margin-left: 8px;
  padding: 4px 10px;
  font-size: 11px;
  flex-shrink: 0;
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
  justify-content: flex-end;
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
  padding: var(--space-sm) var(--space-md) var(--space-md);
  background: var(--surface-panel);
  border-radius: var(--radius-block);
  border: 1px solid var(--border-default);
}

.capture-mode-switch {
  margin-bottom: 8px;
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
  justify-content: flex-end;
  gap: 8px;
}

.batch-task-success {
  color: #10b981;
  font-size: 11px;
}

/* Task Menu - Overflow pattern */
.task-menu-container {
  position: relative;
  margin-left: 4px;
}

.menu-item {
  box-shadow: none;
}

/* Preview Toggle Button */
.preview-toggle-btn {
  padding: 4px 10px;
  font-size: 11px;
}

/* Task Row Interactions */
.task-preview-item.can-focus {
  cursor: pointer;
  user-select: none;
}

@media (min-width: 481px) {
  .task-preview-item.can-focus:hover {
    background: var(--identity-primary-soft);
  }
}

.task-preview-item.is-focus {
  border-left-color: var(--identity-primary);
  background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-hover) 100%);
}

.focus-badge {
  margin-left: 8px;
  padding: 2px 8px;
  font-size: var(--font-size-meta);
  font-weight: var(--font-weight-medium);
  color: var(--text-emphasis);
  background: var(--identity-primary-soft);
  border-radius: var(--radius-full);
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Expanded state: no text truncation */
.preview-expanded .task-preview-text {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

/* Mobile: hide row-level focus badge; rely on top Current Focus section for semantics */
@media (max-width: 480px) {
.task-preview-item.is-focus .focus-badge {
    display: none;
  }
}

.project-card {
  gap: var(--space-sm);
}

.card-heading-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.card-heading-copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  flex: 1;
}

.card-heading-copy .card-title {
  margin: 0;
}

.card-heading-copy .card-content {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-body);
}

.project-edit-form {
  display: flex;
  flex-direction: column;
}

.project-focus-directive,
.project-tasks-directive {
  display: flex;
  flex-direction: column;
}

.project-focus-directive {
  margin-top: var(--space-sm);
}

.project-focus-directive .focus-section {
  margin: 0;
}

.project-tasks-directive {
  margin-top: var(--space-md);
}

.project-tasks-directive .project-tasks-preview {
  margin-top: 0;
}

.project-tasks-directive .preview-toggle-btn {
  min-width: 72px;
}

.project-ai-action {
  width: 100%;
}

.project-ai-suggestions {
  margin-top: 0;
  background: var(--identity-primary-soft);
  border: 1px solid var(--border-default);
}

.project-ai-suggestions .ai-suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.project-ai-suggestions .ai-suggestion-item {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-block);
}

.project-ai-suggestions .suggestion-content {
  color: var(--text-secondary);
}

.pin-icon-btn {
  position: static;
  margin-left: auto;
  flex-shrink: 0;
}
</style>
