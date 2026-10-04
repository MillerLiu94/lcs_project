// 相關性排序：先讓地區符合的項目排前面，再依時間新近排序。
// 純函式：回傳新陣列，不改動傳入的 items。

const REGION_FIELDS = ['region', 'placeText', 'address', 'source', 'title']
const DATE_FIELDS = ['reportedAt', 'eventDate', 'publishedAt', 'createdAt', 'date']

function regionRank(item, region) {
  if (!region) return 0 // 未指定地區時不區分
  const haystack = REGION_FIELDS.map((field) => (item && item[field]) || '').join(' ')
  return haystack.includes(region) ? 0 : 1
}

function toTimestamp(value) {
  if (!value) return -Infinity
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? -Infinity : time
}

function recency(item) {
  for (const field of DATE_FIELDS) {
    const time = toTimestamp(item && item[field])
    if (time !== -Infinity) return time
  }
  return -Infinity // 無可用日期者排最後
}

export function sortByRelevance(items, params = {}) {
  if (!Array.isArray(items)) return []
  const region = params && params.region ? String(params.region) : ''

  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const byRegion = regionRank(a.item, region) - regionRank(b.item, region)
      if (byRegion !== 0) return byRegion
      const byRecency = recency(b.item) - recency(a.item)
      if (byRecency !== 0) return byRecency
      return a.index - b.index // 穩定排序
    })
    .map((entry) => entry.item)
}

export default { sortByRelevance }
