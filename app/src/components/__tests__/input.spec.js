import { mount } from '@vue/test-utils'
import NlInputBox from '../NlInputBox.vue'
import VoiceButton from '../VoiceButton.vue'

describe('NlInputBox', () => {
  test('有可見的 label 並與多行輸入框對應', () => {
    const w = mount(NlInputBox, { propsData: { value: '' } })
    const label = w.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text().length).toBeGreaterThan(0)
    const textarea = w.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('id')).toBe(label.attributes('for'))
  })

  test('輸入時發出 input 事件', async () => {
    const w = mount(NlInputBox)
    const textarea = w.find('textarea')
    textarea.element.value = '中華路有坑洞'
    await textarea.trigger('input')
    expect(w.emitted('input')[0]).toEqual(['中華路有坑洞'])
  })

  test('語音結果以 voice 事件往上傳', () => {
    const w = mount(NlInputBox)
    w.findComponent(VoiceButton).vm.$emit('result', '公園有積水')
    expect(w.emitted('voice')[0]).toEqual(['公園有積水'])
  })
})

describe('VoiceButton', () => {
  test('不支援語音時點擊會發出 error 且不拋例外', async () => {
    const w = mount(VoiceButton, { propsData: { supported: false } })
    await w.trigger('click')
    expect(w.emitted('error')).toBeTruthy()
  })

  test('辨識結束但沒有結果時，按鈕不會卡在錄音中', async () => {
    const instances = []
    class FakeRecognition {
      constructor() { instances.push(this) }
      start() {}
      stop() {}
    }
    const original = window.SpeechRecognition
    window.SpeechRecognition = FakeRecognition
    try {
      const w = mount(VoiceButton, { propsData: { supported: true } })
      await w.trigger('click')
      expect(w.vm.listening).toBe(true)
      expect(w.find('button').attributes('aria-pressed')).toBe('true')

      instances[0].onend() // 未產生 result／error 就自然結束
      await w.vm.$nextTick()

      expect(w.vm.listening).toBe(false)
      expect(w.find('button').attributes('aria-pressed')).toBe('false')
    } finally {
      window.SpeechRecognition = original
    }
  })
})
