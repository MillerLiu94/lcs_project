<template>
  <form class="search-input" @submit.prevent="submit">
    <AiPromptBar
      v-model="text"
      label="想找什麼福利或活動？"
      placeholder="例如：這個月有什麼老人活動？"
      :rows="3"
      :busy="busy"
      submit-label="開始找"
      @submit="submit"
      @voice="text = $event"
    />

    <div class="search-input__examples">
      <span class="search-input__examples-label">常見範例：</span>
      <button
        v-for="example in examples"
        :key="example"
        type="button"
        class="search-input__chip"
        :disabled="busy"
        @click="useExample(example)"
      >
        {{ example }}
      </button>
    </div>
  </form>
</template>

<script>
import AiPromptBar from '../../components/AiPromptBar.vue'

export default {
  name: 'SearchInput',
  components: { AiPromptBar },
  props: {
    value: { type: String, default: '' },
    busy: { type: Boolean, default: false },
  },
  data() {
    return { text: this.value, examples: ['活動', '課程', '疫苗'] }
  },
  computed: {
    canSubmit() {
      return this.text.trim().length > 0
    },
  },
  watch: {
    // 搜尋期間與失敗後都保留輸入（S4 §5）。
    value(next) {
      this.text = next
    },
  },
  methods: {
    useExample(example) {
      if (this.busy) return
      this.text = example
      this.$emit('search', example)
    },
    submit() {
      if (!this.canSubmit || this.busy) return
      this.$emit('search', this.text)
    },
  },
}
</script>

<style scoped>
.search-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.search-input__examples {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.search-input__examples-label {
  font-size: 1rem;
  color: var(--muted-foreground);
}
.search-input__chip {
  min-height: 48px;
  padding: 0.5rem 1rem;
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 1rem;
  cursor: pointer;
}
.search-input__chip:hover:not(:disabled) {
  background: var(--accent);
  color: var(--accent-foreground);
}
.search-input__chip:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
