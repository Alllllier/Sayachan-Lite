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

function jsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body)
  }
}

describe('notes api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches active and archived note lists from the expected endpoints', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([{ _id: 'note-1' }]))
    await expect(fetchNotes()).resolves.toEqual([{ _id: 'note-1' }])
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes')

    fetch.mockResolvedValueOnce(jsonResponse([{ _id: 'note-archived' }]))
    await expect(fetchNotes({ archived: true })).resolves.toEqual([{ _id: 'note-archived' }])
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes?archived=true')
  })

  it('sends create and update payloads through note endpoints', async () => {
    const note = { title: 'PMO', content: 'Plan notes' }

    fetch.mockResolvedValueOnce(jsonResponse({ _id: 'note-1', ...note }))
    await createNote(note)
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    })

    fetch.mockResolvedValueOnce(jsonResponse({ _id: 'note-1', ...note, content: 'Updated' }))
    await updateNote('note-1', { ...note, content: 'Updated', archived: false })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'PMO', content: 'Updated' })
    })
  })

  it('routes note lifecycle mutations through note-specific endpoints', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })

    await archiveNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1/archive', { method: 'PUT' })

    await restoreNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1/restore', { method: 'PUT' })

    await pinNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1/pin', { method: 'PUT' })

    await unpinNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1/unpin', { method: 'PUT' })

    await deleteNote('note-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/notes/note-1', { method: 'DELETE' })
  })

  it('keeps note AI task generation behind the note API boundary', async () => {
    const note = { _id: 'note-1', title: 'PMO', content: 'Plan notes' }

    fetch.mockResolvedValueOnce(jsonResponse({ drafts: ['Write handoff'] }))
    await expect(fetchNoteTaskDrafts(note)).resolves.toEqual({ drafts: ['Write handoff'] })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/ai/notes/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    })
  })
})
