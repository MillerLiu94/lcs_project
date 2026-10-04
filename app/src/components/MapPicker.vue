<template>
  <div class="map-picker">
    <div
      ref="canvas"
      class="map-picker__canvas"
      role="application"
      :aria-label="ariaLabel"
      tabindex="0"
      @keydown="onKeydown"
    ></div>

    <p v-if="!ready" class="map-picker__note">{{ unavailableNote }}</p>
    <p v-else class="map-picker__hint">{{ interactionHint }}</p>
  </div>
</template>

<script>
// Google Maps 的唯一封裝處：其餘畫面不直接碰 google。
// 沒有金鑰或 google 尚未載入時，整個載入器是 no-op，改顯示文字提示（不丟例外）。
const KEY = (import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_KEY) || ''
const FALLBACK_CENTER = { lat: 25.033, lng: 121.5654 }
const STEP = 0.0005

function mapsOrNull() {
  if (typeof window === 'undefined' || !window.google) return null
  return window.google.maps || null
}

// 回傳 Promise<google.maps|null>；測試環境（無金鑰）永遠回 null，不注入真實 API。
function loadGoogleMaps() {
  const ready = mapsOrNull()
  if (ready) return Promise.resolve(ready)
  if (typeof document === 'undefined' || !KEY) return Promise.resolve(null)

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}`
    script.async = true
    script.defer = true
    script.dataset.googleMaps = 'true'
    script.addEventListener('load', () => resolve(mapsOrNull()))
    script.addEventListener('error', () => resolve(null))
    document.head.appendChild(script)
  })
}

export default {
  name: 'MapPicker',
  props: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    marker: { type: Boolean, default: true },
  },
  data() {
    return {
      ready: false,
      unavailableNote: '這裡的地圖暫時打不開，可以用文字描述位置。',
      interactionHint: '在地圖上點一下，或用鍵盤方向鍵移動圖釘。',
    }
  },
  computed: {
    ariaLabel() {
      return '選擇事件位置的地圖'
    },
    initialCenter() {
      const hasPoint = typeof this.lat === 'number' && typeof this.lng === 'number'
      return hasPoint ? { lat: this.lat, lng: this.lng } : FALLBACK_CENTER
    },
  },
  watch: {
    lat() {
      this.recenter()
    },
    lng() {
      this.recenter()
    },
  },
  async mounted() {
    const maps = await loadGoogleMaps()
    if (!maps || !this.$refs.canvas) return
    this.buildMap(maps)
  },
  methods: {
    buildMap(maps) {
      const map = new maps.Map(this.$refs.canvas, {
        center: this.initialCenter,
        zoom: 16,
      })
      const markerOptions = { position: this.initialCenter, map }
      if (this.marker) markerOptions.draggable = true
      const pin = new maps.Marker(markerOptions)
      map.addListener('click', (event) => this.place(event.latLng.lat(), event.latLng.lng()))
      if (this.marker) {
        pin.addListener('dragend', () => {
          const pos = pin.getPosition()
          this.place(pos.lat(), pos.lng())
        })
      }
      this.map = map
      this.pin = pin
      this.ready = true
    },
    // 使用者任何一種操作都收斂到這一處：更新圖釘並往上回報座標。
    place(lat, lng) {
      if (this.map && this.pin && typeof lat === 'number' && typeof lng === 'number') {
        this.pin.setPosition({ lat, lng })
      }
      this.$emit('pick', lat, lng)
    },
    onKeydown(event) {
      if (!this.ready) return
      const moves = {
        ArrowUp: [STEP, 0],
        ArrowDown: [-STEP, 0],
        ArrowLeft: [0, -STEP],
        ArrowRight: [0, STEP],
      }
      const move = moves[event.key]
      if (!move) return
      event.preventDefault()
      const base = (this.pin && this.pin.getPosition()) || this.initialCenter
      this.place(base.lat() + move[0], base.lng() + move[1])
    },
    recenter() {
      if (!this.map || typeof this.lat !== 'number' || typeof this.lng !== 'number') return
      const center = { lat: this.lat, lng: this.lng }
      this.map.setCenter(center)
      if (this.pin) this.pin.setPosition(center)
    },
  },
}
</script>

<style scoped>
.map-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.map-picker__canvas {
  width: 100%;
  min-height: 280px;
  background: var(--muted, #eee);
  border: 2px solid var(--input);
  border-radius: var(--radius);
}
.map-picker__canvas:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.map-picker__note,
.map-picker__hint {
  margin: 0;
  font-size: 1rem;
  color: var(--muted-foreground);
}
</style>
