import Vue from 'vue'
import Vuex from 'vuex'
import query from '../modules/query'
import eventService from '../../services/eventService'

Vue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { query } })
}

describe('query/loadEvents', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Task 18 必要測試（Review Focus #4）：空結果不是錯誤。
  test('loadEvents 空結果時 events 為空且非錯誤', async () => {
    const store = new Vuex.Store({ modules: { query } })
    await store.dispatch('query/loadEvents')
    expect(Array.isArray(store.state.query.events)).toBe(true)
    expect(store.state.query.error).toBeFalsy()
  })

  test('服務回傳空陣列時 events 為空、error 為空、loading 結束', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue([])
    const store = makeStore()
    const events = await store.dispatch('query/loadEvents')
    expect(events).toEqual([])
    expect(store.state.query.events).toEqual([])
    expect(store.state.query.error).toBeFalsy()
    expect(store.state.query.loading).toBe(false)
  })

  test('預設查詢近期（month）且不硬篩地區', async () => {
    const spy = vi.spyOn(eventService, 'list').mockResolvedValue([])
    const store = makeStore()
    await store.dispatch('query/loadEvents')
    const params = spy.mock.calls[0][0]
    expect(params.time).toBe('month')
    expect(params.filterRegion).toBeUndefined()
  })

  test('查詢失敗時 error 有值且 events 清空', async () => {
    vi.spyOn(eventService, 'list').mockRejectedValue(new Error('boom'))
    const store = makeStore()
    await store.dispatch('query/loadEvents')
    expect(store.state.query.error).toBeTruthy()
    expect(store.state.query.events).toEqual([])
    expect(store.state.query.loading).toBe(false)
  })
})

describe('query/setFilter 與 clearFilters', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('setFilter 更新篩選並重新載入；地區 chip 以 filterRegion 硬篩', async () => {
    const spy = vi.spyOn(eventService, 'list').mockResolvedValue([])
    const store = makeStore()
    await store.dispatch('query/setFilter', { region: '中華路' })
    expect(store.state.query.region).toBe('中華路')
    const params = spy.mock.calls[spy.mock.calls.length - 1][0]
    expect(params.filterRegion).toBe('中華路')
  })

  test('setFilter 只更新對應的篩選欄位（type/status/time）', async () => {
    vi.spyOn(eventService, 'list').mockResolvedValue([])
    const store = makeStore()
    await store.dispatch('query/setFilter', { type: '坑洞' })
    await store.dispatch('query/setFilter', { status: 'reported' })
    await store.dispatch('query/setFilter', { time: 'all' })
    expect(store.state.query.filters).toEqual({ time: 'all', type: '坑洞', status: 'reported' })
  })

  test('clearFilters 清空地區與時間／類型／狀態並重新載入', async () => {
    const spy = vi.spyOn(eventService, 'list').mockResolvedValue([])
    const store = makeStore()
    await store.dispatch('query/setFilter', { region: '中華路', type: '坑洞', time: 'all' })
    await store.dispatch('query/clearFilters')
    expect(store.state.query.region).toBe('')
    expect(store.state.query.filters).toEqual({ time: 'month', type: '', status: '' })
    const params = spy.mock.calls[spy.mock.calls.length - 1][0]
    expect(params.filterRegion).toBeUndefined()
    expect(params.time).toBe('month')
  })

  test('真實 mock 資料：地區 chip 篩出符合的事件，未知地區為空且非錯誤', async () => {
    // seed 的 reportedAt 固定為 2026-10，預設 time:'month' 需以固定時鐘評估，
    // 否則離開 2026-10 後種子事件會被時間窗剪除（time-bomb）。
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-04T12:00:00+08:00'))
    try {
      const store = makeStore()
      await store.dispatch('query/setFilter', { region: '中華路' })
      expect(store.state.query.events.length).toBeGreaterThan(0)
      expect(store.state.query.events.every((e) => e.placeText.includes('中華路'))).toBe(true)
      await store.dispatch('query/setFilter', { region: '不存在的地區' })
      expect(store.state.query.events).toEqual([])
      expect(store.state.query.error).toBeFalsy()
    } finally {
      vi.useRealTimers()
    }
  })
})
