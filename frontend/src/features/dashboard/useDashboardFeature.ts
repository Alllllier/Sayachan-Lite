import { computed, ref, unref } from 'vue'
import type { MaybeRef } from 'vue'
import { readResourceCache, writeResourceCache } from '../../services/resourceCache.js'
import type { TaskApiTask } from '../../services/tasks/task.rules.js'
import {
  deleteTask,
  fetchTasks,
  removeTaskFromActiveSnapshot,
  saveTask,
  syncTaskIntoActiveSnapshot,
  tasksRef,
  updateTask
} from '../../services/tasks/index.js'
import {
  applyDashboardTaskUpdate,
  buildDashboardTaskArchivePayload,
  buildDashboardTaskCompletionPayload,
  getDashboardTaskListMode,
  getDashboardTaskToggleLabel,
  getVisibleDashboardTasks,
  removeDashboardTask
} from './dashboard.rules'

const noop = () => {}
const DASHBOARD_TASKS_CACHE_RESOURCE = 'dashboard-tasks'

type NotifyFn = (message: string, variant?: string) => void

type DashboardFeatureOptions = {
  notify?: NotifyFn
  onRefreshed?: () => void
  cacheUserKey?: MaybeRef<string | null | undefined> | null | undefined
}

type ArchiveView = 'active' | 'archived' | (string & {})

type DashboardTaskWithId = TaskApiTask & {
  _id: string
}

export function useDashboardFeature(options: DashboardFeatureOptions = {}) {
  const notify = options.notify || noop
  const onRefreshed = options.onRefreshed || noop
  const cacheUserKey = options.cacheUserKey || 'anonymous'

  const savedTasks = tasksRef
  const taskMenuOpen = ref<string | null>(null)
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

  function resolveCacheUserKey(): string {
    return unref(cacheUserKey) || 'anonymous'
  }

  function resolveCacheVariant(): 'active' | 'archived' {
    return showArchived.value ? 'archived' : 'active'
  }

  function hydrateTasksFromCache(): boolean {
    const cachedTasks = readResourceCache<TaskApiTask[]>(
      resolveCacheUserKey(),
      DASHBOARD_TASKS_CACHE_RESOURCE,
      resolveCacheVariant()
    )
    if (!Array.isArray(cachedTasks)) return false
    savedTasks.value = cachedTasks
    return true
  }

  function cacheCurrentTasks(): void {
    writeResourceCache(resolveCacheUserKey(), DASHBOARD_TASKS_CACHE_RESOURCE, resolveCacheVariant(), savedTasks.value)
  }

  async function loadSavedTasks(): Promise<TaskApiTask[]> {
    const hydratedFromCache = hydrateTasksFromCache()
    try {
      await fetchTasks(showArchived.value)
      cacheCurrentTasks()
    } catch (error) {
      if (hydratedFromCache) {
        notify('Showing cached tasks. Refresh failed.', 'error')
      } else {
        notify('Failed to load tasks', 'error')
      }
    }
    return savedTasks.value
  }

  function toggleTaskMenu(taskId: string): void {
    taskMenuOpen.value = taskMenuOpen.value === taskId ? null : taskId
  }

  function closeTaskMenu(): void {
    taskMenuOpen.value = null
  }

  function toggleSavedTaskListExpanded(): void {
    isSavedTaskListExpanded.value = !isSavedTaskListExpanded.value
    closeTaskMenu()
  }

  async function setArchiveView(view: ArchiveView): Promise<void> {
    showArchived.value = view === 'archived'
    isSavedTaskListExpanded.value = false
    closeTaskMenu()
    await loadSavedTasks()
  }

  async function handleQuickAddTask(): Promise<void> {
    const title = quickAddInput.value.trim()
    if (!title) return

    isQuickAdding.value = true
    try {
      const newTask = await saveTask(title, 'manual', 'dashboard', null)
      if (newTask) {
        cacheCurrentTasks()
        notify('Task added')
        quickAddInput.value = ''
      }
    } catch (e) {
      notify('Failed to add', 'error')
    } finally {
      isQuickAdding.value = false
    }
  }

  async function handleTaskComplete(task: DashboardTaskWithId): Promise<void> {
    try {
      const payload = buildDashboardTaskCompletionPayload(task)
      const updated = await updateTask(task._id, payload)
      savedTasks.value = applyDashboardTaskUpdate(savedTasks.value, updated)
      syncTaskIntoActiveSnapshot(updated)
      cacheCurrentTasks()
      notify(payload.status === 'completed' ? 'Task completed' : 'Task reactivated')
      onRefreshed()
    } catch (e) {
      notify('Failed to update task', 'error')
    }
  }

  async function handleTaskArchive(task: DashboardTaskWithId): Promise<void> {
    try {
      const payload = buildDashboardTaskArchivePayload(task)
      const updated = await updateTask(task._id, payload)
      savedTasks.value = removeDashboardTask(savedTasks.value, updated._id)
      syncTaskIntoActiveSnapshot(updated)
      cacheCurrentTasks()
      if (taskMenuOpen.value === task._id) {
        taskMenuOpen.value = null
      }
      notify(updated.archived ? 'Task archived' : 'Task restored')
    } catch (e) {
      notify('Failed to archive task', 'error')
    }
  }

  async function handleTaskDelete(task: DashboardTaskWithId): Promise<void> {
    if (!confirm('Delete this task? This cannot be undone.')) {
      return
    }

    try {
      await deleteTask(task._id)
      savedTasks.value = removeDashboardTask(savedTasks.value, task._id)
      removeTaskFromActiveSnapshot(task._id)
      cacheCurrentTasks()
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
