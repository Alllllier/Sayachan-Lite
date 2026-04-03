<script setup>
import { ref, reactive, onMounted, defineEmits } from 'vue'
import { saveTask } from '../services/taskService.js'

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
  try {
    const response = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const note = await response.json()
    notes.value.unshift(note)
    form.value = { title: '', content: '' }
    emit('refreshed', notes.value)
  } catch (e) {
    error.value = 'Failed to create note'
  } finally {
    loading.value = false
  }
}

async function updateNote(note) {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/notes/${note._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: note.title, content: note.content })
    })
    const updated = await response.json()
    const index = notes.value.findIndex(n => n._id === note._id)
    if (index !== -1) notes.value[index] = updated
    editingId.value = null
    emit('refreshed', notes.value)
  } catch (e) {
    error.value = 'Failed to update note'
  } finally {
    loading.value = false
  }
}

async function deleteNote(id) {
  if (!confirm('Delete this note?')) return
  loading.value = true
  try {
    await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' })
    notes.value = notes.value.filter(n => n._id !== id)
    emit('refreshed', notes.value)
  } catch (e) {
    error.value = 'Failed to delete note'
  } finally {
    loading.value = false
  }
}

function startEditing(note) {
  editingId.value = note._id
}

function cancelEdit() {
  editingId.value = null
}

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
  const newTask = await saveTask(draft, 'note')
  if (newTask) {
    taskSuccessMessages[noteId] = 'Task saved'
    setTimeout(() => { delete taskSuccessMessages[noteId] }, 2000)
  } else {
    savedTaskDrafts.value.delete(draft)
  }
}

onMounted(fetchNotes)
</script>

<template>
  <div v-if="error" class="error">{{ error }}</div>

  <div class="form-section">
    <h2>{{ editingId ? 'Edit Note' : 'New Note' }}</h2>
    <input v-model="form.title" placeholder="Title" />
    <textarea v-model="form.content" placeholder="Content" rows="4"></textarea>
    <div class="form-buttons">
      <button @click="createNote" :disabled="loading || editingId">
        {{ loading ? 'Saving...' : 'Add Note' }}
      </button>
      <button v-if="editingId" @click="cancelEdit" :disabled="loading" class="cancel">
        Cancel
      </button>
    </div>
  </div>

  <div class="notes-section">
    <h2>Notes ({{ notes.length }})</h2>
    <div v-if="notes.length === 0" class="empty">No notes yet</div>
    <div v-for="note in notes" :key="note._id" class="note-card">
      <div v-if="editingId === note._id">
        <input v-model="note.title" placeholder="Title" />
        <textarea v-model="note.content" placeholder="Content" rows="3"></textarea>
        <div class="card-buttons">
          <button @click="updateNote(note)" :disabled="loading">Save</button>
          <button @click="cancelEdit" :disabled="loading" class="cancel">Cancel</button>
        </div>
      </div>
      <div v-else>
        <h3>{{ note.title }}</h3>
        <p>{{ note.content }}</p>
        <p class="meta">{{ new Date(note.createdAt).toLocaleString() }}</p>
        <div class="card-buttons">
          <button @click="startEditing(note)">Edit</button>
          <button @click="deleteNote(note._id)" class="delete">Delete</button>
          <button @click="handleAIGenerateTasks(note)" class="ai-btn" :disabled="aiLoadingNotes.has(note._id)">
            {{ aiLoadingNotes.has(note._id) ? 'Generating...' : 'AI Tasks' }}
          </button>
        </div>
        <div v-if="aiTasksByNote[note._id] && aiTasksByNote[note._id].length > 0" class="ai-tasks">
          <div class="ai-tasks-header">
            <strong>AI Tasks ({{ aiTasksByNote[note._id].length }})</strong>
            <span v-if="taskSuccessMessages[note._id]" class="save-success">{{ taskSuccessMessages[note._id] }}</span>
          </div>
          <div v-for="(draft, idx) in aiTasksByNote[note._id]" :key="idx" class="ai-task-item">
            <span class="task-draft-title">{{ draft }}</span>
            <button @click="saveNoteTaskDraft(note._id, draft)" class="save-task-btn" :disabled="savedTaskDrafts.has(draft)">
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

input, textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

.form-buttons, .card-buttons {
  display: flex;
  gap: 8px;
}

button {
  padding: 10px 20px;
  font-size: 14px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #36a372;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button.cancel {
  background: #999;
}

button.cancel:hover:not(:disabled) {
  background: #777;
}

button.delete {
  background: #e74c3c;
}

button.delete:hover:not(:disabled) {
  background: #c0392b;
}

button.ai-btn {
  background: #9b59b6;
}

button.ai-btn:hover:not(:disabled) {
  background: #8e44ad;
}

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

.save-task-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.save-task-btn:hover {
  background: #36a372;
}

.save-task-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.empty {
  color: #999;
  padding: 20px;
  text-align: center;
}

.error {
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.note-card {
  background: white;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  border-left: 3px solid #42b883;
}

.note-card h3 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
}

.note-card p {
  font-size: 14px;
  color: #555;
  margin: 0 0 8px;
  white-space: pre-wrap;
}

.note-card .meta {
  font-size: 12px;
  color: #999;
}

</style>
