import { describe, expect, it } from 'vitest'
import { deriveCockpitSnapshot } from './cockpitContextService.js'

describe('cockpitContextService smoke tests', () => {
  it('counts only non-archived projects and non-archived non-completed tasks', () => {
    const snapshot = deriveCockpitSnapshot(
      [
        { _id: 'project-1', status: 'pending', archived: false, name: 'Alpha' },
        { _id: 'project-2', status: 'pending', archived: true, name: 'Beta' }
      ],
      [
        { _id: 'task-1', status: 'active', archived: false, title: 'Do work' },
        { _id: 'task-2', status: 'completed', archived: false, title: 'Done work' },
        { _id: 'task-3', status: 'active', archived: true, title: 'Old work' }
      ]
    )

    expect(snapshot).toMatchObject({
      activeProjectsCount: 1,
      activeTasksCount: 1
    })
  })

  it('ignores archived pinned projects when deriving pinnedProjectName', () => {
    const snapshot = deriveCockpitSnapshot(
      [
        { _id: 'project-1', status: 'pending', archived: true, name: 'Archived Pin', isPinned: true },
        { _id: 'project-2', status: 'pending', archived: false, name: 'Live Pin', isPinned: true }
      ],
      []
    )

    expect(snapshot.pinnedProjectName).toBe('Live Pin')
  })

  it('derives currentNextAction from task-based project focus only', () => {
    const snapshot = deriveCockpitSnapshot(
      [
        { _id: 'project-1', status: 'pending', archived: false, name: 'Focused Project', currentFocusTaskId: 'task-2' },
        { _id: 'project-2', status: 'pending', archived: true, name: 'Archived Project', currentFocusTaskId: 'task-1' }
      ],
      [
        { _id: 'task-1', status: 'active', archived: false, title: 'Wrong task' },
        { _id: 'task-2', status: 'active', archived: false, title: 'Correct focus task' }
      ]
    )

    expect(snapshot.currentNextAction).toBe('Correct focus task')
  })

  it('returns empty currentNextAction when the focused task is missing', () => {
    const snapshot = deriveCockpitSnapshot(
      [
        { _id: 'project-1', status: 'pending', archived: false, name: 'Focused Project', currentFocusTaskId: 'missing-task' }
      ],
      []
    )

    expect(snapshot.currentNextAction).toBe('')
  })
})
