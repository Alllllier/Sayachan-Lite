import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboardFeature } from './useDashboardFeature.js'
import {
  deleteTask,
  fetchTasks,
  removeTaskFromActiveSnapshot,
  saveTask,
  syncTaskIntoActiveSnapshot,
  tasksRef,
  updateTask
} from '../../services/tasks/index.js'

vi.mock('../../services/tasks/index.js', () => ({
  deleteTask: vi.fn(),
  fetchTasks: vi.fn(),
  removeTaskFromActiveSnapshot: vi.fn(),
  saveTask: vi.fn(),
  syncTaskIntoActiveSnapshot: vi.fn(),
  tasksRef: { value: [] },
  updateTask: vi.fn()
}))

describe('useDashboardFeature orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn(() => true))
    tasksRef.value = []
  })

  it('quick-adds dashboard tasks through the shared task runtime and resets input', async () => {
    const notify = vi.fn()
    const feature = useDashboardFeature({ notify })
    feature.quickAddInput.value = '  Write handoff  '
    saveTask.mockResolvedValue({
      _id: 'task-1',
      title: 'Write handoff',
      originModule: 'dashboard'
    })

    await feature.handleQuickAddTask()

    expect(saveTask).toHaveBeenCalledWith('Write handoff', 'manual', 'dashboard', null)
    expect(feature.quickAddInput.value).toBe('')
    expect(notify).toHaveBeenCalledWith('Task added')
  })

  it('completes tasks through the shared task API and refreshes parent data', async () => {
    const notify = vi.fn()
    const onRefreshed = vi.fn()
    const feature = useDashboardFeature({ notify, onRefreshed })
    tasksRef.value = [{ _id: 'task-1', title: 'Draft', status: 'active', completed: false }]
    updateTask.mockResolvedValue({ _id: 'task-1', title: 'Draft', status: 'completed', completed: true })

    await feature.handleTaskComplete(tasksRef.value[0])

    expect(updateTask).toHaveBeenCalledWith('task-1', { completed: true, status: 'completed' })
    expect(tasksRef.value[0]).toMatchObject({ _id: 'task-1', status: 'completed', completed: true })
    expect(syncTaskIntoActiveSnapshot).toHaveBeenCalledWith(tasksRef.value[0])
    expect(onRefreshed).toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith('Task completed')
  })

  it('archives tasks through the shared task API and removes them from the current tab', async () => {
    const notify = vi.fn()
    const feature = useDashboardFeature({ notify })
    tasksRef.value = [{ _id: 'task-1', title: 'Draft', archived: false }]
    feature.taskMenuOpen.value = 'task-1'
    updateTask.mockResolvedValue({ _id: 'task-1', title: 'Draft', archived: true })

    await feature.handleTaskArchive(tasksRef.value[0])

    expect(updateTask).toHaveBeenCalledWith('task-1', { archived: true })
    expect(tasksRef.value).toEqual([])
    expect(syncTaskIntoActiveSnapshot).toHaveBeenCalledWith({ _id: 'task-1', title: 'Draft', archived: true })
    expect(feature.taskMenuOpen.value).toBe(null)
    expect(notify).toHaveBeenCalledWith('Task archived')
  })

  it('deletes tasks through the shared task API and clears active snapshots', async () => {
    const notify = vi.fn()
    const feature = useDashboardFeature({ notify })
    tasksRef.value = [{ _id: 'task-1', title: 'Draft' }]
    feature.taskMenuOpen.value = 'task-1'
    deleteTask.mockResolvedValue()

    await feature.handleTaskDelete(tasksRef.value[0])

    expect(deleteTask).toHaveBeenCalledWith('task-1')
    expect(tasksRef.value).toEqual([])
    expect(removeTaskFromActiveSnapshot).toHaveBeenCalledWith('task-1')
    expect(feature.taskMenuOpen.value).toBe(null)
    expect(notify).toHaveBeenCalledWith('Task deleted')
  })

  it('switches archive view by resetting preview state and refetching tasks', async () => {
    const feature = useDashboardFeature()
    feature.isSavedTaskListExpanded.value = true
    feature.taskMenuOpen.value = 'task-1'
    fetchTasks.mockResolvedValue([])

    await feature.setArchiveView('archived')

    expect(feature.showArchived.value).toBe(true)
    expect(feature.isSavedTaskListExpanded.value).toBe(false)
    expect(feature.taskMenuOpen.value).toBe(null)
    expect(fetchTasks).toHaveBeenCalledWith(true)
  })
})
