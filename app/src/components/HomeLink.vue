<template>
  <router-link class="home-link" to="/">回首頁</router-link>
</template>

<script>
export default {
  name: 'HomeLink',
}
</script>

<style scoped>
.home-link {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0 0.5rem;
  color: var(--primary);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.home-link:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
  border-radius: var(--radius);
}
</style>
