<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Actions'
  }
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <div class="overflow-menu" v-bind="$attrs" @click.stop @keydown.stop>
    <button
      type="button"
      class="overflow-menu__trigger"
      :class="{ 'is-open': open }"
      :title="title"
      :aria-label="title"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click.stop="emit('toggle')"
    >
      <slot name="trigger-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </slot>
    </button>

    <div v-if="open" class="overflow-menu__content" role="menu" @click.stop>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overflow-menu {
  display: inline-flex;
  position: relative;
  flex-shrink: 0;
}

.overflow-menu__trigger {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--panel-surface-icon-size);
  height: var(--panel-surface-icon-size);
  min-width: var(--panel-surface-icon-size);
  min-height: var(--panel-surface-icon-size);
  padding: 0;
  font-family: inherit;
  line-height: 1;
  background: transparent;
  color: var(--panel-surface-icon-foreground);
  border: none;
  border-radius: var(--panel-surface-icon-radius);
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.overflow-menu__trigger:hover:not(:disabled),
.overflow-menu__trigger.is-open {
  background: var(--panel-surface-icon-active-surface-hover);
  color: var(--action-primary);
}

.overflow-menu__trigger svg {
  width: 14px;
  height: 14px;
}

.overflow-menu__content {
  position: absolute;
  top: calc(100% + var(--overflow-menu-offset, 4px));
  right: 0;
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--overflow-menu-radius, 6px);
  box-shadow: var(--shadow-md);
  min-width: var(--overflow-menu-min-width, 120px);
  z-index: 10;
  overflow: hidden;
}
</style>
