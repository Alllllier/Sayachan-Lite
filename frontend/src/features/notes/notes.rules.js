export function createEmptyNoteErrors() {
  return { title: '', content: '' }
}

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

export function hasNoteErrors(errors) {
  return Boolean(errors?.title || errors?.content)
}

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

export function createNoteEditSnapshot(note) {
  return {
    title: note?.title || '',
    content: note?.content || ''
  }
}

export function restoreNoteFromSnapshot(note, snapshot) {
  if (!note || !snapshot) {
    return note
  }

  note.title = snapshot.title
  note.content = snapshot.content
  return note
}
