import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import WelfareView from '../WelfareView.vue'
import welfare from '../../../store/modules/welfare'

const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { welfare } })
}

function mountView(store) {
  return mount(WelfareView, { localVue, store })
}

const NOW = new Date('2026-10-04T12:00:00+08:00')

describe('WelfareView（P8–P11 狀態切換）', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    vi.useRealTimers()
    window.history.replaceState({}, '', '/')
  })

  test('初始顯示輸入畫面（P8），沒有搜尋或結果區塊', () => {
    const w = mountView(makeStore())
    expect(w.findComponent({ name: 'SearchInput' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'SearchingState' }).exists()).toBe(false)
    expect(w.findComponent({ name: 'ResultList' }).exists()).toBe(false)
    w.destroy()
  })

  test('由 ?q= 帶著原話進來：自動帶入並直接搜尋（不重打）', async () => {
    const store = makeStore()
    const w = mount(WelfareView, {
      localVue,
      store,
      mocks: { $route: { query: { q: '老人活動' } } },
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(store.state.welfare.keyword).toBe('老人活動')
    expect(store.state.welfare.phase).toBe('done')
    expect(w.findComponent({ name: 'SearchInput' }).props('value')).toBe('老人活動')
    w.destroy()
  })

  test('搜尋中顯示三段式進度，不白屏', () => {
    const store = makeStore()
    store.commit('welfare/setKeyword', '活動')
    store.commit('welfare/setPhase', 'processing')
    const w = mountView(store)
    expect(w.findComponent({ name: 'SearchingState' }).exists()).toBe(true)
    expect(w.text()).toContain('正在幫你找…')
    expect(w.text()).toContain('正在搜尋政府與社區資訊…')
    w.destroy()
  })

  test('?mock=timeout → 顯示繼續等待／重新搜尋且保留輸入', async () => {
    window.history.replaceState({}, '', '/?mock=timeout')
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    const w = mountView(store)
    expect(store.state.welfare.phase).toBe('processing')
    expect(w.text()).toContain('繼續等待')
    expect(w.text()).toContain('重新搜尋')
    expect(w.findComponent({ name: 'SearchInput' }).props('value')).toBe('活動')
    w.destroy()
  })

  test('?mock=empty → NoResultState，且不是錯誤', async () => {
    window.history.replaceState({}, '', '/?mock=empty')
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    const w = mountView(store)
    expect(w.findComponent({ name: 'NoResultState' }).exists()).toBe(true)
    expect(w.text()).toContain('目前沒有找到足夠可靠的資訊')
    expect(w.findComponent({ name: 'ErrorAlert' }).exists()).toBe(false)
    w.destroy()
  })

  test('?mock=partial → 呈現可靠結果並標示已略過', async () => {
    window.history.replaceState({}, '', '/?mock=partial')
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    const w = mountView(store)
    expect(store.state.welfare.partial).toBe(true)
    expect(w.findAllComponents({ name: 'ResultCard' }).length).toBeGreaterThan(0)
    expect(w.text()).toContain('無法確認')
    w.destroy()
  })

  test('?mock=error → ErrorAlert 與再試一次', async () => {
    window.history.replaceState({}, '', '/?mock=error')
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    const w = mountView(store)
    expect(w.findComponent({ name: 'ErrorAlert' }).exists()).toBe(true)
    expect(w.text()).toContain('網路有點問題')
    w.destroy()
  })

  test('每筆結果卡含來源／發布日／活動日／原始連結（S2 §20）', async () => {
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    const w = mountView(store)
    const cards = w.findAllComponents({ name: 'ResultCard' })
    expect(cards.length).toBeGreaterThan(0)
    cards.wrappers.forEach((card) => {
      expect(card.props('source')).toBeTruthy()
      expect(card.props('publishedAt')).toBeTruthy()
      expect(card.props('dateText')).toBeTruthy()
      expect(card.props('url')).toBeTruthy()
    })
    w.destroy()
  })
})
