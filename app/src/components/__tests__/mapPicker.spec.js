import { mount } from '@vue/test-utils'
import MapPicker from '../MapPicker.vue'

const ANCHOR = { lat: 25.0455, lng: 121.509 }
const STEP = 0.0005
// 與元件相同的區域中心：只作為初始視野，不是預選位置。
const DEFAULT_VIEW = { lat: 25.035, lng: 121.51 }

function settle() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// 以假的 google.maps 取代真實 API：只驗證互動路徑，不載入任何外部資源。
function installGoogleMaps() {
  const listeners = {}
  class FakeMap {
    constructor(_el, options) {
      this.options = options
    }
    addListener(name, cb) {
      listeners[name] = listeners[name] || []
      listeners[name].push(cb)
    }
    setCenter() {}
  }
  class FakeMarker {
    constructor(options) {
      this.position = options.position
    }
    addListener() {}
    getPosition() {
      return { lat: () => this.position.lat, lng: () => this.position.lng }
    }
    setPosition(position) {
      this.position = position
    }
  }
  window.google = { maps: { Map: FakeMap, Marker: FakeMarker } }
  return { listeners }
}

describe('MapPicker', () => {
  afterEach(() => {
    delete window.google
  })

  test('沒有 Google Maps 金鑰時顯示文字提示、不載入真實 API、不丟例外', async () => {
    const w = mount(MapPicker)
    await settle()
    expect(w.find('.map-picker__canvas').exists()).toBe(true)
    expect(w.find('.map-picker__note').exists()).toBe(true)
    expect(w.vm.ready).toBe(false)
  })

  test('沒有錨點時仍建立粗略地圖（區域中心僅為視野），且不自動發出座標', async () => {
    installGoogleMaps()
    const w = mount(MapPicker)
    await settle()
    expect(w.vm.ready).toBe(true)
    expect(w.vm.map.options.center).toEqual(DEFAULT_VIEW)
    expect(w.find('.map-picker__hint').exists()).toBe(true)
    expect(w.emitted('pick')).toBeFalsy()
  })

  test('沒有錨點時，方向鍵可放置圖釘並發出 pick（非拖曳替代操作）', async () => {
    installGoogleMaps()
    const w = mount(MapPicker)
    await settle()
    await w.find('.map-picker__canvas').trigger('keydown', { key: 'ArrowUp' })
    const [lat, lng] = w.emitted('pick')[0]
    expect(lat).toBeCloseTo(DEFAULT_VIEW.lat + STEP)
    expect(lng).toBeCloseTo(DEFAULT_VIEW.lng)
  })

  test('沒有錨點時，點選地圖可放置圖釘並發出 pick', async () => {
    const { listeners } = installGoogleMaps()
    const w = mount(MapPicker)
    await settle()
    listeners.click[0]({ latLng: { lat: () => 25.05, lng: () => 121.51 } })
    expect(w.emitted('pick')[0]).toEqual([25.05, 121.51])
  })

  test('錨定後，方向鍵移動圖釘會發出 pick（非拖曳替代操作）', async () => {
    installGoogleMaps()
    const w = mount(MapPicker, { propsData: ANCHOR })
    await settle()
    expect(w.vm.ready).toBe(true)
    await w.find('.map-picker__canvas').trigger('keydown', { key: 'ArrowUp' })
    const [lat, lng] = w.emitted('pick')[0]
    expect(lat).toBeCloseTo(ANCHOR.lat + STEP)
    expect(lng).toBeCloseTo(ANCHOR.lng)
  })

  test('錨定後，點選地圖會發出 pick（非拖曳替代操作）', async () => {
    const { listeners } = installGoogleMaps()
    const w = mount(MapPicker, { propsData: ANCHOR })
    await settle()
    expect(listeners.click && listeners.click[0]).toBeTruthy()
    listeners.click[0]({ latLng: { lat: () => 25.05, lng: () => 121.51 } })
    expect(w.emitted('pick')[0]).toEqual([25.05, 121.51])
  })
})
