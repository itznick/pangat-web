// ─────────────────────────────────────────────────────────────────────────────
// useAdminStore – Owner / Manager ERP state connected to Pangat API
// Real-time table states, menu manager, orders ledger, and sales summary.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type {
  Restaurant,
  Table,
  TableStatus,
  MenuItem,
  MenuCategory,
  Order,
  PaymentStatus,
} from '@/types/domain'
import { api } from '@/lib/api'
import { getSocket, joinKdsRoom } from '@/lib/socket'

export interface SalesSummary {
  totalRevenue: number
  totalCovers: number
  avgPrepTimeMinutes: number
  activeKotCount: number
}

const DEFAULT_RESTAURANT: Restaurant = {
  id: '',
  name: 'The Pangat',
  slug: 'pangat',
  upiVpa: 'pangat.bandra@icici',
  gstPercentage: 5,
  isVegOnly: false,
}

const DEFAULT_SALES: SalesSummary = {
  totalRevenue: 0,
  totalCovers: 0,
  avgPrepTimeMinutes: 10,
  activeKotCount: 0,
}

function computeSalesSummary(orders: Order[]): SalesSummary {
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID')
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const totalCovers = orders.length
  const activeKotCount = orders.filter((o) => o.orderStatus !== 'COMPLETED').length

  return {
    totalRevenue,
    totalCovers,
    avgPrepTimeMinutes: 11,
    activeKotCount,
  }
}

interface AdminStore {
  restaurant: Restaurant
  tables: Table[]
  menuItems: MenuItem[]
  categories: MenuCategory[]
  activeOrders: Order[]
  todaySales: SalesSummary
  isLoading: boolean
  error: string | null

  // ── Async Data Load ────────────────────────────────────────────────────────
  fetchDashboardData: (slug?: string) => Promise<void>
  initSocketSync: (slug?: string) => void

  // ── Table floor management ─────────────────────────────────────────────────
  updateTableStatus: (tableId: string, status: TableStatus) => Promise<void>

  // ── Menu management ────────────────────────────────────────────────────────
  toggleMenuAvailability: (menuItemId: string) => Promise<void>
  updateMenuPrice: (menuItemId: string, price: number) => Promise<void>
  addMenuItem: (item: MenuItem) => void

  // ── Order / settlement actions ─────────────────────────────────────────────
  addOrder: (order: Order) => void
  settleOrder: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>

  // ── Outlet switching ───────────────────────────────────────────────────────
  setRestaurantName: (name: string) => void

  // ── Selectors ──────────────────────────────────────────────────────────────
  tableByNumber: (tableNumber: string) => Table | undefined
  categoryNameMap: Record<string, string>
}

let socketListening = false

export const useAdminStore = create<AdminStore>((set, get) => ({
  restaurant: DEFAULT_RESTAURANT,
  tables: [],
  menuItems: [],
  categories: [],
  categoryNameMap: {},
  activeOrders: [],
  todaySales: DEFAULT_SALES,
  isLoading: false,
  error: null,

  fetchDashboardData: async (slug = 'pangat') => {
    if (get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const [restaurantData, tablesData, publicMenuData, ordersData] = await Promise.all([
        api.restaurants.get(slug).catch(() => DEFAULT_RESTAURANT),
        api.tables.list().catch(() => []),
        api.menu.getPublic(slug).catch(() => ({ restaurant: DEFAULT_RESTAURANT, categories: [], items: [] })),
        api.orders.list(slug).catch(() => []),
      ])

      const sales = computeSalesSummary(ordersData)
      const categoriesList = publicMenuData.categories || []
      const catMap = Object.fromEntries(categoriesList.map((c) => [c.id, c.name]))

      set({
        restaurant: restaurantData || publicMenuData.restaurant || DEFAULT_RESTAURANT,
        tables: tablesData,
        categories: categoriesList,
        categoryNameMap: catMap,
        menuItems: publicMenuData.items || [],
        activeOrders: ordersData,
        todaySales: sales,
        isLoading: false,
      })

      get().initSocketSync(slug)
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  initSocketSync: (slug = 'pangat') => {
    joinKdsRoom(slug)
    if (socketListening) return
    socketListening = true

    const socket = getSocket()

    socket.on('order:new', (order: Order) => {
      set((s) => {
        const nextOrders = [order, ...s.activeOrders.filter((o) => o.id !== order.id)]
        const nextTables = s.tables.map((t) =>
          t.tableNumber === order.tableNumber ? { ...t, status: 'PREPPING' as TableStatus } : t
        )
        return {
          activeOrders: nextOrders,
          tables: nextTables,
          todaySales: computeSalesSummary(nextOrders),
        }
      })
    })

    socket.on('order:status', ({ orderId, status }: { orderId: string; status: any }) => {
      set((s) => {
        const nextOrders = s.activeOrders.map((o) =>
          o.id === orderId ? { ...o, orderStatus: status } : o
        )
        return {
          activeOrders: nextOrders,
          todaySales: computeSalesSummary(nextOrders),
        }
      })
    })

    socket.on('order:paid', ({ orderId }: { orderId: string }) => {
      set((s) => {
        const nextOrders = s.activeOrders.map((o) =>
          o.id === orderId ? { ...o, paymentStatus: 'PAID' as PaymentStatus } : o
        )
        return {
          activeOrders: nextOrders,
          todaySales: computeSalesSummary(nextOrders),
        }
      })
    })
  },

  updateTableStatus: async (tableId, status) => {
    // Optimistic UI update
    set((s) => ({
      tables: s.tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
    }))

    try {
      await api.tables.updateStatus(tableId, status)
    } catch (err) {
      console.error('Failed to update table status via API:', err)
    }
  },

  toggleMenuAvailability: async (menuItemId) => {
    const item = get().menuItems.find((m) => m.id === menuItemId)
    if (!item) return
    const nextAvailability = !item.isAvailable

    // Optimistic UI update
    set((s) => ({
      menuItems: s.menuItems.map((m) =>
        m.id === menuItemId ? { ...m, isAvailable: nextAvailability } : m
      ),
    }))

    try {
      await api.menu.updateAvailability(menuItemId, nextAvailability)
    } catch (err) {
      console.error('Failed to toggle menu availability via API:', err)
    }
  },

  updateMenuPrice: async (menuItemId, price) => {
    set((s) => ({
      menuItems: s.menuItems.map((m) =>
        m.id === menuItemId ? { ...m, price } : m
      ),
    }))

    try {
      await api.menu.updatePrice(menuItemId, price)
    } catch (err) {
      console.error('Failed to update menu price via API:', err)
    }
  },

  addMenuItem: (item) =>
    set((s) => ({
      menuItems: [item, ...s.menuItems],
    })),

  addOrder: (order) =>
    set((s) => {
      const nextOrders = [order, ...s.activeOrders]
      return {
        activeOrders: nextOrders,
        todaySales: computeSalesSummary(nextOrders),
      }
    }),

  settleOrder: async (orderId, paymentStatus) => {
    set((s) => {
      const nextOrders = s.activeOrders.map((o) =>
        o.id === orderId
          ? { ...o, paymentStatus, orderStatus: 'COMPLETED' as const }
          : o
      )
      return {
        activeOrders: nextOrders,
        todaySales: computeSalesSummary(nextOrders),
      }
    })

    try {
      if (paymentStatus === 'PAID') {
        await api.orders.markPaid(orderId)
      } else {
        await api.orders.updateStatus(orderId, 'COMPLETED')
      }
    } catch (err) {
      console.error('Failed to settle order via API:', err)
    }
  },

  setRestaurantName: (name) =>
    set((s) => ({
      restaurant: { ...s.restaurant, name },
    })),

  tableByNumber: (tableNumber) =>
    get().tables.find((t) => t.tableNumber === tableNumber),
}))
