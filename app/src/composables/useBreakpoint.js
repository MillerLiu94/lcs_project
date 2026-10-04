import { ref, onMounted, onBeforeUnmount } from 'vue'

const DESKTOP_QUERY = '(min-width: 1024px)'
const MOBILE_QUERY = '(max-width: 767px)'

/**
 * Reactive breakpoint helper. `isDesktop` is true at >=1024px (G6);
 * `isMobile` is true below 768px (mobile-only affordances like 拍照).
 * Falls back to `false` when `matchMedia` is unavailable (e.g. jsdom).
 */
export function useBreakpoint() {
  const isDesktop = ref(false)
  const isMobile = ref(false)

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const mobile = window.matchMedia(MOBILE_QUERY)
    isDesktop.value = desktop.matches
    isMobile.value = mobile.matches

    const onDesktop = (event) => {
      isDesktop.value = event.matches
    }
    const onMobile = (event) => {
      isMobile.value = event.matches
    }

    onMounted(() => {
      desktop.addEventListener('change', onDesktop)
      mobile.addEventListener('change', onMobile)
    })
    onBeforeUnmount(() => {
      desktop.removeEventListener('change', onDesktop)
      mobile.removeEventListener('change', onMobile)
    })
  }

  return { isDesktop, isMobile }
}
