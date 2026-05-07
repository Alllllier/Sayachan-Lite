import { apiFetch, API_BASE } from '../../services/apiClient'
import type {
  FetchListOptionsDto,
  NoteDto,
  NoteTaskDraftsResponseDto,
  NoteWriteDto
} from '../../types/api-dtos'
import {
  assertApiResponse,
  isNoteDto,
  isNoteListDto,
  isNoteTaskDraftsResponseDto
} from '../../types/api-contracts'

async function parseJsonResponse<T>(
  response: Response,
  errorMessage: string,
  guard: (value: unknown) => value is T,
  responseLabel: string
): Promise<T> {
  if (!response.ok) {
    throw new Error(errorMessage || `Note request failed: ${response.status}`)
  }

  return assertApiResponse(await response.json(), guard, responseLabel)
}

export async function fetchNotes({ archived = false }: FetchListOptionsDto = {}): Promise<NoteDto[]> {
  const url = archived
    ? `${API_BASE}/notes?archived=true`
    : `${API_BASE}/notes`
  const response = await apiFetch(url)
  return parseJsonResponse<NoteDto[]>(response, 'Fetch notes failed', isNoteListDto, 'notes list')
}

export async function createNote(note: NoteWriteDto): Promise<NoteDto> {
  const response = await apiFetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  })

  return parseJsonResponse<NoteDto>(response, 'Create note failed', isNoteDto, 'note')
}

export async function updateNote(noteId: string, note: NoteWriteDto): Promise<NoteDto> {
  const response = await apiFetch(`${API_BASE}/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: note.title,
      content: note.content
    })
  })

  return parseJsonResponse<NoteDto>(response, 'Update note failed', isNoteDto, 'note')
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

  return parseJsonResponse<NoteTaskDraftsResponseDto>(
    response,
    'Fetch note task drafts failed',
    isNoteTaskDraftsResponseDto,
    'note task drafts'
  )
}
