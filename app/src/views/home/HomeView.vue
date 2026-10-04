<template>
  <section class="home">
    <p class="home__brand">社區資訊平台</p>
    <h1 class="home__title">今天想查詢或處理什麼？</h1>

    <div class="home__cards">
      <BigTaskCard
        icon="Flag"
        title="回報社區問題"
        desc="看到路燈壞掉、垃圾沒收等狀況"
        to="/report"
      />
      <BigTaskCard
        icon="MapPin"
        title="看看附近發生什麼事"
        desc="查詢社區最近發生的事件"
        to="/events"
      />
      <BigTaskCard
        icon="Gift"
        title="找福利和活動"
        desc="搜尋補助、課程與社區活動"
        to="/welfare"
      />
    </div>

    <form class="home__ask" @submit.prevent="submit">
      <NlInputBox
        v-model="text"
        label="也可以直接說你想做什麼"
        placeholder="例如：附近有沒有積水、這個月有什麼老人活動"
        :rows="3"
        @voice="text = $event"
      />
      <button class="home__submit" type="submit" :disabled="!canSubmit || routing">
        {{ routing ? '正在理解…' : '開始' }}
      </button>
    </form>
  </section>
</template>

<script>
import BigTaskCard from '../../components/BigTaskCard.vue'
import NlInputBox from '../../components/NlInputBox.vue'

export default {
  name: 'HomeView',
  components: { BigTaskCard, NlInputBox },
  data() {
    return { text: '', routing: false }
  },
  computed: {
    canSubmit() {
      return this.text.trim().length > 0
    },
  },
  methods: {
    async submit() {
      if (!this.canSubmit || this.routing) return
      this.routing = true
      try {
        const route = await this.$store.dispatch('intent/routeFromText', this.text)
        await this.$router.push(route)
      } finally {
        this.routing = false
      }
    },
  },
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.home__brand {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--primary);
}
.home__title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.3;
}
.home__cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
.home__ask {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.home__submit {
  min-height: 56px;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
}
.home__submit:hover:not(:disabled) {
  background: var(--primary-hover);
}
.home__submit:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.home__submit:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
