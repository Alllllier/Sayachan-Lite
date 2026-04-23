<script setup>
import { computed } from 'vue'

const props = defineProps({
  state: {
    type: String,
    default: 'idle'
  },
  variant: {
    type: String,
    default: 'secondary'
  },
  idleLabel: {
    type: String,
    default: ''
  },
  activeLabel: {
    type: String,
    default: 'Cancel'
  },
  buttonClass: {
    type: String,
    default: ''
  },
  activeKind: {
    type: String,
    default: 'text'
  }
})

const emit = defineEmits(['activate', 'cancel'])

const isIdle = computed(() => props.state === 'idle')
const isActive = computed(() => props.state === 'active')
const isPending = computed(() => props.state === 'pending')

const buttonVariantClass = computed(() => {
  if (props.variant === 'primary') return 'btn-primary'
  if (props.variant === 'ai') return 'btn-ai'
  return 'btn-secondary'
})

function handlePrimaryClick() {
  if (isPending.value) return
  if (isIdle.value) emit('activate')
  else emit('cancel')
}
</script>

<template>
  <div class="object-action-area" :class="`object-action-area--${state}`">
    <div class="object-action-area__header">
      <button
        type="button"
        :disabled="isPending"
        :class="['btn', buttonVariantClass, buttonClass, { 'is-pending': isPending }]"
        @click="handlePrimaryClick"
      >
        <template v-if="variant === 'ai' && isIdle && $slots['idle-icon']">
          <span class="object-action-area__icon">
            <slot name="idle-icon" />
          </span>
        </template>

        <template v-if="isActive && activeKind === 'icon'">
          <span class="object-action-area__icon object-action-area__icon--close" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </span>
        </template>

        <span v-if="isPending">Loading...</span>
        <span v-else-if="isIdle">{{ idleLabel }}</span>
        <span v-else-if="activeKind !== 'icon'">{{ activeLabel }}</span>
      </button>

      <div v-if="$slots.trailing" class="object-action-area__trailing">
        <slot name="trailing" />
      </div>
    </div>

    <div v-if="!isIdle" class="object-action-area__content">
      <slot />
    </div>
  </div>
</template>
