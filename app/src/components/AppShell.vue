<template>
  <div class="app-shell" :class="{ 'app-shell--desktop': isDesktop }">
    <TopNav v-if="isDesktop" />

    <main class="app-shell__main">
      <slot />
    </main>

    <BottomNav v-if="!isDesktop" />
  </div>
</template>

<script>
import TopNav from './TopNav.vue'
import BottomNav from './BottomNav.vue'
import { useBreakpoint } from '../composables/useBreakpoint'

export default {
  name: 'AppShell',
  components: { TopNav, BottomNav },
  setup() {
    const { isDesktop } = useBreakpoint()
    return { isDesktop }
  },
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--background);
  color: var(--foreground);
}
/* Mobile-first: full-width single column with room for the floating bottom nav. */
.app-shell__main {
  margin: 0 auto;
  padding: 1.5rem 1rem 7rem;
}
/* Desktop enhancement: content max-width narrows and centres under the top nav. */
@media (min-width: 1024px) {
  .app-shell__main {
    max-width: 72rem;
    padding: 2rem 2rem 3rem;
  }
}
</style>
