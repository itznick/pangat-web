import { useCallback, useEffect, useState } from "react"

interface Settled<T> {
  key: string
  /** the caller's key without the reload counter */
  base: string
  data: T | undefined
  error: unknown
}

/**
 * Load something when `key` changes (or `reload()` is called) without ever setting state synchronously inside an effect.
 * `loading` is DERIVED: it is true whenever the settled result belongs to an older key, so a changed key can never show the previous
 * key's data as current, and a slow older response cannot overwrite a newer one.
 * `enabled: false` skips the request (e.g. no outlet selected yet): `loading` is then false and `data` undefined.
 */
export function useQuery<T>(fetcher: () => Promise<T>, key: string, opts: { enabled?: boolean } = {}) {
  const enabled = opts.enabled !== false
  const [bump, setBump] = useState(0)
  const full = `${key}|${bump}`
  const [settled, setSettled] = useState<Settled<T>>({ key: "", base: "", data: undefined, error: null })

  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetcher().then(
      (data) => { if (alive) setSettled({ key: full, base: key, data, error: null }) },
      (error) => { if (alive) setSettled({ key: full, base: key, data: undefined, error }) },
    )
    return () => { alive = false }
    // the fetcher closes over whatever `key` describes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full, enabled])

  const current = settled.key === full
  const reload = useCallback(() => setBump((n) => n + 1), [])
  const mutate = useCallback((next: T) => setSettled({ key: full, base: key, data: next, error: null }), [full, key])
  return {
    data: enabled && current ? settled.data : undefined,
    /**
     * The previous result for the SAME key while a reload is in flight (keep showing it while refreshing). Never data that belongs to a
     * different key: switching outlet must not briefly show another outlet's data.
     */
    lastData: enabled && settled.base === key ? settled.data : undefined,
    error: enabled && current ? settled.error : null,
    loading: enabled && !current,
    reload,
    mutate,
  }
}
