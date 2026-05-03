import { ref } from 'vue'
import { saveTask, fetchProjectCardTasks } from '../../services/tasks/index.js'
import {
  canSetProjectFocus,
  createEmptyProjectErrors,
  createEmptyTaskCaptureError,
  getProjectFocusTitle,
  getInitialTaskCaptureState,
  getNextTaskCaptureModeState,
  hasProjectErrors,
  parseBatchTaskTitles,
  validateBatchTaskCapture,
  validateProjectFields,
  validateSingleTaskCapture
} from './projects.rules.js'
import {
  archiveProject as archiveProjectRequest,
  createProject as createProjectRequest,
  deleteProject as deleteProjectRequest,
  fetchProjectNextActions,
  fetchProjects as fetchProjectsRequest,
  pinProject as pinProjectRequest,
  restoreProject as restoreProjectRequest,
  unpinProject as unpinProjectRequest,
  updateProject as updateProjectRequest,
  updateProjectFocus
} from './projects.api.js'

const noop = () => {}

function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })
}

export function useProjectsFeature(options = {}) {
  const notify = options.notify || noop
  const onRefreshed = options.onRefreshed || noop

  const projects = ref([])
  const projectForm = ref({ name: '', summary: '', status: 'pending' })
  const editingProjectId = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const showArchived = ref(false)
  const aiSuggestions = ref({})
  const aiLoadingProjects = ref(new Set())
  const savedSuggestions = ref(new Set())
  const manualTaskProjects = ref(new Set())
  const addingManualTasks = ref(new Set())
  const manualTaskInputs = ref({})
  const taskCaptureOpen = ref(new Set())
  const taskCaptureMode = ref({})
  const batchTaskInputs = ref({})
  const addingBatchTasks = ref(new Set())
  const taskCaptureErrors = ref({})
  const projectTasks = ref({})
  const loadingProjectTasks = ref(new Set())
  const projectFormErrors = ref(createEmptyProjectErrors())
  const editProjectErrors = ref({})
  const editingOriginalData = ref({})

  function emitRefreshed() {
    onRefreshed(projects.value)
  }

  function syncProjects(nextProjects) {
    if (!Array.isArray(nextProjects)) return
    projects.value = [...nextProjects]
    projects.value.forEach(project => {
      fetchProjectTasksForCard(project._id)
    })
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

  async function fetchProjects() {
    loading.value = true
    try {
      const fetchedProjects = await fetchProjectsRequest({ archived: showArchived.value })
      projects.value = fetchedProjects
      await Promise.all(fetchedProjects.map(project => fetchProjectTasksForCard(project._id)))
      emitRefreshed()
    } catch (e) {
      error.value = 'Failed to load projects'
    } finally {
      loading.value = false
    }
  }

  async function createProject() {
    const errors = validateProjectFields(projectForm.value)
    projectFormErrors.value = errors
    if (hasProjectErrors(errors)) return

    loading.value = true
    error.value = null
    try {
      const project = await createProjectRequest(projectForm.value)
      projects.value.unshift(project)
      projectForm.value = { name: '', summary: '', status: 'pending' }
      projectFormErrors.value = createEmptyProjectErrors()
      projectTasks.value[project._id] = []
      emitRefreshed()
      notify('Project created')
    } catch (e) {
      notify('Failed to create project. Please try again.', 'error')
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
      const updated = await updateProjectRequest(project._id, project)
      const index = projects.value.findIndex(p => p._id === project._id)
      if (index !== -1) projects.value[index] = updated
      projects.value = sortProjects(projects.value)
      editingProjectId.value = null
      clearEditProjectErrors(project._id)
      emitRefreshed()
      notify('Project updated')
    } catch (e) {
      notify('Failed to update project. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project?')) return

    loading.value = true
    error.value = null
    try {
      await deleteProjectRequest(id)
      projects.value = projects.value.filter(p => p._id !== id)
      emitRefreshed()
      notify('Project deleted')
    } catch (e) {
      notify('Failed to delete project. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function archiveProject(project) {
    if (!confirm(`Archive "${project.name}"? All related tasks will be archived too.`)) return

    loading.value = true
    error.value = null
    try {
      await archiveProjectRequest(project._id)
      await fetchProjects()
      notify('Project archived')
      emitRefreshed()
    } catch (e) {
      notify('Failed to archive project. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function restoreProject(project) {
    loading.value = true
    error.value = null
    try {
      await restoreProjectRequest(project._id)
      await fetchProjects()
      await fetchProjectTasksForCard(project._id)
      notify('Project restored')
      emitRefreshed()
    } catch (e) {
      notify('Failed to restore project. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function pinProject(project) {
    loading.value = true
    try {
      await pinProjectRequest(project._id)
      await fetchProjects()
      notify('Project pinned')
    } catch (e) {
      notify('Failed to pin project', 'error')
    } finally {
      loading.value = false
    }
  }

  async function unpinProject(project) {
    loading.value = true
    try {
      await unpinProjectRequest(project._id)
      await fetchProjects()
      notify('Project unpinned')
    } catch (e) {
      notify('Failed to unpin project', 'error')
    } finally {
      loading.value = false
    }
  }

  function startEditingProject(project) {
    editingProjectId.value = project._id
    editProjectErrors.value[project._id] = createEmptyProjectErrors()
    editingOriginalData.value[project._id] = {
      name: project.name,
      summary: project.summary,
      status: project.status
    }
  }

  function cancelEditProject(project) {
    if (project && editingOriginalData.value[project._id]) {
      project.name = editingOriginalData.value[project._id].name
      project.summary = editingOriginalData.value[project._id].summary
      project.status = editingOriginalData.value[project._id].status
      delete editingOriginalData.value[project._id]
    }
    if (project?._id) {
      clearEditProjectErrors(project._id)
    }
    editingProjectId.value = null
  }

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
        notify('Task added')
        closeTaskCapture(project._id)
        await fetchProjectTasksForCard(project._id)
      }
    } catch (e) {
      error.value = 'Failed to add task'
    } finally {
      addingManualTasks.value.delete(project._id)
    }
  }

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

      notify(`Added ${successCount} task(s)`)
      closeTaskCapture(project._id)
      await fetchProjectTasksForCard(project._id)
    } catch (e) {
      error.value = 'Failed to add tasks'
    } finally {
      addingBatchTasks.value.delete(project._id)
    }
  }

  function getCurrentFocusDisplay(project) {
    return getProjectFocusTitle(project, projectTasks.value[project._id] || [])
  }

  function closeAISuggestions(projectId) {
    delete aiSuggestions.value[projectId]
  }

  function getProjectAIState(projectId) {
    if (aiLoadingProjects.value.has(projectId)) return 'pending'
    if (aiSuggestions.value[projectId] && aiSuggestions.value[projectId].length > 0) return 'active'
    return 'idle'
  }

  async function handleAISuggest(project) {
    aiLoadingProjects.value.add(project._id)
    try {
      const result = await fetchProjectNextActions(project)
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
    const newTask = await saveTask(
      suggestion,
      'ai',
      'project',
      projectId
    )

    if (newTask) {
      notify('Saved as task')
      await fetchProjectTasksForCard(projectId)
    } else {
      savedSuggestions.value.delete(suggestion)
    }
  }

  async function setTaskAsFocus(project, task) {
    if (!canSetProjectFocus(task)) return

    try {
      const updated = await updateProjectFocus(project, task._id)
      const index = projects.value.findIndex(p => p._id === project._id)
      if (index !== -1) {
        projects.value[index] = updated
      }
      emitRefreshed()
    } catch (e) {
      error.value = 'Failed to set focus'
    }
  }

  function setProjectArchiveView(view) {
    showArchived.value = view === 'archived'
    fetchProjects()
  }

  return {
    projects,
    projectForm,
    editingProjectId,
    loading,
    error,
    showArchived,
    aiSuggestions,
    aiLoadingProjects,
    savedSuggestions,
    manualTaskProjects,
    addingManualTasks,
    manualTaskInputs,
    taskCaptureOpen,
    taskCaptureMode,
    batchTaskInputs,
    addingBatchTasks,
    taskCaptureErrors,
    projectTasks,
    loadingProjectTasks,
    projectFormErrors,
    editProjectErrors,
    fetchProjects,
    syncProjects,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    restoreProject,
    pinProject,
    unpinProject,
    startEditingProject,
    cancelEditProject,
    updateProjectFieldError,
    clearEditProjectErrors,
    ensureTaskCaptureErrorState,
    setTaskCaptureError,
    clearTaskCaptureError,
    handleTaskCaptureInput,
    openTaskCapture,
    closeTaskCapture,
    setTaskCaptureMode,
    addManualTask,
    addBatchTasks,
    getCurrentFocusDisplay,
    closeAISuggestions,
    getProjectAIState,
    fetchProjectTasksForCard,
    handleAISuggest,
    saveSuggestionAsTask,
    setTaskAsFocus,
    setProjectArchiveView
  }
}
