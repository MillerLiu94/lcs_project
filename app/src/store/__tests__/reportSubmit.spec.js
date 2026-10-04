import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import report from '../modules/report'
import eventService from '../../services/eventService'

const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { report } })
}

describe('report/submit', () => {
  test('送出成功後 status 為 submitted 且帶回 id', async () => {
    const store = makeStore()
    await store.dispatch('report/submit')
    expect(store.state.report.status).toBe('submitted')
    expect(store.state.report.submittedId).toBeTruthy()
  })

  test('送出失敗時 status 為 error 且保留草稿', async () => {
    const spy = vi.spyOn(eventService, 'report').mockRejectedValueOnce(new Error('boom'))
    try {
      const store = makeStore()
      store.commit('report/setDescription', '中華路有一個坑洞')
      await expect(store.dispatch('report/submit')).rejects.toThrow()
      expect(store.state.report.status).toBe('error')
      expect(store.state.report.draft.description).toBe('中華路有一個坑洞')
    } finally {
      spy.mockRestore()
    }
  })

  test('reset 會清空草稿與狀態（回首頁時）', async () => {
    const store = makeStore()
    store.commit('report/setDescription', '中華路有一個坑洞')
    await store.dispatch('report/submit')
    await store.dispatch('report/reset')
    expect(store.state.report.draft.description).toBe('')
    expect(store.state.report.status).toBe('idle')
    expect(store.state.report.submittedId).toBeNull()
  })
})
