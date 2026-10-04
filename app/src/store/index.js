import Vue from 'vue'
import Vuex from 'vuex'
import intent from './modules/intent'
import report from './modules/report'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    intent,
    report,
  },
})
