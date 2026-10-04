import { vi } from 'vitest'
import http from '../../api/http'
import { setupMock, resetMock } from '../../api/mock'
import eventService from '../eventService'
import eventStore from '../eventStore'
import { selectEvents, createEvent } from '../eventRules'

beforeEach(() => {
  eventStore.reset()
})

// Review Focus #4：空狀態／缺失不是錯誤。
test('篩選不存在的類型 → 空陣列', async () => {
  const r = await eventService.list({ type: '不存在的類型' })
  expect(r).toEqual([])
})

test('get 不存在的 id → null', async () => {
  expect(await eventService.get('nope')).toBeNull()
})

describe('eventService.list', () => {
  test('依類型精確篩選', async () => {
    const r = await eventService.list({ time: 'all', type: '坑洞' })
    expect(r.length).toBeGreaterThan(0)
    r.forEach((event) => expect(event.type).toBe('坑洞'))
  })

  test('依狀態精確篩選', async () => {
    const r = await eventService.list({ time: 'all', status: 'resolved' })
    expect(r.map((event) => event.status)).toEqual(['resolved'])
  })

  test('地區作為相關性排序：符合地區者優先', async () => {
    const r = await eventService.list({ time: 'all', region: '中華路' })
    expect(r[0].placeText).toContain('中華路')
  })

  test('filterRegion 硬性剪除不符地區的事件', async () => {
    const hit = await eventService.list({ time: 'all', filterRegion: '中華路' })
    expect(hit.length).toBeGreaterThan(0)
    hit.forEach((event) =>
      expect(`${event.placeText} ${event.title}`).toContain('中華路')
    )

    expect(await eventService.list({ filterRegion: '不存在的地區' })).toEqual([])
  })

  test('region（排序）不剪除；filterRegion（過濾）才剪除', async () => {
    const ordered = await eventService.list({ time: 'all', region: '中華路' })
    const pruned = await eventService.list({ time: 'all', filterRegion: '中華路' })
    expect(ordered.length).toBeGreaterThan(pruned.length)
  })

  test('預設近期，非全部歷史', async () => {
    // 以固定系統時間消除日曆月（DEFAULT_TIME='month'）帶來的真實時鐘依賴。
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-04T12:00:00+08:00'))
    try {
      const all = await eventService.list({ time: 'all' })
      const recent = await eventService.list()
      expect(recent.length).toBeLessThan(all.length)
      expect(recent.length).toBeGreaterThan(0)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('eventService.report', () => {
  test('建立新事件並使之後可查得、列於清單中', async () => {
    const created = await eventService.report({
      description: '測試回報：巷口有噪音',
      category: '噪音',
      location: { text: '測試地點', coordinates: null },
      time: '今天',
    })
    expect(created.id).toBeTruthy()
    expect(created.status).toBe('reported')
    expect(created.coordinates).toBeNull()

    expect(await eventService.get(created.id)).toMatchObject({ id: created.id })

    const list = await eventService.list({ time: 'all', type: '噪音' })
    expect(list.map((event) => event.id)).toContain(created.id)
  })

  test('兩次回報產生不同 id', async () => {
    const a = await eventService.report({ description: 'A', category: '垃圾' })
    const b = await eventService.report({ description: 'B', category: '垃圾' })
    expect(a.id).not.toBe(b.id)
  })
})

describe('selectEvents（純函式）', () => {
  const now = new Date('2026-10-04T12:00:00+08:00')
  const items = [
    { id: 'new', type: '坑洞', status: 'reported', placeText: '中華路', reportedAt: '2026-10-04T09:00:00+08:00' },
    { id: 'old', type: '坑洞', status: 'reported', placeText: '中華路', reportedAt: '2026-09-01T09:00:00+08:00' },
  ]

  test('未指定時間 → 只留近期', () => {
    expect(selectEvents(items, {}, now).map((e) => e.id)).toEqual(['new'])
  })

  test("time:'all' → 含全部歷史，且新者在前", () => {
    expect(selectEvents(items, { time: 'all' }, now).map((e) => e.id)).toEqual(['new', 'old'])
  })

  test('非陣列輸入 → 空陣列', () => {
    expect(selectEvents(null, {})).toEqual([])
  })
})

describe('createEvent（純函式，不合成座標）', () => {
  test('對應 draft 欄位並預設 status=reported', () => {
    const at = new Date('2026-10-04T12:00:00+08:00')
    const event = createEvent(
      {
        description: '中華路有坑洞',
        category: '坑洞',
        location: { text: '中華路一段', coordinates: null },
        time: '今天',
        photo: 'p.jpg',
      },
      { id: 'e-100', now: at }
    )
    expect(event).toMatchObject({
      id: 'e-100',
      type: '坑洞',
      placeText: '中華路一段',
      timeText: '今天',
      status: 'reported',
      description: '中華路有坑洞',
      photo: 'p.jpg',
    })
    expect(event.coordinates).toBeNull()
    expect(event.reportedAt).toBe(at.toISOString())
  })
})

describe('GET／POST／GET :id（mock 端點）', () => {
  test('建立後 GET 列表與詳情皆一致；未知 id 回 null', async () => {
    setupMock(http, { delayResponse: 0 })

    const { data: created } = await http.post('/api/events', {
      description: '端點測試',
      category: '積水',
      location: { text: '某處' },
    })
    expect(created.id).toBeTruthy()

    const { data: detail } = await http.get(`/api/events/${created.id}`)
    expect(detail.id).toBe(created.id)

    const { data: listed } = await http.get('/api/events', { params: { time: 'all', type: '積水' } })
    expect(listed.map((event) => event.id)).toContain(created.id)

    const { data: missing } = await http.get('/api/events/does-not-exist')
    expect(missing).toBeNull()

    resetMock()
  })
})
