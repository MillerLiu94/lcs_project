import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import intent from '../modules/intent'
import report from '../modules/report'

const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { intent, report } })
}

describe('intent.routeFromText', () => {
  test('ambiguous 導向 clarify', async () => {
    const store = makeStore()
    const r = await store.dispatch('intent/routeFromText', '最近有什麼')
    expect(r.name).toBe('clarify')
  })

  test('query 導向 events', async () => {
    const store = makeStore()
    await expect(
      store.dispatch('intent/routeFromText', '附近有沒有積水'),
    ).resolves.toEqual({ name: 'events' })
  })

  test('welfare 導向 welfare', async () => {
    const store = makeStore()
    await expect(
      store.dispatch('intent/routeFromText', '這個月有什麼老人活動'),
    ).resolves.toEqual({ name: 'welfare' })
  })

  test('report 導向 report 並帶入 draft.description', async () => {
    const store = makeStore()
    const text = '中華路全家旁邊有一個坑洞'
    await expect(store.dispatch('intent/routeFromText', text)).resolves.toEqual({
      name: 'report',
    })
    expect(store.state.report.draft.description).toBe(text)
  })
})
