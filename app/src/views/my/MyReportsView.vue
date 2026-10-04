<template>
  <section class="my-reports">
    <h1 class="my-reports__title">我的回報</h1>

    <EmptyState v-if="list.length === 0" message="還沒有回報紀錄">
      <template #action>
        <router-link class="my-reports__action" to="/assistant/report">回報一個問題</router-link>
      </template>
    </EmptyState>

    <ul v-else class="my-reports__list">
      <li v-for="item in list" :key="item.id" class="my-reports__item">
        <ResultCard
          :title="item.title || '（未命名回報）'"
          :date-text="item.timeText"
          :place-text="item.placeText"
          :badge="statusText(item.status)"
        />
      </li>
    </ul>
  </section>
</template>

<script>
import ResultCard from '../../components/ResultCard.vue'
import EmptyState from '../../components/EmptyState.vue'

const STATUS_TEXT = { reported: '待處理', 'in-progress': '處理中', resolved: '已完成' }

export default {
  name: 'MyReportsView',
  components: { ResultCard, EmptyState },
  computed: {
    list() {
      return this.$store.state.myReports.list
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
.my-reports { display: flex; flex-direction: column; gap: var(--space-3); }
.my-reports__title { margin: 0; font-size: var(--font-size-h2); line-height: var(--line-height-h2); }
.my-reports__list { display: grid; gap: var(--space-3); margin: 0; padding: 0; list-style: none; }
.my-reports__item { min-width: 0; }
.my-reports__action {
  display: inline-flex; align-items: center; min-height: 48px; padding: 0.5rem 1.25rem;
  background: var(--primary); color: var(--primary-foreground);
  border-radius: var(--radius-pill); font-weight: 700; text-decoration: none;
}
.my-reports__action:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
</style>
