// 福利／活動搜尋模組（S6 §4，P8–P11）：集中管理關鍵字、搜尋階段與結果。
// 只負責狀態與呼叫 welfareService.search；不在元件裡直接打 API（G2）。
import welfareService from '../../services/welfareService'

// 搜尋階段：idle（P8 輸入）→ loading → processing → done（P10／P11）。
// 逾時不另立階段：停在 processing 並把 timeout 設為 true，讓畫面顯示「繼續等待／重新搜尋」。
const PHASES = ['idle', 'loading', 'processing', 'done', 'error']

function cleanKeyword(value) {
  return typeof value === 'string' ? value.trim() : ''
}

// 使用者已確認的位置名稱／地址，作為相關性排序提示（不硬性剪除結果）。
function areaOfLocation(rootState) {
  const selected = rootState && rootState.location && rootState.location.selected
  if (!selected || typeof selected !== 'object') return ''
  return selected.name || selected.address || selected.text || ''
}

export default {
  namespaced: true,
  state: () => ({
    // 保留使用者輸入（S4 §5）：搜尋期間與失敗後都不清空。
    keyword: '',
    phase: 'idle',
    results: [],
    partial: false,
    failedSources: [],
    timeout: false,
    error: '',
  }),
  mutations: {
    setKeyword(state, keyword) {
      state.keyword = cleanKeyword(keyword)
    },
    setPhase(state, phase) {
      state.phase = PHASES.includes(phase) ? phase : 'idle'
    },
    setResults(state, results) {
      state.results = Array.isArray(results) ? results : []
    },
    setPartial(state, partial) {
      state.partial = Boolean(partial)
    },
    setFailedSources(state, sources) {
      state.failedSources = Array.isArray(sources) ? sources.slice() : []
    },
    setTimeout(state, value) {
      state.timeout = Boolean(value)
    },
    setError(state, error) {
      state.error = error ? String(error) : ''
    },
    // 每次新搜尋前清掉上一輪的結果與旗標，避免殘影。
    beginSearch(state) {
      state.results = []
      state.partial = false
      state.failedSources = []
      state.timeout = false
      state.error = ''
    },
  },
  actions: {
    /** P8 送出：以關鍵字搜尋。@returns {Promise<Array|null>} */
    search({ dispatch }, keyword) {
      return dispatch('run', { keyword: cleanKeyword(keyword), relaxed: false })
    },

    /** P10／P11「重新搜尋」：用同一個關鍵字再找一次。 */
    retry({ state, dispatch }) {
      return dispatch('run', { keyword: state.keyword, relaxed: false })
    },

    /**
     * P11「放寬條件」：不再限制關鍵字，改用「全部近期」。
     * 這是誠實的放寬，不是為湊數補位。
     */
    widen({ state, dispatch }) {
      return dispatch('run', { keyword: state.keyword, relaxed: true })
    },

    /**
     * 實際搜尋流程：loading（理解）→ processing（搜尋／整理）→ done。
     * 逾時（Task 13）必須先於 results 讀取。
     * @returns {Promise<Array|null>} 結果清單；逾時／失敗回 null。
     */
    async run({ commit, rootState }, { keyword, relaxed }) {
      commit('setKeyword', keyword)
      commit('beginSearch')
      commit('setPhase', 'loading')
      // 讓 loading 有機會先渲染，避免直接跳到 processing（不白屏）。
      await Promise.resolve()
      commit('setPhase', 'processing')

      const params = {}
      if (!relaxed && keyword) params.target = keyword
      const area = areaOfLocation(rootState)
      if (area) params.region = area

      try {
        const response = await welfareService.search(params)
        // 交棒自 Task 13：timeout 是訊號，必須在讀 results 之前處理。
        if (response && response.timeout) {
          commit('setTimeout', true)
          return null
        }
        commit('setPartial', response && response.partial)
        commit('setFailedSources', response && response.failedSources)
        const results = response && Array.isArray(response.results) ? response.results : []
        commit('setResults', results)
        commit('setPhase', 'done')
        return results
      } catch (error) {
        commit('setError', 'search-failed')
        commit('setResults', [])
        commit('setPhase', 'error')
        return null
      }
    },
  },
}
