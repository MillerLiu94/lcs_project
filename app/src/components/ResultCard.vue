<template>
  <article class="result-card">
    <h3 class="result-card__title">{{ title }}</h3>

    <dl v-if="dateText || placeText" class="result-card__meta">
      <div v-if="dateText" class="result-card__meta-item">
        <dt class="result-card__meta-label">日期</dt>
        <dd class="result-card__meta-value">
          <CalendarIcon :size="20" aria-hidden="true" />
          <span>{{ dateText }}</span>
        </dd>
      </div>
      <div v-if="placeText" class="result-card__meta-item">
        <dt class="result-card__meta-label">地點</dt>
        <dd class="result-card__meta-value">
          <MapPinIcon :size="20" aria-hidden="true" />
          <span>{{ placeText }}</span>
        </dd>
      </div>
    </dl>

    <div class="result-card__footer">
      <SourceBadge
        v-if="source || publishedAt"
        :unit="source"
        :published-at="publishedAt"
      />
      <a
        v-if="url"
        class="result-card__link"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
      >
        查看原始公告
      </a>
    </div>
  </article>
</template>

<script>
import CalendarIcon from './icons/Calendar.vue'
import MapPinIcon from './icons/MapPin.vue'
import SourceBadge from './SourceBadge.vue'

export default {
  name: 'ResultCard',
  components: { CalendarIcon, MapPinIcon, SourceBadge },
  props: {
    title: { type: String, required: true },
    dateText: { type: String, default: '' },
    placeText: { type: String, default: '' },
    source: { type: String, default: '' },
    publishedAt: { type: String, default: '' },
    url: { type: String, default: '' },
  },
}
</script>

<style scoped>
.result-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-float);
}
.result-card__title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.4;
}
.result-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
}
.result-card__meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.result-card__meta-label {
  flex: none;
  min-width: 3rem;
  font-size: 1rem;
  color: var(--muted-foreground);
}
.result-card__meta-value {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.6;
}
.result-card__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}
.result-card__link {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0.5rem 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.result-card__link:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
  border-radius: var(--radius);
}
</style>
