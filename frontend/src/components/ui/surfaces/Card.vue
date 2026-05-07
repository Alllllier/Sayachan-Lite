<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

type CardState = 'archived' | null

const props = withDefaults(defineProps<{
  tag?: string
  state?: CardState
}>(), {
  tag: 'article',
  state: null
})

const stateClass = computed(() => props.state ? `card-state-${props.state}` : null)
</script>

<template>
  <component :is="tag" class="card card-shell" :class="stateClass" v-bind="$attrs">
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
