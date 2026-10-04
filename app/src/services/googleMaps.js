// Google Maps 載入器（唯一封裝處）：MapPicker 與 EventMap 共用。
// 沒有金鑰或 google 尚未載入時回 null，不丟例外；測試環境不注入真實 API。
const KEY = (import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_KEY) || ''

function mapsOrNull() {
  if (typeof window === 'undefined' || !window.google) return null
  return window.google.maps || null
}

/**
 * 載入 Google Maps JavaScript API。
 * @returns {Promise<object|null>} window.google.maps；無 window.google 且無金鑰時為 null。
 */
export function loadGoogleMaps() {
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

export default { loadGoogleMaps }
