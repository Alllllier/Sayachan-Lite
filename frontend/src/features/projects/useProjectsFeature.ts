import { ref, unref } from 'vue'
import type { MaybeRef, Ref } from 'vue'
import type { ProjectCreateDto, ProjectDto } from '@sayachan/contracts'
import { readResourceCache, writeResourceCache } from '../../services/resourceCache.js'
import type { TaskApiTask } from '../../services/tasks/task.rules.js'
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
} from './projects.rules'
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
const PROJECTS_CACHE_RESOURCE = 'projects'
const PROJECT_TASKS_CACHE_RESOURCE = 'project-tasks'

type NotifyFn = (message: string, variant?: string) => void
type ProjectsFeatureOptions = {
  notify?: NotifyFn
  onRefreshed?: (projects: ProjectDto[]) => void
  cacheUserKey?: string | MaybeRef<string | null | undefined> | null | undefined
}

type ProjectWithId = ProjectDto & {
  _id: string
}

type ProjectForm = ProjectCreateDto & { status: NonNullable<ProjectCreateDto['status']> }
type ProjectErrorsById = Record<string, ReturnType<typeof createEmptyProjectErrors>>
type ProjectSnapshotsById = Record<string, ProjectForm>
type StringSetRef = Ref<Set<string>>
type ProjectStringMap = Record<string, string>
type ProjectTaskMap = Record<string, TaskApiTask[]>
type TaskCaptureMode = 'single' | 'batch'
type ProjectFieldTarget = 'new' | 'edit'
type ProjectEditableField = 'name' | 'summary'
type TaskCaptureError = ReturnType<typeof createEmptyTaskCaptureError>

function sortProjects(projects: ProjectDto[]): ProjectDto[] {
  return [...projects].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  })
}

export function useProjectsFeature(options: ProjectsFeatureOptions = {}) {
  const notify = options.notify || noop
  const onRefreshed = options.onRefreshed || noop
  const cacheUserKey = options.cacheUserKey || 'anonymous'

  const projects = ref<ProjectDto[]>([])
  const projectForm = ref<ProjectForm>({ name: '', summary: '', status: 'pending' })
  const editingProjectId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showArchived = ref(false)
  const aiSuggestions = ref<Record<string, string[]>>({})
  const aiLoadingProjects: StringSetRef = ref(new Set())
  const savedSuggestions = ref<Set<string>>(new Set())
  const manualTaskProjects: StringSetRef = ref(new Set())
  const addingManualTasks: StringSetRef = ref(new Set())
  const manualTaskInputs = ref<ProjectStringMap>({})
  const taskCaptureOpen: StringSetRef = ref(new Set())
  const taskCaptureMode = ref<Record<string, TaskCaptureMode>>({})
  const batchTaskInputs = ref<ProjectStringMap>({})
  const addingBatchTasks: StringSetRef = ref(new Set())
  const taskCaptureErrors = ref<Record<string, ReturnType<typeof createEmptyTaskCaptureError>>>({})
  const projectTasks = ref<ProjectTaskMap>({})
  const loadingProjectTasks: StringSetRef = ref(new Set())
  const projectFormErrors = ref(createEmptyProjectErrors())
  const editProjectErrors = ref<ProjectErrorsById>({})
  const editingOriginalData = ref<ProjectSnapshotsById>({})

  function emitRefreshed(): void {
    onRefreshed(projects.value)
  }

  function resolveCacheUserKey(): string {
    return unref(cacheUserKey) || 'anonymous'
  }

  function resolveProjectsCacheVariant(): 'active' | 'archived' {
    return showArchived.value ? 'archived' : 'active'
  }

  function resolveProjectTasksCacheVariant(projectId: string, archived: boolean): string {
    return `${projectId}:${archived ? 'archived' : 'active'}`
  }

  function hydrateProjectsFromCache(): boolean {
    const cachedProjects = readResourceCache<ProjectDto[]>(resolveCacheUserKey(), PROJECTS_CACHE_RESOURCE, resolveProjectsCacheVariant())
    if (!Array.isArray(cachedProjects)) return false
    projects.value = cachedProjects
    projects.value.forEach(project => {
      hydrateProjectTasksFromCache(project._id, project.archived === true)
    })
    emitRefreshed()
    return true
  }

  function cacheCurrentProjects(): void {
    writeResourceCache(resolveCacheUserKey(), PROJECTS_CACHE_RESOURCE, resolveProjectsCacheVariant(), projects.value)
  }

  function hydrateProjectTasksFromCache(projectId: string, archived: boolean): boolean {
    const cachedTasks = readResourceCache<TaskApiTask[]>(
      resolveCacheUserKey(),
      PROJECT_TASKS_CACHE_RESOURCE,
      resolveProjectTasksCacheVariant(projectId, archived)
    )
    if (!Array.isArray(cachedTasks)) return false
    projectTasks.value[projectId] = cachedTasks
    return true
  }

  function cacheProjectTasks(projectId: string, archived: boolean): void {
    writeResourceCache(
      resolveCacheUserKey(),
      PROJECT_TASKS_CACHE_RESOURCE,
      resolveProjectTasksCacheVariant(projectId, archived),
      projectTasks.value[projectId] || []
    )
  }

  function syncProjects(nextProjects: ProjectDto[]): void {
    if (!Array.isArray(nextProjects)) return
    projects.value = [...nextProjects]
    projects.value.forEach(project => {
      void fetchProjectTasksForCard(project._id)
    })
  }

  async function fetchProjectTasksForCard(projectId: string): Promise<void> {
    loadingProjectTasks.value.add(projectId)
    const project = projects.value.find(p => p._id === projectId)
    const archived = project?.archived === true
    hydrateProjectTasksFromCache(projectId, archived)
    try {
      const tasks = await fetchProjectCardTasks(projectId, archived)
      projectTasks.value[projectId] = tasks
      cacheProjectTasks(projectId, archived)
    } catch (e) {
      console.error('Failed to fetch project tasks:', e)
      if (!projectTasks.value[projectId]) {
        projectTasks.value[projectId] = []
      }
    } finally {
      loadingProjectTasks.value.delete(projectId)
    }
  }

  async function fetchProjects(): Promise<void> {
    loading.value = true
    error.value = null
    const hydratedFromCache = hydrateProjectsFromCache()
    try {
      const fetchedProjects = await fetchProjectsRequest({ archived: showArchived.value })
      projects.value = fetchedProjects
      cacheCurrentProjects()
      await Promise.all(fetchedProjects.map(project => fetchProjectTasksForCard(project._id)))
      emitRefreshed()
    } catch (e) {
      if (hydratedFromCache) {
        notify('Showing cached projects. Refresh failed.', 'error')
      } else {
        error.value = 'Failed to load projects'
      }
    } finally {
      loading.value = false
    }
  }

  async function createProject(): Promise<void> {
    const errors = validateProjectFields(projectForm.value)
    projectFormErrors.value = errors
    if (hasProjectErrors(errors)) return

    loading.value = true
    error.value = null
    try {
      const project = await createProjectRequest(projectForm.value)
      projects.value.unshift(project)
      cacheCurrentProjects()
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

  async function updateProject(project: ProjectWithId): Promise<void> {
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
      cacheCurrentProjects()
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

  async function deleteProject(id: string): Promise<void> {
    if (!confirm('Delete this project?')) return

    loading.value = true
    error.value = null
    try {
      await deleteProjectRequest(id)
      projects.value = projects.value.filter(p => p._id !== id)
      cacheCurrentProjects()
      emitRefreshed()
      notify('Project deleted')
    } catch (e) {
      notify('Failed to delete project. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function archiveProject(project: ProjectWithId): Promise<void> {
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

  async function restoreProject(project: ProjectWithId): Promise<void> {
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

  async function pinProject(project: ProjectWithId): Promise<void> {
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

  async function unpinProject(project: ProjectWithId): Promise<void> {
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

  function startEditingProject(project: ProjectWithId): void {
    editingProjectId.value = project._id
    editProjectErrors.value[project._id] = createEmptyProjectErrors()
    editingOriginalData.value[project._id] = {
      name: project.name,
      summary: project.summary,
      status: project.status
    }
  }

  function cancelEditProject(project: ProjectWithId | null): void {
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

  function ensureEditProjectErrorState(projectId: string): ReturnType<typeof createEmptyProjectErrors> {
    if (!editProjectErrors.value[projectId]) {
      editProjectErrors.value[projectId] = createEmptyProjectErrors()
    }
    return editProjectErrors.value[projectId]
  }

  function updateProjectFieldError(target: ProjectFieldTarget, field: ProjectEditableField, value: string, projectId: string | null = null): void {
    const trimmed = value.trim()
    if (target === 'new') {
      if (field === 'name') {
        projectFormErrors.value.name = trimmed ? '' : projectFormErrors.value.name
      } else {
        projectFormErrors.value.summary = trimmed ? '' : projectFormErrors.value.summary
      }
      return
    }

    if (!projectId) return
    const errors = ensureEditProjectErrorState(projectId)
    if (field === 'name') {
      errors.name = trimmed ? '' : errors.name
    } else {
      errors.summary = trimmed ? '' : errors.summary
    }
  }

  function clearEditProjectErrors(projectId: string): void {
    delete editProjectErrors.value[projectId]
  }

  function ensureTaskCaptureErrorState(projectId: string): TaskCaptureError {
    if (!taskCaptureErrors.value[projectId]) {
      taskCaptureErrors.value[projectId] = createEmptyTaskCaptureError()
    }
    return taskCaptureErrors.value[projectId]
  }

  function setTaskCaptureError(projectId: string, mode: TaskCaptureMode, message: string): void {
    const errors = ensureTaskCaptureErrorState(projectId)
    errors[mode] = message
  }

  function clearTaskCaptureError(projectId: string, mode: TaskCaptureMode | null = null): void {
    if (!taskCaptureErrors.value[projectId]) return
    if (!mode) {
      delete taskCaptureErrors.value[projectId]
      return
    }
    taskCaptureErrors.value[projectId][mode] = ''
  }

  function handleTaskCaptureInput(projectId: string, mode: TaskCaptureMode, value: string): void {
    if (value.trim()) {
      clearTaskCaptureError(projectId, mode)
    }
  }

  function openTaskCapture(projectId: string): void {
    const nextState = getInitialTaskCaptureState()

    taskCaptureOpen.value.add(projectId)
    taskCaptureMode.value[projectId] = nextState.mode
    manualTaskInputs.value[projectId] = nextState.singleInput || ''
    taskCaptureErrors.value[projectId] = nextState.errors

    if (nextState.manualProjectActive) {
      manualTaskProjects.value.add(projectId)
    } else {
      manualTaskProjects.value.delete(projectId)
    }
  }

  function closeTaskCapture(projectId: string): void {
    taskCaptureOpen.value.delete(projectId)
    delete taskCaptureMode.value[projectId]
    delete manualTaskInputs.value[projectId]
    delete batchTaskInputs.value[projectId]
    manualTaskProjects.value.delete(projectId)
    clearTaskCaptureError(projectId)
  }

  function setTaskCaptureMode(projectId: string, mode: string): void {
    const nextState = getNextTaskCaptureModeState(mode, {
      singleInput: manualTaskInputs.value[projectId],
      batchInput: batchTaskInputs.value[projectId]
    })

    taskCaptureMode.value[projectId] = nextState.mode
    taskCaptureErrors.value[projectId] = nextState.errors

    if (nextState.manualProjectActive) {
      manualTaskProjects.value.add(projectId)
      manualTaskInputs.value[projectId] = nextState.singleInput || ''
      delete batchTaskInputs.value[projectId]
    } else {
      manualTaskProjects.value.delete(projectId)
      batchTaskInputs.value[projectId] = nextState.batchInput || ''
      delete manualTaskInputs.value[projectId]
    }
  }

  async function addManualTask(project: ProjectWithId): Promise<void> {
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

  async function addBatchTasks(project: ProjectWithId): Promise<void> {
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

  function getCurrentFocusDisplay(project: ProjectDto): string {
    return getProjectFocusTitle(project, projectTasks.value[project._id] || [])
  }

  function closeAISuggestions(projectId: string): void {
    delete aiSuggestions.value[projectId]
  }

  function getProjectAIState(projectId: string): 'pending' | 'active' | 'idle' {
    if (aiLoadingProjects.value.has(projectId)) return 'pending'
    if (aiSuggestions.value[projectId] && aiSuggestions.value[projectId].length > 0) return 'active'
    return 'idle'
  }

  async function handleAISuggest(project: ProjectWithId): Promise<void> {
    aiLoadingProjects.value.add(project._id)
    try {
      const result = await fetchProjectNextActions(project._id)
      aiSuggestions.value[project._id] = result.suggestions || []
    } catch (e) {
      aiSuggestions.value[project._id] = ['Failed to get AI suggestion']
    } finally {
      aiLoadingProjects.value.delete(project._id)
    }
  }

  async function saveSuggestionAsTask(projectId: string, suggestion: string): Promise<void> {
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

  async function setTaskAsFocus(project: ProjectWithId, task: TaskApiTask): Promise<void> {
    if (!canSetProjectFocus(task)) return
    if (!task._id) return

    try {
      const updated = await updateProjectFocus(project, String(task._id))
      const index = projects.value.findIndex(p => p._id === project._id)
      if (index !== -1) {
        projects.value[index] = updated
      }
      emitRefreshed()
    } catch (e) {
      error.value = 'Failed to set focus'
    }
  }

  function setProjectArchiveView(view: string): void {
    showArchived.value = view === 'archived'
    void fetchProjects()
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
