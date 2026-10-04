// 申報流程的狀態模組：保存草稿與流程進度，不直接呼叫服務。
// Task 15 補上第一步「描述事件」的解析動作（describe）。
// Task 17 補上送出（submit）與清空（reset）。
import { extract } from '../../utils/textExtract'
import eventService from '../../services/eventService'

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
    audio: null,
    audioName: '',
  }
}

export default {
  namespaced: true,
  state: () => ({
    draft: emptyDraft(),
    step: 1,
    status: 'idle',
    submittedId: null,
  }),
  mutations: {
    setDescription(state, description) {
      state.draft.description = typeof description === 'string' ? description : ''
    },
    setCategory(state, category) {
      state.draft.category = typeof category === 'string' ? category : ''
    },
    // 位置由 location 模組（或步驟畫面）決定後寫入草稿；
    // 可能是帶真實座標的物件，或 §14.4 的 { mode:'unconfirmed', text }。
    setLocation(state, location) {
      state.draft.location = location && typeof location === 'object' ? { ...location } : null
    },
    // 附件（選填）：照片為 data URL；音檔另存檔名供摘要顯示。
    setPhoto(state, photo) {
      state.draft.photo = typeof photo === 'string' && photo ? photo : null
    },
    clearPhoto(state) {
      state.draft.photo = null
    },
    setAudio(state, payload) {
      const data = payload && typeof payload === 'object' ? payload : {}
      state.draft.audio = typeof data.dataUrl === 'string' && data.dataUrl ? data.dataUrl : null
      state.draft.audioName = typeof data.name === 'string' ? data.name : ''
    },
    clearAudio(state) {
      state.draft.audio = null
      state.draft.audioName = ''
    },
    setStatus(state, status) {
      state.status = status
    },
    setSubmittedId(state, id) {
      state.submittedId = id != null ? id : null
    },
    resetState(state) {
      state.draft = emptyDraft()
      state.step = 1
      state.status = 'idle'
      state.submittedId = null
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

    /**
     * 送出草稿。成功 → eventService.report(draft)，status='submitted' 並記下 id。
     * 失敗 → status='error'，草稿原封不動（可原地重試）。
     * @returns {Promise<object>} 建立後的事件
     */
    async submit({ commit, state }) {
      commit('setStatus', 'submitting')
      try {
        const event = await eventService.report(state.draft)
        commit('setSubmittedId', event && event.id)
        commit('setStatus', 'submitted')
        return event
      } catch (error) {
        commit('setStatus', 'error')
        throw error
      }
    },

    /** 回到首頁時清空整份申報狀態。 */
    reset({ commit }) {
      commit('resetState')
    },
  },
}
