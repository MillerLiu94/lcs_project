<template>
  <section class="events">
    <h1 class="events__title">目前社區事件</h1>
    <p class="events__lead">顯示近期且與你相關的事件。</p>

    <div class="events__filters" role="group" aria-label="快速篩選">
      <div
        v-for="group in groups"
        :key="group.key"
        class="events__group"
        role="group"
        :aria-label="group.label"
      >
        <button
          v-for="chip in group.chips"
          :key="chip.value"
          type="button"
          class="events__chip"
          :class="{ 'events__chip--on': isOn(group.key, chip.value) }"
          :aria-pressed="String(isOn(group.key, chip.value))"
          @click="choose(group.key, chip.value)"
        >
          {{ chip.label }}
        </button>
      </div>
    </div>

    <p v-if="loading" class="events__status" role="status">正在載入附近事件…</p>

    <ErrorAlert v-else-if="error" message="網路有點問題，請再試一次。">
      <template #action>
        <button type="button" class="events__action" @click="reload">再試一次</button>
      </template>
    </ErrorAlert>

    <EmptyState v-else-if="events.length === 0" :message="emptyMessage">
      <template #action>
        <button v-if="hasActiveFilters" type="button" class="events__action" @click="clear">
          清除篩選
        </button>
        <router-link v-else class="events__action" to="/report">回報一個問題</router-link>
      </template>
    </EmptyState>

    <ul v-else class="events__list">
      <li v-for="event in events" :key="event.id" class="events__item">
        <router-link class="events__card" :to="{ name: 'event-detail', params: { id: event.id } }">
          <ResultCard
            :title="event.title"
            :date-text="event.timeText"
            :place-text="event.placeText"
          />
          <span class="events__badge">{{ statusText(event.status) }}</span>
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script>
import ResultCard from '../../components/ResultCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorAlert from '../../components/ErrorAlert.vue'

const STATUS_TEXT = { reported: '待處理', 'in-progress': '處理中', resolved: '已完成' }

// 地區用語需與種子資料 placeText 一致，否則硬篩會把結果全部剪除。
function chipList(values) {
  return values.map((value) => ({ value, label: value }))
}

export default {
  name: 'EventListView',
  components: { ResultCard, EmptyState, ErrorAlert },
  data() {
    return {
      statusTextMap: STATUS_TEXT,
      groups: [
        {
          key: 'time',
          label: '時間',
          chips: [
            { value: 'today', label: '今天' },
            { value: 'week', label: '這週' },
            { value: 'month', label: '這個月' },
            { value: 'all', label: '全部' },
          ],
        },
        { key: 'region', label: '地區', chips: chipList(['中華路', '汀州路', '青年公園', '台北車站']) },
        { key: 'type', label: '類型', chips: chipList(['坑洞', '路燈', '積水', '垃圾', '違規停車']) },
        {
          key: 'status',
          label: '狀態',
          chips: [
            { value: 'reported', label: '待處理' },
            { value: 'in-progress', label: '處理中' },
            { value: 'resolved', label: '已完成' },
          ],
        },
      ],
    }
  },
  computed: {
    filters() {
      return this.$store.state.query.filters
    },
    stateRegion() {
      return this.$store.state.query.region
    },
    events() {
      return this.$store.state.query.events
    },
    loading() {
      return this.$store.state.query.loading
    },
    error() {
      return this.$store.state.query.error
    },
    hasActiveFilters() {
      const { time, type, status } = this.filters
      return Boolean(this.stateRegion || type || status || time !== 'month')
    },
    emptyMessage() {
      return this.hasActiveFilters
        ? '沒有符合這些篩選條件的事件，換個條件或看全部試試。'
        : '目前附近沒有已回報的事件。'
    },
  },
  created() {
    // 由萬用輸入帶著原話前來（?q=）：套用辨識出的類型／地區後載入。
    const q = (this.$route && this.$route.query && this.$route.query.q) || ''
    if (q) {
      this.$store.dispatch('query/searchFromText', q)
      return
    }
    this.$store.dispatch('query/loadEvents')
  },
  methods: {
    isOn(key, value) {
      return key === 'region' ? this.stateRegion === value : this.filters[key] === value
    },
    choose(key, value) {
      if (key === 'time') {
        this.$store.dispatch('query/setFilter', { time: value })
        return
      }
      const current = key === 'region' ? this.stateRegion : this.filters[key]
      this.$store.dispatch('query/setFilter', { [key]: current === value ? '' : value })
    },
    clear() {
      this.$store.dispatch('query/clearFilters')
    },
    reload() {
      this.$store.dispatch('query/loadEvents')
    },
    statusText(status) {
      return this.statusTextMap[status] || '已回報'
    },
  },
}
</script>

<style scoped>
.events { display: flex; flex-direction: column; gap: 1.25rem; }
.events__title { margin: 0; font-size: 1.5rem; line-height: 1.4; }
.events__lead { margin: 0; color: var(--muted-foreground); }
.events__filters { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
.events__group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.events__chip,
.events__action {
  min-height: 48px;
  padding: 0.5rem 1rem;
  background: var(--card);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 1rem;
  cursor: pointer;
}
.events__chip--on { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); font-weight: 700; }
.events__status { margin: 0; color: var(--muted-foreground); }
.events__list { display: grid; gap: 1rem; margin: 0; padding: 0; list-style: none; }
.events__item { min-width: 0; }
/* Desktop enhancement (G6): two-column event results at 1024+. */
@media (min-width: 1024px) { .events__list { grid-template-columns: repeat(2, 1fr); } }
.events__card { display: flex; flex-direction: column; gap: 0.5rem; color: inherit; text-decoration: none; }
.events__badge {
  align-self: flex-start;
  padding: 0.25rem 0.75rem;
  background: var(--muted);
  color: var(--foreground);
  border-radius: var(--radius-pill);
  font-size: 1rem;
}
.events button:focus-visible,
.events a:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; border-radius: var(--radius); }
</style>
