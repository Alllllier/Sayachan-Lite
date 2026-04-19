<script setup>
import { ref, reactive, onMounted, defineEmits, nextTick } from 'vue'
import { basicSetup } from 'codemirror'
import { EditorView } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import 'highlight.js/styles/github.css'
import { renderMarkdown } from '../utils/markdown.js'
import { saveTask } from '../services/taskService.js'
import Toast from './ui/Toast.vue'
import EmptyState from './ui/EmptyState.vue'

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
    'ai',           // creationMode
    'note',         // originModule
    note._id,       // originId
    note.title,      // originLabel
    null,            // linkedProjectId
    ''               // linkedProjectName
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
    <div class="form-buttons">
      <button @click="createNote" :disabled="loading || editingId" class="btn btn-primary">
        {{ loading ? 'Saving...' : 'Add Note' }}
      </button>
      <button v-if="editingId" @click="cancelEdit" :disabled="loading" class="btn btn-secondary cancel">
        Cancel
      </button>
    </div>
  </div>

  <div class="notes-section">
    <div class="section-header">
      <h2>Notes ({{ notes.length }})</h2>
      <div class="archive-toggle">
        <button
          @click="showArchived = false; fetchNotes()"
          :class="['toggle-btn', { active: !showArchived }]"
        >Active</button>
        <button
          @click="showArchived = true; fetchNotes()"
          :class="['toggle-btn', { active: showArchived }]"
        >Archived</button>
      </div>
    </div>
    <EmptyState v-if="notes.length === 0" :title="showArchived ? 'No archived notes' : 'No notes yet'" />
    <div v-for="note in notes" :key="note._id" :class="['card', 'card-accent-green', 'note-card', { archived: note.status === 'archived' }]" @click="closeNoteMenu">
      <div v-if="note.status === 'archived'" class="archived-badge">Archived</div>
      <button
        v-else
        @click="note.isPinned ? unpinNote(note) : pinNote(note)"
        class="pin-icon-btn"
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
      <div v-if="editingId === note._id && note.status !== 'archived'">
        <input v-model="note.title" placeholder="Title" class="input" />
        <div :ref="el => bindEditEditor(el, note)" class="codemirror-editor"></div>
        <div class="card-buttons">
          <button @click="cancelEdit(note)" :disabled="loading" class="btn btn-secondary cancel">Cancel</button>
          <button @click="updateNote(note)" :disabled="loading" class="btn btn-primary">Save</button>
        </div>
      </div>
      <div v-else>
        <h3 class="card-title">{{ note.title }}</h3>
        <div class="card-content markdown-body" v-html="renderMarkdown(note.content)"></div>
        <p class="card-meta">{{ new Date(note.updatedAt).toLocaleString() }}</p>
        <div class="card-buttons">
          <template v-if="note.status === 'archived'">
            <button @click="restoreNote(note)" class="btn btn-primary">Restore</button>
            <button @click="deleteNote(note._id)" class="btn btn-danger delete">Delete</button>
          </template>
          <template v-else>
            <div class="task-menu-container">
              <button @click.stop="toggleNoteMenu(note._id)" class="task-menu-btn" :class="{ active: menuOpenNoteId === note._id }" title="Actions">
                <span class="menu-icon">⋮</span>
              </button>
              <div v-if="menuOpenNoteId === note._id" class="task-menu-dropdown" @click.stop>
                <button @click="startEditing(note)" class="menu-item">Edit</button>
                <button @click="archiveNote(note)" class="menu-item">Archive</button>
                <button @click="deleteNote(note._id)" class="menu-item delete">Delete</button>
              </div>
            </div>
            <button @click.stop="handleAIGenerateTasks(note)" class="btn-ai-icon" :disabled="aiLoadingNotes.has(note._id)" title="Generate with AI">
              <span v-if="aiLoadingNotes.has(note._id)" class="icon-loading">⋯</span>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            </button>
          </template>
        </div>
        <!-- AI Tasks - Hidden for archived notes -->
        <div v-if="note.status !== 'archived' && aiTasksByNote[note._id] && aiTasksByNote[note._id].length > 0" class="ai-tasks">
          <div class="ai-tasks-header">
            <strong>AI Tasks ({{ aiTasksByNote[note._id].length }})</strong>
            <div class="ai-tasks-actions">
              <button @click="closeAITasks(note._id)" class="btn-ai-dismiss" title="Close">×</button>
            </div>
          </div>
          <div v-for="(draft, idx) in aiTasksByNote[note._id]" :key="idx" class="ai-task-item">
            <div class="task-content">{{ draft }}</div>
            <div class="task-actions">
              <button @click="saveNoteTaskDraft(note._id, draft)" class="btn btn-secondary btn-sm" :disabled="savedTaskDrafts.has(draft)">
                {{ savedTaskDrafts.has(draft) ? 'Saved' : 'Save as Task' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-section, .notes-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background: #f9f9f9;
  margin-bottom: 24px;
}

/* Editor container spacing */
.codemirror-editor {
  margin-bottom: var(--space-md);
}

.form-section h2, .notes-section h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

/* Archive Toggle - Uses semantic tokens */
.archive-toggle {
  display: flex;
  gap: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-default);
}

.toggle-btn {
  padding: 6px 12px;
  font-size: var(--font-size-sm);
  border: none;
  background: var(--surface-panel);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.toggle-btn:hover {
  background: var(--surface-hover);
}

.toggle-btn.active {
  background: var(--action-primary);
  color: var(--text-inverse);
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

.archived-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--text-muted);
  color: var(--text-inverse);
  padding: var(--space-xs) 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Pin Icon Button - Top right, no border */
.pin-icon-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.15s;
}

.pin-icon-btn:hover {
  color: var(--action-primary);
  background: var(--surface-hover);
}

.pin-icon-btn.pinned {
  color: var(--action-primary);
  background: rgba(66, 184, 131, 0.1);
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

.ai-tasks {
  margin-top: 12px;
  padding: 10px;
  background: #f0e6ff;
  border-radius: 4px;
  font-size: 13px;
  color: #6b3fa0;
}

.ai-tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ai-tasks-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-success {
  color: #10b981;
  font-size: 11px;
}

.btn-ai-dismiss {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(107, 63, 160, 0.15);
  color: #6b3fa0;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.btn-ai-dismiss:hover {
  background: rgba(107, 63, 160, 0.25);
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

/* .note-card uses .card and .card-accent-green baseline */

/* Markdown display uses global .markdown-body baseline from style.css */

/* Task Menu - Overflow pattern */
.task-menu-container {
  position: relative;
  margin-left: 4px;
}

.task-menu-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: background 0.15s;
}

.task-menu-btn:hover {
  background: #f5f5f5;
}

.task-menu-btn.active {
  background: #e5e5e5;
}

.menu-icon {
  font-size: 18px;
  line-height: 1;
}

.task-menu-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 10;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  padding: 10px 16px;
  background: white;
  border: none;
  text-align: left;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.delete {
  color: #dc2626;
}

.menu-item.delete:hover {
  background: #fee2e2;
}
</style>
