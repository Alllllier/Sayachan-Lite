import { apiFetch, API_BASE } from '../../services/apiClient'
import { parseApiJsonResponse } from '../../services/apiResponse'
import {
  noteListResponseSchema,
  noteResponseSchema,
  noteTaskDraftsResponseSchema
} from '@sayachan/contracts'
import type {
  NoteCreateDto,
  NoteDto,
  NoteTaskDraftsResponseDto,
  NoteUpdateDto
} from '@sayachan/contracts'

type FetchListOptions = {
  archived?: boolean
}

export async function fetchNotes({ archived = false }: FetchListOptions = {}): Promise<NoteDto[]> {
  const url = archived
    ? `${API_BASE}/notes?archived=true`
    : `${API_BASE}/notes`
  const response = await apiFetch(url)
  return parseApiJsonResponse<NoteDto[]>(response, 'Fetch notes failed', noteListResponseSchema, 'notes list')
}

export async function createNote(note: NoteCreateDto): Promise<NoteDto> {
  const response = await apiFetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  })

  return parseApiJsonResponse<NoteDto>(response, 'Create note failed', noteResponseSchema, 'note')
}

export async function updateNote(noteId: string, note: NoteUpdateDto): Promise<NoteDto> {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: note.title,
      content: note.content
    })
  })

  return parseApiJsonResponse<NoteDto>(response, 'Update note failed', noteResponseSchema, 'note')
}

export async function deleteNote(noteId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete note failed: ${response.status}`)
  }
}

export async function archiveNote(noteId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}/archive`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Archive note failed: ${response.status}`)
  }
}

export async function restoreNote(noteId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}/restore`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Restore note failed: ${response.status}`)
  }
}

export async function pinNote(noteId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}/pin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Pin note failed: ${response.status}`)
  }
}

export async function unpinNote(noteId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}/unpin`, { method: 'PUT' })
  if (!response.ok) {
    throw new Error(`Unpin note failed: ${response.status}`)
  }
}

export async function fetchNoteTaskDrafts(noteId: string): Promise<NoteTaskDraftsResponseDto> {
  const response = await apiFetch(`${API_BASE}/ai/notes/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ _id: noteId })
  })

  return parseApiJsonResponse<NoteTaskDraftsResponseDto>(
    response,
    'Fetch note task drafts failed',
    noteTaskDraftsResponseSchema,
    'note task drafts'
  )
}
