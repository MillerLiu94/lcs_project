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
})
