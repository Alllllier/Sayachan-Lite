import { useCockpitSignals } from '../stores/cockpitSignals'

import { apiFetch, API_BASE } from './apiClient'

type CockpitProject = {
  _id?: unknown
  name?: string
  archived?: boolean
  isPinned?: boolean
  currentFocusTaskId?: unknown
}

type CockpitTask = {
  _id?: unknown
  title?: string
  archived?: boolean
  status?: string
}

export type CockpitSnapshot = {
  activeProjectsCount: number
  activeTasksCount: number
  pinnedProjectName: string
  currentNextAction: string
}

export function deriveCockpitSnapshot(projects: unknown, tasks: unknown): CockpitSnapshot {
  const safeProjects = Array.isArray(projects) ? projects : []
  const safeTasks = Array.isArray(tasks) ? tasks : []

  const activeProjectsCount = safeProjects.filter((p: CockpitProject) => !p.archived).length
  const activeTasksCount = safeTasks.filter((t: CockpitTask) => !t.archived && t.status !== 'completed').length
  const pinnedProject = safeProjects.find((p: CockpitProject) => p.isPinned && !p.archived)
  const pinnedProjectName = pinnedProject?.name || ''

  const focusProject = safeProjects.find(
    (p: CockpitProject) => !p.archived && p.currentFocusTaskId
  )
  let currentNextAction = ''
  if (focusProject) {
    const focusTask = safeTasks.find(
      (t: CockpitTask) => String(t._id) === String(focusProject.currentFocusTaskId)
    )
    currentNextAction = focusTask?.title || ''
  }

  return {
    activeProjectsCount,
    activeTasksCount,
    pinnedProjectName,
    currentNextAction
  }
}

export async function refreshCockpitContext(): Promise<CockpitSnapshot> {
  const cockpitSignals = useCockpitSignals()

  try {
    const [projectsRes, tasksRes] = await Promise.all([
      apiFetch(`${API_BASE}/projects`),
      apiFetch(`${API_BASE}/tasks`)
    ])

    const projects = await projectsRes.json()
    const tasks = await tasksRes.json()

    const snapshot = deriveCockpitSnapshot(projects, tasks)

    cockpitSignals.setSignals(snapshot)
    return snapshot
  } catch (e) {
    console.error('[CockpitContext] Failed to refresh context:', e)
    throw e
  }
}
