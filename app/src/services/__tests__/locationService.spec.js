import http from '../../api/http'
import { setupMock, resetMock } from '../../api/mock'
import locationService, { decide } from '../locationService'

test('完全無法確認且不使用地圖 → 未確認且無假座標', () => {
  const r = decide({ onSite:false, permissionGranted:false, candidates:[], wantsMap:false })
  expect(r.mode).toBe('unconfirmed')
  expect(r.coordinates).toBeNull()
})
test('多候選 → 地圖確認', () => {
  const r = decide({ onSite:false, permissionGranted:false, candidates:[{id:1},{id:2}], wantsMap:false })
  expect(r.mode).toBe('map-confirm')
})

describe('locationService.decide（S6 §14.4：任何路徑都不得合成座標）', () => {
  test('在現場且已授權 → gps，座標交由裝置定位提供（不由決策合成）', () => {
    const r = decide({ onSite:true, permissionGranted:true, candidates:[], wantsMap:false })
    expect(r.mode).toBe('gps')
    expect(r.coordinates).toBeNull()
  })

  test('單一候選且有真實座標 → candidate 並回傳該候選座標', () => {
    const r = decide({
      onSite:false,
      permissionGranted:false,
      candidates:[{ id:'p1', lat:25.0455, lng:121.509 }],
      wantsMap:false,
    })
    expect(r.mode).toBe('candidate')
    expect(r.coordinates).toEqual({ lat:25.0455, lng:121.509 })
  })

  test('單一候選但缺座標 → 不得回填，需地圖確認', () => {
    const r = decide({ onSite:false, permissionGranted:false, candidates:[{ id:'p1' }], wantsMap:false })
    expect(r.mode).toBe('map-confirm')
    expect(r.coordinates).toBeNull()
  })

  test('無候選但願意用地圖 → 低精度（大概區域），不合成座標', () => {
    const r = decide({ onSite:false, permissionGranted:false, candidates:[], wantsMap:true })
    expect(r.mode).toBe('low-precision')
    expect(r.coordinates).toBeNull()
  })

  test('在現場但拒權 → 退回文字候選流程（不強制定位、不合成座標）', () => {
    const denied = decide({ onSite:true, permissionGranted:false, candidates:[], wantsMap:false })
    expect(denied.mode).toBe('unconfirmed')
    expect(denied.coordinates).toBeNull()
  })

  test('缺少參數時安全收斂為未確認、無座標', () => {
    const r = decide()
    expect(r.mode).toBe('unconfirmed')
    expect(r.coordinates).toBeNull()
  })
})

describe('locationService.geocode（mock 讀 places.json 計分）', () => {
  test('「中華路」＋「全家」命中同一地點且排名第一', async () => {
    const candidates = await locationService.geocode('中華路全家')
    expect(candidates.length).toBeGreaterThan(0)
    expect(candidates[0].id).toBe('place-001')
    expect(candidates[0].name).toContain('全家')
    expect(typeof candidates[0].lat).toBe('number')
    expect(typeof candidates[0].lng).toBe('number')
    expect(candidates[0].score).toBeGreaterThan(0)
  })

  test('以空白分隔的多詞也能命中', async () => {
    const candidates = await locationService.geocode('中華路 全家')
    expect(candidates[0].id).toBe('place-001')
  })

  test('別名「北車」對應台北車站', async () => {
    const candidates = await locationService.geocode('北車')
    expect(candidates.map((c) => c.id)).toContain('place-004')
  })

  test('空字串回空陣列', async () => {
    expect(await locationService.geocode('')).toEqual([])
    expect(await locationService.geocode(null)).toEqual([])
  })
})

describe('locationService.reverse（mock：最近地點地址）', () => {
  test('台北車站座標附近回傳地址字串', async () => {
    const address = await locationService.reverse(25.0478, 121.517)
    expect(typeof address).toBe('string')
    expect(address).toContain('北平西路')
  })
})

describe('GET /api/places（mock 端點）', () => {
  test('帶 q 回傳與本地計分一致的候選', async () => {
    setupMock(http, { delayResponse: 0 })
    const { data } = await http.get('/api/places', { params: { q: '中華路全家' } })
    expect(data[0].id).toBe('place-001')
    resetMock()
  })
})
