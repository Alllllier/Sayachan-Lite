<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  tag: {
    type: String,
    default: 'section'
  },
  title: {
    type: String,
    default: ''
  },
  titleTag: {
    type: String,
    default: 'h4'
  }
})
</script>

<template>
  <component :is="tag" class="list-section" v-bind="$attrs">
    <header
      v-if="title || $slots.title || $slots.control"
      class="list-section-header"
    >
      <component :is="titleTag" class="list-section-title">
        <slot name="title">{{ title }}</slot>
      </component>
      <div v-if="$slots.control" class="list-section-control">
        <slot name="control" />
      </div>
    </header>

    <ul class="list-section-items">
      <slot />
    </ul>
  </component>
</template>

<style>
.list-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.list-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-section-title {
  margin: 0;
  min-width: 0;
  font-size: var(--font-size-section);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.list-section-control {
  flex-shrink: 0;
}

.list-section-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
