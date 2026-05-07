export type TaskStatus = 'active' | 'completed' | 'archived' | (string & {})

export type TaskProvenance = {
  creationMode: string
  originModule: string
  originId: string | null
}

export type TaskCreatePayload = TaskProvenance & {
  title: string
}

export type TaskUpdatePayload = Partial<{
  title: string
  status: TaskStatus
  archived: boolean
  completed: boolean
  creationMode: string
  originModule: string
  originId: string | null
}>

export type TaskApiTask = Partial<TaskProvenance> & {
  _id?: string | number
  title?: string
  status?: TaskStatus
  archived?: boolean
  completed?: boolean
}

export type NormalizedTask = TaskApiTask & {
  status: TaskStatus
  archived: boolean
  completed: boolean
}

export function buildTaskPayload(
  title: string,
  creationMode: string,
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
