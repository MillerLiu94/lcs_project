// Web Speech API wrapper — voice is a progressive enhancement.
// When SpeechRecognition is unavailable, start() reports an error through the
// onError callback and returns quietly so typing always remains usable.

const DEFAULT_LANG = 'zh-TW'
const UNSUPPORTED_MESSAGE = '此瀏覽器不支援語音輸入，請改用打字'

function getRecognitionCtor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function isSupported() {
  return getRecognitionCtor() !== null
}

function readTranscript(event) {
  if (!event || !event.results) return ''
  let text = ''
  for (let i = 0; i < event.results.length; i += 1) {
    const result = event.results[i]
    if (result && result[0] && result[0].transcript) text += result[0].transcript
  }
  return text.trim()
}

const speechService = {
  isSupported,

  start({ onResult, onError, lang = DEFAULT_LANG } = {}) {
    const reportError = (error) => {
      if (typeof onError === 'function') onError(error)
    }

    const RecognitionCtor = getRecognitionCtor()
    if (!RecognitionCtor) {
      reportError(new Error(UNSUPPORTED_MESSAGE))
      return
    }

    try {
      this.stop()
      const recognition = new RecognitionCtor()
      recognition.lang = lang
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        if (typeof onResult === 'function') onResult(readTranscript(event))
      }
      recognition.onerror = (event) => {
        const reason = event && event.error ? event.error : '語音辨識失敗'
        reportError(new Error(reason))
      }
      recognition.onend = () => {
        this._recognition = null
      }

      this._recognition = recognition
      recognition.start()
    } catch (error) {
      this._recognition = null
      reportError(error)
    }
  },

  stop() {
    if (!this._recognition) return
    const recognition = this._recognition
    this._recognition = null
    try {
      recognition.stop()
    } catch (error) {
      // Stopping an already-ended session is harmless; never surface it.
    }
  },

  _recognition: null,
}

export default speechService
