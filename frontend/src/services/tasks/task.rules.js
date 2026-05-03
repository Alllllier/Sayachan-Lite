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
