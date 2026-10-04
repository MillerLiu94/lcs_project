import { mount } from '@vue/test-utils'
import AppShell from '../AppShell.vue'

const realMatchMedia = window.matchMedia

function mountAt(width) {
  window.matchMedia = (query) => ({
    matches: query.includes('1024') && width >= 1024,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })
  return mount(AppShell, {
    stubs: ['router-link'],
    slots: { default: '<p>content</p>' },
  })
}

afterEach(() => {
  window.matchMedia = realMatchMedia
})

// G6: desktop (>=1024) gets the top nav; mobile keeps the bottom floating nav.
test.each([
  [375, false],
  [768, false],
  [1024, true],
  [1440, true],
])('at %ipx desktop=%s', (width, desktop) => {
  const w = mountAt(width)
  expect(w.find('.top-nav').exists()).toBe(desktop)
  expect(w.find('.bottom-nav').exists()).toBe(!desktop)
  expect(w.find('.app-shell--desktop').exists()).toBe(desktop)
  expect(w.text()).toContain('content')
  w.destroy()
})
