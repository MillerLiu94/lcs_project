<template>
  <section class="detail">
    <p v-if="loading" class="detail__status" role="status">正在載入事件詳情…</p>

    <ErrorAlert v-else-if="error" message="網路有點問題，請再試一次。">
      <template #action>
        <button type="button" class="detail__action" @click="load()">再試一次</button>
      </template>
    </ErrorAlert>

    <EmptyState v-else-if="missing" message="此事件已移除。">
      <template #action>
        <router-link class="detail__action" :to="{ name: 'events' }">回事件列表</router-link>
      </template>
    </EmptyState>

    <template v-else-if="detail">
      <article class="detail__card">
        <h1 class="detail__title">{{ detail.title }}</h1>

        <dl class="detail__meta">
          <div class="detail__meta-item">
            <dt class="detail__meta-label">地點</dt>
            <dd class="detail__meta-value">{{ detail.placeText || '位置未確認' }}</dd>
          </div>
          <div class="detail__meta-item">
            <dt class="detail__meta-label">時間</dt>
            <dd class="detail__meta-value">{{ detail.timeText || '時間未提供' }}</dd>
          </div>
          <div class="detail__meta-item">
            <dt class="detail__meta-label">狀態</dt>
            <dd class="detail__meta-value">{{ statusText(detail.status) }}</dd>
          </div>
        </dl>

        <div class="detail__section">
          <h2 class="detail__section-title">描述</h2>
          <p class="detail__description">{{ detail.description || '沒有補充描述。' }}</p>
        </div>

        <div class="detail__section">
          <h2 class="detail__section-title">照片</h2>
          <img
            v-if="detail.photo"
            class="detail__photo"
            :src="detail.photo"
            alt="此事件的現場照片"
          />
          <p v-else class="detail__description">這則事件沒有附照片。</p>
        </div>
      </article>

      <router-link class="detail__action" :to="{ name: 'events' }">回事件列表</router-link>
    </template>
  </section>
</template>

<script>
import EmptyState from '../../components/EmptyState.vue'
import ErrorAlert from '../../components/ErrorAlert.vue'

const STATUS_TEXT = { reported: '待處理', 'in-progress': '處理中', resolved: '已完成' }

export default {
  name: 'EventDetailView',
  components: { EmptyState, ErrorAlert },
  computed: {
    eventId() {
      return this.$route && this.$route.params ? this.$route.params.id : ''
    },
    detail() {
      return this.$store.state.query.detail
    },
    loading() {
      return this.$store.state.query.detailLoading
    },
    missing() {
      return this.$store.state.query.detailMissing
    },
    error() {
      return this.$store.state.query.detailError
    },
  },
  watch: {
    eventId(id) {
      this.load(id)
    },
  },
  created() {
    this.load(this.eventId)
  },
  methods: {
    // 只透過 store 取得資料（G2）；不在此直接呼叫服務。
    load(id = this.eventId) {
      return this.$store.dispatch('query/loadDetail', id)
    },
    statusText(status) {
      return STATUS_TEXT[status] || '已回報'
    },
  },
}
</script>

<style scoped>
.detail { display: flex; flex-direction: column; gap: 1.25rem; }
.detail__status { margin: 0; color: var(--muted-foreground); }
.detail__card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-float);
}
.detail__title { margin: 0; font-size: 1.5rem; line-height: 1.4; }
.detail__meta { display: flex; flex-direction: column; gap: 0.75rem; margin: 0; }
.detail__meta-item { display: flex; gap: 0.75rem; }
.detail__meta-label { flex: none; min-width: 3rem; color: var(--muted-foreground); }
.detail__meta-value { margin: 0; font-size: 1.125rem; line-height: 1.6; }
.detail__section { display: flex; flex-direction: column; gap: 0.5rem; }
.detail__section-title { margin: 0; font-size: 1.125rem; }
.detail__description { margin: 0; font-size: 1.125rem; line-height: 1.7; }
.detail__photo { max-width: 100%; height: auto; border-radius: var(--radius-card); }
.detail__action {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0.5rem 1rem;
  color: var(--primary);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.detail__action:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
