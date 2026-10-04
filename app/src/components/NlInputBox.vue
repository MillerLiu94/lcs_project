<template>
  <div class="nl-input">
    <label class="nl-input__label" :for="inputId">{{ label }}</label>
    <textarea
      :id="inputId"
      class="nl-input__field"
      :value="value"
      :placeholder="placeholder"
      :rows="rows"
      :aria-describedby="message ? messageId : undefined"
      @input="onInput"
    ></textarea>

    <div class="nl-input__actions">
      <VoiceButton
        :supported="voiceSupported"
        @result="onVoiceResult"
        @error="onVoiceError"
      />
      <span v-if="message" :id="messageId" class="nl-input__message" role="status">
        {{ message }}
      </span>
    </div>
  </div>
</template>

<script>
import VoiceButton from './VoiceButton.vue'
import speechService from '../services/speechService'

let uid = 0

export default {
  name: 'NlInputBox',
  components: { VoiceButton },
  props: {
    value: { type: String, default: '' },
    label: { type: String, default: '請描述你看到或遇到的問題' },
    placeholder: {
      type: String,
      default: '例如：中華路全家旁邊有一個坑洞',
    },
    rows: { type: Number, default: 4 },
  },
  data() {
    uid += 1
    return {
      inputId: `nl-input-${uid}`,
      messageId: `nl-input-msg-${uid}`,
      voiceError: '',
    }
  },
  computed: {
    voiceSupported() {
      return speechService.isSupported()
    },
    // 語音提示／錯誤共用一個輪詢區塊，並以 aria-describedby 與輸入框關聯。
    message() {
      if (this.voiceError) return this.voiceError
      return this.voiceSupported ? '' : '此裝置不支援語音，請直接用打字'
    },
  },
  methods: {
    onInput(event) {
      this.$emit('input', event.target.value)
    },
    onVoiceResult(text) {
      this.voiceError = ''
      this.$emit('voice', text)
    },
    onVoiceError(error) {
      this.voiceError = (error && error.message) || '語音輸入失敗，請改用打字'
    },
  },
}
</script>

<style scoped>
.nl-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.nl-input__label {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--foreground);
}
.nl-input__field {
  width: 100%;
  min-height: 120px;
  padding: 0.75rem 1rem;
  background: var(--card);
  color: var(--card-foreground);
  border: 2px solid var(--input);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 1.125rem;
  line-height: 1.5;
  resize: vertical;
}
.nl-input__field:focus {
  border-color: var(--ring);
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}
.nl-input__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.nl-input__message {
  font-size: 1rem;
  color: var(--muted-foreground);
}
</style>
