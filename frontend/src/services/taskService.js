// Task Service - shared task state management
import { ref } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const tasksRef = ref([])

export function buildTaskPayload(title, creationMode, originModule = '', originId = null, originLabel = '', linkedProjectId = null, linkedProjectName = '') {
  return {
    title,
    creationMode,
    originModule,
    originId,
    originLabel,
    linkedProjectId,
    linkedProjectName
  }
}

export function normalizeSavedTask(task) {
  if (!task) return task

  return {
    ...task,
    status: task.status === undefined ? 'active' : task.status,
    completed: task.completed === undefined ? false : task.completed
  }
}

export async function fetchTasks(archived = false) {
  try {
    const url = archived ? `${API_BASE}/tasks?archived=true` : `${API_BASE}/tasks`
    const res = await fetch(url)
    const tasks = await res.json()
    tasksRef.value = tasks
    return tasksRef.value
  } catch (e) {
    console.error('Failed to fetch tasks:', e)
    return []
  }
}

export async function saveTask(title, creationMode, originModule = '', originId = null, originLabel = '', linkedProjectId = null, linkedProjectName = '') {
  try {
    const taskData = buildTaskPayload(
      title,
      creationMode,
      originModule,
      originId,
      originLabel,
      linkedProjectId,
      linkedProjectName
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
    }
    return newTask
  } catch (e) {
    console.error('Failed to save task:', e)
    return null
  }
}

export async function fetchProjectTasks(projectId) {
  try {
    const res = await fetch(`${API_BASE}/tasks?projectId=${projectId}`)
    const tasks = await res.json()
    return tasks
  } catch (e) {
    console.error('Failed to fetch project tasks:', e)
    return []
  }
}
