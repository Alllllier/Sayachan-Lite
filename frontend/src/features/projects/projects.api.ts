import { apiFetch, API_BASE } from '../../services/apiClient'
import { parseApiJsonResponse } from '../../services/apiResponse'
import {
  projectListResponseSchema,
  projectNextActionsResponseSchema,
  projectResponseSchema
} from '@sayachan/contracts'
import type {
  ProjectCreateDto,
  ProjectDto,
  ProjectNextActionsResponseDto,
  ProjectUpdateDto
} from '@sayachan/contracts'

type FetchListOptions = {
  archived?: boolean
}

export async function fetchProjects({ archived = false }: FetchListOptions = {}): Promise<ProjectDto[]> {
  const url = archived
    ? `${API_BASE}/projects?archived=true`
    : `${API_BASE}/projects`
  const response = await apiFetch(url)
  return parseApiJsonResponse<ProjectDto[]>(response, 'Fetch projects failed', projectListResponseSchema, 'projects list')
}

export async function createProject(project: ProjectCreateDto): Promise<ProjectDto> {
  const response = await apiFetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  })

  return parseApiJsonResponse<ProjectDto>(response, 'Create project failed', projectResponseSchema, 'project')
}

export async function updateProject(projectId: string, project: ProjectUpdateDto): Promise<ProjectDto> {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  })

  return parseApiJsonResponse<ProjectDto>(response, 'Update project failed', projectResponseSchema, 'project')
}

export async function deleteProject(projectId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete project failed: ${response.status}`)
  }
}

export async function archiveProject(projectId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}/archive`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Archive project failed: ${response.status}`)
  }
}

export async function restoreProject(projectId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}/restore`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Restore project failed: ${response.status}`)
  }
}

export async function pinProject(projectId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}/pin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Pin project failed: ${response.status}`)
  }
}

export async function unpinProject(projectId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}/unpin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Unpin project failed: ${response.status}`)
  }
}

export async function fetchProjectNextActions(projectId: string): Promise<ProjectNextActionsResponseDto> {
  const response = await apiFetch(`${API_BASE}/ai/projects/next-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ _id: projectId })
  })

  return parseApiJsonResponse<ProjectNextActionsResponseDto>(
    response,
    'Fetch project next actions failed',
    projectNextActionsResponseSchema,
    'project next actions'
  )
}

export async function updateProjectFocus(
  project: ProjectDto & { _id: string },
  taskId: string
): Promise<ProjectDto> {
  return updateProject(project._id, {
    name: project.name,
    summary: project.summary,
    status: project.status,
    currentFocusTaskId: taskId
  })
}
