<template>
  <div class="error-alert" role="alert" tabindex="-1">
    <p class="error-alert__message">{{ message }}</p>
    <div v-if="$slots.action" class="error-alert__action">
      <slot name="action" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorAlert',
  props: {
    message: { type: String, required: true },
  },
}
</script>

<style scoped>
.error-alert {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--card);
  color: var(--destructive);
  border: 2px solid var(--destructive);
  border-radius: var(--radius-card);
}
.error-alert:focus {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.error-alert__message {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.7;
}
.error-alert__action {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
