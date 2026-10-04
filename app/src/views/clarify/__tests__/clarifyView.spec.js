import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import ClarifyView from '../ClarifyView.vue'
import intent from '../../../store/modules/intent'
import report from '../../../store/modules/report'

const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { intent, report } })
}

function mountView(store) {
  const push = vi.fn(() => Promise.resolve())
  const wrapper = mount(ClarifyView, {
    localVue,
    store,
    mocks: { $router: { push } },
  })
  return { wrapper, push }
}

const labels = (wrapper) =>
  wrapper.findAll('.clarify__choice').wrappers.map((button) => button.text())

// 讓已觸發的非同步 dispatch 有機會完成。
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('ClarifyView（P12 模糊需求釐清）', () => {
  test('第一層顯示兩顆大按鈕，且尚未出現第二層', () => {
    const { wrapper } = mountView(makeStore())
    expect(labels(wrapper)).toEqual(['社區發生的事', '福利和活動'])
    wrapper.destroy()
  })

  test('選福利和活動 → 導向 welfare', async () => {
    const { wrapper, push } = mountView(makeStore())
    await wrapper.findAll('.clarify__choice').at(1).trigger('click')
    await flush()
    expect(push).toHaveBeenCalledWith({ name: 'welfare' })
    wrapper.destroy()
  })

  test('事件無法判斷 → 同頁切換第二層，不導頁', async () => {
    const store = makeStore()
    store.commit('intent/remember', { text: '最近有什麼', intent: 'ambiguous' })
    const { wrapper, push } = mountView(store)
    await wrapper.findAll('.clarify__choice').at(0).trigger('click')
    await flush()
    expect(push).not.toHaveBeenCalled()
    expect(labels(wrapper)).toEqual(['我要回報', '我想查詢'])
    wrapper.destroy()
  })

  test('事件＋具體描述 → 直接導向 report，不問第二層', async () => {
    const store = makeStore()
    const text = '中華路全家旁邊有一個坑洞'
    store.commit('intent/remember', { text, intent: 'ambiguous' })
    const { wrapper, push } = mountView(store)
    await wrapper.findAll('.clarify__choice').at(0).trigger('click')
    await flush()
    expect(push).toHaveBeenCalledWith({ name: 'report' })
    expect(labels(wrapper)).toEqual(['社區發生的事', '福利和活動'])
    wrapper.destroy()
  })

  test('第二層選回報 → 導向 report 並帶入原話', async () => {
    const store = makeStore()
    const text = '最近有什麼'
    store.commit('intent/remember', { text, intent: 'ambiguous' })
    const { wrapper, push } = mountView(store)
    await wrapper.findAll('.clarify__choice').at(0).trigger('click') // 社區發生的事
    await flush()
    await wrapper.findAll('.clarify__choice').at(0).trigger('click') // 我要回報
    await flush()
    expect(push).toHaveBeenCalledWith({ name: 'report' })
    expect(store.state.report.draft.description).toBe(text)
    wrapper.destroy()
  })
})
