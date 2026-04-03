<script setup>
import { ref, onMounted } from 'vue'
import Dashboard from './components/Dashboard.vue'
import NotesPanel from './components/NotesPanel.vue'
import ProjectsPanel from './components/ProjectsPanel.vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const notes = ref([])
const projects = ref([])

async function fetchNotes() {
  try {
    const res = await fetch(`${API_BASE}/notes`)
    notes.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch notes:', e)
  }
}

async function fetchProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`)
    projects.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch projects:', e)
  }
}

async function refreshAllData() {
  await fetchNotes()
  await fetchProjects()
}

function onNotesRefreshed(data) {
  notes.value = data
}

function onProjectsRefreshed(data) {
  projects.value = data
}

// Initial fetch
onMounted(refreshAllData)
</script>

<template>
  <div class="app">
    <h1>Sayachan Lite</h1>
    <p class="subtitle">轻量级个人生产力工具</p>

    <Dashboard :notes="notes" :projects="projects" @refreshed="refreshAllData" />

    <NotesPanel @refreshed="onNotesRefreshed" />

    <ProjectsPanel :projects="projects" @refreshed="onProjectsRefreshed" />
  </div>
</template>

<style scoped>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: #333;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 40px;
}
</style>
