import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import report from '../modules/report'

const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { report } })
}

describe('report.describe', () => {
  test('describe 解析事件並回報缺少欄位', async () => {
    const store = makeStore()
    const r = await store.dispatch('report/describe', '中華路有一個坑洞')
    expect(store.state.report.draft.category).toBe('坑洞')
    expect(r.missing).toContain('location')
  })

  test('把原話寫入 draft.description', async () => {
    const store = makeStore()
    await store.dispatch('report/describe', '中華路有一個坑洞')
    expect(store.state.report.draft.description).toBe('中華路有一個坑洞')
  })

  test('辨識不出類型時 category 留空，仍只缺 location', async () => {
    const store = makeStore()
    const r = await store.dispatch('report/describe', '這裡有點奇怪')
    expect(store.state.report.draft.category).toBe('')
    expect(r.missing).toEqual(['location'])
  })

  test('空白輸入時描述與位置都算缺', async () => {
    const store = makeStore()
    const r = await store.dispatch('report/describe', '   ')
    expect(r.missing).toEqual(['description', 'location'])
  })
})
