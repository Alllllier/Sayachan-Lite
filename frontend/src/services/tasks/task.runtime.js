import { ref } from 'vue'

import { createTask, fetchTaskList } from './task.api.js'

/** @typedef {{ value: import('./task.rules.js').TaskApiTask[] }} RuntimeTaskListRef */
/** @typedef {import('./task.rules.js').TaskApiTask} RuntimeTask */
/** @typedef {import('./task.rules.js').NormalizedTask} RuntimeNormalizedTask */

/** @type {RuntimeTaskListRef} */
export const tasksRef = ref([])

/** @type {RuntimeTaskListRef} */
export const activeTasksSnapshotRef = ref([])

/**
 * @param {boolean} [archived]
 * @returns {Promise<RuntimeTask[]>}
 */
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
    throw e
  }
}

/**
 * @param {string} title
 * @param {string} creationMode
 * @param {string} [originModule]
 * @param {string | null} [originId]
 * @returns {Promise<RuntimeNormalizedTask | null>}
 */
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

/**
 * @param {RuntimeTask | null | undefined} task
 * @returns {void}
 */
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

/**
 * @param {string} taskId
 * @returns {void}
 */
export function removeTaskFromActiveSnapshot(taskId) {
  activeTasksSnapshotRef.value = activeTasksSnapshotRef.value.filter(
    task => task?._id !== taskId
  )
}
