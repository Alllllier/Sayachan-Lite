import { activeDashboardTasks, archivedDashboardTasks } from './fixtures.js'

function json(data, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data)
  }
}

function cloneTask(task) {
  return { ...task }
}

function createTaskStore({ activeTasks = activeDashboardTasks, archivedTasks = archivedDashboardTasks } = {}) {
  return new Map([
    ...activeTasks.map(task => [task._id, cloneTask(task)]),
    ...archivedTasks.map(task => [task._id, cloneTask(task)])
  ])
}

function sortedTasks(tasks) {
  return tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export async function installDashboardReviewApiMocks(page, options = {}) {
  const tasksById = createTaskStore(options)
  let createdTaskCount = 0

  await page.route('http://localhost:3001/tasks**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const pathname = url.pathname

    if (method === 'GET' && pathname === '/tasks') {
      const archived = url.searchParams.get('archived') === 'true'
      const tasks = sortedTasks(
        [...tasksById.values()].filter(task => Boolean(task.archived) === archived)
      )
      await route.fulfill(json(tasks))
      return
    }

    if (method === 'POST' && pathname === '/tasks') {
      const task = request.postDataJSON()
      createdTaskCount += 1
      const saved = {
        _id: `dashboard-created-task-${createdTaskCount}`,
        title: task.title,
        creationMode: task.creationMode,
        originModule: task.originModule,
        originId: task.originId,
        archived: false,
        status: 'active',
        completed: false,
        updatedAt: '2026-05-04T09:05:00.000Z'
      }
      tasksById.set(saved._id, saved)
      await route.fulfill(json(saved, 201))
      return
    }

    const taskMatch = pathname.match(/^\/tasks\/([^/]+)$/)
    if (!taskMatch) {
      await route.fulfill(json({ error: `unmocked ${method} ${pathname}` }, 500))
      return
    }

    const taskId = taskMatch[1]
    const task = tasksById.get(taskId)
    if (!task) {
      await route.fulfill(json({ error: 'not found' }, 404))
      return
    }

    if (method === 'PUT') {
      const updates = request.postDataJSON()
      const updated = {
        ...task,
        ...updates,
        updatedAt: '2026-05-04T09:06:00.000Z'
      }
      tasksById.set(taskId, updated)
      await route.fulfill(json(updated))
      return
    }

    if (method === 'DELETE') {
      tasksById.delete(taskId)
      await route.fulfill(json({ ok: true }))
      return
    }

    await route.fulfill(json({ error: `unmocked ${method} ${pathname}` }, 500))
  })
}
