<template>
  <p class="step-indicator" role="status">
    步驟 {{ current }}/{{ total }}
  </p>
</template>

<script>
export default {
  name: 'StepIndicator',
  props: {
    current: { type: Number, required: true },
    total: { type: Number, required: true },
  },
}
</script>

<style scoped>
.step-indicator {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--foreground);
  white-space: nowrap;
}
</style>
