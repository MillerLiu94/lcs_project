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
  test('無法判斷 → 進 results（不再進 clarify）', async () => {
    const store = makeStore()
    await expect(store.dispatch('intent/routeFromText', '最近有什麼')).resolves.toEqual({
      name: 'results',
      query: { q: '最近有什麼' },
    })
  })

  test('query 導向 events 並以 ?q= 帶上原話（辨識結果不遺失）', async () => {
    const store = makeStore()
    await expect(
      store.dispatch('intent/routeFromText', '附近有沒有積水'),
    ).resolves.toEqual({ name: 'events', query: { q: '附近有沒有積水' } })
  })

  test('welfare 導向 welfare 並以 ?q= 帶上原話（可直接接手搜尋）', async () => {
    const store = makeStore()
    await expect(
      store.dispatch('intent/routeFromText', '這個月有什麼老人活動'),
    ).resolves.toEqual({ name: 'welfare', query: { q: '這個月有什麼老人活動' } })
  })

  test('report 導向 report 並帶入 draft.description', async () => {
    const store = makeStore()
    const text = '中華路全家旁邊有一個坑洞'
    await expect(store.dispatch('intent/routeFromText', text)).resolves.toEqual({
      name: 'report',
    })
    expect(store.state.report.draft.description).toBe(text)
  })

  test('複合（多意圖）→ 進 results 並帶上原話', async () => {
    const store = makeStore()
    const text = '附近有沒有積水，這個月有什麼老人活動'
    await expect(store.dispatch('intent/routeFromText', text)).resolves.toEqual({
      name: 'results',
      query: { q: text },
    })
  })
})

describe('intent.resolveChoice（P12 釐清）', () => {
  test('選 welfare 直接導向福利搜尋', async () => {
    const store = makeStore()
    await expect(store.dispatch('intent/resolveChoice', 'welfare')).resolves.toEqual({
      name: 'welfare',
    })
  })

  test('選 event＋具體描述 → 自動導向 report 並帶入原話', async () => {
    const store = makeStore()
    const text = '中華路全家旁邊有一個坑洞'
    store.commit('intent/remember', { text, intent: 'ambiguous' })
    await expect(store.dispatch('intent/resolveChoice', 'event')).resolves.toEqual({
      name: 'report',
    })
    expect(store.state.report.draft.description).toBe(text)
  })

  test('選 event＋詢問既有事件 → 自動導向 events', async () => {
    const store = makeStore()
    store.commit('intent/remember', { text: '附近有沒有積水', intent: 'ambiguous' })
    await expect(store.dispatch('intent/resolveChoice', 'event')).resolves.toEqual({
      name: 'events',
    })
  })

  test('選 event＋仍無法判斷 → 回傳同頁第二層描述子', async () => {
    const store = makeStore()
    store.commit('intent/remember', { text: '最近有什麼', intent: 'ambiguous' })
    await expect(store.dispatch('intent/resolveChoice', 'event')).resolves.toEqual({
      name: 'clarify-event',
    })
  })

  test('第二層明確選回報 → 導向 report 並帶入原話', async () => {
    const store = makeStore()
    const text = '最近有什麼'
    store.commit('intent/remember', { text, intent: 'ambiguous' })
    await expect(store.dispatch('intent/resolveChoice', 'report')).resolves.toEqual({
      name: 'report',
    })
    expect(store.state.report.draft.description).toBe(text)
  })

  test('第二層明確選查詢 → 導向 events', async () => {
    const store = makeStore()
    await expect(store.dispatch('intent/resolveChoice', 'query')).resolves.toEqual({
      name: 'events',
    })
  })
})
