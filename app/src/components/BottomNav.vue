<template>
  <nav class="bottom-nav" aria-label="主要導覽">
    <ul class="bottom-nav__list">
      <li
        v-for="item in NAV_ITEMS"
        :key="item.to"
        class="bottom-nav__item"
        data-nav-item
      >
        <router-link class="bottom-nav__link" :to="item.to">
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import { NAV_ITEMS } from '../router'

export default {
  name: 'BottomNav',
  data() {
    return { NAV_ITEMS }
  },
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 0.75rem;
  transform: translateX(-50%);
  width: calc(100% - 1.5rem);
  max-width: 32rem;
  padding: 0.5rem;
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-float-strong);
  z-index: 20;
}
.bottom-nav__list {
  display: flex;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.bottom-nav__item {
  flex: 1;
}
.bottom-nav__link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.5rem;
  border-radius: var(--radius-pill);
  color: inherit;
  text-align: center;
  text-decoration: none;
}
.bottom-nav__link:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.bottom-nav__link.router-link-active {
  background: var(--accent);
  color: var(--accent-foreground);
  font-weight: 600;
}
</style>
