<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  title: {
    type: String,
    default: ''
  },
  titleTag: {
    type: String,
    default: 'h1'
  }
})
</script>

<template>
  <main class="panel" v-bind="$attrs">
    <header v-if="title || $slots.header" class="panel-header">
      <slot name="header">
        <component :is="titleTag" class="panel-title">{{ title }}</component>
      </slot>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </main>
</template>

<style scoped>
.panel {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px 100px;
}

.panel-header {
  margin-bottom: var(--space-lg);
}

.panel-title {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>
