import type {
  NoteDto,
  NoteTaskDraftsResponseDto,
  ProjectDto,
  ProjectNextActionsResponseDto,
  ProjectStatus
} from './api-dtos'

type UnknownRecord = Record<string, unknown>
type Guard<T> = (value: unknown) => value is T

const PROJECT_STATUSES: ProjectStatus[] = ['pending', 'in_progress', 'completed', 'on_hold']

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === 'boolean'
}

function isOptionalApiId(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || isString(value)
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return isString(value) && PROJECT_STATUSES.includes(value as ProjectStatus)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

export function assertApiResponse<T>(
  value: unknown,
  guard: Guard<T>,
  responseLabel: string
): T {
  if (guard(value)) {
    return value
  }

  throw new Error(`Invalid ${responseLabel} response`)
}

export function isNoteDto(value: unknown): value is NoteDto {
  if (!isRecord(value)) return false

  return isString(value._id) &&
    isString(value.title) &&
    isString(value.content) &&
    isString(value.updatedAt) &&
    isOptionalBoolean(value.archived) &&
    isOptionalBoolean(value.isPinned)
}

export function isNoteListDto(value: unknown): value is NoteDto[] {
  return Array.isArray(value) && value.every(isNoteDto)
}

export function isProjectDto(value: unknown): value is ProjectDto {
  if (!isRecord(value)) return false

  return isString(value._id) &&
    isString(value.name) &&
    isString(value.summary) &&
    isProjectStatus(value.status) &&
    isString(value.updatedAt) &&
    isOptionalApiId(value.currentFocusTaskId) &&
    isOptionalBoolean(value.archived) &&
    isOptionalBoolean(value.isPinned)
}

export function isProjectListDto(value: unknown): value is ProjectDto[] {
  return Array.isArray(value) && value.every(isProjectDto)
}

export function isNoteTaskDraftsResponseDto(value: unknown): value is NoteTaskDraftsResponseDto {
  return isRecord(value) && isStringArray(value.drafts)
}

export function isProjectNextActionsResponseDto(value: unknown): value is ProjectNextActionsResponseDto {
  return isRecord(value) && isStringArray(value.suggestions)
}
