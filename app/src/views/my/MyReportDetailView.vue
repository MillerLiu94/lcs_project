<template>
  <section class="report-detail">
    <EmptyState v-if="!report" message="這筆回報已移除">
      <template #action>
        <router-link class="report-detail__action" to="/my-reports">回我的回報</router-link>
      </template>
    </EmptyState>

    <template v-else>
      <h1 class="report-detail__title">{{ report.title || '（未命名回報）' }}</h1>

      <dl class="report-detail__meta">
        <div class="report-detail__row">
          <dt class="report-detail__label">類型</dt>
          <dd class="report-detail__value">{{ report.type || '未分類' }}</dd>
        </div>
        <div class="report-detail__row">
          <dt class="report-detail__label">狀態</dt>
          <dd class="report-detail__value">{{ statusText(report.status) }}</dd>
        </div>
        <div class="report-detail__row">
          <dt class="report-detail__label">地點</dt>
          <dd class="report-detail__value">{{ report.placeText || '位置未確認' }}</dd>
        </div>
        <div class="report-detail__row">
          <dt class="report-detail__label">時間</dt>
          <dd class="report-detail__value">{{ report.timeText || '時間未提供' }}</dd>
        </div>
      </dl>

      <div class="report-detail__section">
        <h2 class="report-detail__heading">描述</h2>
        <p class="report-detail__description">{{ report.description || '沒有補充描述。' }}</p>
      </div>

      <div class="report-detail__section">
        <h2 class="report-detail__heading">照片</h2>
        <img
          v-if="report.photo"
          class="report-detail__photo"
          :src="report.photo"
          :alt="report.title ? `${report.title} 的照片` : '這則回報的照片'"
          loading="lazy"
          decoding="async"
        />
        <p v-else class="report-detail__description">這則回報沒有附照片。</p>
      </div>

      <router-link class="report-detail__action" to="/my-reports">回我的回報</router-link>
    </template>
  </section>
</template>

<script>
import EmptyState from '../../components/EmptyState.vue'

const STATUS_TEXT = { reported: '待處理', 'in-progress': '處理中', resolved: '已完成' }

export default {
  name: 'MyReportDetailView',
  components: { EmptyState },
  computed: {
    report() {
      const id = this.$route && this.$route.params ? this.$route.params.id : ''
      return this.$store.state.myReports.list.find((item) => item.id === id) || null
    },
  },
  methods: {
    statusText(status) {
      return STATUS_TEXT[status] || '已回報'
    },
  },
}
</script>

<style scoped>
.report-detail { display: flex; flex-direction: column; gap: var(--space-3); }
.report-detail__title { margin: 0; font-size: var(--font-size-h2); line-height: var(--line-height-h2); }
.report-detail__meta { display: flex; flex-direction: column; gap: 0.5rem; margin: 0; }
.report-detail__row { display: flex; gap: 0.75rem; min-width: 0; }
.report-detail__label { flex: none; min-width: 3rem; margin: 0; color: var(--muted-foreground); }
.report-detail__value { margin: 0; min-width: 0; font-size: var(--font-size-body); line-height: var(--line-height-body); overflow-wrap: anywhere; }
.report-detail__section { display: flex; flex-direction: column; gap: 0.5rem; }
.report-detail__heading { margin: 0; font-size: var(--font-size-h3); line-height: var(--line-height-h3); }
.report-detail__description { margin: 0; font-size: var(--font-size-body); line-height: var(--line-height-body); overflow-wrap: anywhere; }
.report-detail__photo { max-width: 100%; height: auto; border-radius: var(--radius-card); }
.report-detail__action {
  align-self: flex-start; display: inline-flex; align-items: center; min-height: 48px; padding: 0.5rem 1.25rem;
  background: var(--primary); color: var(--primary-foreground);
  border-radius: var(--radius-pill); font-weight: 700; text-decoration: none;
}
.report-detail__action:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
</style>
