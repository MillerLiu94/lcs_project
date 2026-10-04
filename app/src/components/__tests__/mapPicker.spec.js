import { mount } from '@vue/test-utils'
import MapPicker from '../MapPicker.vue'

describe('MapPicker（沒有 Google Maps 金鑰時優雅降級）', () => {
  test('顯示文字提示、不載入真實 API、不丟例外', async () => {
    const w = mount(MapPicker)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(w.find('.map-picker__canvas').exists()).toBe(true)
    expect(w.find('.map-picker__note').exists()).toBe(true)
    expect(w.vm.ready).toBe(false)
  })

  test('尚未就緒時按方向鍵不會發出 pick（不合成座標）', async () => {
    const w = mount(MapPicker)
    await new Promise((resolve) => setTimeout(resolve, 0))
    await w.find('.map-picker__canvas').trigger('keydown', { key: 'ArrowUp' })
    expect(w.emitted('pick')).toBeFalsy()
  })
})
