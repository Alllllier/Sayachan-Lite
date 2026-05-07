<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  tag?: string
}>(), {
  tag: 'div'
})
</script>

<template>
  <component :is="tag" class="action-row" v-bind="$attrs">
    <slot />
  </component>
</template>
