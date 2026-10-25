import axios from 'axios'
import type {
  Restaurant,
  Table,
  MenuItem,
  MenuCategory,
  Order,
  TableStatus,
  OrderStatus,
  PaymentMethod,
} from '@/types/domain'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pangat_access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to unwrap Pangat standard envelope: { success, statusCode, message, data }
apiClient.interceptors.response.use(
  (response) => {
    // If backend returned standard envelope with data property, return data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data
    }
    return response.data
  },
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg))
  }
)

export interface PublicMenuResponse {
  restaurant: Restaurant
  categories: MenuCategory[]
  items: MenuItem[]
}

export interface CreateOrderPayload {
  restaurantSlug: string
  tableNumber: string
  paymentMethod?: PaymentMethod
  customerPhone?: string
  items: {
    menuItemId: string
    name: string
    price: number
    quantity: number
    selectedModifiers?: { name: string; price: number }[]
    notes?: string
  }[]
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }): Promise<{ accessToken: string; user: any }> =>
      apiClient.post('/auth/login', credentials),
  },

  // Restaurants
  restaurants: {
    get: (slug: string): Promise<Restaurant> =>
      apiClient.get(`/restaurants/${slug}`),
    updateSettings: (slug: string, settings: Partial<Restaurant>): Promise<Restaurant> =>
      apiClient.patch(`/restaurants/${slug}/settings`, settings),
  },

  // Tables
  tables: {
    list: (restaurantId?: string): Promise<Table[]> =>
      apiClient.get('/tables', { params: { restaurantId } }),
    get: (id: string): Promise<Table> =>
      apiClient.get(`/tables/${id}`),
    updateStatus: (id: string, status: TableStatus): Promise<Table> =>
      apiClient.patch(`/tables/${id}/status`, { status }),
  },

  // Menu
  menu: {
    getPublic: (restaurantSlug: string): Promise<PublicMenuResponse> =>
      apiClient.get(`/menu/public/${restaurantSlug}`),
    getItems: (restaurantId?: string): Promise<MenuItem[]> =>
      apiClient.get('/menu/items', { params: { restaurantId } }),
    updateAvailability: (id: string, isAvailable: boolean): Promise<MenuItem> =>
      apiClient.patch(`/menu/items/${id}/availability`, { isAvailable }),
    updatePrice: (id: string, price: number): Promise<MenuItem> =>
      apiClient.patch(`/menu/items/${id}/price`, { price }),
  },

  // Orders
  orders: {
    create: (data: CreateOrderPayload, idempotencyKey: string): Promise<Order> =>
      apiClient.post('/orders', data, {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
        },
      }),
    list: (restaurantSlug?: string): Promise<Order[]> =>
      apiClient.get('/orders', { params: { restaurantSlug } }),
    get: (id: string): Promise<Order> =>
      apiClient.get(`/orders/${id}`),
    updateStatus: (id: string, status: OrderStatus): Promise<Order> =>
      apiClient.patch(`/orders/${id}/status`, { status }),
    markPaid: (id: string): Promise<Order> =>
      apiClient.patch(`/orders/${id}/mark-paid`),
  },
}
