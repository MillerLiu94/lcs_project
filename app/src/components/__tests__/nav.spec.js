import { shallowMount } from '@vue/test-utils'
import BottomNav from '../BottomNav.vue'
test('底部導覽有三個項目且文字正確', () => {
  const w = shallowMount(BottomNav, { stubs: ['router-link'] })
  expect(w.findAll('[data-nav-item]').length).toBe(3)
  expect(w.text()).toContain('找福利和活動')
})
