<template>
  <span class="source-badge">
    <span v-if="unit" class="source-badge__unit">來源：{{ unit }}</span>
    <span
      v-if="unit && publishedAt"
      class="source-badge__sep"
      aria-hidden="true"
    >·</span>
    <span v-if="publishedAt" class="source-badge__date">發布 {{ publishedAt }}</span>
  </span>
</template>

<script>
export default {
  name: 'SourceBadge',
  props: {
    unit: { type: String, default: '' },
    publishedAt: { type: String, default: '' },
  },
}
</script>

<style scoped>
.source-badge {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--muted-foreground);
}
.source-badge__unit {
  font-weight: 700;
  color: var(--foreground);
}
.source-badge__sep {
  color: var(--border);
}
</style>
