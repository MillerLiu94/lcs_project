// 福利／活動搜尋規則（純函式，無 I/O、無狀態）。
// 由 welfareService（USE_MOCK 路徑）與 mock adapter 共用，確保結果一致。
// 管線：可靠度檢查 → 條件/時效過濾 → 失敗來源排除 → 去重 → 相關性排序 → 標記。
import { isExpired, inRange } from '../utils/timeFilter'
import { sortByRelevance } from '../utils/ranking'

// 每筆結果必須具備的欄位（S2 §20：來源／發布日／活動日／原連結）。
const REQUIRED_FIELDS = ['id', 'title', 'source', 'publishedAt', 'eventDate', 'url']

function isFilled(value) {
  return typeof value === 'string' ? value.trim() !== '' : value != null
}

// 低信心判定：缺任一必要欄位或活動日無法解析者，一律不可呈現。
function isReliable(item) {
  if (!item || typeof item !== 'object') return false
  if (!REQUIRED_FIELDS.every((field) => isFilled(item[field]))) return false
  return !Number.isNaN(new Date(item.eventDate).getTime())
}

// 條件比對採寬鬆子字串（與 utils/ranking 同一口徑）；未指定條件時不篩除。
function facetMatches(item, value) {
  if (!isFilled(value)) return true
  const needle = String(value).trim()
  return `${item.title || ''} ${item.source || ''}`.includes(needle)
}

function timeMatches(item, time, now) {
  if (!time || time === 'all') return true
  return inRange(item.eventDate, time, now)
}

// 依 title＋eventDate 去重，保留首筆（穩定、與來源順序一致）。
export function dedupeWelfare(items) {
  const seen = new Set()
  const out = []
  for (const item of Array.isArray(items) ? items : []) {
    const key = `${item.title}\u0000${item.eventDate}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

/**
 * 篩選並整理福利／活動結果。
 * @returns {{results: object[], partial: boolean, failedSources: string[]}}
 *   無可靠結果時一律回標準空狀態（partial:false、failedSources:[]）。
 */
export function selectWelfare(items, params = {}, { now = new Date(), failedSources = [] } = {}) {
  const list = Array.isArray(items) ? items : []
  const failed = new Set((Array.isArray(failedSources) ? failedSources : []).map(String))
  const p = params && typeof params === 'object' ? params : {}

  // 1) 可靠度 + 條件 + 時效（時效相對 now，已過期即淘汰）。
  const matched = list.filter(
    (item) =>
      isReliable(item) &&
      facetMatches(item, p.type) &&
      facetMatches(item, p.target) &&
      timeMatches(item, p.time, now) &&
      !isExpired(item.eventDate, now)
  )

  // 2) 失敗來源：先排除再排序／去重，避免失敗來源的項目壓掉其他來源的同名活動。
  const presentFailed = [...new Set(matched.filter((i) => failed.has(i.source)).map((i) => i.source))]
  const available = matched.filter((i) => !failed.has(i.source))

  // 3) 去重（title＋eventDate）後再依相關性（含地區）／時間排序。
  const results = sortByRelevance(dedupeWelfare(available), { region: p.region })

  // 4) 標記：有結果才算部分失敗；無可靠結果時正規化為空狀態。
  const hasResults = results.length > 0
  return {
    results,
    partial: hasResults && presentFailed.length > 0,
    failedSources: hasResults ? presentFailed : [],
  }
}

export default { selectWelfare, dedupeWelfare }
