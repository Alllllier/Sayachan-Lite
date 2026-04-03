<script setup>
import { ref, onMounted } from 'vue'
import Dashboard from '../components/Dashboard.vue'

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
  <div class="page">
    <h1 class="page-title">Dashboard</h1>
    <Dashboard :notes="notes" :projects="projects" @refreshed="refreshAllData" />
  </div>
</template>

<style scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.page-title {
  font-size: 24px;
  margin: 0 0 20px;
  color: #333;
}
</style>
