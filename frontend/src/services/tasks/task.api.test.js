import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createTask,
  deleteTask,
  fetchProjectCardTasks,
  fetchProjectTasks,
  fetchTaskList,
  updateTask
} from './task.api.js'

describe('task API', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('creates tasks through the canonical task endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ _id: 'task-2', title: 'Saved task' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await createTask('Saved task', 'manual', 'project', 'project-1')

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Saved task',
        creationMode: 'manual',
        originModule: 'project',
        originId: 'project-1'
      })
    })
    expect(result).toMatchObject({
      _id: 'task-2',
      title: 'Saved task',
      status: 'active',
      archived: false,
      completed: false
    })
  })

  it('fetches archived tasks from the archived endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ([{ _id: 'archived-task', status: 'active', archived: true }])
    })
    vi.stubGlobal('fetch', fetchMock)

    const tasks = await fetchTaskList({ archived: true })

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/tasks?archived=true')
    expect(tasks).toEqual([{ _id: 'archived-task', status: 'active', archived: true }])
  })

  it('updates tasks through the canonical task endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ _id: 'task-1', title: 'Updated task', status: 'completed' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const task = await updateTask('task-1', { completed: true, status: 'completed' })

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/tasks/task-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true, status: 'completed' })
    })
    expect(task).toMatchObject({
      _id: 'task-1',
      title: 'Updated task',
      status: 'completed',
      archived: false,
      completed: true
    })
  })

  it('deletes tasks through the canonical task endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await deleteTask('task-1')

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/tasks/task-1', {
      method: 'DELETE'
    })
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

  it('fetches both active and archived project tasks for active project cards', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ([{ _id: 'project-task', archived: false, status: 'active' }])
      })
      .mockResolvedValueOnce({
        json: async () => ([{ _id: 'archived-project-task', archived: true, status: 'active' }])
      })
    vi.stubGlobal('fetch', fetchMock)

    const tasks = await fetchProjectCardTasks('project-42', false)

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:3001/tasks?projectId=project-42')
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:3001/tasks?projectId=project-42&archived=true')
    expect(tasks).toEqual([
      { _id: 'project-task', archived: false, status: 'active' },
      { _id: 'archived-project-task', archived: true, status: 'active' }
    ])
  })

  it('fetches only archived tasks for archived project cards', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ([{ _id: 'archived-project-task', archived: true, status: 'active' }])
    })
    vi.stubGlobal('fetch', fetchMock)

    const tasks = await fetchProjectCardTasks('project-42', true)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/tasks?projectId=project-42&archived=true')
    expect(tasks).toEqual([{ _id: 'archived-project-task', archived: true, status: 'active' }])
  })
})
