import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveNote,
  createNote,
  deleteNote,
  fetchNoteTaskDrafts,
  fetchNotes,
  pinNote,
  restoreNote,
  unpinNote,
  updateNote
} from './notes.api.js'

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? status : status || 500,
    headers: { 'Content-Type': 'application/json' }
  })
}

function mockedFetch() {
  return vi.mocked(fetch)
}

const noteDto = {
  _id: 'note-1',
  title: 'PMO',
  content: 'Plan notes',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

describe('notes api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches active and archived note lists from the expected endpoints', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse([noteDto]))
    await expect(fetchNotes()).resolves.toEqual([noteDto])
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes', { credentials: 'include' })

    const archivedNote = { ...noteDto, _id: 'note-archived', archived: true }
    mockedFetch().mockResolvedValueOnce(jsonResponse([archivedNote]))
    await expect(fetchNotes({ archived: true })).resolves.toEqual([archivedNote])
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes?archived=true', { credentials: 'include' })
  })

  it('sends create and update payloads through note endpoints', async () => {
    const note = { title: 'PMO', content: 'Plan notes' }

    mockedFetch().mockResolvedValueOnce(jsonResponse(noteDto))
    await createNote(note)
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    })

    mockedFetch().mockResolvedValueOnce(jsonResponse({ ...noteDto, content: 'Updated' }))
    await updateNote('note-1', { ...note, content: 'Updated' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'PMO', content: 'Updated' })
    })
  })

  it('routes note lifecycle mutations through note-specific endpoints', async () => {
    mockedFetch()
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)

    await archiveNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1/archive', { method: 'PUT', credentials: 'include' })

    await restoreNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1/restore', { method: 'PUT', credentials: 'include' })

    await pinNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1/pin', { method: 'PUT', credentials: 'include' })

    await unpinNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1/unpin', { method: 'PUT', credentials: 'include' })

    await deleteNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1', { method: 'DELETE', credentials: 'include' })
  })

  it('keeps note AI task generation behind the note API boundary', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse({ drafts: ['Write handoff'] }))
    await expect(fetchNoteTaskDrafts('note-1')).resolves.toEqual({ drafts: ['Write handoff'] })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/ai/notes/tasks', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: 'note-1' })
    })
  })

  it('rejects malformed note and AI draft responses before feature state consumes them', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse([{ _id: 'note-1', title: 'Missing content' }]))
    await expect(fetchNotes()).rejects.toThrow('Invalid notes list response')

    mockedFetch().mockResolvedValueOnce(jsonResponse({ drafts: ['Write handoff', 42] }))
    await expect(fetchNoteTaskDrafts('note-1')).rejects.toThrow('Invalid note task drafts response')
  })
})
