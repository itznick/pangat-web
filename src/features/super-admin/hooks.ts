import * as React from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { errMsg } from '@/lib/api'

/** Permissions the server granted this platform admin (the server re-checks every call; this only hides what would be refused). */
export function usePerms() {
  const user = useAuthStore((s) => s.user)
  const list = user?.platformPermissions
  // sessions saved before roles existed carry no list: treat as the legacy full-access owner
  const all = !list
  return {
    role: user?.platformRole ?? 'OWNER',
    can: (p: string) => all || list!.includes(p),
    canAny: (...p: string[]) => all || p.some((x) => list!.includes(x)),
  }
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
  React.useEffect(() => {
    if (!opts.pollMs) return
    const t = window.setInterval(() => setTick((x) => x + 1), opts.pollMs)
    return () => clearInterval(t)
  }, [opts.pollMs])
  const reload = React.useCallback(() => setTick((x) => x + 1), [])
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
  const [q, setQ] = React.useState('')
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
  return {
    params, q, sort, order, page, filters,
    setQ: (v: string) => { setQ(v); setPage(1) },
    setFilter: (k: keyof F, v: string) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1) },
    setPage,
    toggleSort: (key: string) => {
      if (sort === key) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
      else { setSort(key); setOrder('asc') }
      setPage(1)
    },
    reset: () => { setQ(''); setFilters(initial); setPage(1) },
    active: Boolean(dq) || Object.values(filters).some(Boolean),
  }
}
