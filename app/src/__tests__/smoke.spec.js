import { mount } from '@vue/test-utils'
import App from '../App.vue'

test('App 會渲染平台名稱', () => {
  const wrapper = mount(App)
  expect(wrapper.text()).toContain('社區資訊平台')
})
