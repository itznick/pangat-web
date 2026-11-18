import * as React from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { errMsg } from '@/lib/api'
import { usePolling } from '@/hooks/usePolling'
import { createSharedCache } from './sharedCache'

/** Permissions the server granted this platform admin (the server re-checks every call; this only hides what would be refused). */
export function usePerms() {
  const user = useAuthStore((s) => s.user)
  const list = user?.platformPermissions
  const role = user?.platformRole ?? 'OWNER'
  // stable between renders so memoized children and effects that depend on can() don't churn
  return React.useMemo(() => {
    // sessions saved before roles existed carry no list: treat as the legacy full-access owner
    const all = !list
    return {
      role,
      can: (p: string) => all || list!.includes(p),
      canAny: (...p: string[]) => all || p.some((x) => list!.includes(x)),
    }
  }, [list, role])
}

export interface Fetched<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
  setData: React.Dispatch<React.SetStateAction<T | null>>
}

/** Minimal data hook: keeps the previous data on screen while reloading, ignores stale responses, exposes reload(). */
export function useFetch<T>(fn: () => Promise<T>, deps: React.DependencyList, opts: { enabled?: boolean; pollMs?: number } = {}): Fetched<T> {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(opts.enabled !== false)
  const [error, setError] = React.useState<string | null>(null)
  const [tick, setTick] = React.useState(0)
  const fnRef = React.useRef(fn)
  React.useEffect(() => {
    fnRef.current = fn
  })
  React.useEffect(() => {
    if (opts.enabled === false) return
    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fnRef
      .current()
      .then((d) => {
        if (alive) {
          setData(d)
          setError(null)
        }
      })
      .catch((e) => alive && setError(errMsg(e, 'Could not load this data')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, opts.enabled])
  usePolling(() => setTick((x) => x + 1), opts.enabled === false ? null : opts.pollMs)
  const reload = React.useCallback(() => setTick((x) => x + 1), [])
  return { data, loading, error, reload, setData }
}

// ── Shared reference data ──────────────────────────────────────────────────────
// Plans, templates, support meta and the access catalog change rarely but were re-requested by every screen
// that needs them. One entry per key (see sharedCache.ts): concurrent callers share the in-flight request.
const cache = createSharedCache()

/** Drop a shared entry after a mutation; mounted consumers refetch immediately. */
export function invalidateShared(key: string) {
  cache.invalidate(key)
}

/** Like useFetch, but the result is cached across screens (and deduplicated) under `key`. */
export function useShared<T>(key: string, fn: () => Promise<T>, opts: { enabled?: boolean; ttl?: number } = {}): Fetched<T> {
  const ttl = opts.ttl ?? 5 * 60_000
  const enabled = opts.enabled !== false
  const [data, setData] = React.useState<T | null>(() => (enabled ? (cache.peek<T>(key) ?? null) : null))
  const [loading, setLoading] = React.useState(enabled && data === null)
  const [error, setError] = React.useState<string | null>(null)
  const fnRef = React.useRef(fn)
  React.useEffect(() => {
    fnRef.current = fn
  })
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    if (!enabled) return
    let alive = true
    const force = tick > 0
    const run = () => {
      setLoading(true)
      cache.load(key, () => fnRef.current(), ttl, force)
        .then((d) => alive && (setData(d), setError(null)))
        .catch((e) => alive && setError(errMsg(e, 'Could not load this data')))
        .finally(() => alive && setLoading(false))
    }
    run()
    const onChange = () => alive && (cache.has(key) ? setData(cache.peek<T>(key) ?? null) : run())
    const unsubscribe = cache.subscribe(key, onChange)
    return () => {
      alive = false
      unsubscribe()
    }
  }, [key, enabled, ttl, tick])
  const reload = React.useCallback(() => {
    // a forced load replaces the entry and notifies every other consumer of this key when it completes
    setTick((x) => x + 1)
  }, [])
  return { data, loading, error, reload, setData }
}

export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/** Table query state shared by every list screen: search, filters, sort, paging. */
export function useListState<F extends Record<string, string>>(initial: F, defaults: { sort?: string; order?: 'asc' | 'desc'; limit?: number } = {}) {
  const [filters, setFilters] = React.useState<F>(initial)
  const [q, setQRaw] = React.useState('')
  const [sort, setSort] = React.useState(defaults.sort ?? '')
  const [order, setOrder] = React.useState<'asc' | 'desc'>(defaults.order ?? 'desc')
  const [page, setPage] = React.useState(1)
  const dq = useDebounced(q, 300)
  const params = React.useMemo(() => {
    const p: Record<string, string | number> = { page, limit: defaults.limit ?? 25 }
    if (dq) p.q = dq
    if (sort) {
      p.sort = sort
      p.order = order
    }
    for (const [k, v] of Object.entries(filters)) if (v) p[k] = v
    return p
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq, sort, order, page, filters])
  const setQ = React.useCallback((v: string) => { setQRaw(v); setPage(1) }, [])
  const setFilter = React.useCallback((k: keyof F, v: string) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1) }, [])
  const sortRef = React.useRef(sort)
  React.useEffect(() => {
    sortRef.current = sort
  })
  const toggleSort = React.useCallback((key: string) => {
    if (sortRef.current === key) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    else {
      setSort(key)
      setOrder('asc')
    }
    setPage(1)
  }, [])
  const initialRef = React.useRef(initial)
  const reset = React.useCallback(() => { setQRaw(''); setFilters(initialRef.current); setPage(1) }, [])
  return {
    params, q, sort, order, page, filters,
    setQ, setFilter, setPage, toggleSort, reset,
    active: Boolean(dq) || Object.values(filters).some(Boolean),
  }
}
