// 時間相關的純函式：判斷是否過期、是否落在指定範圍。
// range 採「日曆區間」語意（今天／本週／本月），符合「今天、這週、這個月」直覺。

function toDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfWeek(date) {
  const start = startOfDay(date)
  const offset = (start.getDay() + 6) % 7 // 以週一為一週起點
  start.setDate(start.getDate() - offset)
  return start
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date, days) {
  const next = new Date(date.getTime())
  next.setDate(next.getDate() + days)
  return next
}

export function isExpired(dateStr, now = new Date()) {
  const date = toDate(dateStr)
  if (!date) return false // 缺日期／非法日期不視為過期
  return date.getTime() < now.getTime()
}

export function inRange(dateStr, range, now = new Date()) {
  if (range === 'all') return true // 不設時間條件

  const date = toDate(dateStr)
  if (!date) return false

  const time = date.getTime()
  switch (range) {
    case 'today': {
      const start = startOfDay(now)
      const end = addDays(start, 1)
      return time >= start.getTime() && time < end.getTime()
    }
    case 'week': {
      const start = startOfWeek(now)
      const end = addDays(start, 7)
      return time >= start.getTime() && time < end.getTime()
    }
    case 'month': {
      const start = startOfMonth(now)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      return time >= start.getTime() && time < end.getTime()
    }
    default:
      return false
  }
}

export default { isExpired, inRange }
