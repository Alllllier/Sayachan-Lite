import { ref, unref } from 'vue'
import type { MaybeRef } from 'vue'
import type { NoteCreateDto, NoteDto } from '@sayachan/contracts'
import { readResourceCache, writeResourceCache } from '../../services/resourceCache.js'
import {
  archiveNote as archiveNoteRequest,
  createNote as createNoteRequest,
  deleteNote as deleteNoteRequest,
  fetchNotes as fetchNotesRequest,
  pinNote as pinNoteRequest,
  restoreNote as restoreNoteRequest,
  unpinNote as unpinNoteRequest,
  updateNote as updateNoteRequest
} from './notes.api.js'
import {
  createEmptyNoteErrors,
  createNoteEditSnapshot,
  getNoteActionEligibility,
  hasNoteErrors,
  restoreNoteFromSnapshot,
  validateNoteFields
} from './notes.rules'
import { t } from '../../i18n/productLocale'
import type { NoteFieldErrors } from './notes.rules'

const noop = () => {}

type NotifyFn = (message: string, variant?: string) => void
type DraftStorageKey = string | MaybeRef<string | null | undefined> | (() => string | null | undefined)
type NotesFeatureOptions = {
  notify?: NotifyFn
  onRefreshed?: (notes: NoteDto[]) => void
  onNoteCreated?: () => void
  onNoteUpdated?: (noteId: string) => void
  draftStorageKey?: DraftStorageKey
  cacheUserKey?: string | MaybeRef<string | null | undefined> | null | undefined
}

type NoteEditSnapshot = {
  title: string
  content: string
}

type EditableNote = NoteDto & {
  _id: string
}

type NoteForm = Required<Pick<NoteCreateDto, 'title' | 'content'>>
type DraftMap = Record<string, NoteForm>
type NoteErrorsById = Record<string, NoteFieldErrors>
type NoteSnapshotById = Record<string, NoteEditSnapshot>

function sortNotes(notes: NoteDto[]): NoteDto[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  })
}

const DEFAULT_DRAFT_STORAGE_KEY = 'sayachan_note_drafts'
const NOTES_CACHE_RESOURCE = 'notes'

function readDrafts(storageKey = DEFAULT_DRAFT_STORAGE_KEY): DraftMap {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch (e) {
    return {}
  }
}

export function useNotesFeature(options: NotesFeatureOptions = {}) {
  const notify = options.notify || noop
  const onRefreshed = options.onRefreshed || noop
  const onNoteCreated = options.onNoteCreated || noop
  const onNoteUpdated = options.onNoteUpdated || noop
  const draftStorageKey = options.draftStorageKey || DEFAULT_DRAFT_STORAGE_KEY
  const cacheUserKey = options.cacheUserKey || 'anonymous'

  function resolveDraftStorageKey(): string {
    const key = typeof draftStorageKey === 'function'
      ? draftStorageKey()
      : unref(draftStorageKey)
    return key || DEFAULT_DRAFT_STORAGE_KEY
  }

  function resolveCacheUserKey(): string {
    return unref(cacheUserKey) || 'anonymous'
  }

  function resolveCacheVariant(): 'active' | 'archived' {
    return showArchived.value ? 'archived' : 'active'
  }

  function hydrateNotesFromCache(): boolean {
    const cachedNotes = readResourceCache<NoteDto[]>(resolveCacheUserKey(), NOTES_CACHE_RESOURCE, resolveCacheVariant())
    if (!Array.isArray(cachedNotes)) return false
    notes.value = cachedNotes
    emitRefreshed()
    return true
  }

  function cacheCurrentNotes(): void {
    writeResourceCache(resolveCacheUserKey(), NOTES_CACHE_RESOURCE, resolveCacheVariant(), notes.value)
  }

  const notes = ref<NoteDto[]>([])
  const form = ref<NoteForm>({ title: '', content: '' })
  const editingId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showArchived = ref(false)
  const newNoteErrors = ref(createEmptyNoteErrors())
  const editNoteErrors = ref<NoteErrorsById>({})
  const editingOriginalData = ref<NoteSnapshotById>({})
  const drafts = ref(readDrafts(resolveDraftStorageKey()))

  function emitRefreshed(): void {
    onRefreshed(notes.value)
  }

  function saveDraft(): void {
    localStorage.setItem(resolveDraftStorageKey(), JSON.stringify(drafts.value))
  }

  function reloadDrafts(): void {
    drafts.value = readDrafts(resolveDraftStorageKey())
  }

  function updateNewNoteError(field: 'title' | 'content', value: string): void {
    if (field === 'title') {
      newNoteErrors.value.title = value.trim() ? '' : newNoteErrors.value.title
      return
    }
    newNoteErrors.value.content = value.trim() ? '' : newNoteErrors.value.content
  }

  function ensureEditNoteErrorState(noteId: string): NoteFieldErrors {
    if (!editNoteErrors.value[noteId]) {
      editNoteErrors.value[noteId] = createEmptyNoteErrors()
    }
    return editNoteErrors.value[noteId]
  }

  function updateEditNoteError(noteId: string, field: 'title' | 'content', value: string): void {
    const errors = ensureEditNoteErrorState(noteId)
    if (field === 'title') {
      errors.title = value.trim() ? '' : errors.title
      return
    }
    errors.content = value.trim() ? '' : errors.content
  }

  function clearEditNoteErrors(noteId: string): void {
    delete editNoteErrors.value[noteId]
  }

  async function fetchNotes(): Promise<void> {
    loading.value = true
    error.value = null
    const hydratedFromCache = hydrateNotesFromCache()
    try {
      notes.value = await fetchNotesRequest({ archived: showArchived.value })
      cacheCurrentNotes()
      emitRefreshed()
    } catch (e) {
      if (hydratedFromCache) {
        notify(t('notes.toastCached'), 'error')
      } else {
        error.value = t('notes.toastLoadFailed')
      }
    } finally {
      loading.value = false
    }
  }

  async function createNote(): Promise<void> {
    const errors = validateNoteFields(form.value)
    newNoteErrors.value = errors
    if (hasNoteErrors(errors)) return

    loading.value = true
    error.value = null
    try {
      const note = await createNoteRequest(form.value)
      notes.value.unshift(note)
      cacheCurrentNotes()
      form.value = { title: '', content: '' }
      newNoteErrors.value = createEmptyNoteErrors()
      onNoteCreated()
      emitRefreshed()
      notify(t('notes.toastSaved'))
    } catch (e) {
      notify(t('notes.toastSaveFailed'), 'error')
      drafts.value[Date.now()] = { ...form.value }
      saveDraft()
    } finally {
      loading.value = false
    }
  }

  async function updateNote(note: EditableNote): Promise<void> {
    const errors = validateNoteFields(note)
    editNoteErrors.value[note._id] = errors
    if (hasNoteErrors(errors)) return

    loading.value = true
    error.value = null
    try {
      const updated = await updateNoteRequest(note._id, note)
      const index = notes.value.findIndex(n => n._id === note._id)
      if (index !== -1) notes.value[index] = updated
      notes.value = sortNotes(notes.value)
      cacheCurrentNotes()
      onNoteUpdated(note._id)
      clearEditNoteErrors(note._id)
      editingId.value = null
      emitRefreshed()
      notify(t('notes.toastUpdated'))
    } catch (e) {
      notify(t('notes.toastUpdateFailed'), 'error')
    } finally {
      loading.value = false
    }
  }

  async function deleteNote(id: string): Promise<void> {
    if (!confirm(t('notes.confirmDelete'))) return

    loading.value = true
    error.value = null
    try {
      await deleteNoteRequest(id)
      notes.value = notes.value.filter(n => n._id !== id)
      cacheCurrentNotes()
      emitRefreshed()
      notify(t('notes.toastDeleted'))
    } catch (e) {
      notify(t('notes.toastDeleteFailed'), 'error')
    } finally {
      loading.value = false
    }
  }

  async function archiveNote(note: EditableNote): Promise<void> {
    if (!confirm(t('notes.confirmArchive', { title: note.title }))) return

    loading.value = true
    error.value = null
    try {
      await archiveNoteRequest(note._id)
      await fetchNotes()
      notify(t('notes.toastArchived'))
      emitRefreshed()
    } catch (e) {
      notify(t('notes.toastArchiveFailed'), 'error')
    } finally {
      loading.value = false
    }
  }

  async function restoreNote(note: EditableNote): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await restoreNoteRequest(note._id)
      await fetchNotes()
      notify(t('notes.toastRestored'))
      emitRefreshed()
    } catch (e) {
      notify(t('notes.toastRestoreFailed'), 'error')
    } finally {
      loading.value = false
    }
  }

  async function pinNote(note: EditableNote): Promise<void> {
    loading.value = true
    try {
      await pinNoteRequest(note._id)
      await fetchNotes()
      notify(t('notes.toastPinned'))
    } catch (e) {
      notify(t('notes.toastPinFailed'), 'error')
    } finally {
      loading.value = false
    }
  }

  async function unpinNote(note: EditableNote): Promise<void> {
    loading.value = true
    try {
      await unpinNoteRequest(note._id)
      await fetchNotes()
      notify(t('notes.toastUnpinned'))
    } catch (e) {
      notify(t('notes.toastUnpinFailed'), 'error')
    } finally {
      loading.value = false
    }
  }

  function startEditing(note: EditableNote): void {
    if (editingId.value && editingId.value !== note._id) {
      const oldNote = notes.value.find(n => n._id === editingId.value)
      if (oldNote && editingOriginalData.value[editingId.value]) {
        restoreNoteFromSnapshot(oldNote, editingOriginalData.value[editingId.value])
        delete editingOriginalData.value[editingId.value]
      }
    }

    editingId.value = note._id
    editNoteErrors.value[note._id] = createEmptyNoteErrors()
    editingOriginalData.value[note._id] = createNoteEditSnapshot(note)
  }

  function cancelEdit(note?: EditableNote | null): void {
    if (!note && editingId.value) {
      note = notes.value.find(n => n._id === editingId.value) as EditableNote | undefined
    }
    if (note && editingOriginalData.value[note._id]) {
      restoreNoteFromSnapshot(note, editingOriginalData.value[note._id])
      delete editingOriginalData.value[note._id]
    }
    if (note?._id) {
      clearEditNoteErrors(note._id)
    }
    editingId.value = null
  }

  function canUseNoteAction(note: NoteDto, action: keyof ReturnType<typeof getNoteActionEligibility>): boolean {
    return Boolean(getNoteActionEligibility(note)[action])
  }

  function setArchiveView(view: string): void {
    showArchived.value = view === 'archived'
    void fetchNotes()
  }

  return {
    notes,
    form,
    editingId,
    loading,
    error,
    showArchived,
    newNoteErrors,
    editNoteErrors,
    drafts,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    archiveNote,
    restoreNote,
    pinNote,
    unpinNote,
    startEditing,
    cancelEdit,
    updateNewNoteError,
    updateEditNoteError,
    clearEditNoteErrors,
    reloadDrafts,
    canUseNoteAction,
    setArchiveView
  }
}
