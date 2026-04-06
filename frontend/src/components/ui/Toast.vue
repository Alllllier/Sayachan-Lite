<script setup>
/**
 * Toast - UI Foundation Primitive
 * Phase 2: Extracted reusable toast notification
 *
 * Usage:
 * <Toast :message="toastMessage" :type="toastType" :visible="toastVisible" />
 *
 * Props:
 * - message: string - Toast display text
 * - type: 'success' | 'error' - Toast style variant
 * - visible: boolean - Control visibility
 */

defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error'].includes(value)
  },
  visible: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="type">
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  color: var(--text-inverse);
  font-size: var(--font-size-base);
  font-weight: 500;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
  max-width: 90%;
  text-align: center;
}

.toast.success {
  background: var(--status-success);
}

.toast.error {
  background: var(--status-error);
}

/* Toast Transition Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.toast-enter-to {
  opacity: 1;
  transform: translate(-50%, 0);
}

.toast-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
