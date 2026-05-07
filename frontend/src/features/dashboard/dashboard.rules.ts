import type { TaskCreationMode, TaskStatus } from '@sayachan/contracts'

export type DashboardTask = {
  _id?: string | number
  title?: string
  status?: TaskStatus
  completed?: boolean
  archived?: boolean
  originModule?: string
  creationMode?: TaskCreationMode | string
}

type DashboardTaskRowState = {
  interactive: boolean
  role: 'button' | undefined
  tabindex: 0 | undefined
  ariaPressed: boolean | undefined
}

type DashboardTaskCompletionPayload = {
  completed: boolean
  status: 'active' | 'completed'
}

type DashboardTaskArchivePayload = {
  archived: boolean
}

type DashboardTaskProvenance = {
  letter: string
  className: string
  tooltip: string
}

export const DASHBOARD_SAVED_TASK_PREVIEW_LIMIT = 5

export function getVisibleDashboardTasks(
  tasks: DashboardTask[] | null | undefined,
  isExpanded: boolean,
  limit = DASHBOARD_SAVED_TASK_PREVIEW_LIMIT
): DashboardTask[] {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return isExpanded ? safeTasks : safeTasks.slice(0, limit)
}

export function hasDashboardTaskOverflow(
  tasks: DashboardTask[] | null | undefined,
  limit = DASHBOARD_SAVED_TASK_PREVIEW_LIMIT
): boolean {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return safeTasks.length > limit
}

export function getDashboardTaskToggleLabel(
  tasks: DashboardTask[] | null | undefined,
  isExpanded: boolean,
  limit = DASHBOARD_SAVED_TASK_PREVIEW_LIMIT
): string {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  if (isExpanded) {
    return 'Show less'
  }

  return hasDashboardTaskOverflow(safeTasks, limit)
    ? `Show all (${safeTasks.length})`
    : 'Expand details'
}

export function getDashboardTaskListMode(isExpanded: boolean): 'expanded' | 'preview' {
  return isExpanded ? 'expanded' : 'preview'
}

export function prependDashboardTask(
  tasks: DashboardTask[] | null | undefined,
  newTask: DashboardTask | null | undefined
): DashboardTask[] {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return newTask ? [newTask, ...safeTasks] : safeTasks
}

export function removeDashboardTask(
  tasks: DashboardTask[] | null | undefined,
  taskId: string | number | null | undefined
): DashboardTask[] {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return safeTasks.filter(task => task?._id !== taskId)
}

export function applyDashboardTaskUpdate(
  tasks: DashboardTask[] | null | undefined,
  updatedTask: DashboardTask | null | undefined
): DashboardTask[] {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  return safeTasks.map(task => (
    task?._id === updatedTask?._id
      ? { ...task, ...(updatedTask ?? {}) }
      : task
  ))
}

export function deriveDashboardTaskRowState(
  task: DashboardTask | null | undefined,
  showArchived: boolean
): DashboardTaskRowState {
  const isInteractive = !showArchived
  const isCompleted = Boolean(task?.completed || task?.status === 'completed')

  return {
    interactive: isInteractive,
    role: isInteractive ? 'button' : undefined,
    tabindex: isInteractive ? 0 : undefined,
    ariaPressed: isInteractive ? isCompleted : undefined
  }
}

export function getDashboardTaskActions(showArchived: boolean): ['Archive' | 'Restore', 'Delete'] {
  return [
    showArchived ? 'Restore' : 'Archive',
    'Delete'
  ]
}

export function buildDashboardTaskCompletionPayload(
  task: DashboardTask | null | undefined
): DashboardTaskCompletionPayload {
  const status = task?.status === 'completed' ? 'active' : 'completed'

  return {
    completed: status === 'completed',
    status
  }
}

export function buildDashboardTaskArchivePayload(
  task: DashboardTask | null | undefined
): DashboardTaskArchivePayload {
  return {
    archived: !task?.archived
  }
}

export function deriveDashboardTaskProvenance(
  task: DashboardTask | null | undefined
): DashboardTaskProvenance {
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
