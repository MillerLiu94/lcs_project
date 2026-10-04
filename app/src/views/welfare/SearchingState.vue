<template>
  <div class="searching" role="status" aria-live="polite">
    <p class="searching__title">正在幫你找…</p>
    <p class="searching__stage">{{ message }}</p>

    <div class="searching__skeleton" aria-hidden="true">
      <span class="searching__bar" />
      <span class="searching__bar searching__bar--short" />
      <span class="searching__bar" />
    </div>

    <div v-if="timeout" class="searching__timeout">
      <p class="searching__timeout-text">
        搜尋花費比較久，要繼續等，還是重新搜尋一次？
      </p>
      <div class="searching__actions">
        <button type="button" class="searching__button" @click="$emit('wait')">
          繼續等待
        </button>
        <button type="button" class="searching__button" @click="$emit('retry')">
          重新搜尋
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// 三段式進度文案（G8／S4 §5）：避免只有轉圈或白屏。
const MESSAGES = [
  '正在理解你的問題…',
  '正在搜尋政府與社區資訊…',
  '正在整理結果…',
]

const STAGE_MS = 1200

export default {
  name: 'SearchingState',
  props: {
    phase: { type: String, default: 'loading' },
    timeout: { type: Boolean, default: false },
  },
  data() {
    return { stage: this.phase === 'processing' ? 1 : 0, timer: null }
  },
  computed: {
    message() {
      return MESSAGES[Math.min(this.stage, MESSAGES.length - 1)]
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      if (this.stage >= MESSAGES.length - 1) {
        clearInterval(this.timer)
        this.timer = null
        return
      }
      this.stage += 1
    }, STAGE_MS)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
}
</script>

<style scoped>
.searching {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
}
.searching__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}
.searching__stage {
  margin: 0;
  font-size: 1.125rem;
  color: var(--muted-foreground);
}
.searching__skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.searching__bar {
  height: 1rem;
  border-radius: var(--radius-pill);
  background: var(--muted);
}
.searching__bar--short {
  width: 65%;
}
.searching__timeout {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
.searching__timeout-text {
  margin: 0;
  font-size: 1.125rem;
}
.searching__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.searching__button {
  min-height: 48px;
  padding: 0.5rem 1.25rem;
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 1rem;
  cursor: pointer;
}
.searching__button:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
