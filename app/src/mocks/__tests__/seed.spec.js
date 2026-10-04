import taxonomy from '../taxonomy.json'
import places from '../places.json'
import welfare from '../welfare.json'
import events from '../events.json'
import { scenario } from '../scenarios'

describe('taxonomy 種子資料', () => {
  const keywords = taxonomy.eventTypes.flatMap((t) => t.keywords)
  it.each(['坑洞', '路燈', '積水'])('可辨識事件類型「%s」', (word) => {
    expect(keywords).toContain(word)
  })
})

describe('places 種子資料', () => {
  it('至少有一處可同時對應「中華路」與「全家」且有座標', () => {
    const target = places.find(
      (p) =>
        JSON.stringify(p).includes('中華路') &&
        JSON.stringify(p).includes('全家') &&
        typeof p.lat === 'number' &&
        typeof p.lng === 'number'
    )
    expect(target).toBeTruthy()
    expect(places.length).toBeGreaterThanOrEqual(3)
  })
})

describe('welfare 種子資料', () => {
  it('每筆都有完整欄位', () => {
    const fields = ['id', 'title', 'source', 'publishedAt', 'eventDate', 'url']
    welfare.forEach((item) => {
      fields.forEach((field) => expect(item).toHaveProperty(field))
    })
  })

  it('至少有一組重複（同 title＋eventDate）', () => {
    const keys = welfare.map((i) => i.title + '|' + i.eventDate)
    expect(new Set(keys).size).toBeLessThan(keys.length)
  })

  it('至少有一筆已過期的 eventDate', () => {
    const now = Date.now()
    const hasExpired = welfare.some((i) => Date.parse(i.eventDate) < now)
    expect(hasExpired).toBe(true)
  })
})

describe('events 種子資料', () => {
  it('每筆都有完整欄位且類型／狀態有變化', () => {
    const fields = [
      'id',
      'type',
      'title',
      'placeText',
      'coordinates',
      'timeText',
      'status',
      'description',
      'photo',
      'reportedAt',
    ]
    events.forEach((event) => {
      fields.forEach((field) => expect(event).toHaveProperty(field))
    })
    expect(new Set(events.map((e) => e.type)).size).toBeGreaterThan(1)
    expect(new Set(events.map((e) => e.status)).size).toBeGreaterThan(1)
  })
})

describe('scenario 情境開關', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('無 mock 參數時回 null', () => {
    expect(scenario()).toBeNull()
  })

  it('解析合法的 mock 參數', () => {
    window.history.replaceState({}, '', '/?mock=timeout')
    expect(scenario()).toBe('timeout')
  })

  it('非法值回 null', () => {
    window.history.replaceState({}, '', '/?mock=whatever')
    expect(scenario()).toBeNull()
  })
})
