// @ts-check
import { apiFetch, API_BASE } from '../../services/apiClient'

/**
 * @typedef {Record<string, unknown> & {
 *   name: string,
 *   summary: string,
 *   status: string,
 *   _id?: string,
 *   currentFocusTaskId?: string
 * }} ProjectPayload
 * @typedef {{ archived?: boolean }} FetchProjectsOptions
 */

/**
 * @param {Response} response
 * @param {string} errorMessage
 * @returns {Promise<unknown>}
 */
async function parseJsonResponse(response, errorMessage) {
  if (!response.ok) {
    throw new Error(errorMessage || `Project request failed: ${response.status}`)
  }

  return response.json()
}

/**
 * @param {FetchProjectsOptions} [options]
 * @returns {Promise<unknown>}
 */
export async function fetchProjects({ archived = false } = {}) {
  const url = archived
    ? `${API_BASE}/projects?archived=true`
    : `${API_BASE}/projects`
  const response = await apiFetch(url)
  return parseJsonResponse(response, 'Fetch projects failed')
}

/**
 * @param {ProjectPayload} project
 * @returns {Promise<unknown>}
 */
export async function createProject(project) {
  const response = await apiFetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  })

  return parseJsonResponse(response, 'Create project failed')
}

/**
 * @param {string} projectId
 * @param {ProjectPayload} project
 * @returns {Promise<unknown>}
 */
export async function updateProject(projectId, project) {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  })

  return parseJsonResponse(response, 'Update project failed')
}

/**
 * @param {string} projectId
 * @returns {Promise<void>}
 */
export async function deleteProject(projectId) {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete project failed: ${response.status}`)
  }
}

/**
 * @param {string} projectId
 * @returns {Promise<void>}
 */
export async function archiveProject(projectId) {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}/archive`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Archive project failed: ${response.status}`)
  }
}

/**
 * @param {string} projectId
 * @returns {Promise<void>}
 */
export async function restoreProject(projectId) {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}/restore`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Restore project failed: ${response.status}`)
  }
}

/**
 * @param {string} projectId
 * @returns {Promise<void>}
 */
export async function pinProject(projectId) {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}/pin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Pin project failed: ${response.status}`)
  }
}

/**
 * @param {string} projectId
 * @returns {Promise<void>}
 */
export async function unpinProject(projectId) {
  const response = await apiFetch(`${API_BASE}/projects/${projectId}/unpin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Unpin project failed: ${response.status}`)
  }
}

/**
 * @param {string} projectId
 * @returns {Promise<unknown>}
 */
export async function fetchProjectNextActions(projectId) {
  const response = await apiFetch(`${API_BASE}/ai/projects/next-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ _id: projectId })
  })

  return parseJsonResponse(response, 'Fetch project next actions failed')
}

/**
 * @param {ProjectPayload & { _id: string }} project
 * @param {string} taskId
 * @returns {Promise<unknown>}
 */
export async function updateProjectFocus(project, taskId) {
  return updateProject(project._id, {
    name: project.name,
    summary: project.summary,
    status: project.status,
    currentFocusTaskId: taskId
  })
}
