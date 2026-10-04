import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import location from '../modules/location'
import locationService from '../../services/locationService'

const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { location } })
}

// 以可控的假 geolocation 取代瀏覽器 API；不觸發任何真實定位。
function stubGeolocation(impl) {
  Object.defineProperty(window.navigator, 'geolocation', { configurable: true, value: impl })
}

describe('location store（S6 §14.4：任何路徑都不得合成座標）', () => {
  afterEach(() => {
    delete window.navigator.geolocation
    vi.restoreAllMocks()
  })

  // 任務指定的必要測試（Review Focus #2）。
  test('拒權後仍可文字描述，且不會填入假座標', () => {
    const store = makeStore()
    store.commit('location/setPermission', 'denied')
    expect(store.state.location.selected).toBeNull()
    expect(store.getters['location/hasCoordinates']).toBe(false)
  })

  test('定位成功 → permission granted 且 current 為真實座標', async () => {
    stubGeolocation({
      getCurrentPosition: (ok) => ok({ coords: { latitude: 25.0455, longitude: 121.509 } }),
    })
    const store = makeStore()
    const coords = await store.dispatch('location/requestCurrent')
    expect(coords).toEqual({ lat: 25.0455, lng: 121.509 })
    expect(store.state.location.permission).toBe('granted')
    expect(store.state.location.current).toEqual({ lat: 25.0455, lng: 121.509 })
  })

  test('定位被拒 → 不丟例外、permission denied、沒有座標', async () => {
    stubGeolocation({ getCurrentPosition: (_ok, fail) => fail({ code: 1 }) })
    const store = makeStore()
    await expect(store.dispatch('location/requestCurrent')).resolves.toBeNull()
    expect(store.state.location.permission).toBe('denied')
    expect(store.state.location.current).toBeNull()
    expect(store.getters['location/hasCoordinates']).toBe(false)
  })

  test('裝置沒有 geolocation 時不丟例外', async () => {
    const store = makeStore()
    await expect(store.dispatch('location/requestCurrent')).resolves.toBeNull()
    expect(store.state.location.permission).toBe('denied')
  })

  test('resolveText 呼叫 geocode 並以 decide 決定模式（唯一候選 → candidate）', async () => {
    vi.spyOn(locationService, 'geocode').mockResolvedValue([
      { id: 'p1', lat: 25.0455, lng: 121.509 },
    ])
    const store = makeStore()
    const { decision } = await store.dispatch('location/resolveText', '中華路全家')
    expect(locationService.geocode).toHaveBeenCalledWith('中華路全家')
    expect(decision.mode).toBe('candidate')
    expect(store.state.location.candidates).toHaveLength(1)
  })

  test('多候選 → decide 收斂為 map-confirm（交由地圖消歧）', async () => {
    vi.spyOn(locationService, 'geocode').mockResolvedValue([
      { id: 'p1', lat: 1, lng: 1 },
      { id: 'p2', lat: 2, lng: 2 },
    ])
    const store = makeStore()
    const { decision } = await store.dispatch('location/resolveText', '中華路')
    expect(decision.mode).toBe('map-confirm')
    expect(store.getters['location/hasCoordinates']).toBe(false)
  })

  test('pickCandidate 只採用候選自帶的真實座標', async () => {
    const store = makeStore()
    store.commit('location/setCandidates', [{ id: 'p1', lat: 25.0455, lng: 121.509 }])
    await store.dispatch('location/pickCandidate', 'p1')
    expect(store.getters['location/hasCoordinates']).toBe(true)
    expect(store.state.location.selected).toMatchObject({ lat: 25.0455, lng: 121.509 })
  })

  test('pickCandidate 遇到未知或無座標候選 → 不合成座標', async () => {
    const store = makeStore()
    store.commit('location/setCandidates', [{ id: 'p1' }])
    await store.dispatch('location/pickCandidate', 'p1')
    await store.dispatch('location/pickCandidate', 'nope')
    expect(store.state.location.selected).toBeNull()
    expect(store.getters['location/hasCoordinates']).toBe(false)
  })

  test('fallback(unconfirmed) 記錄模式但沒有座標', () => {
    const store = makeStore()
    store.dispatch('location/fallback', 'unconfirmed')
    expect(store.state.location.selected).toEqual({ mode: 'unconfirmed' })
    expect(store.getters['location/hasCoordinates']).toBe(false)
  })

  test('setSelected 帶入的座標必須是數字，否則視為無座標', () => {
    const store = makeStore()
    store.commit('location/setSelected', { mode: 'gps', lat: '25.04', lng: '121.5' })
    expect(store.getters['location/hasCoordinates']).toBe(false)
  })
})
