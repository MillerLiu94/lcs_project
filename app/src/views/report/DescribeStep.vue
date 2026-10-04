<template>
  <section class="describe">
    <header class="describe__header">
      <button class="describe__back" type="button" @click="goBack"><i class="el-icon-arrow-left" aria-hidden="true" /> 上一步</button>
      <StepIndicator :current="1" :total="3" />
    </header>

    <form class="describe__form" @submit.prevent="submit">
      <AiPromptBar
        v-model="text"
        label="請說說看，這裡發生什麼事？"
        placeholder="例如：中華路全家旁邊有一個坑洞"
        :rows="6"
        :busy="submitting"
        submit-label="下一步"
        @submit="submit"
        @voice="text = $event"
      />

      <p class="describe__hint"><i class="el-icon-info" aria-hidden="true" /> 不用寫地址，說你看到的就好</p>
    </form>
  </section>
</template>

<script>
import AiPromptBar from '../../components/AiPromptBar.vue'
import StepIndicator from '../../components/StepIndicator.vue'

export default {
  name: 'DescribeStep',
  components: { AiPromptBar, StepIndicator },
  data() {
    return { submitting: false }
  },
  computed: {
    text: {
      get() {
        return this.$store.state.report.draft.description
      },
      set(value) {
        this.$store.commit('report/setDescription', value)
      },
    },
    canProceed() {
      return this.text.trim().length > 0
    },
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'home' })
    },
    async submit() {
      if (!this.canProceed || this.submitting) return
      this.submitting = true
      try {
        await this.$store.dispatch('report/describe', this.text)
        await this.$router.push({ name: 'report-location' })
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<style scoped>
.describe {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.describe__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.describe__back {
  min-height: 48px;
  padding: 0 0.5rem;
  background: none;
  border: none;
  color: var(--foreground);
  font-family: inherit;
  font-size: 1.125rem;
  cursor: pointer;
}
.describe__back:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.describe__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.describe__hint {
  margin: 0;
  font-size: 1rem;
  color: var(--muted-foreground);
}
</style>
