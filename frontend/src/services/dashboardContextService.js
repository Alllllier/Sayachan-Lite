import { useCockpitSignals } from '../stores/cockpitSignals'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export async function refreshDashboardContext() {
  const cockpitSignals = useCockpitSignals()

  try {
    const [projectsRes, tasksRes] = await Promise.all([
      fetch(`${API_BASE}/projects`),
      fetch(`${API_BASE}/tasks`)
    ])

    const projects = await projectsRes.json()
    const tasks = await tasksRes.json()

    const safeProjects = Array.isArray(projects) ? projects : []
    const safeTasks = Array.isArray(tasks) ? tasks : []

    const activeProjectsCount = safeProjects.filter(p => p.status !== 'archived').length
    const activeTasksCount = safeTasks.filter(t => t.status !== 'archived' && t.status !== 'completed').length
    const pinnedProject = safeProjects.find(p => p.isPinned && p.status !== 'archived')
    const pinnedProjectName = pinnedProject?.name || ''

    // Canonical: task-based focus only
    const focusProject = safeProjects.find(
      p => p.status !== 'archived' && p.currentFocusTaskId
    )
    let currentNextAction = ''
    if (focusProject) {
      const focusTask = safeTasks.find(
        t => String(t._id) === String(focusProject.currentFocusTaskId)
      )
      currentNextAction = focusTask?.title || ''
    }

    const snapshot = {
      activeProjectsCount,
      activeTasksCount,
      pinnedProjectName,
      currentNextAction
    }

    cockpitSignals.setSignals(snapshot)
    return snapshot
  } catch (e) {
    console.error('[DashboardContext] Failed to refresh context:', e)
    throw e
  }
}
