<template>
  <EmptyState message="目前沒有找到足夠可靠的資訊，可以換個時間或地區再試。">
    <template #action>
      <button type="button" class="no-result__button" @click="$emit('retry')">
        重新搜尋
      </button>
      <button type="button" class="no-result__button" @click="$emit('widen')">
        放寬條件
      </button>
    </template>
  </EmptyState>
</template>

<script>
import EmptyState from '../../components/EmptyState.vue'

export default {
  name: 'NoResultState',
  components: { EmptyState },
}
</script>

<style scoped>
.no-result__button {
  min-height: 48px;
  padding: 0.5rem 1.25rem;
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 1rem;
  cursor: pointer;
}
.no-result__button:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
