<template>
  <section class="done" role="status">
    <p class="done__mark" aria-hidden="true"><i class="el-icon-check" /></p>
    <h1 class="done__message">已收到你的回報，社區工作人員會盡快處理。</h1>
    <button type="button" class="done__home" @click="goHome">回首頁</button>
  </section>
</template>

<script>
export default {
  name: 'DoneView',
  methods: {
    goHome() {
      // 離開申報流程時清空草稿，下一筆回報從乾淨狀態開始。
      this.$store.dispatch('report/reset')
      this.$router.push({ name: 'home' })
    },
  },
}
</script>

<style scoped>
.done {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
}
.done__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin: 0;
  font-size: 2rem;
  color: var(--primary-foreground);
  background: var(--primary);
  border-radius: 50%;
}
.done__message {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.6;
}
.done__home {
  min-height: 56px;
  padding: 0.75rem 2rem;
  background: var(--primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
}
.done__home:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
