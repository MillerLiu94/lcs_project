import fs from 'node:fs'

const htmlUrl = new URL(['..', '..', '..', 'index.html'].join('/'), import.meta.url)
const html = fs.readFileSync(htmlUrl, 'utf8')

const tokensUrl = new URL(['..', 'tokens.css'].join('/'), import.meta.url)
const tokens = fs.readFileSync(tokensUrl, 'utf8')

test('載入 Noto Sans TC 與 Atkinson Hyperlegible', () => {
  expect(html).toContain('Noto+Sans+TC')
  expect(html).toContain('Atkinson+Hyperlegible')
})

test('body 套用 --font-sans', () => {
  expect(tokens).toContain('font-family: var(--font-sans)')
})
