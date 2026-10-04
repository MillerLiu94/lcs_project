import { createLocalVue, mount } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import ResultsView from '../ResultsView.vue'
import query from '../../../store/modules/query'
import welfare from '../../../store/modules/welfare'
import eventService from '../../../services/eventService'

const localVue = createLocalVue()
localVue.use(Vuex)

const RouterLinkStub = {
  name: 'RouterLink',
  props: { to: { type: [String, Object], required: true } },
  render(h) {
    return h('a', { attrs: { href: typeof this.to === 'string' ? this.to : '#' } }, this.$slots.default)
  },
}

function render(q) {
  const store = new Vuex.Store({ modules: { query, welfare } })
  const w = mount(ResultsView, {
    localVue,
    store,
    stubs: { RouterLink: RouterLinkStub },
    mocks: { $route: { query: { q } } },
  })
  return { w, store }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

test('無法判斷 → 顯示提示與三個任務入口', async () => {
  const { w } = render('最近有什麼')
  await flush()
  expect(w.text()).toContain('換句話說')
  expect(w.find('a[href="/assistant/report"]').exists()).toBe(true)
  expect(w.find('a[href="/assistant/events"]').exists()).toBe(true)
  expect(w.find('a[href="/assistant/welfare"]').exists()).toBe(true)
})

test('複合 → 同時呈現事件與福利兩區', async () => {
  vi.spyOn(eventService, 'list').mockResolvedValue([])
  const { w } = render('附近有沒有積水，這個月有什麼老人活動')
  await flush()
  expect(w.text()).toContain('附近事件')
  expect(w.text()).toContain('福利與活動')
})

test('含回報意圖 → 顯示前往回報入口、不自動開始流程', async () => {
  vi.spyOn(eventService, 'list').mockResolvedValue([])
  const { w } = render('中華路有坑洞，這個月有什麼老人活動')
  await flush()
  const link = w.find('a[href="/assistant/report"]')
  expect(link.exists()).toBe(true)
  expect(link.text()).toContain('要回報嗎')
})

test('同一路由換 q 會重新解析並查詢', async () => {
  vi.spyOn(eventService, 'list').mockResolvedValue([])
  const store = new Vuex.Store({ modules: { query, welfare } })
  const $route = Vue.observable({ query: { q: '這個月有什麼老人活動' } })
  const w = mount(ResultsView, {
    localVue,
    store,
    stubs: { RouterLink: RouterLinkStub },
    mocks: { $route },
  })
  await flush()
  expect(w.vm.intents).toEqual([{ intent: 'welfare', text: '這個月有什麼老人活動' }])

  $route.query = { q: '附近有沒有積水' }
  await flush()
  expect(w.vm.intents).toEqual([{ intent: 'query', text: '附近有沒有積水' }])
})
