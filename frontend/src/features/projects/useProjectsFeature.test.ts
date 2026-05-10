import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProjectsFeature } from './useProjectsFeature.js'
import { writeResourceCache } from '../../services/resourceCache.js'
import {
  archiveProject,
  createProject,
  fetchProjectNextActions,
  fetchProjects,
  updateProject,
  updateProjectFocus
} from './projects.api.js'
import { fetchProjectCardTasks, saveTask } from '../../services/tasks/index.js'
import type { ProjectDto } from '@sayachan/contracts'

vi.mock('./projects.api.js', () => ({
  archiveProject: vi.fn(),
  createProject: vi.fn(),
  deleteProject: vi.fn(),
  fetchProjectNextActions: vi.fn(),
  fetchProjects: vi.fn(),
  pinProject: vi.fn(),
  restoreProject: vi.fn(),
  unpinProject: vi.fn(),
  updateProject: vi.fn(),
  updateProjectFocus: vi.fn()
}))

vi.mock('../../services/tasks/index.js', () => ({
  fetchProjectCardTasks: vi.fn(),
  saveTask: vi.fn()
}))

const archiveProjectMock = vi.mocked(archiveProject)
const createProjectMock = vi.mocked(createProject)
const fetchProjectCardTasksMock = vi.mocked(fetchProjectCardTasks)
const fetchProjectNextActionsMock = vi.mocked(fetchProjectNextActions)
const fetchProjectsMock = vi.mocked(fetchProjects)
const saveTaskMock = vi.mocked(saveTask)
const updateProjectMock = vi.mocked(updateProject)
const updateProjectFocusMock = vi.mocked(updateProjectFocus)
const PROJECT_UPDATED_AT = '2026-01-01'

function stubLocalStorage() {
  const store: Record<string, string> = {}
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    removeItem: vi.fn(key => {
      delete store[key]
    })
  })
}

describe('useProjectsFeature orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stubLocalStorage()
    vi.stubGlobal('confirm', vi.fn(() => true))
    fetchProjectCardTasksMock.mockResolvedValue([])
  })

  it('creates a project, resets the form, initializes card tasks, and notifies refresh', async () => {
    const notify = vi.fn()
    const onRefreshed = vi.fn()
    const feature = useProjectsFeature({ notify, onRefreshed })
    feature.projectForm.value = { name: 'PMO', summary: 'Plan work', status: 'pending' }
    createProjectMock.mockResolvedValue({
      _id: 'project-1',
      name: 'PMO',
      summary: 'Plan work',
      status: 'pending',
      updatedAt: PROJECT_UPDATED_AT
    })

    await feature.createProject()

    expect(createProject).toHaveBeenCalledWith({ name: 'PMO', summary: 'Plan work', status: 'pending' })
    expect(feature.projects.value.map(project => project._id)).toEqual(['project-1'])
    expect(feature.projectForm.value).toEqual({ name: '', summary: '', status: 'pending' })
    expect(feature.projectTasks.value['project-1']).toEqual([])
    expect(onRefreshed).toHaveBeenCalledWith(feature.projects.value)
    expect(notify).toHaveBeenCalledWith('项目已创建')
  })

  it('updates projects through the API and keeps pinned projects sorted first', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    feature.projects.value = [
      { _id: 'project-1', name: 'One', summary: 'First', status: 'pending', isPinned: false, updatedAt: '2026-01-01' },
      { _id: 'project-2', name: 'Two', summary: 'Second', status: 'pending', isPinned: false, updatedAt: '2026-01-02' }
    ]
    const updatedProject: ProjectDto & { _id: string } = {
      _id: 'project-1',
      name: 'One',
      summary: 'First updated',
      status: 'in_progress',
      isPinned: true,
      updatedAt: '2026-01-01'
    }
    updateProjectMock.mockResolvedValue(updatedProject)

    await feature.updateProject(updatedProject)

    expect(updateProject).toHaveBeenCalledWith('project-1', updatedProject)
    expect(feature.projects.value.map(project => project._id)).toEqual(['project-1', 'project-2'])
    expect(feature.editingProjectId.value).toBe(null)
    expect(notify).toHaveBeenCalledWith('项目已更新')
  })

  it('archives through the project API before refreshing the list', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    fetchProjectsMock.mockResolvedValue([{ _id: 'project-2', name: 'Remaining', summary: 'Open', status: 'pending', updatedAt: PROJECT_UPDATED_AT }])
    archiveProjectMock.mockResolvedValue()

    await feature.archiveProject({ _id: 'project-1', name: 'Done', summary: 'Done summary', status: 'pending', updatedAt: PROJECT_UPDATED_AT })

    expect(archiveProject).toHaveBeenCalledWith('project-1')
    expect(fetchProjects).toHaveBeenCalledWith({ archived: false })
    expect(feature.projects.value).toEqual([{ _id: 'project-2', name: 'Remaining', summary: 'Open', status: 'pending', updatedAt: PROJECT_UPDATED_AT }])
    expect(notify).toHaveBeenCalledWith('项目已归档')
  })

  it('clears a stale load error when projects are fetched again', async () => {
    const feature = useProjectsFeature()
    fetchProjectsMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce([{ _id: 'project-1', name: 'Recovered', summary: 'Ready', status: 'pending', updatedAt: PROJECT_UPDATED_AT }])

    await feature.fetchProjects()
    expect(feature.error.value).toBe('项目加载失败')

    await feature.fetchProjects()
    expect(feature.error.value).toBe(null)
    expect(feature.projects.value).toEqual([{ _id: 'project-1', name: 'Recovered', summary: 'Ready', status: 'pending', updatedAt: PROJECT_UPDATED_AT }])
  })

  it('shows cached projects when refresh fails after a previous successful load', async () => {
    const notify = vi.fn()
    writeResourceCache('user-1', 'projects', 'active', [{ _id: 'project-cached', name: 'Cached', summary: 'Snapshot', status: 'pending', updatedAt: PROJECT_UPDATED_AT }])
    fetchProjectsMock.mockRejectedValue(new Error('network'))

    const feature = useProjectsFeature({ notify, cacheUserKey: 'user-1' })
    await feature.fetchProjects()

    expect(feature.projects.value).toEqual([{ _id: 'project-cached', name: 'Cached', summary: 'Snapshot', status: 'pending', updatedAt: PROJECT_UPDATED_AT }])
    expect(feature.error.value).toBe(null)
    expect(notify).toHaveBeenCalledWith('正在显示缓存项目，刷新失败。', 'error')
  })

  it('hydrates cached project card tasks immediately with cached projects', async () => {
    writeResourceCache('user-1', 'projects', 'active', [
      { _id: 'project-cached', name: 'Cached', summary: 'Snapshot', status: 'pending', archived: false, updatedAt: PROJECT_UPDATED_AT }
    ])
    writeResourceCache('user-1', 'project-tasks', 'project-cached:active', [
      { _id: 'task-cached', title: 'Cached task' }
    ])
    fetchProjectsMock.mockRejectedValue(new Error('network'))

    const feature = useProjectsFeature({ cacheUserKey: 'user-1' })
    await feature.fetchProjects()

    expect(feature.projects.value.map(project => project._id)).toEqual(['project-cached'])
    expect(feature.projectTasks.value['project-cached']).toEqual([{ _id: 'task-cached', title: 'Cached task' }])
  })

  it('guards focus updates to active non-archived tasks', async () => {
    const feature = useProjectsFeature()
    const project: ProjectDto & { _id: string } = { _id: 'project-1', name: 'PMO', summary: 'Plan', status: 'pending', updatedAt: PROJECT_UPDATED_AT }

    await feature.setTaskAsFocus(project, { _id: 'task-archived', status: 'active', archived: true })
    expect(updateProjectFocus).not.toHaveBeenCalled()

    updateProjectFocusMock.mockResolvedValue({ ...project, currentFocusTaskId: 'task-1' })
    feature.projects.value = [project]
    await feature.setTaskAsFocus(project, { _id: 'task-1', status: 'active', archived: false })

    expect(updateProjectFocus).toHaveBeenCalledWith(project, 'task-1')
    expect(feature.projects.value[0].currentFocusTaskId).toBe('task-1')
  })

  it('saves AI suggestions as project tasks and refreshes card tasks', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    saveTaskMock.mockResolvedValue({ _id: 'task-1', title: 'Draft', status: 'active', archived: false, completed: false })
    fetchProjectCardTasksMock.mockResolvedValue([{ _id: 'task-1', title: 'Draft' }])

    await feature.saveSuggestionAsTask('project-1', 'Draft')

    expect(saveTask).toHaveBeenCalledWith('Draft', 'ai', 'project', 'project-1')
    expect(fetchProjectCardTasks).toHaveBeenCalledWith('project-1', false)
    expect(feature.projectTasks.value['project-1']).toEqual([{ _id: 'task-1', title: 'Draft' }])
    expect(notify).toHaveBeenCalledWith('已保存为任务')
  })

  it('generates project AI suggestions from the current project id', async () => {
    const feature = useProjectsFeature()
    const project: ProjectDto & { _id: string } = { _id: 'project-1', name: 'PMO', summary: 'Plan', status: 'pending', updatedAt: PROJECT_UPDATED_AT }
    fetchProjectNextActionsMock.mockResolvedValue({ suggestions: ['Write handoff'] })

    await feature.handleAISuggest(project)

    expect(fetchProjectNextActions).toHaveBeenCalledWith(project._id)
    expect(feature.aiSuggestions.value[project._id]).toEqual(['Write handoff'])
  })

  it('adds a single manual project task, closes capture, and refreshes card tasks', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    const project: ProjectDto & { _id: string } = { _id: 'project-1', name: 'PMO', summary: 'Plan', status: 'pending', updatedAt: PROJECT_UPDATED_AT }
    saveTaskMock.mockResolvedValue({ _id: 'task-1', title: 'Draft', status: 'active', archived: false, completed: false })
    fetchProjectCardTasksMock.mockResolvedValue([{ _id: 'task-1', title: 'Draft' }])

    feature.projects.value = [project]
    feature.openTaskCapture(project._id)
    feature.manualTaskInputs.value[project._id] = 'Draft'
    await feature.addManualTask(project)

    expect(saveTask).toHaveBeenCalledWith('Draft', 'manual', 'project', 'project-1')
    expect(feature.taskCaptureOpen.value.has(project._id)).toBe(false)
    expect(feature.projectTasks.value[project._id]).toEqual([{ _id: 'task-1', title: 'Draft' }])
    expect(notify).toHaveBeenCalledWith('任务已添加')
  })

  it('adds batch project tasks, closes capture, and refreshes card tasks', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    const project: ProjectDto & { _id: string } = { _id: 'project-1', name: 'PMO', summary: 'Plan', status: 'pending', updatedAt: PROJECT_UPDATED_AT }
    saveTaskMock.mockResolvedValue({ _id: 'task-1', title: 'Saved', status: 'active', archived: false, completed: false })
    fetchProjectCardTasksMock.mockResolvedValue([{ _id: 'task-1', title: 'First' }])

    feature.projects.value = [project]
    feature.openTaskCapture(project._id)
    feature.setTaskCaptureMode(project._id, 'batch')
    feature.batchTaskInputs.value[project._id] = 'First\nSecond'
    await feature.addBatchTasks(project)

    expect(saveTask).toHaveBeenNthCalledWith(1, 'First', 'manual', 'project', 'project-1')
    expect(saveTask).toHaveBeenNthCalledWith(2, 'Second', 'manual', 'project', 'project-1')
    expect(feature.taskCaptureOpen.value.has(project._id)).toBe(false)
    expect(feature.projectTasks.value[project._id]).toEqual([{ _id: 'task-1', title: 'First' }])
    expect(notify).toHaveBeenCalledWith('已添加 2 个任务')
  })
})
