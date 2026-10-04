<template>
  <svg
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
</template>

<script>
export default {
  name: 'ArrowLeftIcon',
  props: {
    size: { type: Number, default: 24 },
  },
}
</script>
