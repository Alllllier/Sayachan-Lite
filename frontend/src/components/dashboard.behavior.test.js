import { describe, expect, it } from 'vitest'
import {
  applyDashboardTaskUpdate,
  prependDashboardTask,
  removeDashboardTask
} from './dashboard.behavior.js'

describe('dashboard saved-task behavior locks', () => {
  it('prepends quick-added dashboard tasks to the visible list', () => {
    const tasks = [{ _id: 'task-1', title: 'Existing task' }]
    const nextTasks = prependDashboardTask(tasks, { _id: 'task-2', title: 'Quick add task', originModule: 'dashboard' })

    expect(nextTasks.map(task => task._id)).toEqual(['task-2', 'task-1'])
  })

  it('updates row state when a task is completed or reactivated', () => {
    const tasks = [{ _id: 'task-1', title: 'Existing task', status: 'active', completed: false }]

    expect(applyDashboardTaskUpdate(tasks, { _id: 'task-1', status: 'completed', completed: true })).toEqual([
      { _id: 'task-1', title: 'Existing task', status: 'completed', completed: true }
    ])
  })

  it('removes archived or restored tasks from the current visible list', () => {
    const tasks = [
      { _id: 'task-1', title: 'Keep me' },
      { _id: 'task-2', title: 'Move out of current tab' }
    ]

    expect(removeDashboardTask(tasks, 'task-2')).toEqual([
      { _id: 'task-1', title: 'Keep me' }
    ])
  })
})
