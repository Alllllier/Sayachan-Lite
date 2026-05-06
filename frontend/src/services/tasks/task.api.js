import { buildTaskPayload, normalizeSavedTask } from './task.rules.js'

import { apiFetch, API_BASE } from '../apiClient'

/** @typedef {import('./task.rules.js').NormalizedTask} ApiNormalizedTask */
/** @typedef {import('./task.rules.js').TaskApiTask} ApiTask */
/** @typedef {import('./task.rules.js').TaskUpdatePayload} ApiTaskUpdatePayload */

/**
 * @typedef {Object} FetchTaskListOptions
 * @property {boolean} [archived]
 */

/**
 * @param {FetchTaskListOptions} [options]
 * @returns {Promise<ApiTask[]>}
 */
export async function fetchTaskList({ archived = false } = {}) {
  const url = archived ? `${API_BASE}/tasks?archived=true` : `${API_BASE}/tasks`
  const res = await apiFetch(url)
  return res.json()
}

/**
 * @param {string} title
 * @param {string} creationMode
 * @param {string} [originModule]
 * @param {string | null} [originId]
 * @returns {Promise<ApiNormalizedTask | null | undefined>}
 */
export async function createTask(title, creationMode, originModule = '', originId = null) {
  const taskData = buildTaskPayload(
    title,
    creationMode,
    originModule,
    originId
  )

  const res = await apiFetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  })
  const savedTask = await res.json()
  return normalizeSavedTask(savedTask)
}

/**
 * @param {string} taskId
 * @param {ApiTaskUpdatePayload} payload
 * @returns {Promise<ApiNormalizedTask | null | undefined>}
 */
export async function updateTask(taskId, payload) {
  const res = await apiFetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const updatedTask = await res.json()
  return normalizeSavedTask(updatedTask)
}

/**
 * @param {string} taskId
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  const res = await apiFetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    throw new Error(`Delete task failed: ${res.status}`)
  }
}

/**
 * @param {string} projectId
 * @param {boolean} [archived]
 * @returns {Promise<ApiTask[]>}
 */
export async function fetchProjectTasks(projectId, archived = false) {
  try {
    let url = `${API_BASE}/tasks?projectId=${projectId}`
    if (archived) {
      url += '&archived=true'
    }
    const res = await apiFetch(url)
    const tasks = await res.json()
    return tasks
  } catch (e) {
    console.error('Failed to fetch project tasks:', e)
    return []
  }
}

/**
 * @param {string} projectId
 * @param {boolean} [projectArchived]
 * @returns {Promise<ApiTask[]>}
 */
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
