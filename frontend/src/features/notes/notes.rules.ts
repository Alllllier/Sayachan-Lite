import { t } from '../../i18n/productLocale'

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

type NoteActionEligibility = {
  canPin: boolean
  canEdit: boolean
  canArchive: boolean
  canDelete: boolean
  canFocusChat: boolean
  canRestore: boolean
}

export function createEmptyNoteErrors(): NoteFieldErrors {
  return { title: '', content: '' }
}

export function validateNoteFields(noteLike: NoteLike | null | undefined): NoteFieldErrors {
  const errors = createEmptyNoteErrors()

  if (!noteLike?.title?.trim()) {
    errors.title = t('notes.validationTitle')
  }

  if (!noteLike?.content?.trim()) {
    errors.content = t('notes.validationContent')
  }

  return errors
}

export function hasNoteErrors(errors: Partial<NoteFieldErrors> | null | undefined): boolean {
  return Boolean(errors?.title || errors?.content)
}

export function getNoteActionEligibility(note: NoteLike | null | undefined): NoteActionEligibility {
  const isArchived = note?.archived === true

  return {
    canPin: !isArchived,
    canEdit: !isArchived,
    canArchive: !isArchived,
    canDelete: true,
    canFocusChat: !isArchived,
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
