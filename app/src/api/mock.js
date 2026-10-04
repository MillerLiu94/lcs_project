import MockAdapter from 'axios-mock-adapter'
import { classifyText } from '../services/intentRules'
import { scorePlaces } from '../services/placeScoring'
import { selectEvents } from '../services/eventRules'
import eventStore from '../services/eventStore'
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

function registerEvents(adapter) {
  // 列表：查詢參數（region/time/type/status）交由純規則處理。
  adapter.onGet('/api/events').reply((config) => {
    const params = config.params || {}
    return [200, selectEvents(eventStore.all(), params)]
  })

  // 新增：建立事件並存入共用記憶體來源。
  adapter.onPost('/api/events').reply((config) => {
    let draft = {}
    try {
      draft = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}
    } catch (error) {
      draft = {}
    }
    return [201, eventStore.add(draft)]
  })

  // 詳情：未知 id 回 null（代表已下架）。
  adapter.onGet(/\/api\/events\/[^/]+$/).reply((config) => {
    const id = decodeURIComponent(String(config.url).split('/').pop())
    return [200, eventStore.find(id)]
  })
}

const REGISTRATIONS = [registerHealth, registerIntent, registerPlaces, registerEvents]

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

// 測試用：清空歷史與一次性 handler，並還原種子，重新套用預設註冊。
export function resetMock() {
  if (!mock) return null
  mock.reset()
  eventStore.reset()
  registerAll(mock)
  return mock
}
