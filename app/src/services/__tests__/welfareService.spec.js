import { vi } from 'vitest'
import http from '../../api/http'
import { setupMock, resetMock } from '../../api/mock'
import welfareService from '../welfareService'
import { selectWelfare, dedupeWelfare } from '../welfareRules'

const NOW = new Date('2026-10-04T12:00:00+08:00')

beforeEach(() => {
  // 只假造 Date，保留真實計時器，避免與 mock adapter 的 delayResponse 互斥。
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  window.history.replaceState({}, '', '/')
})

// ---- 任務要求之測試（逐字） ----
test('去除重複且過濾已過期活動', async () => {
  const { results } = await welfareService.search({ type:'活動' })
  const keys = results.map(r => r.title + r.eventDate)
  expect(new Set(keys).size).toBe(keys.length)
})
test('全部不可靠時 results 為空', async () => {
  const { results } = await welfareService.search({ type:'__none__' })
  expect(results).toEqual([])
})

describe('welfareService.search（去重／時效／排序／無可靠結果）', () => {
  test('真的移除種子中的重複，且不含已過期活動', async () => {
    const { results } = await welfareService.search({ type: '活動' })
    const titles = results.map((r) => r.title)
    expect(titles.filter((t) => t === '重陽敬老活動')).toHaveLength(1)

    results.forEach((r) =>
      expect(new Date(r.eventDate).getTime()).toBeGreaterThanOrEqual(NOW.getTime())
    )
    const ids = results.map((r) => r.id)
    expect(ids).not.toContain('w-003') // eventDate 2024-03-10 已過期
    expect(ids).not.toContain('w-008') // eventDate 2025-08-01 已過期
  })

  test('每筆結果都有來源／發布日／活動日／原始連結', async () => {
    const { results } = await welfareService.search({ type: '活動' })
    expect(results.length).toBeGreaterThan(0)
    results.forEach((r) => {
      expect(r.source).toBeTruthy()
      expect(r.publishedAt).toBeTruthy()
      expect(r.eventDate).toBeTruthy()
      expect(r.url).toBeTruthy()
    })
  })

  test('無可靠結果不是錯誤，回傳標準空狀態', async () => {
    expect(await welfareService.search({ type: '__none__' })).toEqual({
      results: [],
      partial: false,
      failedSources: [],
    })
  })

  test('唯一命中者已過期時被排除（時效護欄）', async () => {
    // 種子中只有 w-003「社區健康檢查」符合 type:'檢查'，其 eventDate 2024-03-10 已過期。
    // 若移除 isExpired 護欄，w-003 會出現 → 此測試失敗。
    const { results } = await welfareService.search({ type: '檢查' })
    expect(results).toEqual([])
  })

  test('無類型條件時仍排除已過期活動', async () => {
    const { results } = await welfareService.search({})
    const ids = results.map((r) => r.id)
    expect(results.length).toBeGreaterThan(0)
    expect(ids).not.toContain('w-003') // eventDate 2024-03-10 已過期
    expect(ids).not.toContain('w-008') // eventDate 2025-08-01 已過期
  })

  test('time 條件以活動日精確過濾：month 排除非本月但未過期者', async () => {
    const all = await welfareService.search({ type: '活動', time: 'all' })
    const month = await welfareService.search({ type: '活動', time: 'month' })
    const allIds = all.results.map((r) => r.id)
    const monthIds = month.results.map((r) => r.id)
    // w-004「老人共餐活動」eventDate 2026-11-05：未過期但不在 2026-10。
    expect(allIds).toContain('w-004')
    expect(monthIds).not.toContain('w-004')
    // w-001 eventDate 2026-10-20 落在本月。
    expect(monthIds).toContain('w-001')
    // 若 timeMatches 成為 no-op，month 會含 w-004 → 此測試失敗。
    expect(new Set(allIds)).not.toEqual(new Set(monthIds))
  })

  test('地區作為相關性排序：符合地區者優先', async () => {
    const { results } = await welfareService.search({ type: '活動', region: '中正區' })
    expect(results[0].source).toContain('中正區')
  })

  test('部分來源失敗 → partial 並列出失敗來源，仍呈現其他可靠結果', async () => {
    window.history.replaceState({}, '', '/?mock=partial')
    const r = await welfareService.search({ type: '活動' })
    expect(r.partial).toBe(true)
    expect(r.failedSources.length).toBeGreaterThan(0)
    r.results.forEach((item) => expect(r.failedSources).not.toContain(item.source))
    expect(r.results.length).toBeGreaterThan(0)
  })

  test('部分來源失敗但無可靠結果 → partial 正規化為 false、無失敗來源', async () => {
    window.history.replaceState({}, '', '/?mock=partial')
    expect(await welfareService.search({ type: '__none__' })).toEqual({
      results: [],
      partial: false,
      failedSources: [],
    })
  })
})

describe('welfareRules.selectWelfare（純函式）', () => {
  const base = { publishedAt: '2026-09-01', eventDate: '2026-11-01', url: 'u' }

  test('低信心（缺來源／缺連結／無效日期）一律不呈現，不為湊數補位', () => {
    const items = [
      { ...base, id: 'a', title: '活動A', source: '單位' },
      { ...base, id: 'b', title: '活動B', source: '' },
      { ...base, id: 'c', title: '活動C', source: '單位', url: '' },
      { ...base, id: 'd', title: '活動D', source: '單位', eventDate: 'not-a-date' },
    ]
    const { results } = selectWelfare(items, {}, { now: NOW })
    expect(results.map((r) => r.id)).toEqual(['a'])
  })

  test('去重以 title＋eventDate 為鍵，保留首筆', () => {
    const items = [
      { ...base, id: 'first', title: 'X', source: 's1' },
      { ...base, id: 'second', title: 'X', source: 's2' },
    ]
    expect(dedupeWelfare(items).map((r) => r.id)).toEqual(['first'])
  })

  test('非陣列輸入 → 標準空狀態', () => {
    expect(selectWelfare(null, {})).toEqual({ results: [], partial: false, failedSources: [] })
  })
})

describe('GET /api/welfare（mock 端點）', () => {
  test('回傳 results/partial/failedSources 形狀且遵守去重與時效', async () => {
    setupMock(http, { delayResponse: 0 })
    const { data } = await http.get('/api/welfare', { params: { type: '活動' } })
    expect(Array.isArray(data.results)).toBe(true)
    expect(data.partial).toBe(false)
    expect(data.failedSources).toEqual([])
    const keys = data.results.map((r) => r.title + r.eventDate)
    expect(new Set(keys).size).toBe(keys.length)
    data.results.forEach((r) =>
      expect(new Date(r.eventDate).getTime()).toBeGreaterThanOrEqual(NOW.getTime())
    )
    resetMock()
  })
})
