import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import AssistantView from '../AssistantView.vue'
import report from '../../../store/modules/report'
import query from '../../../store/modules/query'
import myReports from '../../../store/modules/myReports'

const localVue = createLocalVue()
localVue.use(Vuex)

function render(task) {
  const store = new Vuex.Store({ modules: { report, query, myReports } })
  const $router = { push: vi.fn(), replace: vi.fn() }
  const w = mount(AssistantView, {
    localVue,
    store,
    propsData: { task },
    mocks: { $router },
    stubs: ['AiPromptBar', 'router-link'],
  })
  return { w, store, $router }
}

test('顯示第一個問題與進度', () => {
  const { w } = render('events')
  expect(w.text()).toContain('想找多久以內？')
  expect(w.text()).toContain('第 1 題')
})

test('選項題選完前進到下一題', async () => {
  const { w } = render('events')
  await w.findAll('[data-choice]').at(0).trigger('click')
  expect(w.text()).toContain('哪一區？')
})

test('文字題留空不前進', async () => {
  const { w, $router } = render('report')
  w.findComponent({ name: 'AiPromptBar' }).vm.$emit('submit')
  expect($router.push).not.toHaveBeenCalled()
})

test('完成後套用 commits 並導頁', async () => {
  const { w, store, $router } = render('events')
  await w.findAll('[data-choice]').at(0).trigger('click') // time: today
  await w.findAll('[data-choice]').at(0).trigger('click') // region: 中華路
  expect(store.state.query.filters.time).toBe('today')
  expect(store.state.query.region).toBe('中華路')
  expect($router.push).toHaveBeenCalledWith({ name: 'events' })
})

test('無效的 task 導回首頁', () => {
  const { $router } = render('unknown')
  expect($router.replace).toHaveBeenCalledWith('/')
})

test('換題後焦點移到新問題', async () => {
  const spy = vi.fn()
  HTMLElement.prototype.focus = spy
  const { w } = render('events')
  await w.findAll('[data-choice]').at(0).trigger('click')
  await w.vm.$nextTick()
  expect(spy).toHaveBeenCalled()
  delete HTMLElement.prototype.focus
})

test('切換任務會重置對話', async () => {
  const { w } = render('events')
  await w.findAll('[data-choice]').at(0).trigger('click')
  expect(w.text()).toContain('哪一區？')
  await w.setProps({ task: 'welfare' })
  expect(w.text()).toContain('想找哪一類的福利或活動？')
  expect(w.text()).toContain('第 1 題')
})
