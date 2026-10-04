// 意圖分流模組：把萬用輸入的文字分類後，決定要導向哪個流程。
// 分類交由 intentService（Task 9）；此模組只負責「意圖 → 路由」的映射。
import intentService from '../../services/intentService'

const ROUTE_BY_INTENT = {
  report: 'report',
  query: 'events',
  welfare: 'welfare',
  ambiguous: 'clarify',
}

// 需要帶著原話前往的流程：以 ?q= 攜帶，讓目的畫面接手（不讓辨識結果靜默遺失）。
const TEXT_CARRYING_INTENTS = ['query', 'welfare']

export default {
  namespaced: true,
  state: () => ({
    lastText: '',
    lastIntent: null,
  }),
  mutations: {
    remember(state, { text, intent }) {
      state.lastText = text
      state.lastIntent = intent
    },
  },
  actions: {
    /**
     * 分類文字並回傳 vue-router 位置。
     * report 時把原話寫入 report.draft.description。
     * query／welfare 時以 ?q= 帶著原話，讓目的畫面接手（不讓辨識結果遺失）。
     * @returns {Promise<{ name: string, params?: object, query?: object }>}
     */
    async routeFromText({ commit }, text) {
      const result = await intentService.classify(text)
      const { intent } = result
      commit('remember', { text, intent })

      if (intent === 'report') {
        commit('report/setDescription', text, { root: true })
      }

      const route = { name: ROUTE_BY_INTENT[intent] || 'clarify' }
      if (TEXT_CARRYING_INTENTS.includes(intent)) route.query = { q: text }
      return route
    },

    /**
     * P12 釐清：把使用者在釐清畫面的選擇轉成 vue-router 位置。
     * - welfare：直接前往福利搜尋。
     * - event：用 lastText 重新判斷回報／查詢（S6 §1.2）；能判斷就自動前往，
     *   回報時把原話帶入草稿；仍無法判斷 → 回傳 { name:'clarify-event' }，
     *   這是「同頁第二層」的描述子（非 router route），由 ClarifyView 接手。
     * - report／query：事件第二層的明確選擇。
     * @returns {Promise<{ name: string }>}
     */
    async resolveChoice({ commit, state }, choice) {
      if (choice === 'welfare') return { name: 'welfare' }
      if (choice === 'query') return { name: 'events' }
      if (choice === 'report') {
        commit('report/setDescription', state.lastText, { root: true })
        return { name: 'report' }
      }
      if (choice !== 'event') return { name: 'clarify' }

      const text = state.lastText || ''
      const { intent } = await intentService.classify(text)
      if (intent === 'report') {
        commit('report/setDescription', text, { root: true })
        return { name: 'report' }
      }
      if (intent === 'query') return { name: 'events' }
      return { name: 'clarify-event' }
    },
  },
}
