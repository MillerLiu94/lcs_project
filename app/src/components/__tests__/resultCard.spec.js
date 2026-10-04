import { mount } from '@vue/test-utils'
import ResultCard from '../ResultCard.vue'
import SourceBadge from '../SourceBadge.vue'
import StepIndicator from '../StepIndicator.vue'
import EmptyState from '../EmptyState.vue'
import ErrorAlert from '../ErrorAlert.vue'

test('ResultCard 顯示來源與原始連結', () => {
  const w = mount(ResultCard, { propsData: { title:'健康檢查', source:'XX區公所', publishedAt:'10/01', url:'https://x' } })
  expect(w.text()).toContain('XX區公所')
  expect(w.find('a[href="https://x"]').exists()).toBe(true)
})

describe('ResultCard', () => {
  test('原始連結以新分頁開啟並帶安全 rel', () => {
    const w = mount(ResultCard, { propsData: { title: '活動', url: 'https://x' } })
    const link = w.find('a')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
  })

  test('沒有 url 時不渲染原始連結', () => {
    const w = mount(ResultCard, { propsData: { title: '活動' } })
    expect(w.find('a').exists()).toBe(false)
  })

  test('顯示日期與地點文字', () => {
    const w = mount(ResultCard, {
      propsData: { title: '活動', dateText: '10/10', placeText: 'XX活動中心' },
    })
    expect(w.text()).toContain('10/10')
    expect(w.text()).toContain('XX活動中心')
  })
})

describe('SourceBadge', () => {
  test('顯示來源單位與發布日期', () => {
    const w = mount(SourceBadge, { propsData: { unit: 'XX區公所', publishedAt: '10/01' } })
    expect(w.text()).toContain('XX區公所')
    expect(w.text()).toContain('10/01')
  })

  test('資料缺少時只顯示有的欄位', () => {
    const w = mount(SourceBadge, { propsData: { unit: 'XX區公所' } })
    expect(w.text()).toContain('XX區公所')
    expect(w.text()).not.toContain('發布')
  })
})

describe('StepIndicator', () => {
  test('以「步驟 X/Y」呈現進度', () => {
    const w = mount(StepIndicator, { propsData: { current: 2, total: 4 } })
    expect(w.text()).toContain('步驟 2/4')
  })
})

describe('EmptyState', () => {
  test('顯示訊息且 action slot 可用', () => {
    const w = mount(EmptyState, {
      propsData: { message: '目前附近沒有已回報的事件' },
      slots: { action: '<button class="next">回報一個問題</button>' },
    })
    expect(w.text()).toContain('目前附近沒有已回報的事件')
    const button = w.find('button.next')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('回報一個問題')
  })
})

describe('ErrorAlert', () => {
  test('根元素以 role=alert 宣告並可程式聚焦', () => {
    const w = mount(ErrorAlert, { propsData: { message: '網路有點問題，請再試一次。' } })
    const root = w.find('[role="alert"]')
    expect(root.exists()).toBe(true)
    expect(root.attributes('tabindex')).toBe('-1')
    expect(w.text()).toContain('網路有點問題，請再試一次。')
  })

  test('可透過 action slot 提供下一步', () => {
    const w = mount(ErrorAlert, {
      propsData: { message: '送出失敗' },
      slots: { action: '<button class="retry">重新送出</button>' },
    })
    expect(w.find('button.retry').exists()).toBe(true)
  })
})
