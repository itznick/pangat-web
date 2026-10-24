// ─────────────────────────────────────────────────────────────────────────────
// useAdminStore – Owner / Manager ERP state
// Live floor table map, today's sales summary, active order feed,
// and menu item availability / price management.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type { Restaurant, Table, TableStatus, MenuItem, Order, PaymentStatus } from '@/types/domain'
import {
  MOCK_RESTAURANT,
  MOCK_TABLES,
  MOCK_MENU_ITEMS,
  ADMIN_ORDERS,
  MOCK_SALES_SUMMARY,
} from '@/data/mockData'

export interface SalesSummary {
  totalRevenue: number
  totalCovers: number
  avgPrepTimeMinutes: number
  activeKotCount: number
}

interface AdminStore {
  restaurant: Restaurant
  tables: Table[]
  menuItems: MenuItem[]
  activeOrders: Order[]
  todaySales: SalesSummary

  // ── Table floor management ─────────────────────────────────────────────────
  updateTableStatus: (tableId: string, status: TableStatus) => void

  // ── Menu management ────────────────────────────────────────────────────────
  toggleMenuAvailability: (menuItemId: string) => void
  updateMenuPrice: (menuItemId: string, price: number) => void
  addMenuItem: (item: MenuItem) => void

  // ── Order / settlement actions ─────────────────────────────────────────────
  addOrder: (order: Order) => void
  settleOrder: (orderId: string, paymentStatus: PaymentStatus) => void

  // ── Outlet switching ───────────────────────────────────────────────────────
  setRestaurantName: (name: string) => void

  // ── Selectors ──────────────────────────────────────────────────────────────
  tableByNumber: (tableNumber: string) => Table | undefined
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  restaurant: MOCK_RESTAURANT,
  tables: MOCK_TABLES,
  menuItems: MOCK_MENU_ITEMS,
  activeOrders: ADMIN_ORDERS,
  todaySales: MOCK_SALES_SUMMARY,

  updateTableStatus: (tableId, status) =>
    set((s) => ({
      tables: s.tables.map((t) =>
        t.id === tableId ? { ...t, status } : t
      ),
    })),

  toggleMenuAvailability: (menuItemId) =>
    set((s) => ({
      menuItems: s.menuItems.map((m) =>
        m.id === menuItemId ? { ...m, isAvailable: !m.isAvailable } : m
      ),
    })),

  updateMenuPrice: (menuItemId, price) =>
    set((s) => ({
      menuItems: s.menuItems.map((m) =>
        m.id === menuItemId ? { ...m, price } : m
      ),
    })),

  addMenuItem: (item) =>
    set((s) => ({
      menuItems: [item, ...s.menuItems],
    })),

  addOrder: (order) =>
    set((s) => ({
      activeOrders: [order, ...s.activeOrders],
      todaySales: {
        ...s.todaySales,
        totalRevenue: s.todaySales.totalRevenue + order.totalAmount,
        totalCovers: s.todaySales.totalCovers + 1,
        activeKotCount: s.todaySales.activeKotCount + 1,
      },
    })),

  settleOrder: (orderId, paymentStatus) =>
    set((s) => ({
      activeOrders: s.activeOrders.map((o) =>
        o.id === orderId
          ? { ...o, paymentStatus, orderStatus: 'COMPLETED' as const }
          : o
      ),
    })),

  setRestaurantName: (name) =>
    set((s) => ({
      restaurant: { ...s.restaurant, name },
    })),

  tableByNumber: (tableNumber) =>
    get().tables.find((t) => t.tableNumber === tableNumber),
}))
