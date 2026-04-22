<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  variant: {
    type: String,
    default: 'page'
  },
  ariaLabel: {
    type: String,
    default: 'Segmented control'
  }
})

const emit = defineEmits(['update:modelValue'])

function selectOption(value) {
  if (value === props.modelValue) return
  emit('update:modelValue', value)
}
</script>

<template>
  <div
    class="segmented-control"
    :class="`segmented-control--${variant}`"
    role="tablist"
    :aria-label="ariaLabel"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="segmented-control__item"
      :class="{ 'is-active': option.value === modelValue }"
      :aria-pressed="option.value === modelValue"
      @click="selectOption(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
