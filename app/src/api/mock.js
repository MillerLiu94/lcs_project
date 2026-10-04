import MockAdapter from 'axios-mock-adapter'

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

const REGISTRATIONS = [registerHealth]

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
