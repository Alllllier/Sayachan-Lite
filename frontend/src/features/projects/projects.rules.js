export const PROJECT_TASK_PREVIEW_LIMIT = 3

export function createEmptyProjectErrors() {
  return { name: '', summary: '' }
}

export function validateProjectFields(projectLike) {
  const errors = createEmptyProjectErrors()

  if (!projectLike?.name?.trim()) {
    errors.name = 'Enter a project name.'
  }

  if (!projectLike?.summary?.trim()) {
    errors.summary = 'Enter a short summary.'
  }

  return errors
}

export function hasProjectErrors(errors) {
  return Boolean(errors?.name || errors?.summary)
}

export function createEmptyTaskCaptureError() {
  return { single: '', batch: '' }
}

export function getInitialTaskCaptureState() {
  return {
    mode: 'single',
    singleInput: '',
    errors: createEmptyTaskCaptureError(),
    manualProjectActive: true
  }
}

export function getNextTaskCaptureModeState(mode, currentInputs = {}) {
  if (mode === 'batch') {
    return {
      mode: 'batch',
      singleInput: undefined,
      batchInput: currentInputs.batchInput || '',
      manualProjectActive: false,
      errors: createEmptyTaskCaptureError()
    }
  }

  return {
    mode: 'single',
    singleInput: currentInputs.singleInput || '',
    batchInput: undefined,
    manualProjectActive: true,
    errors: createEmptyTaskCaptureError()
  }
}

export function validateSingleTaskCapture(value) {
  return value?.trim() ? '' : 'Enter a task title.'
}

export function parseBatchTaskTitles(value) {
  return (value || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

export function validateBatchTaskCapture(value) {
  return parseBatchTaskTitles(value).length > 0
    ? ''
    : 'Enter at least one task title.'
}

export function getProjectTaskBuckets(tasks) {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  return {
    active: safeTasks.filter(task => task.status === 'active' && !task.archived),
    completed: safeTasks.filter(task => task.status === 'completed' && !task.archived),
    archived: safeTasks.filter(task => task.archived)
  }
}

export function getProjectPreviewTasks(project, tasks, filter = 'active', expanded = false) {
  const buckets = getProjectTaskBuckets(tasks)
  const previewTasks = project?.archived
    ? buckets.archived
    : filter === 'completed'
      ? buckets.completed
      : buckets.active

  return expanded ? previewTasks : previewTasks.slice(0, PROJECT_TASK_PREVIEW_LIMIT)
}

export function getProjectPrimaryPreviewTasks(project, tasks, filter = 'active', expanded = false) {
  if (project?.archived) {
    return []
  }

  return getProjectPreviewTasks(project, tasks, filter, expanded)
}

export function getProjectArchivedPreviewTasks(project, tasks, expanded = false) {
  const buckets = getProjectTaskBuckets(tasks)
  return expanded ? buckets.archived : buckets.archived.slice(0, PROJECT_TASK_PREVIEW_LIMIT)
}

export function canSetProjectFocus(task) {
  return task?.status === 'active' && task?.archived !== true
}

export function getProjectFocusTitle(project, tasks) {
  if (!project?.currentFocusTaskId) {
    return ''
  }

  const safeTasks = Array.isArray(tasks) ? tasks : []
  const focusTask = safeTasks.find(
    task => String(task?._id) === String(project.currentFocusTaskId)
  )

  return focusTask?.title || ''
}
