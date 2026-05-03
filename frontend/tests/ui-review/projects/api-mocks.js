import { activeProjects, archivedProjects, projectAiSuggestions, projectTasks } from './fixtures.js'

function json(data, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data)
  }
}

function sortProjects(projects) {
  return projects.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })
}

function createProjectsStore() {
  return new Map([
    ...activeProjects.map(project => [project._id, { ...project }]),
    ...archivedProjects.map(project => [project._id, { ...project }])
  ])
}

function createProjectTasksStore() {
  return new Map(
    Object.entries(projectTasks).map(([projectId, tasks]) => [
      projectId,
      tasks.map(task => ({ ...task }))
    ])
  )
}

function nextTaskId(tasksByProject) {
  const count = [...tasksByProject.values()].flat().length + 1
  return `task-created-${count}`
}

export async function installProjectsReviewApiMocks(page) {
  const projectsById = createProjectsStore()
  const tasksByProject = createProjectTasksStore()

  await page.route('http://localhost:3001/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const pathname = url.pathname

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
      const project = request.postDataJSON()
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
      const task = request.postDataJSON()
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
      const projectTasks = tasksByProject.get(projectId) || []
      tasksByProject.set(projectId, [saved, ...projectTasks])
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
        const updates = request.postDataJSON()
        const updated = {
          ...project,
          name: updates.name,
          summary: updates.summary,
          status: updates.status,
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
