import { ref } from 'vue'

import { createTask, fetchTaskList } from './task.api.js'

export const tasksRef = ref([])
export const activeTasksSnapshotRef = ref([])

export async function fetchTasks(archived = false) {
  try {
    const tasks = await fetchTaskList({ archived })
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
    const newTask = await createTask(
      title,
      creationMode,
      originModule,
      originId
    )
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
