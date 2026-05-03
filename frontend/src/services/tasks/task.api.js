import { buildTaskPayload, normalizeSavedTask } from './task.rules.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export async function fetchTaskList({ archived = false } = {}) {
  const url = archived ? `${API_BASE}/tasks?archived=true` : `${API_BASE}/tasks`
  const res = await fetch(url)
  return res.json()
}

export async function createTask(title, creationMode, originModule = '', originId = null) {
  const taskData = buildTaskPayload(
    title,
    creationMode,
    originModule,
    originId
  )

  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  })
  const savedTask = await res.json()
  return normalizeSavedTask(savedTask)
}

export async function updateTask(taskId, payload) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const updatedTask = await res.json()
  return normalizeSavedTask(updatedTask)
}

export async function deleteTask(taskId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    throw new Error(`Delete task failed: ${res.status}`)
  }
}

export async function fetchProjectTasks(projectId, archived = false) {
  try {
    let url = `${API_BASE}/tasks?projectId=${projectId}`
    if (archived) {
      url += '&archived=true'
    }
    const res = await fetch(url)
    const tasks = await res.json()
    return tasks
  } catch (e) {
    console.error('Failed to fetch project tasks:', e)
    return []
  }
}

export async function fetchProjectCardTasks(projectId, projectArchived = false) {
  if (projectArchived) {
    return fetchProjectTasks(projectId, true)
  }

  const [primaryTasks, archivedTasks] = await Promise.all([
    fetchProjectTasks(projectId, false),
    fetchProjectTasks(projectId, true)
  ])

  const primaryIds = new Set(primaryTasks.map(task => task?._id).filter(Boolean))
  const uniqueArchivedTasks = archivedTasks.filter(task => !primaryIds.has(task?._id))

  return [...primaryTasks, ...uniqueArchivedTasks]
}
