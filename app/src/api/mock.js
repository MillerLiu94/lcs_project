import MockAdapter from 'axios-mock-adapter'
import { classifyText } from '../services/intentRules'
import { scorePlaces } from '../services/placeScoring'
import places from '../mocks/places.json'

// 單一 mock adapter 實例（idempotent），僅供開發／測試使用。
let mock = null

// ---------------------------------------------------------------------------
// 端點註冊區
// 每個端點一個 register* 函式，集中列入下方 REGISTRATIONS。
// 後續任務（intent / places / events / welfare）在此擴充，
// 並可透過 getMock() 取得 adapter 以模擬延遲、錯誤、逾時。
// ---------------------------------------------------------------------------

function registerHealth(adapter) {
  adapter.onGet('/api/health').reply(200, { ok: true })
}

function registerIntent(adapter) {
  adapter.onPost('/api/intent').reply((config) => {
    let payload = {}
    try {
      payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}
    } catch (error) {
      payload = {}
    }
    return [200, classifyText(payload.text)]
  })
}

function registerPlaces(adapter) {
  // 不帶 q 時回傳地點目錄；帶 q 時以同一套純計分回傳候選。
  adapter.onGet('/api/places').reply((config) => {
    const q = config.params && config.params.q
    return [200, q ? scorePlaces(q) : places]
  })
}

const REGISTRATIONS = [registerHealth, registerIntent, registerPlaces]

function registerAll(adapter) {
  REGISTRATIONS.forEach((register) => register(adapter))
}

/**
 * 在非 production 環境把 mock adapter 掛到 http instance 上。
 * 重複呼叫會回傳同一個 adapter，避免覆寫既有註冊。
 */
export function setupMock(http, options = {}) {
  if (mock) return mock
  mock = new MockAdapter(http, { delayResponse: 600, ...options })
  registerAll(mock)
  return mock
}

export function getMock() {
  return mock
}

// 測試用：清空歷史與一次性 handler，重新套用預設註冊。
export function resetMock() {
  if (!mock) return null
  mock.reset()
  registerAll(mock)
  return mock
}
