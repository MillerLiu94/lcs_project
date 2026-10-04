// ?mock=empty|timeout|partial|error|ambiguous 情境開關。
// 目的：讓每一種失敗／邊界狀態都能在 demo 現場強制觸發。
const VALID_SCENARIOS = ['empty', 'timeout', 'partial', 'error', 'ambiguous']

/**
 * 從網址查詢字串解析 mock 情境。
 * 安全地在沒有 DOM / location.search 的環境（例如 SSR、部分測試）回傳 null。
 * @returns {'empty'|'timeout'|'partial'|'error'|'ambiguous'|null}
 */
export function scenario() {
  if (typeof location === 'undefined' || !location || !location.search) {
    return null
  }
  const value = new URLSearchParams(location.search).get('mock')
  return VALID_SCENARIOS.includes(value) ? value : null
}

export { VALID_SCENARIOS }
