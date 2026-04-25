<script setup>
import { ref, onMounted } from 'vue'
import Dashboard from '../components/Dashboard.vue'
import { Panel } from '../components/ui/shell'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const notes = ref([])
const projects = ref([])

async function refreshAllData() {
  try {
    const [notesRes, projectsRes] = await Promise.all([
      fetch(`${API_BASE}/notes`),
      fetch(`${API_BASE}/projects`)
    ])
    notes.value = await notesRes.json()
    projects.value = await projectsRes.json()
  } catch (e) {
    console.error('Failed to fetch data:', e)
  }
}

onMounted(refreshAllData)
</script>

<template>
  <Panel title="Dashboard">
    <Dashboard :notes="notes" :projects="projects" @refreshed="refreshAllData" />
  </Panel>
</template>
