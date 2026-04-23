<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  tag: {
    type: String,
    default: 'div'
  }
})
</script>

<template>
  <component :is="tag" class="action-row" v-bind="$attrs">
    <slot />
  </component>
</template>
