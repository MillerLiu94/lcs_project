import { mount, shallowMount } from '@vue/test-utils'
import BottomNav from '../BottomNav.vue'
import TopNav from '../TopNav.vue'
import { NAV_ITEMS, MOBILE_NAV_ITEMS } from '../../router'

test('手機底部導覽有四項且含首頁', () => {
  const w = shallowMount(BottomNav, { stubs: ['router-link'] })
  expect(w.findAll('[data-nav-item]')).toHaveLength(4)
  expect(w.text()).toContain('首頁')
  expect(w.text()).toContain('福利活動')
})

test('底部導覽每項都有圖示', () => {
  const w = mount(BottomNav, { stubs: ['router-link'] })
  expect(w.findAll('[data-nav-item] i')).toHaveLength(4)
})

test('桌面 NAV_ITEMS 為 3 項且標籤已縮短', () => {
  expect(NAV_ITEMS.map((i) => i.label)).toEqual(['回報問題', '附近事件', '福利活動'])
  NAV_ITEMS.forEach((i) => expect(i.label.length).toBeLessThanOrEqual(4))
})

test('手機 MOBILE_NAV_ITEMS 含首頁共 4 項', () => {
  expect(MOBILE_NAV_ITEMS).toHaveLength(4)
  expect(MOBILE_NAV_ITEMS[0]).toEqual({ to: '/', label: '首頁', icon: 'House' })
})

test('桌面導覽每項都有圖示', () => {
  const w = mount(TopNav, { stubs: ['router-link'] })
  const items = w.findAll('[data-nav-item]')
  expect(items).toHaveLength(3)
  expect(w.findAll('[data-nav-item] i')).toHaveLength(3)
  expect(w.text()).toContain('福利活動')
})
