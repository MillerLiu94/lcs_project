import { shallowMount } from '@vue/test-utils'
import BottomNav from '../BottomNav.vue'
import { NAV_ITEMS, MOBILE_NAV_ITEMS } from '../../router'

test('底部導覽有三個項目且文字正確', () => {
  const w = shallowMount(BottomNav, { stubs: ['router-link'] })
  expect(w.findAll('[data-nav-item]').length).toBe(3)
  expect(w.text()).toContain('福利活動')
})

test('桌面 NAV_ITEMS 為 3 項且標籤已縮短', () => {
  expect(NAV_ITEMS.map((i) => i.label)).toEqual(['回報問題', '附近事件', '福利活動'])
  NAV_ITEMS.forEach((i) => expect(i.label.length).toBeLessThanOrEqual(4))
})

test('手機 MOBILE_NAV_ITEMS 含首頁共 4 項', () => {
  expect(MOBILE_NAV_ITEMS).toHaveLength(4)
  expect(MOBILE_NAV_ITEMS[0]).toEqual({ to: '/', label: '首頁', icon: 'House' })
})
