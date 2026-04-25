<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  titleTag: {
    type: String,
    default: 'h3'
  }
})
</script>

<template>
  <div class="card-header-row">
    <div class="card-header-main">
      <component :is="titleTag" class="card-title">{{ title }}</component>
      <slot />
    </div>
    <div v-if="$slots.actions" class="card-header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.card-header-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.card-header-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  flex: 1;
}

.card-header-main .card-title {
  margin: 0;
}

.card-header-actions {
  margin-left: auto;
  flex-shrink: 0;
}
</style>
