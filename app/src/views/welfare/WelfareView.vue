<template>
  <section class="welfare">
    <h1 class="welfare__title">找福利和活動</h1>
    <p class="welfare__lead">這裡會列出找到的福利與活動。</p>

    <router-link v-if="phase === 'idle'" class="welfare__start" to="/assistant/welfare">
      去找福利和活動
    </router-link>

    <template v-else>
      <SearchingState
        v-if="busy"
        :phase="phase"
        :timeout="timeout"
        @wait="wait"
        @retry="retry"
      />

      <ErrorAlert v-else-if="phase === 'error'" message="網路有點問題，請再試一次。">
        <template #action>
          <button type="button" class="welfare__action" @click="retry">再試一次</button>
        </template>
      </ErrorAlert>

      <NoResultState
        v-else-if="phase === 'done' && results.length === 0"
        @retry="retry"
        @widen="widen"
      />

      <ResultList
        v-else-if="phase === 'done'"
        :results="results"
        :partial="partial"
        :failed-sources="failedSources"
      />
    </template>
  </section>
</template>

<script>
import SearchingState from './SearchingState.vue'
import ResultList from './ResultList.vue'
import NoResultState from './NoResultState.vue'
import ErrorAlert from '../../components/ErrorAlert.vue'

export default {
  name: 'WelfareView',
  components: { SearchingState, ResultList, NoResultState, ErrorAlert },
  computed: {
    keyword() {
      return this.$store.state.welfare.keyword
    },
    phase() {
      return this.$store.state.welfare.phase
    },
    results() {
      return this.$store.state.welfare.results
    },
    partial() {
      return this.$store.state.welfare.partial
    },
    failedSources() {
      return this.$store.state.welfare.failedSources
    },
    timeout() {
      return this.$store.state.welfare.timeout
    },
    busy() {
      return this.phase === 'loading' || this.phase === 'processing'
    },
  },
  created() {
    // 由萬用輸入或助手對話帶著原話前來（?q=）：自動填入並直接搜尋，不讓使用者重打。
    const q = (this.$route && this.$route.query && this.$route.query.q) || ''
    if (q) this.$store.dispatch('welfare/search', q)
  },
  methods: {
    retry() {
      this.$store.dispatch('welfare/retry')
    },
    widen() {
      this.$store.dispatch('welfare/widen')
    },
    // 逾時時「繼續等待」：保留輸入並再找一次。
    wait() {
      this.$store.dispatch('welfare/search', this.keyword)
    },
  },
}
</script>

<style scoped>
.welfare {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.welfare__title {
  margin: 0;
  font-size: var(--font-size-h2);
  line-height: var(--line-height-h2);
}
.welfare__lead {
  margin: 0;
  color: var(--muted-foreground);
}
.welfare__start {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 56px;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius-pill);
  font-weight: 700;
  text-decoration: none;
}
.welfare__start:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.welfare__action {
  min-height: 48px;
  padding: 0.5rem 1.25rem;
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: var(--font-size-meta);
  cursor: pointer;
}
.welfare__action:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
