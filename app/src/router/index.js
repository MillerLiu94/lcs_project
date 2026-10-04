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
import AssistantView from '../views/assistant/AssistantView.vue'
import MyReportsView from '../views/my/MyReportsView.vue'
import ResultsView from '../views/results/ResultsView.vue'

Vue.use(VueRouter)

// 三大功能改由引導式對話進入（首頁卡片與手機底部導覽都用這份）。
export const NAV_ITEMS = [
  { to: '/assistant/report', label: '回報問題', icon: 'Flag' },
  { to: '/assistant/events', label: '附近事件', icon: 'MapPin' },
  { to: '/assistant/welfare', label: '福利活動', icon: 'Gift' },
]

// 手機導覽多了回首頁的路徑；桌面版品牌本身就是回首頁，故不重複。
export const MOBILE_NAV_ITEMS = [
  { to: '/', label: '首頁', icon: 'House' },
  ...NAV_ITEMS,
]

// 桌面頂部導覽：不重複三大功能（改由首頁卡片進入），改放總覽與我的回報。
export const DESKTOP_NAV_ITEMS = [
  { to: '/events', label: '事件總覽', icon: 'MapPin' },
  { to: '/my-reports', label: '我的回報', icon: 'Flag' },
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
  { path: '/results', name: 'results', component: ResultsView },
  { path: '/assistant/:task', name: 'assistant', component: AssistantView, props: true },
  { path: '/my-reports', name: 'my-reports', component: MyReportsView },
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
