export function getProjectTaskBuckets(tasks) {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  return {
    active: safeTasks.filter(task => task.status === 'active' && !task.archived),
    completed: safeTasks.filter(task => task.status === 'completed' && !task.archived),
    archived: safeTasks.filter(task => task.archived)
  }
}

export function getProjectPreviewTasks(project, tasks, filter = 'active', expanded = false) {
  const buckets = getProjectTaskBuckets(tasks)
  const previewTasks = project?.archived
    ? buckets.archived
    : filter === 'completed'
      ? buckets.completed
      : buckets.active

  return expanded ? previewTasks : previewTasks.slice(0, 3)
}

export function canSetProjectFocus(task) {
  return task?.status === 'active' && task?.archived !== true
}

export function getProjectFocusTitle(project, tasks) {
  if (!project?.currentFocusTaskId) {
    return ''
  }

  const safeTasks = Array.isArray(tasks) ? tasks : []
  const focusTask = safeTasks.find(
    task => String(task?._id) === String(project.currentFocusTaskId)
  )

  return focusTask?.title || ''
}
