<script setup>
import { ref, reactive, onMounted, defineEmits } from 'vue'
import { saveTask } from '../services/taskService.js'
import Toast from './ui/Toast.vue'
import EmptyState from './ui/EmptyState.vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const notes = ref([])
const form = ref({ title: '', content: '' })
const editingId = ref(null)
const loading = ref(false)
const error = ref(null)
const aiTasksByNote = reactive({})
const aiLoadingNotes = ref(new Set())
const savedTaskDrafts = ref(new Set())
const taskSuccessMessages = reactive({})

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

// Local draft cache
const drafts = ref(JSON.parse(localStorage.getItem('sayachan_note_drafts') || '{}'))

function saveDraft() {
  localStorage.setItem('sayachan_note_drafts', JSON.stringify(drafts.value))
}

function clearDraft() {
  drafts.value = {}
  localStorage.removeItem('sayachan_note_drafts')
}
const formTextareaRef = ref(null)
const editTextareaRefs = ref({})

const emit = defineEmits(['refreshed'])

async function fetchNotes() {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/notes`)
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
    emit('refreshed', notes.value)
    showToast('Note saved')
    // Auto-grow reset textarea
    if (formTextareaRef.value) {
      setTimeout(() => {
        formTextareaRef.value.style.height = 'auto'
      }, 0)
    }
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

function startEditing(note) {
  editingId.value = note._id
  // Auto-grow after ref is set
  setTimeout(() => {
    const textarea = editTextareaRefs.value[note._id]
    if (textarea) {
      autoGrow(textarea)
    }
  }, 0)
}

function cancelEdit() {
  editingId.value = null
}

function autoGrow(textarea) {
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

function onInput(e) {
  autoGrow(e.target)
}

onMounted(() => {
  fetchNotes()
  // Auto-grow initial form textarea
  if (formTextareaRef.value) {
    autoGrow(formTextareaRef.value)
  }
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
    taskSuccessMessages[noteId] = 'Task saved'
    setTimeout(() => { delete taskSuccessMessages[noteId] }, 2000)
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
    <textarea
      ref="formTextareaRef"
      v-model="form.content"
      placeholder="Content"
      rows="3"
      class="textarea auto-grow-textarea"
      @input="onInput"
    ></textarea>
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
    <h2>Notes ({{ notes.length }})</h2>
    <EmptyState v-if="notes.length === 0" title="No notes yet" />
    <div v-for="note in notes" :key="note._id" class="card card-accent-green note-card">
      <div v-if="editingId === note._id">
        <input v-model="note.title" placeholder="Title" class="input" />
        <textarea
          :ref="el => { if (el) editTextareaRefs[note._id] = el }"
          v-model="note.content"
          placeholder="Content"
          rows="3"
          class="textarea auto-grow-textarea"
          @input="onInput"
        ></textarea>
        <div class="card-buttons">
          <button @click="updateNote(note)" :disabled="loading" class="btn btn-primary">Save</button>
          <button @click="cancelEdit" :disabled="loading" class="btn btn-secondary cancel">Cancel</button>
        </div>
      </div>
      <div v-else>
        <h3 class="card-title">{{ note.title }}</h3>
        <p class="card-content">{{ note.content }}</p>
        <p class="card-meta">{{ new Date(note.createdAt).toLocaleString() }}</p>
        <div class="card-buttons">
          <button @click="startEditing(note)" class="btn btn-secondary">Edit</button>
          <button @click="deleteNote(note._id)" class="btn btn-danger delete">Delete</button>
          <button @click="handleAIGenerateTasks(note)" class="btn-ai-icon" :disabled="aiLoadingNotes.has(note._id)" title="Generate with AI">
            <span v-if="aiLoadingNotes.has(note._id)" class="icon-loading">⋯</span>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </button>
        </div>
        <div v-if="aiTasksByNote[note._id] && aiTasksByNote[note._id].length > 0" class="ai-tasks">
          <div class="ai-tasks-header">
            <strong>AI Tasks ({{ aiTasksByNote[note._id].length }})</strong>
            <span v-if="taskSuccessMessages[note._id]" class="save-success">{{ taskSuccessMessages[note._id] }}</span>
          </div>
          <div v-for="(draft, idx) in aiTasksByNote[note._id]" :key="idx" class="ai-task-item">
            <span class="task-draft-title">{{ draft }}</span>
            <button @click="saveNoteTaskDraft(note._id, draft)" class="btn btn-primary btn-sm save-task-btn" :disabled="savedTaskDrafts.has(draft)">
              {{ savedTaskDrafts.has(draft) ? 'Saved' : 'Save as Task' }}
            </button>
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

.form-section h2, .notes-section h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.auto-grow-textarea {
  transition: height 0.1s ease;
}

.form-buttons, .card-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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

.save-success {
  color: #10b981;
  font-size: 11px;
}

.ai-task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 4px;
}

.ai-task-item:last-child {
  margin-bottom: 0;
}

.task-draft-title {
  flex: 1;
  font-size: 12px;
  color: #555;
}

/* .save-task-btn uses global .btn .btn-primary .btn-sm */

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

</style>
