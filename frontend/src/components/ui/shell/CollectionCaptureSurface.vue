<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  titleId: string
  closeLabel: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="collection-capture-overlay"
      @click.self="emit('close')"
    >
      <section
        class="collection-capture"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        @keydown.esc="emit('close')"
      >
        <header class="collection-capture-header">
          <h2 :id="titleId">{{ title }}</h2>
          <button class="panel-surface-icon-btn" type="button" :aria-label="closeLabel" @click="emit('close')">
            <svg class="icon-stroke" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>
        <div class="collection-capture-body">
          <slot />
        </div>
        <slot name="actions" />
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.collection-capture-overlay {
  position: fixed;
  inset: 0;
  z-index: 260;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background: rgba(20, 24, 28, 0.28);
}

.collection-capture {
  width: min(560px, 100%);
  max-height: min(78vh, 680px);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  overflow: auto;
  padding: var(--space-lg);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: var(--surface-panel);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}

.collection-capture-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.collection-capture-header h2 {
  margin: 0;
  font-size: var(--font-size-title);
  color: var(--text-primary);
}

.collection-capture-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

@media (max-width: 640px) {
  .collection-capture-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .collection-capture {
    width: 100%;
    max-height: calc(100vh - 84px);
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: var(--radius-card) var(--radius-card) 0 0;
    padding-bottom: calc(var(--space-lg) + env(safe-area-inset-bottom));
  }
}
</style>
