// 從自然語言描述抽出事件類型、地點與時間詞。
// 純函式：只讀 taxonomy.json，不做任何 I/O 或副作用。
import taxonomy from '../mocks/taxonomy.json'

// 地址／地標的粗略樣式。地址優先於地標；皆為最佳努力（best effort）。
const LOCATION_RE =
  /[\u4e00-\u9fa5]{1,8}(?:路|街)(?:[一二三四五六七八九十百零\d]{1,3}段)?(?:[一二三四五六七八九十百零\d]{1,3}巷)?(?:\d{1,3}弄)?(?:\d{1,4}號)?|[\u4e00-\u9fa5]{1,6}(?:公園|車站|捷運站|醫院|學校|市場|廣場|大樓|橋)/

function normalize(text) {
  return typeof text === 'string' ? text : ''
}

// 掃描所有事件類型關鍵詞，取「最長命中」以避免短詞蓋過長詞。
function matchEventType(text) {
  let bestType = null
  let bestLength = 0
  taxonomy.eventTypes.forEach((entry) => {
    entry.keywords.forEach((keyword) => {
      if (text.includes(keyword) && keyword.length > bestLength) {
        bestType = entry.type
        bestLength = keyword.length
      }
    })
  })
  return bestType
}

// 依 taxonomy 定義的順序回傳第一個命中的時間詞原文。
function matchTime(text) {
  for (const entry of taxonomy.timeKeywords) {
    const match = text.match(new RegExp(entry.regex))
    if (match) return match[0]
  }
  return null
}

export function extract(text) {
  const source = normalize(text)
  if (!source) return { eventType: null, locationText: null, timeText: null }

  const eventType = matchEventType(source)
  const timeText = matchTime(source)
  // 先把時間詞從來源字串移除，避免地址樣式把它一起吃進地點（如「今天中華路」）。
  const withoutTime = timeText ? source.replace(timeText, ' ') : source
  const locationMatch = withoutTime.match(LOCATION_RE)

  return {
    eventType: eventType || null,
    locationText: locationMatch ? locationMatch[0] : null,
    timeText,
  }
}

export default { extract }
