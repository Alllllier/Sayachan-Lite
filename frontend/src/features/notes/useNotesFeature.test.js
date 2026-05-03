import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotesFeature } from './useNotesFeature.js'
import {
  archiveNote,
  createNote,
  fetchNoteTaskDrafts,
  fetchNotes,
  updateNote
} from './notes.api.js'
import { saveTask } from '../../services/tasks/index.js'

vi.mock('./notes.api.js', () => ({
  archiveNote: vi.fn(),
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  fetchNoteTaskDrafts: vi.fn(),
  fetchNotes: vi.fn(),
  pinNote: vi.fn(),
  restoreNote: vi.fn(),
  unpinNote: vi.fn(),
  updateNote: vi.fn()
}))

vi.mock('../../services/tasks/index.js', () => ({
  saveTask: vi.fn()
}))

function stubLocalStorage() {
  const store = {}
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    removeItem: vi.fn(key => {
      delete store[key]
    })
  })
}

describe('useNotesFeature orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn(() => true))
    stubLocalStorage()
  })

  it('creates a note, resets the form, clears the editor host, and notifies refresh', async () => {
    const notify = vi.fn()
    const onRefreshed = vi.fn()
    const onNoteCreated = vi.fn()
    const feature = useNotesFeature({ notify, onRefreshed, onNoteCreated })
    feature.form.value = { title: 'PMO', content: 'Plan notes' }
    createNote.mockResolvedValue({
      _id: 'note-1',
      title: 'PMO',
      content: 'Plan notes'
    })

    await feature.createNote()

    expect(createNote).toHaveBeenCalledWith({ title: 'PMO', content: 'Plan notes' })
    expect(feature.notes.value.map(note => note._id)).toEqual(['note-1'])
    expect(feature.form.value).toEqual({ title: '', content: '' })
    expect(onNoteCreated).toHaveBeenCalled()
    expect(onRefreshed).toHaveBeenCalledWith(feature.notes.value)
    expect(notify).toHaveBeenCalledWith('Note saved')
  })

  it('persists a local draft when note creation fails', async () => {
    const notify = vi.fn()
    const feature = useNotesFeature({ notify })
    feature.form.value = { title: 'PMO', content: 'Plan notes' }
    createNote.mockRejectedValue(new Error('network'))

    await feature.createNote()

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'sayachan_note_drafts',
      expect.stringContaining('"title":"PMO"')
    )
    expect(notify).toHaveBeenCalledWith('Failed to save note. Please try again.', 'error')
  })

  it('updates notes through the API and keeps pinned notes sorted first', async () => {
    const notify = vi.fn()
    const onNoteUpdated = vi.fn()
    const feature = useNotesFeature({ notify, onNoteUpdated })
    feature.notes.value = [
      { _id: 'note-1', title: 'One', content: 'First', isPinned: false, updatedAt: '2026-01-01' },
      { _id: 'note-2', title: 'Two', content: 'Second', isPinned: false, updatedAt: '2026-01-02' }
    ]
    const updatedNote = {
      _id: 'note-1',
      title: 'One',
      content: 'First updated',
      isPinned: true,
      updatedAt: '2026-01-01'
    }
    updateNote.mockResolvedValue(updatedNote)

    await feature.updateNote(updatedNote)

    expect(updateNote).toHaveBeenCalledWith('note-1', updatedNote)
    expect(feature.notes.value.map(note => note._id)).toEqual(['note-1', 'note-2'])
    expect(feature.editingId.value).toBe(null)
    expect(onNoteUpdated).toHaveBeenCalledWith('note-1')
    expect(notify).toHaveBeenCalledWith('Note updated')
  })

  it('archives through the note API before refreshing the list', async () => {
    const notify = vi.fn()
    const feature = useNotesFeature({ notify })
    fetchNotes.mockResolvedValue([{ _id: 'note-2', title: 'Remaining', content: 'Open' }])
    archiveNote.mockResolvedValue()

    await feature.archiveNote({ _id: 'note-1', title: 'Done' })

    expect(archiveNote).toHaveBeenCalledWith('note-1')
    expect(fetchNotes).toHaveBeenCalledWith({ archived: false })
    expect(feature.notes.value).toEqual([{ _id: 'note-2', title: 'Remaining', content: 'Open' }])
    expect(notify).toHaveBeenCalledWith('Note archived')
  })

  it('generates and saves note task drafts through feature boundaries', async () => {
    const notify = vi.fn()
    const feature = useNotesFeature({ notify })
    const note = { _id: 'note-1', title: 'PMO', content: 'Plan notes' }
    fetchNoteTaskDrafts.mockResolvedValue({ drafts: ['Write handoff'] })
    saveTask.mockResolvedValue({ _id: 'task-1', title: 'Write handoff' })

    await feature.handleAIGenerateTasks(note)
    await feature.saveNoteTaskDraft(note._id, 'Write handoff')

    expect(fetchNoteTaskDrafts).toHaveBeenCalledWith(note)
    expect(feature.aiTasksByNote[note._id]).toEqual(['Write handoff'])
    expect(saveTask).toHaveBeenCalledWith('Write handoff', 'ai', 'note', 'note-1')
    expect(notify).toHaveBeenCalledWith('Task saved')
  })
})
