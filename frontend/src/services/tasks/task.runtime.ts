import { ref } from 'vue'
import type { Ref } from 'vue'

import { createTask, fetchTaskList } from './task.api.js'
import type { NormalizedTask, TaskApiTask, TaskCreationMode } from './task.rules.js'

type RuntimeTaskListRef = Ref<TaskApiTask[]>

export const tasksRef: RuntimeTaskListRef = ref([])

export const activeTasksSnapshotRef: RuntimeTaskListRef = ref([])

export async function fetchTasks(archived = false): Promise<TaskApiTask[]> {
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

export async function saveTask(
  title: string,
  creationMode: TaskCreationMode,
  originModule = '',
  originId: string | null = null
): Promise<NormalizedTask | null> {
  try {
    const newTask = await createTask(
      title,
      creationMode,
      originModule,
      originId
    )
    if (!newTask) {
      return null
    }
    tasksRef.value.unshift(newTask)
    if (!newTask.archived) {
      activeTasksSnapshotRef.value = [newTask, ...activeTasksSnapshotRef.value]
    }
    return newTask
  } catch (e) {
    console.error('Failed to save task:', e)
    return null
  }
}

export function syncTaskIntoActiveSnapshot(task: TaskApiTask | null | undefined): void {
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

export function removeTaskFromActiveSnapshot(taskId: string): void {
  activeTasksSnapshotRef.value = activeTasksSnapshotRef.value.filter(
    task => task?._id !== taskId
  )
}
