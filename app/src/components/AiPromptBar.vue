<template>
  <div class="prompt-bar">
    <label class="prompt-bar__label" :for="inputId">{{ label }}</label>

    <div class="prompt-bar__field">
      <textarea
        :id="inputId"
        ref="input"
        class="prompt-bar__input"
        :value="value"
        :placeholder="placeholder"
        :rows="rows"
        :aria-describedby="message ? messageId : undefined"
        @input="onInput"
        @keydown="onKeydown"
      ></textarea>

      <div class="prompt-bar__controls">
        <AttachmentControls
          v-if="attachable"
          :is-mobile="isMobile"
          @photo="onPhoto"
          @audio="onAudio"
          @error="attachError = $event"
        />
        <VoiceButton
          :supported="voiceSupported"
          @result="onVoiceResult"
          @error="onVoiceError"
        />
        <button
          type="button"
          class="prompt-bar__send"
          :disabled="!canSubmit || busy"
          :aria-label="busy ? '處理中' : submitLabel"
          @click="onSend"
        >
          <i class="el-icon-position" style="font-size: 1.25rem" aria-hidden="true" />
        </button>
      </div>
    </div>

    <AttachmentChips
      v-if="attachable"
      :photo="photo"
      :audio-name="audioName"
      @remove-photo="$emit('remove-photo')"
      @remove-audio="$emit('remove-audio')"
    />

    <span v-if="message" :id="messageId" class="prompt-bar__message" role="status">
      {{ message }}
    </span>
  </div>
</template>

<script>
import VoiceButton from './VoiceButton.vue'
import AttachmentControls from './AttachmentControls.vue'
import AttachmentChips from './AttachmentChips.vue'
import speechService from '../services/speechService'
import { useBreakpoint } from '../composables/useBreakpoint'

let uid = 0

export default {
  name: 'AiPromptBar',
  components: { VoiceButton, AttachmentControls, AttachmentChips },
  props: {
    value: { type: String, default: '' },
    label: { type: String, default: '請描述你看到或遇到的問題' },
    placeholder: {
      type: String,
      default: '例如：中華路全家旁邊有一個坑洞',
    },
    rows: { type: Number, default: 1 },
    busy: { type: Boolean, default: false },
    submitLabel: { type: String, default: '送出' },
    attachable: { type: Boolean, default: false },
    photo: { type: String, default: '' },
    audio: { type: String, default: '' },
    audioName: { type: String, default: '' },
  },
  setup() {
    const { isMobile } = useBreakpoint()
    return { isMobile }
  },
  data() {
    uid += 1
    return {
      inputId: `prompt-bar-${uid}`,
      messageId: `prompt-bar-msg-${uid}`,
      voiceError: '',
      attachError: '',
    }
  },
  computed: {
    voiceSupported() {
      return speechService.isSupported()
    },
    canSubmit() {
      return String(this.value).trim().length > 0
    },
    // 語音提示／錯誤共用一個區塊，並以 aria-describedby 與輸入框關聯。
    message() {
      if (this.attachError) return this.attachError
      if (this.voiceError) return this.voiceError
      return this.voiceSupported ? '' : '此裝置不支援語音，請直接用打字'
    },
  },
  mounted() {
    this.resize()
  },
  methods: {
    onInput(event) {
      this.$emit('input', event.target.value)
      this.resize()
    },
    onKeydown(event) {
      // Enter 送出、Shift+Enter 換行（prompt bar 慣例）；輸入法組字中不攔截。
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault()
        this.onSend()
      }
    },
    onSend() {
      if (!this.canSubmit || this.busy) return
      this.$emit('submit')
    },
    onVoiceResult(text) {
      this.voiceError = ''
      this.$emit('voice', text)
      this.resize()
    },
    onVoiceError(error) {
      this.voiceError = (error && error.message) || '語音輸入失敗，請改用打字'
    },
    onPhoto(dataUrl) {
      this.attachError = ''
      this.$emit('attach-photo', dataUrl)
    },
    onAudio(payload) {
      this.attachError = ''
      this.$emit('attach-audio', payload)
    },
    resize() {
      const el = this.$refs.input
      if (!el || !el.scrollHeight) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    },
  },
}
</script>

<style scoped>
.prompt-bar { display: flex; flex-direction: column; gap: 0.5rem; }
.prompt-bar__label { font-size: 1.125rem; font-weight: 700; color: var(--foreground); }
.prompt-bar__field {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  background: var(--card);
  color: var(--card-foreground);
  border: 2px solid var(--input);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-float);
}
.prompt-bar__field:focus-within { border-color: var(--ring); outline: 2px solid var(--ring); outline-offset: 2px; }
.prompt-bar__input {
  flex: 1 1 auto;
  min-height: 2.75rem;
  max-height: 12rem;
  padding: 0.5rem 0;
  background: transparent;
  color: inherit;
  border: none;
  outline: none;
  resize: none;
  overflow-y: auto;
  font-family: inherit;
  font-size: 1.125rem;
  line-height: 1.5;
}
.prompt-bar__input::placeholder { color: var(--muted-foreground); }
.prompt-bar__controls { display: flex; align-items: center; gap: 0.25rem; }
.prompt-bar__send {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  padding: 0;
  background: var(--primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: var(--radius-pill);
  cursor: pointer;
}
.prompt-bar__send:hover:not(:disabled) { background: var(--primary-hover); }
.prompt-bar__send:disabled { cursor: not-allowed; opacity: 0.55; }
.prompt-bar__send:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
.prompt-bar__message { font-size: 1rem; color: var(--muted-foreground); }
</style>
