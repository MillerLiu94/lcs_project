<template>
  <div class="map-picker">
    <div
      ref="canvas"
      class="map-picker__canvas"
      role="application"
      :aria-label="ariaLabel"
      :aria-describedby="descriptionId"
      tabindex="0"
      @keydown="onKeydown"
    ></div>

    <p v-if="!ready" :id="descriptionId" class="map-picker__note">{{ unavailableNote }}</p>
    <p v-else :id="descriptionId" class="map-picker__hint">{{ interactionHint }}</p>
  </div>
</template>

<script>
// Google Maps 的唯一封裝處：其餘畫面不直接碰 google。
// 沒有金鑰或 google 尚未載入時，載入器是 no-op，改顯示文字提示（不丟例外）。
// S6 §14.4：沒有可錨定的真實點（候選／目前位置）前，地圖不建立、也絕不發出座標。
const KEY = (import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_KEY) || ''
const STEP = 0.0005

let uid = 0

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
    uid += 1
    return {
      ready: false,
      mapsLib: null,
      descriptionId: `map-picker-desc-${uid}`,
      unavailableNote: '地圖需要一個大概的位置才能顯示。可以改用文字描述，或選「不確定，先送出」。',
      interactionHint: '在地圖上點一下，或用鍵盤方向鍵移動圖釘。',
    }
  },
  computed: {
    ariaLabel() {
      return '選擇事件位置的地圖'
    },
    // 有真實錨點才允許渲染／操作地圖。
    hasAnchor() {
      return typeof this.lat === 'number' && typeof this.lng === 'number'
    },
    initialCenter() {
      return this.hasAnchor ? { lat: this.lat, lng: this.lng } : null
    },
  },
  watch: {
    lat() {
      this.syncMap()
    },
    lng() {
      this.syncMap()
    },
  },
  async mounted() {
    this.mapsLib = await loadGoogleMaps()
    this.syncMap()
  },
  methods: {
    // 錨點出現前不建圖；出現後才建立，之後只更新中心。
    syncMap() {
      if (!this.mapsLib || !this.$refs.canvas) return
      if (this.ready) {
        this.recenter()
        return
      }
      if (this.hasAnchor) this.buildMap()
    },
    buildMap() {
      const maps = this.mapsLib
      const center = this.initialCenter
      const map = new maps.Map(this.$refs.canvas, { center, zoom: 16 })
      const markerOptions = { position: center, map }
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
    // 使用者任何一種操作都收斂到這一處；未錨定或未就緒時一律不發出座標。
    place(lat, lng) {
      if (!this.ready || !this.hasAnchor) return
      if (typeof lat !== 'number' || typeof lng !== 'number') return
      if (this.pin) this.pin.setPosition({ lat, lng })
      this.$emit('pick', lat, lng)
    },
    onKeydown(event) {
      if (!this.ready || !this.pin) return
      const moves = {
        ArrowUp: [STEP, 0],
        ArrowDown: [-STEP, 0],
        ArrowLeft: [0, -STEP],
        ArrowRight: [0, STEP],
      }
      const move = moves[event.key]
      const base = this.pin.getPosition()
      if (!move || !base) return
      event.preventDefault()
      this.place(base.lat() + move[0], base.lng() + move[1])
    },
    recenter() {
      if (!this.ready || !this.hasAnchor) return
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
