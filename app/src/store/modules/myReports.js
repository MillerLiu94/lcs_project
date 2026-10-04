// 本工作階段送出的回報（記憶體、不持久化）。完整版：快照含描述與照片，並可刪除。
export default {
  namespaced: true,
  state: () => ({ list: [] }),
  mutations: {
    add(state, event) {
      if (!event || event.id == null) return
      const snapshot = {
        id: event.id,
        title: event.title || '',
        type: event.type || '',
        placeText: event.placeText || '',
        timeText: event.timeText || '',
        status: event.status || 'reported',
        reportedAt: event.reportedAt || '',
        description: event.description || '',
        photo: event.photo || null,
      }
      // 同 id 只留最新一筆，最新的排在最前面。
      state.list = [snapshot, ...state.list.filter((item) => item.id !== snapshot.id)]
    },
    remove(state, id) {
      state.list = state.list.filter((item) => item.id !== id)
    },
  },
}
