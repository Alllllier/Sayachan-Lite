<script setup>
import { computed } from 'vue'

const props = defineProps({
  state: {
    type: String,
    default: 'idle',
    validator: value => ['idle', 'active', 'pending'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'ai'].includes(value)
  },
  idleLabel: {
    type: String,
    default: ''
  },
  activeLabel: {
    type: String,
    default: 'Cancel'
  },
  pendingLabel: {
    type: String,
    default: ''
  },
  activeKind: {
    type: String,
    default: 'text',
    validator: value => ['text', 'icon'].includes(value)
  },
  buttonClass: {
    type: [String, Array, Object],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['activate', 'cancel'])

const buttonClasses = computed(() => {
  const classes = ['object-action-area__button']

  if (props.variant === 'ai') {
    classes.push('btn', 'btn-ai', 'btn-ai-icon')
  } else if (props.state === 'active') {
    classes.push('btn', 'btn-secondary')
  } else {
    classes.push('btn', 'btn-primary')
  }

  return classes
})

const areaClasses = computed(() => ([
  'object-action-area',
  `object-action-area--${props.variant}`,
  `is-${props.state}`
]))

const showReveal = computed(() => props.state === 'active')

function handleClick() {
  if (props.disabled) return
  if (props.state === 'active') {
    emit('cancel')
  } else if (props.state === 'idle') {
    emit('activate')
  }
}
</script>

<template>
  <div :class="areaClasses">
    <div class="object-action-area__entry">
      <button
        type="button"
        :class="[buttonClasses, buttonClass]"
        :disabled="disabled || state === 'pending'"
        @click="handleClick"
      >
        <template v-if="state === 'idle'">
          <slot name="idle-icon" />
          <span v-if="idleLabel">{{ idleLabel }}</span>
        </template>
        <template v-else-if="state === 'active'">
          <svg
            v-if="activeKind === 'icon'"
            class="object-action-area__close-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span v-else>{{ activeLabel }}</span>
        </template>
        <template v-else>
          <slot name="pending-icon">
            <span class="object-action-area__pending">⋯</span>
          </slot>
          <span v-if="pendingLabel">{{ pendingLabel }}</span>
        </template>
      </button>
      <slot name="trailing" />
    </div>

    <div v-if="showReveal && $slots.default" class="object-action-area__panel">
      <slot />
    </div>
  </div>
</template>
