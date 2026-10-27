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
import { getSocket, joinKdsRoom, joinAdminRoom } from '@/lib/socket'

import { useAuthStore } from './useAuthStore'
import { isSameTableNumber } from '@/lib/utils'

export interface SalesSummary {
  totalRevenue: number
  totalCovers: number
  avgPrepTimeMinutes: number
  activeKotCount: number
}

const DEFAULT_RESTAURANT: Restaurant = {
  id: '',
  name: '',
  slug: '',
  upiVpa: '',
  gstPercentage: 5,
  isVegOnly: false,
}

const DEFAULT_SALES: SalesSummary = {
  totalRevenue: 0,
  totalCovers: 0,
  avgPrepTimeMinutes: 0,
  activeKotCount: 0,
}

function computeSalesSummary(orders: Order[]): SalesSummary {
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID')
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
  const totalCovers = orders.length
  const activeOrders = orders.filter((o) => o.orderStatus !== 'COMPLETED')
  const activeKotCount = activeOrders.length

  let avgPrepTimeMinutes = 0
  if (orders.length > 0) {
    const totalElapsedMins = orders.reduce((sum, o) => {
      const ms = Date.now() - new Date(o.createdAt).getTime()
      return sum + Math.max(1, Math.round(ms / 60_000))
    }, 0)
    avgPrepTimeMinutes = Math.min(60, Math.round(totalElapsedMins / orders.length))
  }

  return {
    totalRevenue,
    totalCovers,
    avgPrepTimeMinutes,
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
  addTable: (tableNumber: string) => Promise<Table>
  deleteTable: (tableId: string) => Promise<void>

  // ── Menu management ────────────────────────────────────────────────────────
  toggleMenuAvailability: (menuItemId: string) => Promise<void>
  updateMenuPrice: (menuItemId: string, price: number) => Promise<void>
  addMenuItem: (item: MenuItem) => Promise<void>
  updateMenuItem: (item: MenuItem) => Promise<void>
  addCategory: (name: string) => Promise<MenuCategory>
  deleteCategory: (id: string) => Promise<void>

  // ── Settings management ────────────────────────────────────────────────────
  updateSettings: (settings: Partial<Restaurant>, slug?: string) => Promise<void>

  // ── Order / settlement actions ─────────────────────────────────────────────
  addOrder: (order: Order) => void
  settleOrder: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>
  archiveOrder: (orderId: string) => Promise<void>

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

  fetchDashboardData: async (slug?: string) => {
    const targetSlug = slug || useAuthStore.getState().currentOutlet?.slug || ''
    if (!targetSlug) {
      set({
        restaurant: DEFAULT_RESTAURANT,
        tables: [],
        categories: [],
        categoryNameMap: {},
        menuItems: [],
        activeOrders: [],
        todaySales: DEFAULT_SALES,
        isLoading: false,
      })
      return
    }
    if (get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const restaurantData = await api.restaurants.get(targetSlug).catch(() => DEFAULT_RESTAURANT)
      const restId = restaurantData?.id || undefined

      const [tablesData, publicMenuData, ordersData] = await Promise.all([
        api.tables.list(restId).catch(() => []),
        api.menu.getPublic(targetSlug).catch(() => ({ restaurant: DEFAULT_RESTAURANT, categories: [], items: [] })),
        api.orders.list(targetSlug).catch(() => []),
      ])

      const sales = computeSalesSummary(ordersData)
      const categoriesList = publicMenuData.categories || []
      const catMap = Object.fromEntries(categoriesList.map((c) => [c.id, c.name]))

      // Synchronize table status with real live orders to prevent stale 'PREPPING' flags
      const synchronizedTables = tablesData.map((t) => {
        const tableOrders = ordersData.filter((o) => isSameTableNumber(o.tableNumber, t.tableNumber))
        const openOrders = tableOrders.filter((o) => o.orderStatus !== 'COMPLETED')
        if (openOrders.length > 0) {
          const hasCooking = openOrders.some((o) => o.orderStatus === 'RECEIVED' || o.orderStatus === 'PREPARING')
          if (hasCooking) return { ...t, status: 'PREPPING' as TableStatus }
          const hasUnpaid = openOrders.some((o) => o.paymentStatus === 'PENDING')
          return { ...t, status: (hasUnpaid ? 'OCCUPIED' : 'SERVED') as TableStatus }
        }
        if (t.status === 'PREPPING') {
          return { ...t, status: 'VACANT' as TableStatus }
        }
        return t
      })

      set({
        restaurant: restaurantData || publicMenuData.restaurant || DEFAULT_RESTAURANT,
        tables: synchronizedTables,
        categories: categoriesList,
        categoryNameMap: catMap,
        menuItems: publicMenuData.items || [],
        activeOrders: ordersData,
        todaySales: sales,
        isLoading: false,
      })

      get().initSocketSync(targetSlug)
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  initSocketSync: (slug = 'pangat') => {
    joinKdsRoom(slug)
    joinAdminRoom(slug)
    if (socketListening) return
    socketListening = true

    const socket = getSocket()

    socket.on('order:new', (order: Order) => {
      set((s) => {
        const nextOrders = [order, ...s.activeOrders.filter((o) => o.id !== order.id)]
        const nextTables = s.tables.map((t) =>
          isSameTableNumber(t.tableNumber, order.tableNumber) ? { ...t, status: 'PREPPING' as TableStatus } : t
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
        const targetOrder = nextOrders.find((o) => o.id === orderId)
        let nextTables = s.tables
        if (targetOrder) {
          const tableOrders = nextOrders.filter((o) => isSameTableNumber(o.tableNumber, targetOrder.tableNumber))
          const openOrders = tableOrders.filter((o) => o.orderStatus !== 'COMPLETED')
          let nextTableStatus: TableStatus = 'VACANT'
          if (openOrders.length > 0) {
            const hasCooking = openOrders.some((o) => o.orderStatus === 'RECEIVED' || o.orderStatus === 'PREPARING')
            if (hasCooking) {
              nextTableStatus = 'PREPPING'
            } else {
              const hasUnpaid = openOrders.some((o) => o.paymentStatus === 'PENDING')
              nextTableStatus = hasUnpaid ? 'OCCUPIED' : 'SERVED'
            }
          }
          nextTables = s.tables.map((t) =>
            isSameTableNumber(t.tableNumber, targetOrder.tableNumber) ? { ...t, status: nextTableStatus } : t
          )
        }
        return {
          activeOrders: nextOrders,
          tables: nextTables,
          todaySales: computeSalesSummary(nextOrders),
        }
      })
    })

    socket.on('order:paid', ({ orderId }: { orderId: string }) => {
      set((s) => {
        const nextOrders = s.activeOrders.map((o) =>
          o.id === orderId ? { ...o, paymentStatus: 'PAID' as PaymentStatus } : o
        )
        const targetOrder = nextOrders.find((o) => o.id === orderId)
        let nextTables = s.tables
        if (targetOrder) {
          const tableOrders = nextOrders.filter((o) => isSameTableNumber(o.tableNumber, targetOrder.tableNumber))
          const openOrders = tableOrders.filter((o) => o.orderStatus !== 'COMPLETED')
          let nextTableStatus: TableStatus = 'VACANT'
          if (openOrders.length > 0) {
            const hasCooking = openOrders.some((o) => o.orderStatus === 'RECEIVED' || o.orderStatus === 'PREPARING')
            if (hasCooking) {
              nextTableStatus = 'PREPPING'
            } else {
              const hasUnpaid = openOrders.some((o) => o.paymentStatus === 'PENDING')
              nextTableStatus = hasUnpaid ? 'OCCUPIED' : 'SERVED'
            }
          }
          nextTables = s.tables.map((t) =>
            isSameTableNumber(t.tableNumber, targetOrder.tableNumber) ? { ...t, status: nextTableStatus } : t
          )
        }
        return {
          activeOrders: nextOrders,
          tables: nextTables,
          todaySales: computeSalesSummary(nextOrders),
        }
      })
    })
    socket.on('table:status', (updatedTable: Table) => {
      set((s) => ({
        tables: s.tables.map((t) =>
          t.id === updatedTable.id || isSameTableNumber(t.tableNumber, updatedTable.tableNumber)
            ? { ...t, status: updatedTable.status }
            : t
        ),
      }))
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

  addTable: async (tableNumber: string) => {
    const restaurantId = get().restaurant.id || useAuthStore.getState().currentOutlet?.id
    if (!restaurantId) throw new Error("No active outlet selected")
    const created = await api.tables.create({ restaurantId, tableNumber })
    set((s) => ({
      tables: [...s.tables, created].sort((a, b) =>
        a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true })
      ),
    }))
    return created
  },

  deleteTable: async (tableId: string) => {
    await api.tables.delete(tableId)
    set((s) => ({
      tables: s.tables.filter((t) => t.id !== tableId),
    }))
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

  addMenuItem: async (item) => {
    // Optimistic UI update
    set((s) => ({
      menuItems: [item, ...s.menuItems],
    }))

    try {
      const restId = get().restaurant.id || useAuthStore.getState().currentOutlet?.id
      const restSlug = get().restaurant.slug || useAuthStore.getState().currentOutlet?.slug || ''
      const created = await api.menu.createItem({
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        isVeg: item.isVeg,
        imageUrl: item.imageUrl,
        restaurantId: restId,
        restaurantSlug: restSlug,
        modifiers: item.modifiers,
      })
      if (created?.id) {
        set((s) => ({
          menuItems: s.menuItems.map((m) => (m.id === item.id ? { ...created } : m)),
        }))
      }
    } catch (err) {
      console.error('Failed to create dish via API:', err)
    }
  },

  updateMenuItem: async (item) => {
    // Optimistic UI update
    set((s) => ({
      menuItems: s.menuItems.map((m) => (m.id === item.id ? item : m)),
    }))

    try {
      await api.menu.updateItem(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        isVeg: item.isVeg,
        imageUrl: item.imageUrl,
        modifiers: item.modifiers,
      })
    } catch (err) {
      console.error('Failed to update dish via API:', err)
    }
  },

  addCategory: async (name: string) => {
    const restaurantId = get().restaurant.id || useAuthStore.getState().currentOutlet?.id
    const restaurantSlug = get().restaurant.slug || useAuthStore.getState().currentOutlet?.slug || ''
    const sortOrder = get().categories.length + 1
    const created = await api.menu.createCategory({ name, restaurantId, restaurantSlug, sortOrder })
    set((s) => ({
      categories: [...s.categories, created],
      categoryNameMap: { ...s.categoryNameMap, [created.id]: created.name },
    }))
    return created
  },

  deleteCategory: async (id: string) => {
    await api.menu.deleteCategory(id)
    set((s) => {
      const nextCats = s.categories.filter((c) => c.id !== id)
      const nextMap = { ...s.categoryNameMap }
      delete nextMap[id]
      return { categories: nextCats, categoryNameMap: nextMap }
    })
  },

  updateSettings: async (settings, slug = 'pangat') => {
    set((s) => ({
      restaurant: { ...s.restaurant, ...settings },
    }))

    try {
      const updated = await api.restaurants.updateSettings(slug, settings)
      if (updated) {
        set((s) => ({
          restaurant: { ...s.restaurant, ...updated },
        }))
      }
    } catch (err) {
      console.error('Failed to update settings via API:', err)
      throw err
    }
  },

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
          ? { ...o, paymentStatus }
          : o
      )
      const targetOrder = s.activeOrders.find((o) => o.id === orderId)
      let nextTables = s.tables
      if (targetOrder) {
        const tableOrders = nextOrders.filter((o) => isSameTableNumber(o.tableNumber, targetOrder.tableNumber))
        const openOrders = tableOrders.filter((o) => o.orderStatus !== 'COMPLETED')
        let nextTableStatus: TableStatus = 'VACANT'
        if (openOrders.length > 0) {
          const hasCooking = openOrders.some((o) => o.orderStatus === 'RECEIVED' || o.orderStatus === 'PREPARING')
          if (hasCooking) {
            nextTableStatus = 'PREPPING'
          } else {
            const hasUnpaid = openOrders.some((o) => o.paymentStatus === 'PENDING')
            nextTableStatus = hasUnpaid ? 'OCCUPIED' : 'SERVED'
          }
        }
        nextTables = s.tables.map((t) =>
          isSameTableNumber(t.tableNumber, targetOrder.tableNumber) ? { ...t, status: nextTableStatus } : t
        )
      }
      return {
        activeOrders: nextOrders,
        tables: nextTables,
        todaySales: computeSalesSummary(nextOrders),
      }
    })

    try {
      if (paymentStatus === 'PAID') {
        await api.orders.markPaid(orderId)
      }
    } catch (err) {
      console.error('Failed to settle order via API:', err)
    }
  },

  archiveOrder: async (orderId) => {
    set((s) => {
      const nextOrders = s.activeOrders.map((o) =>
        o.id === orderId
          ? { ...o, orderStatus: 'COMPLETED' as const }
          : o
      )
      const targetOrder = s.activeOrders.find((o) => o.id === orderId)
      let nextTables = s.tables
      if (targetOrder) {
        const tableOrders = nextOrders.filter((o) => isSameTableNumber(o.tableNumber, targetOrder.tableNumber))
        const openOrders = tableOrders.filter((o) => o.orderStatus !== 'COMPLETED')
        let nextTableStatus: TableStatus = 'VACANT'
        if (openOrders.length > 0) {
          const hasCooking = openOrders.some((o) => o.orderStatus === 'RECEIVED' || o.orderStatus === 'PREPARING')
          if (hasCooking) {
            nextTableStatus = 'PREPPING'
          } else {
            const hasUnpaid = openOrders.some((o) => o.paymentStatus === 'PENDING')
            nextTableStatus = hasUnpaid ? 'OCCUPIED' : 'SERVED'
          }
        } else {
          nextTableStatus = 'VACANT'
        }
        nextTables = s.tables.map((t) =>
          isSameTableNumber(t.tableNumber, targetOrder.tableNumber) ? { ...t, status: nextTableStatus } : t
        )
      }
      return {
        activeOrders: nextOrders,
        tables: nextTables,
      }
    })

    try {
      await api.orders.updateStatus(orderId, 'COMPLETED')
    } catch (err) {
      console.error('Failed to archive order via API:', err)
    }
  },

  setRestaurantName: (name) =>
    set((s) => ({
      restaurant: { ...s.restaurant, name },
    })),

  tableByNumber: (tableNumber) =>
    get().tables.find((t) => isSameTableNumber(t.tableNumber, tableNumber)),
}))
