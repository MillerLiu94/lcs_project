<template>
  <section class="confirm">
    <header class="confirm__header">
      <button type="button" class="confirm__back" @click="goBack">← 上一步</button>
      <StepIndicator :current="3" :total="3" />
    </header>

    <h1 class="confirm__title">請確認，這樣對嗎？</h1>

    <dl class="confirm__summary">
      <div class="confirm__row">
        <dt class="confirm__label">事件</dt>
        <dd class="confirm__value">{{ draft.description || '（還沒填寫）' }}</dd>
        <button type="button" class="confirm__edit" @click="edit('report')">修改</button>
      </div>
      <div class="confirm__row">
        <dt class="confirm__label">地點</dt>
        <dd class="confirm__value">{{ locationText }}</dd>
        <button type="button" class="confirm__edit" @click="edit('report-location')">修改</button>
      </div>
      <div class="confirm__row">
        <dt class="confirm__label">時間</dt>
        <dd class="confirm__value">{{ timeText }}</dd>
      </div>
      <div class="confirm__row">
        <dt class="confirm__label">照片</dt>
        <dd class="confirm__value">{{ photoText }}</dd>
      </div>
    </dl>

    <ErrorAlert v-if="errorMessage" :message="errorMessage">
      <template #action>
        <button type="button" class="confirm__retry" @click="confirm">再試一次</button>
      </template>
    </ErrorAlert>

    <button
      type="button"
      class="confirm__submit"
      :disabled="isSubmitting"
      :aria-busy="String(isSubmitting)"
      @click="confirm"
    >
      {{ isSubmitting ? '正在送出…' : '確認送出' }}
    </button>
  </section>
</template>

<script>
import StepIndicator from '../../components/StepIndicator.vue'
import ErrorAlert from '../../components/ErrorAlert.vue'

export default {
  name: 'ConfirmStep',
  components: { StepIndicator, ErrorAlert },
  computed: {
    draft() {
      return this.$store.state.report.draft
    },
    isSubmitting() {
      return this.$store.state.report.status === 'submitting'
    },
    errorMessage() {
      return this.$store.state.report.status === 'error' ? '網路有點問題，請再試一次。' : ''
    },
    locationText() {
      const location = this.draft.location
      if (!location) return '還沒選位置'
      if (location.mode === 'gps') return '使用你目前的位置'
      if (location.mode === 'candidate') {
        return [location.name, location.address].filter(Boolean).join('・') || '已選擇的地點'
      }
      if (location.mode === 'unconfirmed') return location.text || '大約的位置（還沒確認）'
      if (typeof location.lat === 'number') return '你在地圖上點的位置'
      return location.text || '已選擇的位置'
    },
    timeText() {
      return this.draft.time || '剛剛'
    },
    photoText() {
      return this.draft.photo ? '已附上照片' : '沒有照片（可省略）'
    },
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'report-location' })
    },
    edit(name) {
      // 只切換步驟，草稿留在 store，因此不會遺失任何輸入。
      this.$router.push({ name })
    },
    async confirm() {
      if (this.isSubmitting) return
      try {
        await this.$store.dispatch('report/submit')
        // 先把畫面帶到完成頁（此時護欄還看得到 draft.description），
        // 抵達後才清空草稿；順序顛倒會被護欄彈回 /report。
        await this.$router.push({ name: 'report-done' })
        this.$store.dispatch('report/reset')
      } catch (error) {
        // status 已為 error 且草稿仍在，交由 ErrorAlert 顯示並可重試。
      }
    },
  },
}
</script>

<style scoped>
.confirm {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.confirm__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.confirm__back,
.confirm__edit {
  min-height: 48px;
  padding: 0 0.5rem;
  background: none;
  border: none;
  color: var(--foreground);
  font: inherit;
  font-size: 1.125rem;
  cursor: pointer;
}
.confirm__edit { color: var(--primary); font-weight: 700; }
.confirm__title {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.4;
}
.confirm__summary {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 1rem 1.25rem;
  gap: 0.25rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
}
.confirm__row {
  display: grid;
  grid-template-columns: 4rem 1fr auto;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.5rem 0;
}
.confirm__label {
  margin: 0;
  font-weight: 700;
  color: var(--muted-foreground);
}
.confirm__value {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.6;
  word-break: break-word;
}
.confirm__submit {
  width: 100%;
  min-height: 56px;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
}
.confirm__submit:disabled { cursor: not-allowed; opacity: 0.55; }
.confirm__retry {
  min-height: 48px;
  padding: 0.5rem 1.25rem;
  background: none;
  border: 2px solid var(--destructive);
  border-radius: var(--radius-pill);
  color: var(--destructive);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.confirm button:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
