import fs from 'node:fs'

// Vite's asset transform rewrites a literal `new URL('../tokens.css', import.meta.url)`
// into a dev-server http URL, which node:fs cannot read. Building the relative path
// dynamically keeps it a genuine file URL so readFileSync works under Vitest.
const tokensUrl = new URL(['..', 'tokens.css'].join('/'), import.meta.url)
const css = fs.readFileSync(tokensUrl, 'utf8')

test('包含 Firefox 暖色 primary 與 radius tokens', () => {
  expect(css).toContain('--primary')
  expect(css).toContain('#a44900')
  expect(css).toContain('--radius-card')
})

test('包含字級、間距與字型 token', () => {
  expect(css).toContain('--font-size-display')
  expect(css).toContain('--font-size-meta')
  expect(css).toContain('--space-6')
  expect(css).toContain('--font-sans')
  expect(css).toContain('--font-latin')
})
