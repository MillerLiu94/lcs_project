<template>
  <button
    type="button"
    class="voice-button"
    :class="{ 'voice-button--listening': listening }"
    :aria-pressed="String(listening)"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <MicrophoneIcon :size="24" />
    <span class="voice-button__label">{{ buttonLabel }}</span>
  </button>
</template>

<script>
import MicrophoneIcon from './icons/Microphone.vue'
import speechService from '../services/speechService'

export default {
  name: 'VoiceButton',
  components: { MicrophoneIcon },
  props: {
    supported: { type: Boolean, default: false },
  },
  data() {
    return { listening: false }
  },
  computed: {
    buttonLabel() {
      if (this.listening) return '停止錄音'
      if (!this.supported) return '語音輸入（不支援）'
      return '用說的輸入'
    },
    ariaLabel() {
      if (this.listening) return '停止語音輸入'
      return this.supported ? '開始語音輸入' : '語音輸入，此裝置不支援'
    },
  },
  beforeDestroy() {
    if (this.listening) speechService.stop()
  },
  methods: {
    onClick() {
      if (this.listening) {
        this.listening = false
        speechService.stop()
        return
      }
      this.listening = true
      speechService.start({
        onResult: (text) => {
          this.listening = false
          this.$emit('result', text)
        },
        onError: (error) => {
          this.listening = false
          this.$emit('error', error)
        },
        onEnd: () => {
          this.listening = false
        },
      })
    },
  },
}
</script>

<style scoped>
.voice-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0.5rem 1rem;
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font-size: 1rem;
  cursor: pointer;
}
.voice-button:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}
.voice-button:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.voice-button--listening {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
.voice-button__label {
  font-weight: 600;
}
</style>
