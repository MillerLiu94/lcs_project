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
// S6 §2.3：地圖是低精度首選。沒有真實錨點時只給「區域中心」當初始視野，
// 絕不自動成為位置；一定要使用者點選／鍵盤放置圖釘才發出座標。
const KEY = (import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_KEY) || ''
const STEP = 0.0005
// 僅為地圖初始視野（台北中正／萬華一帶），不是預選位置。
const DEFAULT_VIEW = { lat: 25.035, lng: 121.51 }

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
      unavailableNote: '地圖暫時無法顯示。可以改用文字描述，或選「不確定，先送出」。',
      interactionHint: '在地圖上點一下，或用鍵盤方向鍵移動圖釘。',
    }
  },
  computed: {
    ariaLabel() {
      return '選擇事件位置的地圖'
    },
    // 有真實錨點才是精確中心；否則以區域中心當視野。
    hasAnchor() {
      return typeof this.lat === 'number' && typeof this.lng === 'number'
    },
    viewCenter() {
      return this.hasAnchor ? { lat: this.lat, lng: this.lng } : { ...DEFAULT_VIEW }
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
    // 有地圖後只更新中心；尚未建立且已載入 Google Maps 時才建立。
    syncMap() {
      if (!this.mapsLib || !this.$refs.canvas) return
      if (this.ready) {
        this.recenter()
        return
      }
      this.buildMap()
    },
    // 沒有真實錨點時仍建立地圖（區域中心僅為視野），但不放圖釘、不發座標。
    buildMap() {
      const map = new this.mapsLib.Map(this.$refs.canvas, {
        center: this.viewCenter,
        zoom: this.hasAnchor ? 16 : 14,
      })
      map.addListener('click', (event) => this.place(event.latLng.lat(), event.latLng.lng()))
      this.map = map
      if (this.hasAnchor) this.createPin(this.viewCenter)
      this.ready = true
    },
    createPin(position) {
      const options = { position, map: this.map }
      if (this.marker) options.draggable = true
      this.pin = new this.mapsLib.Marker(options)
      if (this.marker) {
        this.pin.addListener('dragend', () => {
          const pos = this.pin.getPosition()
          this.place(pos.lat(), pos.lng())
        })
      }
    },
    // 使用者操作收斂到這一處：放置／移動圖釘後才發出座標。
    place(lat, lng) {
      if (!this.ready || typeof lat !== 'number' || typeof lng !== 'number') return
      if (this.pin) this.pin.setPosition({ lat, lng })
      else if (this.marker) this.createPin({ lat, lng })
      this.$emit('pick', lat, lng)
    },
    onKeydown(event) {
      if (!this.ready) return
      const moves = { ArrowUp: [STEP, 0], ArrowDown: [-STEP, 0], ArrowLeft: [0, -STEP], ArrowRight: [0, STEP] }
      const move = moves[event.key]
      if (!move) return
      event.preventDefault()
      const pos = this.pin && this.pin.getPosition()
      const base = pos ? { lat: pos.lat(), lng: pos.lng() } : this.viewCenter
      this.place(base.lat + move[0], base.lng + move[1])
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
