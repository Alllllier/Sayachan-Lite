import { describe, expect, it } from 'vitest'
import {
  createEmptyNoteErrors,
  createNoteEditSnapshot,
  getNoteActionEligibility,
  hasNoteErrors,
  restoreNoteFromSnapshot,
  validateNoteFields
} from './notes.rules'

describe('notes rules locks', () => {
  it('returns a title error for empty or whitespace-only titles', () => {
    expect(validateNoteFields({ title: '', content: 'Body' })).toEqual({
      title: '请输入笔记标题。',
      content: ''
    })
    expect(validateNoteFields({ title: '   ', content: 'Body' })).toEqual({
      title: '请输入笔记标题。',
      content: ''
    })
  })

  it('returns a content error for empty or whitespace-only content', () => {
    expect(validateNoteFields({ title: 'Title', content: '' })).toEqual({
      title: '',
      content: '请输入笔记内容。'
    })
    expect(validateNoteFields({ title: 'Title', content: '   ' })).toEqual({
      title: '',
      content: '请输入笔记内容。'
    })
  })

  it('returns no local field errors for valid title and content', () => {
    expect(validateNoteFields({ title: 'Title', content: 'Body' })).toEqual(createEmptyNoteErrors())
  })

  it('only treats title or content errors as note errors', () => {
    expect(hasNoteErrors({ title: '请输入笔记标题。', content: '' })).toBe(true)
    expect(hasNoteErrors({ title: '', content: '请输入笔记内容。' })).toBe(true)
    expect(hasNoteErrors({ title: '', content: '' })).toBe(false)
    const serverErrors = { title: '', content: '', unrelated: 'Server warning' }
    expect(hasNoteErrors(serverErrors)).toBe(false)
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

  it('allows active notes to expose pin, edit, archive, delete, and chat focus', () => {
    expect(getNoteActionEligibility({ archived: false })).toEqual({
      canPin: true,
      canEdit: true,
      canArchive: true,
      canDelete: true,
      canFocusChat: true,
      canRestore: false
    })
  })

  it('limits archived notes to restore and delete actions', () => {
    expect(getNoteActionEligibility({ archived: true })).toEqual({
      canPin: false,
      canEdit: false,
      canArchive: false,
      canDelete: true,
      canFocusChat: false,
      canRestore: true
    })
  })
})
