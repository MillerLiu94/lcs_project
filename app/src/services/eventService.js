import http from '../api/http'
import eventStore from './eventStore'
import { selectEvents } from './eventRules'

// G3 的可切換縫（swappable seam）：單一開關決定事件來源。
//   true  → 本地讀 events.json 過濾／排序、新增進記憶體（預設）。
//   false → 打真後端 /api/events（forward seam）。
// 以 VITE_USE_MOCK=false 覆寫；預設使用 mock。
const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== 'false'

/**
 * 列出事件；未指定時間時預設近期（非全部歷史）。空結果回 []。
 * params.region 僅影響相關性排序；params.filterRegion 才會硬性剪除不符地區。
 */
async function list(params = {}) {
  if (USE_MOCK) return selectEvents(eventStore.all(), params)
  const { data } = await http.get('/api/events', { params })
  return Array.isArray(data) ? data : []
}

/** 取得單一事件；不存在（已下架／未知）回 null。 */
async function get(id) {
  if (USE_MOCK) return eventStore.find(id)
  const { data } = await http.get(`/api/events/${id}`)
  return data || null
}

/** 由申報草稿建立事件並回傳完整 Event。 */
async function report(draft = {}) {
  if (USE_MOCK) return eventStore.add(draft)
  const { data } = await http.post('/api/events', draft)
  return data
}

export { USE_MOCK }
export default { list, get, report }
