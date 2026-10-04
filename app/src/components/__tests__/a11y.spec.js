import { mount } from '@vue/test-utils'
import AiPromptBar from '../AiPromptBar.vue'
import MapPicker from '../MapPicker.vue'

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

// G4：非文字提示（語音不支援／地圖操作說明）需以 aria-describedby 與控制項關聯，
// 讓螢幕閱讀器一併朗讀，而不是只靠視覺呈現。
describe('a11y 關聯文字', () => {
  test('AiPromptBar 的輸入框以 aria-describedby 指向語音提示', () => {
    const w = mount(AiPromptBar)
    const textarea = w.find('textarea')
    const id = textarea.attributes('aria-describedby')
    expect(id).toBeTruthy()
    const described = w.find(`#${id}`)
    expect(described.exists()).toBe(true)
    expect(described.text()).toContain('打字')
  })

  test('MapPicker 的畫布以 aria-describedby 指向操作說明', async () => {
    const w = mount(MapPicker)
    await settle()
    const canvas = w.find('.map-picker__canvas')
    const id = canvas.attributes('aria-describedby')
    expect(id).toBeTruthy()
    expect(w.find(`#${id}`).exists()).toBe(true)
  })
})
