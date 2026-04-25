<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  title: {
    type: String,
    default: ''
  },
  titleTag: {
    type: String,
    default: 'h2'
  }
})
</script>

<template>
  <section class="card-collection" v-bind="$attrs">
    <header
      v-if="title || $slots.title || $slots.control"
      class="card-collection-header"
    >
      <component :is="titleTag" class="card-collection-title">
        <slot name="title">{{ title }}</slot>
      </component>
      <div v-if="$slots.control" class="card-collection-control">
        <slot name="control" />
      </div>
    </header>
    <div class="card-collection-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.card-collection {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  padding: var(--space-lg);
  background: var(--surface-panel);
}

.card-collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.card-collection-title {
  margin: 0;
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.card-collection-control {
  flex-shrink: 0;
}

.card-collection-body {
  display: flex;
  flex-direction: column;
}

</style>
