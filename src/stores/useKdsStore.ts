// ─────────────────────────────────────────────────────────────────────────────
// useKdsStore – Kitchen Display System state connected to Pangat API
// Real-time kitchen tickets queue, status transitions, audio chime, and 86 items.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type { Order, OrderStatus } from '@/types/domain'
import { api, errMsg } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { getSocket, joinKdsRoom } from '@/lib/socket'
import { toast } from '@/components/ui/toast'
import { useConnectionStore } from '@/lib/connection'
import { reconcileTickets, isStaleEvent } from '@/lib/kdsMerge'
import { createWakeLock, browserEnv, type WakeLockState } from '@/lib/wakeLock'
import { unlockAudio, isAudioReady } from '@/lib/sound'

export type KdsTicketStatus = Extract<OrderStatus, 'RECEIVED' | 'PREPARING' | 'READY' | 'DISPATCHED'>

export function getNextKdsStatus(order: Order): OrderStatus {
  if (order.orderStatus === 'RECEIVED') return 'PREPARING'
  if (order.orderStatus === 'PREPARING') return 'READY'
  if (order.orderType === 'DELIVERY') {
    if (order.orderStatus === 'READY') return 'DISPATCHED'
    if (order.orderStatus === 'DISPATCHED') return 'COMPLETED'
  }
  return 'COMPLETED'
}

interface KdsStore {
  tickets: Order[]
  soundEnabled: boolean
  /** The browser will really play sound (tablet was tapped). False after a reload until "Enable kitchen sound" is tapped. */
  audioReady: boolean
  wakeLock: WakeLockState
  wakeLockDetail?: string
  /** The server refused the kitchen feed (plan / switch): the page shows the upgrade notice */
  accessDenied: boolean
  chimeCount: number
  outOfStockIds: Set<string>
  isLoading: boolean
  /** Outlet alert preferences (Settings > Kitchen & stock) */
  alertNewOrders: boolean
  alertReady: boolean
  alertStockOut: boolean
  /** Outlet's expected prep time (minutes) used for amber/red thresholds */
  prepTargetMinutes: number

  // ── Async API sync ─────────────────────────────────────────────────────────
  fetchTickets: (slug?: string) => Promise<void>
  /** Re-read the authoritative list after a gap (reconnect, wake, online). Never empties the board if the read fails. */
  resync: (slug?: string) => Promise<void>
  initSocketSync: (slug?: string) => void

  // ── Mutations ──────────────────────────────────────────────────────────────
  addTicket: (order: Order) => void
  advanceTicket: (orderId: string) => Promise<void>
  sendBackTicket: (orderId: string, targetStatus: OrderStatus, reason: string) => Promise<void>
  archiveTicket: (orderId: string) => Promise<void>
  toggleOutOfStock: (menuItemId: string) => Promise<void>
  setSoundEnabled: (v: boolean) => void
  enableAudio: () => Promise<void>
  setWakeLock: (on: boolean) => Promise<void>

  // ── Selectors ──────────────────────────────────────────────────────────────
  ticketsByStatus: (status: KdsTicketStatus) => Order[]
}

/** Tickets still in flight from earlier days stay visible, but we never pull the whole history. */
const recentWindowStart = () => new Date(Date.now() - 3 * 86_400_000).toISOString()

let kdsSocketListening = false
/** when each ticket last arrived over the socket: lets a refetch keep tickets newer than its snapshot */
const arrivedAt: Record<string, number> = {}
let resyncInFlight: Promise<void> | null = null
let wakeLockCtl: ReturnType<typeof createWakeLock> | null = null

/** The kitchen's tap did not reach the server: say so and reload the real queue (never show a fake state). */
function undoKds(err: unknown, what: string) {
  toast.error(errMsg(err, `Could not ${what}. Please try again.`))
  const slug = useAuthStore.getState().currentOutlet?.slug || useAuthStore.getState().user?.restaurantSlug
  if (slug) void useKdsStore.getState().fetchTickets(slug)
}

export const useKdsStore = create<KdsStore>((set, get) => ({
  tickets: [],
  soundEnabled: true,
  audioReady: isAudioReady(),
  wakeLock: 'inactive' as WakeLockState,
  accessDenied: false,
  chimeCount: 0,
  outOfStockIds: new Set<string>(),
  isLoading: false,
  alertNewOrders: true,
  alertReady: true,
  alertStockOut: true,
  prepTargetMinutes: 10,

  fetchTickets: async (slug?: string) => {
    if (!slug) {
      set({ tickets: [], isLoading: false })
      return
    }
    if (get().isLoading) return
    set({ isLoading: true })
    useConnectionStore.getState().syncStarted()
    try {
      const outlet = await api.restaurants.get(slug).catch(() => null)
      const [orders, menuItems] = await Promise.all([
        // not swallowed: if the order list cannot be read the board must say so, not show an empty kitchen
        api.orders.list(slug, { startDate: recentWindowStart(), limit: 100 }),
        outlet?.id ? api.menu.getItems(outlet.id).catch(() => []) : Promise.resolve([]),
      ])

      const kdsTickets = Array.isArray(orders) ? orders.filter((o) => o && o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED') : []
      const outOfStock = new Set(
        Array.isArray(menuItems) ? menuItems.filter((m) => m && !m.isAvailable).map((m) => m.id) : []
      )

      set({
        tickets: kdsTickets,
        outOfStockIds: outOfStock,
        isLoading: false,
        alertNewOrders: outlet?.kdsNewOrderAlert ?? true,
        alertReady: outlet?.orderReadyChime ?? true,
        alertStockOut: outlet?.outOfStockNotification ?? true,
        prepTargetMinutes: outlet?.operations?.avgPrepMinutes ?? 10,
      })

      useConnectionStore.getState().syncFinished(true)
      get().initSocketSync(slug)
    } catch (err) {
      console.error('Failed to fetch KDS tickets:', err)
      if ((err as { status?: number })?.status === 403 || (err as { status?: number })?.status === 402) set({ accessDenied: true })
      useConnectionStore.getState().syncFinished(false)
      set({ isLoading: false })
      get().initSocketSync(slug) // still join the live room: events that arrive are real
    }
  },

  resync: (slug?: string) => {
    const target = slug || useAuthStore.getState().currentOutlet?.slug || useAuthStore.getState().user?.restaurantSlug
    if (!target) return Promise.resolve()
    if (resyncInFlight) return resyncInFlight // overlapping triggers (reconnect + online + visible) collapse into one read
    const conn = useConnectionStore.getState()
    conn.syncStarted()
    const startedAt = Date.now()
    resyncInFlight = (async () => {
      try {
        joinKdsRoom(target) // make sure the live room is joined again with the current token
        // NOT swallowed: a failed read must leave the board as it is and say so, never show an empty kitchen
        const orders = await api.orders.list(target, { startDate: recentWindowStart(), limit: 100 })
        const list = Array.isArray(orders) ? orders : []
        set((s) => {
          const r = reconcileTickets(s.tickets, list, startedAt, arrivedAt)
          const ring = r.missedNew.length > 0 && s.soundEnabled && s.alertNewOrders
          return { tickets: r.tickets, accessDenied: false, chimeCount: ring ? s.chimeCount + 1 : s.chimeCount }
        })
        useConnectionStore.getState().syncFinished(true)
      } catch (err) {
        const status = (err as { status?: number })?.status
        // 401 is handled globally (sign-out); 403/402 means the kitchen feed was withdrawn: show the notice, keep the last known board
        if (status === 403 || status === 402) set({ accessDenied: true })
        useConnectionStore.getState().syncFinished(false)
      } finally {
        resyncInFlight = null
      }
    })()
    return resyncInFlight
  },

  enableAudio: async () => {
    const r = await unlockAudio()
    set({ audioReady: r === 'ready' })
    if (r !== 'ready') toast.error(r === 'unsupported' ? 'This browser cannot play kitchen sounds.' : 'The browser blocked sound. Tap the screen once and try again.')
  },

  setWakeLock: async (on) => {
    wakeLockCtl ??= createWakeLock(browserEnv(), (state, detail) => set({ wakeLock: state, wakeLockDetail: detail }))
    if (on) await wakeLockCtl.enable()
    else await wakeLockCtl.disable()
  },

  initSocketSync: (slug?: string) => {
    if (!slug) return
    joinKdsRoom(slug)
    if (kdsSocketListening) return
    kdsSocketListening = true

    const socket = getSocket()

    socket.on('order:new', (order: Order) => {
      arrivedAt[order.id] = Date.now()
      set((s) => {
        const already = s.tickets.some((t) => t.id === order.id) // a replayed event must not ring the kitchen twice
        return {
          tickets: [order, ...s.tickets.filter((t) => t.id !== order.id)],
          chimeCount: !already && s.soundEnabled && s.alertNewOrders ? s.chimeCount + 1 : s.chimeCount,
        }
      })
    })

    socket.on('menu:availability', (p: { id: string; name: string; isAvailable: boolean; auto: boolean }) => {
      set((s) => {
        const next = new Set(s.outOfStockIds)
        if (p.isAvailable) next.delete(p.id)
        else next.add(p.id)
        return { outOfStockIds: next }
      })
      if (get().alertStockOut) {
        toast.info(p.isAvailable ? `${p.name} is available again` : `${p.name} is sold out${p.auto ? ' (ingredient ran out)' : ''}`)
      }
    })

    socket.on('order:status', ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      set((s) => {
        if (status === 'COMPLETED' || status === 'CANCELLED') {
          return { tickets: s.tickets.filter((t) => t.id !== orderId) }
        }
        const updated = s.tickets.map((t) =>
          t.id === orderId ? { ...t, orderStatus: status } : t
        )
        // The kitchen display never chimes for READY: the cook just tapped it. The ready chime is for front-of-house (admin board).
        return { tickets: updated }
      })
    })

    socket.on('order:updated', (order: Order) => {
      set((s) => {
        if (isStaleEvent(s.tickets.find((t) => t.id === order.id), order)) return {} // older than what we already show
        return { tickets: s.tickets.map((t) => (t.id === order.id ? { ...t, ...order } : t)) }
      })
    })
  },

  addTicket: (order) =>
    set((s) => ({
      tickets: [order, ...s.tickets],
      chimeCount: s.soundEnabled && s.alertNewOrders ? s.chimeCount + 1 : s.chimeCount,
    })),

  sendBackTicket: async (orderId: string, targetStatus: OrderStatus, reason: string) => {
    // Optimistic regression
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === orderId ? { ...t, orderStatus: targetStatus } : t
      ),
    }))

    try {
      await api.orders.regressStatus(orderId, { targetStatus, reason })
    } catch (err) {
      undoKds(err, 'send the ticket back')
    }
  },

  advanceTicket: async (orderId) => {
    const currentTicket = get().tickets.find((t) => t.id === orderId)
    if (!currentTicket) return

    const nextStatus = getNextKdsStatus(currentTicket)

    // Optimistic update
    set((s) => {
      const tickets = s.tickets.map((t) => {
        if (t.id !== orderId) return t
        return { ...t, orderStatus: nextStatus }
      })
      const filtered = tickets.filter((t) => t.orderStatus !== 'COMPLETED')
      return { tickets: filtered }
    })

    try {
      await api.orders.updateStatus(orderId, nextStatus)
    } catch (err) {
      undoKds(err, 'move the ticket')
    }
  },

  archiveTicket: async (orderId) => {
    // a ticket with an unpaid bill stays on the board until the bill is settled
    const t = get().tickets.find((x) => x.id === orderId)
    if (t?.paymentStatus === 'PENDING') {
      toast.error('The bill is still unpaid. It can be archived once it is paid or settled by the cashier.')
      return
    }
    set((s) => ({
      tickets: s.tickets.filter((t) => t.id !== orderId),
    }))

    try {
      await api.orders.updateStatus(orderId, 'COMPLETED')
    } catch (err) {
      undoKds(err, 'close the ticket')
    }
  },

  toggleOutOfStock: async (menuItemId) => {
    const currentOut = get().outOfStockIds.has(menuItemId)
    const nextAvailability = currentOut // If currently out-of-stock, next is available (true)

    set((s) => {
      const next = new Set(s.outOfStockIds)
      if (next.has(menuItemId)) {
        next.delete(menuItemId)
      } else {
        next.add(menuItemId)
      }
      return { outOfStockIds: next }
    })

    try {
      await api.menu.updateAvailability(menuItemId, nextAvailability)
    } catch (err) {
      undoKds(err, 'change availability')
    }
  },

  setSoundEnabled: (v) => set({ soundEnabled: v }),

  ticketsByStatus: (status) =>
    get().tickets.filter((t) => t.orderStatus === status),
}))
