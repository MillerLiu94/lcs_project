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
    <path d="M4 6h16v15H4z" />
    <path d="M4 10.5h16" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="M8 14h2" />
    <path d="M14 14h2" />
    <path d="M8 17.5h2" />
  </svg>
</template>

<script>
export default {
  name: 'CalendarIcon',
  props: {
    size: { type: Number, default: 24 },
  },
}
</script>
