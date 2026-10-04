import Vue from 'vue'
import ElementUI from 'element-ui'
import App from './App.vue'
import router from './router'
import store from './store'
import './styles/tokens.css'
import './styles/element-variables.scss'
import './styles/element-override.scss'

Vue.config.productionTip = false

// 全域錯誤記錄：元件外或未被 errorCaptured 攔到的錯誤仍會進 Console，
// 方便日後排查（畫面本身由 App.vue 的 errorCaptured 顯示訊息）。
Vue.config.errorHandler = (error, vm, info) => {
  // eslint-disable-next-line no-console
  console.error('[app error]', info, error)
}

Vue.use(ElementUI)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
