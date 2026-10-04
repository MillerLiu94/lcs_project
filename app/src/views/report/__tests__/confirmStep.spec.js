import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import ConfirmStep from '../ConfirmStep.vue'
import DoneView from '../DoneView.vue'
import report from '../../../store/modules/report'
import myReports from '../../../store/modules/myReports'
import eventService from '../../../services/eventService'

const localVue = createLocalVue()
localVue.use(Vuex)

function makeStore() {
  const store = new Vuex.Store({ modules: { report, myReports } })
  store.commit('report/setDescription', '中華路有一個坑洞')
  store.commit('report/setLocation', { mode: 'unconfirmed', text: '中華路有一個坑洞' })
  return store
}

function mountStep(store, push = () => Promise.resolve()) {
  return mount(ConfirmStep, { localVue, store, mocks: { $router: { push } } })
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('ConfirmStep（P3 摘要確認）', () => {
  test('顯示結構化摘要與確認提問', () => {
    const w = mountStep(makeStore())
    const text = w.text()
    expect(text).toContain('請確認，這樣對嗎？')
    expect(text).toContain('中華路有一個坑洞')
    expect(text).toContain('時間')
    expect(text).toContain('附件')
  })

  test('有附件時顯示縮圖與檔名，移除會清空草稿', async () => {
    const store = makeStore()
    store.commit('report/setPhoto', 'data:img')
    store.commit('report/setAudio', { name: 'a.mp3', dataUrl: 'data:aud' })
    const w = mountStep(store)
    expect(w.findComponent({ name: 'AttachmentChips' }).exists()).toBe(true)

    await w.find('[aria-label="移除照片"]').trigger('click')
    await w.find('[aria-label="移除音檔"]').trigger('click')
    expect(store.state.report.draft.photo).toBeNull()
    expect(store.state.report.draft.audioName).toBe('')
  })

  test('送出中按鈕停用並擋下重複點擊', async () => {
    let resolveReport
    const spy = vi
      .spyOn(eventService, 'report')
      .mockImplementation(() => new Promise((resolve) => { resolveReport = resolve }))
    try {
      const store = makeStore()
      const w = mountStep(store, vi.fn(() => Promise.resolve()))
      await w.find('.confirm__submit').trigger('click')
      await w.vm.$nextTick()
      expect(store.state.report.status).toBe('submitting')
      expect(w.find('.confirm__submit').attributes('disabled')).toBe('disabled')
      await w.find('.confirm__submit').trigger('click')
      expect(spy).toHaveBeenCalledTimes(1)
      resolveReport({ id: 'e-999' })
      await flush()
    } finally {
      spy.mockRestore()
    }
  })

  test('成功後先導到完成頁、抵達後才清空草稿（護欄順序）', async () => {
    const store = makeStore()
    const seen = []
    const push = vi.fn((loc) => {
      seen.push({ name: loc.name, description: store.state.report.draft.description })
      return Promise.resolve()
    })
    const w = mountStep(store, push)

    await w.find('.confirm__submit').trigger('click')
    await flush()

    // 導頁當下草稿仍在（否則護欄會把 /report/done 彈回 /report）。
    expect(seen).toEqual([{ name: 'report-done', description: '中華路有一個坑洞' }])
    expect(store.state.report.draft.description).toBe('')
    expect(store.state.report.status).toBe('idle')
  })

  test('送出失敗顯示錯誤並保留草稿，可重試', async () => {
    const spy = vi.spyOn(eventService, 'report').mockRejectedValueOnce(new Error('boom'))
    try {
      const store = makeStore()
      const w = mountStep(store)
      await w.find('.confirm__submit').trigger('click')
      await flush()
      expect(store.state.report.status).toBe('error')
      expect(w.findComponent({ name: 'ErrorAlert' }).exists()).toBe(true)
      expect(store.state.report.draft.description).toBe('中華路有一個坑洞')
    } finally {
      spy.mockRestore()
    }
  })

  test('送出成功後會記錄到我的回報', async () => {
    const store = makeStore()
    const w = mountStep(store, vi.fn(() => Promise.resolve()))
    await w.find('.confirm__submit').trigger('click')
    await flush()
    expect(store.state.myReports.list).toHaveLength(1)
    expect(store.state.myReports.list[0].title).toContain('中華路')
  })
})

describe('DoneView（P4 完成）', () => {
  test('顯示成功訊息，回首頁時清空草稿', async () => {
    const store = makeStore()
    const push = vi.fn()
    const w = mount(DoneView, { localVue, store, mocks: { $router: { push } } })
    expect(w.text()).toContain('已收到你的回報，社區工作人員會盡快處理。')
    await w.find('.done__home').trigger('click')
    expect(store.state.report.draft.description).toBe('')
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })
})
