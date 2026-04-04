<script setup>
import { ref, onMounted, defineEmits, defineProps, watch } from 'vue'
import { saveTask, fetchProjectTasks } from '../services/taskService.js'

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
const manualTaskProjects = ref(new Set())
const addingManualTasks = ref(new Set())
const manualTaskInputs = ref({})
const manualTaskSuccess = ref({})
const formSummaryTextareaRef = ref(null)
const editSummaryTextareaRefs = ref({})
const editFocusInputRefs = ref({})
const projectTasks = ref({})
const loadingProjectTasks = ref(new Set())

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
    // Fetch tasks for all projects
    projects.value.forEach(project => {
      if (!projectTasks.value[project._id]) {
        fetchProjectTasksForCard(project._id)
      }
    })
  }
}, { deep: true })

async function createProject() {
  if (!projectForm.value.name.trim() || !projectForm.value.summary.trim()) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectForm.value)
    })
    if (!response.ok) throw new Error('Create failed')
    const project = await response.json()
    projects.value.unshift(project)
    projectForm.value = { name: '', summary: '', status: 'pending', nextAction: '' }
    emit('refreshed', projects.value)
    showToast('Project created')
    // Auto-grow reset textarea
    if (formSummaryTextareaRef.value) {
      setTimeout(() => {
        formSummaryTextareaRef.value.style.height = 'auto'
      }, 0)
    }
    // Initialize empty task list for new project
    projectTasks.value[project._id] = []
  } catch (e) {
    showToast('Failed to create project. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function updateProject(project) {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/projects/${project._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })
    if (!response.ok) throw new Error('Update failed')
    const updated = await response.json()
    const index = projects.value.findIndex(p => p._id === project._id)
    if (index !== -1) projects.value[index] = updated
    editingProjectId.value = null
    emit('refreshed', projects.value)
    showToast('Project updated')
  } catch (e) {
    showToast('Failed to update project. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Delete failed')
    projects.value = projects.value.filter(p => p._id !== id)
    emit('refreshed', projects.value)
    showToast('Project deleted')
  } catch (e) {
    showToast('Failed to delete project. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

function startEditingProject(project) {
  editingProjectId.value = project._id
  // Auto-grow after refs are set
  setTimeout(() => {
    const textarea = editSummaryTextareaRefs.value[project._id]
    if (textarea) {
      autoGrow(textarea)
    }
  }, 0)
}

function autoGrow(textarea) {
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

function onInput(e) {
  autoGrow(e.target)
}

onMounted(async () => {
  fetchProjects()
  if (!props.projects || props.projects.length === 0) {
    await fetchProjects()
  } else {
    projects.value = [...props.projects]
  }
  // Fetch tasks for all projects
  projects.value.forEach(project => {
    fetchProjectTasksForCard(project._id)
  })
  // Auto-grow initial form textarea
  if (formSummaryTextareaRef.value) {
    autoGrow(formSummaryTextareaRef.value)
  }
})

function cancelEditProject() {
  editingProjectId.value = null
}

async function fetchProjectTasksForCard(projectId) {
  loadingProjectTasks.value.add(projectId)
  try {
    const tasks = await fetchProjectTasks(projectId)
    projectTasks.value[projectId] = tasks
  } catch (e) {
    console.error('Failed to fetch project tasks:', e)
    projectTasks.value[projectId] = []
  } finally {
    loadingProjectTasks.value.delete(projectId)
  }
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
  const project = projects.value.find(p => p._id === projectId)
  const newTask = await saveTask(
    suggestion,
    'ai',           // creationMode
    'project',       // originModule
    projectId,         // originId
    project?.name || '',  // originLabel
    projectId,          // linkedProjectId
    project?.name || ''   // linkedProjectName
  )
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
    const newTask = await saveTask(
      project.nextAction,
      'ai',           // Focus is likely AI suggested, treat as ai
      'project',       // originModule
      project._id,       // originId
      project.name || '',  // originLabel
      project._id,          // linkedProjectId
      project.name || ''   // linkedProjectName
    )
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

function toggleManualTaskInput(projectId) {
  if (manualTaskProjects.value.has(projectId)) {
    manualTaskProjects.value.delete(projectId)
    delete manualTaskInputs.value[projectId]
  } else {
    manualTaskProjects.value.add(projectId)
    manualTaskInputs.value[projectId] = ''
  }
}

async function addManualTask(project) {
  const taskTitle = manualTaskInputs.value[project._id]?.trim()
  if (!taskTitle) return

  addingManualTasks.value.add(project._id)
  try {
    const newTask = await saveTask(
      taskTitle,
      'manual',        // creationMode
      'project',       // originModule
      project._id,       // originId
      project.name,      // originLabel
      project._id,          // linkedProjectId
      project.name         // linkedProjectName
    )
    if (newTask) {
      manualTaskSuccess.value[project._id] = 'Task added'
      manualTaskProjects.value.delete(project._id)
      delete manualTaskInputs.value[project._id]
      // Refresh project tasks
      await fetchProjectTasksForCard(project._id)
      setTimeout(() => { delete manualTaskSuccess.value[project._id] }, 2000)
    }
  } catch (e) {
    error.value = 'Failed to add task'
  } finally {
    addingManualTasks.value.delete(project._id)
  }
}
</script>

<template>
  <!-- Toast Notification -->
  <div v-if="toast" class="toast" :class="toastType">
    {{ toastMessage }}
  </div>

  <div v-if="error" class="error">{{ error }}</div>

  <div class="projects-section">
    <h2>Projects ({{ projects.length }})</h2>
    <div v-if="projects.length === 0" class="empty">No projects yet</div>
    <div v-for="project in projects" :key="project._id" class="project-card">
      <div v-if="editingProjectId === project._id">
        <input v-model="project.name" placeholder="Project name" />
        <textarea
          :ref="el => { if (el) editSummaryTextareaRefs[project._id] = el }"
          v-model="project.summary"
          placeholder="Summary"
          rows="2"
          class="auto-grow-textarea"
          @input="onInput"
        ></textarea>
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

        <!-- Project Tasks Preview -->
        <div v-if="projectTasks[project._id] && projectTasks[project._id].length > 0" class="project-tasks-preview">
          <div class="tasks-preview-header">
            <span class="tasks-preview-title">Tasks ({{ projectTasks[project._id].length }})</span>
          </div>
          <div class="tasks-preview-list">
            <div
              v-for="task in projectTasks[project._id].slice(0, 3)"
              :key="task._id"
              class="task-preview-item"
              :class="{ completed: task.completed }"
            >
              <span class="task-preview-text">{{ task.title }}</span>
            </div>
          </div>
        </div>

        <!-- Main Action: Add Task -->
        <div class="card-buttons main-actions">
          <button @click="toggleManualTaskInput(project._id)" class="add-task-btn primary">
            {{ manualTaskProjects.has(project._id) ? 'Cancel' : '+ Add Task' }}
          </button>
        </div>

        <!-- Manual Task Input -->
        <div v-if="manualTaskProjects.has(project._id)" class="manual-task-input">
          <input
            v-model="manualTaskInputs[project._id]"
            placeholder="Task title..."
            @keyup.enter="addManualTask(project)"
            :disabled="addingManualTasks.has(project._id)"
            class="task-input"
          />
          <div class="manual-task-actions">
            <button @click="addManualTask(project)" class="save-task-btn" :disabled="addingManualTasks.has(project._id)">
              {{ addingManualTasks.has(project._id) ? 'Saving...' : 'Save' }}
            </button>
            <div v-if="manualTaskSuccess[project._id]" class="manual-task-success">{{ manualTaskSuccess[project._id] }}</div>
          </div>
        </div>

        <!-- Secondary Actions -->
        <div class="card-buttons secondary-actions">
          <button @click="startEditingProject(project)" class="secondary-btn">Edit</button>
          <button @click="deleteProject(project._id)" class="secondary-btn delete-btn">Delete</button>
          <button @click="handleAISuggest(project)" class="secondary-btn ai-btn" :disabled="aiLoadingProjects.has(project._id)" title="AI Assistant">
            <span v-if="aiLoadingProjects.has(project._id)" class="icon-loading">⋯</span>
            <span v-else>✨</span>
          </button>
        </div>

        <!-- AI Suggestions Block -->
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
    <textarea
      ref="formSummaryTextareaRef"
      v-model="projectForm.summary"
      placeholder="Summary"
      rows="2"
      class="auto-grow-textarea"
      @input="onInput"
    ></textarea>
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
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  animation: slideUp 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 90%;
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

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
  resize: none;
  overflow-y: hidden;
  min-height: 60px;
  max-height: 300px;
  line-height: 1.5;
}

.auto-grow-textarea {
  transition: height 0.1s ease;
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

.main-actions {
  margin-top: 12px;
}

.secondary-actions {
  margin-top: 8px;
  justify-content: flex-end;
}

.secondary-btn {
  padding: 8px 16px;
  font-size: 13px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.secondary-btn:hover:not(:disabled) {
  background: #e5e5e5;
  color: #333;
}

.secondary-btn.delete-btn {
  color: white;
  background: #dc2626;
  border-color: #dc2626;
}

.secondary-btn.delete-btn:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
}

.secondary-btn.ai-btn {
  background: #DAA520;
  color: white;
  border-color: #DAA520;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
}

.secondary-btn.ai-btn:hover:not(:disabled) {
  background: #c5931a;
  border-color: #c5931a;
}

.secondary-btn.ai-btn:disabled {
  background: #e5e5e5;
  color: #999;
  border-color: #e5e5e5;
  cursor: not-allowed;
}

.secondary-btn.ai-btn span {
  font-size: 14px;
  line-height: 1;
}

.icon-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

.add-task-btn {
  background: #42b883;
  width: 100%;
}

.add-task-btn.primary {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
}

.add-task-btn:hover:not(:disabled) {
  background: #36a372;
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

.project-tasks-preview {
  margin-top: 12px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.tasks-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tasks-preview-title {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.tasks-preview-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-preview-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  border-left: 2px solid #42b883;
}

.task-preview-item.completed {
  opacity: 0.6;
  text-decoration: line-through;
  border-left-color: #ccc;
}

.task-preview-text {
  flex: 1;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manual-task-input {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.task-input {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
}

.task-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.manual-task-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.save-task-btn {
  padding: 6px 16px;
  font-size: 12px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-task-btn:hover:not(:disabled) {
  background: #36a372;
}

.save-task-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.manual-task-success {
  margin-top: 8px;
  color: #10b981;
  font-size: 11px;
}
</style>
