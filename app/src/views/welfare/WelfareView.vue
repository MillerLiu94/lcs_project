<template>
  <section class="welfare">
    <h1 class="welfare__title">找福利和活動</h1>
    <p class="welfare__lead">用說的或打字，描述你想找的福利或活動。</p>

    <SearchInput :value="keyword" :busy="busy" @search="onSearch" />

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
  </section>
</template>

<script>
import SearchInput from './SearchInput.vue'
import SearchingState from './SearchingState.vue'
import ResultList from './ResultList.vue'
import NoResultState from './NoResultState.vue'
import ErrorAlert from '../../components/ErrorAlert.vue'

export default {
  name: 'WelfareView',
  components: { SearchInput, SearchingState, ResultList, NoResultState, ErrorAlert },
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
    // 由萬用輸入帶著原話前來（?q=）：自動填入並直接搜尋，不讓使用者重打。
    const q = (this.$route && this.$route.query && this.$route.query.q) || ''
    if (q) this.$store.dispatch('welfare/search', q)
  },
  methods: {
    onSearch(text) {
      this.$store.dispatch('welfare/search', text)
    },
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
  font-size: 1.5rem;
  line-height: 1.4;
}
.welfare__lead {
  margin: 0;
  color: var(--muted-foreground);
}
.welfare__action {
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
.welfare__action:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
