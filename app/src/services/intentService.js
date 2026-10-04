import http from '../api/http'
import { isScenario } from '../mocks/demoScenarios'
import { classifyText } from './intentRules'

// G3 的可切換縫（swappable seam）：單一開關決定意圖來源。
//   true  → 本地規則計算，不需要後端（預設）。
//   false → 打真後端 /api/intent（forward seam）。
// 以 VITE_USE_MOCK=false 覆寫；預設使用 mock。
const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== 'false'

/**
 * 將使用者輸入分流為 report / query / welfare / ambiguous。
 * ?mock=ambiguous 時一律回 ambiguous（demo 強制走 P12 釐清）。
 * @returns {Promise<{ intent: string, confidence: number, extracted: object }>}
 */
async function classify(text) {
  if (USE_MOCK) {
    if (isScenario('ambiguous')) return { intent: 'ambiguous', confidence: 0, extracted: {} }
    return classifyText(text)
  }
  const { data } = await http.post('/api/intent', { text })
  return data
}

export { USE_MOCK }
export default { classify }
