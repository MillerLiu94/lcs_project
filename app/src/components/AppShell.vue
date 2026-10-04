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
  padding: var(--space-4) var(--space-3) 7rem;
}
/* Desktop enhancement: content max-width narrows and centres under the top nav. */
@media (min-width: 1024px) {
  .app-shell__main {
    max-width: 72rem;
    padding: var(--space-5) var(--space-5) var(--space-6);
  }
}
</style>
