import Vue from 'vue'
import ElementUI from 'element-ui'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/element-variables.scss'
import './styles/element-override.scss'

Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
