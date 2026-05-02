import { computed, ref } from 'vue'
import {
  deleteTask,
  fetchTasks,
  removeTaskFromActiveSnapshot,
  saveTask,
  syncTaskIntoActiveSnapshot,
  tasksRef,
  updateTask
} from '../../services/taskService'
import {
  applyDashboardTaskUpdate,
  buildDashboardTaskArchivePayload,
  buildDashboardTaskCompletionPayload,
  getDashboardTaskListMode,
  getDashboardTaskToggleLabel,
  getVisibleDashboardTasks,
  removeDashboardTask
} from './dashboard.rules.js'

const noop = () => {}

export function useDashboardFeature(options = {}) {
  const notify = options.notify || noop
  const onRefreshed = options.onRefreshed || noop

  const savedTasks = tasksRef
  const taskMenuOpen = ref(null)
  const isSavedTaskListExpanded = ref(false)
  const quickAddInput = ref('')
  const isQuickAdding = ref(false)
  const showArchived = ref(false)

  const savedTaskToggleLabel = computed(() => getDashboardTaskToggleLabel(
    savedTasks.value,
    isSavedTaskListExpanded.value
  ))
  const visibleSavedTasks = computed(() => getVisibleDashboardTasks(
    savedTasks.value,
    isSavedTaskListExpanded.value
  ))
  const savedTaskListMode = computed(() => getDashboardTaskListMode(
    isSavedTaskListExpanded.value
  ))

  async function loadSavedTasks() {
    return fetchTasks(showArchived.value)
  }

  function toggleTaskMenu(taskId) {
    taskMenuOpen.value = taskMenuOpen.value === taskId ? null : taskId
  }

  function closeTaskMenu() {
    taskMenuOpen.value = null
  }

  function toggleSavedTaskListExpanded() {
    isSavedTaskListExpanded.value = !isSavedTaskListExpanded.value
    closeTaskMenu()
  }

  async function setArchiveView(view) {
    showArchived.value = view === 'archived'
    isSavedTaskListExpanded.value = false
    closeTaskMenu()
    await loadSavedTasks()
  }

  async function handleQuickAddTask() {
    const title = quickAddInput.value.trim()
    if (!title) return

    isQuickAdding.value = true
    try {
      const newTask = await saveTask(title, 'manual', 'dashboard', null)
      if (newTask) {
        notify('Task added')
        quickAddInput.value = ''
      }
    } catch (e) {
      notify('Failed to add', 'error')
    } finally {
      isQuickAdding.value = false
    }
  }

  async function handleTaskComplete(task) {
    try {
      const payload = buildDashboardTaskCompletionPayload(task)
      const updated = await updateTask(task._id, payload)
      savedTasks.value = applyDashboardTaskUpdate(savedTasks.value, updated)
      syncTaskIntoActiveSnapshot(updated)
      notify(payload.status === 'completed' ? 'Task completed' : 'Task reactivated')
      onRefreshed()
    } catch (e) {
      notify('Failed to update task', 'error')
    }
  }

  async function handleTaskArchive(task) {
    try {
      const payload = buildDashboardTaskArchivePayload(task)
      const updated = await updateTask(task._id, payload)
      savedTasks.value = removeDashboardTask(savedTasks.value, updated._id)
      syncTaskIntoActiveSnapshot(updated)
      if (taskMenuOpen.value === task._id) {
        taskMenuOpen.value = null
      }
      notify(updated.archived ? 'Task archived' : 'Task restored')
    } catch (e) {
      notify('Failed to archive task', 'error')
    }
  }

  async function handleTaskDelete(task) {
    if (!confirm('Delete this task? This cannot be undone.')) {
      return
    }

    try {
      await deleteTask(task._id)
      savedTasks.value = removeDashboardTask(savedTasks.value, task._id)
      removeTaskFromActiveSnapshot(task._id)
      if (taskMenuOpen.value === task._id) {
        taskMenuOpen.value = null
      }
      notify('Task deleted')
    } catch (e) {
      notify('Failed to delete task', 'error')
    }
  }

  return {
    savedTasks,
    taskMenuOpen,
    isSavedTaskListExpanded,
    quickAddInput,
    isQuickAdding,
    showArchived,
    savedTaskToggleLabel,
    visibleSavedTasks,
    savedTaskListMode,
    loadSavedTasks,
    setArchiveView,
    handleQuickAddTask,
    handleTaskComplete,
    handleTaskArchive,
    handleTaskDelete,
    toggleTaskMenu,
    closeTaskMenu,
    toggleSavedTaskListExpanded
  }
}
