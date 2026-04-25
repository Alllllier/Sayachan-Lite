<script setup>
import { ref, onMounted } from 'vue'
import ProjectsPanel from '../components/ProjectsPanel.vue'
import { Panel } from '../components/ui/shell'

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
  <Panel title="Projects">
    <ProjectsPanel :projects="projects" @refreshed="onProjectsRefreshed" />
  </Panel>
</template>
