import Vue from 'vue'
import Vuex from 'vuex'
import intent from './modules/intent'
import report from './modules/report'
import location from './modules/location'
import query from './modules/query'
import welfare from './modules/welfare'
import myReports from './modules/myReports'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    intent,
    report,
    location,
    query,
    welfare,
    myReports,
  },
})
