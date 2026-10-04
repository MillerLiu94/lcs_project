import { mount } from '@vue/test-utils'
import EventMap from '../EventMap.vue'

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

function installGoogleMaps() {
  const created = []
  class FakeMap {
    constructor(_el, options) { this.options = options }
    setCenter() {}
  }
  class FakeMarker {
    constructor(options) {
      this.options = options
      this.listeners = {}
      this.position = options.position
      created.push(this)
    }
    addListener(name, cb) { this.listeners[name] = cb }
    setMap(map) { this.map = map }
    getPosition() { return this.position }
  }
  window.google = { maps: { Map: FakeMap, Marker: FakeMarker } }
  return { created }
}

const EVENTS = [
  { id: 'e-001', title: 'A', coordinates: { lat: 25.0455, lng: 121.509 } },
  { id: 'e-002', title: 'B', coordinates: null },
  { id: 'e-003', title: 'C', coordinates: { lat: 25.0237, lng: 121.521 } },
]

describe('EventMap', () => {
  afterEach(() => { delete window.google })

  test('無金鑰時顯示提示、ready 為 false、不丟例外', async () => {
    const w = mount(EventMap, { propsData: { events: EVENTS } })
    await settle()
    expect(w.find('.event-map__note').exists()).toBe(true)
    expect(w.vm.ready).toBe(false)
  })

  test('只為有座標的事件建立圖釘', async () => {
    installGoogleMaps()
    const w = mount(EventMap, { propsData: { events: EVENTS } })
    await settle()
    expect(w.vm.ready).toBe(true)
    expect(w.vm.marks.map((m) => m.id)).toEqual(['e-001', 'e-003'])
  })

  test('點圖釘會 emit select 帶對應 id', async () => {
    const { created } = installGoogleMaps()
    const w = mount(EventMap, { propsData: { events: EVENTS } })
    await settle()
    created[1].listeners.click()
    expect(w.emitted('select')[0]).toEqual(['e-003'])
  })

  test('events 變更時重建圖釘，不殘留舊的', async () => {
    installGoogleMaps()
    const w = mount(EventMap, { propsData: { events: EVENTS } })
    await settle()
    await w.setProps({ events: [EVENTS[0]] })
    await settle()
    expect(w.vm.marks.map((m) => m.id)).toEqual(['e-001'])
  })
})
