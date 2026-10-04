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
      <AiPromptBar
        v-model="text"
        label="也可以直接說你想做什麼"
        placeholder="例如：附近有沒有積水、這個月有什麼老人活動"
        :rows="3"
        :busy="routing"
        submit-label="開始"
        attachable
        :photo="draft.photo"
        :audio="draft.audio"
        :audio-name="draft.audioName"
        @submit="submit"
        @voice="text = $event"
        @attach-photo="onPhoto"
        @attach-audio="onAudio"
        @remove-photo="clearPhoto"
        @remove-audio="clearAudio"
      />
    </form>
  </section>
</template>

<script>
import BigTaskCard from '../../components/BigTaskCard.vue'
import AiPromptBar from '../../components/AiPromptBar.vue'

export default {
  name: 'HomeView',
  components: { BigTaskCard, AiPromptBar },
  data() {
    return { text: '', routing: false }
  },
  computed: {
    canSubmit() {
      return this.text.trim().length > 0
    },
    draft() {
      return this.$store.state.report.draft
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
    onPhoto(dataUrl) {
      this.$store.commit('report/setPhoto', dataUrl)
    },
    onAudio(payload) {
      this.$store.commit('report/setAudio', payload)
    },
    clearPhoto() {
      this.$store.commit('report/clearPhoto')
    },
    clearAudio() {
      this.$store.commit('report/clearAudio')
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
@media (min-width: 1024px) {
  .home__cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
.home__ask {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
