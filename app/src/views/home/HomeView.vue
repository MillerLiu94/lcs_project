<template>
  <section class="home">
    <p class="home__brand">
      <span class="home__logo" aria-hidden="true">社</span>
      <span>社區資訊平台</span>
    </p>
    <h1 class="home__title">今天需要幫忙嗎？</h1>
    <p class="home__lead">回報問題、查附近事件、找福利活動，都可以在這裡開始。</p>

    <div class="home__tasks">
      <BigTaskCard
        variant="hero"
        cta="開始回報"
        icon="Flag"
        title="回報社區問題"
        desc="看到路燈壞掉、垃圾沒收，拍照或直接描述都可以"
        to="/assistant/report"
      />

      <div class="home__cards">
        <BigTaskCard
          icon="MapPin"
          title="附近事件"
          desc="看看社區大小事"
          to="/assistant/events"
        />
        <BigTaskCard
          icon="Gift"
          title="福利活動"
          desc="補助、課程、活動"
          to="/assistant/welfare"
        />
      </div>
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
  gap: var(--space-3);
  /* 手機：留出底部固定輸入列與功能列的空間。 */
  padding-bottom: 12rem;
}
.home__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: var(--font-size-meta);
  font-weight: 800;
  color: var(--primary);
}
.home__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-pill);
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: var(--font-size-meta);
}
.home__title {
  margin: 0;
  font-size: var(--font-size-display);
  line-height: var(--line-height-display);
}
.home__lead {
  margin: 0;
  color: var(--muted-foreground);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
}
/* 手機沒有這三張卡：底部功能列已提供相同入口。桌機才顯示。 */
.home__tasks {
  display: none;
}
.home__cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
}
/* 手機：輸入列固定在底部，浮在浮動功能列之上，讓拇指隨時可及。 */
.home__ask {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 5rem;
  width: calc(100% - 1.5rem);
  max-width: 32rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
@media (min-width: 768px) {
  .home__cards {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1024px) {
  .home {
    max-width: 760px;
    margin-inline: auto;
    padding-bottom: 0;
  }
  /* 桌面版品牌已移到 TopNav，避免重複。 */
  .home__brand {
    display: none;
  }
  .home__tasks {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  /* 桌機：輸入列回到一般內容流。 */
  .home__ask {
    position: static;
    transform: none;
    width: auto;
    max-width: none;
    z-index: auto;
  }
}
</style>
