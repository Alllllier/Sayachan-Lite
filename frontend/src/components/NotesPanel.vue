<script setup>
import { ref, reactive, onMounted, defineEmits, nextTick } from 'vue'
import { basicSetup } from 'codemirror'
import { EditorView } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import 'highlight.js/styles/github.css'
import { renderMarkdown } from '../utils/markdown.js'
import { saveTask } from '../services/taskService.js'
import Card from './ui/Card.vue'
import SectionBlock from './ui/SectionBlock.vue'
import ActionRow from './ui/ActionRow.vue'
import ObjectActionArea from './ui/ObjectActionArea.vue'
import Toast from './ui/Toast.vue'
import EmptyState from './ui/EmptyState.vue'
import SegmentedControl from './ui/SegmentedControl.vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const notes = ref([])
const form = ref({ title: '', content: '' })
const editingId = ref(null)
const loading = ref(false)
const error = ref(null)
const showArchived = ref(false)
const aiTasksByNote = reactive({})
const aiLoadingNotes = ref(new Set())
const savedTaskDrafts = ref(new Set())
const menuOpenNoteId = ref(null)

// P0-Fix-1: Store original note data for cancel restore
const editingOriginalData = ref({})

// Markdown editor refs
const newEditorRef = ref(null)
const newEditorView = ref(null)
const editEditorViews = reactive({})

// Toast notifications
const toast = ref(null)
const toastMessage = ref('')
const toastType = ref('success') // success, error

const archiveViewOptions = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]

function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  toast.value = true
  setTimeout(() => {
    toast.value = false
  }, 3000)
}

function toggleNoteMenu(noteId) {
  if (menuOpenNoteId.value === noteId) {
    menuOpenNoteId.value = null
  } else {
    menuOpenNoteId.value = noteId
  }
}

function closeNoteMenu() {
  menuOpenNoteId.value = null
}

// Local draft cache
const drafts = ref(JSON.parse(localStorage.getItem('sayachan_note_drafts') || '{}'))

function saveDraft() {
  localStorage.setItem('sayachan_note_drafts', JSON.stringify(drafts.value))
}

function clearDraft() {
  drafts.value = {}
  localStorage.removeItem('sayachan_note_drafts')
}
const emit = defineEmits(['refreshed'])

// CodeMirror factory
function createCodeMirror(parent, initialValue, onChange) {
  return new EditorView({
    doc: initialValue || '',
    extensions: [
      basicSetup,
      markdown(),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          fontSize: '14px',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-card)',
          fontFamily: 'var(--font-family-base)',
          lineHeight: '1.6'
        },
        '&.cm-focused': {
          outline: 'none',
          borderColor: 'var(--border-focus)',
          boxShadow: '0 0 0 3px rgba(66, 184, 131, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)'
        },
        '.cm-content': {
          minHeight: '120px',
          padding: 'var(--space-lg) var(--space-xl)'
        },
        '.cm-gutters': {
          display: 'none'
        },
        '.cm-line': {
          padding: '2px 0'
        },
        '.cm-activeLine': {
          backgroundColor: 'transparent'
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'transparent'
        },
        '.cm-cursor': {
          borderLeftWidth: '2px',
          borderLeftColor: 'var(--text-primary)'
        },
        '.cm-placeholder': {
          color: 'var(--text-muted)'
        },
        '.cm-scroller': {
          fontFamily: 'inherit',
          lineHeight: 'inherit'
        },
        '.cm-selectionBackground': {
          background: 'rgba(66, 184, 131, 0.12)'
        },
        '.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
          background: 'rgba(66, 184, 131, 0.18)'
        }
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      })
    ],
    parent
  })
}

function bindEditEditor(el, note) {
  if (!el || editingId.value !== note._id) return
  if (editEditorViews[note._id]) {
    // Already bound; avoid recreating on minor re-renders
    return
  }
  editEditorViews[note._id] = createCodeMirror(el, note.content || '', (val) => {
    note.content = val
  })
}

async function fetchNotes() {
  loading.value = true
  try {
    const url = showArchived.value
      ? `${API_BASE}/notes?archived=true`
      : `${API_BASE}/notes`
    const response = await fetch(url)
    notes.value = await response.json()
    emit('refreshed', notes.value)
  } catch (e) {
    error.value = 'Failed to load notes'
  } finally {
    loading.value = false
  }
}

async function createNote() {
  if (!form.value.title.trim() || !form.value.content.trim()) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (!response.ok) throw new Error('Save failed')
    const note = await response.json()
    notes.value.unshift(note)
    form.value = { title: '', content: '' }
    if (newEditorView.value) {
      const doc = newEditorView.value.state.doc
      newEditorView.value.dispatch({
        changes: { from: 0, to: doc.length, insert: '' }
      })
    }
    emit('refreshed', notes.value)
    showToast('Note saved')
  } catch (e) {
    showToast('Failed to save note. Please try again.', 'error')
    // Save as local draft
    drafts.value[Date.now()] = { ...form.value }
    saveDraft()
  } finally {
    loading.value = false
  }
}

async function updateNote(note) {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/notes/${note._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: note.title, content: note.content })
    })
    if (!response.ok) throw new Error('Update failed')
    const updated = await response.json()
    const index = notes.value.findIndex(n => n._id === note._id)
    if (index !== -1) notes.value[index] = updated
    // Sort: pinned first, then by updatedAt
    notes.value.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
    if (editEditorViews[note._id]) {
      editEditorViews[note._id].destroy()
      delete editEditorViews[note._id]
    }
    editingId.value = null
    emit('refreshed', notes.value)
    showToast('Note updated')
  } catch (e) {
    showToast('Failed to update note. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function deleteNote(id) {
  if (!confirm('Delete this note?')) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Delete failed')
    notes.value = notes.value.filter(n => n._id !== id)
    emit('refreshed', notes.value)
    showToast('Note deleted')
  } catch (e) {
    showToast('Failed to delete note. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function archiveNote(note) {
  if (!confirm(`Archive "${note.title}"? All tasks from this note will be archived too.`)) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/notes/${note._id}/archive`, { method: 'PUT' })
    if (!response.ok) throw new Error('Archive failed')
    await fetchNotes()
    showToast('Note archived')
    emit('refreshed', notes.value)
  } catch (e) {
    showToast('Failed to archive note. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function restoreNote(note) {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/notes/${note._id}/restore`, { method: 'PUT' })
    if (!response.ok) throw new Error('Restore failed')
    await fetchNotes()
    showToast('Note restored')
    emit('refreshed', notes.value)
  } catch (e) {
    showToast('Failed to restore note. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function pinNote(note) {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/notes/${note._id}/pin`, { method: 'PUT' })
    if (!response.ok) throw new Error('Pin failed')
    await fetchNotes()
    showToast('Note pinned')
  } catch (e) {
    showToast('Failed to pin note', 'error')
  } finally {
    loading.value = false
  }
}

async function unpinNote(note) {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/notes/${note._id}/unpin`, { method: 'PUT' })
    if (!response.ok) throw new Error('Unpin failed')
    await fetchNotes()
    showToast('Note unpinned')
  } catch (e) {
    showToast('Failed to unpin note', 'error')
  } finally {
    loading.value = false
  }
}

function startEditing(note) {
  // If switching from another edit, restore that note first
  if (editingId.value && editingId.value !== note._id) {
    const oldNote = notes.value.find(n => n._id === editingId.value)
    if (oldNote && editingOriginalData.value[editingId.value]) {
      oldNote.title = editingOriginalData.value[editingId.value].title
      oldNote.content = editingOriginalData.value[editingId.value].content
      delete editingOriginalData.value[editingId.value]
    }
    if (editEditorViews[editingId.value]) {
      editEditorViews[editingId.value].destroy()
      delete editEditorViews[editingId.value]
    }
  }
  editingId.value = note._id
  // P0-Fix-1: Store original data for restore on cancel
  editingOriginalData.value[note._id] = {
    title: note.title,
    content: note.content
  }
}

function cancelEdit(note) {
  // P0-Fix-1: Restore original data before closing edit mode
  if (note && editingOriginalData.value[note._id]) {
    note.title = editingOriginalData.value[note._id].title
    note.content = editingOriginalData.value[note._id].content
    // Clean up stored original data
    delete editingOriginalData.value[note._id]
  }
  if (note && editEditorViews[note._id]) {
    editEditorViews[note._id].destroy()
    delete editEditorViews[note._id]
  }
  editingId.value = null
}

// Close AI suggestions by clearing data (allows reopening)
function closeAITasks(noteId) {
  delete aiTasksByNote[noteId]
}

function getNoteAIState(noteId) {
  if (aiLoadingNotes.value.has(noteId)) return 'pending'
  if (aiTasksByNote[noteId] && aiTasksByNote[noteId].length > 0) return 'active'
  return 'idle'
}

function setArchiveView(view) {
  showArchived.value = view === 'archived'
  fetchNotes()
}

onMounted(() => {
  fetchNotes()
  nextTick(() => {
    if (newEditorRef.value) {
      newEditorView.value = createCodeMirror(newEditorRef.value, '', (val) => {
        form.value.content = val
      })
    }
  })
})

async function handleAIGenerateTasks(note) {
  aiLoadingNotes.value.add(note._id)
  try {
    const response = await fetch(`${API_BASE}/ai/notes/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    })
    const result = await response.json()
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
  const note = notes.value.find(n => n._id === noteId)
  const newTask = await saveTask(
    draft,
    'ai',
    'note',
    note._id
  )
  if (newTask) {
    showToast('Task saved')
  } else {
    savedTaskDrafts.value.delete(draft)
  }
}
</script>

<template>
  <!-- Toast Notification -->
  <Toast :message="toastMessage" :type="toastType" :visible="toast" />

  <div v-if="error" class="error">{{ error }}</div>

  <div class="form-section">
    <h2>{{ editingId ? 'Edit Note' : 'New Note' }}</h2>
    <input v-model="form.title" placeholder="Title" class="input" />
    <div ref="newEditorRef" class="codemirror-editor"></div>
    <ActionRow class="form-buttons">
      <button @click="createNote" :disabled="loading || editingId" class="btn btn-primary">
        {{ loading ? 'Saving...' : 'Add Note' }}
      </button>
      <button v-if="editingId" @click="cancelEdit" :disabled="loading" class="btn btn-secondary cancel">
        Cancel
      </button>
    </ActionRow>
  </div>

  <div class="notes-section">
    <div class="section-header">
      <h2>Notes ({{ notes.length }})</h2>
      <SegmentedControl
        :model-value="showArchived ? 'archived' : 'active'"
        :options="archiveViewOptions"
        variant="page"
        aria-label="Notes archive view"
        @update:model-value="setArchiveView"
      />
    </div>
    <EmptyState v-if="notes.length === 0" :title="showArchived ? 'No archived notes' : 'No notes yet'" />
    <Card
      v-for="note in notes"
      :key="note._id"
      :class="['note-card', { archived: note.archived }]"
      @click="closeNoteMenu"
    >
      <template #header>
        <div class="card-heading-row">
          <div class="card-heading-copy">
            <h3 class="card-title">{{ note.title }}</h3>
          </div>
          <button
            v-if="!note.archived"
            @click.stop="note.isPinned ? unpinNote(note) : pinNote(note)"
            class="panel-surface-icon-btn pin-icon-btn"
            :class="{ pinned: note.isPinned }"
            :title="note.isPinned ? 'Unpin note' : 'Pin note'"
          >
            <svg v-if="note.isPinned" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/>
            </svg>
          </button>
        </div>
      </template>

      <template #meta>
        <p class="card-meta">{{ new Date(note.updatedAt).toLocaleString() }}</p>
      </template>

      <template #body>
        <div v-if="editingId === note._id && !note.archived" class="note-edit-form">
          <input v-model="note.title" placeholder="Title" class="input" />
          <div :ref="el => bindEditEditor(el, note)" class="codemirror-editor"></div>
        </div>
        <div v-else>
          <div class="card-content markdown-body" v-html="renderMarkdown(note.content)"></div>
        </div>
      </template>

      <template #actions v-if="editingId === note._id && !note.archived">
        <ActionRow class="card-buttons edit-actions">
          <button @click="cancelEdit(note)" :disabled="loading" class="btn btn-secondary cancel">Cancel</button>
          <button @click="updateNote(note)" :disabled="loading" class="btn btn-primary">Save</button>
        </ActionRow>
      </template>

      <template #actions v-else>
        <template v-if="note.archived">
          <ActionRow class="card-buttons">
            <button @click="restoreNote(note)" class="btn btn-secondary">Restore</button>
            <button @click="deleteNote(note._id)" class="btn btn-danger delete">Delete</button>
          </ActionRow>
        </template>
        <ObjectActionArea
          v-else
          class="note-ai-action"
          variant="ai"
          active-kind="icon"
          :state="getNoteAIState(note._id)"
          @activate="handleAIGenerateTasks(note)"
          @cancel="closeAITasks(note._id)"
        >
          <template #idle-icon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </template>
          <template #trailing>
            <div class="task-menu-container">
              <button @click.stop="toggleNoteMenu(note._id)" class="btn btn-overflow task-menu-btn" :class="{ active: menuOpenNoteId === note._id }" title="Actions">
                <svg class="menu-icon-svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
              </button>
              <div v-if="menuOpenNoteId === note._id" class="task-menu-dropdown panel-surface-menu" @click.stop>
                <button @click="startEditing(note)" class="btn btn-menu-item btn-secondary menu-item">Edit</button>
                <button @click="archiveNote(note)" class="btn btn-menu-item btn-archive menu-item">Archive</button>
                <button @click="deleteNote(note._id)" class="btn btn-menu-item btn-danger menu-item delete">Delete</button>
              </div>
            </div>
          </template>
          <SectionBlock v-if="aiTasksByNote[note._id] && aiTasksByNote[note._id].length > 0" class="note-ai-tasks">
            <div class="ai-tasks-header">
              <strong>AI Tasks ({{ aiTasksByNote[note._id].length }})</strong>
            </div>
            <div v-for="(draft, idx) in aiTasksByNote[note._id]" :key="idx" class="ai-task-item">
              <div class="task-content">{{ draft }}</div>
              <div class="task-actions">
                <button @click="saveNoteTaskDraft(note._id, draft)" class="btn btn-secondary btn-sm" :disabled="savedTaskDrafts.has(draft)">
                  {{ savedTaskDrafts.has(draft) ? 'Saved' : 'Save as Task' }}
                </button>
              </div>
            </div>
          </SectionBlock>
        </ObjectActionArea>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.form-section, .notes-section {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  padding: var(--space-lg);
  background: var(--surface-panel);
  margin-bottom: var(--space-lg);
}

/* Editor container spacing */
.codemirror-editor {
  margin-bottom: var(--space-md);
}

.form-section h2, .notes-section h2 {
  font-size: var(--font-size-title);
  margin-top: 0;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

/* Archived Note Card Styles - Uses semantic tokens */
.note-card {
  position: relative;
}

.note-card.archived {
  opacity: 0.75;
  background: var(--surface-panel);
  border-color: var(--border-default);
}

.form-buttons, .card-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.card-buttons {
  margin-top: 16px;
}

/* Base button styles now use global .btn classes */

/* button.cancel uses global .btn .btn-secondary */

/* button.delete uses global .btn .btn-danger */

.ai-tasks-header {
  margin-bottom: 8px;
}

.save-success {
  color: #10b981;
  font-size: 11px;
}

/* AI Task Item - Vertical hierarchy (content first) */
.ai-task-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background: white;
  border-radius: 4px;
  margin-bottom: 6px;
  gap: 10px;
}

.ai-task-item:last-child {
  margin-bottom: 0;
}

.task-content {
  font-size: 12px;
  color: #555;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

/* Empty state uses EmptyState component */

.error {
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

/* .note-card uses the shared .card baseline */

/* Markdown display uses global .markdown-body baseline from style.css */

/* Task Menu - Overflow pattern */
.task-menu-container {
  position: relative;
  margin-left: 4px;
}

.menu-item {
  box-shadow: none;
}

.note-card {
  gap: var(--space-sm);
}

.card-heading-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.card-heading-copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  flex: 1;
}

.card-heading-copy .card-title {
  margin: 0;
}

.card-heading-copy .card-content {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-body);
}

.note-edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.note-ai-action {
  width: 100%;
}

.note-ai-tasks {
  margin-top: 0;
  background: color-mix(in srgb, var(--identity-primary-soft) 45%, var(--surface-card));
  border: 1px solid var(--border-default);
}

.note-ai-tasks .ai-tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.note-ai-tasks .ai-task-item {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-block);
}

.note-ai-tasks .task-content {
  color: var(--text-secondary);
}

.pin-icon-btn {
  position: static;
  margin-left: auto;
  flex-shrink: 0;
}
</style>
