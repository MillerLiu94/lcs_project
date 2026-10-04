import router from '../index'
import store from '../../store'

// 護欄用全域 router/store 單例驗證；vitest 每個測試檔獨立環境，不會污染其他檔案。
describe('申報流程護欄', () => {
  test('還沒有描述時，選位置步驟會導回 /report', async () => {
    store.commit('report/setDescription', '')
    await router.push('/report/location').catch(() => {})
    expect(router.currentRoute.path).toBe('/report')
  })

  test('有描述時可以進入選位置步驟', async () => {
    store.commit('report/setDescription', '中華路有一個坑洞')
    await router.push('/report/location').catch(() => {})
    expect(router.currentRoute.path).toBe('/report/location')
  })

  test('第一步 /report 本身不受護欄阻擋', async () => {
    store.commit('report/setDescription', '')
    await router.push('/report').catch(() => {})
    expect(router.currentRoute.path).toBe('/report')
  })
})
