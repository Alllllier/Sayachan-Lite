import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveProject,
  createProject,
  deleteProject,
  fetchProjectNextActions,
  fetchProjects,
  pinProject,
  restoreProject,
  unpinProject,
  updateProject,
  updateProjectFocus
} from './projects.api.js'

function jsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body)
  }
}

describe('projects api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches active and archived project lists from the expected endpoints', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([{ _id: 'project-1' }]))
    await expect(fetchProjects()).resolves.toEqual([{ _id: 'project-1' }])
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects')

    fetch.mockResolvedValueOnce(jsonResponse([{ _id: 'project-archived' }]))
    await expect(fetchProjects({ archived: true })).resolves.toEqual([{ _id: 'project-archived' }])
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects?archived=true')
  })

  it('sends create and update payloads through project endpoints', async () => {
    const project = { name: 'PMO', summary: 'Plan', status: 'pending' }

    fetch.mockResolvedValueOnce(jsonResponse({ _id: 'project-1', ...project }))
    await createProject(project)
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })

    fetch.mockResolvedValueOnce(jsonResponse({ _id: 'project-1', ...project, status: 'in_progress' }))
    await updateProject('project-1', { ...project, status: 'in_progress' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...project, status: 'in_progress' })
    })
  })

  it('routes project lifecycle mutations through project-specific endpoints', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })

    await archiveProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1/archive', { method: 'PUT' })

    await restoreProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1/restore', { method: 'PUT' })

    await pinProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1/pin', { method: 'PUT' })

    await unpinProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1/unpin', { method: 'PUT' })

    await deleteProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1', { method: 'DELETE' })
  })

  it('keeps project AI and focus updates behind the project API boundary', async () => {
    const project = { _id: 'project-1', name: 'PMO', summary: 'Plan', status: 'pending' }

    fetch.mockResolvedValueOnce(jsonResponse({ suggestions: ['Write handoff'] }))
    await expect(fetchProjectNextActions(project)).resolves.toEqual({ suggestions: ['Write handoff'] })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/ai/projects/next-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })

    fetch.mockResolvedValueOnce(jsonResponse({ ...project, currentFocusTaskId: 'task-1' }))
    await updateProjectFocus(project, 'task-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'PMO',
        summary: 'Plan',
        status: 'pending',
        currentFocusTaskId: 'task-1'
      })
    })
  })
})
