import { loadGoogleMaps } from '../googleMaps'

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
