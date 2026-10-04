// 申報流程的狀態模組：保存草稿與流程進度，不直接呼叫服務。
// Task 15 補上第一步「描述事件」的解析動作（describe）。
import { extract } from '../../utils/textExtract'

// 一筆申報至少要知道「發生什麼事」與「在哪裡」；分類由系統推斷（非必填）。
const REQUIRED_FIELDS = ['description', 'location']

function isEmpty(value) {
  return typeof value === 'string' ? value.trim().length === 0 : !value
}

function missingFields(draft) {
  return REQUIRED_FIELDS.filter((field) => isEmpty(draft[field]))
}

function emptyDraft() {
  return {
    description: '',
    category: '',
    location: null,
    time: '',
    photo: null,
  }
}

export default {
  namespaced: true,
  state: () => ({
    draft: emptyDraft(),
    step: 1,
    status: 'idle',
  }),
  mutations: {
    setDescription(state, description) {
      state.draft.description = typeof description === 'string' ? description : ''
    },
    setCategory(state, category) {
      state.draft.category = typeof category === 'string' ? category : ''
    },
  },
  actions: {
    /**
     * 解析使用者對事件的描述，填入 draft.description 與 draft.category。
     * 只負責理解文字，不負責導頁；回傳還缺哪些必填欄位供後續步驟使用。
     * @param {string} text 使用者原話
     * @returns {{ missing: string[] }}
     */
    describe({ commit, state }, text) {
      const source = typeof text === 'string' ? text : ''
      commit('setDescription', source)
      const { eventType } = extract(source)
      commit('setCategory', eventType || '')
      return { missing: missingFields(state.draft) }
    },
  },
}
