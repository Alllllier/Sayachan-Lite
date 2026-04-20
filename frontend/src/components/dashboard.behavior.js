export function prependDashboardTask(tasks, newTask) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return newTask ? [newTask, ...safeTasks] : safeTasks
}

export function removeDashboardTask(tasks, taskId) {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  return safeTasks.filter(task => task?._id !== taskId)
}

export function applyDashboardTaskUpdate(tasks, updatedTask) {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  return safeTasks.map(task => (
    task?._id === updatedTask?._id
      ? { ...task, ...updatedTask }
      : task
  ))
}
