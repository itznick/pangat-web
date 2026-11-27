// ─────────────────────────────────────────────────────────────────────────────
// useCartStore & useOrderTrackingStore – Diner state with Session Persistence
// Restores active cart and table session across accidental browser refresh.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Order, OrderItem, SelectedModifier, OrderStatus, OrderFeedback } from '@/types/domain'

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
  /** Drop cart lines whose dish is not on the live menu (e.g. a cart saved before the menu was rebuilt). Returns how many were removed. */
  pruneMissing: (validMenuItemIds: Iterable<string>) => number
  setDietaryFilter: (filter: DietaryFilter) => void

  // ── Computed selectors ─────────────────────────────────────────────────────
  itemCount: () => number
  subtotal: () => number
  gstAmount: (gstPct: number) => number
  /** Service charge is a % of the food subtotal, shown as its own line */
  serviceChargeAmount: (svcPct: number) => number
  total: (gstPct: number, svcPct?: number) => number

  // ── Serialise for order placement ─────────────────────────────────────────
  toOrderItems: () => OrderItem[]
}

// ── Implementation ─────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** The server accepts 1-99 of a line and at most 60 lines per order; the cart enforces the same so the guest never meets a cryptic error. */
export const MAX_LINE_QTY = 99

const sameLine = (a: Omit<CartEntry, '_localId'>, b: CartEntry) =>
  a.menuItemId === b.menuItemId &&
  (a.notes || '').trim() === (b.notes || '').trim() &&
  a.selectedModifiers.length === b.selectedModifiers.length &&
  [...a.selectedModifiers].map((m) => `${m.name}|${m.price}`).sort().join(',') ===
    [...b.selectedModifiers].map((m) => `${m.name}|${m.price}`).sort().join(',')

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      entries: [],
      dietaryFilter: 'ALL',

      // ── Mutations ────────────────────────────────────────────────────────────

      // Adding the same dish with the same choices again raises its quantity instead of piling up identical lines
      addItem: (item) =>
        set((s) => {
          const existing = s.entries.find((e) => sameLine(item, e))
          if (existing) {
            return {
              entries: s.entries.map((e) =>
                e === existing ? { ...e, quantity: Math.min(MAX_LINE_QTY, e.quantity + Math.max(1, item.quantity)) } : e
              ),
            }
          }
          return { entries: [...s.entries, { ...item, quantity: Math.min(MAX_LINE_QTY, Math.max(1, item.quantity)), _localId: uid() }] }
        }),

      removeItem: (localId) =>
        set((s) => ({
          entries: s.entries.filter((e) => e._localId !== localId),
        })),

      incrementItem: (localId) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e._localId === localId ? { ...e, quantity: Math.min(MAX_LINE_QTY, e.quantity + 1) } : e
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
          const modSum = e.selectedModifiers.reduce((s, m) => s + Number(m.price || 0), 0)
          return sum + (Number(e.price || 0) + modSum) * Number(e.quantity || 1)
        }, 0),

      gstAmount: (gstPct) => {
        const sub = get().subtotal()
        return Math.round(sub * (gstPct / 100) * 100) / 100
      },

      serviceChargeAmount: (svcPct) => {
        const sub = get().subtotal()
        return Math.round(sub * ((svcPct || 0) / 100) * 100) / 100
      },

      total: (gstPct, svcPct = 0) => {
        const sub = get().subtotal()
        const gst = get().gstAmount(gstPct)
        const svc = get().serviceChargeAmount(svcPct)
        return Math.round((sub + gst + svc) * 100) / 100
      },

      // ── Serialise for order placement ─────────────────────────────────────────

      pruneMissing: (validMenuItemIds) => {
        const valid = new Set(validMenuItemIds)
        const before = get().entries.length
        const kept = get().entries.filter((e) => valid.has(e.menuItemId))
        if (kept.length !== before) set({ entries: kept })
        return before - kept.length
      },

      toOrderItems: (): OrderItem[] =>
        get().entries.map((entry) => {
          // the server needs the order line, not the client-only bookkeeping fields
          const line: Record<string, unknown> = { ...entry }
          delete line._localId
          delete line.isVeg
          return line as unknown as OrderItem
        }),
    }),
    {
      name: 'pangat_diner_cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        entries: state.entries,
        dietaryFilter: state.dietaryFilter,
      }),
    }
  )
)

// ─────────────────────────────────────────────────────────────────────────────
// useOrderTrackingStore – tracks a placed order with persistence
// ─────────────────────────────────────────────────────────────────────────────

interface OrderTrackingStore {
  order: Order | null
  /** Set immediately after successful order placement */
  placeOrder: (order: Order) => void
  /** Simulate backend status push (RECEIVED -> PREPARING -> READY -> COMPLETED) */
  advanceStatus: () => void
  /** Pay counter bill online via UPI */
  payOnlineUpi: () => void
  /** Submit 5-star customer experience feedback */
  submitFeedback: (feedback: Omit<OrderFeedback, 'submittedAt'>) => void
  clear: () => void
}

const STATUS_PROGRESSION: OrderStatus[] = [
  'RECEIVED',
  'PREPARING',
  'READY',
  'COMPLETED',
]

export const useOrderTrackingStore = create<OrderTrackingStore>()(
  persist(
    (set, get) => ({
      order: null,

      placeOrder: (order) => set({ order }),

      advanceStatus: () => {
        const { order } = get()
        if (!order) return
        const idx = STATUS_PROGRESSION.indexOf(order.orderStatus)
        if (idx < STATUS_PROGRESSION.length - 1) {
          const nextStatus = STATUS_PROGRESSION[idx + 1]
          set({
            order: { ...order, orderStatus: nextStatus },
          })
        }
      },

      payOnlineUpi: () => {
        const { order } = get()
        if (!order) return
        set({
          order: {
            ...order,
            paymentStatus: 'PAID',
            paymentMethod: 'UPI_INSTANT',
          },
        })
      },

      submitFeedback: (feedback) => {
        const { order } = get()
        if (!order) return
        set({
          order: {
            ...order,
            feedback: {
              ...feedback,
              submittedAt: new Date(),
            },
          },
        })
      },

      clear: () => set({ order: null }),
    }),
    {
      name: 'pangat_diner_order_session',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
