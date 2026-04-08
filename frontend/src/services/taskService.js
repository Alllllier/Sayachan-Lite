// Task Service - shared task state management
import { ref } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const tasksRef = ref([])

export async function fetchTasks() {
  try {
    const res = await fetch(`${API_BASE}/tasks`)
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
    const taskData = {
      title,
      // Canonical semantic fields
      creationMode,
      originModule,
      originId,
      originLabel,
      linkedProjectId,
      linkedProjectName
    };

    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
    const newTask = await res.json()
    if (newTask) {
      if (newTask.status === undefined) {
        newTask.status = 'active'
      }
      if (newTask.completed === undefined) {
        newTask.completed = false
      }
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
