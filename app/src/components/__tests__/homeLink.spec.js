import { mount } from '@vue/test-utils'
import HomeLink from '../HomeLink.vue'

const RouterLinkStub = {
  name: 'RouterLink',
  props: { to: { type: [String, Object], required: true } },
  render(h) {
    return h('a', { attrs: { href: typeof this.to === 'string' ? this.to : '#' } }, this.$slots.default)
  },
}

test('回首頁連結指向首頁', () => {
  const w = mount(HomeLink, { stubs: { RouterLink: RouterLinkStub } })
  const a = w.find('a')
  expect(a.exists()).toBe(true)
  expect(a.attributes('href')).toBe('/')
  expect(a.text()).toBe('回首頁')
})
