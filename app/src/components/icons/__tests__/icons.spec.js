import { shallowMount } from '@vue/test-utils'
import House from '../House.vue'
import Flag from '../Flag.vue'
import MapPin from '../MapPin.vue'
import Gift from '../Gift.vue'
import ArrowLeft from '../ArrowLeft.vue'
import Calendar from '../Calendar.vue'
import Microphone from '../Microphone.vue'

const ICONS = {
  House: [House, 'el-icon-house'],
  Flag: [Flag, 'el-icon-warning-outline'],
  MapPin: [MapPin, 'el-icon-location-outline'],
  Gift: [Gift, 'el-icon-present'],
  ArrowLeft: [ArrowLeft, 'el-icon-arrow-left'],
  Calendar: [Calendar, 'el-icon-date'],
  Microphone: [Microphone, 'el-icon-microphone'],
}

describe.each(Object.entries(ICONS))('%s 使用 Element UI icon', (_name, [Icon, className]) => {
  test('輸出對應的 el-icon class', () => {
    const i = shallowMount(Icon).find('i')
    expect(i.exists()).toBe(true)
    expect(i.classes()).toContain(className)
  })

  test('預設 24px，且可依 size prop 調整', () => {
    expect(shallowMount(Icon).find('i').attributes('style')).toContain('font-size: 24px')
    const w = shallowMount(Icon, { propsData: { size: 32 } })
    expect(w.find('i').attributes('style')).toContain('font-size: 32px')
  })

  test('aria-hidden 由使用端決定', () => {
    expect(shallowMount(Icon).find('i').attributes('aria-hidden')).toBeUndefined()
    const w = shallowMount(Icon, { attrs: { 'aria-hidden': 'true' } })
    expect(w.find('i').attributes('aria-hidden')).toBe('true')
  })
})
