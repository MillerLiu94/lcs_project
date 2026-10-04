// 查詢目前事件模組（S7 §2.2）：集中管理篩選條件與事件清單。
// 只負責狀態與呼叫 eventService；不在元件裡直接打 API（G2）。
import eventService from '../../services/eventService'

// 預設條件為「近期」：未特別指定時看本日曆月，而非全部歷史（S1 §3.2.2）。
const DEFAULT_FILTERS = { time: 'month', type: '', status: '' }

const FILTER_KEYS = ['time', 'type', 'status']

function emptyFilters() {
  return { ...DEFAULT_FILTERS }
}

// 「與我相關」的排序依據：使用者目前位置的名稱／地址（若有的話）。
// 純排序提示，不會硬性剪除結果。
function areaOfLocation(rootState) {
  const selected = rootState && rootState.location && rootState.location.selected
  if (!selected || typeof selected !== 'object') return ''
  return selected.name || selected.address || selected.text || ''
}

export default {
  namespaced: true,
  state: () => ({
    // 地區 chip 的值（空字串＝未選地區）。loadEvents 會將它轉為 filterRegion 硬篩。
    region: '',
    filters: emptyFilters(),
    events: [],
    loading: false,
    error: '',
    // 單一事件詳情（P7）。detailMissing 表示事件不存在或已下架。
    detail: null,
    detailLoading: false,
    detailMissing: false,
    detailError: '',
  }),
  mutations: {
    setRegion(state, region) {
      state.region = typeof region === 'string' ? region : ''
    },
    setFilters(state, partial) {
      const next = partial && typeof partial === 'object' ? partial : {}
      FILTER_KEYS.forEach((key) => {
        if (key in next) state.filters[key] = typeof next[key] === 'string' ? next[key] : ''
      })
    },
    setEvents(state, events) {
      state.events = Array.isArray(events) ? events : []
    },
    setLoading(state, loading) {
      state.loading = Boolean(loading)
    },
    setError(state, error) {
      state.error = error ? String(error) : ''
    },
    resetFilters(state) {
      state.region = ''
      state.filters = emptyFilters()
    },
    setDetail(state, event) {
      state.detail = event || null
    },
    // 找不到／已下架時為 true，讓畫面顯示「此事件已移除」；載入失敗不算是「已移除」。
    setDetailMissing(state, missing) {
      state.detailMissing = Boolean(missing)
    },
    setDetailLoading(state, loading) {
      state.detailLoading = Boolean(loading)
    },
    setDetailError(state, error) {
      state.detailError = error ? String(error) : ''
    },
  },
  actions: {
    /**
     * 載入事件。空結果回 [] 且不算錯誤（error 保持空）。
     * region（排序）取自使用者位置；filterRegion（硬篩）來自地區 chip。
     * @returns {Promise<Array>} 事件清單
     */
    async loadEvents({ commit, state, rootState }) {
      commit('setLoading', true)
      commit('setError', '')
      try {
        const params = { ...state.filters }
        const area = areaOfLocation(rootState)
        if (area) params.region = area
        if (state.region) {
          params.filterRegion = state.region
          if (!area) params.region = state.region
        }
        const events = await eventService.list(params)
        commit('setEvents', events)
        return events
      } catch (error) {
        commit('setError', 'load-failed')
        commit('setEvents', [])
        return []
      } finally {
        commit('setLoading', false)
      }
    },

    /**
     * 更新篩選條件並重新載入。
     * partial 可含 region（地區 chip，走硬篩）或 time／type／status。
     * @returns {Promise<Array>}
     */
    setFilter({ commit, dispatch }, partial) {
      const next = partial && typeof partial === 'object' ? partial : {}
      if ('region' in next) commit('setRegion', next.region)
      commit('setFilters', next)
      return dispatch('loadEvents')
    },

    /** 回到預設（近期、無地區、無類型／狀態）並重新載入。 */
    clearFilters({ commit, dispatch }) {
      commit('resetFilters')
      return dispatch('loadEvents')
    },

    /**
     * 載入單一事件詳情（P7）。id 找不到（已下架／未知）回 null 且
     * detailMissing 為 true，讓畫面顯示「此事件已移除」與回列表。
     * @returns {Promise<Object|null>} 事件或 null
     */
    async loadDetail({ commit }, id) {
      commit('setDetailLoading', true)
      commit('setDetailError', '')
      try {
        const event = await eventService.get(id)
        commit('setDetail', event)
        commit('setDetailMissing', !event)
        return event
      } catch (error) {
        commit('setDetailError', 'load-failed')
        commit('setDetail', null)
        commit('setDetailMissing', false)
        return null
      } finally {
        commit('setDetailLoading', false)
      }
    },
  },
}
