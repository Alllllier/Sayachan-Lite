import { activeProjects, archivedProjects, projectAiSuggestions, projectTasks } from './fixtures.js'
import type { Page } from '@playwright/test'

type ReviewProject = {
  _id: string
  name: string
  summary: string
  status: string
  currentFocusTaskId: string | null
  isPinned: boolean
  archived: boolean
  updatedAt: string
}
type ReviewTask = {
  _id: string
  title: string
  status: string
  archived: boolean
  projectId?: string
  creationMode?: string
  originModule?: string
  originId?: string | null
  completed?: boolean
  updatedAt?: string
}

function json(data: unknown, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data)
  }
}

function sortProjects(projects: ReviewProject[]): ReviewProject[] {
  return projects.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

function createProjectsStore(): Map<string, ReviewProject> {
  return new Map([
    ...activeProjects.map(project => [project._id, { ...project }] as const),
    ...archivedProjects.map(project => [project._id, { ...project }] as const)
  ])
}

function createProjectTasksStore(): Map<string, ReviewTask[]> {
  return new Map(
    Object.entries(projectTasks).map(([projectId, tasks]) => [
      projectId,
      tasks.map(task => ({ ...task }))
    ])
  )
}

function nextTaskId(tasksByProject: Map<string, ReviewTask[]>): string {
  const count = [...tasksByProject.values()].flat().length + 1
  return `task-created-${count}`
}

export async function installProjectsReviewApiMocks(page: Page): Promise<void> {
  const projectsById = createProjectsStore()
  const tasksByProject = createProjectTasksStore()

  await page.route('http://localhost:3001/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const pathname = url.pathname

    if (method === 'GET' && pathname === '/auth/me') {
      await route.fulfill(json({ _id: 'review-tester', email: 'review-tester@example.com', role: 'tester' }))
      return
    }

    if (method === 'GET' && pathname === '/notes') {
      await route.fulfill(json([]))
      return
    }

    if (method === 'POST' && pathname === '/ai/projects/next-action') {
      await route.fulfill(json({ suggestions: projectAiSuggestions }))
      return
    }

    if (method === 'GET' && pathname === '/projects') {
      const archived = url.searchParams.get('archived') === 'true'
      const projects = sortProjects(
        [...projectsById.values()].filter(project => Boolean(project.archived) === archived)
      )
      await route.fulfill(json(projects))
      return
    }

    if (method === 'POST' && pathname === '/projects') {
      const project = request.postDataJSON() as Pick<ReviewProject, 'name' | 'summary' | 'status'>
      const saved = {
        _id: 'project-created',
        name: project.name,
        summary: project.summary,
        status: project.status,
        currentFocusTaskId: null,
        isPinned: false,
        archived: false,
        updatedAt: '2026-05-03T10:05:00.000Z'
      }
      projectsById.set(saved._id, saved)
      tasksByProject.set(saved._id, [])
      await route.fulfill(json(saved, 201))
      return
    }

    if (method === 'GET' && pathname === '/tasks') {
      const projectId = url.searchParams.get('projectId')
      const archived = url.searchParams.get('archived') === 'true'
      const projectTasks = projectId
        ? tasksByProject.get(projectId) || []
        : [...tasksByProject.values()].flat()
      const tasks = projectTasks.filter(task => Boolean(task.archived) === archived)
      await route.fulfill(json(tasks))
      return
    }

    if (method === 'POST' && pathname === '/tasks') {
      const task = request.postDataJSON() as Record<string, string>
      const projectId = task.originModule === 'project' ? task.originId : task.projectId
      const saved = {
        _id: nextTaskId(tasksByProject),
        title: task.title,
        status: 'active',
        archived: false,
        projectId,
        creationMode: task.creationMode,
        originModule: task.originModule,
        originId: task.originId,
        updatedAt: '2026-05-03T10:06:00.000Z'
      }
      const targetProjectId = projectId || ''
      const projectTasks = tasksByProject.get(targetProjectId) || []
      tasksByProject.set(targetProjectId, [saved, ...projectTasks])
      await route.fulfill(json(saved, 201))
      return
    }

    const projectMatch = pathname.match(/^\/projects\/([^/]+)(?:\/(archive|restore|pin|unpin))?$/)
    if (projectMatch) {
      const [, projectId, action] = projectMatch
      const project = projectsById.get(projectId)
      if (!project) {
        await route.fulfill(json({ error: 'not found' }, 404))
        return
      }

      if (method === 'PUT' && !action) {
        const updates = request.postDataJSON() as Partial<ReviewProject>
        const updated = {
          ...project,
          name: updates.name || project.name,
          summary: updates.summary || project.summary,
          status: updates.status || project.status,
          currentFocusTaskId: updates.currentFocusTaskId ?? project.currentFocusTaskId,
          updatedAt: '2026-05-03T10:07:00.000Z'
        }
        projectsById.set(projectId, updated)
        await route.fulfill(json(updated))
        return
      }

      if (method === 'DELETE' && !action) {
        projectsById.delete(projectId)
        tasksByProject.delete(projectId)
        await route.fulfill(json({ ok: true }))
        return
      }

      if (method === 'PUT' && action) {
        const updated = {
          ...project,
          archived: action === 'archive' ? true : action === 'restore' ? false : project.archived,
          isPinned: action === 'pin' ? true : action === 'unpin' ? false : project.isPinned,
          updatedAt: '2026-05-03T10:08:00.000Z'
        }
        projectsById.set(projectId, updated)
        await route.fulfill(json(updated))
        return
      }
    }

    await route.fulfill(json({ error: `unmocked ${method} ${pathname}` }, 500))
  })
}
