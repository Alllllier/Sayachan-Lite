import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createTask, fetchTaskList } from './task.api.js'
import {
  activeTasksSnapshotRef,
  fetchTasks,
  removeTaskFromActiveSnapshot,
  saveTask,
  syncTaskIntoActiveSnapshot,
  tasksRef
} from './task.runtime.js'

vi.mock('./task.api.js', () => ({
  createTask: vi.fn(),
  fetchTaskList: vi.fn()
}))

describe('task runtime', () => {
  beforeEach(() => {
    tasksRef.value = []
    activeTasksSnapshotRef.value = []
    vi.clearAllMocks()
  })

  it('keeps active task snapshots stable while browsing archived tasks', async () => {
    activeTasksSnapshotRef.value = [{ _id: 'active-task' }]
    fetchTaskList.mockResolvedValue([{ _id: 'archived-task', status: 'active', archived: true }])

    const tasks = await fetchTasks(true)

    expect(fetchTaskList).toHaveBeenCalledWith({ archived: true })
    expect(tasks).toEqual([{ _id: 'archived-task', status: 'active', archived: true }])
    expect(tasksRef.value).toEqual(tasks)
    expect(activeTasksSnapshotRef.value).toEqual([{ _id: 'active-task' }])
  })

  it('refreshes the active snapshot when browsing active tasks', async () => {
    fetchTaskList.mockResolvedValue([{ _id: 'active-task', status: 'active', archived: false }])

    const tasks = await fetchTasks(false)

    expect(fetchTaskList).toHaveBeenCalledWith({ archived: false })
    expect(tasksRef.value).toEqual(tasks)
    expect(activeTasksSnapshotRef.value).toEqual(tasks)
  })

  it('prepends saved active tasks into shared task state', async () => {
    createTask.mockResolvedValue({
      _id: 'task-2',
      title: 'Saved task',
      status: 'active',
      archived: false,
      completed: false
    })

    const result = await saveTask('Saved task', 'manual', 'project', 'project-1')

    expect(createTask).toHaveBeenCalledWith('Saved task', 'manual', 'project', 'project-1')
    expect(tasksRef.value[0]).toEqual(result)
    expect(activeTasksSnapshotRef.value[0]).toEqual(result)
  })

  it('does not prepend archived saved tasks into the active snapshot', async () => {
    createTask.mockResolvedValue({
      _id: 'task-2',
      title: 'Archived task',
      status: 'active',
      archived: true,
      completed: false
    })

    const result = await saveTask('Archived task', 'manual', 'project', 'project-1')

    expect(tasksRef.value[0]).toEqual(result)
    expect(activeTasksSnapshotRef.value).toEqual([])
  })

  it('keeps a separate active-task snapshot for cockpit context', () => {
    activeTasksSnapshotRef.value = [
      { _id: 'task-1', title: 'Active snapshot task', archived: false, status: 'active' }
    ]

    syncTaskIntoActiveSnapshot({ _id: 'task-1', title: 'Completed task', archived: false, status: 'completed' })
    syncTaskIntoActiveSnapshot({ _id: 'task-2', title: 'New active task', archived: false, status: 'active' })
    syncTaskIntoActiveSnapshot({ _id: 'task-2', title: 'Archived task', archived: true, status: 'active' })
    removeTaskFromActiveSnapshot('task-1')

    expect(activeTasksSnapshotRef.value).toEqual([])
  })
})
