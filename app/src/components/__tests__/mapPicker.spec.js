import { mount } from '@vue/test-utils'
import MapPicker from '../MapPicker.vue'

const ANCHOR = { lat: 25.0455, lng: 121.509 }
const STEP = 0.0005

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

  test('沒有錨點時不建立地圖，方向鍵不發出座標（不合成）', async () => {
    installGoogleMaps()
    const w = mount(MapPicker)
    await settle()
    expect(w.vm.ready).toBe(false)
    await w.find('.map-picker__canvas').trigger('keydown', { key: 'ArrowUp' })
    expect(w.emitted('pick')).toBeFalsy()
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
