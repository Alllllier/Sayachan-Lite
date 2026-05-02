const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

async function parseJsonResponse(response, errorMessage) {
  if (!response.ok) {
    throw new Error(errorMessage || `Note request failed: ${response.status}`)
  }

  return response.json()
}

export async function fetchNotes({ archived = false } = {}) {
  const url = archived
    ? `${API_BASE}/notes?archived=true`
    : `${API_BASE}/notes`
  const response = await fetch(url)
  return parseJsonResponse(response, 'Fetch notes failed')
}

export async function createNote(note) {
  const response = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  })

  return parseJsonResponse(response, 'Create note failed')
}

export async function updateNote(noteId, note) {
  const response = await fetch(`${API_BASE}/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: note.title,
      content: note.content
    })
  })

  return parseJsonResponse(response, 'Update note failed')
}

export async function deleteNote(noteId) {
  const response = await fetch(`${API_BASE}/notes/${noteId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete note failed: ${response.status}`)
  }
}

export async function archiveNote(noteId) {
  const response = await fetch(`${API_BASE}/notes/${noteId}/archive`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Archive note failed: ${response.status}`)
  }
}

export async function restoreNote(noteId) {
  const response = await fetch(`${API_BASE}/notes/${noteId}/restore`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Restore note failed: ${response.status}`)
  }
}

export async function pinNote(noteId) {
  const response = await fetch(`${API_BASE}/notes/${noteId}/pin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Pin note failed: ${response.status}`)
  }
}

export async function unpinNote(noteId) {
  const response = await fetch(`${API_BASE}/notes/${noteId}/unpin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Unpin note failed: ${response.status}`)
  }
}

export async function fetchNoteTaskDrafts(note) {
  const response = await fetch(`${API_BASE}/ai/notes/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  })

  return parseJsonResponse(response, 'Fetch note task drafts failed')
}
