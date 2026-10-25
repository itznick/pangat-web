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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
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
