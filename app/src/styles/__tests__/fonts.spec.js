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

test('拉丁字型排在 CJK 之前（Atkinson 才會實際生效）', () => {
  const iAtk = tokens.indexOf('Atkinson Hyperlegible')
  const iNoto = tokens.indexOf('Noto Sans TC')
  expect(iAtk).toBeGreaterThan(-1)
  expect(iNoto).toBeGreaterThan(-1)
  expect(iAtk).toBeLessThan(iNoto)
})
