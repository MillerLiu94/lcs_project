import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import EventListView from '../EventListView.vue'
import query from '../../../store/modules/query'
import eventService from '../../../services/eventService'

const localVue = createLocalVue()
localVue.use(Vuex)

const RouterLinkStub = {
  name: 'RouterLink',
  props: { to: { type: [String, Object], required: true } },
  render(h) {
    const href = typeof this.to === 'string' ? this.to : '#'
    return h('a', { attrs: { href } }, this.$slots.default)
  },
}

function makeStore() {
  return new Vuex.Store({ modules: { query } })
}

function mountView(store) {
  return mount(EventListView, { localVue, store, stubs: { RouterLink: RouterLinkStub } })
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function chipByText(w, text) {
  return w.findAll('button').wrappers.find((button) => button.text() === text)
}

const EVENTS = [
  {
    id: 'e-001',
    title: '中華路一段路面坑洞',
    timeText: '今天上午',
    placeText: '中華路一段 100 號附近',
    status: 'reported',
  },
  {
    id: 'e-002',
    title: '巷口路燈不亮',
    timeText: '昨天晚上',
    placeText: '汀州路二段 143 號旁',
    status: 'in-progress',
  },
]

describe('EventListView（P5 查詢目前事件）', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('預設載入事件並以卡片呈現時間／地點／狀態', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue(EVENTS)
    const w = mountView(makeStore())
    await flush()
    expect(eventService.list).toHaveBeenCalled()
    expect(w.findAllComponents({ name: 'ResultCard' })).toHaveLength(2)
    expect(w.text()).toContain('中華路一段路面坑洞')
    expect(w.text()).toContain('今天上午')
    expect(w.text()).toContain('待處理')
  })

  test('由 ?q= 帶著原話進來：抽出的類型成為篩選（不是未篩選清單）', async () => {
    const spy = vi.spyOn(eventService, 'list').mockResolvedValue([])
    const store = makeStore()
    const w = mount(EventListView, {
      localVue,
      store,
      stubs: { RouterLink: RouterLinkStub },
      mocks: { $route: { query: { q: '附近有沒有積水' } } },
    })
    await flush()
    expect(store.state.query.filters.type).toBe('積水')
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ type: '積水' }))
    w.destroy()
  })

  test('由 ?q= 帶著原話進來：抽出的地點成為地區篩選', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue([])
    const store = makeStore()
    const w = mount(EventListView, {
      localVue,
      store,
      stubs: { RouterLink: RouterLinkStub },
      mocks: { $route: { query: { q: '中華路有沒有坑洞' } } },
    })
    await flush()
    expect(store.state.query.region).toBe('中華路')
    expect(store.state.query.filters.type).toBe('坑洞')
    w.destroy()
  })

  test('空結果顯示空狀態並提供「回報一個問題」到 /report', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue([])
    const w = mountView(makeStore())
    await flush()
    expect(w.text()).toContain('目前附近沒有已回報的事件')
    const link = w.find('a[href="/report"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('回報一個問題')
  })

  test('地區 chip 以 filterRegion 硬篩並更新畫面；再點一次取消', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue([])
    const store = makeStore()
    const w = mountView(store)
    await flush()
    await chipByText(w, '中華路').trigger('click')
    await flush()
    expect(store.state.query.region).toBe('中華路')
    expect(eventService.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ filterRegion: '中華路' }),
    )
    await chipByText(w, '中華路').trigger('click')
    await flush()
    expect(store.state.query.region).toBe('')
  })

  test('篩選後為空顯示「清除篩選」，點擊後恢復預設', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue([])
    const store = makeStore()
    const w = mountView(store)
    await flush()
    expect(w.text()).toContain('回報一個問題')
    await chipByText(w, '坑洞').trigger('click')
    await flush()
    expect(w.text()).toContain('清除篩選')
    await chipByText(w, '清除篩選').trigger('click')
    await flush()
    expect(store.state.query.filters.type).toBe('')
  })

  test('查詢失敗顯示錯誤訊息與重試', async () => {
    vi.spyOn(eventService, 'list').mockRejectedValue(new Error('boom'))
    const w = mountView(makeStore())
    await flush()
    expect(w.findComponent({ name: 'ErrorAlert' }).exists()).toBe(true)
    expect(w.text()).toContain('網路有點問題，請再試一次。')
  })

  const LOCATED = [
    { id: 'e-001', title: '有座標A', timeText: '今天', placeText: '中華路', status: 'reported', coordinates: { lat: 25.0455, lng: 121.509 } },
    { id: 'e-003', title: '有座標B', timeText: '今天', placeText: '汀州路', status: 'reported', coordinates: { lat: 25.0237, lng: 121.521 } },
    { id: 'e-004', title: '無座標C', timeText: '前天', placeText: '青年公園', status: 'reported', coordinates: null },
  ]

  test('有座標者加編號、無座標者列最後並標示', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue(LOCATED)
    const w = mountView(makeStore())
    await flush()
    const badges = w.findAll('[data-event-num]').wrappers.map((n) => n.text())
    expect(badges).toEqual(['1', '2'])
    expect(w.text()).toContain('位置未標示')
    const cards = w.findAll('.events__item').wrappers.map((c) => c.text())
    expect(cards[cards.length - 1]).toContain('無座標C')
  })

  test('EventMap 只收到有座標的事件', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue(LOCATED)
    const w = mount(EventListView, {
      localVue,
      store: makeStore(),
      stubs: { RouterLink: RouterLinkStub, EventMap: true },
    })
    await flush()
    const map = w.findComponent({ name: 'EventMap' })
    expect(map.props('events').map((e) => e.id)).toEqual(['e-001', 'e-003'])
  })

  test('EventMap 選取事件時，對應卡片標記為選中', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue(LOCATED)
    const w = mount(EventListView, {
      localVue,
      store: makeStore(),
      stubs: { RouterLink: RouterLinkStub, EventMap: true },
    })
    await flush()
    w.findComponent({ name: 'EventMap' }).vm.$emit('select', 'e-003')
    await flush()
    expect(w.find('.events__card--selected').text()).toContain('有座標B')
  })
})
