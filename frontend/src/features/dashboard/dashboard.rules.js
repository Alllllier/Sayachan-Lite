export const DASHBOARD_SAVED_TASK_PREVIEW_LIMIT = 5

export function getVisibleDashboardTasks(tasks, isExpanded, limit = DASHBOARD_SAVED_TASK_PREVIEW_LIMIT) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return isExpanded ? safeTasks : safeTasks.slice(0, limit)
}

export function hasDashboardTaskOverflow(tasks, limit = DASHBOARD_SAVED_TASK_PREVIEW_LIMIT) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return safeTasks.length > limit
}

export function getDashboardTaskToggleLabel(tasks, isExpanded, limit = DASHBOARD_SAVED_TASK_PREVIEW_LIMIT) {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  if (isExpanded) {
    return 'Show less'
  }

  return hasDashboardTaskOverflow(safeTasks, limit)
    ? `Show all (${safeTasks.length})`
    : 'Expand details'
}

export function getDashboardTaskListMode(isExpanded) {
  return isExpanded ? 'expanded' : 'preview'
}

export function prependDashboardTask(tasks, newTask) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return newTask ? [newTask, ...safeTasks] : safeTasks
}

export function removeDashboardTask(tasks, taskId) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return safeTasks.filter(task => task?._id !== taskId)
}

export function applyDashboardTaskUpdate(tasks, updatedTask) {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  return safeTasks.map(task => (
    task?._id === updatedTask?._id
      ? { ...task, ...updatedTask }
      : task
  ))
}

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

export function getDashboardTaskActions(showArchived) {
  return [
    showArchived ? 'Restore' : 'Archive',
    'Delete'
  ]
}

export function buildDashboardTaskCompletionPayload(task) {
  const status = task?.status === 'completed' ? 'active' : 'completed'

  return {
    completed: status === 'completed',
    status
  }
}

export function buildDashboardTaskArchivePayload(task) {
  return {
    archived: !task?.archived
  }
}

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
