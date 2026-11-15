import * as React from 'react'

/**
 * Run `fn` every `ms` while the tab is visible. Hidden tabs make no requests; coming back to the tab refreshes
 * immediately if the data is older than one interval. `fn` may change every render without restarting the timer.
 */
export function usePolling(fn: () => void, ms: number | null | undefined, { immediate = false }: { immediate?: boolean } = {}) {
  const ref = React.useRef(fn)
  React.useEffect(() => {
    ref.current = fn
  })
  React.useEffect(() => {
    if (!ms) return
    let last = Date.now()
    let timer: number | undefined
    const tick = () => {
      last = Date.now()
      ref.current()
    }
    const start = () => {
      window.clearInterval(timer)
      timer = window.setInterval(tick, ms)
    }
    const onVisibility = () => {
      if (document.hidden) return window.clearInterval(timer)
      if (Date.now() - last >= ms) tick()
      start()
    }
    if (immediate) tick()
    if (!document.hidden) start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ms, immediate])
}
