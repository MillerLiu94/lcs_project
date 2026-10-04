import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import myReports from '../modules/myReports'

const localVue = createLocalVue()
localVue.use(Vuex)

const EVENT = {
  id: 'e-100',
  title: '中華路坑洞',
  type: '坑洞',
  placeText: '中華路一段',
  timeText: '剛剛',
  status: 'reported',
  reportedAt: '2026-10-05T10:00:00+08:00',
}

test('add 會新增一筆快照（最新的在前）', () => {
  const store = new Vuex.Store({ modules: { myReports } })
  store.commit('myReports/add', EVENT)
  expect(store.state.myReports.list).toHaveLength(1)
  expect(store.state.myReports.list[0]).toMatchObject({ id: 'e-100', title: '中華路坑洞' })
})

test('同 id 重複 add 不重複列', () => {
  const store = new Vuex.Store({ modules: { myReports } })
  store.commit('myReports/add', EVENT)
  store.commit('myReports/add', EVENT)
  expect(store.state.myReports.list).toHaveLength(1)
})
