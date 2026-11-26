/**
 * Honest live-connection state for screens that must never silently go stale (kitchen display, order board).
 *
 *  - connected     socket up, and the last REST sync succeeded
 *  - synchronising a REST refetch is in flight (after a reconnect, wake-up or manual retry)
 *  - reconnecting  the device is online but the socket is down: events may be missing
 *  - offline       the device has no network
 *
 * A socket is only a delivery shortcut. After ANY gap the screen re-reads the authoritative list over REST, so a missed event can never
 * leave a ticket wrong for longer than the gap itself.
 */
import { create } from 'zustand'

export type ConnectionStatus = 'connected' | 'synchronising' | 'reconnecting' | 'offline'

export function deriveConnection(i: { socketConnected: boolean; online: boolean; syncing: boolean; lastSyncFailed: boolean }): ConnectionStatus {
  if (!i.online) return 'offline'
  if (!i.socketConnected) return 'reconnecting'
  if (i.syncing) return 'synchronising'
  // socket is up but the last REST read failed: the list may be behind, so do not claim "connected"
  if (i.lastSyncFailed) return 'reconnecting'
  return 'connected'
}

export const CONNECTION_LABEL: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  synchronising: 'Synchronising…',
  reconnecting: 'Reconnecting…',
  offline: 'Offline',
}

interface ConnectionState {
  socketConnected: boolean
  online: boolean
  syncing: boolean
  lastSyncFailed: boolean
  lastSyncedAt: number | null
  status: ConnectionStatus
  setSocket: (v: boolean) => void
  setOnline: (v: boolean) => void
  syncStarted: () => void
  syncFinished: (ok: boolean) => void
}

const recompute = (s: Pick<ConnectionState, 'socketConnected' | 'online' | 'syncing' | 'lastSyncFailed'>) => deriveConnection(s)

export const useConnectionStore = create<ConnectionState>((set) => ({
  socketConnected: false,
  online: typeof navigator === 'undefined' ? true : navigator.onLine !== false,
  syncing: false,
  lastSyncFailed: false,
  lastSyncedAt: null,
  status: 'reconnecting',
  setSocket: (v) => set((s) => ({ socketConnected: v, status: recompute({ ...s, socketConnected: v }) })),
  setOnline: (v) => set((s) => ({ online: v, status: recompute({ ...s, online: v }) })),
  syncStarted: () => set((s) => ({ syncing: true, status: recompute({ ...s, syncing: true }) })),
  syncFinished: (ok) =>
    set((s) => ({
      syncing: false,
      lastSyncFailed: !ok,
      lastSyncedAt: ok ? Date.now() : s.lastSyncedAt,
      status: recompute({ ...s, syncing: false, lastSyncFailed: !ok }),
    })),
}))

/**
 * Wire the browser/socket signals to a resync callback. Returns an unsubscribe.
 * Resync fires on: socket reconnect (not the very first connect: the page already loaded), coming back online, the tab/tablet becoming
 * visible again, and a slow safety poll (covers a socket that looks connected but is half-dead behind a proxy).
 */
export function watchConnection(
  socket: { connected: boolean; on: (e: string, f: (...a: unknown[]) => void) => unknown; off: (e: string, f: (...a: unknown[]) => void) => unknown },
  resync: () => void,
  opts: { pollMs?: number } = {},
): () => void {
  const store = useConnectionStore.getState()
  store.setSocket(socket.connected)
  store.setOnline(typeof navigator === 'undefined' ? true : navigator.onLine !== false)

  let firstConnect = socket.connected
  const onConnect = () => {
    useConnectionStore.getState().setSocket(true)
    if (firstConnect) resync() // a RE-connect: events may have been missed while down
    firstConnect = true
  }
  const onDisconnect = () => useConnectionStore.getState().setSocket(false)
  const onOnline = () => {
    useConnectionStore.getState().setOnline(true)
    resync()
  }
  const onOffline = () => useConnectionStore.getState().setOnline(false)
  const onVisible = () => {
    if (typeof document !== 'undefined' && !document.hidden) resync()
  }

  socket.on('connect', onConnect)
  socket.on('disconnect', onDisconnect)
  socket.on('connect_error', onDisconnect)
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    document.addEventListener('visibilitychange', onVisible)
  }
  const poll = opts.pollMs ?? 45_000
  const timer = poll > 0 && typeof window !== 'undefined' ? window.setInterval(() => { if (!document.hidden) resync() }, poll) : undefined

  return () => {
    socket.off('connect', onConnect)
    socket.off('disconnect', onDisconnect)
    socket.off('connect_error', onDisconnect)
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      document.removeEventListener('visibilitychange', onVisible)
    }
    if (timer) window.clearInterval(timer)
  }
}
