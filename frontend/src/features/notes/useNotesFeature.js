import { reactive, ref } from 'vue'
import { saveTask } from '../../services/tasks/index.js'
import {
  archiveNote as archiveNoteRequest,
  createNote as createNoteRequest,
  deleteNote as deleteNoteRequest,
  fetchNoteTaskDrafts,
  fetchNotes as fetchNotesRequest,
  pinNote as pinNoteRequest,
  restoreNote as restoreNoteRequest,
  unpinNote as unpinNoteRequest,
  updateNote as updateNoteRequest
} from './notes.api.js'
import {
  createEmptyNoteErrors,
  createNoteEditSnapshot,
  getNoteAIState as deriveNoteAIState,
  getNoteActionEligibility,
  hasNoteErrors,
  restoreNoteFromSnapshot,
  validateNoteFields
} from './notes.rules.js'

const noop = () => {}

function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })
}

function readDrafts() {
  try {
    return JSON.parse(localStorage.getItem('sayachan_note_drafts') || '{}')
  } catch (e) {
    return {}
  }
}

export function useNotesFeature(options = {}) {
  const notify = options.notify || noop
  const onRefreshed = options.onRefreshed || noop
  const onNoteCreated = options.onNoteCreated || noop
  const onNoteUpdated = options.onNoteUpdated || noop

  const notes = ref([])
  const form = ref({ title: '', content: '' })
  const editingId = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const showArchived = ref(false)
  const aiTasksByNote = reactive({})
  const aiLoadingNotes = ref(new Set())
  const savedTaskDrafts = ref(new Set())
  const newNoteErrors = ref(createEmptyNoteErrors())
  const editNoteErrors = ref({})
  const editingOriginalData = ref({})
  const drafts = ref(readDrafts())

  function emitRefreshed() {
    onRefreshed(notes.value)
  }

  function saveDraft() {
    localStorage.setItem('sayachan_note_drafts', JSON.stringify(drafts.value))
  }

  function updateNewNoteError(field, value) {
    if (field === 'title') {
      newNoteErrors.value.title = value.trim() ? '' : newNoteErrors.value.title
      return
    }
    newNoteErrors.value.content = value.trim() ? '' : newNoteErrors.value.content
  }

  function ensureEditNoteErrorState(noteId) {
    if (!editNoteErrors.value[noteId]) {
      editNoteErrors.value[noteId] = createEmptyNoteErrors()
    }
    return editNoteErrors.value[noteId]
  }

  function updateEditNoteError(noteId, field, value) {
    const errors = ensureEditNoteErrorState(noteId)
    if (field === 'title') {
      errors.title = value.trim() ? '' : errors.title
      return
    }
    errors.content = value.trim() ? '' : errors.content
  }

  function clearEditNoteErrors(noteId) {
    delete editNoteErrors.value[noteId]
  }

  async function fetchNotes() {
    loading.value = true
    try {
      notes.value = await fetchNotesRequest({ archived: showArchived.value })
      emitRefreshed()
    } catch (e) {
      error.value = 'Failed to load notes'
    } finally {
      loading.value = false
    }
  }

  async function createNote() {
    const errors = validateNoteFields(form.value)
    newNoteErrors.value = errors
    if (hasNoteErrors(errors)) return

    loading.value = true
    error.value = null
    try {
      const note = await createNoteRequest(form.value)
      notes.value.unshift(note)
      form.value = { title: '', content: '' }
      newNoteErrors.value = createEmptyNoteErrors()
      onNoteCreated()
      emitRefreshed()
      notify('Note saved')
    } catch (e) {
      notify('Failed to save note. Please try again.', 'error')
      drafts.value[Date.now()] = { ...form.value }
      saveDraft()
    } finally {
      loading.value = false
    }
  }

  async function updateNote(note) {
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
      onNoteUpdated(note._id)
      clearEditNoteErrors(note._id)
      editingId.value = null
      emitRefreshed()
      notify('Note updated')
    } catch (e) {
      notify('Failed to update note. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function deleteNote(id) {
    if (!confirm('Delete this note?')) return

    loading.value = true
    error.value = null
    try {
      await deleteNoteRequest(id)
      notes.value = notes.value.filter(n => n._id !== id)
      emitRefreshed()
      notify('Note deleted')
    } catch (e) {
      notify('Failed to delete note. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function archiveNote(note) {
    if (!confirm(`Archive "${note.title}"? All tasks from this note will be archived too.`)) return

    loading.value = true
    error.value = null
    try {
      await archiveNoteRequest(note._id)
      await fetchNotes()
      notify('Note archived')
      emitRefreshed()
    } catch (e) {
      notify('Failed to archive note. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function restoreNote(note) {
    loading.value = true
    error.value = null
    try {
      await restoreNoteRequest(note._id)
      await fetchNotes()
      notify('Note restored')
      emitRefreshed()
    } catch (e) {
      notify('Failed to restore note. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function pinNote(note) {
    loading.value = true
    try {
      await pinNoteRequest(note._id)
      await fetchNotes()
      notify('Note pinned')
    } catch (e) {
      notify('Failed to pin note', 'error')
    } finally {
      loading.value = false
    }
  }

  async function unpinNote(note) {
    loading.value = true
    try {
      await unpinNoteRequest(note._id)
      await fetchNotes()
      notify('Note unpinned')
    } catch (e) {
      notify('Failed to unpin note', 'error')
    } finally {
      loading.value = false
    }
  }

  function startEditing(note) {
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

  function cancelEdit(note) {
    if (!note && editingId.value) {
      note = notes.value.find(n => n._id === editingId.value)
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

  function closeAITasks(noteId) {
    delete aiTasksByNote[noteId]
  }

  function getNoteAIState(noteId) {
    return deriveNoteAIState(noteId, aiLoadingNotes.value, aiTasksByNote)
  }

  function canUseNoteAction(note, action) {
    return Boolean(getNoteActionEligibility(note)[action])
  }

  function setArchiveView(view) {
    showArchived.value = view === 'archived'
    fetchNotes()
  }

  async function handleAIGenerateTasks(note) {
    aiLoadingNotes.value.add(note._id)
    try {
      const result = await fetchNoteTaskDrafts(note)
      aiTasksByNote[note._id] = result.drafts || []
    } catch (e) {
      aiTasksByNote[note._id] = ['Failed to generate tasks']
    } finally {
      aiLoadingNotes.value.delete(note._id)
    }
  }

  async function saveNoteTaskDraft(noteId, draft) {
    if (savedTaskDrafts.value.has(draft)) {
      return
    }

    savedTaskDrafts.value.add(draft)
    const newTask = await saveTask(
      draft,
      'ai',
      'note',
      noteId
    )
    if (newTask) {
      notify('Task saved')
    } else {
      savedTaskDrafts.value.delete(draft)
    }
  }

  return {
    notes,
    form,
    editingId,
    loading,
    error,
    showArchived,
    aiTasksByNote,
    aiLoadingNotes,
    savedTaskDrafts,
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
    closeAITasks,
    getNoteAIState,
    canUseNoteAction,
    setArchiveView,
    handleAIGenerateTasks,
    saveNoteTaskDraft
  }
}
