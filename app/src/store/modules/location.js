// 申報位置模組：把「使用者選定的位置」集中管理。
// 位置決策由 locationService.decide（S6 §14.4）；此模組只負責狀態轉移，
// 且任何路徑都不得合成座標：selected 的 lat/lng 只可能來自裝置定位、
// 地圖點選，或候選本身已帶的真實座標。
import locationService from '../../services/locationService'

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function coordinatesOf(source) {
  if (!source || !isNumber(source.lat) || !isNumber(source.lng)) return null
  return { lat: source.lat, lng: source.lng }
}

export default {
  namespaced: true,
  state: () => ({
    current: null,
    candidates: [],
    selected: null,
    permission: 'prompt',
  }),
  getters: {
    // 「已確認的位置是否帶真實座標」：座標只能來自定位、候選或使用者點選；
    // 未確認（無座標）一律 false。
    hasCoordinates(state) {
      return coordinatesOf(state.selected) !== null
    },
  },
  mutations: {
    setPermission(state, permission) {
      state.permission = permission
      // 拒權或未知時清掉可能殘留的座標，避免誤用。
      if (permission !== 'granted') {
        state.current = null
        state.selected = null
      }
    },
    setCurrent(state, coords) {
      state.current = coordinatesOf(coords)
    },
    setCandidates(state, candidates) {
      state.candidates = Array.isArray(candidates) ? candidates : []
    },
    setSelected(state, payload) {
      state.selected = payload ? { ...payload } : null
    },
  },
  actions: {
    /**
     * 向瀏覽器要求目前位置。拒權／失敗／不支援一律 resolve(null)，不丟例外。
     * @returns {Promise<{lat:number,lng:number}|null>}
     */
    requestCurrent({ commit }) {
      const geo =
        typeof navigator !== 'undefined' && navigator ? navigator.geolocation : null
      if (!geo || typeof geo.getCurrentPosition !== 'function') {
        commit('setPermission', 'denied')
        return Promise.resolve(null)
      }
      return new Promise((resolve) => {
        geo.getCurrentPosition(
          (position) => {
            const coords = coordinatesOf({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
            commit('setPermission', 'granted')
            commit('setCurrent', coords)
            resolve(coords)
          },
          () => {
            commit('setPermission', 'denied')
            resolve(null)
          },
          { enableHighAccuracy: true, timeout: 10000 },
        )
      })
    },

    /**
     * 以文字找候選位置，並交由 decide 收斂模式。
     * @returns {Promise<{candidates:Array, decision:object}>}
     */
    async resolveText({ commit, state }, text) {
      const candidates = await locationService.geocode(text)
      commit('setCandidates', candidates)
      const decision = locationService.decide({
        onSite: false,
        permissionGranted: state.permission === 'granted',
        candidates,
      })
      return { candidates, decision }
    },

    /**
     * 選定某個候選。僅當候選自帶真實座標才設為 selected；否則不合成。
     * @returns {object|null}
     */
    pickCandidate({ commit, state }, id) {
      const candidate = state.candidates.find((item) => item.id === id)
      const coords = coordinatesOf(candidate)
      if (!coords) {
        commit('setSelected', null)
        return null
      }
      const selected = {
        mode: 'candidate',
        lat: coords.lat,
        lng: coords.lng,
        name: candidate.name || '',
        address: candidate.address || '',
      }
      commit('setSelected', selected)
      return selected
    },

    /**
     * §14.4 降級：記錄模式（例如 unconfirmed），絕不伴隨合成座標。
     * @returns {object|null}
     */
    fallback({ commit }, mode) {
      const selected = mode ? { mode } : null
      commit('setSelected', selected)
      return selected
    },
  },
}
