<template>
  <div class="item-meta">
    <slot />
  </div>
</template>

<style>
.item-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .item-meta {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
