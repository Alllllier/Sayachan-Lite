import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Temporary cockpit UI signals store.
 *
 * Holds lightweight, UI-visible work态势 signals for app-level chat context.
 * This is NOT a formal context architecture — it is a thin bridge
 * to restore dashboard awareness to the global chat surface.
 */

export const useCockpitSignals = defineStore('cockpitSignals', () => {
  const activeProjectsCount = ref(0)
  const activeTasksCount = ref(0)
  const pinnedProjectName = ref('')
  const currentNextAction = ref('')
  const hasHydrated = ref(false)

  function setSignals(payload) {
    if (payload && typeof payload === 'object') {
      if (typeof payload.activeProjectsCount === 'number') {
        activeProjectsCount.value = payload.activeProjectsCount
      }
      if (typeof payload.activeTasksCount === 'number') {
        activeTasksCount.value = payload.activeTasksCount
      }
      if (typeof payload.pinnedProjectName === 'string') {
        pinnedProjectName.value = payload.pinnedProjectName
      }
      if (typeof payload.currentNextAction === 'string') {
        currentNextAction.value = payload.currentNextAction
      }
    }
    hasHydrated.value = true
  }

  function resetSignals() {
    activeProjectsCount.value = 0
    activeTasksCount.value = 0
    pinnedProjectName.value = ''
    currentNextAction.value = ''
    hasHydrated.value = false
  }

  return {
    activeProjectsCount,
    activeTasksCount,
    pinnedProjectName,
    currentNextAction,
    hasHydrated,
    setSignals,
    resetSignals,
  }
})
