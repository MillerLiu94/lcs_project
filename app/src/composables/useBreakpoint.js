import { ref, onMounted, onBeforeUnmount } from 'vue'

const DESKTOP_QUERY = '(min-width: 1024px)'

/**
 * Reactive breakpoint helper. `isDesktop` is true at >=1024px (G6).
 * Falls back to `false` when `matchMedia` is unavailable (e.g. jsdom).
 */
export function useBreakpoint() {
  const isDesktop = ref(false)

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mql = window.matchMedia(DESKTOP_QUERY)
    isDesktop.value = mql.matches

    const update = (event) => {
      isDesktop.value = event.matches
    }

    onMounted(() => mql.addEventListener('change', update))
    onBeforeUnmount(() => mql.removeEventListener('change', update))
  }

  return { isDesktop }
}
