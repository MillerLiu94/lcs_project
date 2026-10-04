import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import DescribeStep from '../DescribeStep.vue'
import report from '../../../store/modules/report'

const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { report } })
}

function mountStep(store, push = () => {}) {
  return mount(DescribeStep, {
    localVue,
    store,
    mocks: { $router: { push } },
  })
}

describe('DescribeStep', () => {
  test('還沒輸入時，送出停用', () => {
    const w = mountStep(makeStore())
    expect(w.find('.prompt-bar__send').attributes('disabled')).toBe('disabled')
  })

  test('有文字才能送出，送出後解析並前往選位置', async () => {
    const store = makeStore()
    const push = vi.fn()
    const w = mountStep(store, push)

    w.findComponent({ name: 'AiPromptBar' }).vm.$emit('input', '中華路有一個坑洞')
    await w.vm.$nextTick()
    expect(w.find('.prompt-bar__send').attributes('disabled')).toBeUndefined()

    await w.find('form').trigger('submit')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(store.state.report.draft.category).toBe('坑洞')
    expect(push).toHaveBeenCalledWith({ name: 'report-location' })
  })

  test('語音結果會寫進描述', async () => {
    const store = makeStore()
    const w = mountStep(store)
    w.findComponent({ name: 'AiPromptBar' }).vm.$emit('voice', '公園有積水')
    await w.vm.$nextTick()
    expect(store.state.report.draft.description).toBe('公園有積水')
  })
})
