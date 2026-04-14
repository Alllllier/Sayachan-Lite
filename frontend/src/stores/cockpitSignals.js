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

  function setSignals(partialOrFullSignals) {
    if (partialOrFullSignals && typeof partialOrFullSignals === 'object') {
      if (typeof partialOrFullSignals.activeProjectsCount === 'number') {
        activeProjectsCount.value = partialOrFullSignals.activeProjectsCount
      }
      if (typeof partialOrFullSignals.activeTasksCount === 'number') {
        activeTasksCount.value = partialOrFullSignals.activeTasksCount
      }
      if (typeof partialOrFullSignals.pinnedProjectName === 'string') {
        pinnedProjectName.value = partialOrFullSignals.pinnedProjectName
      }
      if (typeof partialOrFullSignals.currentNextAction === 'string') {
        currentNextAction.value = partialOrFullSignals.currentNextAction
      }
    }
  }

  function resetSignals() {
    activeProjectsCount.value = 0
    activeTasksCount.value = 0
    pinnedProjectName.value = ''
    currentNextAction.value = ''
  }

  return {
    activeProjectsCount,
    activeTasksCount,
    pinnedProjectName,
    currentNextAction,
    setSignals,
    resetSignals,
  }
})
