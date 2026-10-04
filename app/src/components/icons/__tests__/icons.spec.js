import { shallowMount } from '@vue/test-utils'
import House from '../House.vue'
import Flag from '../Flag.vue'
import MapPin from '../MapPin.vue'
import Gift from '../Gift.vue'
import ArrowLeft from '../ArrowLeft.vue'
import Calendar from '../Calendar.vue'
import Microphone from '../Microphone.vue'

test('House 輸出 svg 且預設 24px', () => {
  const w = shallowMount(House)
  expect(w.find('svg').exists()).toBe(true)
  expect(w.find('svg').attributes('width')).toBe('24')
})

const ICONS = { House, Flag, MapPin, Gift, ArrowLeft, Calendar, Microphone }

describe.each(Object.entries(ICONS))('%s 線性圖示', (_name, Icon) => {
  test('使用 24px viewBox 且為線性樣式', () => {
    const svg = shallowMount(Icon).find('svg')
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    expect(svg.attributes('fill')).toBe('none')
    expect(svg.attributes('stroke')).toBe('currentColor')
    expect(svg.attributes('stroke-width')).toBe('1.75')
  })

  test('預設尺寸為 24，且可依 size prop 調整', () => {
    expect(shallowMount(Icon).find('svg').attributes('width')).toBe('24')
    const w = shallowMount(Icon, { propsData: { size: 32 } })
    expect(w.find('svg').attributes('width')).toBe('32')
    expect(w.find('svg').attributes('height')).toBe('32')
  })

  test('aria-hidden 由使用端決定', () => {
    expect(
      shallowMount(Icon).find('svg').attributes('aria-hidden')
    ).toBeUndefined()
    const w = shallowMount(Icon, { attrs: { 'aria-hidden': 'true' } })
    expect(w.find('svg').attributes('aria-hidden')).toBe('true')
  })
})
