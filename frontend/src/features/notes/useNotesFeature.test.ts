import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useNotesFeature } from './useNotesFeature.js'
import { writeResourceCache } from '../../services/resourceCache.js'
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

const archiveNoteMock = vi.mocked(archiveNote)
const createNoteMock = vi.mocked(createNote)
const fetchNoteTaskDraftsMock = vi.mocked(fetchNoteTaskDrafts)
const fetchNotesMock = vi.mocked(fetchNotes)
const saveTaskMock = vi.mocked(saveTask)
const updateNoteMock = vi.mocked(updateNote)

function stubLocalStorage() {
  const store: Record<string, string> = {}
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
    createNoteMock.mockResolvedValue({
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
    const feature = useNotesFeature({ notify, draftStorageKey: 'sayachan_note_drafts:user-1' })
    feature.form.value = { title: 'PMO', content: 'Plan notes' }
    createNoteMock.mockRejectedValue(new Error('network'))

    await feature.createNote()

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'sayachan_note_drafts:user-1',
      expect.stringContaining('"title":"PMO"')
    )
    expect(notify).toHaveBeenCalledWith('Failed to save note. Please try again.', 'error')
  })

  it('uses the current draft storage key after an account switch', async () => {
    const notify = vi.fn()
    const draftStorageKey = ref('sayachan_note_drafts:user-1')
    const feature = useNotesFeature({ notify, draftStorageKey })
    createNoteMock.mockRejectedValue(new Error('network'))

    feature.form.value = { title: 'Owner draft', content: 'Owner content' }
    await feature.createNote()

    draftStorageKey.value = 'sayachan_note_drafts:user-2'
    feature.reloadDrafts()
    feature.form.value = { title: 'Tester draft', content: 'Tester content' }
    await feature.createNote()

    expect(localStorage.setItem).toHaveBeenNthCalledWith(
      1,
      'sayachan_note_drafts:user-1',
      expect.stringContaining('"title":"Owner draft"')
    )
    expect(localStorage.setItem).toHaveBeenNthCalledWith(
      2,
      'sayachan_note_drafts:user-2',
      expect.stringContaining('"title":"Tester draft"')
    )
    expect(vi.mocked(localStorage.setItem).mock.calls[1][1]).not.toContain('Owner draft')
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
    updateNoteMock.mockResolvedValue(updatedNote)

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
    fetchNotesMock.mockResolvedValue([{ _id: 'note-2', title: 'Remaining', content: 'Open' }])
    archiveNoteMock.mockResolvedValue()

    await feature.archiveNote({ _id: 'note-1', title: 'Done', content: 'Done content' })

    expect(archiveNote).toHaveBeenCalledWith('note-1')
    expect(fetchNotes).toHaveBeenCalledWith({ archived: false })
    expect(feature.notes.value).toEqual([{ _id: 'note-2', title: 'Remaining', content: 'Open' }])
    expect(notify).toHaveBeenCalledWith('Note archived')
  })

  it('clears a stale load error when notes are fetched again', async () => {
    const feature = useNotesFeature()
    fetchNotesMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce([{ _id: 'note-1', title: 'Recovered', content: 'Ready' }])

    await feature.fetchNotes()
    expect(feature.error.value).toBe('Failed to load notes')

    await feature.fetchNotes()
    expect(feature.error.value).toBe(null)
    expect(feature.notes.value).toEqual([{ _id: 'note-1', title: 'Recovered', content: 'Ready' }])
  })

  it('shows cached notes when refresh fails after a previous successful load', async () => {
    const notify = vi.fn()
    writeResourceCache('user-1', 'notes', 'active', [{ _id: 'note-cached', title: 'Cached', content: 'Snapshot' }])
    fetchNotesMock.mockRejectedValue(new Error('network'))

    const feature = useNotesFeature({ notify, cacheUserKey: 'user-1' })
    await feature.fetchNotes()

    expect(feature.notes.value).toEqual([{ _id: 'note-cached', title: 'Cached', content: 'Snapshot' }])
    expect(feature.error.value).toBe(null)
    expect(notify).toHaveBeenCalledWith('Showing cached notes. Refresh failed.', 'error')
  })

  it('generates and saves note task drafts through feature boundaries', async () => {
    const notify = vi.fn()
    const feature = useNotesFeature({ notify })
    const note = { _id: 'note-1', title: 'PMO', content: 'Plan notes' }
    fetchNoteTaskDraftsMock.mockResolvedValue({ drafts: ['Write handoff'] })
    saveTaskMock.mockResolvedValue({ _id: 'task-1', title: 'Write handoff', status: 'active', archived: false, completed: false })

    await feature.handleAIGenerateTasks(note)
    await feature.saveNoteTaskDraft(note._id, 'Write handoff')

    expect(fetchNoteTaskDrafts).toHaveBeenCalledWith(note._id)
    expect(feature.aiTasksByNote[note._id]).toEqual(['Write handoff'])
    expect(saveTask).toHaveBeenCalledWith('Write handoff', 'ai', 'note', 'note-1')
    expect(notify).toHaveBeenCalledWith('Task saved')
  })
})
