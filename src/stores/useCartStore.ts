// ─────────────────────────────────────────────────────────────────────────────
// useCartStore – Diner cart state
// Manages the in-session cart for a single diner browsing a restaurant menu.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type { OrderItem, SelectedModifier } from '@/types/domain'

// ── Local cart entry (extends OrderItem with a client-side key) ───────────────

export interface CartEntry extends OrderItem {
  /** Client-only UUID — used for React keying and targeted mutations */
  _localId: string
  /** Mirror of MenuItem.isVeg for dietary filter display */
  isVeg: boolean
}

// ── Dietary filter (UI concern stored here to co-locate with cart) ────────────

export type DietaryFilter = 'ALL' | 'VEG' | 'NON_VEG'

// ── Store shape ────────────────────────────────────────────────────────────────

interface CartStore {
  entries: CartEntry[]
  dietaryFilter: DietaryFilter

  // ── Mutations ──────────────────────────────────────────────────────────────
  addItem: (item: Omit<CartEntry, '_localId'>) => void
  removeItem: (localId: string) => void
  incrementItem: (localId: string) => void
  decrementItem: (localId: string) => void
  updateModifiers: (localId: string, mods: SelectedModifier[]) => void
  clearCart: () => void
  setDietaryFilter: (filter: DietaryFilter) => void

  // ── Computed selectors ─────────────────────────────────────────────────────
  itemCount: () => number
  subtotal: () => number
  gstAmount: (gstPct: number) => number
  total: (gstPct: number) => number

  // ── Serialise for order placement ─────────────────────────────────────────
  toOrderItems: () => OrderItem[]
}

// ── Implementation ─────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export const useCartStore = create<CartStore>((set, get) => ({
  entries: [],
  dietaryFilter: 'ALL',

  // ── Mutations ────────────────────────────────────────────────────────────

  addItem: (item) =>
    set((s) => ({
      entries: [...s.entries, { ...item, _localId: uid() }],
    })),

  removeItem: (localId) =>
    set((s) => ({
      entries: s.entries.filter((e) => e._localId !== localId),
    })),

  incrementItem: (localId) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e._localId === localId ? { ...e, quantity: e.quantity + 1 } : e
      ),
    })),

  decrementItem: (localId) =>
    set((s) => ({
      entries: s.entries
        .map((e) =>
          e._localId === localId ? { ...e, quantity: e.quantity - 1 } : e
        )
        .filter((e) => e.quantity > 0),
    })),

  updateModifiers: (localId, mods) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e._localId === localId ? { ...e, selectedModifiers: mods } : e
      ),
    })),

  clearCart: () => set({ entries: [] }),

  setDietaryFilter: (filter) => set({ dietaryFilter: filter }),

  // ── Computed selectors ─────────────────────────────────────────────────────

  itemCount: () =>
    get().entries.reduce((sum, e) => sum + e.quantity, 0),

  subtotal: () =>
    get().entries.reduce((sum, e) => {
      const modSum = e.selectedModifiers.reduce((s, m) => s + m.price, 0)
      return sum + (e.price + modSum) * e.quantity
    }, 0),

  gstAmount: (gstPct) => {
    const sub = get().subtotal()
    return Math.round(sub * (gstPct / 100) * 100) / 100
  },

  total: (gstPct) => {
    const sub = get().subtotal()
    const gst = get().gstAmount(gstPct)
    return Math.round((sub + gst) * 100) / 100
  },

  // ── Serialise for order placement ─────────────────────────────────────────

  toOrderItems: (): OrderItem[] =>
    get().entries.map(({ _localId, isVeg, ...rest }) => rest),
}))

// ─────────────────────────────────────────────────────────────────────────────
// useOrderTrackingStore – tracks a single placed order from the diner's view
// ─────────────────────────────────────────────────────────────────────────────

import type { Order, OrderStatus } from '@/types/domain'

interface OrderTrackingStore {
  order: Order | null
  /** Set immediately after successful order placement */
  placeOrder: (order: Order) => void
  /** Simulate backend status push — used by mock/dev until WebSocket is live */
  advanceStatus: () => void
  clear: () => void
}

const STATUS_PROGRESSION: OrderStatus[] = [
  'RECEIVED',
  'PREPARING',
  'READY',
  'COMPLETED',
]

export const useOrderTrackingStore = create<OrderTrackingStore>((set, get) => ({
  order: null,

  placeOrder: (order) => set({ order }),

  advanceStatus: () => {
    const { order } = get()
    if (!order) return
    const idx = STATUS_PROGRESSION.indexOf(order.orderStatus)
    if (idx < STATUS_PROGRESSION.length - 1) {
      set({
        order: { ...order, orderStatus: STATUS_PROGRESSION[idx + 1] },
      })
    }
  },

  clear: () => set({ order: null }),
}))
