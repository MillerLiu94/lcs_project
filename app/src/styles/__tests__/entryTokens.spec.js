import fs from 'node:fs'

const entryFiles = {
  TopNav: ['..', '..', 'components', 'TopNav.vue'],
  BottomNav: ['..', '..', 'components', 'BottomNav.vue'],
  BigTaskCard: ['..', '..', 'components', 'BigTaskCard.vue'],
  HomeView: ['..', '..', 'views', 'home', 'HomeView.vue'],
  AiPromptBar: ['..', '..', 'components', 'AiPromptBar.vue'],
  AppShell: ['..', '..', 'components', 'AppShell.vue'],
}

const read = (parts) => fs.readFileSync(new URL(parts.join('/'), import.meta.url), 'utf8')

// 入口基準的元件不得出現 ad-hoc 字級；所有 font-size 必須來自字級 token。
describe('入口元件的字級只用 token', () => {
  Object.entries(entryFiles).forEach(([name, parts]) => {
    test(`${name} 無 ad-hoc font-size`, () => {
      expect(read(parts)).not.toMatch(/font-size:\s*[0-9]/)
    })
  })
})

test('AppShell 版面間距使用 space token', () => {
  expect(read(entryFiles.AppShell)).toContain('var(--space-')
})
