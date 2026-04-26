import { describe, expect, it } from 'vitest'
import {
  applyDashboardTaskUpdate,
  buildDashboardTaskArchivePayload,
  buildDashboardTaskCompletionPayload,
  deriveDashboardTaskProvenance,
  deriveDashboardTaskRowState,
  getDashboardTaskActions,
  getDashboardTaskToggleLabel,
  getVisibleDashboardTasks,
  hasDashboardTaskOverflow,
  prependDashboardTask,
  removeDashboardTask
} from './dashboard.behavior.js'

describe('dashboard saved-task behavior locks', () => {
  const tasks = Array.from({ length: 7 }, (_, index) => ({
    _id: `task-${index + 1}`,
    title: `Task ${index + 1}`
  }))

  it('prepends quick-added dashboard tasks to the visible list', () => {
    const tasks = [{ _id: 'task-1', title: 'Existing task' }]
    const nextTasks = prependDashboardTask(tasks, { _id: 'task-2', title: 'Quick add task', originModule: 'dashboard' })

    expect(nextTasks.map(task => task._id)).toEqual(['task-2', 'task-1'])
  })

  it('shows at most five saved tasks in the collapsed preview', () => {
    expect(getVisibleDashboardTasks(tasks, false).map(task => task._id)).toEqual([
      'task-1',
      'task-2',
      'task-3',
      'task-4',
      'task-5'
    ])
  })

  it('shows the full current saved-task list when expanded', () => {
    expect(getVisibleDashboardTasks(tasks, true)).toEqual(tasks)
  })

  it('derives overflow and toggle labels for overflow, expanded, and non-overflow states', () => {
    expect(hasDashboardTaskOverflow(tasks)).toBe(true)
    expect(getDashboardTaskToggleLabel(tasks, false)).toBe('Show all (7)')
    expect(getDashboardTaskToggleLabel(tasks, true)).toBe('Show less')
    expect(getDashboardTaskToggleLabel(tasks.slice(0, 3), false)).toBe('Expand details')
  })

  it('makes active rows primary-click interactive while archived rows are not', () => {
    expect(deriveDashboardTaskRowState({ _id: 'task-1', status: 'active' }, false)).toEqual({
      interactive: true,
      role: 'button',
      tabindex: 0,
      ariaPressed: false
    })
    expect(deriveDashboardTaskRowState({ _id: 'task-1', status: 'completed' }, true)).toEqual({
      interactive: false,
      role: undefined,
      tabindex: undefined,
      ariaPressed: undefined
    })
  })

  it('exposes Archive/Delete for active rows and Restore/Delete for archived rows', () => {
    expect(getDashboardTaskActions(false)).toEqual(['Archive', 'Delete'])
    expect(getDashboardTaskActions(true)).toEqual(['Restore', 'Delete'])
  })

  it('derives completion and reactivation payloads from current status', () => {
    expect(buildDashboardTaskCompletionPayload({ _id: 'task-1', status: 'active' })).toEqual({
      completed: true,
      status: 'completed'
    })
    expect(buildDashboardTaskCompletionPayload({ _id: 'task-1', status: 'completed' })).toEqual({
      completed: false,
      status: 'active'
    })
  })

  it('updates row state when a task is completed or reactivated', () => {
    const tasks = [{ _id: 'task-1', title: 'Existing task', status: 'active', completed: false }]

    expect(applyDashboardTaskUpdate(tasks, { _id: 'task-1', status: 'completed', completed: true })).toEqual([
      { _id: 'task-1', title: 'Existing task', status: 'completed', completed: true }
    ])
  })

  it('derives archive and restore payloads from current row state', () => {
    expect(buildDashboardTaskArchivePayload({ _id: 'task-1', archived: false })).toEqual({ archived: true })
    expect(buildDashboardTaskArchivePayload({ _id: 'task-1', archived: true })).toEqual({ archived: false })
  })

  it('removes archived or restored tasks from the current visible tab', () => {
    const tasks = [
      { _id: 'task-1', title: 'Keep me' },
      { _id: 'task-2', title: 'Move out of current tab' }
    ]

    expect(removeDashboardTask(tasks, 'task-2')).toEqual([
      { _id: 'task-1', title: 'Keep me' }
    ])
  })

  it('derives provenance only from originModule and creationMode', () => {
    expect(deriveDashboardTaskProvenance({
      _id: 'task-1',
      originModule: 'note',
      creationMode: 'manual',
      source: 'project'
    })).toEqual({
      letter: 'N',
      className: 'provenance-manual',
      tooltip: 'Note task'
    })
    expect(deriveDashboardTaskProvenance({
      _id: 'task-2',
      originModule: 'project',
      creationMode: 'ai',
      source: 'note'
    })).toEqual({
      letter: 'P',
      className: 'provenance-ai',
      tooltip: 'AI generated'
    })
    expect(deriveDashboardTaskProvenance({
      _id: 'task-3',
      originModule: 'dashboard',
      creationMode: 'manual',
      source: 'note'
    })).toEqual({
      letter: 'D',
      className: 'provenance-manual',
      tooltip: 'Dashboard quick add'
    })
  })
})
