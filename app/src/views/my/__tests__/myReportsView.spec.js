import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import MyReportsView from '../MyReportsView.vue'
import myReports from '../../../store/modules/myReports'

const localVue = createLocalVue()
localVue.use(Vuex)

const RouterLinkStub = {
  name: 'RouterLink',
  props: { to: { type: [String, Object], required: true } },
  render(h) {
    return h('a', this.$slots.default)
  },
}

function mountView(store) {
  return mount(MyReportsView, { localVue, store, stubs: { RouterLink: RouterLinkStub } })
}

test('沒有紀錄時顯示空狀態', () => {
  const store = new Vuex.Store({ modules: { myReports } })
  const w = mountView(store)
  expect(w.text()).toContain('還沒有回報紀錄')
})

test('有紀錄時以卡片列出', () => {
  const store = new Vuex.Store({ modules: { myReports } })
  store.commit('myReports/add', {
    id: 'e-100',
    title: '中華路坑洞',
    type: '坑洞',
    placeText: '中華路一段',
    timeText: '剛剛',
    status: 'reported',
  })
  const w = mountView(store)
  expect(w.findAllComponents({ name: 'ResultCard' })).toHaveLength(1)
  expect(w.text()).toContain('中華路坑洞')
  expect(w.text()).toContain('坑洞')
})
