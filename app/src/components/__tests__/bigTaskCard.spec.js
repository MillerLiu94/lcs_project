import fs from 'node:fs'
import { mount } from '@vue/test-utils'
import BigTaskCard from '../BigTaskCard.vue'

// 動態組路徑（同 tokens.spec.js）：避免 Vite 改寫 new URL 的相對路徑。
const cardSrc = fs.readFileSync(new URL(['..', 'BigTaskCard.vue'].join('/'), import.meta.url), 'utf8')

test('hero 變體顯示 CTA 與 data-variant', () => {
  const w = mount(BigTaskCard, {
    propsData: { to: '/report', title: '回報社區問題', variant: 'hero', cta: '開始回報' },
    stubs: ['router-link'],
  })
  expect(w.find('[data-variant="hero"]').exists()).toBe(true)
  expect(w.find('.big-task-card__cta').text()).toBe('開始回報')
})

test('default 變體不顯示 CTA', () => {
  const w = mount(BigTaskCard, {
    propsData: { to: '/events', title: '附近事件' },
    stubs: ['router-link'],
  })
  expect(w.find('[data-variant="default"]').exists()).toBe(true)
  expect(w.find('.big-task-card__cta').exists()).toBe(false)
})

test('保留 reduced-motion 位移守則', () => {
  expect(cardSrc).toContain('prefers-reduced-motion')
})
