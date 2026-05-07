// @ts-check

/**
 * @typedef {Object} NoteFieldErrors
 * @property {string} title
 * @property {string} content
 *
 * @typedef {Object} NoteLike
 * @property {string} [title]
 * @property {string} [content]
 * @property {boolean} [archived]
 *
 * @typedef {Object} NoteEditSnapshot
 * @property {string} title
 * @property {string} content
 *
 * @typedef {'pending' | 'active' | 'idle'} NoteAIState
 *
 * @typedef {Object} NoteActionEligibility
 * @property {boolean} canPin
 * @property {boolean} canEdit
 * @property {boolean} canArchive
 * @property {boolean} canDelete
 * @property {boolean} canGenerateAITasks
 * @property {boolean} canRestore
 */

/**
 * @returns {NoteFieldErrors}
 */
export function createEmptyNoteErrors() {
  return { title: '', content: '' }
}

/**
 * @param {NoteLike | null | undefined} noteLike
 * @returns {NoteFieldErrors}
 */
export function validateNoteFields(noteLike) {
  const errors = createEmptyNoteErrors()

  if (!noteLike?.title?.trim()) {
    errors.title = 'Enter a note title.'
  }

  if (!noteLike?.content?.trim()) {
    errors.content = 'Enter note content.'
  }

  return errors
}

/**
 * @param {Partial<NoteFieldErrors> | null | undefined} errors
 * @returns {boolean}
 */
export function hasNoteErrors(errors) {
  return Boolean(errors?.title || errors?.content)
}

/**
 * @param {string} noteId
 * @param {Set<string> | null | undefined} loadingNoteIds
 * @param {Record<string, unknown[]> | null | undefined} taskDraftsByNote
 * @returns {NoteAIState}
 */
export function getNoteAIState(noteId, loadingNoteIds, taskDraftsByNote) {
  if (loadingNoteIds?.has?.(noteId)) {
    return 'pending'
  }

  const drafts = taskDraftsByNote?.[noteId]
  if (Array.isArray(drafts) && drafts.length > 0) {
    return 'active'
  }

  return 'idle'
}

/**
 * @param {NoteLike | null | undefined} note
 * @returns {NoteActionEligibility}
 */
export function getNoteActionEligibility(note) {
  const isArchived = note?.archived === true

  return {
    canPin: !isArchived,
    canEdit: !isArchived,
    canArchive: !isArchived,
    canDelete: true,
    canGenerateAITasks: !isArchived,
    canRestore: isArchived
  }
}

/**
 * @param {NoteLike | null | undefined} note
 * @returns {NoteEditSnapshot}
 */
export function createNoteEditSnapshot(note) {
  return {
    title: note?.title || '',
    content: note?.content || ''
  }
}

/**
 * @template {NoteLike} T
 * @param {T | null | undefined} note
 * @param {NoteEditSnapshot | null | undefined} snapshot
 * @returns {T | null | undefined}
 */
export function restoreNoteFromSnapshot(note, snapshot) {
  if (!note || !snapshot) {
    return note
  }

  note.title = snapshot.title
  note.content = snapshot.content
  return note
}
