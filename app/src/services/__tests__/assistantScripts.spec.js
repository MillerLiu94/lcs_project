import { ASSISTANT_SCRIPTS, getScript } from '../assistantScripts'

test('三個任務都有腳本', () => {
  expect(Object.keys(ASSISTANT_SCRIPTS).sort()).toEqual(['events', 'report', 'welfare'])
  expect(getScript('nope')).toBeNull()
})

test('原型鏈屬性名稱不視為有效任務', () => {
  expect(getScript('constructor')).toBeNull()
  expect(getScript('toString')).toBeNull()
  expect(getScript('__proto__')).toBeNull()
})

test('report.finish 寫入描述並轉往選位置', () => {
  const out = ASSISTANT_SCRIPTS.report.finish({ description: '中華路坑洞' })
  expect(out.commits).toEqual([{ type: 'report/setDescription', payload: '中華路坑洞' }])
  expect(out.route).toEqual({ name: 'report-location' })
})

test('events.finish 寫入時間；有地區才寫 region', () => {
  const out = ASSISTANT_SCRIPTS.events.finish({ time: 'week', region: '中華路' })
  expect(out.commits).toContainEqual({ type: 'query/setFilters', payload: { time: 'week' } })
  expect(out.commits).toContainEqual({ type: 'query/setRegion', payload: '中華路' })
  expect(out.route).toEqual({ name: 'events' })

  const none = ASSISTANT_SCRIPTS.events.finish({ time: 'month', region: '' })
  expect(none.commits).toEqual([{ type: 'query/setFilters', payload: { time: 'month' } }])
})

test('welfare.finish 以非空答案組成 ?q=', () => {
  expect(ASSISTANT_SCRIPTS.welfare.finish({ type: '補助', region: '汀州路' }).route).toEqual({
    name: 'welfare',
    query: { q: '補助 汀州路' },
  })
  expect(ASSISTANT_SCRIPTS.welfare.finish({ type: '活動', region: '' }).route).toEqual({
    name: 'welfare',
    query: { q: '活動' },
  })
})
