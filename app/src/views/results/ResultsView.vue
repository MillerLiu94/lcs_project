<template>
  <section class="results">
    <h1 class="results__title">查詢結果</h1>

    <template v-if="intents.length === 0">
      <p class="results__lead">看不太懂你想找什麼，換句話說，或從下面選一個：</p>
      <div class="results__entries">
        <router-link class="results__entry" to="/assistant/report">回報社區問題</router-link>
        <router-link class="results__entry" to="/assistant/events">看看附近事件</router-link>
        <router-link class="results__entry" to="/assistant/welfare">找福利和活動</router-link>
      </div>
    </template>

    <template v-else>
      <section v-if="hasQuery" class="results__section">
        <h2 class="results__heading">附近事件</h2>
        <p v-if="queryLoading" class="results__status" role="status">正在載入附近事件…</p>
        <ErrorAlert v-else-if="queryError" message="網路有點問題，請再試一次。">
          <template #action>
            <button type="button" class="results__action" @click="retryQuery">再試一次</button>
          </template>
        </ErrorAlert>
        <p v-else-if="events.length === 0" class="results__empty">沒有找到相關事件。</p>
        <ul v-else class="results__list">
          <li v-for="event in events" :key="event.id" class="results__item">
            <router-link
              class="results__card"
              :to="{ name: 'event-detail', params: { id: event.id } }"
            >
              <ResultCard
                :title="event.title"
                :date-text="event.timeText"
                :place-text="event.placeText"
                :badge="statusText(event.status)"
              />
            </router-link>
          </li>
        </ul>
      </section>

      <section v-if="hasWelfare" class="results__section">
        <h2 class="results__heading">福利與活動</h2>
        <SearchingState
          v-if="welfareBusy"
          :phase="welfarePhase"
          :timeout="welfareTimeout"
          @wait="retryWelfare"
          @retry="retryWelfare"
        />
        <ErrorAlert v-else-if="welfarePhase === 'error'" message="網路有點問題，請再試一次。">
          <template #action>
            <button type="button" class="results__action" @click="retryWelfare">再試一次</button>
          </template>
        </ErrorAlert>
        <NoResultState
          v-else-if="welfarePhase === 'done' && welfareResults.length === 0"
          @retry="retryWelfare"
          @widen="widenWelfare"
        />
        <ResultList
          v-else-if="welfarePhase === 'done'"
          :results="welfareResults"
          :partial="welfarePartial"
          :failed-sources="welfareFailedSources"
        />
      </section>

      <section v-if="hasReport" class="results__section">
        <h2 class="results__heading">你要回報的事</h2>
        <router-link class="results__entry" to="/assistant/report">要回報嗎？前往回報</router-link>
      </section>
    </template>
  </section>
</template>

<script>
import ResultCard from '../../components/ResultCard.vue'
import ResultList from '../welfare/ResultList.vue'
import NoResultState from '../welfare/NoResultState.vue'
import SearchingState from '../welfare/SearchingState.vue'
import ErrorAlert from '../../components/ErrorAlert.vue'
import { parseIntents } from '../../services/intentRules'

const STATUS_TEXT = { reported: '待處理', 'in-progress': '處理中', resolved: '已完成' }

export default {
  name: 'ResultsView',
  components: { ResultCard, ResultList, NoResultState, SearchingState, ErrorAlert },
  data() {
    return { intents: [] }
  },
  computed: {
    hasQuery() {
      return this.intents.some((item) => item.intent === 'query')
    },
    hasWelfare() {
      return this.intents.some((item) => item.intent === 'welfare')
    },
    hasReport() {
      return this.intents.some((item) => item.intent === 'report')
    },
    queryClause() {
      const found = this.intents.find((item) => item.intent === 'query')
      return found ? found.text : ''
    },
    welfareClause() {
      const found = this.intents.find((item) => item.intent === 'welfare')
      return found ? found.text : ''
    },
    events() {
      return this.$store.state.query.events
    },
    queryLoading() {
      return this.$store.state.query.loading
    },
    queryError() {
      return this.$store.state.query.error
    },
    welfarePhase() {
      return this.$store.state.welfare.phase
    },
    welfareResults() {
      return this.$store.state.welfare.results
    },
    welfarePartial() {
      return this.$store.state.welfare.partial
    },
    welfareFailedSources() {
      return this.$store.state.welfare.failedSources
    },
    welfareTimeout() {
      return this.$store.state.welfare.timeout
    },
    welfareBusy() {
      return this.welfarePhase === 'loading' || this.welfarePhase === 'processing'
    },
  },
  created() {
    const q = (this.$route && this.$route.query && this.$route.query.q) || ''
    this.intents = parseIntents(q)
    if (this.hasQuery) this.$store.dispatch('query/searchFromText', this.queryClause)
    if (this.hasWelfare) this.$store.dispatch('welfare/search', this.welfareClause)
  },
  methods: {
    statusText(status) {
      return STATUS_TEXT[status] || '已回報'
    },
    retryQuery() {
      this.$store.dispatch('query/searchFromText', this.queryClause)
    },
    retryWelfare() {
      this.$store.dispatch('welfare/search', this.welfareClause)
    },
    widenWelfare() {
      this.$store.dispatch('welfare/widen')
    },
  },
}
</script>

<style scoped>
.results { display: flex; flex-direction: column; gap: var(--space-3); }
.results__title { margin: 0; font-size: var(--font-size-h2); line-height: var(--line-height-h2); }
.results__lead { margin: 0; color: var(--muted-foreground); }
.results__entries { display: grid; gap: var(--space-2); }
.results__entry {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 56px; padding: 0.75rem 1.25rem;
  background: var(--card); color: var(--card-foreground);
  border: 1px solid var(--border); border-radius: var(--radius-card);
  box-shadow: var(--shadow-float); font-weight: 700; text-decoration: none;
}
.results__entry:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
.results__section { display: flex; flex-direction: column; gap: var(--space-2); }
.results__heading { margin: 0; font-size: var(--font-size-h3); line-height: var(--line-height-h3); }
.results__status, .results__empty { margin: 0; color: var(--muted-foreground); }
.results__list { display: grid; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
.results__item { min-width: 0; }
.results__card { display: block; color: inherit; text-decoration: none; }
.results__action {
  min-height: 48px; padding: 0.5rem 1.25rem;
  background: var(--secondary); color: var(--secondary-foreground);
  border: 1px solid var(--border); border-radius: var(--radius-pill);
  font: inherit; font-size: var(--font-size-meta); cursor: pointer;
}
.results__action:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
</style>
