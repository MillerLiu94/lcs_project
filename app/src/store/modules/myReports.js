// 本工作階段送出的回報（記憶體）。跨重整的持久化屬第二份規格。
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
      }
      // 同 id 只留最新一筆，最新的排在最前面。
      state.list = [snapshot, ...state.list.filter((item) => item.id !== snapshot.id)]
    },
  },
}
