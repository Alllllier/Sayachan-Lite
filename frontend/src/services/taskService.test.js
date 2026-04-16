import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildTaskPayload, fetchTasks, fetchProjectTasks, normalizeSavedTask, saveTask, tasksRef } from './taskService.js'

describe('taskService smoke tests', () => {
  beforeEach(() => {
    tasksRef.value = []
    vi.restoreAllMocks()
  })

  it('builds canonical task payloads with semantic fields only', () => {
    const payload = buildTaskPayload('Write docs', 'ai', 'note', 'note-1', 'Sprint note', 'project-1', 'Project A')

    expect(payload).toEqual({
      title: 'Write docs',
      creationMode: 'ai',
      originModule: 'note',
      originId: 'note-1',
      originLabel: 'Sprint note',
      linkedProjectId: 'project-1',
      linkedProjectName: 'Project A'
    })
  })

  it('normalizes saved tasks to active and incomplete when backend omits fields', () => {
    const normalized = normalizeSavedTask({ _id: 'task-1', title: 'Draft task' })

    expect(normalized).toMatchObject({
      _id: 'task-1',
      title: 'Draft task',
      status: 'active',
      completed: false
    })
  })

  it('prepends normalized saved tasks into shared task state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: async () => ({ _id: 'task-2', title: 'Saved task' })
    }))

    const result = await saveTask('Saved task', 'manual', 'project', 'project-1', 'Project A', 'project-1', 'Project A')

    expect(result).toMatchObject({
      _id: 'task-2',
      title: 'Saved task',
      status: 'active',
      completed: false
    })
    expect(tasksRef.value[0]).toEqual(result)
  })

  it('fetches archived tasks from the archived endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ([{ _id: 'archived-task' }])
    })
    vi.stubGlobal('fetch', fetchMock)

    const tasks = await fetchTasks(true)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/tasks?archived=true')
    expect(tasks).toEqual([{ _id: 'archived-task' }])
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
})
