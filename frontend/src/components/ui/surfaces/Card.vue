<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  tag: {
    type: String,
    default: 'article'
  }
})
</script>

<template>
  <component :is="tag" class="card card-shell" v-bind="$attrs">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>
    <div v-if="$slots.meta" class="card-meta-area">
      <slot name="meta" />
    </div>
    <div v-if="$slots.body" class="card-body">
      <slot name="body" />
    </div>
    <footer v-if="$slots.actions" class="card-actions">
      <slot name="actions" />
    </footer>
  </component>
</template>
