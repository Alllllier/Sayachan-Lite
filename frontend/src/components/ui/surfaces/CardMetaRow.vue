<template>
  <div class="card-meta-row">
    <div class="card-meta-row__start">
      <slot />
    </div>
    <div class="card-meta-row__date">
      <slot name="date" />
    </div>
  </div>
</template>

<style scoped>
.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
}

.card-meta-row__start {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.card-meta-row__date {
  margin-left: auto;
  font-size: var(--font-size-meta);
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
