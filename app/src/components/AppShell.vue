<template>
  <div class="app-shell">
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
.app-shell__main {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 7rem;
}
@media (min-width: 1024px) {
  .app-shell__main {
    padding-bottom: 2rem;
  }
}
</style>
