// 事件篩選／建立規則（純函式，無 I/O、無狀態）。
// 由 eventService（USE_MOCK 路徑）與 mock adapter 共用，確保結果一致。
import { inRange } from '../utils/timeFilter'
import { sortByRelevance } from '../utils/ranking'

// 未指定時間時視為「近期」：只看本日曆月，非全部歷史。
export const DEFAULT_TIME = 'month'

function textOf(value) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && typeof value.text === 'string') return value.text
  return ''
}

function matches(event, params, now) {
  if (!event) return false
  if (params.type && event.type !== params.type) return false
  if (params.status && event.status !== params.status) return false
  const range = params.time || DEFAULT_TIME
  if (range !== 'all' && !inRange(event.reportedAt, range, now)) return false
  return true
}

/**
 * 依 filters 精確過濾後依相關性排序。
 * region 僅作為排序（「與我相關」），非硬性過濾。
 */
export function selectEvents(events, params = {}, now = new Date()) {
  const list = Array.isArray(events) ? events : []
  const filtered = list.filter((event) => matches(event, params, now))
  return sortByRelevance(filtered, { region: params.region })
}

// 標題由使用者自己的描述衍生（非 UI 文案）；過長時截短。
function titleOf(description, category) {
  const text = description.replace(/\s+/g, ' ').trim()
  if (!text) return category || ''
  return text.length > 30 ? text.slice(0, 30) : text
}

/**
 * 由申報草稿建立完整 Event。
 * 座標只採用草稿提供的值，缺漏時一律 null（絕不合成）。
 */
export function createEvent(draft = {}, { id, now = new Date() } = {}) {
  const source = draft && typeof draft === 'object' ? draft : {}
  const location = source.location && typeof source.location === 'object' ? source.location : {}
  const description = typeof source.description === 'string' ? source.description : ''

  return {
    id: id != null ? id : `e-${now.getTime()}`,
    type: source.category || null,
    title: titleOf(description, source.category),
    placeText: location.text || location.placeText || '',
    coordinates: location.coordinates || null,
    timeText: textOf(source.time),
    status: 'reported',
    description,
    photo: source.photo || null,
    reportedAt: now.toISOString(),
  }
}

export default { selectEvents, createEvent, DEFAULT_TIME }
