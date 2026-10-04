// 把 `?mock=` 情境轉成各 service／mock adapter 可用的查詢。
// 唯一讀取 location.search 的地方仍是 scenarios.js；此模組只集中情境語意，
// 讓 welfare／intent／location 與 mock 端點共用同一套判斷（不散落 location.search）。
import { scenario } from './scenarios'

// `?mock=partial` 示範「部分來源暫時無法取得」；welfareRules 會排除並標記 partial。
export const DEMO_FAILED_SOURCES = ['萬華區公所']

/** @param {'empty'|'timeout'|'partial'|'error'|'ambiguous'} name */
export function isScenario(name) {
  return scenario() === name
}

/** `?mock=partial` 時回傳示範失敗來源，其餘（含無 ?mock=）回空陣列。 */
export function welfareFailedSources() {
  return isScenario('partial') ? DEMO_FAILED_SOURCES : []
}

export default { isScenario, welfareFailedSources, DEMO_FAILED_SOURCES }
