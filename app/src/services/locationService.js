import http from '../api/http'
import { isScenario } from '../mocks/demoScenarios'
import { scorePlaces, nearestPlace } from './placeScoring'

// G3 的可切換縫（swappable seam）：單一開關決定位置來源。
//   true  → 本地讀 places.json 計分，不需要後端（預設）。
//   false → 打真後端 /api/places（forward seam）。
// 以 VITE_USE_MOCK=false 覆寫；預設使用 mock。
const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== 'false'

// 決策模式（與 S6 §14.4 對應）。
const MODE = {
  GPS: 'gps',
  CANDIDATE: 'candidate',
  MAP_CONFIRM: 'map-confirm',
  LOW_PRECISION: 'low-precision',
  UNCONFIRMED: 'unconfirmed',
}

// 只有來源本身就帶真實座標時才回傳，否則 null（絕不合成）。
function coordinatesOf(candidate) {
  if (!candidate) return null
  const hasCoords = typeof candidate.lat === 'number' && typeof candidate.lng === 'number'
  return hasCoords ? { lat: candidate.lat, lng: candidate.lng } : null
}

/**
 * 純決策：依 onSite / permissionGranted / candidates / wantsMap 收斂模式。
 * 任何路徑都不得合成座標：coordinates 只可能來自 (a) 裝置定位或地圖
 * （交由呼叫端填入，此處為 null）或 (b) 候選本身已帶的真實座標。
 */
export function decide({ onSite, permissionGranted, candidates, wantsMap } = {}) {
  const list = Array.isArray(candidates) ? candidates : []

  // 1. 在現場且已授權 → 用裝置定位（座標由 Geolocation 提供）。
  if (onSite === true && permissionGranted === true) {
    return { mode: MODE.GPS, coordinates: null }
  }

  // 2. 唯一候選且自帶真實座標 → 直接採用。
  if (list.length === 1) {
    const coordinates = coordinatesOf(list[0])
    if (coordinates) return { mode: MODE.CANDIDATE, coordinates }
    // 單一候選卻無座標：不可信，仍需地圖確認。
    return { mode: MODE.MAP_CONFIRM, coordinates: null }
  }

  // 3. 多個候選 → 交給地圖消歧（該畫面仍提供「不確定，先送出」）。
  if (list.length > 1) {
    return { mode: MODE.MAP_CONFIRM, coordinates: null }
  }

  // 4. 無候選：願意用地圖 → 低精度大概區域；否則未確認。
  if (wantsMap === true) {
    return { mode: MODE.LOW_PRECISION, coordinates: null }
  }
  return { mode: MODE.UNCONFIRMED, coordinates: null }
}

/** 文字 → 候選地點（依命中分數由高到低）。 */
async function geocode(text) {
  if (USE_MOCK) {
    if (isScenario('error')) throw new Error('mock scenario: places error')
    if (isScenario('empty')) return []
    return scorePlaces(text)
  }
  const { data } = await http.get('/api/places', { params: { q: text } })
  return Array.isArray(data) ? data : (data && data.candidates) || []
}

/** 座標 → 地址文字；無對應地點時回空字串（不含任何 UI 文案）。 */
async function reverse(lat, lng) {
  if (USE_MOCK) {
    if (isScenario('error')) throw new Error('mock scenario: places error')
    const place = nearestPlace(lat, lng)
    return place ? place.address : ''
  }
  const { data } = await http.get('/api/places/reverse', { params: { lat, lng } })
  return data && data.address ? data.address : ''
}

export default { geocode, reverse, decide }
