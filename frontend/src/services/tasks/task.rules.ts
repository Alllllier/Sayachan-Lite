import type { TaskCreateDto, TaskCreationMode as SharedTaskCreationMode, TaskDto, TaskStatus, TaskUpdateDto } from '@sayachan/contracts'

export type TaskCreationMode = SharedTaskCreationMode

export type TaskProvenance = {
  creationMode: TaskCreationMode
  originModule: string
  originId: string | null
}

export type TaskCreatePayload = TaskCreateDto & TaskProvenance & {
  title: string
}

export type TaskUpdatePayload = TaskUpdateDto

export type TaskApiTask = TaskDto

export type NormalizedTask = TaskApiTask & {
  status: TaskStatus
  archived: boolean
  completed: boolean
}

export function buildTaskPayload(
  title: string,
  creationMode: TaskCreationMode,
  originModule = '',
  originId: string | null = null
): TaskCreatePayload {
  return {
    title,
    creationMode,
    originModule,
    originId
  }
}

export function normalizeSavedTask(task: TaskApiTask | null | undefined): NormalizedTask | null | undefined {
  if (task === null) return null
  if (task === undefined) return undefined
  const status = task.status === undefined ? 'active' : task.status

  return {
    ...task,
    status,
    archived: task.archived === undefined ? false : task.archived,
    completed: task.completed === undefined ? status === 'completed' : task.completed
  }
}
