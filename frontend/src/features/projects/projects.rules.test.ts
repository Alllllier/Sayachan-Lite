import { describe, expect, it } from 'vitest'
import {
  PROJECT_TASK_PREVIEW_LIMIT,
  canSetProjectFocus,
  createEmptyProjectErrors,
  createEmptyTaskCaptureError,
  getInitialTaskCaptureState,
  getNextTaskCaptureModeState,
  getProjectArchivedPreviewTasks,
  getProjectFocusTitle,
  getProjectPrimaryPreviewTasks,
  getProjectPreviewTasks,
  getProjectTaskBuckets,
  hasProjectErrors,
  parseBatchTaskTitles,
  validateBatchTaskCapture,
  validateProjectFields,
  validateSingleTaskCapture
} from './projects.rules'
import type { ProjectTask } from './projects.rules'

describe('projects rules locks', () => {
  const mixedTasks: ProjectTask[] = [
    { _id: 'task-1', title: 'Active one', status: 'active', archived: false },
    { _id: 'task-2', title: 'Completed one', status: 'completed', archived: false },
    { _id: 'task-3', title: 'Archived one', status: 'active', archived: true },
    { _id: 'task-4', title: 'Active two', status: 'active', archived: false },
    { _id: 'task-5', title: 'Active three', status: 'active', archived: false },
    { _id: 'task-6', title: 'Active four', status: 'active', archived: false },
    { _id: 'task-7', title: 'Archived completed', status: 'completed', archived: true },
    { _id: 'task-8', title: 'Archived active two', status: 'active', archived: true },
    { _id: 'task-9', title: 'Archived active three', status: 'active', archived: true },
    { _id: 'task-10', title: 'Archived active four', status: 'active', archived: true }
  ]

  it('validates required project form fields', () => {
    expect(validateProjectFields({ name: '', summary: 'Summary' })).toEqual({
      name: '请输入项目名称。',
      summary: ''
    })
    expect(validateProjectFields({ name: '   ', summary: 'Summary' })).toEqual({
      name: '请输入项目名称。',
      summary: ''
    })
    expect(validateProjectFields({ name: 'Project', summary: '' })).toEqual({
      name: '',
      summary: '请输入简短摘要。'
    })
    expect(validateProjectFields({ name: 'Project', summary: '   ' })).toEqual({
      name: '',
      summary: '请输入简短摘要。'
    })
    expect(validateProjectFields({ name: 'Project', summary: 'Summary' })).toEqual(createEmptyProjectErrors())
  })

  it('only treats name or summary failures as project form errors', () => {
    expect(hasProjectErrors({ name: '请输入项目名称。', summary: '' })).toBe(true)
    expect(hasProjectErrors({ name: '', summary: '请输入简短摘要。' })).toBe(true)
    expect(hasProjectErrors({ name: '', summary: '' })).toBe(false)
    const serverErrors = { name: '', summary: '', unrelated: 'Server warning' }
    expect(hasProjectErrors(serverErrors)).toBe(false)
    expect(hasProjectErrors(null)).toBe(false)
  })

  it('creates the initial task capture state in single-entry mode', () => {
    expect(getInitialTaskCaptureState()).toEqual({
      mode: 'single',
      singleInput: '',
      errors: createEmptyTaskCaptureError(),
      manualProjectActive: true
    })
  })

  it('resets capture errors and switches ownership when changing task capture mode', () => {
    expect(getNextTaskCaptureModeState('batch', {
      singleInput: 'Draft task',
      batchInput: 'First\nSecond'
    })).toEqual({
      mode: 'batch',
      singleInput: undefined,
      batchInput: 'First\nSecond',
      manualProjectActive: false,
      errors: createEmptyTaskCaptureError()
    })

    expect(getNextTaskCaptureModeState('single', {
      singleInput: 'Draft task',
      batchInput: 'First\nSecond'
    })).toEqual({
      mode: 'single',
      singleInput: 'Draft task',
      batchInput: undefined,
      manualProjectActive: true,
      errors: createEmptyTaskCaptureError()
    })
  })

  it('validates single task capture titles', () => {
    expect(validateSingleTaskCapture('')).toBe('请输入任务标题。')
    expect(validateSingleTaskCapture('   ')).toBe('请输入任务标题。')
    expect(validateSingleTaskCapture('Write brief')).toBe('')
  })

  it('parses and validates batch task capture titles', () => {
    expect(parseBatchTaskTitles('  One\n\nTwo  \n   \nThree')).toEqual(['One', 'Two', 'Three'])
    expect(validateBatchTaskCapture('')).toBe('请至少输入一个任务标题。')
    expect(validateBatchTaskCapture('   \n  ')).toBe('请至少输入一个任务标题。')
    expect(validateBatchTaskCapture('One\nTwo')).toBe('')
  })

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
        { _id: 'task-3', title: 'Archived one', status: 'active', archived: true },
        { _id: 'task-7', title: 'Archived completed', status: 'completed', archived: true },
        { _id: 'task-8', title: 'Archived active two', status: 'active', archived: true },
        { _id: 'task-9', title: 'Archived active three', status: 'active', archived: true },
        { _id: 'task-10', title: 'Archived active four', status: 'active', archived: true }
      ]
    })
  })

  it('treats archived tasks as archived before lifecycle status', () => {
    const buckets = getProjectTaskBuckets(mixedTasks)

    expect(buckets.completed.map(task => task._id)).toEqual(['task-2'])
    expect(buckets.archived.map(task => task._id)).toContain('task-7')
    expect(buckets.active.map(task => task._id)).not.toContain('task-8')
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

  it('applies active and completed filtering only to the primary branch', () => {
    const activeProject = { _id: 'project-1', archived: false }

    expect(getProjectPrimaryPreviewTasks(activeProject, mixedTasks, 'active', true).map(task => task._id)).toEqual([
      'task-1',
      'task-4',
      'task-5',
      'task-6'
    ])
    expect(getProjectPrimaryPreviewTasks(activeProject, mixedTasks, 'completed', true).map(task => task._id)).toEqual([
      'task-2'
    ])
    expect(getProjectArchivedPreviewTasks(activeProject, mixedTasks, true).map(task => task._id)).toEqual([
      'task-3',
      'task-7',
      'task-8',
      'task-9',
      'task-10'
    ])
  })

  it('limits collapsed previews to three tasks and keeps expanded previews complete', () => {
    const activeProject = { _id: 'project-1', archived: false }

    expect(PROJECT_TASK_PREVIEW_LIMIT).toBe(3)
    expect(getProjectPrimaryPreviewTasks(activeProject, mixedTasks, 'active', false).map(task => task._id)).toEqual([
      'task-1',
      'task-4',
      'task-5'
    ])
    expect(getProjectPrimaryPreviewTasks(activeProject, mixedTasks, 'active', true).map(task => task._id)).toEqual([
      'task-1',
      'task-4',
      'task-5',
      'task-6'
    ])
    expect(getProjectArchivedPreviewTasks(activeProject, mixedTasks, false).map(task => task._id)).toEqual([
      'task-3',
      'task-7',
      'task-8'
    ])
    expect(getProjectArchivedPreviewTasks(activeProject, mixedTasks, true).map(task => task._id)).toEqual([
      'task-3',
      'task-7',
      'task-8',
      'task-9',
      'task-10'
    ])
  })

  it('shows archived tasks only for archived projects', () => {
    const archivedProject = { _id: 'project-1', archived: true }

    expect(getProjectPreviewTasks(archivedProject, mixedTasks, 'active', false).map(task => task._id)).toEqual([
      'task-3',
      'task-7',
      'task-8'
    ])
    expect(getProjectPreviewTasks(archivedProject, mixedTasks, 'completed', true).map(task => task._id)).toEqual([
      'task-3',
      'task-7',
      'task-8',
      'task-9',
      'task-10'
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
      'task-3',
      'task-7',
      'task-8',
      'task-9',
      'task-10'
    ])
    expect(getProjectPrimaryPreviewTasks(archivedProject, mixedTasks, 'active', true)).toEqual([])
    expect(getProjectPrimaryPreviewTasks(archivedProject, mixedTasks, 'completed', true)).toEqual([])
    expect(getProjectArchivedPreviewTasks(archivedProject, mixedTasks, true).map(task => task._id)).toEqual([
      'task-3',
      'task-7',
      'task-8',
      'task-9',
      'task-10'
    ])
  })

  it('only allows focus interaction for active non-archived preview tasks', () => {
    expect(canSetProjectFocus({ status: 'active', archived: false })).toBe(true)
    expect(canSetProjectFocus({ status: 'active' })).toBe(true)
    expect(canSetProjectFocus({ status: 'completed', archived: false })).toBe(false)
    expect(canSetProjectFocus({ status: 'active', archived: true })).toBe(false)
    expect(canSetProjectFocus({ status: 'completed', archived: true })).toBe(false)
    expect(canSetProjectFocus(null)).toBe(false)
  })

  it('derives project focus title from the task-based focus id only', () => {
    expect(getProjectFocusTitle({ currentFocusTaskId: 'task-4' }, mixedTasks)).toBe('Active two')
    expect(getProjectFocusTitle({ currentFocusTaskId: 4 }, [
      { _id: '4', title: 'String id focus', status: 'active', archived: false }
    ])).toBe('String id focus')
    expect(getProjectFocusTitle({ currentFocusTaskId: 'task-3' }, mixedTasks)).toBe('Archived one')
    expect(getProjectFocusTitle({ currentFocusTaskId: 'missing' }, mixedTasks)).toBe('')
    const projectWithLegacyFocusTitle = { currentFocusTaskId: 'task-4', focusTitle: 'Cached title' }
    const projectWithOnlyLegacyFocusTitle = { currentFocusTaskId: undefined, focusTitle: 'Cached title' }
    expect(getProjectFocusTitle(projectWithLegacyFocusTitle, [])).toBe('')
    expect(getProjectFocusTitle(projectWithOnlyLegacyFocusTitle, mixedTasks)).toBe('')
  })
})
