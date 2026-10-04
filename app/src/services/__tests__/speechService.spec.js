import speechService from '../speechService'

test('不支援時 start 會回報錯誤但不拋例外', () => {
  let err = null
  expect(() => speechService.start({ onResult(){}, onError(e){ err = e } })).not.toThrow()
  if (!speechService.isSupported()) expect(err).toBeTruthy()
})

function withRecognition(Fake, run) {
  const original = window.SpeechRecognition
  window.SpeechRecognition = Fake
  try {
    run()
  } finally {
    window.SpeechRecognition = original
  }
}

test('辨識自然結束時會呼叫 onEnd 並清除 session', () => {
  const instances = []
  class Fake {
    constructor() { instances.push(this) }
    start() {}
    stop() {}
  }
  withRecognition(Fake, () => {
    let ended = 0
    speechService.start({ onResult() {}, onEnd() { ended += 1 } })
    expect(instances).toHaveLength(1)
    instances[0].onend()
    expect(ended).toBe(1)
    expect(speechService._recognition).toBeNull()
  })
})

test('舊 session 的 onend 不會清掉新 session（stop 仍有效）', () => {
  const instances = []
  class Fake {
    constructor() { instances.push(this) }
    start() {}
    stop() { this.stopped = true }
  }
  withRecognition(Fake, () => {
    speechService.start({ onResult() {} })
    speechService.start({ onResult() {} })
    const [first, second] = instances
    first.onend() // 較舊的 session 遲到的 onend
    speechService.stop()
    expect(second.stopped).toBe(true)
  })
})
