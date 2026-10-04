<template>
  <div class="event-map" role="region" aria-label="事件分佈圖">
    <div ref="canvas" class="event-map__canvas"></div>
    <p v-if="!ready" class="event-map__note" role="status">
      地圖暫時無法顯示，請由下方清單查看事件。
    </p>
  </div>
</template>

<script>
import { loadGoogleMaps } from '../services/googleMaps'

// 地圖初始視野（台北中正／萬華一帶）僅為視野，不代表任何事件位置。
const DEFAULT_CENTER = { lat: 25.035, lng: 121.51 }

// 只採用事件資料既有的真實座標；缺漏一律視為無座標（絕不合成）。
function hasCoordinates(event) {
  return Boolean(
    event &&
      event.coordinates &&
      typeof event.coordinates.lat === 'number' &&
      typeof event.coordinates.lng === 'number',
  )
}

export default {
  name: 'EventMap',
  props: {
    events: { type: Array, default: () => [] },
    selectedId: { type: String, default: null },
  },
  data() {
    return { ready: false, mapsLib: null, map: null, marks: [] }
  },
  watch: {
    events() {
      if (this.ready) this.renderMarks()
    },
    selectedId() {
      if (!this.ready || !this.map) return
      this.applySelection()
      const mark = this.marks.find((m) => m.id === this.selectedId)
      if (mark && typeof mark.marker.getPosition === 'function') {
        this.map.setCenter(mark.marker.getPosition())
      }
    },
  },
  async mounted() {
    this.mapsLib = await loadGoogleMaps()
    if (!this.mapsLib || !this.$refs.canvas) return
    this.map = new this.mapsLib.Map(this.$refs.canvas, {
      center: DEFAULT_CENTER,
      zoom: 14,
    })
    this.ready = true
    this.renderMarks()
  },
  methods: {
    clearMarks() {
      this.marks.forEach((mark) => {
        if (mark.marker && typeof mark.marker.setMap === 'function') mark.marker.setMap(null)
      })
      this.marks = []
    },
    renderMarks() {
      if (!this.ready) return
      this.clearMarks()
      const located = this.events.filter(hasCoordinates)
      this.marks = located.map((event) => {
        const marker = new this.mapsLib.Marker({
          position: event.coordinates,
          map: this.map,
          title: event.title,
        })
        marker.addListener('click', () => this.$emit('select', event.id))
        return { id: event.id, marker }
      })
      this.applySelection()
    },
    // 以 Symbol 畫圓形圖釘，選取者放大；不依賴任何外部圖示檔。
    markerIcon(selected) {
      const maps = this.mapsLib
      if (!maps || !maps.SymbolPath) return null
      return {
        path: maps.SymbolPath.CIRCLE,
        scale: selected ? 10 : 7,
        fillColor: '#a44900',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }
    },
    applySelection() {
      if (!this.ready) return
      this.marks.forEach(({ id, marker }) => {
        const selected = id === this.selectedId
        if (typeof marker.setZIndex === 'function') marker.setZIndex(selected ? 1 : 0)
        if (typeof marker.setIcon === 'function') {
          const icon = this.markerIcon(selected)
          if (icon) marker.setIcon(icon)
        }
      })
    },
  },
}
</script>

<style scoped>
.event-map {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.event-map__canvas {
  width: 100%;
  min-height: 160px;
  background: var(--muted, #eee);
  border: 2px solid var(--input);
  border-radius: var(--radius-card);
  overflow: hidden;
}
.event-map__note {
  margin: 0;
  font-size: var(--font-size-meta);
  color: var(--muted-foreground);
}
</style>
