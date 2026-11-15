import * as React from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { errMsg } from '@/lib/api'
import { usePolling } from '@/hooks/usePolling'

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
// that needed them. One entry per key: concurrent callers share the in-flight request, results live for `ttl`.
const shared = new Map<string, { at: number; data?: unknown; promise?: Promise<unknown> }>()
const sharedSubs = new Map<string, Set<() => void>>()
const notify = (key: string) => sharedSubs.get(key)?.forEach((fn) => fn())

function loadShared<T>(key: string, fn: () => Promise<T>, ttl: number, force = false): Promise<T> {
  const hit = shared.get(key)
  if (!force && hit) {
    if (hit.promise) return hit.promise as Promise<T>
    if (hit.data !== undefined && Date.now() - hit.at < ttl) return Promise.resolve(hit.data as T)
  }
  const promise = fn()
    .then((data) => {
      shared.set(key, { at: Date.now(), data })
      notify(key)
      return data
    })
    .catch((e) => {
      shared.delete(key)
      throw e
    })
  shared.set(key, { at: hit?.at ?? 0, data: hit?.data, promise })
  return promise
}

/** Drop a shared entry after a mutation; mounted consumers refetch immediately. */
export function invalidateShared(key: string) {
  shared.delete(key)
  notify(key)
}

/** Like useFetch, but the result is cached across screens (and deduplicated) under `key`. */
export function useShared<T>(key: string, fn: () => Promise<T>, opts: { enabled?: boolean; ttl?: number } = {}): Fetched<T> {
  const ttl = opts.ttl ?? 5 * 60_000
  const enabled = opts.enabled !== false
  const [data, setData] = React.useState<T | null>(() => (enabled ? ((shared.get(key)?.data as T | undefined) ?? null) : null))
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
      loadShared(key, () => fnRef.current(), ttl, force)
        .then((d) => alive && (setData(d), setError(null)))
        .catch((e) => alive && setError(errMsg(e, 'Could not load this data')))
        .finally(() => alive && setLoading(false))
    }
    run()
    const subs = sharedSubs.get(key) ?? new Set()
    sharedSubs.set(key, subs)
    const onChange = () => alive && (shared.has(key) ? setData((shared.get(key)?.data as T) ?? null) : run())
    subs.add(onChange)
    return () => {
      alive = false
      subs.delete(onChange)
    }
  }, [key, enabled, ttl, tick])
  const reload = React.useCallback(() => {
    shared.delete(key)
    setTick((x) => x + 1)
  }, [key])
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
