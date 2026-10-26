import axios from 'axios'
import type {
  Organization,
  Restaurant,
  Table,
  MenuItem,
  MenuCategory,
  Order,
  TableStatus,
  OrderStatus,
  PaymentMethod,
  OnboardPayload,
  OnboardResponseData,
  StaffUser,
  Lead,
  LeadStatus,
  PlatformMetrics,
  ProvisionPayload,
  ProvisionResult,
  AdminOrganizationItem,
  AdminOutletItem,
  DetailedSystemHealth,
} from '@/types/domain'

export function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';

    // If accessed via mobile phone or LAN IP (e.g. 192.168.x.x), route to host machine IP
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return envUrl
          .replace(/\b(localhost|127\.0\.0\.1)\b/g, hostname)
          .replace(/\/+$/, '');
      }
      if (!envUrl) {
        return `${protocol}//${hostname}:4000/api/v1`;
      }
    }
  }

  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const protocol = window.location.protocol || 'http:';
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:4000/api/v1`;
  }

  return 'http://localhost:4000/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token and ensure dynamic host baseURL
apiClient.interceptors.request.use((config) => {
  config.baseURL = resolveApiBaseUrl();
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
    login: (credentials: { email?: string; password?: string; pinCode?: string }): Promise<{
      accessToken: string
      user: StaffUser
      organization?: Organization | null
      outlets?: Restaurant[]
    }> =>
      apiClient.post('/auth/login', credentials),
    onboard: (data: OnboardPayload): Promise<OnboardResponseData> =>
      apiClient.post('/auth/onboard', data),
    setupSuperAdmin: (data: { name: string; email: string; password: string; phone?: string }): Promise<{
      id: string
      name: string
      email: string
      role: string
      isPlatformAdmin: boolean
      action: string
    }> =>
      apiClient.post('/auth/setup-super-admin', data),
  },

  // Organizations
  organizations: {
    listOutlets: (): Promise<Restaurant[]> =>
      apiClient.get('/organizations/outlets'),
    createOutlet: (data: {
      name: string
      slug: string
      branchArea?: string
      upiVpa: string
      gstPercentage?: number
      tableCount?: number
      organizationId?: string
    }): Promise<Restaurant> =>
      apiClient.post('/organizations/outlets', data),
  },

  // Staff Management
  staff: {
    create: (
      restaurantId: string,
      data: {
        name: string
        email: string
        password?: string
        pinCode?: string
        role: 'SUPER_OWNER' | 'STORE_MANAGER' | 'CHEF' | 'STEWARD'
      }
    ): Promise<StaffUser> =>
      apiClient.post(`/restaurants/${restaurantId}/staff`, data),
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
    create: (data: { restaurantId: string; tableNumber: string }): Promise<Table> =>
      apiClient.post('/tables', data),
    delete: (id: string): Promise<{ id: string }> =>
      apiClient.delete(`/tables/${id}`),
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
    createItem: (data: Partial<MenuItem> & { categoryId: string; restaurantId?: string; restaurantSlug?: string }): Promise<MenuItem> =>
      apiClient.post('/menu/items', data),
    updateItem: (id: string, data: Partial<MenuItem>): Promise<MenuItem> =>
      apiClient.patch(`/menu/items/${id}`, data),
    createCategory: (data: { name: string; restaurantId?: string; restaurantSlug?: string; sortOrder?: number }): Promise<MenuCategory> =>
      apiClient.post('/menu/categories', data),
    deleteCategory: (id: string): Promise<{ id: string }> =>
      apiClient.delete(`/menu/categories/${id}`),
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

  // Leads (Public demo inquiries)
  leads: {
    create: (data: {
      name: string
      restaurantName: string
      phone: string
      city: string
      tableCount?: string
      notes?: string
    }): Promise<{ message: string; lead: Lead }> =>
      apiClient.post('/leads', data),
  },

  // Platform Ops / Super Admin
  admin: {
    getMetrics: (): Promise<PlatformMetrics> =>
      apiClient.get('/admin/metrics'),
    listLeads: (): Promise<Lead[]> =>
      apiClient.get('/admin/leads'),
    updateLead: (id: string, data: { status?: LeadStatus; notes?: string }): Promise<Lead> =>
      apiClient.patch(`/admin/leads/${id}`, data),
    provision: (data: ProvisionPayload): Promise<ProvisionResult> =>
      apiClient.post('/admin/provision', data),
    listOrganizations: (): Promise<AdminOrganizationItem[]> =>
      apiClient.get('/admin/organizations'),
    resetOrganizationPassword: (orgId: string): Promise<{
      success: boolean
      message: string
      ownerName: string
      ownerEmail: string
      temporaryPassword: string
      organizationName: string
    }> =>
      apiClient.post(`/admin/organizations/${orgId}/reset-password`),
    listOutlets: (): Promise<AdminOutletItem[]> =>
      apiClient.get('/admin/outlets'),
    getSystemHealth: (): Promise<DetailedSystemHealth> =>
      apiClient.get('/admin/system-health'),
  },
}
