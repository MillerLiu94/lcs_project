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

describe('report 附件（選填）', () => {
  test('setPhoto / setAudio 寫入草稿，clear 會清空', () => {
    const store = makeStore()
    store.commit('report/setPhoto', 'data:image/png;base64,AAA')
    store.commit('report/setAudio', { name: 'a.mp3', dataUrl: 'data:audio/mp3;base64,BBB' })
    expect(store.state.report.draft.photo).toBe('data:image/png;base64,AAA')
    expect(store.state.report.draft.audio).toBe('data:audio/mp3;base64,BBB')
    expect(store.state.report.draft.audioName).toBe('a.mp3')

    store.commit('report/clearPhoto')
    store.commit('report/clearAudio')
    expect(store.state.report.draft.photo).toBeNull()
    expect(store.state.report.draft.audio).toBeNull()
    expect(store.state.report.draft.audioName).toBe('')
  })

  test('reset 會清空附件', () => {
    const store = makeStore()
    store.commit('report/setPhoto', 'data:x')
    store.commit('report/setAudio', { name: 'b.wav', dataUrl: 'data:y' })
    store.commit('report/resetState')
    expect(store.state.report.draft.photo).toBeNull()
    expect(store.state.report.draft.audio).toBeNull()
    expect(store.state.report.draft.audioName).toBe('')
  })
})
