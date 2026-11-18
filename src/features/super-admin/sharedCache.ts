/**
 * Cache core behind useShared(): one entry per key, concurrent callers share the in-flight request, results live for
 * `ttl`. Framework-free so it can be unit tested. `invalidate()` drops the entry and tells mounted consumers to refetch.
 */
export interface SharedCache {
  load<T>(key: string, fn: () => Promise<T>, ttl: number, force?: boolean): Promise<T>
  peek<T>(key: string): T | undefined
  invalidate(key: string): void
  subscribe(key: string, fn: () => void): () => void
  has(key: string): boolean
}

export function createSharedCache(now: () => number = Date.now): SharedCache {
  const store = new Map<string, { at: number; data?: unknown; promise?: Promise<unknown> }>()
  const subs = new Map<string, Set<() => void>>()
  const notify = (key: string) => subs.get(key)?.forEach((fn) => fn())

  return {
    load<T>(key: string, fn: () => Promise<T>, ttl: number, force = false): Promise<T> {
      const hit = store.get(key)
      if (!force && hit) {
        if (hit.promise) return hit.promise as Promise<T>
        if (hit.data !== undefined && now() - hit.at < ttl) return Promise.resolve(hit.data as T)
      }
      const promise = fn().then(
        (data) => {
          store.set(key, { at: now(), data })
          notify(key)
          return data
        },
        (e) => {
          store.delete(key)
          throw e
        },
      )
      store.set(key, { at: hit?.at ?? 0, data: hit?.data, promise })
      return promise
    },
    peek<T>(key: string) {
      return store.get(key)?.data as T | undefined
    },
    has: (key) => store.has(key),
    invalidate(key) {
      store.delete(key)
      notify(key)
    },
    subscribe(key, fn) {
      const set = subs.get(key) ?? new Set<() => void>()
      subs.set(key, set)
      set.add(fn)
      return () => set.delete(fn)
    },
  }
}
