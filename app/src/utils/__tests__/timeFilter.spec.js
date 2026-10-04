import { isExpired, inRange } from '../timeFilter'

// 以本地時間明確建構日期，避免測試受執行環境時區影響。
const iso = (y, m, d, h = 0, min = 0, s = 0, ms = 0) =>
  new Date(y, m, d, h, min, s, ms).toISOString()

describe('timeFilter.isExpired', () => {
  const now = new Date(2026, 9, 4, 12, 0, 0)

  test('過去時間視為過期', () => {
    expect(isExpired(iso(2026, 9, 3, 12), now)).toBe(true)
    expect(isExpired(iso(2026, 8, 30), now)).toBe(true)
  })

  test('未來時間未過期', () => {
    expect(isExpired(iso(2026, 9, 5, 12), now)).toBe(false)
  })

  test('等於 now 的邊界不算過期', () => {
    expect(isExpired(now.toISOString(), now)).toBe(false)
  })

  test('缺少或非法日期不算過期', () => {
    expect(isExpired(null, now)).toBe(false)
    expect(isExpired(undefined, now)).toBe(false)
    expect(isExpired('', now)).toBe(false)
    expect(isExpired('not-a-date', now)).toBe(false)
  })
})

describe('timeFilter.inRange', () => {
  // 2026-10-04 是星期日；以星期三 2026-10-07 測「本週」（週一起算）。
  const now = new Date(2026, 9, 7, 12, 0, 0)

  test('today：當日 00:00 起算，含起點、不含隔日', () => {
    expect(inRange(iso(2026, 9, 7, 0, 0, 0), 'today', now)).toBe(true)
    expect(inRange(iso(2026, 9, 7, 12, 0, 0), 'today', now)).toBe(true)
    expect(inRange(iso(2026, 9, 6, 23, 59, 59, 999), 'today', now)).toBe(false)
    expect(inRange(iso(2026, 9, 8, 0, 0, 0), 'today', now)).toBe(false)
  })

  test('week：本週一 00:00 起算，含起點、不含下週一', () => {
    expect(inRange(iso(2026, 9, 5, 0, 0, 0), 'week', now)).toBe(true)
    expect(inRange(iso(2026, 9, 11, 23, 59, 59), 'week', now)).toBe(true)
    expect(inRange(iso(2026, 9, 4, 23, 59, 59, 999), 'week', now)).toBe(false)
    expect(inRange(iso(2026, 9, 12, 0, 0, 0), 'week', now)).toBe(false)
  })

  test('month：本月 1 日 00:00 起算，含起點、不含下月 1 日', () => {
    expect(inRange(iso(2026, 9, 1, 0, 0, 0), 'month', now)).toBe(true)
    expect(inRange(iso(2026, 9, 31, 23, 59, 59), 'month', now)).toBe(true)
    expect(inRange(iso(2026, 8, 30, 23, 59, 59, 999), 'month', now)).toBe(false)
    expect(inRange(iso(2026, 10, 1, 0, 0, 0), 'month', now)).toBe(false)
  })

  test('all：任何日期都在範圍內', () => {
    expect(inRange(iso(2020, 0, 1), 'all', now)).toBe(true)
    expect(inRange(iso(2030, 11, 31), 'all', now)).toBe(true)
  })

  test('非法日期：all 仍為 true，時間範圍為 false', () => {
    expect(inRange(null, 'all', now)).toBe(true)
    expect(inRange('not-a-date', 'all', now)).toBe(true)
    expect(inRange(null, 'today', now)).toBe(false)
    expect(inRange('not-a-date', 'week', now)).toBe(false)
    expect(inRange(undefined, 'month', now)).toBe(false)
  })

  test('未知 range 回 false', () => {
    expect(inRange(iso(2026, 9, 7), 'year', now)).toBe(false)
  })
})
