// 意圖分流模組：把萬用輸入的文字解析成意圖後，決定要導向哪個流程。
// 單一意圖 → 直接進對應流程；多意圖或無法判斷 → 綜合結果頁（以 ?q= 帶上原話）。
import intentService from '../../services/intentService'

export default {
  namespaced: true,
  state: () => ({
    lastText: '',
    lastIntents: [],
  }),
  mutations: {
    remember(state, payload) {
      const data = payload && typeof payload === 'object' ? payload : {}
      state.lastText = typeof data.text === 'string' ? data.text : ''
      state.lastIntents = Array.isArray(data.intents) ? data.intents : []
    },
  },
  actions: {
    /**
     * 解析文字並回傳 vue-router 位置。
     * 1 個意圖 → 直接進對應流程（report 會把該子句寫入草稿；query／welfare 以 ?q= 帶上）。
     * 0 或 2+ 個意圖 → `results`（綜合結果頁），以 ?q= 帶上原話。
     * @returns {Promise<{ name: string, query?: object }>}
     */
    async routeFromText({ commit }, text) {
      const source = typeof text === 'string' ? text : ''
      const intents = await intentService.parseIntents(source)
      commit('remember', { text: source, intents })

      if (intents.length === 1) {
        const { intent, text: clause } = intents[0]
        if (intent === 'report') {
          commit('report/setDescription', clause, { root: true })
          return { name: 'report' }
        }
        if (intent === 'query') return { name: 'events', query: { q: clause } }
        if (intent === 'welfare') return { name: 'welfare', query: { q: clause } }
      }
      return { name: 'results', query: { q: source } }
    },
  },
}
