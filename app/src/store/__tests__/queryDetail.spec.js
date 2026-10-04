import Vue from 'vue'
import Vuex from 'vuex'
import { createLocalVue, mount } from '@vue/test-utils'
import query from '../modules/query'
import eventService from '../../services/eventService'
import EventDetailView from '../../views/query/EventDetailView.vue'

Vue.use(Vuex)
const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { query } })
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

const RouterLinkStub = {
  name: 'RouterLink',
  props: { to: { type: [String, Object], required: true } },
  render(h) {
    const href = typeof this.to === 'string' ? this.to : '#'
    return h('a', { attrs: { href } }, this.$slots.default)
  },
}

const EVENT = {
  id: 'e-001',
  type: '坑洞',
  title: '中華路一段路面坑洞',
  placeText: '中華路一段 100 號附近',
  timeText: '今天上午',
  status: 'reported',
  description: '機車道有一個拳頭大的坑洞，經過時很危險。',
  photo: null,
}

function mountDetail(store, id = 'e-001') {
  return mount(EventDetailView, {
    localVue,
    store,
    mocks: { $route: { params: { id } } },
    stubs: { RouterLink: RouterLinkStub },
  })
}

describe('query/loadDetail', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Task 19 必要測試（brief 逐字）：未知 id → detailMissing 為 true。
  test('loadDetail 找不到 → detailMissing 為 true', async () => {
    const store = new Vuex.Store({ modules: { query } })
    await store.dispatch('query/loadDetail', 'nope')
    expect(store.state.query.detailMissing).toBe(true)
  })

  test('loadDetail 找到 → detail 有值且 detailMissing 為 false', async () => {
    const spy = vi.spyOn(eventService, 'get').mockResolvedValue(EVENT)
    const store = makeStore()
    const detail = await store.dispatch('query/loadDetail', 'e-001')
    expect(spy).toHaveBeenCalledWith('e-001')
    expect(detail).toEqual(EVENT)
    expect(store.state.query.detail).toEqual(EVENT)
    expect(store.state.query.detailMissing).toBe(false)
    expect(store.state.query.detailLoading).toBe(false)
  })

  test('loadDetail 失敗 → 有錯誤且非「已移除」狀態', async () => {
    vi.spyOn(eventService, 'get').mockRejectedValue(new Error('boom'))
    const store = makeStore()
    await store.dispatch('query/loadDetail', 'e-001')
    expect(store.state.query.detailError).toBeTruthy()
    expect(store.state.query.detailMissing).toBe(false)
    expect(store.state.query.detailLoading).toBe(false)
  })
})

describe('EventDetailView（P7 事件詳情）', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('顯示地點／時間／狀態／描述，且不顯示申報者個資', async () => {
    vi.spyOn(eventService, 'get').mockResolvedValue({
      ...EVENT,
      reporter: '王小明',
      phone: '0912-345-678',
      email: 'wang@example.com',
    })
    const w = mountDetail(makeStore())
    await flush()
    const text = w.text()
    expect(text).toContain('中華路一段 100 號附近')
    expect(text).toContain('今天上午')
    expect(text).toContain('待處理')
    expect(text).toContain('機車道有一個拳頭大的坑洞')
    // 純匿名：即使資料夾帶個資，畫面也不得顯示。
    expect(text).not.toContain('王小明')
    expect(text).not.toContain('0912-345-678')
    expect(text).not.toContain('wang@example.com')
  })

  test('事件不存在時顯示「此事件已移除」並提供回列表', async () => {
    vi.spyOn(eventService, 'get').mockResolvedValue(null)
    const w = mountDetail(makeStore(), 'gone')
    await flush()
    expect(w.text()).toContain('此事件已移除')
    expect(w.text()).toContain('回事件列表')
  })

  test('載入失敗顯示錯誤，按「再試一次」帶回原本的 id 並成功顯示', async () => {
    const spy = vi
      .spyOn(eventService, 'get')
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(EVENT)
    const w = mountDetail(makeStore())
    await flush()
    expect(w.text()).toContain('網路有點問題，請再試一次。')
    await w.find('.detail__action').trigger('click')
    await flush()
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith('e-001')
    expect(w.text()).toContain('中華路一段 100 號附近')
  })
})
