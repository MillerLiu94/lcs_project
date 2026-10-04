import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
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

async function mountWithPath(path) {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  const router = new VueRouter({
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/events', component: { template: '<div />' } },
    ],
  })
  await router.push(path)
  return mount(AppShell, {
    localVue,
    router,
    stubs: ['router-link'],
    slots: { default: '<p>content</p>' },
  })
}

test('非首頁時在內容上方提供回首頁', async () => {
  const w = await mountWithPath('/events')
  expect(w.findComponent({ name: 'HomeLink' }).exists()).toBe(true)
  w.destroy()
})

test('首頁時不顯示回首頁', async () => {
  const w = await mountWithPath('/')
  expect(w.findComponent({ name: 'HomeLink' }).exists()).toBe(false)
  w.destroy()
})
