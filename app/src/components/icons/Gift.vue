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
    <path d="M4 11h16v10H4z" />
    <path d="M3 7h18v4H3z" />
    <path d="M12 7v14" />
    <path d="M12 7S10.5 3 8 3a2.5 2.5 0 0 0 0 5h4Z" />
    <path d="M12 7s1.5-4 4-4a2.5 2.5 0 0 1 0 5h-4Z" />
  </svg>
</template>

<script>
export default {
  name: 'GiftIcon',
  props: {
    size: { type: Number, default: 24 },
  },
}
</script>
