/**
 * Real Screen Wake Lock for kitchen tablets. Never claims "active" unless the browser actually granted a sentinel.
 * The browser drops the lock whenever the page is hidden, so it is re-requested on return. Unsupported / denied / failed are reported
 * as such so the screen can tell staff to change the tablet's sleep setting instead.
 */
export type WakeLockState = 'unsupported' | 'inactive' | 'active' | 'blocked'

type Sentinel = { released: boolean; release: () => Promise<void>; addEventListener: (e: 'release', f: () => void) => void }
type WakeLockApi = { request: (type: 'screen') => Promise<Sentinel> }

export interface WakeLockEnv {
  wakeLock?: WakeLockApi
  isVisible: () => boolean
  onVisible: (f: () => void) => () => void
}

export function browserEnv(): WakeLockEnv {
  return {
    wakeLock: typeof navigator !== 'undefined' ? ((navigator as unknown as { wakeLock?: WakeLockApi }).wakeLock) : undefined,
    isVisible: () => typeof document === 'undefined' || !document.hidden,
    onVisible: (f) => {
      if (typeof document === 'undefined') return () => {}
      const h = () => { if (!document.hidden) f() }
      document.addEventListener('visibilitychange', h)
      return () => document.removeEventListener('visibilitychange', h)
    },
  }
}

export function createWakeLock(env: WakeLockEnv, onChange: (s: WakeLockState, detail?: string) => void) {
  let wanted = false
  let sentinel: Sentinel | null = null
  let state: WakeLockState = env.wakeLock ? 'inactive' : 'unsupported'
  let stopVisible: (() => void) | null = null
  const set = (s: WakeLockState, detail?: string) => { state = s; onChange(s, detail) }

  const acquire = async () => {
    if (!env.wakeLock) return set('unsupported', 'This browser cannot keep the screen awake. Turn off the tablet\'s screen timeout instead.')
    if (!env.isVisible()) return // the browser refuses while hidden; we retry when visible again
    try {
      const s = await env.wakeLock.request('screen')
      sentinel = s
      s.addEventListener('release', () => {
        // released by the browser (tab hidden, battery saver): not active any more, and we try again when we can
        if (sentinel === s) sentinel = null
        if (state === 'active') set(wanted ? 'inactive' : 'inactive')
      })
      set('active')
    } catch (e) {
      sentinel = null
      set('blocked', (e as Error)?.message || 'The browser refused to keep the screen awake (battery saver or permissions).')
    }
  }

  return {
    get state() { return state },
    async enable() {
      wanted = true
      stopVisible ??= env.onVisible(() => { if (wanted && !sentinel) void acquire() })
      await acquire()
    },
    async disable() {
      wanted = false
      stopVisible?.(); stopVisible = null
      const s = sentinel; sentinel = null
      try { await s?.release() } catch { /* already released */ }
      set(env.wakeLock ? 'inactive' : 'unsupported')
    },
  }
}
