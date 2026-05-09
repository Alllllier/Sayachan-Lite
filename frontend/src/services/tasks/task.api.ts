import { buildTaskPayload, normalizeSavedTask } from './task.rules.js'
import type { NormalizedTask, TaskApiTask, TaskCreationMode, TaskUpdatePayload } from './task.rules.js'

import { apiFetch, API_BASE } from '../apiClient'
import {
  parseApiJsonResponse,
  parseOptionalApiJsonResponse
} from '../apiResponse'
import {
  taskListResponseSchema,
  taskResponseSchema
} from '@sayachan/contracts'

type FetchTaskListOptions = {
  archived?: boolean
}

export async function fetchTaskList({ archived = false }: FetchTaskListOptions = {}): Promise<TaskApiTask[]> {
  const url = archived ? `${API_BASE}/tasks?archived=true` : `${API_BASE}/tasks`
  const res = await apiFetch(url)
  return parseApiJsonResponse(res, `Fetch tasks failed: ${res.status}`, taskListResponseSchema, 'tasks list')
}

export async function createTask(
  title: string,
  creationMode: TaskCreationMode,
  originModule = '',
  originId: string | null = null
): Promise<NormalizedTask | null> {
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
  const savedTask = await parseOptionalApiJsonResponse(res, `Create task failed: ${res.status}`, taskResponseSchema, 'task create')
  return normalizeSavedTask(savedTask) || null
}

export async function updateTask(
  taskId: string,
  payload: TaskUpdatePayload
): Promise<NormalizedTask | null> {
  const res = await apiFetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const updatedTask = await parseOptionalApiJsonResponse(res, `Update task failed: ${res.status}`, taskResponseSchema, 'task update')
  return normalizeSavedTask(updatedTask) || null
}

export async function deleteTask(taskId: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    throw new Error(`Delete task failed: ${res.status}`)
  }
}

export async function fetchProjectTasks(projectId: string, archived = false): Promise<TaskApiTask[]> {
  try {
    let url = `${API_BASE}/tasks?projectId=${projectId}`
    if (archived) {
      url += '&archived=true'
    }
    const res = await apiFetch(url)
    return parseApiJsonResponse(res, `Fetch project tasks failed: ${res.status}`, taskListResponseSchema, 'project tasks')
  } catch (e) {
    console.error('Failed to fetch project tasks:', e)
    return []
  }
}

export async function fetchProjectCardTasks(projectId: string, projectArchived = false): Promise<TaskApiTask[]> {
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
