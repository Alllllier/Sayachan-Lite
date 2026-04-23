<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="item-content">
    <span v-if="text" class="item-content-text">{{ text }}</span>
    <slot />
  </div>
</template>

<style>
.item-content {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.item-content-text {
  display: block;
  max-width: 100%;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.45;
}
</style>
