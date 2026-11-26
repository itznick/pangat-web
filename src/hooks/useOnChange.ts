import { useState } from "react"

const UNSET = Symbol("unset")

/**
 * Run `fn` when `value` changes, DURING render, so dependent state is adjusted in the same pass.
 * This is React's documented replacement for `useEffect(() => setX(...), [value])` ("adjusting state when a prop changes"):
 * no extra render with stale state, no flicker, no cascading effect. With `runOnMount`, `fn` also runs for the very first value.
 */
export function useOnChange<T>(value: T, fn: (value: T, previous: T) => void, opts: { runOnMount?: boolean } = {}): void {
  const [previous, setPrevious] = useState<T | typeof UNSET>(opts.runOnMount ? UNSET : value)
  if (previous === UNSET || !Object.is(previous, value)) {
    setPrevious(value)
    fn(value, previous === UNSET ? value : previous)
  }
}
