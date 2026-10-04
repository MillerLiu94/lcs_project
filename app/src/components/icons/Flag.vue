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
    <path d="M6 21V4" />
    <path d="M6 5h12l-2.5 3.5L18 12H6" />
  </svg>
</template>

<script>
export default {
  name: 'FlagIcon',
  props: {
    size: { type: Number, default: 24 },
  },
}
</script>
