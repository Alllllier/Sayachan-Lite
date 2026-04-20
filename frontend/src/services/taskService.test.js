import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  activeTasksSnapshotRef,
  buildTaskPayload,
  fetchProjectTasks,
  fetchTasks,
  normalizeSavedTask,
  removeTaskFromActiveSnapshot,
  saveTask,
  syncTaskIntoActiveSnapshot,
  tasksRef
} from './taskService.js'

describe('taskService smoke tests', () => {
  beforeEach(() => {
    tasksRef.value = []
    activeTasksSnapshotRef.value = []
    vi.restoreAllMocks()
  })

  it('builds canonical task payloads with semantic fields only', () => {
    const payload = buildTaskPayload('Write docs', 'ai', 'note', 'note-1')

    expect(payload).toEqual({
      title: 'Write docs',
      creationMode: 'ai',
      originModule: 'note',
      originId: 'note-1'
    })
  })

  it('normalizes saved tasks to active and incomplete when backend omits fields', () => {
    const normalized = normalizeSavedTask({ _id: 'task-1', title: 'Draft task' })

    expect(normalized).toMatchObject({
      _id: 'task-1',
      title: 'Draft task',
      status: 'active',
      archived: false,
      completed: false
    })
  })

  it('prepends normalized saved tasks into shared task state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: async () => ({ _id: 'task-2', title: 'Saved task' })
    }))

    const result = await saveTask('Saved task', 'manual', 'project', 'project-1')

    expect(result).toMatchObject({
      _id: 'task-2',
      title: 'Saved task',
      status: 'active',
      archived: false,
      completed: false
    })
    expect(tasksRef.value[0]).toEqual(result)
    expect(activeTasksSnapshotRef.value[0]).toEqual(result)
  })

  it('fetches archived tasks from the archived endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ([{ _id: 'archived-task', status: 'active', archived: true }])
    })
    vi.stubGlobal('fetch', fetchMock)

    const tasks = await fetchTasks(true)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/tasks?archived=true')
    expect(tasks).toEqual([{ _id: 'archived-task', status: 'active', archived: true }])
  })

  it('fetches project tasks using canonical projectId query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ([{ _id: 'project-task' }])
    })
    vi.stubGlobal('fetch', fetchMock)

    const tasks = await fetchProjectTasks('project-42')

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/tasks?projectId=project-42')
    expect(tasks).toEqual([{ _id: 'project-task' }])
  })

  it('fetches archived project tasks with archived flag', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ([{ _id: 'archived-project-task', status: 'active', archived: true }])
    })
    vi.stubGlobal('fetch', fetchMock)

    const tasks = await fetchProjectTasks('project-42', true)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/tasks?projectId=project-42&archived=true')
    expect(tasks).toEqual([{ _id: 'archived-project-task', status: 'active', archived: true }])
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
