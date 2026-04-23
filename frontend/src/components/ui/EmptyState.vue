<script setup>
/**
 * EmptyState - UI Foundation Primitive
 * Phase 4: Reusable empty state component
 *
 * Usage:
 * <EmptyState title="No items yet" description="Create your first item to get started">
 *   <button>Create Item</button>
 * </EmptyState>
 *
 * Props:
 * - title: string - Main empty state title
 * - description: string - Optional description text
 *
 * Slots:
 * - default: Action CTA or additional content
 */

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="empty-state">
    <div class="empty-state-title">{{ title }}</div>
    <div v-if="description" class="empty-state-description">{{ description }}</div>
    <div v-if="$slots.default" class="empty-state-action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  color: var(--text-muted);
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
  background: var(--surface-panel);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-default);
}

.empty-state-title {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.empty-state-description {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.empty-state-action {
  margin-top: var(--space-md);
}

.empty-state-action :deep(button) {
  margin: 0 var(--space-xs);
}
</style>
