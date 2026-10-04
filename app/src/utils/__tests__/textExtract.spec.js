import { extract } from '../textExtract'

describe('textExtract.extract', () => {
  test('抽出坑洞與地標', () => {
    const r = extract('中華路全家旁邊有一個坑洞')
    expect(r.eventType).toBe('坑洞')
    expect(r.locationText).toContain('中華路')
  })

  test('可辨識路燈與積水類型', () => {
    expect(extract('巷口路燈不亮').eventType).toBe('路燈')
    expect(extract('雨後騎樓積水不退').eventType).toBe('積水')
  })

  test('抽出時間詞', () => {
    const r = extract('今天中華路有一段積水')
    expect(r.eventType).toBe('積水')
    expect(r.timeText).toBe('今天')
    expect(r.locationText).toBe('中華路')
  })

  test('抽出較長的時間詞優先於單字', () => {
    expect(extract('中華路昨天晚上有坑洞').timeText).toBe('昨天')
  })

  test('未知類型回 null 且不亂猜地標／時間', () => {
    const r = extract('這裡有點奇怪')
    expect(r.eventType).toBeNull()
    expect(r.locationText).toBeNull()
    expect(r.timeText).toBeNull()
  })

  test('空白或非字串輸入回全 null', () => {
    expect(extract('')).toEqual({ eventType: null, locationText: null, timeText: null })
    expect(extract(null)).toEqual({ eventType: null, locationText: null, timeText: null })
    expect(extract(undefined)).toEqual({ eventType: null, locationText: null, timeText: null })
  })
})
