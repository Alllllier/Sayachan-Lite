import type { TaskStatus } from '@sayachan/contracts'
import { t } from '../../i18n/productLocale'

type ProjectTaskFilter = 'active' | 'completed'
type TaskCaptureMode = 'single' | 'batch'

export type ProjectFieldErrors = {
  name: string
  summary: string
}

type ProjectLike = {
  name?: string
  summary?: string
  archived?: boolean
  currentFocusTaskId?: string | number | null
}

export type ProjectTask = {
  _id?: string | number
  title?: string
  status?: TaskStatus
  archived?: boolean
}

type TaskCaptureError = {
  single: string
  batch: string
}

type TaskCaptureInputs = {
  singleInput?: string
  batchInput?: string
}

type TaskCaptureState = {
  mode: TaskCaptureMode
  singleInput?: string
  batchInput?: string
  errors: TaskCaptureError
  manualProjectActive: boolean
}

type ProjectTaskBuckets = {
  active: ProjectTask[]
  completed: ProjectTask[]
  archived: ProjectTask[]
}

export const PROJECT_TASK_PREVIEW_LIMIT = 3

export function createEmptyProjectErrors(): ProjectFieldErrors {
  return { name: '', summary: '' }
}

export function validateProjectFields(projectLike: ProjectLike | null | undefined): ProjectFieldErrors {
  const errors = createEmptyProjectErrors()

  if (!projectLike?.name?.trim()) {
    errors.name = t('projects.validationName')
  }

  if (!projectLike?.summary?.trim()) {
    errors.summary = t('projects.validationSummary')
  }

  return errors
}

export function hasProjectErrors(errors: Partial<ProjectFieldErrors> | null | undefined): boolean {
  return Boolean(errors?.name || errors?.summary)
}

export function createEmptyTaskCaptureError(): TaskCaptureError {
  return { single: '', batch: '' }
}

export function getInitialTaskCaptureState(): TaskCaptureState {
  return {
    mode: 'single',
    singleInput: '',
    errors: createEmptyTaskCaptureError(),
    manualProjectActive: true
  }
}

export function getNextTaskCaptureModeState(
  mode: TaskCaptureMode | string,
  currentInputs: TaskCaptureInputs = {}
): TaskCaptureState {
  if (mode === 'batch') {
    return {
      mode: 'batch',
      singleInput: undefined,
      batchInput: currentInputs.batchInput || '',
      manualProjectActive: false,
      errors: createEmptyTaskCaptureError()
    }
  }

  return {
    mode: 'single',
    singleInput: currentInputs.singleInput || '',
    batchInput: undefined,
    manualProjectActive: true,
    errors: createEmptyTaskCaptureError()
  }
}

export function validateSingleTaskCapture(value: string | null | undefined): string {
  return value?.trim() ? '' : t('projects.validationTaskTitle')
}

export function parseBatchTaskTitles(value: string | null | undefined): string[] {
  return (value || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

export function validateBatchTaskCapture(value: string | null | undefined): string {
  return parseBatchTaskTitles(value).length > 0
    ? ''
    : t('projects.validationBatchTasks')
}

export function getProjectTaskBuckets(tasks: ProjectTask[] | null | undefined): ProjectTaskBuckets {
  const safeTasks = Array.isArray(tasks) ? tasks : []

  return {
    active: safeTasks.filter(task => task.status === 'active' && !task.archived),
    completed: safeTasks.filter(task => task.status === 'completed' && !task.archived),
    archived: safeTasks.filter(task => task.archived)
  }
}

export function getProjectPreviewTasks(
  project: ProjectLike | null | undefined,
  tasks: ProjectTask[] | null | undefined,
  filter: ProjectTaskFilter | string = 'active',
  expanded = false
): ProjectTask[] {
  const buckets = getProjectTaskBuckets(tasks)
  const previewTasks = project?.archived
    ? buckets.archived
    : filter === 'completed'
      ? buckets.completed
      : buckets.active

  return expanded ? previewTasks : previewTasks.slice(0, PROJECT_TASK_PREVIEW_LIMIT)
}

export function getProjectPrimaryPreviewTasks(
  project: ProjectLike | null | undefined,
  tasks: ProjectTask[] | null | undefined,
  filter: ProjectTaskFilter | string = 'active',
  expanded = false
): ProjectTask[] {
  if (project?.archived) {
    return []
  }

  return getProjectPreviewTasks(project, tasks, filter, expanded)
}

export function getProjectArchivedPreviewTasks(
  project: ProjectLike | null | undefined,
  tasks: ProjectTask[] | null | undefined,
  expanded = false
): ProjectTask[] {
  const buckets = getProjectTaskBuckets(tasks)
  return expanded ? buckets.archived : buckets.archived.slice(0, PROJECT_TASK_PREVIEW_LIMIT)
}

export function canSetProjectFocus(task: ProjectTask | null | undefined): boolean {
  return task?.status === 'active' && task?.archived !== true
}

export function getProjectFocusTitle(
  project: ProjectLike | null | undefined,
  tasks: ProjectTask[] | null | undefined
): string {
  if (!project?.currentFocusTaskId) {
    return ''
  }

  const safeTasks = Array.isArray(tasks) ? tasks : []
  const focusTask = safeTasks.find(
    task => String(task?._id) === String(project.currentFocusTaskId)
  )

  return focusTask?.title || ''
}
