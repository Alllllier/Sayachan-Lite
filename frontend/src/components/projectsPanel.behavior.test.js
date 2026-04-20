import { describe, expect, it } from 'vitest'
import {
  getProjectArchivedPreviewTasks,
  canSetProjectFocus,
  getProjectFocusTitle,
  getProjectPrimaryPreviewTasks,
  getProjectPreviewTasks,
  getProjectTaskBuckets
} from './projectsPanel.behavior.js'

describe('projectsPanel behavior locks', () => {
  const mixedTasks = [
    { _id: 'task-1', title: 'Active one', status: 'active', archived: false },
    { _id: 'task-2', title: 'Completed one', status: 'completed', archived: false },
    { _id: 'task-3', title: 'Archived one', status: 'active', archived: true },
    { _id: 'task-4', title: 'Active two', status: 'active', archived: false },
    { _id: 'task-5', title: 'Active three', status: 'active', archived: false },
    { _id: 'task-6', title: 'Active four', status: 'active', archived: false }
  ]

  it('splits project tasks into active, completed, and archived buckets', () => {
    expect(getProjectTaskBuckets(mixedTasks)).toEqual({
      active: [
        { _id: 'task-1', title: 'Active one', status: 'active', archived: false },
        { _id: 'task-4', title: 'Active two', status: 'active', archived: false },
        { _id: 'task-5', title: 'Active three', status: 'active', archived: false },
        { _id: 'task-6', title: 'Active four', status: 'active', archived: false }
      ],
      completed: [
        { _id: 'task-2', title: 'Completed one', status: 'completed', archived: false }
      ],
      archived: [
        { _id: 'task-3', title: 'Archived one', status: 'active', archived: true }
      ]
    })
  })

  it('shows only active or completed preview branches for active projects', () => {
    const activeProject = { _id: 'project-1', archived: false }

    expect(getProjectPreviewTasks(activeProject, mixedTasks, 'active', false).map(task => task._id)).toEqual([
      'task-1',
      'task-4',
      'task-5'
    ])
    expect(getProjectPreviewTasks(activeProject, mixedTasks, 'completed', true).map(task => task._id)).toEqual([
      'task-2'
    ])
  })

  it('shows archived tasks only for archived projects', () => {
    const archivedProject = { _id: 'project-1', archived: true }

    expect(getProjectPreviewTasks(archivedProject, mixedTasks, 'active', true).map(task => task._id)).toEqual([
      'task-3'
    ])
  })

  it('keeps archived tasks in a separate preview branch from the primary active/completed list', () => {
    const activeProject = { _id: 'project-1', archived: false }
    const archivedProject = { _id: 'project-1', archived: true }

    expect(getProjectPrimaryPreviewTasks(activeProject, mixedTasks, 'active', true).map(task => task._id)).toEqual([
      'task-1',
      'task-4',
      'task-5',
      'task-6'
    ])
    expect(getProjectArchivedPreviewTasks(activeProject, mixedTasks, true).map(task => task._id)).toEqual([
      'task-3'
    ])
    expect(getProjectPrimaryPreviewTasks(archivedProject, mixedTasks, 'active', true)).toEqual([])
    expect(getProjectArchivedPreviewTasks(archivedProject, mixedTasks, true).map(task => task._id)).toEqual([
      'task-3'
    ])
  })

  it('only allows focus interaction for active non-archived preview tasks', () => {
    expect(canSetProjectFocus({ status: 'active', archived: false })).toBe(true)
    expect(canSetProjectFocus({ status: 'completed', archived: false })).toBe(false)
    expect(canSetProjectFocus({ status: 'active', archived: true })).toBe(false)
  })

  it('derives project focus title from the task-based focus id only', () => {
    expect(getProjectFocusTitle({ currentFocusTaskId: 'task-4' }, mixedTasks)).toBe('Active two')
    expect(getProjectFocusTitle({ currentFocusTaskId: 'missing' }, mixedTasks)).toBe('')
  })
})
