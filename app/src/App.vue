<template>
  <AppShell>
    <router-view />
  </AppShell>
</template>

<script>
import AppShell from './components/AppShell.vue'
import router from './router'

export default {
  name: 'App',
  router,
  components: { AppShell },
}
</script>
