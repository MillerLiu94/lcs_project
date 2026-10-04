// 申報流程的狀態模組（初版，Task 15+ 會補 describe/submit/reset）。
// 單一責任：保存草稿與流程進度，不直接呼叫服務。
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
  },
}
