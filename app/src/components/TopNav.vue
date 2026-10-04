<template>
  <nav class="top-nav" aria-label="主要導覽">
    <ul class="top-nav__list">
      <li
        v-for="item in NAV_ITEMS"
        :key="item.to"
        class="top-nav__item"
        data-nav-item
      >
        <router-link class="top-nav__link" :to="item.to">
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import { NAV_ITEMS } from '../router'

export default {
  name: 'TopNav',
  data() {
    return { NAV_ITEMS }
  },
}
</script>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 15;
  margin: 0 auto;
  max-width: 72rem;
  padding: 0.5rem 1rem;
  background: var(--background);
  border-bottom: 1px solid var(--border);
}
.top-nav__list {
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.top-nav__link {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0 1rem;
  border-radius: var(--radius-pill);
  color: var(--foreground);
  text-decoration: none;
}
.top-nav__link:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.top-nav__link.router-link-active {
  background: var(--accent);
  color: var(--accent-foreground);
  font-weight: 600;
}
</style>
