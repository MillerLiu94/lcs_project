import { sortByRelevance } from '../ranking'

describe('ranking.sortByRelevance', () => {
  const items = [
    { id: 'a', placeText: '青年公園旁', reportedAt: '2026-10-01T10:00:00+08:00' },
    { id: 'b', placeText: '中華路一段', reportedAt: '2026-10-03T10:00:00+08:00' },
    { id: 'c', placeText: '中華路巷口', reportedAt: '2026-10-02T10:00:00+08:00' },
  ]

  test('先比地區符合、再比時間新近', () => {
    const r = sortByRelevance(items, { region: '中華路' })
    expect(r.map((i) => i.id)).toEqual(['b', 'c', 'a'])
  })

  test('沒有地區參數時只依時間新近排序', () => {
    const r = sortByRelevance(items, {})
    expect(r.map((i) => i.id)).toEqual(['b', 'c', 'a'])
  })

  test('地區符合但時間較舊仍優先於不符合者', () => {
    const r = sortByRelevance(
      [
        { id: 'old-match', region: '中正區', reportedAt: '2026-09-01T00:00:00+08:00' },
        { id: 'new-other', region: '萬華區', reportedAt: '2026-10-03T00:00:00+08:00' },
      ],
      { region: '中正區' }
    )
    expect(r.map((i) => i.id)).toEqual(['old-match', 'new-other'])
  })

  test('不更動原始陣列（純函式）', () => {
    const copy = items.map((i) => ({ ...i }))
    sortByRelevance(items, { region: '中華路' })
    expect(items).toEqual(copy)
  })

  test('缺少日期者排在最後', () => {
    const r = sortByRelevance(
      [
        { id: 'x', reportedAt: null },
        { id: 'y', reportedAt: '2026-10-01T00:00:00+08:00' },
        { id: 'z', reportedAt: 'invalid' },
      ],
      {}
    )
    expect(r.map((i) => i.id)).toEqual(['y', 'x', 'z'])
  })

  test('空或非陣列輸入回空陣列', () => {
    expect(sortByRelevance([], { region: '中華路' })).toEqual([])
    expect(sortByRelevance(null, {})).toEqual([])
  })
})
