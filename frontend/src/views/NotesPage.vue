<script setup>
import { ref, onMounted } from 'vue'
import NotesPanel from '../components/NotesPanel.vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const notes = ref([])

async function fetchNotes() {
  try {
    const res = await fetch(`${API_BASE}/notes`)
    notes.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch notes:', e)
  }
}

function onNotesRefreshed(data) {
  notes.value = data
}

onMounted(fetchNotes)
</script>

<template>
  <div class="page">
    <h1 class="page-title">Notes</h1>
    <NotesPanel @refreshed="onNotesRefreshed" />
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
