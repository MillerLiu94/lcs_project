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

  start({ onResult, onError, onEnd, lang = DEFAULT_LANG } = {}) {
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
      const sessionId = ++this._sessionSeq
      // Only the currently active session may report or clear shared state; a
      // stale session's queued onend must never clobber a newer one.
      const isActive = () => this._sessionId === sessionId

      recognition.lang = lang
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        if (!isActive()) return
        if (typeof onResult === 'function') onResult(readTranscript(event))
      }
      recognition.onerror = (event) => {
        if (!isActive()) return
        const reason = event && event.error ? event.error : '語音辨識失敗'
        reportError(new Error(reason))
      }
      recognition.onend = () => {
        if (!isActive()) return
        this._recognition = null
        this._sessionId = 0
        if (typeof onEnd === 'function') onEnd()
      }

      this._recognition = recognition
      this._sessionId = sessionId
      recognition.start()
    } catch (error) {
      this._recognition = null
      this._sessionId = 0
      reportError(error)
    }
  },

  stop() {
    if (!this._recognition) return
    const recognition = this._recognition
    this._recognition = null
    this._sessionId = 0
    try {
      recognition.stop()
    } catch (error) {
      // Stopping an already-ended session is harmless; never surface it.
    }
  },

  _recognition: null,
  _sessionId: 0,
  _sessionSeq: 0,
}

export default speechService
