<template>
  <router-link
    class="big-task-card"
    :class="`big-task-card--${variant}`"
    :to="to"
    :data-variant="variant"
  >
    <span class="big-task-card__icon" aria-hidden="true">
      <component :is="iconComponent" v-if="iconComponent" :size="variant === 'hero' ? 28 : 32" />
    </span>
    <span class="big-task-card__body">
      <span class="big-task-card__title">{{ title }}</span>
      <span v-if="desc" class="big-task-card__desc">{{ desc }}</span>
      <span v-if="variant === 'hero' && cta" class="big-task-card__cta">{{ cta }}</span>
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
    variant: { type: String, default: 'default' },
    cta: { type: String, default: '' },
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
/* Hero：主行動卡，較大、暖底漸層、標題升一階、帶 CTA。 */
.big-task-card--hero {
  align-items: flex-start;
  min-height: 120px;
  padding: 1.5rem;
  background: var(--card);
  background: linear-gradient(180deg, var(--card), color-mix(in srgb, var(--accent) 45%, var(--card)));
}
.big-task-card--hero .big-task-card__icon {
  width: 64px;
  height: 64px;
}
.big-task-card--hero .big-task-card__title {
  font-size: var(--font-size-h2);
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
  font-size: var(--font-size-h3);
  font-weight: 700;
  line-height: 1.3;
}
.big-task-card__desc {
  font-size: var(--font-size-body);
  color: var(--muted-foreground);
  line-height: 1.4;
}
.big-task-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  margin-top: 0.75rem;
  min-height: 48px;
  padding: 0 1.25rem;
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius-pill);
  font-weight: 700;
  font-size: var(--font-size-meta);
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
