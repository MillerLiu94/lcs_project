import speechService from '../speechService'

test('不支援時 start 會回報錯誤但不拋例外', () => {
  let err = null
  expect(() => speechService.start({ onResult(){}, onError(e){ err = e } })).not.toThrow()
  if (!speechService.isSupported()) expect(err).toBeTruthy()
})
