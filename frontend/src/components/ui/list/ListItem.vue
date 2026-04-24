<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  element: {
    type: String,
    default: 'div'
  },
  buttonType: {
    type: String,
    default: 'button'
  },
  interactive: {
    type: Boolean,
    default: false
  },
  current: {
    type: Boolean,
    default: false
  },
  muted: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  raised: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <li class="list-item-row">
    <component
      :is="element"
      :type="element === 'button' ? buttonType : undefined"
      class="list-item"
      :class="{
        'list-item--interactive': interactive,
        'list-item--current': current,
        'list-item--muted': muted,
        'list-item--archived': archived,
        'list-item--raised': raised
      }"
      v-bind="$attrs"
    >
      <slot />
    </component>
  </li>
</template>

<style>
.list-item-row {
  margin: 0;
}

.list-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: 8px 10px;
  background: var(--surface-card);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  border-left: 2px solid var(--action-primary);
  font-size: var(--font-size-chip);
  text-align: left;
  color: inherit;
  position: relative;
  z-index: 0;
}

button.list-item {
  appearance: none;
  font-family: inherit;
  font-weight: inherit;
  line-height: inherit;
}

.list-item--interactive {
  cursor: pointer;
  user-select: none;
}

.list-item--interactive:focus-visible {
  outline: 2px solid var(--border-accent);
  outline-offset: 2px;
}

@media (min-width: 481px) {
  .list-item--interactive:hover {
    background: var(--identity-primary-soft);
  }
}

.list-item--current {
  border-left-color: var(--action-primary);
  background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-hover) 100%);
}

.list-item--muted {
  border-left-color: var(--border-default);
}

.list-item--muted .item-content-text {
  color: var(--text-muted);
  opacity: 0.78;
  text-decoration: line-through;
}

.list-item--archived {
  border-left-color: var(--action-primary-hover);
  background: var(--surface-panel);
}

.list-item--archived .item-content-text,
.list-item--archived .item-meta {
  opacity: 0.72;
}

.list-item--raised {
  z-index: 20;
}

@media (max-width: 480px) {
  .list-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
