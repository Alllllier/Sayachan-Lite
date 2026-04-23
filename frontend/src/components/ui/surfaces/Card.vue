<script setup>
const props = defineProps({
  title: String,
  summary: String,
  titleTag: {
    type: String,
    default: 'h3'
  },
  titleClass: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <section class="card">
    <header v-if="$slots.header || title || summary" class="card-header">
      <slot name="header">
        <component :is="titleTag" v-if="title" :class="['card-title', titleClass]">
          {{ title }}
        </component>
        <p v-if="summary" class="card-content">
          {{ summary }}
        </p>
      </slot>
    </header>

    <div class="card-body">
      <slot />
    </div>

    <footer v-if="$slots.actions" class="card-actions">
      <slot name="actions" />
    </footer>
  </section>
</template>
