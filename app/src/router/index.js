import Vue from 'vue'
import VueRouter from 'vue-router'

import store from '../store'
import HomeView from '../views/home/HomeView.vue'
import DescribeStep from '../views/report/DescribeStep.vue'
import LocationStep from '../views/report/LocationStep.vue'
import ConfirmStep from '../views/report/ConfirmStep.vue'
import DoneView from '../views/report/DoneView.vue'
import EventListView from '../views/query/EventListView.vue'
import EventDetailView from '../views/query/EventDetailView.vue'
import WelfareView from '../views/welfare/WelfareView.vue'
import ClarifyView from '../views/clarify/ClarifyView.vue'

Vue.use(VueRouter)

export const NAV_ITEMS = [
  { to: '/report', label: '回報問題' },
  { to: '/events', label: '看看附近事件' },
  { to: '/welfare', label: '找福利和活動' },
]

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/report', name: 'report', component: DescribeStep },
  { path: '/report/location', name: 'report-location', component: LocationStep },
  { path: '/report/confirm', name: 'report-confirm', component: ConfirmStep },
  { path: '/report/done', name: 'report-done', component: DoneView },
  { path: '/events', name: 'events', component: EventListView },
  { path: '/events/:id', name: 'event-detail', component: EventDetailView },
  { path: '/welfare', name: 'welfare', component: WelfareView },
  { path: '/clarify', name: 'clarify', component: ClarifyView },
]

const router = new VueRouter({
  mode: 'history',
  routes,
})

// 申報護欄：還沒有描述時，後續步驟（選位置／確認／完成）一律導回第一步。
router.beforeEach((to, from, next) => {
  const description = store.state.report.draft.description
  const isLaterReportStep = to.path.startsWith('/report/')
  if (isLaterReportStep && !String(description || '').trim()) {
    next({ name: 'report' })
    return
  }
  next()
})

export default router
