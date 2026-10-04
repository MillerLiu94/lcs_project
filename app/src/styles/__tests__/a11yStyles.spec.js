import fs from 'node:fs'

// 動態組路徑（同 tokens.spec.js）：避免 Vite 把 new URL 改寫成 dev-server URL。
const overrideUrl = new URL(['..', 'element-override.scss'].join('/'), import.meta.url)
const override = fs.readFileSync(overrideUrl, 'utf8')

const tokensUrl = new URL(['..', 'tokens.css'].join('/'), import.meta.url)
const tokens = fs.readFileSync(tokensUrl, 'utf8')

// 迴歸守門（regression guard）：這些測試只以原始碼字串確認無障礙樣式「存在」，
// 不量測瀏覽器渲染結果（對比數值、reduced-motion 執行時行為、375px 實際排版）。
// 渲染實測屬人工複驗，見 app/ACCEPTANCE.md §5。
describe('無障礙樣式存在（靜態迴歸守門）', () => {
  test('底部導覽以 scroll-padding-bottom 補償焦點（WCAG 2.4.11）', () => {
    expect(override).toContain('scroll-padding-bottom')
  })

  test('桌機以 scroll-padding-top 避開頂部導覽', () => {
    expect(override).toContain('scroll-padding-top')
  })

  test('互動元件最小高度 >=48px', () => {
    expect(override).toMatch(/min-height:\s*48px/)
  })

  test('尊重 prefers-reduced-motion', () => {
    expect(override).toContain('prefers-reduced-motion: reduce')
  })

  test('body 字級 >=18px、行高 >=1.7（高齡友善加碼）', () => {
    expect(override).toMatch(/font-size:\s*18px/)
    expect(override).toMatch(/line-height:\s*1\.75/)
  })

  test('focus ring 使用主題 ring token', () => {
    expect(override).toContain('var(--ring)')
    expect(tokens).toContain('--ring')
  })
})
