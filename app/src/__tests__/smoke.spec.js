import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import App from '../App.vue'
import report from '../store/modules/report'

const localVue = createLocalVue()
localVue.use(Vuex)

test('App 會渲染平台名稱', () => {
  const store = new Vuex.Store({ modules: { report } })
  const wrapper = mount(App, { localVue, store })
  expect(wrapper.text()).toContain('社區資訊平台')
})
