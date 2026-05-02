// Task Service - shared task state management
import { ref } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const tasksRef = ref([])
export const activeTasksSnapshotRef = ref([])

export function buildTaskPayload(title, creationMode, originModule = '', originId = null) {
  return {
    title,
    creationMode,
    originModule,
    originId
  }
}

export function normalizeSavedTask(task) {
  if (!task) return task
  const status = task.status === undefined ? 'active' : task.status

  return {
    ...task,
    status,
    archived: task.archived === undefined ? false : task.archived,
    completed: task.completed === undefined ? status === 'completed' : task.completed
  }
}

export async function fetchTasks(archived = false) {
  try {
    const url = archived ? `${API_BASE}/tasks?archived=true` : `${API_BASE}/tasks`
    const res = await fetch(url)
    const tasks = await res.json()
    tasksRef.value = tasks
    if (!archived) {
      activeTasksSnapshotRef.value = tasks
    }
    return tasksRef.value
  } catch (e) {
    console.error('Failed to fetch tasks:', e)
    return []
  }
}

export async function saveTask(title, creationMode, originModule = '', originId = null) {
  try {
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
    const newTask = normalizeSavedTask(savedTask)
    if (newTask) {
      tasksRef.value.unshift(newTask)
      if (!newTask.archived) {
        activeTasksSnapshotRef.value = [newTask, ...activeTasksSnapshotRef.value]
      }
    }
    return newTask
  } catch (e) {
    console.error('Failed to save task:', e)
    return null
  }
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

export function syncTaskIntoActiveSnapshot(task) {
  if (!task?._id) return

  if (task.archived) {
    activeTasksSnapshotRef.value = activeTasksSnapshotRef.value.filter(
      existingTask => existingTask?._id !== task._id
    )
    return
  }

  const nextTasks = activeTasksSnapshotRef.value.some(existingTask => existingTask?._id === task._id)
    ? activeTasksSnapshotRef.value.map(existingTask => (
        existingTask?._id === task._id
          ? { ...existingTask, ...task }
          : existingTask
      ))
    : [task, ...activeTasksSnapshotRef.value]

  activeTasksSnapshotRef.value = nextTasks
}

export function removeTaskFromActiveSnapshot(taskId) {
  activeTasksSnapshotRef.value = activeTasksSnapshotRef.value.filter(
    task => task?._id !== taskId
  )
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
