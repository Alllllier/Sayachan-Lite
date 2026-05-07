export type NoteFieldErrors = {
  title: string
  content: string
}

type NoteLike = {
  title?: string
  content?: string
  archived?: boolean
}

type NoteEditSnapshot = {
  title: string
  content: string
}

type NoteAIState = 'pending' | 'active' | 'idle'

type NoteActionEligibility = {
  canPin: boolean
  canEdit: boolean
  canArchive: boolean
  canDelete: boolean
  canGenerateAITasks: boolean
  canRestore: boolean
}

export function createEmptyNoteErrors(): NoteFieldErrors {
  return { title: '', content: '' }
}

export function validateNoteFields(noteLike: NoteLike | null | undefined): NoteFieldErrors {
  const errors = createEmptyNoteErrors()

  if (!noteLike?.title?.trim()) {
    errors.title = 'Enter a note title.'
  }

  if (!noteLike?.content?.trim()) {
    errors.content = 'Enter note content.'
  }

  return errors
}

export function hasNoteErrors(errors: Partial<NoteFieldErrors> | null | undefined): boolean {
  return Boolean(errors?.title || errors?.content)
}

export function getNoteAIState(
  noteId: string,
  loadingNoteIds: Set<string> | null | undefined,
  taskDraftsByNote: Record<string, unknown[]> | null | undefined
): NoteAIState {
  if (loadingNoteIds?.has?.(noteId)) {
    return 'pending'
  }

  const drafts = taskDraftsByNote?.[noteId]
  if (Array.isArray(drafts) && drafts.length > 0) {
    return 'active'
  }

  return 'idle'
}

export function getNoteActionEligibility(note: NoteLike | null | undefined): NoteActionEligibility {
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

export function createNoteEditSnapshot(note: NoteLike | null | undefined): NoteEditSnapshot {
  return {
    title: note?.title || '',
    content: note?.content || ''
  }
}

export function restoreNoteFromSnapshot<TNote extends NoteLike>(
  note: TNote | null | undefined,
  snapshot: NoteEditSnapshot | null | undefined
): TNote | null | undefined {
  if (!note || !snapshot) {
    return note
  }

  note.title = snapshot.title
  note.content = snapshot.content
  return note
}
