import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProjectsFeature } from './useProjectsFeature.js'
import {
  archiveProject,
  createProject,
  fetchProjects,
  updateProject,
  updateProjectFocus
} from './projects.api.js'
import { fetchProjectCardTasks, saveTask } from '../../services/tasks/index.js'

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

describe('useProjectsFeature orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn(() => true))
    fetchProjectCardTasks.mockResolvedValue([])
  })

  it('creates a project, resets the form, initializes card tasks, and notifies refresh', async () => {
    const notify = vi.fn()
    const onRefreshed = vi.fn()
    const feature = useProjectsFeature({ notify, onRefreshed })
    feature.projectForm.value = { name: 'PMO', summary: 'Plan work', status: 'pending' }
    createProject.mockResolvedValue({
      _id: 'project-1',
      name: 'PMO',
      summary: 'Plan work',
      status: 'pending'
    })

    await feature.createProject()

    expect(createProject).toHaveBeenCalledWith({ name: 'PMO', summary: 'Plan work', status: 'pending' })
    expect(feature.projects.value.map(project => project._id)).toEqual(['project-1'])
    expect(feature.projectForm.value).toEqual({ name: '', summary: '', status: 'pending' })
    expect(feature.projectTasks.value['project-1']).toEqual([])
    expect(onRefreshed).toHaveBeenCalledWith(feature.projects.value)
    expect(notify).toHaveBeenCalledWith('Project created')
  })

  it('updates projects through the API and keeps pinned projects sorted first', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    feature.projects.value = [
      { _id: 'project-1', name: 'One', summary: 'First', status: 'pending', isPinned: false, updatedAt: '2026-01-01' },
      { _id: 'project-2', name: 'Two', summary: 'Second', status: 'pending', isPinned: false, updatedAt: '2026-01-02' }
    ]
    const updatedProject = {
      _id: 'project-1',
      name: 'One',
      summary: 'First updated',
      status: 'in_progress',
      isPinned: true,
      updatedAt: '2026-01-01'
    }
    updateProject.mockResolvedValue(updatedProject)

    await feature.updateProject(updatedProject)

    expect(updateProject).toHaveBeenCalledWith('project-1', updatedProject)
    expect(feature.projects.value.map(project => project._id)).toEqual(['project-1', 'project-2'])
    expect(feature.editingProjectId.value).toBe(null)
    expect(notify).toHaveBeenCalledWith('Project updated')
  })

  it('archives through the project API before refreshing the list', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    fetchProjects.mockResolvedValue([{ _id: 'project-2', name: 'Remaining', summary: 'Open' }])
    archiveProject.mockResolvedValue()

    await feature.archiveProject({ _id: 'project-1', name: 'Done' })

    expect(archiveProject).toHaveBeenCalledWith('project-1')
    expect(fetchProjects).toHaveBeenCalledWith({ archived: false })
    expect(feature.projects.value).toEqual([{ _id: 'project-2', name: 'Remaining', summary: 'Open' }])
    expect(notify).toHaveBeenCalledWith('Project archived')
  })

  it('guards focus updates to active non-archived tasks', async () => {
    const feature = useProjectsFeature()
    const project = { _id: 'project-1', name: 'PMO', summary: 'Plan', status: 'pending' }

    await feature.setTaskAsFocus(project, { _id: 'task-archived', status: 'active', archived: true })
    expect(updateProjectFocus).not.toHaveBeenCalled()

    updateProjectFocus.mockResolvedValue({ ...project, currentFocusTaskId: 'task-1' })
    feature.projects.value = [project]
    await feature.setTaskAsFocus(project, { _id: 'task-1', status: 'active', archived: false })

    expect(updateProjectFocus).toHaveBeenCalledWith(project, 'task-1')
    expect(feature.projects.value[0].currentFocusTaskId).toBe('task-1')
  })

  it('saves AI suggestions as project tasks and refreshes card tasks', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    saveTask.mockResolvedValue({ _id: 'task-1', title: 'Draft', status: 'active', archived: false })
    fetchProjectCardTasks.mockResolvedValue([{ _id: 'task-1', title: 'Draft' }])

    await feature.saveSuggestionAsTask('project-1', 'Draft')

    expect(saveTask).toHaveBeenCalledWith('Draft', 'ai', 'project', 'project-1')
    expect(fetchProjectCardTasks).toHaveBeenCalledWith('project-1', false)
    expect(feature.projectTasks.value['project-1']).toEqual([{ _id: 'task-1', title: 'Draft' }])
    expect(notify).toHaveBeenCalledWith('Saved as task')
  })

  it('adds a single manual project task, closes capture, and refreshes card tasks', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    const project = { _id: 'project-1', name: 'PMO' }
    saveTask.mockResolvedValue({ _id: 'task-1', title: 'Draft', status: 'active', archived: false })
    fetchProjectCardTasks.mockResolvedValue([{ _id: 'task-1', title: 'Draft' }])

    feature.projects.value = [project]
    feature.openTaskCapture(project._id)
    feature.manualTaskInputs.value[project._id] = 'Draft'
    await feature.addManualTask(project)

    expect(saveTask).toHaveBeenCalledWith('Draft', 'manual', 'project', 'project-1')
    expect(feature.taskCaptureOpen.value.has(project._id)).toBe(false)
    expect(feature.projectTasks.value[project._id]).toEqual([{ _id: 'task-1', title: 'Draft' }])
    expect(notify).toHaveBeenCalledWith('Task added')
  })

  it('adds batch project tasks, closes capture, and refreshes card tasks', async () => {
    const notify = vi.fn()
    const feature = useProjectsFeature({ notify })
    const project = { _id: 'project-1', name: 'PMO' }
    saveTask.mockResolvedValue({ _id: 'task-1', title: 'Saved', status: 'active', archived: false })
    fetchProjectCardTasks.mockResolvedValue([{ _id: 'task-1', title: 'First' }])

    feature.projects.value = [project]
    feature.openTaskCapture(project._id)
    feature.setTaskCaptureMode(project._id, 'batch')
    feature.batchTaskInputs.value[project._id] = 'First\nSecond'
    await feature.addBatchTasks(project)

    expect(saveTask).toHaveBeenNthCalledWith(1, 'First', 'manual', 'project', 'project-1')
    expect(saveTask).toHaveBeenNthCalledWith(2, 'Second', 'manual', 'project', 'project-1')
    expect(feature.taskCaptureOpen.value.has(project._id)).toBe(false)
    expect(feature.projectTasks.value[project._id]).toEqual([{ _id: 'task-1', title: 'First' }])
    expect(notify).toHaveBeenCalledWith('Added 2 task(s)')
  })
})
