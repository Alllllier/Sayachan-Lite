import { describe, expect, it } from 'vitest'
import {
  createEmptyNoteErrors,
  createNoteEditSnapshot,
  getNoteAIState,
  getNoteActionEligibility,
  hasNoteErrors,
  restoreNoteFromSnapshot,
  validateNoteFields
} from './notesPanel.behavior.js'

describe('notesPanel behavior locks', () => {
  it('returns a title error for empty or whitespace-only titles', () => {
    expect(validateNoteFields({ title: '', content: 'Body' })).toEqual({
      title: 'Enter a note title.',
      content: ''
    })
    expect(validateNoteFields({ title: '   ', content: 'Body' })).toEqual({
      title: 'Enter a note title.',
      content: ''
    })
  })

  it('returns a content error for empty or whitespace-only content', () => {
    expect(validateNoteFields({ title: 'Title', content: '' })).toEqual({
      title: '',
      content: 'Enter note content.'
    })
    expect(validateNoteFields({ title: 'Title', content: '   ' })).toEqual({
      title: '',
      content: 'Enter note content.'
    })
  })

  it('returns no local field errors for valid title and content', () => {
    expect(validateNoteFields({ title: 'Title', content: 'Body' })).toEqual(createEmptyNoteErrors())
  })

  it('only treats title or content errors as note errors', () => {
    expect(hasNoteErrors({ title: 'Enter a note title.', content: '' })).toBe(true)
    expect(hasNoteErrors({ title: '', content: 'Enter note content.' })).toBe(true)
    expect(hasNoteErrors({ title: '', content: '' })).toBe(false)
    expect(hasNoteErrors({ title: '', content: '', unrelated: 'Server warning' })).toBe(false)
    expect(hasNoteErrors(null)).toBe(false)
  })

  it('captures an editable note snapshot with title and content only', () => {
    const note = {
      _id: 'note-1',
      title: 'Original title',
      content: 'Original content',
      archived: false
    }

    const snapshot = createNoteEditSnapshot(note)
    note.title = 'Changed title'
    note.content = 'Changed content'

    expect(snapshot).toEqual({
      title: 'Original title',
      content: 'Original content'
    })
  })

  it('restores note title and content from an edit snapshot', () => {
    const note = {
      _id: 'note-1',
      title: 'Changed title',
      content: 'Changed content',
      archived: false
    }

    const restored = restoreNoteFromSnapshot(note, {
      title: 'Original title',
      content: 'Original content'
    })

    expect(restored).toBe(note)
    expect(note).toEqual({
      _id: 'note-1',
      title: 'Original title',
      content: 'Original content',
      archived: false
    })
  })

  it('leaves note edit restore unchanged when note or snapshot is missing', () => {
    const note = { _id: 'note-1', title: 'Title', content: 'Body' }

    expect(restoreNoteFromSnapshot(note, null)).toBe(note)
    expect(note).toEqual({ _id: 'note-1', title: 'Title', content: 'Body' })
    expect(restoreNoteFromSnapshot(null, { title: 'Original', content: 'Body' })).toBe(null)
  })

  it('derives pending AI state for loading note ids', () => {
    expect(getNoteAIState('note-1', new Set(['note-1']), { 'note-1': ['Draft'] })).toBe('pending')
  })

  it('derives active AI state for generated task drafts', () => {
    expect(getNoteAIState('note-1', new Set(), { 'note-1': ['Draft'] })).toBe('active')
  })

  it('derives idle AI state when neither loading nor generated drafts exist', () => {
    expect(getNoteAIState('note-1', new Set(), {})).toBe('idle')
    expect(getNoteAIState('note-1', new Set(), { 'note-2': ['Other draft'] })).toBe('idle')
  })

  it('does not count empty draft arrays as active AI state', () => {
    expect(getNoteAIState('note-1', new Set(), { 'note-1': [] })).toBe('idle')
  })

  it('allows active notes to expose pin, edit, archive, delete, and AI task generation', () => {
    expect(getNoteActionEligibility({ _id: 'note-1', archived: false })).toEqual({
      canPin: true,
      canEdit: true,
      canArchive: true,
      canDelete: true,
      canGenerateAITasks: true,
      canRestore: false
    })
  })

  it('limits archived notes to restore and delete actions', () => {
    expect(getNoteActionEligibility({ _id: 'note-1', archived: true })).toEqual({
      canPin: false,
      canEdit: false,
      canArchive: false,
      canDelete: true,
      canGenerateAITasks: false,
      canRestore: true
    })
  })
})
