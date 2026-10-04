import { useBreakpoint } from '../useBreakpoint'

// The real interface is reactive: `isDesktop` is a Vue Ref<boolean>, so read
// its unwrapped `.value` (the shell relies on this reactivity).
test('useBreakpoint 回傳 isDesktop 布林 ref', () => {
  const { isDesktop } = useBreakpoint()
  expect(typeof isDesktop.value).toBe('boolean')
})
