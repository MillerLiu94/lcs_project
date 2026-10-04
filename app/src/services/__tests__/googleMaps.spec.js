import { loadGoogleMaps, shouldInject } from '../googleMaps'

afterEach(() => {
  delete window.google
})

test('沒有金鑰且無 window.google 時回 null（不注入真實 API）', async () => {
  await expect(loadGoogleMaps()).resolves.toBeNull()
})

test('window.google 已存在時直接回傳，不重複載入', async () => {
  const maps = { Map: function () {}, Marker: function () {} }
  window.google = { maps }
  await expect(loadGoogleMaps()).resolves.toBe(maps)
})

describe('shouldInject', () => {
  test('測試模式一律不注入（避免本機 .env.local 金鑰污染測試）', () => {
    expect(shouldInject({ key: 'x', mode: 'test', hasDocument: true, hasGoogle: false })).toBe(false)
  })

  test('有金鑰、非測試、有 document、無 google 才注入', () => {
    expect(shouldInject({ key: 'x', mode: 'production', hasDocument: true, hasGoogle: false })).toBe(true)
  })

  test('無金鑰／無 document／已有 google 皆不注入', () => {
    expect(shouldInject({ key: '', mode: 'production', hasDocument: true, hasGoogle: false })).toBe(false)
    expect(shouldInject({ key: 'x', mode: 'production', hasDocument: false, hasGoogle: false })).toBe(false)
    expect(shouldInject({ key: 'x', mode: 'production', hasDocument: true, hasGoogle: true })).toBe(false)
  })
})
