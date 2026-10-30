// ─────────────────────────────────────────────────────────────────────────────
// useKdsStore – Kitchen Display System state connected to Pangat API
// Real-time kitchen tickets queue, status transitions, audio chime, and 86 items.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type { Order, OrderStatus } from '@/types/domain'
import { api } from '@/lib/api'
import { getSocket, joinKdsRoom } from '@/lib/socket'

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
  wakeLockActive: boolean
  chimeCount: number
  outOfStockIds: Set<string>
  isLoading: boolean

  // ── Async API sync ─────────────────────────────────────────────────────────
  fetchTickets: (slug?: string) => Promise<void>
  initSocketSync: (slug?: string) => void

  // ── Mutations ──────────────────────────────────────────────────────────────
  addTicket: (order: Order) => void
  advanceTicket: (orderId: string) => Promise<void>
  sendBackTicket: (orderId: string, targetStatus: OrderStatus, reason: string) => Promise<void>
  archiveTicket: (orderId: string) => Promise<void>
  toggleOutOfStock: (menuItemId: string) => Promise<void>
  setSoundEnabled: (v: boolean) => void
  setWakeLockActive: (v: boolean) => void

  // ── Selectors ──────────────────────────────────────────────────────────────
  ticketsByStatus: (status: KdsTicketStatus) => Order[]
}

let kdsSocketListening = false

export const useKdsStore = create<KdsStore>((set, get) => ({
  tickets: [],
  soundEnabled: true,
  wakeLockActive: false,
  chimeCount: 0,
  outOfStockIds: new Set<string>(),
  isLoading: false,

  fetchTickets: async (slug?: string) => {
    if (!slug) {
      set({ tickets: [], isLoading: false })
      return
    }
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const [orders, menuItems] = await Promise.all([
        api.orders.list(slug).catch(() => []),
        api.menu.getItems().catch(() => []),
      ])

      const kdsTickets = Array.isArray(orders) ? orders.filter((o) => o && o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED') : []
      const outOfStock = new Set(
        Array.isArray(menuItems) ? menuItems.filter((m) => m && !m.isAvailable).map((m) => m.id) : []
      )

      set({
        tickets: kdsTickets,
        outOfStockIds: outOfStock,
        isLoading: false,
      })

      get().initSocketSync(slug)
    } catch (err) {
      console.error('Failed to fetch KDS tickets:', err)
      set({ isLoading: false })
    }
  },

  initSocketSync: (slug?: string) => {
    if (!slug) return
    joinKdsRoom(slug)
    if (kdsSocketListening) return
    kdsSocketListening = true

    const socket = getSocket()

    socket.on('order:new', (order: Order) => {
      set((s) => ({
        tickets: [order, ...s.tickets.filter((t) => t.id !== order.id)],
        chimeCount: s.soundEnabled ? s.chimeCount + 1 : s.chimeCount,
      }))
    })

    socket.on('order:status', ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      set((s) => {
        if (status === 'COMPLETED' || status === 'CANCELLED') {
          return { tickets: s.tickets.filter((t) => t.id !== orderId) }
        }
        const updated = s.tickets.map((t) =>
          t.id === orderId ? { ...t, orderStatus: status } : t
        )
        const becameReady = status === 'READY'
        return {
          tickets: updated,
          chimeCount: becameReady && s.soundEnabled ? s.chimeCount + 1 : s.chimeCount,
        }
      })
    })

    socket.on('order:updated', (order: Order) => {
      set((s) => ({
        tickets: s.tickets.map((t) => (t.id === order.id ? { ...t, ...order } : t)),
      }))
    })
  },

  addTicket: (order) =>
    set((s) => ({
      tickets: [order, ...s.tickets],
      chimeCount: s.soundEnabled ? s.chimeCount + 1 : s.chimeCount,
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
      console.error(`Failed to regress ticket ${orderId}:`, err)
      // Re-fetch to rollback on failure
      const slug = get().tickets[0]?.restaurantId
      if (slug) get().fetchTickets(slug)
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
      const becameReady = nextStatus === 'READY'
      return {
        tickets: filtered,
        chimeCount: becameReady && s.soundEnabled ? s.chimeCount + 1 : s.chimeCount,
      }
    })

    try {
      await api.orders.updateStatus(orderId, nextStatus)
    } catch (err) {
      console.error(`Failed to advance ticket ${orderId} via API:`, err)
    }
  },

  archiveTicket: async (orderId) => {
    set((s) => ({
      tickets: s.tickets.filter((t) => t.id !== orderId),
    }))

    try {
      await api.orders.updateStatus(orderId, 'COMPLETED')
    } catch (err) {
      console.error(`Failed to archive ticket ${orderId} via API:`, err)
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
      console.error(`Failed to toggle out of stock for ${menuItemId}:`, err)
    }
  },

  setSoundEnabled: (v) => set({ soundEnabled: v }),
  setWakeLockActive: (v) => set({ wakeLockActive: v }),

  ticketsByStatus: (status) =>
    get().tickets.filter((t) => t.orderStatus === status),
}))
