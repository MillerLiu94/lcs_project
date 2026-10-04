<template>
  <section class="clarify">
    <h1 class="clarify__title">{{ title }}</h1>
    <p class="clarify__lead">{{ lead }}</p>

    <div class="clarify__choices">
      <button
        v-for="option in options"
        :key="option.choice"
        type="button"
        class="clarify__choice"
        :disabled="busy"
        @click="choose(option.choice)"
      >
        {{ option.label }}
      </button>
    </div>
  </section>
</template>

<script>
// S6 §1.1 第一層；S6 §1.2 事件內部第二層（同頁出現，只有無法判斷時才問）。
const FIRST_LEVEL = [
  { choice: 'event', label: '社區發生的事' },
  { choice: 'welfare', label: '福利和活動' },
]
const EVENT_LEVEL = [
  { choice: 'report', label: '我要回報' },
  { choice: 'query', label: '我想查詢' },
]

export default {
  name: 'ClarifyView',
  data() {
    return { phase: 'first', busy: false }
  },
  computed: {
    onEventLevel() {
      return this.phase === 'event'
    },
    options() {
      return this.onEventLevel ? EVENT_LEVEL : FIRST_LEVEL
    },
    title() {
      return this.onEventLevel ? '想回報，還是想查詢？' : '你是想找哪一種？'
    },
    lead() {
      return this.onEventLevel
        ? '想告訴我們社區發生的事，還是想看看已經被回報的事件？'
        : '你是想找「社區發生的事」，還是「福利和活動」？'
    },
  },
  methods: {
    // 由 store 決定去向；只有事件仍無法判斷時才留在同頁問第二層。
    async choose(choice) {
      if (this.busy) return
      this.busy = true
      try {
        const route = await this.$store.dispatch('intent/resolveChoice', choice)
        if (route.name === 'clarify-event') {
          this.phase = 'event'
          return
        }
        await this.$router.push(route)
      } finally {
        this.busy = false
      }
    },
  },
}
</script>

<style scoped>
.clarify {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.clarify__title {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.4;
}
.clarify__lead {
  margin: 0 0 0.5rem;
  color: var(--muted-foreground);
  line-height: 1.5;
}
.clarify__choices {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
.clarify__choice {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88px;
  padding: 1.25rem;
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-float);
  font-family: inherit;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.clarify__choice:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-float-strong);
}
.clarify__choice:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.clarify__choice:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
@media (min-width: 480px) {
  .clarify__choices {
    grid-template-columns: 1fr 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .clarify__choice {
    transition: none;
  }
  .clarify__choice:hover:not(:disabled) {
    transform: none;
  }
}
</style>
