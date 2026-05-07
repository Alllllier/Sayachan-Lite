// @ts-check
import { apiFetch, API_BASE } from '../../services/apiClient'

/**
 * @template T
 * @param {Response} response
 * @param {string} errorMessage
 * @returns {Promise<T>}
 */
async function parseJsonResponse(response, errorMessage) {
  if (!response.ok) {
    throw new Error(errorMessage || `Note request failed: ${response.status}`)
  }

  return /** @type {Promise<T>} */ (response.json())
}

/**
 * @param {FetchListOptionsDto} [options]
 * @returns {Promise<NoteDto[]>}
 */
export async function fetchNotes({ archived = false } = {}) {
  const url = archived
    ? `${API_BASE}/notes?archived=true`
    : `${API_BASE}/notes`
  const response = await apiFetch(url)
  return parseJsonResponse(response, 'Fetch notes failed')
}

/**
 * @param {NoteWriteDto} note
 * @returns {Promise<NoteDto>}
 */
export async function createNote(note) {
  const response = await apiFetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  })

  return parseJsonResponse(response, 'Create note failed')
}

/**
 * @param {string} noteId
 * @param {NoteWriteDto} note
 * @returns {Promise<NoteDto>}
 */
export async function updateNote(noteId, note) {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: note.title,
      content: note.content
    })
  })

  return parseJsonResponse(response, 'Update note failed')
}

/**
 * @param {string} noteId
 * @returns {Promise<void>}
 */
export async function deleteNote(noteId) {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete note failed: ${response.status}`)
  }
}

/**
 * @param {string} noteId
 * @returns {Promise<void>}
 */
export async function archiveNote(noteId) {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}/archive`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Archive note failed: ${response.status}`)
  }
}

/**
 * @param {string} noteId
 * @returns {Promise<void>}
 */
export async function restoreNote(noteId) {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}/restore`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Restore note failed: ${response.status}`)
  }
}

/**
 * @param {string} noteId
 * @returns {Promise<void>}
 */
export async function pinNote(noteId) {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}/pin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Pin note failed: ${response.status}`)
  }
}

/**
 * @param {string} noteId
 * @returns {Promise<void>}
 */
export async function unpinNote(noteId) {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}/unpin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Unpin note failed: ${response.status}`)
  }
}

/**
 * @param {string} noteId
 * @returns {Promise<NoteTaskDraftsResponseDto>}
 */
export async function fetchNoteTaskDrafts(noteId) {
  const response = await apiFetch(`${API_BASE}/ai/notes/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ _id: noteId })
  })

  return parseJsonResponse(response, 'Fetch note task drafts failed')
}
