import { parseIntents, classifyText } from '../intentRules'

test('單一意圖：只有一個子句', () => {
  expect(parseIntents('附近有沒有積水')).toEqual([
    { intent: 'query', text: '附近有沒有積水' },
  ])
})

test('以標點切分：一句話多個任務', () => {
  expect(parseIntents('附近有沒有積水，這個月有什麼老人活動')).toEqual([
    { intent: 'query', text: '附近有沒有積水' },
    { intent: 'welfare', text: '這個月有什麼老人活動' },
  ])
})

test('以連接詞切分（順便）', () => {
  expect(parseIntents('中華路有坑洞 順便 這個月有什麼老人活動')).toEqual([
    { intent: 'report', text: '中華路有坑洞' },
    { intent: 'welfare', text: '這個月有什麼老人活動' },
  ])
})

test('無法判斷回空陣列', () => {
  expect(parseIntents('最近有什麼')).toEqual([])
})

test('同意圖只留一次（保留第一個子句）', () => {
  expect(parseIntents('附近有沒有積水，有沒有路燈')).toEqual([
    { intent: 'query', text: '附近有沒有積水' },
  ])
})

test('classifyText 行為不變', () => {
  expect(classifyText('這個月有什麼老人活動').intent).toBe('welfare')
})
