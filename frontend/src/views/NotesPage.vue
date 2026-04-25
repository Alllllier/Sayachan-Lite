<script setup>
import { ref, onMounted } from 'vue'
import NotesPanel from '../components/NotesPanel.vue'
import { Panel } from '../components/ui/shell'

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
  <Panel title="Notes">
    <NotesPanel @refreshed="onNotesRefreshed" />
  </Panel>
</template>
