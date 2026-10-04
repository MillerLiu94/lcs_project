import Vue from 'vue'
import Vuex from 'vuex'
import intent from './modules/intent'
import report from './modules/report'
import location from './modules/location'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    intent,
    report,
    location,
  },
})
