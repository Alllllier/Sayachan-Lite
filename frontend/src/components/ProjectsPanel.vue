<script setup>
import { ref, onMounted, defineEmits, defineProps, watch } from 'vue'
import { saveTask } from '../services/taskService.js'

const props = defineProps(['projects'])

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const projects = ref([])
const projectForm = ref({ name: '', summary: '', status: 'pending', nextAction: '' })
const editingProjectId = ref(null)
const loading = ref(false)
const error = ref(null)
const aiSuggestions = ref({})
const aiLoadingProjects = ref(new Set())
const savedSuggestions = ref(new Set())
const saveSuccessMessages = ref({})
const applyingFocus = ref(new Set())
const savingFocusAsTask = ref(new Set())

const emit = defineEmits(['refreshed'])

async function fetchProjects() {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/projects`)
    const fetchedProjects = await response.json()
    projects.value = fetchedProjects
    emit('refreshed', projects.value)
  } catch (e) {
    error.value = 'Failed to load projects'
  } finally {
    loading.value = false
  }
}

// Watch props.projects to sync from parent (App.vue refreshAllData)
watch(() => props.projects, (newProjects) => {
  if (Array.isArray(newProjects)) {
    projects.value = [...newProjects]
  }
}, { deep: true })

// Initial fetch from server if props.projects is empty
onMounted(() => {
  if (!props.projects || props.projects.length === 0) {
    fetchProjects()
  } else {
    projects.value = [...props.projects]
  }
})

async function createProject() {
  if (!projectForm.value.name.trim() || !projectForm.value.summary.trim()) return
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectForm.value)
    })
    const project = await response.json()
    projects.value.unshift(project)
    projectForm.value = { name: '', summary: '', status: 'pending', nextAction: '' }
    emit('refreshed', projects.value)
  } catch (e) {
    error.value = 'Failed to create project'
  } finally {
    loading.value = false
  }
}

async function updateProject(project) {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/projects/${project._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })
    const updated = await response.json()
    const index = projects.value.findIndex(p => p._id === project._id)
    if (index !== -1) projects.value[index] = updated
    editingProjectId.value = null
    emit('refreshed', projects.value)
  } catch (e) {
    error.value = 'Failed to update project'
  } finally {
    loading.value = false
  }
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return
  loading.value = true
  try {
    await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' })
    projects.value = projects.value.filter(p => p._id !== id)
    emit('refreshed', projects.value)
  } catch (e) {
    error.value = 'Failed to delete project'
  } finally {
    loading.value = false
  }
}

function startEditingProject(project) {
  editingProjectId.value = project._id
}

function cancelEditProject() {
  editingProjectId.value = null
}

async function handleAISuggest(project) {
  aiLoadingProjects.value.add(project._id)
  try {
    const response = await fetch(`${API_BASE}/ai/projects/next-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })
    const result = await response.json()
    aiSuggestions.value[project._id] = result.suggestions || []
  } catch (e) {
    aiSuggestions.value[project._id] = ['Failed to get AI suggestion']
  } finally {
    aiLoadingProjects.value.delete(project._id)
  }
}

async function saveSuggestionAsTask(projectId, suggestion) {
  if (savedSuggestions.value.has(suggestion)) {
    return
  }
  savedSuggestions.value.add(suggestion)
  const newTask = await saveTask(suggestion, 'project')
  if (newTask) {
    saveSuccessMessages.value[`${projectId}_focus`] = 'Focus saved as task'
    setTimeout(() => { delete saveSuccessMessages.value[`${projectId}_focus`] }, 2000)
  } else {
    savedSuggestions.value.delete(suggestion)
  }
}

async function saveCurrentFocusAsTask(project) {
  if (!project.nextAction || !project.nextAction.trim()) {
    return
  }
  savingFocusAsTask.value.add(project._id)
  try {
    const newTask = await saveTask(project.nextAction, 'project', 'focus')
    if (newTask) {
      saveSuccessMessages.value[`${project._id}_focus`] = 'Focus saved as task'
      setTimeout(() => { delete saveSuccessMessages.value[`${project._id}_focus`] }, 2000)
    }
  } catch (e) {
    error.value = 'Failed to save focus as task'
  } finally {
    savingFocusAsTask.value.delete(project._id)
  }
}

async function useAsCurrentFocus(project, suggestion) {
  applyingFocus.value.add(project._id)
  try {
    const projectToUpdate = {
      ...project,
      nextAction: suggestion,
      // Auto-move to in_progress if currently pending
      status: project.status === 'pending' ? 'in_progress' : project.status
    }
    const response = await fetch(`${API_BASE}/projects/${project._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectToUpdate)
    })
    const updated = await response.json()
    const index = projects.value.findIndex(p => p._id === project._id)
    if (index !== -1) projects.value[index] = updated
    emit('refreshed', projects.value)
  } catch (e) {
    error.value = 'Failed to update current focus'
  } finally {
    applyingFocus.value.delete(project._id)
  }
}

onMounted(fetchProjects)
</script>

<template>
  <div v-if="error" class="error">{{ error }}</div>

  <div class="projects-section">
    <h2>Projects ({{ projects.length }})</h2>
    <div v-if="projects.length === 0" class="empty">No projects yet</div>
    <div v-for="project in projects" :key="project._id" class="project-card">
      <div v-if="editingProjectId === project._id">
        <input v-model="project.name" placeholder="Project name" />
        <textarea v-model="project.summary" placeholder="Summary" rows="2"></textarea>
        <input v-model="project.nextAction" placeholder="Current focus" />
        <select v-model="project.status">
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        <div class="card-buttons">
          <button @click="updateProject(project)" :disabled="loading">Save</button>
          <button @click="cancelEditProject" :disabled="loading" class="cancel">Cancel</button>
        </div>
      </div>
      <div v-else>
        <h3>{{ project.name }}</h3>
        <p>{{ project.summary }}</p>
        <p class="meta">Status: {{ project.status }}</p>
        <div class="focus-row">
          <p class="meta">Current Focus: {{ project.nextAction || 'None' }}</p>
          <button v-if="project.nextAction" @click="saveCurrentFocusAsTask(project)" class="save-focus-btn" :disabled="savingFocusAsTask.has(project._id)">
            {{ savingFocusAsTask.has(project._id) ? 'Saving...' : 'Save Focus as Task' }}
          </button>
        </div>
        <p v-if="project.lastCompletedAction" class="meta last-completed">Last Completed: {{ project.lastCompletedAction }}</p>
        <div v-if="project.focusHistory && project.focusHistory.length > 0" class="focus-history">
          <p class="meta history-label">Focus History:</p>
          <ul class="history-list">
            <li v-for="(item, idx) in project.focusHistory.slice(-3).reverse()" :key="idx" class="history-item">
              {{ item }}
            </li>
          </ul>
        </div>
        <p class="meta">{{ new Date(project.createdAt).toLocaleString() }}</p>
        <div class="card-buttons">
          <button @click="startEditingProject(project)" class="edit-btn">Edit</button>
          <button @click="handleAISuggest(project)" class="continue-btn" :disabled="aiLoadingProjects.has(project._id)">
            {{ aiLoadingProjects.has(project._id) ? 'Generating...' : (project.nextAction ? 'Continue Project' : 'Generate Next Step') }}
          </button>
          <button @click="deleteProject(project._id)" class="delete-btn">Delete</button>
        </div>
        <div v-if="aiSuggestions[project._id] && aiSuggestions[project._id].length > 0" class="ai-suggestions">
          <div class="ai-suggestions-header">
            <strong>AI Suggestions ({{ aiSuggestions[project._id].length }})</strong>
            <span v-if="saveSuccessMessages[`${project._id}_focus`]" class="save-success">{{ saveSuccessMessages[`${project._id}_focus`] }}</span>
          </div>
          <div v-for="(suggestion, idx) in aiSuggestions[project._id]" :key="idx" :class="['ai-suggestion-item', { applied: project.nextAction === suggestion }]">
            <span class="suggestion-text">{{ suggestion }}</span>
            <div class="suggestion-actions">
              <button @click="useAsCurrentFocus(project, suggestion)" class="use-focus-btn" :disabled="applyingFocus.has(project._id) || project.nextAction === suggestion">
                {{ project.nextAction === suggestion ? 'Applied' : (applyingFocus.has(project._id) ? 'Setting...' : 'Use as Current Focus') }}
              </button>
              <button @click="saveSuggestionAsTask(project._id, suggestion)" class="save-suggestion-btn" :disabled="savedSuggestions.has(suggestion)">
                {{ savedSuggestions.has(suggestion) ? 'Saved' : 'Save as Task' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="form-section project-form">
    <h2>New Project</h2>
    <input v-model="projectForm.name" placeholder="Project name" />
    <textarea v-model="projectForm.summary" placeholder="Summary" rows="2"></textarea>
    <input v-model="projectForm.nextAction" placeholder="Current focus" />
    <select v-model="projectForm.status">
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="on_hold">On Hold</option>
    </select>
    <button @click="createProject" :disabled="loading">Add Project</button>
  </div>
</template>

<style scoped>
.projects-section, .project-form {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background: #f9f9f9;
  margin-bottom: 24px;
}

.projects-section h2, .project-form h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

input, textarea, select {
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

.focus-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 8px;
}

.focus-row .meta {
  margin: 0;
  flex: 1;
}

.save-focus-btn {
  padding: 4px 12px;
  font-size: 11px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 8px;
  flex-shrink: 0;
}

.save-focus-btn:hover:not(:disabled) {
  background: #36a372;
}

.card-buttons {
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

.edit-btn {
  background: #95a5a6;
}

.edit-btn:hover:not(:disabled) {
  background: #7f8c8d;
}

.continue-btn {
  background: #9b59b6;
}

.continue-btn:hover:not(:disabled) {
  background: #8e44ad;
}

.delete-btn {
  background: #e74c3c;
}

.delete-btn:hover:not(:disabled) {
  background: #c0392b;
}

button.cancel {
  background: #999;
}

button.cancel:hover:not(:disabled) {
  background: #777;
}

.ai-suggestions {
  margin-top: 12px;
  padding: 10px;
  background: #f0e6ff;
  border-radius: 4px;
  font-size: 13px;
  color: #6b3fa0;
}

.ai-suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.save-success {
  color: #10b981;
  font-size: 11px;
}

.ai-suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 6px;
}

.ai-suggestion-item:last-child {
  margin-bottom: 0;
}

.ai-suggestion-item.applied {
  background: #e8f5e9;
  border-left: 2px solid #4caf50;
}

.suggestion-text {
  flex: 1;
  font-size: 12px;
  color: #555;
}

.suggestion-actions {
  display: flex;
  gap: 6px;
  margin-left: 8px;
}

.use-focus-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.use-focus-btn:hover:not(:disabled) {
  background: #2980b9;
}

.save-suggestion-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.save-suggestion-btn:hover:not(:disabled) {
  background: #36a372;
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

.project-card {
  background: white;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  border-left: 3px solid #3498db;
}

.project-card h3 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
}

.project-card p {
  font-size: 14px;
  color: #555;
  margin: 0 0 8px;
}

.project-card .meta {
  font-size: 12px;
  color: #999;
}

.focus-history {
  margin: 8px 0;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.history-label {
  margin: 0 0 6px;
  font-weight: 500;
  color: #666;
}

.history-list {
  margin: 0;
  padding-left: 18px;
  list-style-type: disc;
}

.history-item {
  color: #555;
  margin-bottom: 3px;
  line-height: 1.4;
}

.history-item:last-child {
  margin-bottom: 0;
}
</style>
