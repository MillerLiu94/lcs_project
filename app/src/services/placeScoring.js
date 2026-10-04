// 地點比對的純計分引擎：無 I/O、無框架依賴。
// 由 locationService（USE_MOCK 路徑）與 mock adapter 共用，確保結果一致。
import places from '../mocks/places.json'

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

// 將查詢切成有意義的詞：空白、逗號、頓號等標點皆視為分隔。
function terms(text) {
  const source = normalize(text)
  if (!source) return []
  return source.split(/[\s,，、。;；:：/]+/).filter(Boolean)
}

// 單一詞對單一地點取最佳命中：完全相同 > 別名包含查詢 > 查詢包含別名 > 地址。
function scoreTerm(place, term) {
  const segments = [place.name, ...(place.aliases || [])].map(normalize)
  let best = 0
  for (const segment of segments) {
    if (!segment) continue
    if (segment === term) return 3
    if (term.includes(segment)) best = Math.max(best, 2)
    else if (segment.includes(term)) best = Math.max(best, 1)
  }
  if (best === 0 && normalize(place.address).includes(term)) best = 1
  return best
}

function scorePlace(place, list) {
  return list.reduce((total, term) => total + scoreTerm(place, term), 0)
}

export function toCandidate(place, score) {
  return {
    id: place.id,
    name: place.name,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    score,
  }
}

/**
 * 依文字為種子地點計分，回傳由高到低的候選（分數 0 者剔除）。
 * 「中華路」＋「全家」等多詞命中會累加，因此該地點會明顯領先。
 */
export function scorePlaces(text, source = places) {
  const list = terms(text)
  if (!list.length) return []
  return source
    .map((place) => ({ place, score: scorePlace(place, list) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || String(a.place.id).localeCompare(String(b.place.id)))
    .map((entry) => toCandidate(entry.place, entry.score))
}

/** 取距離座標最近的地點（純函式；供 mock reverse 使用）。 */
export function nearestPlace(lat, lng, source = places) {
  let best = null
  let bestDistance = Infinity
  source.forEach((place) => {
    const distance = (place.lat - lat) ** 2 + (place.lng - lng) ** 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = place
    }
  })
  return best
}

export default { scorePlaces, toCandidate, nearestPlace }
