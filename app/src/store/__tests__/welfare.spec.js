import Vue from 'vue'
import Vuex from 'vuex'
import welfare from '../modules/welfare'
import welfareService from '../../services/welfareService'

Vue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { welfare } })
}

const EMPTY = { results: [], partial: false, failedSources: [] }

describe('welfare/search（P8–P11）', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // 任務要求的測試（Review Focus #3）：逐字保留。
  test('search 完成後 phase 為 done', async () => {
    vi.useFakeTimers()
    const store = new Vuex.Store({ modules: { welfare } })
    await store.dispatch('welfare/search', '老人活動')
    expect(store.state.welfare.phase).toBe('done')
  })

  test('搜尋成功保留關鍵字並以 target 帶入服務', async () => {
    const spy = vi.spyOn(welfareService, 'search').mockResolvedValue(EMPTY)
    const store = makeStore()
    await store.dispatch('welfare/search', '  活動  ')
    expect(store.state.welfare.keyword).toBe('活動')
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ target: '活動' }))
    expect(store.state.welfare.phase).toBe('done')
  })

  // Task 13 的交棒：?mock=timeout 是 {timeout:true} 訊號，必須先於 results 讀取。
  test('timeout 訊號優先於 results：不顯示結果、停在搜尋中', async () => {
    vi.spyOn(welfareService, 'search').mockResolvedValue({
      results: [{ id: 'x', title: '不該出現' }],
      partial: false,
      failedSources: [],
      timeout: true,
    })
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    expect(store.state.welfare.timeout).toBe(true)
    expect(store.state.welfare.results).toEqual([])
    expect(store.state.welfare.phase).toBe('processing')
  })

  test('無可靠結果是 done 空狀態，不是錯誤', async () => {
    vi.spyOn(welfareService, 'search').mockResolvedValue(EMPTY)
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    expect(store.state.welfare.phase).toBe('done')
    expect(store.state.welfare.results).toEqual([])
    expect(store.state.welfare.error).toBeFalsy()
    expect(store.state.welfare.timeout).toBe(false)
  })

  test('部分來源失敗：保留可靠結果並標記 partial／failedSources', async () => {
    const results = [{ id: 'w-1', title: '老人共餐活動' }]
    vi.spyOn(welfareService, 'search').mockResolvedValue({
      results,
      partial: true,
      failedSources: ['萬華區公所'],
    })
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    expect(store.state.welfare.partial).toBe(true)
    expect(store.state.welfare.failedSources).toEqual(['萬華區公所'])
    expect(store.state.welfare.results).toEqual(results)
  })

  test('搜尋失敗進入 error 並清空結果', async () => {
    vi.spyOn(welfareService, 'search').mockRejectedValue(new Error('boom'))
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    expect(store.state.welfare.phase).toBe('error')
    expect(store.state.welfare.error).toBeTruthy()
    expect(store.state.welfare.results).toEqual([])
  })

  test('retry 以相同關鍵字重新搜尋', async () => {
    const spy = vi.spyOn(welfareService, 'search').mockResolvedValue(EMPTY)
    const store = makeStore()
    await store.dispatch('welfare/search', '課程')
    await store.dispatch('welfare/retry')
    expect(spy).toHaveBeenCalledTimes(2)
    expect(store.state.welfare.keyword).toBe('課程')
  })

  test('widen 放寬條件（不再限制關鍵字）且保留輸入', async () => {
    const spy = vi.spyOn(welfareService, 'search').mockResolvedValue(EMPTY)
    const store = makeStore()
    await store.dispatch('welfare/search', '老人活動')
    await store.dispatch('welfare/widen')
    const lastParams = spy.mock.calls[spy.mock.calls.length - 1][0]
    expect(lastParams.target).toBeUndefined()
    expect(store.state.welfare.keyword).toBe('老人活動')
    expect(store.state.welfare.phase).toBe('done')
  })

  test('真實服務：查無結果為 done 空狀態（非錯誤）', async () => {
    const store = makeStore()
    await store.dispatch('welfare/search', '__none__')
    expect(store.state.welfare.phase).toBe('done')
    expect(store.state.welfare.results).toEqual([])
    expect(store.state.welfare.error).toBeFalsy()
  })

  test('真實服務：一般關鍵字完成並取得可靠結果', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-04T12:00:00+08:00'))
    const store = makeStore()
    await store.dispatch('welfare/search', '活動')
    expect(store.state.welfare.phase).toBe('done')
    expect(store.state.welfare.results.length).toBeGreaterThan(0)
  })
})
