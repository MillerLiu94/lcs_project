<template>
  <AppShell>
    <div v-if="renderError" class="app-error" role="alert">
      <p class="app-error__message">畫面發生錯誤，請重新整理或回到首頁再試。</p>
      <div class="app-error__actions">
        <button type="button" class="app-error__button" @click="reload">重新整理</button>
        <router-link class="app-error__button" to="/">回首頁</router-link>
      </div>
    </div>
    <router-view v-else />
  </AppShell>
</template>

<script>
import AppShell from './components/AppShell.vue'
import router from './router'

export default {
  name: 'App',
  router,
  components: { AppShell },
  data() {
    return { renderError: '' }
  },
  // 任何子元件在 render／lifecycle 丟錯時，改顯示訊息而非整頁空白；
  // 回傳 true 讓錯誤繼續往上報，Console 仍能看到原始堆疊。
  errorCaptured(error) {
    this.renderError = (error && error.message) || String(error)
    return true
  },
  methods: {
    reload() {
      if (typeof window !== 'undefined' && window.location) window.location.reload()
    },
  },
}
</script>

<style scoped>
.app-error {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 32rem;
  margin: 3rem auto;
  padding: 1.5rem;
  background: var(--card);
  color: var(--foreground);
  border: 2px solid var(--destructive);
  border-radius: var(--radius-card);
  text-align: center;
}
.app-error__message {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.7;
}
.app-error__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}
.app-error__button {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0.5rem 1rem;
  background: var(--primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.app-error__button:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
