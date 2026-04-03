<script setup>
import { ref, onMounted } from 'vue'
import ProjectsPanel from '../components/ProjectsPanel.vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const projects = ref([])

async function fetchProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`)
    projects.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch projects:', e)
  }
}

function onProjectsRefreshed(data) {
  projects.value = data
}

onMounted(fetchProjects)
</script>

<template>
  <div class="page">
    <h1 class="page-title">Projects</h1>
    <ProjectsPanel :projects="projects" @refreshed="onProjectsRefreshed" />
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
