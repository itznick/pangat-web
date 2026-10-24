// ─────────────────────────────────────────────────────────────────────────────
// useKdsStore – Kitchen Display System state
// Manages the live ticket queue, status progression, audio chime flag,
// and the 86/sold-out set for menu items.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type { Order, OrderStatus } from '@/types/domain'
import { KDS_ORDERS } from '@/data/mockData'

// ── KDS-visible status subset ─────────────────────────────────────────────────
/** Orders with these statuses are shown on the board. */
export type KdsTicketStatus = Extract<OrderStatus, 'RECEIVED' | 'PREPARING' | 'READY'>

// ── Store shape ───────────────────────────────────────────────────────────────

interface KdsStore {
  tickets: Order[]
  soundEnabled: boolean
  wakeLockActive: boolean
  /** Incremented each time a ticket transitions to READY or new order arrives — UI watches to chime */
  chimeCount: number
  /** Set of menuItem IDs marked 86'd / sold-out by the kitchen */
  outOfStockIds: Set<string>

  // ── Mutations ──────────────────────────────────────────────────────────────
  /** Add a new order from diner checkout */
  addTicket: (order: Order) => void
  /** Advance: RECEIVED → PREPARING → READY → removes (COMPLETED) */
  advanceTicket: (orderId: string) => void
  /** Remove a ticket from the board (mark COMPLETED) */
  archiveTicket: (orderId: string) => void
  toggleOutOfStock: (menuItemId: string) => void
  setSoundEnabled: (v: boolean) => void
  setWakeLockActive: (v: boolean) => void

  // ── Selectors ──────────────────────────────────────────────────────────────
  ticketsByStatus: (status: KdsTicketStatus) => Order[]
}

const ADVANCE: Record<KdsTicketStatus, OrderStatus> = {
  RECEIVED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COMPLETED',
}

export const useKdsStore = create<KdsStore>((set, get) => ({
  tickets: KDS_ORDERS,
  soundEnabled: true,
  wakeLockActive: false,
  chimeCount: 0,
  outOfStockIds: new Set<string>(['item-009']), // item-009 is Focaccia Margherita (initial 86)

  addTicket: (order) =>
    set((s) => ({
      tickets: [order, ...s.tickets],
      chimeCount: s.soundEnabled ? s.chimeCount + 1 : s.chimeCount,
    })),

  advanceTicket: (orderId) =>
    set((s) => {
      const tickets = s.tickets.map((t) => {
        if (t.id !== orderId) return t
        const next = ADVANCE[t.orderStatus as KdsTicketStatus] ?? t.orderStatus
        return { ...t, orderStatus: next }
      })
      // Remove COMPLETED tickets from the board
      const filtered = tickets.filter((t) => t.orderStatus !== 'COMPLETED')
      // Chime when a ticket just became READY
      const becameReady = tickets.some(
        (t) => t.id === orderId && t.orderStatus === 'READY'
      )
      return {
        tickets: filtered,
        chimeCount: becameReady && s.soundEnabled ? s.chimeCount + 1 : s.chimeCount,
      }
    }),

  archiveTicket: (orderId) =>
    set((s) => ({
      tickets: s.tickets.filter((t) => t.id !== orderId),
    })),

  toggleOutOfStock: (menuItemId) =>
    set((s) => {
      const next = new Set(s.outOfStockIds)
      if (next.has(menuItemId)) {
        next.delete(menuItemId)
      } else {
        next.add(menuItemId)
      }
      return { outOfStockIds: next }
    }),

  setSoundEnabled: (v) => set({ soundEnabled: v }),
  setWakeLockActive: (v) => set({ wakeLockActive: v }),

  ticketsByStatus: (status) =>
    get().tickets.filter((t) => t.orderStatus === status),
}))
