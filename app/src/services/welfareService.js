import http from '../api/http'
import welfare from '../mocks/welfare.json'
import { isScenario, welfareFailedSources } from '../mocks/demoScenarios'
import { selectWelfare } from './welfareRules'

// G3 的可切換縫（swappable seam）：單一開關決定福利／活動來源。
//   true  → 本地讀 welfare.json 過濾／去重／排序（預設）。
//   false → 打真後端 /api/welfare（forward seam）。
// 以 VITE_USE_MOCK=false 覆寫；預設使用 mock。
const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== 'false'

/**
 * 搜尋福利／活動。
 * @param {{type?:string,target?:string,time?:string,region?:string}} params
 * @returns {Promise<{results:object[],partial:boolean,failedSources:string[],timeout?:boolean}>}
 *   低信心／已過期／重複者不呈現；無可靠結果時回標準空狀態，不為湊數補位。
 *   ?mock= 可強制 timeout／empty／partial／error（無參數時完全維持預設）。
 */
async function search(params = {}) {
  if (USE_MOCK) {
    if (isScenario('error')) throw new Error('mock scenario: welfare error')
    if (isScenario('timeout')) {
      // 設計上 http timeout 為 15s；此處以旗標直接讓 store 顯示逾時狀態。
      return { results: [], partial: false, failedSources: [], timeout: true }
    }
    if (isScenario('empty')) {
      return { results: [], partial: false, failedSources: [] }
    }
    return selectWelfare(welfare, params, { failedSources: welfareFailedSources() })
  }
  const { data } = await http.get('/api/welfare', { params })
  return {
    results: Array.isArray(data && data.results) ? data.results : [],
    partial: Boolean(data && data.partial),
    failedSources: Array.isArray(data && data.failedSources) ? data.failedSources : [],
  }
}

export { USE_MOCK }
export default { search }
