import http from '../http'
import { setupMock } from '../mock'
setupMock(http)
test('GET /api/health 經 mock 回 ok', async () => {
  const { data } = await http.get('/api/health')
  expect(data.ok).toBe(true)
})
