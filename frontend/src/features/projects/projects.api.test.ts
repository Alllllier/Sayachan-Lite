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
import type { ProjectDto, ProjectWriteDto } from '../../types/api-dtos'

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? status : status || 500,
    headers: { 'Content-Type': 'application/json' }
  })
}

function mockedFetch() {
  return vi.mocked(fetch)
}

const projectDto: ProjectDto = {
  _id: 'project-1',
  name: 'PMO',
  summary: 'Plan',
  status: 'pending',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

describe('projects api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches active and archived project lists from the expected endpoints', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse([projectDto]))
    await expect(fetchProjects()).resolves.toEqual([projectDto])
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects', { credentials: 'include' })

    const archivedProject = { ...projectDto, _id: 'project-archived', archived: true }
    mockedFetch().mockResolvedValueOnce(jsonResponse([archivedProject]))
    await expect(fetchProjects({ archived: true })).resolves.toEqual([archivedProject])
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects?archived=true', { credentials: 'include' })
  })

  it('sends create and update payloads through project endpoints', async () => {
    const project: ProjectWriteDto = { name: 'PMO', summary: 'Plan', status: 'pending' }

    mockedFetch().mockResolvedValueOnce(jsonResponse(projectDto))
    await createProject(project)
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })

    mockedFetch().mockResolvedValueOnce(jsonResponse({ ...projectDto, status: 'in_progress' }))
    await updateProject('project-1', { ...project, status: 'in_progress' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...project, status: 'in_progress' })
    })
  })

  it('routes project lifecycle mutations through project-specific endpoints', async () => {
    mockedFetch()
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)

    await archiveProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1/archive', { method: 'PUT', credentials: 'include' })

    await restoreProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1/restore', { method: 'PUT', credentials: 'include' })

    await pinProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1/pin', { method: 'PUT', credentials: 'include' })

    await unpinProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1/unpin', { method: 'PUT', credentials: 'include' })

    await deleteProject('project-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1', { method: 'DELETE', credentials: 'include' })
  })

  it('keeps project AI and focus updates behind the project API boundary', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse({ suggestions: ['Write handoff'] }))
    await expect(fetchProjectNextActions(projectDto._id)).resolves.toEqual({ suggestions: ['Write handoff'] })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/ai/projects/next-action', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: 'project-1' })
    })

    mockedFetch().mockResolvedValueOnce(jsonResponse({ ...projectDto, currentFocusTaskId: 'task-1' }))
    await updateProjectFocus(projectDto, 'task-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/projects/project-1', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'PMO',
        summary: 'Plan',
        status: 'pending',
        currentFocusTaskId: 'task-1'
      })
    })
  })

  it('rejects malformed project and AI suggestion responses before feature state consumes them', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse([{ _id: 'project-1', name: 'Missing summary' }]))
    await expect(fetchProjects()).rejects.toThrow('Invalid projects list response')

    mockedFetch().mockResolvedValueOnce(jsonResponse({ suggestions: ['Write handoff', 42] }))
    await expect(fetchProjectNextActions('project-1')).rejects.toThrow('Invalid project next actions response')
  })
})
