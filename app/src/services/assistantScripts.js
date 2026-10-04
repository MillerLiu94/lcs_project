// 引導式對話的任務腳本（純資料 + 純函式）。
// finish(answers) 不直接碰 store／router，只回傳 { commits, route } 由 AssistantView 套用。
const REGION_OPTIONS = [
  { value: '中華路', label: '中華路' },
  { value: '汀州路', label: '汀州路' },
  { value: '青年公園', label: '青年公園' },
  { value: '台北車站', label: '台北車站' },
  { value: '', label: '都可以' },
]

export const ASSISTANT_SCRIPTS = {
  report: {
    title: '回報社區問題',
    intro: '我來幫你回報問題。先說說看到什麼狀況，一句話就好。',
    steps: [
      {
        id: 'description',
        type: 'text',
        question: '看到什麼狀況？',
        placeholder: '例如：中華路全家旁邊有一個坑洞',
      },
    ],
    finish(answers) {
      return {
        commits: [{ type: 'report/setDescription', payload: String(answers.description || '') }],
        route: { name: 'report-location' },
      }
    },
  },
  events: {
    title: '看看附近發生什麼事',
    intro: '我來幫你找附近的事件。先問你兩個問題。',
    steps: [
      {
        id: 'time',
        type: 'choice',
        question: '想找多久以內？',
        options: [
          { value: 'today', label: '今天' },
          { value: 'week', label: '這週' },
          { value: 'month', label: '這個月' },
          { value: 'all', label: '全部' },
        ],
      },
      { id: 'region', type: 'choice', question: '哪一區？', options: REGION_OPTIONS },
    ],
    finish(answers) {
      const commits = [{ type: 'query/setFilters', payload: { time: answers.time || 'month' } }]
      if (answers.region) commits.push({ type: 'query/setRegion', payload: answers.region })
      return { commits, route: { name: 'events' } }
    },
  },
  welfare: {
    title: '找福利和活動',
    intro: '我來幫你找福利或活動。',
    steps: [
      {
        id: 'type',
        type: 'choice',
        question: '想找哪一類的福利或活動？',
        options: [
          { value: '補助', label: '補助' },
          { value: '課程', label: '課程' },
          { value: '活動', label: '活動' },
          { value: '健康檢查', label: '健康檢查' },
          { value: '', label: '都可以，先看看' },
        ],
      },
      { id: 'region', type: 'choice', question: '哪一區？', options: REGION_OPTIONS },
    ],
    finish(answers) {
      const keyword = [answers.type, answers.region].filter(Boolean).join(' ')
      return { commits: [], route: { name: 'welfare', query: keyword ? { q: keyword } : {} } }
    },
  },
}

export function getScript(task) {
  return ASSISTANT_SCRIPTS[task] || null
}

export default { ASSISTANT_SCRIPTS, getScript }
