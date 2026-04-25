<script setup>
import { ref, onMounted } from 'vue'
import Dashboard from '../components/Dashboard.vue'
import { Panel } from '../components/ui/shell'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const projects = ref([])

async function refreshAllData() {
  try {
    const projectsRes = await fetch(`${API_BASE}/projects`)
    projects.value = await projectsRes.json()
  } catch (e) {
    console.error('Failed to fetch data:', e)
  }
}

onMounted(refreshAllData)
</script>

<template>
  <Panel title="Dashboard">
    <Dashboard :projects="projects" @refreshed="refreshAllData" />
  </Panel>
</template>
