<template>
  <router-link class="big-task-card" :to="to">
    <span class="big-task-card__icon" aria-hidden="true">
      <component :is="iconComponent" v-if="iconComponent" :size="32" />
    </span>
    <span class="big-task-card__body">
      <span class="big-task-card__title">{{ title }}</span>
      <span v-if="desc" class="big-task-card__desc">{{ desc }}</span>
    </span>
  </router-link>
</template>

<script>
import ArrowLeft from './icons/ArrowLeft.vue'
import Calendar from './icons/Calendar.vue'
import Flag from './icons/Flag.vue'
import Gift from './icons/Gift.vue'
import House from './icons/House.vue'
import MapPin from './icons/MapPin.vue'
import Microphone from './icons/Microphone.vue'

const ICONS = {
  ArrowLeft,
  Calendar,
  Flag,
  Gift,
  House,
  MapPin,
  Microphone,
}

export default {
  name: 'BigTaskCard',
  props: {
    icon: { type: [String, Object, Function], default: null },
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    to: { type: [String, Object], required: true },
  },
  computed: {
    iconComponent() {
      if (typeof this.icon === 'string') return ICONS[this.icon] || null
      return this.icon || null
    },
  },
}
</script>

<style scoped>
.big-task-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 88px;
  padding: 1.25rem;
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-float);
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.big-task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-float-strong);
}
.big-task-card:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.big-task-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--accent-foreground);
}
.big-task-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.big-task-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
}
.big-task-card__desc {
  font-size: 1rem;
  color: var(--muted-foreground);
  line-height: 1.4;
}
@media (prefers-reduced-motion: reduce) {
  .big-task-card {
    transition: none;
  }
  .big-task-card:hover {
    transform: none;
  }
}
</style>
