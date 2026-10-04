import fs from 'node:fs'
import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import HomeView from '../HomeView.vue'
import report from '../../../store/modules/report'

// 動態組路徑（同其他樣式守門）：避免 Vite 改寫 new URL 的相對路徑。
const viewSrc = fs.readFileSync(new URL(['..', 'HomeView.vue'].join('/'), import.meta.url), 'utf8')

const localVue = createLocalVue()
localVue.use(Vuex)

function render() {
  const store = new Vuex.Store({ modules: { report } })
  return mount(HomeView, { localVue, store, stubs: ['router-link'] })
}

test('採用任務優先版面：中性問候 + 主行動 CTA', () => {
  const w = render()
  expect(w.text()).toContain('社區資訊平台')
  expect(w.text()).toContain('今天需要幫忙嗎？')
  expect(w.find('[data-variant="hero"]').exists()).toBe(true)
  expect(w.text()).toContain('開始回報')
  expect(w.findAll('[data-variant="default"]')).toHaveLength(2)
})

test('問候不含假的使用者名稱', () => {
  const w = render()
  expect(w.text()).not.toMatch(/先生|小姐|王先生|李太太/)
})

test('顯示次標說明', () => {
  const w = render()
  expect(w.text()).toContain('回報問題、查附近事件、找福利活動')
})

test('手機隱藏三張卡、桌機才顯示', () => {
  expect(viewSrc).toMatch(/\.home__tasks\s*\{[^}]*display:\s*none/)
  expect(viewSrc).toMatch(/@media \(min-width: 1024px\)[\s\S]*\.home__tasks\s*\{[^}]*display:\s*flex/)
})
