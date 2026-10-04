<template>
  <section class="location">
    <header class="location__header">
      <button type="button" class="location__back" @click="goBack">← 上一步</button>
      <StepIndicator :current="2" :total="3" />
    </header>

    <p class="location__prompt" role="status">{{ prompt }}</p>

    <div v-if="situation === 'idle'" class="location__stack">
      <button type="button" @click="useCurrentLocation">使用我目前的位置</button>
      <button type="button" @click="startText">我還記得，用文字描述</button>
      <button type="button" @click="startMap">在地圖上點選位置</button>
    </div>

    <form v-if="situation === 'text'" class="location__stack" @submit.prevent="findByText">
      <NlInputBox
        v-model="locText"
        label="大概在哪裡？"
        placeholder="例如：中華路全家旁邊"
        :rows="3"
        @voice="locText = $event"
      />
      <button type="submit" :disabled="!locText.trim()">找位置</button>
    </form>

    <MapPicker v-if="situation === 'map'" :lat="anchor.lat" :lng="anchor.lng" @pick="onPick" />

    <ErrorAlert v-if="error" :message="error">
      <template #action>
        <button type="button" class="location__retry" @click="retryText">再試一次</button>
      </template>
    </ErrorAlert>

    <p v-if="previewText" class="location__preview">{{ previewText }}</p>

    <div class="location__stack">
      <button v-if="canDescribe" type="button" class="location__skip" @click="startText">改用文字描述</button>
      <button v-if="situation === 'text'" type="button" class="location__skip" @click="startMap">在地圖上點選位置</button>
      <button type="button" class="location__confirm" :disabled="!hasCoordinates" @click="confirm">確認這個位置</button>
      <button type="button" class="location__skip" @click="sendUnconfirmed">不確定，先送出</button>
    </div>
  </section>
</template>

<script>
import NlInputBox from '../../components/NlInputBox.vue'
import StepIndicator from '../../components/StepIndicator.vue'
import ErrorAlert from '../../components/ErrorAlert.vue'
import MapPicker from '../../components/MapPicker.vue'

export default {
  name: 'LocationStep',
  components: { NlInputBox, StepIndicator, ErrorAlert, MapPicker },
  data() {
    return { situation: 'idle', locText: '', error: '' }
  },
  computed: {
    selected() {
      return this.$store.state.location.selected
    },
    candidates() {
      return this.$store.state.location.candidates
    },
    hasCoordinates() {
      return this.$store.getters['location/hasCoordinates']
    },
    canDescribe() {
      return this.situation === 'map' || this.situation === 'confirm'
    },
    // 地圖錨點：已選位置 → 有座標的候選 → 目前定位（GPS）。找不到則空物件。
    anchor() {
      if (this.selected) return this.selected
      const candidate = this.candidates[0]
      if (candidate && typeof candidate.lat === 'number') return candidate
      const current = this.$store.state.location.current
      return current && typeof current.lat === 'number' ? current : {}
    },
    prompt() {
      if (this.situation === 'text') return '沒關係，說個大概就好，例如「中華路全家旁邊」。'
      if (this.situation === 'map') return '我們不確定位置，請在地圖上點一下。'
      if (this.situation === 'confirm') return '這個位置對嗎？'
      return '你現在在現場嗎？在的話可以用目前位置。'
    },
    previewText() {
      const sel = this.selected
      if (!sel) return ''
      if (sel.mode === 'gps') return '已使用你目前的位置。'
      if (sel.mode === 'candidate') {
        return [sel.name, sel.address].filter(Boolean).join('・')
      }
      return '已標記你在地圖上點選的位置。'
    },
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'report' })
    },
    async useCurrentLocation() {
      this.error = ''
      const coords = await this.$store.dispatch('location/requestCurrent')
      if (!coords) {
        this.situation = 'text' // 拒權／失敗不擋路，直接改走文字描述
        return
      }
      this.$store.commit('location/setSelected', { mode: 'gps', ...coords })
      this.situation = 'confirm'
    },
    startText() {
      // 改用文字描述時清掉先前選取，避免殘留座標被誤確認。
      this.$store.commit('location/setSelected', null)
      this.situation = 'text'
    },
    startMap() {
      this.situation = 'map'
    },
    async findByText() {
      const text = this.locText.trim()
      if (!text) return
      this.error = ''
      try {
        const { decision } = await this.$store.dispatch('location/resolveText', text)
        if (decision.mode === 'candidate') {
          await this.$store.dispatch('location/pickCandidate', this.candidates[0].id)
          this.situation = 'confirm'
          return
        }
        this.situation = 'map'
      } catch (e) {
        this.error = '網路有點問題，請再試一次。'
      }
    },
    retryText() {
      // 文字搜尋失敗後提供明確重試；輸入仍保留，可直接再找一次。
      this.findByText()
    },
    onPick(lat, lng) {
      const mode = this.candidates.length > 0 ? 'map-confirm' : 'low-precision'
      this.$store.commit('location/setSelected', { mode, lat, lng })
    },
    confirm() {
      if (!this.hasCoordinates) return
      this.$store.commit('report/setLocation', { ...this.selected })
      this.$router.push({ name: 'report-confirm' })
    },
    sendUnconfirmed() {
      // §14.4：完全無法確認時保留原話，絕不填入假座標。
      const text = this.locText.trim() || this.$store.state.report.draft.description
      this.$store.commit('report/setLocation', { mode: 'unconfirmed', text })
      this.$router.push({ name: 'report-confirm' })
    },
  },
}
</script>

<style scoped>
.location,
.location__stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.location__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.location button {
  min-height: 56px;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
}
.location__prompt { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--foreground); }
.location__preview { margin: 0; font-size: 1.125rem; color: var(--foreground); }
.location__back { background: none; border: none; color: var(--foreground); }
.location__skip { background: none; border: 2px solid var(--input); color: var(--foreground); }
.location__stack button:not(.location__skip),
.location__retry {
  background: var(--primary);
  color: var(--primary-foreground);
  border: 2px solid var(--primary);
}
.location button:disabled { cursor: not-allowed; opacity: 0.55; }
.location button:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
</style>
