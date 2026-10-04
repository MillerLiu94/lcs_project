<template>
  <nav class="top-nav" aria-label="主要導覽">
    <router-link class="top-nav__brand" to="/">
      <span class="top-nav__logo" aria-hidden="true">社</span>
      <span class="top-nav__brand-name">社區資訊平台</span>
    </router-link>

    <ul class="top-nav__list">
      <li
        v-for="item in NAV_ITEMS"
        :key="item.to"
        class="top-nav__item"
        data-nav-item
      >
        <router-link class="top-nav__link" :to="item.to">
          <component :is="iconFor(item.icon)" :size="20" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import { NAV_ITEMS } from '../router'
import Flag from './icons/Flag.vue'
import Gift from './icons/Gift.vue'
import House from './icons/House.vue'
import MapPin from './icons/MapPin.vue'

const ICONS = { Flag, Gift, House, MapPin }

export default {
  name: 'TopNav',
  data() {
    return { NAV_ITEMS }
  },
  methods: {
    iconFor(name) {
      return ICONS[name] || null
    },
  },
}
</script>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 auto;
  max-width: 72rem;
  min-height: 64px;
  max-height: 72px;
  padding: 0.5rem 2rem;
  background: var(--background);
  border-bottom: 1px solid var(--border);
}
.top-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--foreground);
  text-decoration: none;
  font-weight: 800;
}
.top-nav__brand:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.top-nav__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-pill);
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 1rem;
}
.top-nav__brand-name {
  font-size: var(--font-size-body);
}
.top-nav__list {
  display: flex;
  gap: 0.5rem;
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
}
.top-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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
  font-weight: 700;
}
</style>
