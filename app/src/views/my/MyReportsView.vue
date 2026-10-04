<template>
  <section class="my-reports">
    <h1 class="my-reports__title">我的回報</h1>
    <p v-if="list.length > 0" class="my-reports__count">{{ countText }}</p>

    <div v-if="list.length > 0" class="my-reports__filters" role="group" aria-label="狀態篩選">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        type="button"
        class="my-reports__chip"
        :class="{ 'my-reports__chip--on': statusFilter === option.value }"
        :aria-pressed="String(statusFilter === option.value)"
        @click="statusFilter = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <EmptyState v-if="list.length === 0" message="還沒有回報紀錄">
      <template #action>
        <router-link class="my-reports__action" to="/assistant/report">回報一個問題</router-link>
      </template>
    </EmptyState>

    <p v-else-if="filtered.length === 0" class="my-reports__empty">
      這個狀態還沒有回報。
      <button type="button" class="my-reports__link" @click="statusFilter = ''">看全部</button>
    </p>

    <ul v-else class="my-reports__list">
      <li v-for="item in filtered" :key="item.id" class="my-reports__item">
        <p v-if="item.type" class="my-reports__type">{{ item.type }}</p>
        <ResultCard
          :title="item.title || '（未命名回報）'"
          :date-text="item.timeText"
          :place-text="item.placeText"
          :badge="statusText(item.status)"
        />
        <div class="my-reports__actions">
          <router-link
            class="my-reports__action"
            :to="{ name: 'my-report-detail', params: { id: item.id } }"
          >
            查看
          </router-link>
          <template v-if="pendingDeleteId === item.id">
            <button
              type="button"
              class="my-reports__delete my-reports__delete--danger"
              @click="confirmDelete(item.id)"
            >
              確定刪除？
            </button>
            <button type="button" class="my-reports__link" @click="cancelDelete">取消</button>
          </template>
          <button v-else type="button" class="my-reports__delete" @click="askDelete(item.id)">
            刪除
          </button>
        </div>
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
  data() {
    return {
      statusFilter: '',
      pendingDeleteId: null,
      statusOptions: [
        { value: '', label: '全部' },
        { value: 'reported', label: '待處理' },
        { value: 'in-progress', label: '處理中' },
        { value: 'resolved', label: '已完成' },
      ],
    }
  },
  computed: {
    list() {
      return this.$store.state.myReports.list
    },
    filtered() {
      if (!this.statusFilter) return this.list
      return this.list.filter((item) => item.status === this.statusFilter)
    },
    countText() {
      const total = this.list.length
      const shown = this.filtered.length
      if (this.statusFilter && shown !== total) return `共 ${shown} 筆（全部 ${total} 筆）`
      return `共 ${total} 筆`
    },
  },
  methods: {
    statusText(status) {
      return STATUS_TEXT[status] || '已回報'
    },
    askDelete(id) {
      this.pendingDeleteId = id
    },
    cancelDelete() {
      this.pendingDeleteId = null
    },
    confirmDelete(id) {
      this.$store.commit('myReports/remove', id)
      this.pendingDeleteId = null
    },
  },
}
</script>

<style scoped>
.my-reports { display: flex; flex-direction: column; gap: var(--space-3); }
.my-reports__title { margin: 0; font-size: var(--font-size-h2); line-height: var(--line-height-h2); }
.my-reports__count { margin: 0; color: var(--muted-foreground); font-size: var(--font-size-meta); }
.my-reports__filters { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.my-reports__chip {
  min-height: 48px; padding: 0.5rem 1rem;
  background: var(--card); color: var(--foreground);
  border: 1px solid var(--border); border-radius: var(--radius-pill);
  font: inherit; font-size: var(--font-size-meta); cursor: pointer;
}
.my-reports__chip--on { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); font-weight: 700; }
.my-reports__chip:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
.my-reports__empty { margin: 0; color: var(--muted-foreground); }
.my-reports__list { display: grid; gap: var(--space-3); margin: 0; padding: 0; list-style: none; }
.my-reports__item { min-width: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.my-reports__type { margin: 0; color: var(--muted-foreground); font-size: var(--font-size-meta); font-weight: 700; }
.my-reports__actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.my-reports__action {
  display: inline-flex; align-items: center; min-height: 48px; padding: 0.5rem 1.25rem;
  background: var(--primary); color: var(--primary-foreground);
  border-radius: var(--radius-pill); font: inherit; font-size: var(--font-size-meta);
  font-weight: 700; text-decoration: none; cursor: pointer; border: 1px solid transparent;
}
.my-reports__delete {
  min-height: 48px; padding: 0.5rem 1.25rem;
  background: var(--card); color: var(--foreground);
  border: 1px solid var(--border); border-radius: var(--radius-pill);
  font: inherit; font-size: var(--font-size-meta); cursor: pointer;
}
.my-reports__delete--danger { border-color: var(--destructive); color: var(--destructive); font-weight: 700; }
.my-reports__link {
  min-height: 48px; padding: 0.5rem 0.75rem; background: none; border: none;
  color: var(--primary); font: inherit; font-size: var(--font-size-meta);
  font-weight: 700; text-decoration: underline; cursor: pointer;
}
.my-reports__action:focus-visible,
.my-reports__delete:focus-visible,
.my-reports__link:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
</style>
