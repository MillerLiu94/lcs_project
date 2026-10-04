import { mount } from '@vue/test-utils'
import AiPromptBar from '../AiPromptBar.vue'
import VoiceButton from '../VoiceButton.vue'

describe('AiPromptBar', () => {
  test('有可見的 label 並與輸入框對應', () => {
    const w = mount(AiPromptBar, { propsData: { value: '' } })
    const label = w.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text().length).toBeGreaterThan(0)
    const textarea = w.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('id')).toBe(label.attributes('for'))
  })

  test('輸入時發出 input 事件', async () => {
    const w = mount(AiPromptBar)
    const textarea = w.find('textarea')
    textarea.element.value = '中華路有坑洞'
    await textarea.trigger('input')
    expect(w.emitted('input')[0]).toEqual(['中華路有坑洞'])
  })

  test('語音結果以 voice 事件往上傳', () => {
    const w = mount(AiPromptBar)
    w.findComponent(VoiceButton).vm.$emit('result', '公園有積水')
    expect(w.emitted('voice')[0]).toEqual(['公園有積水'])
  })

  test('空輸入時送出鈕停用；有內容時點送出會發出 submit', async () => {
    const w = mount(AiPromptBar, { propsData: { value: '' } })
    expect(w.find('.prompt-bar__send').attributes('disabled')).toBe('disabled')
    await w.setProps({ value: '找活動' })
    expect(w.find('.prompt-bar__send').attributes('disabled')).toBeUndefined()
    await w.find('.prompt-bar__send').trigger('click')
    expect(w.emitted('submit')).toBeTruthy()
  })

  test('Enter 送出、Shift+Enter 不送出', async () => {
    const w = mount(AiPromptBar, { propsData: { value: '找活動' } })
    await w.find('textarea').trigger('keydown', { key: 'Enter' })
    expect(w.emitted('submit')).toBeTruthy()

    const w2 = mount(AiPromptBar, { propsData: { value: '找活動' } })
    await w2.find('textarea').trigger('keydown', { key: 'Enter', shiftKey: true })
    expect(w2.emitted('submit')).toBeFalsy()
  })

  test('attachable 關閉時不顯示附件控制；開啟時顯示', () => {
    const off = mount(AiPromptBar, { propsData: { value: '' } })
    expect(off.findComponent({ name: 'AttachmentControls' }).exists()).toBe(false)
    const on = mount(AiPromptBar, { propsData: { value: '', attachable: true } })
    expect(on.findComponent({ name: 'AttachmentControls' }).exists()).toBe(true)
  })

  test('附件選擇事件由子元件往上轉發', () => {
    const w = mount(AiPromptBar, { propsData: { value: '', attachable: true } })
    const controls = w.findComponent({ name: 'AttachmentControls' })
    controls.vm.$emit('photo', 'data:img')
    controls.vm.$emit('audio', { name: 'a.mp3', dataUrl: 'data:aud' })
    expect(w.emitted('attach-photo')[0]).toEqual(['data:img'])
    expect(w.emitted('attach-audio')[0]).toEqual([{ name: 'a.mp3', dataUrl: 'data:aud' }])
  })

  test('移除事件由 AttachmentChips 往上轉發', () => {
    const w = mount(AiPromptBar, {
      propsData: { value: '', attachable: true, photo: 'data:img', audioName: 'a.mp3' },
    })
    const chips = w.findComponent({ name: 'AttachmentChips' })
    chips.vm.$emit('remove-photo')
    chips.vm.$emit('remove-audio')
    expect(w.emitted('remove-photo')).toBeTruthy()
    expect(w.emitted('remove-audio')).toBeTruthy()
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
