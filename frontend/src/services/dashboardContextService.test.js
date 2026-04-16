import { describe, expect, it } from 'vitest'
import { deriveDashboardSnapshot } from './dashboardContextService.js'

describe('dashboardContextService smoke tests', () => {
  it('counts only non-archived projects and non-archived non-completed tasks', () => {
    const snapshot = deriveDashboardSnapshot(
      [
        { _id: 'project-1', status: 'active', name: 'Alpha' },
        { _id: 'project-2', status: 'archived', name: 'Beta' }
      ],
      [
        { _id: 'task-1', status: 'active', title: 'Do work' },
        { _id: 'task-2', status: 'completed', title: 'Done work' },
        { _id: 'task-3', status: 'archived', title: 'Old work' }
      ]
    )

    expect(snapshot).toMatchObject({
      activeProjectsCount: 1,
      activeTasksCount: 1
    })
  })

  it('ignores archived pinned projects when deriving pinnedProjectName', () => {
    const snapshot = deriveDashboardSnapshot(
      [
        { _id: 'project-1', status: 'archived', name: 'Archived Pin', isPinned: true },
        { _id: 'project-2', status: 'active', name: 'Live Pin', isPinned: true }
      ],
      []
    )

    expect(snapshot.pinnedProjectName).toBe('Live Pin')
  })

  it('derives currentNextAction from task-based project focus only', () => {
    const snapshot = deriveDashboardSnapshot(
      [
        { _id: 'project-1', status: 'active', name: 'Focused Project', currentFocusTaskId: 'task-2' },
        { _id: 'project-2', status: 'archived', name: 'Archived Project', currentFocusTaskId: 'task-1' }
      ],
      [
        { _id: 'task-1', status: 'active', title: 'Wrong task' },
        { _id: 'task-2', status: 'active', title: 'Correct focus task' }
      ]
    )

    expect(snapshot.currentNextAction).toBe('Correct focus task')
  })

  it('returns empty currentNextAction when the focused task is missing', () => {
    const snapshot = deriveDashboardSnapshot(
      [
        { _id: 'project-1', status: 'active', name: 'Focused Project', currentFocusTaskId: 'missing-task' }
      ],
      []
    )

    expect(snapshot.currentNextAction).toBe('')
  })
})
