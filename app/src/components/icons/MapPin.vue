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
    <path d="M20 9c0 5.5-8 12-8 12S4 14.5 4 9a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="9" r="2.75" />
  </svg>
</template>

<script>
export default {
  name: 'MapPinIcon',
  props: {
    size: { type: Number, default: 24 },
  },
}
</script>
