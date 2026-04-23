<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  mode: {
    type: String,
    default: 'preview'
  },
  tag: {
    type: String,
    default: 'div'
  }
})
</script>

<template>
  <component
    :is="tag"
    class="display-list"
    :class="`display-list--${mode}`"
    v-bind="$attrs"
  >
    <div class="display-list-body">
      <slot />
    </div>
  </component>
</template>

<style>
.display-list {
  padding: var(--space-md);
  background: var(--surface-panel);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-block);
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.display-list-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.display-list--expanded .item-content-text {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}
</style>
