// 意圖分流模組：把萬用輸入的文字分類後，決定要導向哪個流程。
// 分類交由 intentService（Task 9）；此模組只負責「意圖 → 路由」的映射。
import intentService from '../../services/intentService'

const ROUTE_BY_INTENT = {
  report: 'report',
  query: 'events',
  welfare: 'welfare',
  ambiguous: 'clarify',
}

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
     * report 時同時把原話寫入 report.draft.description。
     * @returns {Promise<{ name: string, params?: object, query?: object }>}
     */
    async routeFromText({ commit }, text) {
      const result = await intentService.classify(text)
      const { intent } = result
      commit('remember', { text, intent })

      if (intent === 'report') {
        commit('report/setDescription', text, { root: true })
      }

      return { name: ROUTE_BY_INTENT[intent] || 'clarify' }
    },
  },
}
