<template>
  <section v-if="script" class="assistant">
    <header class="assistant__top">
      <button type="button" class="assistant__home" @click="goHome">回首頁</button>
      <span class="assistant__progress">{{ progress }}</span>
    </header>

    <h1 class="assistant__title">{{ script.title }}</h1>

    <div class="assistant__turn">
      <span class="assistant__avatar" aria-hidden="true">社</span>
      <p class="assistant__intro">{{ script.intro }}</p>
    </div>

    <div v-if="currentStep" ref="question" tabindex="-1" class="assistant__step">
      <template v-if="currentStep.type === 'choice'">
        <h2 class="assistant__question">{{ currentStep.question }}</h2>
        <div class="assistant__choices">
          <button
            v-for="option in currentStep.options"
            :key="option.value"
            type="button"
            class="assistant__choice"
            data-choice
            @click="answer(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </template>

      <form v-else class="assistant__form" @submit.prevent="submitText">
        <AiPromptBar
          v-model="text"
          :label="currentStep.question"
          :placeholder="currentStep.placeholder || ''"
          :rows="4"
          submit-label="下一步"
          attachable
          :photo="draft.photo"
          :audio="draft.audio"
          :audio-name="draft.audioName"
          @submit="submitText"
          @voice="text = $event"
          @attach-photo="onPhoto"
          @attach-audio="onAudio"
          @remove-photo="clearPhoto"
          @remove-audio="clearAudio"
        />
      </form>
    </div>
  </section>
</template>

<script>
import AiPromptBar from '../../components/AiPromptBar.vue'
import { getScript } from '../../services/assistantScripts'

export default {
  name: 'AssistantView',
  components: { AiPromptBar },
  data() {
    return { script: null, stepIndex: 0, answers: {}, text: '' }
  },
  computed: {
    currentStep() {
      return this.script ? this.script.steps[this.stepIndex] || null : null
    },
    progress() {
      if (!this.script) return ''
      return `第 ${this.stepIndex + 1} 題 / 共 ${this.script.steps.length} 題`
    },
    draft() {
      return this.$store.state.report.draft
    },
  },
  created() {
    const task = this.$route && this.$route.params && this.$route.params.task
    this.script = getScript(task)
    if (!this.script) this.$router.replace('/')
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    answer(value) {
      const step = this.currentStep
      if (!step) return
      // 文字題留空不得前進。
      if (step.type === 'text' && String(value == null ? '' : value).trim() === '') return
      this.answers = { ...this.answers, [step.id]: value }
      if (this.stepIndex >= this.script.steps.length - 1) {
        this.finish()
        return
      }
      this.stepIndex += 1
      this.focusQuestion()
    },
    submitText() {
      this.answer(this.text)
    },
    focusQuestion() {
      this.$nextTick(() => {
        const el = this.$refs.question
        if (el && typeof el.focus === 'function') el.focus()
      })
    },
    finish() {
      const { commits, route } = this.script.finish(this.answers)
      commits.forEach((c) => this.$store.commit(c.type, c.payload))
      this.$router.push(route)
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
.assistant { display: flex; flex-direction: column; gap: var(--space-3); }
.assistant__top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.assistant__home {
  min-height: 48px;
  padding: 0 0.5rem;
  background: none;
  border: none;
  color: var(--foreground);
  font: inherit;
  font-size: var(--font-size-meta);
  cursor: pointer;
}
.assistant__home:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
.assistant__progress { color: var(--muted-foreground); font-size: var(--font-size-meta); }
.assistant__title { margin: 0; font-size: var(--font-size-h2); line-height: var(--line-height-h2); }
.assistant__turn { display: flex; align-items: flex-start; gap: 0.6rem; }
.assistant__avatar {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  width: 34px; height: 34px; border-radius: var(--radius-pill);
  background: var(--accent); color: var(--accent-foreground); font-weight: 800;
}
.assistant__intro {
  margin: 0; padding: 0.6rem 0.8rem; background: var(--card); color: var(--card-foreground);
  border: 1px solid var(--border); border-radius: var(--radius-card);
  border-top-left-radius: 4px; box-shadow: var(--shadow-float); font-size: var(--font-size-body); line-height: 1.5;
}
.assistant__step:focus-visible { outline: 3px solid var(--ring); outline-offset: 4px; border-radius: var(--radius-card); }
.assistant__question { margin: 0 0 0.6rem; font-size: var(--font-size-h3); line-height: var(--line-height-h3); }
.assistant__choices { display: grid; gap: 0.6rem; }
.assistant__choice {
  display: flex; align-items: center; min-height: 56px; padding: 0.75rem 1rem;
  background: var(--card); color: var(--card-foreground);
  border: 1px solid var(--border); border-radius: var(--radius-card);
  box-shadow: var(--shadow-float); font: inherit; font-size: var(--font-size-body);
  font-weight: 700; text-align: left; cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.assistant__choice:hover { transform: translateY(-2px); box-shadow: var(--shadow-float-strong); }
.assistant__choice:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .assistant__choice { transition: none; }
  .assistant__choice:hover { transform: none; }
}
.assistant__form { display: flex; flex-direction: column; gap: 0.75rem; }
</style>
