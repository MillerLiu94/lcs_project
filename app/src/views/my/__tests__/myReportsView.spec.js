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
    return h('a', { attrs: { href: typeof this.to === 'string' ? this.to : '#' } }, this.$slots.default)
  },
}

function mountView(store) {
  return mount(MyReportsView, { localVue, store, stubs: { RouterLink: RouterLinkStub } })
}

function seed(store) {
  store.commit('myReports/add', { id: 'e-1', title: 'A', status: 'reported', type: '坑洞' })
  store.commit('myReports/add', { id: 'e-2', title: 'B', status: 'resolved', type: '路燈' })
}

function chip(w, text) {
  return w.findAll('.my-reports__chip').wrappers.find((b) => b.text() === text)
}

test('完全沒有紀錄時的空狀態', () => {
  const store = new Vuex.Store({ modules: { myReports } })
  const w = mountView(store)
  expect(w.text()).toContain('還沒有回報紀錄')
})

test('顯示筆數', () => {
  const store = new Vuex.Store({ modules: { myReports } })
  seed(store)
  const w = mountView(store)
  expect(w.text()).toContain('共 2 筆')
})

test('狀態篩選只顯示符合者，筆數顯示全部', async () => {
  const store = new Vuex.Store({ modules: { myReports } })
  seed(store)
  const w = mountView(store)
  await chip(w, '已完成').trigger('click')
  expect(w.findAllComponents({ name: 'ResultCard' })).toHaveLength(1)
  expect(w.text()).toContain('共 1 筆（全部 2 筆）')
})

test('刪除需二次確認才移除', async () => {
  const store = new Vuex.Store({ modules: { myReports } })
  seed(store)
  const w = mountView(store)
  await w.findAll('.my-reports__delete').at(0).trigger('click')
  expect(store.state.myReports.list).toHaveLength(2) // 尚未刪除
  const confirm = w.findAll('.my-reports__delete').at(0)
  expect(confirm.text()).toContain('確定刪除')
  await confirm.trigger('click')
  expect(store.state.myReports.list).toHaveLength(1)
})

test('篩選後為空的訊息（與完全沒有區分）', async () => {
  const store = new Vuex.Store({ modules: { myReports } })
  store.commit('myReports/add', { id: 'e-1', title: 'A', status: 'reported' })
  const w = mountView(store)
  await chip(w, '已完成').trigger('click')
  expect(w.text()).toContain('這個狀態還沒有回報')
})
