import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import LocationStep from '../LocationStep.vue'
import report from '../../../store/modules/report'
import location from '../../../store/modules/location'

const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  return new Vuex.Store({ modules: { report, location } })
}

function mountStep(store, push = () => {}) {
  return mount(LocationStep, { localVue, store, mocks: { $router: { push } } })
}

describe('LocationStep（P2 確認位置）', () => {
  test('提供三種找位置的方式（拖曳非唯一）', () => {
    const w = mountStep(makeStore())
    const labels = w.findAll('.location__stack button').wrappers.map((b) => b.text())
    expect(labels).toContain('使用我目前的位置')
    expect(labels).toContain('我還記得，用文字描述')
    expect(labels).toContain('在地圖上點選位置')
  })

  test('尚未有座標時，「確認這個位置」停用', () => {
    const w = mountStep(makeStore())
    expect(w.find('.location__confirm').attributes('disabled')).toBe('disabled')
  })

  test('拒權後改走文字描述，且不會有座標', async () => {
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: (_ok, fail) => fail({ code: 1 }) },
    })
    try {
      const w = mountStep(makeStore())
      await w.findAll('.location__stack button').at(0).trigger('click')
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(w.vm.situation).toBe('text')
      expect(w.findComponent({ name: 'NlInputBox' }).exists()).toBe(true)
      expect(w.find('.location__confirm').attributes('disabled')).toBe('disabled')
    } finally {
      delete window.navigator.geolocation
    }
  })

  test('定位成功後確認，寫入真實座標', async () => {
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (ok) => ok({ coords: { latitude: 25.0455, longitude: 121.509 } }),
      },
    })
    try {
      const store = makeStore()
      const push = vi.fn()
      const w = mountStep(store, push)
      await w.findAll('.location__stack button').at(0).trigger('click')
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(store.getters['location/hasCoordinates']).toBe(true)
      await w.find('.location__confirm').trigger('click')
      expect(store.state.report.draft.location).toMatchObject({
        mode: 'gps',
        lat: 25.0455,
        lng: 121.509,
      })
      expect(push).toHaveBeenCalledWith({ name: 'report-confirm' })
    } finally {
      delete window.navigator.geolocation
    }
  })

  test('「不確定，先送出」保留原話、不產生座標', async () => {
    const store = makeStore()
    store.commit('report/setDescription', '中華路有一個坑洞')
    const push = vi.fn()
    const w = mountStep(store, push)
    await w.find('.location__skip').trigger('click')
    expect(store.state.report.draft.location).toEqual({
      mode: 'unconfirmed',
      text: '中華路有一個坑洞',
    })
    expect(store.getters['location/hasCoordinates']).toBe(false)
    expect(push).toHaveBeenCalledWith({ name: 'report-confirm' })
  })

  test('文字找位置失敗時顯示錯誤，並提供「再試一次」下一步', async () => {
    window.history.replaceState({}, '', '/?mock=error')
    try {
      const w = mountStep(makeStore())
      await w.findAll('.location__stack button').at(1).trigger('click') // 用文字描述
      await w.find('textarea').setValue('中華路')
      await w.find('form').trigger('submit')
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(w.vm.error).toBeTruthy()
      const retry = w.find('.location__retry')
      expect(retry.exists()).toBe(true)
      expect(retry.text()).toBe('再試一次')
    } finally {
      window.history.replaceState({}, '', '/')
    }
  })

  test('在地圖模式下仍可改用文字描述（文字路徑永遠存在）', async () => {
    const w = mountStep(makeStore())
    await w.findAll('.location__stack button').at(2).trigger('click')
    expect(w.vm.situation).toBe('map')
    const alt = w
      .findAll('.location__skip')
      .wrappers.find((b) => b.text() === '改用文字描述')
    expect(alt).toBeTruthy()
    await alt.trigger('click')
    expect(w.vm.situation).toBe('text')
    expect(w.findComponent({ name: 'NlInputBox' }).exists()).toBe(true)
  })
})
