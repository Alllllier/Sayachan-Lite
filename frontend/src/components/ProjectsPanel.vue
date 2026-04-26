<script setup>
import { ref, onMounted, defineEmits, defineProps, watch } from 'vue'
import { saveTask, fetchProjectCardTasks } from '../services/taskService.js'
import {
  PROJECT_TASK_PREVIEW_LIMIT,
  canSetProjectFocus,
  createEmptyProjectErrors,
  createEmptyTaskCaptureError,
  getInitialTaskCaptureState,
  getNextTaskCaptureModeState,
  getProjectArchivedPreviewTasks,
  getProjectFocusTitle,
  getProjectPrimaryPreviewTasks,
  getProjectTaskBuckets,
  hasProjectErrors,
  parseBatchTaskTitles,
  validateBatchTaskCapture,
  validateProjectFields,
  validateSingleTaskCapture
} from './projectsPanel.behavior.js'
import {
  Card,
  CardHeaderRow,
  CardMetaRow,
  DirectiveBlock,
  SectionBlock,
  ActionRow,
  ObjectActionArea
} from './ui/surfaces'
import { CardCollection } from './ui/shell'
import Toast from './ui/Toast.vue'
import EmptyState from './ui/EmptyState.vue'
import OverflowMenu from './ui/OverflowMenu.vue'
import SegmentedControl from './ui/SegmentedControl.vue'
import {
  List,
  ListSection,
  ListItem,
  ItemContent,
  ItemMeta
} from './ui/list'

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
const projectFormErrors = ref({ name: '', summary: '' })
const editProjectErrors = ref({})
const taskCaptureErrors = ref({})

// Project task preview expansion and filter state
const expandedPrimaryPreviewProjects = ref(new Set())
const expandedArchivedPreviewProjects = ref(new Set())
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

function ensureEditProjectErrorState(projectId) {
  if (!editProjectErrors.value[projectId]) {
    editProjectErrors.value[projectId] = createEmptyProjectErrors()
  }
  return editProjectErrors.value[projectId]
}

function updateProjectFieldError(target, field, value, projectId = null) {
  const trimmed = value.trim()
  if (target === 'new') {
    if (field === 'name') {
      projectFormErrors.value.name = trimmed ? '' : projectFormErrors.value.name
    } else {
      projectFormErrors.value.summary = trimmed ? '' : projectFormErrors.value.summary
    }
    return
  }

  const errors = ensureEditProjectErrorState(projectId)
  if (field === 'name') {
    errors.name = trimmed ? '' : errors.name
  } else {
    errors.summary = trimmed ? '' : errors.summary
  }
}

function clearEditProjectErrors(projectId) {
  delete editProjectErrors.value[projectId]
}

function ensureTaskCaptureErrorState(projectId) {
  if (!taskCaptureErrors.value[projectId]) {
    taskCaptureErrors.value[projectId] = createEmptyTaskCaptureError()
  }
  return taskCaptureErrors.value[projectId]
}

function setTaskCaptureError(projectId, mode, message) {
  const errors = ensureTaskCaptureErrorState(projectId)
  errors[mode] = message
}

function clearTaskCaptureError(projectId, mode = null) {
  if (!taskCaptureErrors.value[projectId]) return
  if (!mode) {
    delete taskCaptureErrors.value[projectId]
    return
  }
  taskCaptureErrors.value[projectId][mode] = ''
}

function handleTaskCaptureInput(projectId, mode, value) {
  if (value.trim()) {
    clearTaskCaptureError(projectId, mode)
  }
}

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
  const errors = validateProjectFields(projectForm.value)
  projectFormErrors.value = errors
  if (hasProjectErrors(errors)) return
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
    projectFormErrors.value = createEmptyProjectErrors()
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
  const errors = validateProjectFields(project)
  editProjectErrors.value[project._id] = errors
  if (hasProjectErrors(errors)) return
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
    clearEditProjectErrors(project._id)
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
  editProjectErrors.value[project._id] = createEmptyProjectErrors()
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
  if (project?._id) {
    clearEditProjectErrors(project._id)
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
  if (!canSetProjectFocus(task)) return
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

function hasPrimaryTaskSection(projectId) {
  const { active, completed } = getProjectTaskBuckets(projectTasks.value[projectId] || [])
  return active.length > 0 || completed.length > 0
}

function getPreviewFilter(projectId) {
  return previewFilter.value[projectId] || 'active'
}

function getPrimaryPreviewTaskTotal(projectId) {
  const buckets = getProjectTaskBuckets(projectTasks.value[projectId] || [])
  return getPreviewFilter(projectId) === 'completed'
    ? buckets.completed.length
    : buckets.active.length
}

function getArchivedPreviewTaskTotal(projectId) {
  return getProjectTaskBuckets(projectTasks.value[projectId] || []).archived.length
}

function getProjectPreviewToggleLabel(isExpanded, total) {
  if (isExpanded) {
    return '收起'
  }
  return total > PROJECT_TASK_PREVIEW_LIMIT ? `展开全部 (${total})` : '展开详情'
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
    expandedPrimaryPreviewProjects.value.has(projectId)
  )
}

function getArchivedPreviewTasks(projectId) {
  const project = projects.value.find(p => p._id === projectId)
  return getProjectArchivedPreviewTasks(
    project,
    projectTasks.value[projectId] || [],
    expandedArchivedPreviewProjects.value.has(projectId)
  )
}

function togglePrimaryProjectPreview(projectId) {
  if (expandedPrimaryPreviewProjects.value.has(projectId)) {
    expandedPrimaryPreviewProjects.value.delete(projectId)
  } else {
    expandedPrimaryPreviewProjects.value.add(projectId)
  }
}

function toggleArchivedProjectPreview(projectId) {
  if (expandedArchivedPreviewProjects.value.has(projectId)) {
    expandedArchivedPreviewProjects.value.delete(projectId)
  } else {
    expandedArchivedPreviewProjects.value.add(projectId)
  }
}

function setPreviewFilter(projectId, filter) {
  previewFilter.value[projectId] = filter
}

function isFocusTask(project, task) {
  return String(project.currentFocusTaskId) === String(task._id)
}

function getArchivedSectionTitle(project) {
  return project?.archived ? 'Archived Tasks' : 'Archived'
}

function openTaskCapture(projectId) {
  const nextState = getInitialTaskCaptureState()

  taskCaptureOpen.value.add(projectId)
  taskCaptureMode.value[projectId] = nextState.mode
  manualTaskInputs.value[projectId] = nextState.singleInput
  taskCaptureErrors.value[projectId] = nextState.errors

  if (nextState.manualProjectActive) {
    manualTaskProjects.value.add(projectId)
  } else {
    manualTaskProjects.value.delete(projectId)
  }
}

function closeTaskCapture(projectId) {
  taskCaptureOpen.value.delete(projectId)
  delete taskCaptureMode.value[projectId]
  delete manualTaskInputs.value[projectId]
  delete batchTaskInputs.value[projectId]
  manualTaskProjects.value.delete(projectId)
  clearTaskCaptureError(projectId)
}

function setTaskCaptureMode(projectId, mode) {
  const nextState = getNextTaskCaptureModeState(mode, {
    singleInput: manualTaskInputs.value[projectId],
    batchInput: batchTaskInputs.value[projectId]
  })

  taskCaptureMode.value[projectId] = nextState.mode
  taskCaptureErrors.value[projectId] = nextState.errors

  if (nextState.manualProjectActive) {
    manualTaskProjects.value.add(projectId)
    manualTaskInputs.value[projectId] = nextState.singleInput
    delete batchTaskInputs.value[projectId]
  } else {
    manualTaskProjects.value.delete(projectId)
    batchTaskInputs.value[projectId] = nextState.batchInput
    delete manualTaskInputs.value[projectId]
  }
}

async function addManualTask(project) {
  const taskTitle = manualTaskInputs.value[project._id]?.trim()
  const validationError = validateSingleTaskCapture(taskTitle)
  if (validationError) {
    setTaskCaptureError(project._id, 'single', validationError)
    return
  }
  clearTaskCaptureError(project._id, 'single')

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
  const inputText = batchTaskInputs.value[project._id]
  const validationError = validateBatchTaskCapture(inputText)
  if (validationError) {
    setTaskCaptureError(project._id, 'batch', validationError)
    return
  }

  const taskTitles = parseBatchTaskTitles(inputText)
  clearTaskCaptureError(project._id, 'batch')

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

  <CardCollection>
    <template #title>
      Projects ({{ projects.length }})
    </template>
    <template #control>
      <SegmentedControl
        :model-value="showArchived ? 'archived' : 'active'"
        :options="archiveViewOptions"
        variant="page"
        aria-label="Projects archive view"
        @update:model-value="setProjectArchiveView"
      />
    </template>
    <EmptyState v-if="projects.length === 0" :title="showArchived ? 'No archived projects' : 'No projects yet'" />
    <Card
      v-for="project in projects"
      :key="project._id"
      :state="project.archived ? 'archived' : null"
      @click="closeProjectMenu"
    >
      <template #header>
        <CardHeaderRow :title="project.name">
          <template #actions>
          <button
            v-if="!project.archived"
            @click.stop="project.isPinned ? unpinProject(project) : pinProject(project)"
            class="panel-surface-icon-btn"
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
          </template>
        </CardHeaderRow>
      </template>

      <template #meta>
        <CardMetaRow>
          <span class="status-badge" :class="getStatusClass(project.status)">{{ formatStatus(project.status) }}</span>
          <template #date>{{ new Date(project.updatedAt).toLocaleDateString() }}</template>
        </CardMetaRow>
      </template>

      <template #body>
        <div v-if="editingProjectId === project._id && !project.archived" class="project-edit-form">
          <div class="field-stack">
            <input
              v-model="project.name"
              placeholder="Project name"
              class="input"
              :class="{ 'is-invalid': editProjectErrors[project._id]?.name }"
              :disabled="loading"
              :aria-invalid="Boolean(editProjectErrors[project._id]?.name)"
              @input="updateProjectFieldError('edit', 'name', project.name, project._id)"
            />
            <p v-if="editProjectErrors[project._id]?.name" class="field-helper field-helper--error">
              {{ editProjectErrors[project._id].name }}
            </p>
          </div>
          <div class="field-stack">
            <textarea
              v-model="project.summary"
              placeholder="Summary"
              rows="2"
              class="textarea"
              :class="{ 'is-invalid': editProjectErrors[project._id]?.summary }"
              :disabled="loading"
              :aria-invalid="Boolean(editProjectErrors[project._id]?.summary)"
              @input="updateProjectFieldError('edit', 'summary', project.summary, project._id)"
            ></textarea>
            <p v-if="editProjectErrors[project._id]?.summary" class="field-helper field-helper--error">
              {{ editProjectErrors[project._id].summary }}
            </p>
          </div>
          <div class="field-stack">
            <select v-model="project.status" class="input" :disabled="loading">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>
        <template v-else>
          <p class="card-content">{{ project.summary }}</p>

          <DirectiveBlock>
            <div class="focus-section">
              <div class="focus-main">
                <span class="focus-label">Current Focus</span>
                <span class="focus-value">{{ getCurrentFocusDisplay(project) || 'No active focus' }}</span>
              </div>
            </div>
          </DirectiveBlock>

          <DirectiveBlock
            v-if="getActiveTasks(project._id).length > 0 || getCompletedTasks(project._id).length > 0 || getArchivedTasks(project._id).length > 0"
          >
            <List
              mode="preview"
            >
              <ListSection
                  v-if="!project.archived && hasPrimaryTaskSection(project._id)"
                  class="project-task-section"
                  :class="{ 'is-expanded': expandedPrimaryPreviewProjects.has(project._id) }"
                  :aria-label="`Tasks (${getPreviewFilter(project._id)})`"
                >
                  <template #title>
                    <div class="project-task-section-heading">
                      <span class="project-task-section-heading-text">Tasks</span>
                      <SegmentedControl
                        :model-value="getPreviewFilter(project._id)"
                        :options="previewFilterOptions"
                        variant="inline"
                        aria-label="Task preview filter"
                        @update:model-value="setPreviewFilter(project._id, $event)"
                      />
                    </div>
                  </template>
                  <template #control>
                    <button
                      @click.stop="togglePrimaryProjectPreview(project._id)"
                      class="btn btn-ghost btn-sm preview-toggle-btn"
                      :aria-expanded="expandedPrimaryPreviewProjects.has(project._id)"
                    >
                      {{ getProjectPreviewToggleLabel(expandedPrimaryPreviewProjects.has(project._id), getPrimaryPreviewTaskTotal(project._id)) }}
                    </button>
                  </template>

                  <ListItem
                    v-for="task in getPrimaryPreviewTasks(project._id)"
                    :key="task._id"
                    :element="canSetProjectFocus(task) ? 'button' : 'div'"
                    :interactive="canSetProjectFocus(task)"
                    :current="isFocusTask(project, task)"
                    :muted="task.status === 'completed'"
                    :aria-pressed="canSetProjectFocus(task) ? isFocusTask(project, task) : undefined"
                    @click.stop="canSetProjectFocus(task) ? setTaskAsFocus(project, task) : null"
                  >
                    <ItemContent :text="task.title" />
                    <ItemMeta v-if="isFocusTask(project, task)">
                      <span class="focus-badge">Current Focus</span>
                    </ItemMeta>
                  </ListItem>
                </ListSection>

                <ListSection
                  v-if="getArchivedPreviewTasks(project._id).length > 0"
                  class="project-task-section project-task-section-archived"
                  :class="{
                    'is-expanded': expandedArchivedPreviewProjects.has(project._id),
                    'project-task-section-separated': hasPrimaryTaskSection(project._id)
                  }"
                  :title="getArchivedSectionTitle(project)"
                  :aria-label="getArchivedSectionTitle(project)"
                >
                  <template #control>
                    <button
                      @click.stop="toggleArchivedProjectPreview(project._id)"
                      class="btn btn-ghost btn-sm preview-toggle-btn"
                      :aria-expanded="expandedArchivedPreviewProjects.has(project._id)"
                    >
                      {{ getProjectPreviewToggleLabel(expandedArchivedPreviewProjects.has(project._id), getArchivedPreviewTaskTotal(project._id)) }}
                    </button>
                  </template>

                  <ListItem
                    v-for="task in getArchivedPreviewTasks(project._id)"
                    :key="task._id"
                    :archived="true"
                    :current="isFocusTask(project, task)"
                    :muted="task.status === 'completed'"
                  >
                    <ItemContent :text="task.title" />
                    <ItemMeta v-if="!project.archived || isFocusTask(project, task)">
                      <span
                        v-if="!project.archived"
                        class="task-preview-state-chip"
                        :class="task.status === 'completed' ? 'state-completed' : 'state-active'"
                      >
                        {{ task.status === 'completed' ? 'Completed' : 'Active' }}
                      </span>
                      <span v-if="isFocusTask(project, task)" class="focus-badge">Current Focus</span>
                    </ItemMeta>
                  </ListItem>
                </ListSection>
            </List>
          </DirectiveBlock>

        </template>
      </template>

      <template #actions v-if="editingProjectId === project._id && !project.archived">
        <ActionRow>
          <button @click="cancelEditProject(project)" :disabled="loading" class="btn btn-secondary">Cancel</button>
          <button @click="updateProject(project)" :disabled="loading" class="btn btn-primary">Save</button>
        </ActionRow>
      </template>

      <template #actions v-else>
        <ObjectActionArea
          v-if="!project.archived"
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
              <div class="field-stack">
                <input
                  v-model="manualTaskInputs[project._id]"
                  placeholder="Task title..."
                  @keyup.enter="addManualTask(project)"
                  :disabled="addingManualTasks.has(project._id)"
                  class="input"
                  :class="{ 'is-invalid': taskCaptureErrors[project._id]?.single }"
                  :aria-invalid="Boolean(taskCaptureErrors[project._id]?.single)"
                  @input="handleTaskCaptureInput(project._id, 'single', manualTaskInputs[project._id] || '')"
                />
                <p v-if="taskCaptureErrors[project._id]?.single" class="field-helper field-helper--error">
                  {{ taskCaptureErrors[project._id].single }}
                </p>
              </div>
              <div class="manual-task-actions">
                <button @click="addManualTask(project)" class="btn btn-primary btn-sm" :disabled="addingManualTasks.has(project._id)">
                  {{ addingManualTasks.has(project._id) ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>

            <div v-if="taskCaptureMode[project._id] === 'batch'" class="batch-task-input">
              <div class="field-stack">
                <textarea
                  v-model="batchTaskInputs[project._id]"
                  placeholder="One task per line..."
                  :disabled="addingBatchTasks.has(project._id)"
                  class="textarea"
                  :class="{ 'is-invalid': taskCaptureErrors[project._id]?.batch }"
                  :aria-invalid="Boolean(taskCaptureErrors[project._id]?.batch)"
                  rows="3"
                  @input="handleTaskCaptureInput(project._id, 'batch', batchTaskInputs[project._id] || '')"
                ></textarea>
                <p v-if="taskCaptureErrors[project._id]?.batch" class="field-helper field-helper--error">
                  {{ taskCaptureErrors[project._id].batch }}
                </p>
              </div>
              <div class="batch-task-actions">
                <button @click="addBatchTasks(project)" class="btn btn-primary btn-sm" :disabled="addingBatchTasks.has(project._id)">
                  {{ addingBatchTasks.has(project._id) ? 'Saving...' : 'Save All' }}
                </button>
              </div>
            </div>
          </SectionBlock>
        </ObjectActionArea>

        <template v-if="project.archived">
          <ActionRow>
            <button @click="restoreProject(project)" class="btn btn-secondary">Restore</button>
            <button @click="deleteProject(project._id)" class="btn btn-danger">Delete</button>
          </ActionRow>
        </template>
        <ObjectActionArea
          v-else
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
            <OverflowMenu
              :open="menuOpenProjectId === project._id"
              title="Actions"
              @toggle="toggleProjectMenu(project._id)"
            >
              <button @click="startEditingProject(project)" class="btn btn-menu-item btn-secondary">Edit</button>
              <button @click="archiveProject(project)" class="btn btn-menu-item btn-archive">Archive</button>
              <button @click="deleteProject(project._id)" class="btn btn-menu-item btn-danger">Delete</button>
            </OverflowMenu>
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
  </CardCollection>

  <div class="form-section project-form">
    <h2>New Project</h2>
    <div class="field-stack">
      <input
        v-model="projectForm.name"
        placeholder="Project name"
        class="input"
        :class="{ 'is-invalid': projectFormErrors.name }"
        :disabled="loading"
        :aria-invalid="Boolean(projectFormErrors.name)"
        @input="updateProjectFieldError('new', 'name', projectForm.name)"
      />
      <p v-if="projectFormErrors.name" class="field-helper field-helper--error">{{ projectFormErrors.name }}</p>
    </div>
    <div class="field-stack">
      <textarea
        v-model="projectForm.summary"
        placeholder="Summary"
        rows="2"
        class="textarea"
        :class="{ 'is-invalid': projectFormErrors.summary }"
        :disabled="loading"
        :aria-invalid="Boolean(projectFormErrors.summary)"
        @input="updateProjectFieldError('new', 'summary', projectForm.summary)"
      ></textarea>
      <p v-if="projectFormErrors.summary" class="field-helper field-helper--error">{{ projectFormErrors.summary }}</p>
    </div>
    <div class="field-stack">
      <select v-model="projectForm.status" class="input" :disabled="loading">
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="on_hold">On Hold</option>
      </select>
    </div>
    <ActionRow>
      <button @click="createProject" :disabled="loading" class="btn btn-primary">Add Project</button>
    </ActionRow>
  </div>
</template>

<style scoped>
/* Legacy creation form: future hover-icon creation flow will replace this area. */
.project-form {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  padding: var(--space-lg);
  background: var(--surface-panel);
  margin-bottom: var(--space-lg);
}

.project-form h2 {
  font-size: var(--font-size-title);
  margin-top: 0;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

/* Project focus */
.focus-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* Project meta */
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

/* Project task capture */
.add-task-btn {
  height: 40px;
  line-height: 1;  
  flex: 1 1 0;
  min-width: 90px;
  white-space: nowrap;
}

/* Legacy AI suggestions: parked until AI reveal/list cleanup. */
.ai-suggestions-header {
  margin-bottom: 8px;
}

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

/* Legacy page-level error state */
.error {
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.project-task-section-separated {
  padding-top: var(--space-sm);
  border-top: 1px dashed var(--border-default);
}

:deep(.project-task-section.is-expanded .item-content-text) {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.project-task-section-heading {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.project-task-section-heading-text {
  font-size: var(--font-size-section);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
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

.manual-task-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

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

.single-task-input {
  padding: 0;
  background: transparent;
  border: none;
}

.batch-task-input {
  padding: 0;
  background: transparent;
  border: none;
}

.batch-task-input textarea {
  margin-bottom: 0;
  resize: none;
  overflow-y: auto;
  min-height: 80px;
  max-height: 400px;
  line-height: 1.5;
  field-sizing: content;
}

.batch-task-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.preview-toggle-btn {
  padding: 4px 10px;
  font-size: 11px;
}

.focus-badge {
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

/* Mobile: hide row-level focus badge; rely on top Current Focus section for semantics */
@media (max-width: 480px) {
  :deep(.project-task-section .item-meta) {
    display: none;
  }

  :deep(.list-item--current) .focus-badge {
    display: none;
  }
}

.project-edit-form {
  display: flex;
  flex-direction: column;
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

</style>
