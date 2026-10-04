<template>
  <div class="app-shell" :class="{ 'app-shell--desktop': isDesktop }">
    <TopNav v-if="isDesktop" />

    <main class="app-shell__main">
      <HomeLink v-if="showHomeLink" />
      <slot />
    </main>

    <BottomNav v-if="!isDesktop" />
  </div>
</template>

<script>
import TopNav from './TopNav.vue'
import BottomNav from './BottomNav.vue'
import HomeLink from './HomeLink.vue'
import { useBreakpoint } from '../composables/useBreakpoint'

export default {
  name: 'AppShell',
  components: { TopNav, BottomNav, HomeLink },
  setup() {
    const { isDesktop } = useBreakpoint()
    return { isDesktop }
  },
  computed: {
    // 首頁本身就是家，不顯示回首頁；其餘每一頁都在內容上方提供。
    showHomeLink() {
      const path = this.$route && this.$route.path
      return path !== '/'
    },
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
