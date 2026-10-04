import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import MyReportDetailView from '../MyReportDetailView.vue'
import myReports from '../../../store/modules/myReports'

const localVue = createLocalVue()
localVue.use(Vuex)

const RouterLinkStub = {
  name: 'RouterLink',
  props: { to: { type: [String, Object], required: true } },
  render(h) {
    return h('a', { attrs: { href: typeof this.to === 'string' ? this.to : '#' } }, this.$slots.default)
  },
}

function render(id) {
  const store = new Vuex.Store({ modules: { myReports } })
  store.commit('myReports/add', {
    id: 'e-1',
    title: '路燈不亮',
    type: '路燈',
    placeText: '汀州路',
    timeText: '昨晚',
    status: 'reported',
    description: '整排路燈不亮',
    photo: 'data:image/png;base64,AAA',
  })
  const w = mount(MyReportDetailView, {
    localVue,
    store,
    stubs: { RouterLink: RouterLinkStub },
    mocks: { $route: { params: { id } } },
  })
  return { w, store }
}

test('顯示快照的標題、描述與照片', () => {
  const { w } = render('e-1')
  expect(w.text()).toContain('路燈不亮')
  expect(w.text()).toContain('整排路燈不亮')
  expect(w.find('img').attributes('src')).toBe('data:image/png;base64,AAA')
})

test('找不到 id → 顯示已移除與回清單連結', () => {
  const { w } = render('nope')
  expect(w.text()).toContain('這筆回報已移除')
  expect(w.find('a[href="/my-reports"]').exists()).toBe(true)
})
