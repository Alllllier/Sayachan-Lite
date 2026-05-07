// @ts-check

/**
 * @typedef {'active' | 'completed' | (string & {})} DashboardTaskStatus
 * @typedef {'ai' | 'manual' | (string & {})} DashboardCreationMode
 *
 * @typedef {Object} DashboardTask
 * @property {string | number} [_id]
 * @property {string} [title]
 * @property {DashboardTaskStatus} [status]
 * @property {boolean} [completed]
 * @property {boolean} [archived]
 * @property {string} [originModule]
 * @property {DashboardCreationMode} [creationMode]
 *
 * @typedef {Object} DashboardTaskRowState
 * @property {boolean} interactive
 * @property {'button' | undefined} role
 * @property {0 | undefined} tabindex
 * @property {boolean | undefined} ariaPressed
 *
 * @typedef {Object} DashboardTaskCompletionPayload
 * @property {boolean} completed
 * @property {'active' | 'completed'} status
 *
 * @typedef {Object} DashboardTaskArchivePayload
 * @property {boolean} archived
 *
 * @typedef {Object} DashboardTaskProvenance
 * @property {string} letter
 * @property {string} className
 * @property {string} tooltip
 */

export const DASHBOARD_SAVED_TASK_PREVIEW_LIMIT = 5

/**
 * @param {DashboardTask[] | null | undefined} tasks
 * @param {boolean} isExpanded
 * @param {number} [limit]
 * @returns {DashboardTask[]}
 */
export function getVisibleDashboardTasks(tasks, isExpanded, limit = DASHBOARD_SAVED_TASK_PREVIEW_LIMIT) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return isExpanded ? safeTasks : safeTasks.slice(0, limit)
}

/**
 * @param {DashboardTask[] | null | undefined} tasks
 * @param {number} [limit]
 * @returns {boolean}
 */
export function hasDashboardTaskOverflow(tasks, limit = DASHBOARD_SAVED_TASK_PREVIEW_LIMIT) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return safeTasks.length > limit
}

/**
 * @param {DashboardTask[] | null | undefined} tasks
 * @param {boolean} isExpanded
 * @param {number} [limit]
 * @returns {string}
 */
export function getDashboardTaskToggleLabel(tasks, isExpanded, limit = DASHBOARD_SAVED_TASK_PREVIEW_LIMIT) {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  if (isExpanded) {
    return 'Show less'
  }

  return hasDashboardTaskOverflow(safeTasks, limit)
    ? `Show all (${safeTasks.length})`
    : 'Expand details'
}

/**
 * @param {boolean} isExpanded
 * @returns {'expanded' | 'preview'}
 */
export function getDashboardTaskListMode(isExpanded) {
  return isExpanded ? 'expanded' : 'preview'
}

/**
 * @param {DashboardTask[] | null | undefined} tasks
 * @param {DashboardTask | null | undefined} newTask
 * @returns {DashboardTask[]}
 */
export function prependDashboardTask(tasks, newTask) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return newTask ? [newTask, ...safeTasks] : safeTasks
}

/**
 * @param {DashboardTask[] | null | undefined} tasks
 * @param {string | number | null | undefined} taskId
 * @returns {DashboardTask[]}
 */
export function removeDashboardTask(tasks, taskId) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return safeTasks.filter(task => task?._id !== taskId)
}

/**
 * @param {DashboardTask[] | null | undefined} tasks
 * @param {DashboardTask | null | undefined} updatedTask
 * @returns {DashboardTask[]}
 */
export function applyDashboardTaskUpdate(tasks, updatedTask) {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  return safeTasks.map(task => (
    task?._id === updatedTask?._id
      ? { ...task, ...updatedTask }
      : task
  ))
}

/**
 * @param {DashboardTask | null | undefined} task
 * @param {boolean} showArchived
 * @returns {DashboardTaskRowState}
 */
export function deriveDashboardTaskRowState(task, showArchived) {
  const isInteractive = !showArchived
  const isCompleted = Boolean(task?.completed || task?.status === 'completed')

  return {
    interactive: isInteractive,
    role: isInteractive ? 'button' : undefined,
    tabindex: isInteractive ? 0 : undefined,
    ariaPressed: isInteractive ? isCompleted : undefined
  }
}

/**
 * @param {boolean} showArchived
 * @returns {['Archive' | 'Restore', 'Delete']}
 */
export function getDashboardTaskActions(showArchived) {
  return [
    showArchived ? 'Restore' : 'Archive',
    'Delete'
  ]
}

/**
 * @param {DashboardTask | null | undefined} task
 * @returns {DashboardTaskCompletionPayload}
 */
export function buildDashboardTaskCompletionPayload(task) {
  const status = task?.status === 'completed' ? 'active' : 'completed'

  return {
    completed: status === 'completed',
    status
  }
}

/**
 * @param {DashboardTask | null | undefined} task
 * @returns {DashboardTaskArchivePayload}
 */
export function buildDashboardTaskArchivePayload(task) {
  return {
    archived: !task?.archived
  }
}

/**
 * @param {DashboardTask | null | undefined} task
 * @returns {DashboardTaskProvenance}
 */
export function deriveDashboardTaskProvenance(task) {
  const originModule = task?.originModule?.toLowerCase() || ''
  const creationMode = task?.creationMode

  let letter = '?'
  if (originModule.includes('note')) {
    letter = 'N'
  } else if (originModule.includes('project')) {
    letter = 'P'
  } else if (originModule === 'dashboard') {
    letter = 'D'
  }

  let className = ''
  if (creationMode === 'ai') {
    className = 'provenance-ai'
  } else if (creationMode === 'manual') {
    className = 'provenance-manual'
  }

  let tooltip = 'Manual'
  if (creationMode === 'ai') {
    tooltip = 'AI generated'
  } else if (task?.originModule === 'dashboard') {
    tooltip = 'Dashboard quick add'
  } else if (task?.originModule === 'note') {
    tooltip = 'Note task'
  } else if (task?.originModule === 'project') {
    tooltip = 'Project task'
  }

  return {
    letter,
    className,
    tooltip
  }
}
