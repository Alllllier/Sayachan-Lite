// @ts-check

/**
 * @typedef {'active' | 'completed' | (string & {})} ProjectTaskStatus
 * @typedef {'active' | 'completed'} ProjectTaskFilter
 * @typedef {'single' | 'batch'} TaskCaptureMode
 *
 * @typedef {Object} ProjectFieldErrors
 * @property {string} name
 * @property {string} summary
 *
 * @typedef {Object} ProjectLike
 * @property {string} [name]
 * @property {string} [summary]
 * @property {boolean} [archived]
 * @property {string | number | null} [currentFocusTaskId]
 *
 * @typedef {Object} ProjectTask
 * @property {string | number} [_id]
 * @property {string} [title]
 * @property {ProjectTaskStatus} [status]
 * @property {boolean} [archived]
 *
 * @typedef {Object} TaskCaptureError
 * @property {string} single
 * @property {string} batch
 *
 * @typedef {Object} TaskCaptureInputs
 * @property {string} [singleInput]
 * @property {string} [batchInput]
 *
 * @typedef {Object} TaskCaptureState
 * @property {TaskCaptureMode} mode
 * @property {string | undefined} [singleInput]
 * @property {string | undefined} [batchInput]
 * @property {TaskCaptureError} errors
 * @property {boolean} manualProjectActive
 *
 * @typedef {Object} ProjectTaskBuckets
 * @property {ProjectTask[]} active
 * @property {ProjectTask[]} completed
 * @property {ProjectTask[]} archived
 */

export const PROJECT_TASK_PREVIEW_LIMIT = 3

/**
 * @returns {ProjectFieldErrors}
 */
export function createEmptyProjectErrors() {
  return { name: '', summary: '' }
}

/**
 * @param {ProjectLike | null | undefined} projectLike
 * @returns {ProjectFieldErrors}
 */
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

/**
 * @param {Partial<ProjectFieldErrors> | null | undefined} errors
 * @returns {boolean}
 */
export function hasProjectErrors(errors) {
  return Boolean(errors?.name || errors?.summary)
}

/**
 * @returns {TaskCaptureError}
 */
export function createEmptyTaskCaptureError() {
  return { single: '', batch: '' }
}

/**
 * @returns {TaskCaptureState}
 */
export function getInitialTaskCaptureState() {
  return {
    mode: 'single',
    singleInput: '',
    errors: createEmptyTaskCaptureError(),
    manualProjectActive: true
  }
}

/**
 * @param {TaskCaptureMode | string} mode
 * @param {TaskCaptureInputs} [currentInputs]
 * @returns {TaskCaptureState}
 */
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

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function validateSingleTaskCapture(value) {
  return value?.trim() ? '' : 'Enter a task title.'
}

/**
 * @param {string | null | undefined} value
 * @returns {string[]}
 */
export function parseBatchTaskTitles(value) {
  return (value || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function validateBatchTaskCapture(value) {
  return parseBatchTaskTitles(value).length > 0
    ? ''
    : 'Enter at least one task title.'
}

/**
 * @param {ProjectTask[] | null | undefined} tasks
 * @returns {ProjectTaskBuckets}
 */
export function getProjectTaskBuckets(tasks) {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  return {
    active: safeTasks.filter(task => task.status === 'active' && !task.archived),
    completed: safeTasks.filter(task => task.status === 'completed' && !task.archived),
    archived: safeTasks.filter(task => task.archived)
  }
}

/**
 * @param {ProjectLike | null | undefined} project
 * @param {ProjectTask[] | null | undefined} tasks
 * @param {ProjectTaskFilter | string} [filter]
 * @param {boolean} [expanded]
 * @returns {ProjectTask[]}
 */
export function getProjectPreviewTasks(project, tasks, filter = 'active', expanded = false) {
  const buckets = getProjectTaskBuckets(tasks)
  const previewTasks = project?.archived
    ? buckets.archived
    : filter === 'completed'
      ? buckets.completed
      : buckets.active

  return expanded ? previewTasks : previewTasks.slice(0, PROJECT_TASK_PREVIEW_LIMIT)
}

/**
 * @param {ProjectLike | null | undefined} project
 * @param {ProjectTask[] | null | undefined} tasks
 * @param {ProjectTaskFilter | string} [filter]
 * @param {boolean} [expanded]
 * @returns {ProjectTask[]}
 */
export function getProjectPrimaryPreviewTasks(project, tasks, filter = 'active', expanded = false) {
  if (project?.archived) {
    return []
  }

  return getProjectPreviewTasks(project, tasks, filter, expanded)
}

/**
 * @param {ProjectLike | null | undefined} project
 * @param {ProjectTask[] | null | undefined} tasks
 * @param {boolean} [expanded]
 * @returns {ProjectTask[]}
 */
export function getProjectArchivedPreviewTasks(project, tasks, expanded = false) {
  const buckets = getProjectTaskBuckets(tasks)
  return expanded ? buckets.archived : buckets.archived.slice(0, PROJECT_TASK_PREVIEW_LIMIT)
}

/**
 * @param {ProjectTask | null | undefined} task
 * @returns {boolean}
 */
export function canSetProjectFocus(task) {
  return task?.status === 'active' && task?.archived !== true
}

/**
 * @param {ProjectLike | null | undefined} project
 * @param {ProjectTask[] | null | undefined} tasks
 * @returns {string}
 */
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
