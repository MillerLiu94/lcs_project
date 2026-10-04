import http from '../../api/http'
import { setupMock, resetMock } from '../../api/mock'
import intentService from '../intentService'

it.each([
  ['中華路全家旁邊有一個坑洞', 'report'],
  ['附近有沒有積水', 'query'],
  ['這個月有什麼老人活動', 'welfare'],
  ['最近有什麼', 'ambiguous'],
])('%s → %s', async (text, intent) => {
  const r = await intentService.classify(text)
  expect(r.intent).toBe(intent)
})

describe('intentService.classify', () => {
  test('回傳 confidence 與 textExtract 抽出的 extracted', async () => {
    const r = await intentService.classify('中華路全家旁邊有一個坑洞')
    expect(typeof r.confidence).toBe('number')
    expect(r.confidence).toBeGreaterThan(0)
    expect(r.extracted.eventType).toBe('坑洞')
    expect(r.extracted.locationText).toContain('中華路')
  })

  test('空白或非字串輸入回 ambiguous', async () => {
    expect((await intentService.classify('')).intent).toBe('ambiguous')
    expect((await intentService.classify(null)).intent).toBe('ambiguous')
  })
})

describe('POST /api/intent（mock 端點）', () => {
  test('回傳與本地規則一致的分類結果', async () => {
    setupMock(http, { delayResponse: 0 })
    const { data } = await http.post('/api/intent', { text: '這個月有什麼老人活動' })
    expect(data.intent).toBe('welfare')
    expect(data.extracted).toBeTruthy()
    resetMock()
  })
})
