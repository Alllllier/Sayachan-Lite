const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

async function parseJsonResponse(response, errorMessage) {
  if (!response.ok) {
    throw new Error(errorMessage || `Project request failed: ${response.status}`)
  }

  return response.json()
}

export async function fetchProjects({ archived = false } = {}) {
  const url = archived
    ? `${API_BASE}/projects?archived=true`
    : `${API_BASE}/projects`
  const response = await fetch(url)
  return parseJsonResponse(response, 'Fetch projects failed')
}

export async function createProject(project) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  })

  return parseJsonResponse(response, 'Create project failed')
}

export async function updateProject(projectId, project) {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  })

  return parseJsonResponse(response, 'Update project failed')
}

export async function deleteProject(projectId) {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete project failed: ${response.status}`)
  }
}

export async function archiveProject(projectId) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/archive`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Archive project failed: ${response.status}`)
  }
}

export async function restoreProject(projectId) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/restore`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Restore project failed: ${response.status}`)
  }
}

export async function pinProject(projectId) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/pin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Pin project failed: ${response.status}`)
  }
}

export async function unpinProject(projectId) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/unpin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Unpin project failed: ${response.status}`)
  }
}

export async function fetchProjectNextActions(project) {
  const response = await fetch(`${API_BASE}/ai/projects/next-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  })

  return parseJsonResponse(response, 'Fetch project next actions failed')
}

export async function updateProjectFocus(project, taskId) {
  return updateProject(project._id, {
    name: project.name,
    summary: project.summary,
    status: project.status,
    currentFocusTaskId: taskId
  })
}
