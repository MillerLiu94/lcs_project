import { vi } from 'vitest'
import { scenario, VALID_SCENARIOS } from '../scenarios'
import http from '../../api/http'
import { setupMock, resetMock } from '../../api/mock'
import welfareService from '../../services/welfareService'
import intentService from '../../services/intentService'
import locationService from '../../services/locationService'

const NOW = new Date('2026-10-04T12:00:00+08:00')

function setQuery(query) {
  window.history.replaceState({}, '', query || '/')
}

beforeEach(() => {
  // 只假造 Date，保留真實計時器，避免與 mock adapter 的 delayResponse 互斥。
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  setQuery('/')
})

afterEach(() => {
  resetMock()
  vi.useRealTimers()
  setQuery('/')
})

// ---- 任務要求之測試（逐字） ----
test('scenario 解析查詢字串', () => {
  expect(['empty', 'timeout', 'partial', 'error', 'ambiguous', null]).toContain(scenario())
})

describe('scenario 解析查詢字串', () => {
  it.each(VALID_SCENARIOS)('?mock=%s → %s', (name) => {
    setQuery(`/?mock=${name}`)
    expect(scenario()).toBe(name)
  })

  it('無參數或非法值 → null（維持預設行為）', () => {
    expect(scenario()).toBeNull()
    setQuery('/?mock=nope')
    expect(scenario()).toBeNull()
  })
})

describe('welfareService 情境接線', () => {
  it('?mock=timeout → 回傳 timeout 訊號且無結果', async () => {
    setQuery('/?mock=timeout')
    const r = await welfareService.search({ type: '活動' })
    expect(r.timeout).toBe(true)
    expect(r.results).toEqual([])
  })

  it('?mock=empty → 空結果（非錯誤）', async () => {
    setQuery('/?mock=empty')
    expect(await welfareService.search({ type: '活動' })).toEqual({
      results: [],
      partial: false,
      failedSources: [],
    })
  })

  it('?mock=partial → partial 且 failedSources 非空', async () => {
    setQuery('/?mock=partial')
    const r = await welfareService.search({ type: '活動' })
    expect(r.partial).toBe(true)
    expect(r.failedSources.length).toBeGreaterThan(0)
  })

  it('?mock=error → 服務拒絕，讓呼叫端走錯誤狀態', async () => {
    setQuery('/?mock=error')
    await expect(welfareService.search({ type: '活動' })).rejects.toThrow()
  })

  it('無 ?mock= 時維持預設（partial:false）', async () => {
    const r = await welfareService.search({ type: '活動' })
    expect(r.partial).toBe(false)
    expect(r.failedSources).toEqual([])
    expect(r.timeout).toBeUndefined()
  })
})

describe('intentService 情境接線', () => {
  it('?mock=ambiguous → 不論輸入一律 ambiguous', async () => {
    setQuery('/?mock=ambiguous')
    for (const text of ['中華路全家旁邊有一個坑洞', '這個月有什麼老人活動']) {
      const r = await intentService.classify(text)
      expect(r.intent).toBe('ambiguous')
    }
  })

  it('無 ?mock= 時維持規則分類', async () => {
    expect((await intentService.classify('中華路全家旁邊有一個坑洞')).intent).toBe('report')
  })
})

describe('locationService 情境接線', () => {
  it('?mock=empty → 無候選（走未確認路徑）', async () => {
    setQuery('/?mock=empty')
    expect(await locationService.geocode('中華路全家')).toEqual([])
  })

  it('?mock=error → 拒絕', async () => {
    setQuery('/?mock=error')
    await expect(locationService.geocode('中華路全家')).rejects.toThrow()
  })
})

describe('mock adapter 端點情境（?mock=error 回 500）', () => {
  beforeEach(() => {
    setupMock(http, { delayResponse: 0 })
  })

  it('GET /api/welfare → 500', async () => {
    setQuery('/?mock=error')
    await expect(http.get('/api/welfare')).rejects.toMatchObject({
      response: { status: 500 },
    })
  })

  it('GET /api/welfare → timeout 訊號', async () => {
    setQuery('/?mock=timeout')
    const { data } = await http.get('/api/welfare', { params: { type: '活動' } })
    expect(data.timeout).toBe(true)
  })

  it('POST /api/intent → ambiguous', async () => {
    setQuery('/?mock=ambiguous')
    const { data } = await http.post('/api/intent', { text: '這個月有什麼老人活動' })
    expect(data.intent).toBe('ambiguous')
  })
})
