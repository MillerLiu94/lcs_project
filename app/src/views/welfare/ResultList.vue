<template>
  <section class="result-list">
    <p class="result-list__count">找到 {{ results.length }} 個結果</p>

    <p v-if="partial" class="result-list__note" role="status">
      有些資訊暫時無法確認，已先略過<template v-if="failedText">（{{ failedText }}）</template>。
    </p>

    <ul class="result-list__items">
      <li v-for="item in results" :key="item.id" class="result-list__item">
        <ResultCard
          :title="item.title"
          :date-text="formatDate(item.eventDate)"
          :source="item.source"
          :published-at="item.publishedAt"
          :url="item.url"
        />
      </li>
    </ul>

    <p class="result-list__disclaimer">以下內容由系統整理，請以原始來源為準。</p>
  </section>
</template>

<script>
import ResultCard from '../../components/ResultCard.vue'

export default {
  name: 'ResultList',
  components: { ResultCard },
  props: {
    results: { type: Array, default: () => [] },
    partial: { type: Boolean, default: false },
    failedSources: { type: Array, default: () => [] },
  },
  computed: {
    failedText() {
      return this.failedSources.filter(Boolean).join('、')
    },
  },
  methods: {
    // 活動日期以 YYYY/MM/DD 呈現，數字清楚、好讀（S2 §20）。
    formatDate(value) {
      return value ? String(value).replace(/-/g, '/') : ''
    },
  },
}
</script>

<style scoped>
.result-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.result-list__count {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}
.result-list__note {
  margin: 0;
  padding: 0.75rem 1rem;
  background: var(--muted);
  color: var(--foreground);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius);
  font-size: 1rem;
  line-height: 1.6;
}
.result-list__items {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.result-list__disclaimer {
  margin: 0;
  font-size: 0.95rem;
  color: var(--muted-foreground);
}
</style>
