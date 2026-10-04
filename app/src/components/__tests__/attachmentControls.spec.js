import { mount } from '@vue/test-utils'
import AttachmentControls from '../AttachmentControls.vue'

describe('AttachmentControls', () => {
  test('桌機不顯示拍照鈕，手機才顯示', () => {
    const desktop = mount(AttachmentControls, { propsData: { isMobile: false } })
    expect(desktop.find('[aria-label="拍照"]').exists()).toBe(false)
    const mobile = mount(AttachmentControls, { propsData: { isMobile: true } })
    expect(mobile.find('[aria-label="拍照"]').exists()).toBe(true)
  })

  test('點＋展開選單，選「上傳照片」會觸發對應的檔案輸入', async () => {
    const w = mount(AttachmentControls)
    const spy = vi.spyOn(w.vm.$refs.photo, 'click').mockImplementation(() => {})

    expect(w.find('[role="menu"]').exists()).toBe(false)
    await w.find('[aria-label="新增附件"]').trigger('click')
    const items = w.findAll('.attach-controls__item')
    expect(items.length).toBe(2)
    await items.at(0).trigger('click')

    expect(spy).toHaveBeenCalled()
    expect(w.find('[role="menu"]').exists()).toBe(false)
  })

  test('超過 8MB 的檔案不發出事件，並提示錯誤', () => {
    const w = mount(AttachmentControls)
    const big = { size: 9 * 1024 * 1024, name: 'big.png', type: 'image/png' }
    w.vm.onFile({ target: { files: [big], value: 'x' } }, 'photo')
    expect(w.emitted('photo')).toBeFalsy()
    expect(w.emitted('error')[0][0]).toContain('8MB')
  })

  test('沒有選檔（取消）不會發出事件', () => {
    const w = mount(AttachmentControls)
    w.vm.onFile({ target: { files: [], value: '' } }, 'photo')
    expect(w.emitted('photo')).toBeFalsy()
    expect(w.emitted('error')).toBeFalsy()
  })
})
