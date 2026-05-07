<script setup lang="ts">
type SegmentedControlOption = {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: SegmentedControlOption[]
  variant?: string
  ariaLabel?: string
}>(), {
  variant: 'page',
  ariaLabel: 'Segmented control'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function selectOption(value: string): void {
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
