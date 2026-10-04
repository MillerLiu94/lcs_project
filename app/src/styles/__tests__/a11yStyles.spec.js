import fs from 'node:fs'

// 動態組路徑（同 tokens.spec.js）：避免 Vite 把 new URL 改寫成 dev-server URL。
const overrideUrl = new URL(['..', 'element-override.scss'].join('/'), import.meta.url)
const override = fs.readFileSync(overrideUrl, 'utf8')

const tokensUrl = new URL(['..', 'tokens.css'].join('/'), import.meta.url)
const tokens = fs.readFileSync(tokensUrl, 'utf8')

// S4 §9／§12：底部導覽遮擋焦點需以 scroll-padding 補償；G4 要求觸控 >=48px 與
// 尊重 prefers-reduced-motion。此處以原始樣式確定這些保證沒有在重構中遺失。
describe('無障礙樣式保證', () => {
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
