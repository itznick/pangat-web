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
  OrderType,
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
  CustomerFeedbackSummary,
  OrderQueryParams,
  Ingredient,
  StockMovement,
  StockMovementType,
  Recipe,
  InventoryAlerts,
  SubscriptionPlan,
  SubscriptionDetailsResponse,
  StaffMember,
  AuditLogEntry,
  SalesReport,
} from '@/types/domain'

export function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';

    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local') ||
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

    if (isLocalHost && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return envUrl
          .replace(/\b(localhost|127\.0\.0\.1)\b/g, hostname)
          .replace(/\/+$/, '');
      }
      return `${protocol}//${hostname}:4000/api/v1`;
    }

    if (!isLocalHost) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/+$/, '');
      }
      return 'https://pangat-api.onrender.com/api/v1';
    }
  }

  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  return 'http://localhost:4000/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();

/** Error thrown by every API call: carries the HTTP status and the server's machine-readable code. */
export class ApiError extends Error {
  status: number
  code?: string
  /** Server request id: quote it to support to find this exact request in the logs */
  requestId?: string
  /** Structured facts from the server, e.g. { limitKind, limit, current, requested } for PLAN_LIMIT_REACHED or { feature } for FEATURE_NOT_IN_PLAN */
  details?: Record<string, unknown>
  constructor(message: string, status = 0, code?: string, requestId?: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.details = details
  }
}

/** Best human-readable message for anything thrown by an API call. */
export function errMsg(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  // Server faults carry a reference so a person can quote it and we can find the exact request
  if (e instanceof ApiError && e.status >= 500 && e.requestId) return `${e.message || fallback} (Ref: ${e.requestId.slice(0, 8)})`
  if (e instanceof Error && e.message) return e.message
  return fallback
}

/** Tiny event hubs so the HTTP layer can tell the UI about plan limits / expired sessions without importing it. */
function hub<T = void>() {
  const fns = new Set<(v: T) => void>()
  return {
    on: (fn: (v: T) => void) => {
      fns.add(fn)
      return () => {
        fns.delete(fn)
      }
    },
    emit: (v: T) => fns.forEach((f) => f(v)),
  }
}
export const subscriptionGate = hub<ApiError>()
export const sessionGate = hub()
/** Suspended / deactivated restaurant account or platform maintenance mode (full-screen state) */
export const platformGate = hub<ApiError>()
export const passwordGate = hub()
export const twoFactorGate = hub()

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
    const data = error.response?.data
    const errorMsg =
      data?.message ||
      data?.error ||
      (error.code === 'ERR_NETWORK' ? 'Cannot reach the server. Check your connection and try again.' : error.message) ||
      'An unexpected error occurred'
    const apiError = new ApiError(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : String(errorMsg),
      error.response?.status ?? 0,
      data?.code,
      data?.requestId,
      data?.details && typeof data.details === 'object' ? data.details : undefined,
    )
    // A temporary password must be replaced before anything else works: send the person to the screen that does that
    if (apiError.code === 'PASSWORD_CHANGE_REQUIRED') passwordGate.emit()
    if (apiError.code === 'TWO_FACTOR_ENROLMENT_REQUIRED') twoFactorGate.emit()
    // A lapsed subscription / plan limit is a global condition, not a per-form error
    // (a request marked silentPlanGate is a background poll nobody asked for: the screen the user opens on purpose explains the refusal itself)
    if (apiError.status === 402 && !(error.config as { silentPlanGate?: boolean } | undefined)?.silentPlanGate) subscriptionGate.emit(apiError)
    if ((apiError.code === 'ACCOUNT_SUSPENDED' || apiError.code === 'ACCOUNT_DEACTIVATED' || apiError.code === 'MAINTENANCE_MODE') && localStorage.getItem('pangat_access_token') && !/\/auth\/login/.test(error.config?.url || '')) {
      platformGate.emit(apiError)
    }
    // An expired or revoked session on a protected call: sign out cleanly
    if (apiError.status === 401 && localStorage.getItem('pangat_access_token') && !/\/auth\//.test(error.config?.url || '')) {
      sessionGate.emit()
    }
    return Promise.reject(apiError)
  }
)

export interface PublicMenuResponse {
  restaurant: Restaurant
  categories: MenuCategory[]
  items: MenuItem[]
}

export interface CreateOrderPayload {
  restaurantSlug: string
  orderType?: OrderType
  tableNumber?: string
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  deliveryInstructions?: string
  /** The diner agreed to the Privacy Notice (required whenever personal details are sent) */
  consentAccepted?: boolean
  paymentMethod?: PaymentMethod
  items: {
    menuItemId: string
    name: string
    price: number
    quantity: number
    selectedModifiers?: { name: string; price: number }[]
    notes?: string
  }[]
}

/** The printable tax invoice returned by GET /orders/:id/bill (all values come from what was stored when the order was paid). */
export interface BillDocument {
  status: 'ISSUED' | 'PROVISIONAL'
  billNumber: string | null
  issuedAt: string | null
  restaurant: { name?: string; branchArea: string | null; phone: string | null; gstin: string | null; fssaiLicense: string | null; hsnSac: string }
  order: { id: string; type: string; table: string | null; createdAt: string; customerName: string | null }
  items: { name: string; quantity: number; unitPrice: number; amount: number; modifiers: string[] }[]
  taxableValue: number
  gst: { ratePercent: number; cgst: number; sgst: number; total: number }
  serviceCharge: number
  deliveryFee: number
  total: number
  payment: { method: string; status: string; settledAt: string | null }
  refundedAmount: number
  creditNotes: { number: string; amount: number; reason: string | null; issuedAt: string }[]
}

export interface PrivacyRequestPayload {
  kind: 'ACCESS' | 'CORRECTION' | 'ERASURE' | 'WITHDRAW_CONSENT' | 'GRIEVANCE' | 'NOMINATE'
  name: string
  contact: string
  restaurantRef?: string
  message?: string
  confirm: boolean
  /** honeypot field: always empty for real people */
  website?: string
}

/** Who Pangat's tax invoices are addressed to, and the state that decides CGST+SGST versus IGST. */
export interface BillingProfile { legalName: string | null; address: string | null; stateCode: string | null; gstin: string | null; supplierStateCode: string }

export const api = {
  privacy: {
    createRequest: (data: PrivacyRequestPayload): Promise<{ reference: string; dueDays: number }> =>
      apiClient.post('/privacy/requests', data),
  },
  // Auth
  auth: {
    login: (credentials: { email: string; password: string; otp?: string; totp?: string }): Promise<
      | { totpRequired: true; message?: string }
      | {
          accessToken: string
          user: StaffUser
          organization?: Organization | null
          outlets?: Restaurant[]
        }
      | { otpRequired: true; message?: string }
    > =>
      apiClient.post('/auth/login', credentials),
    kdsPinLogin: (credentials: { pinCode: string; outletSlug: string; station?: string }): Promise<{
      accessToken: string
      user: StaffUser
      organization?: Organization | null
      outlets?: Restaurant[]
      outlet?: Restaurant
    }> =>
      apiClient.post('/auth/kds-pin-login', credentials),
    me: (): Promise<{ id: string; name: string; email: string; phone?: string | null; role: string; totpEnabled?: boolean; lastLoginAt?: string | null }> =>
      apiClient.get('/auth/me'),
    updateProfile: (data: { name?: string; phone?: string }): Promise<unknown> =>
      apiClient.patch('/auth/me', data),
    changePassword: (data: { currentPassword: string; newPassword: string }): Promise<{ accessToken: string; message: string }> =>
      apiClient.post('/auth/change-password', data),
    twoFactorSetup: (): Promise<{ secret: string; otpauthUrl: string }> => apiClient.post('/auth/2fa/setup'),
    twoFactorEnable: (code: string): Promise<{ recoveryCodes: string[] }> => apiClient.post('/auth/2fa/enable', { code }),
    twoFactorDisable: (password: string, code: string): Promise<{ enabled: boolean }> => apiClient.post('/auth/2fa/disable', { password, code }),
    forgotPassword: (email: string): Promise<{ success: boolean; message: string }> =>
      apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, newPassword: string): Promise<{ success: boolean; message: string }> =>
      apiClient.post('/auth/reset-password', { token, newPassword }),
    /** Email a verification code before self-service sign-up. `required: false` means the platform does not ask for one. */
    requestSignupOtp: (email: string): Promise<{ required: boolean; message: string }> =>
      apiClient.post('/auth/signup-otp', { email }),
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

  // Staff Management (outlet owners)
  staff: {
    list: (restaurantId: string): Promise<StaffMember[]> =>
      apiClient.get(`/restaurants/${restaurantId}/staff`),
    create: (
      restaurantId: string,
      data: { name: string; email: string; password: string; phone?: string; role: StaffMember['role'] }
    ): Promise<StaffMember> =>
      apiClient.post(`/restaurants/${restaurantId}/staff`, data),
    update: (
      restaurantId: string,
      staffId: string,
      data: Partial<Pick<StaffMember, 'name' | 'phone' | 'role' | 'isActive'>>
    ): Promise<StaffMember> =>
      apiClient.patch(`/restaurants/${restaurantId}/staff/${staffId}`, data),
    /** A personal kitchen PIN: the chef signs in on the kitchen screen with it and their name is recorded on what they do */
    setPin: (restaurantId: string, staffId: string, pin: string): Promise<{ staffId: string; hasPin: boolean }> =>
      apiClient.post(`/restaurants/${restaurantId}/staff/${staffId}/pin`, { pin }),
    resetPassword: (restaurantId: string, staffId: string): Promise<{ staffId: string; email: string; temporaryPassword: string }> =>
      apiClient.post(`/restaurants/${restaurantId}/staff/${staffId}/reset-password`),
  },

  // Kitchen station PIN
  kitchenPin: {
    status: (restaurantId: string): Promise<{ configured: boolean }> =>
      apiClient.get(`/restaurants/${restaurantId}/kitchen-pin`),
    set: (restaurantId: string, pin: string): Promise<{ configured: boolean }> =>
      apiClient.post(`/restaurants/${restaurantId}/kitchen-pin`, { pin }),
  },

  // Audit trail & reports
  audit: {
    list: (
      restaurantId: string,
      params?: { entityType?: string; action?: string; page?: number; limit?: number }
    ): Promise<{ items: AuditLogEntry[]; total: number; page: number; limit: number }> =>
      apiClient.get(`/restaurants/${restaurantId}/audit-logs`, { params }),
    /** Owner only: recent sign-in attempts (successful and failed) for the team */
    signIns: (restaurantId: string): Promise<{ email: string; success: boolean; reason?: string | null; ip?: string | null; userAgent?: string | null; createdAt: string }[]> =>
      apiClient.get(`/restaurants/${restaurantId}/sign-ins`),
    /** Owner only: every time Pangat staff opened this outlet's data */
    platformAccess: (restaurantId: string): Promise<{ actorName?: string | null; actorRole?: string | null; action: string; area?: string | null; createdAt: string }[]> =>
      apiClient.get(`/restaurants/${restaurantId}/platform-access`),
  },
  reports: {
    summary: (restaurantSlug: string, from?: string, to?: string): Promise<SalesReport> =>
      apiClient.get('/reports/summary', { params: { restaurantSlug, from, to } }),
  },

  // Restaurants
  restaurants: {
    get: (slug: string): Promise<Restaurant> =>
      apiClient.get(`/restaurants/${slug}`),
    updateSettings: (slug: string, settings: Partial<Restaurant>): Promise<Restaurant> =>
      apiClient.patch(`/restaurants/${slug}/settings`, settings),
    confirmUpi: (outletId: string, vpa: string): Promise<{ confirmed: boolean; confirmedAt: string }> =>
      apiClient.post(`/restaurants/${outletId}/upi/confirm`, { vpa }),
    getFeedback: (slug: string): Promise<CustomerFeedbackSummary> =>
      apiClient.get(`/restaurants/${slug}/feedback`),
    submitFeedback: (
      slug: string,
      data: { orderId: string; token?: string; tableNumber?: string; rating: number; tags?: string[]; comment?: string }
    ): Promise<unknown> =>
      apiClient.post(`/restaurants/${slug}/feedback`, data),
  },

  // Tables
  tables: {
    list: (restaurantId?: string): Promise<Table[]> =>
      apiClient.get('/tables', { params: { restaurantId } }),
    get: (id: string): Promise<Table> =>
      apiClient.get(`/tables/${id}`),
    /** `limitOverrideReason` is honoured only for an authorised platform administrator (the API refuses it for anyone else). */
    create: (data: { restaurantId: string; tableNumber: string; limitOverrideReason?: string }): Promise<Table> =>
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
    deleteItem: (id: string): Promise<{ id: string }> =>
      apiClient.delete(`/menu/items/${id}`),
    updateCategory: (id: string, data: { name?: string; sortOrder?: number }): Promise<MenuCategory> =>
      apiClient.patch(`/menu/categories/${id}`, data),
    deleteCategory: (id: string): Promise<{ id: string }> =>
      apiClient.delete(`/menu/categories/${id}`),
  },

  // Orders
  orders: {
    bill: (id: string, token?: string): Promise<BillDocument> =>
      apiClient.get(`/orders/${id}/bill`, { params: token ? { token } : undefined }),
    create: (data: CreateOrderPayload, idempotencyKey: string): Promise<Order> =>
      apiClient.post('/orders', data, {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
        },
      }),
    list: (restaurantSlug?: string, params?: OrderQueryParams): Promise<Order[]> =>
      apiClient.get('/orders', { params: { restaurantSlug, ...params } }),
    get: (id: string, token?: string): Promise<Order> =>
      apiClient.get(`/orders/${id}`, { params: token ? { token } : undefined }),
    updateStatus: (id: string, status: OrderStatus): Promise<Order> =>
      apiClient.patch(`/orders/${id}/status`, { status }),
    regressStatus: (id: string, data: { targetStatus: OrderStatus; reason: string }): Promise<Order> =>
      apiClient.patch(`/orders/${id}/regress-status`, data),
    cancel: (id: string, data: { reason: string; notes?: string }): Promise<Order> =>
      apiClient.post(`/orders/${id}/cancel`, data),
    editItems: (id: string, data: {
      items: {
        menuItemId: string
        name: string
        price?: number
        quantity: number
        selectedModifiers?: { name: string; price?: number }[]
        notes?: string
      }[]
    }): Promise<Order> =>
      apiClient.patch(`/orders/${id}/items`, data),
    processRefund: (id: string, data: {
      refundMethod: 'COUNTER_CASH' | 'GATEWAY_VERIFIED'
      amount?: number
      reason: string
      idempotencyKey: string
      providerReference?: string
    }): Promise<Order> =>
      apiClient.post(`/orders/${id}/refund`, data),
    markPaid: (id: string): Promise<Order> =>
      apiClient.patch(`/orders/${id}/mark-paid`),
    submitFeedback: (
      id: string,
      data: { rating: number; tags?: string[]; comment?: string; token?: string }
    ): Promise<Order> =>
      apiClient.post(`/orders/${id}/feedback`, data),
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
      /** must be true: the Privacy Notice was accepted */
      consentAccepted: boolean
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

  // Restaurant Inventory & Recipes
  inventory: {
    listIngredients: (restaurantId: string, activeOnly?: boolean): Promise<Ingredient[]> =>
      apiClient.get('/inventory/ingredients', {
        params: { restaurantId, activeOnly: activeOnly ? 'true' : undefined },
      }),
    createIngredient: (data: {
      restaurantId: string
      name: string
      sku?: string
      unit: string
      openingStock?: number
      minimumStock?: number
      costPerUnit?: number
    }): Promise<Ingredient> =>
      apiClient.post('/inventory/ingredients', data),
    updateIngredient: (
      id: string,
      restaurantId: string,
      data: {
        name?: string
        sku?: string
        unit?: string
        minimumStock?: number
        costPerUnit?: number
        isActive?: boolean
      }
    ): Promise<Ingredient> =>
      apiClient.patch(`/inventory/ingredients/${id}`, data, {
        params: { restaurantId },
      }),
    adjustStock: (
      id: string,
      restaurantId: string,
      data: {
        quantityDelta: number
        reason: string
        type?: StockMovementType
      }
    ): Promise<{ ingredient: Ingredient; movement: StockMovement }> =>
      apiClient.post(`/inventory/ingredients/${id}/adjust`, data, {
        params: { restaurantId },
      }),
    receiveStock: (data: {
      restaurantId: string
      invoiceNumber?: string
      supplierName?: string
      items: Array<{
        ingredientId: string
        quantity: number
        costPerUnit?: number
        notes?: string
      }>
    }): Promise<{ receivedMovements: StockMovement[]; updatedIngredients: Ingredient[] }> =>
      apiClient.post('/inventory/receive', data),
    listMovements: (
      restaurantId: string,
      query?: {
        ingredientId?: string
        type?: StockMovementType
        startDate?: string
        endDate?: string
        page?: number
        limit?: number
      }
    ): Promise<{
      items: StockMovement[]
      total: number
      page: number
      limit: number
      totalPages: number
    }> =>
      apiClient.get('/inventory/movements', {
        params: { restaurantId, ...query },
      }),
    /** `background` = a poll the user did not ask for: a plan refusal (402) is then not announced with the global upgrade toast. */
    getAlerts: (restaurantId: string, opts?: { background?: boolean }): Promise<InventoryAlerts> =>
      apiClient.get('/inventory/alerts', {
        params: { restaurantId },
        ...(opts?.background ? { silentPlanGate: true } : {}),
      } as Record<string, unknown>),
    listRecipes: (restaurantId: string): Promise<Recipe[]> =>
      apiClient.get('/inventory/recipes', {
        params: { restaurantId },
      }),
    getRecipeForMenuItem: (menuItemId: string, restaurantId: string): Promise<Recipe> =>
      apiClient.get(`/inventory/recipes/menu-item/${menuItemId}`, {
        params: { restaurantId },
      }),
    upsertRecipe: (
      restaurantId: string,
      data: {
        menuItemId: string
        notes?: string
        ingredients: Array<{
          ingredientId: string
          quantity: number
          unit: string
        }>
      }
    ): Promise<Recipe> =>
      apiClient.post('/inventory/recipes', data, {
        params: { restaurantId },
      }),
  },

  // Multi-Tenant SaaS Subscriptions & Invoicing
  subscriptions: {
    listPlans: (): Promise<SubscriptionPlan[]> =>
      apiClient.get('/subscriptions/plans'),
    getMySubscription: (): Promise<SubscriptionDetailsResponse> =>
      apiClient.get('/subscriptions/my-subscription'),
    listAllPlansForAdmin: (): Promise<SubscriptionPlan[]> =>
      apiClient.get('/subscriptions/admin/plans'),
    createPlan: (data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> =>
      apiClient.post('/subscriptions/admin/plans', data),
    updatePlan: (id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> =>
      apiClient.patch(`/subscriptions/admin/plans/${id}`, data),
    billingProfile: (): Promise<BillingProfile> => apiClient.get('/subscriptions/billing-profile'),
    updateBillingProfile: (data: Partial<Omit<BillingProfile, 'supplierStateCode'>>): Promise<BillingProfile> => apiClient.patch('/subscriptions/billing-profile', data),
    cancel: (): Promise<unknown> => apiClient.post('/subscriptions/cancel'),
    resume: (): Promise<unknown> => apiClient.post('/subscriptions/resume'),
    requestChange: (planCode: string, message?: string): Promise<{ requested: boolean; plan: string }> =>
      apiClient.post('/subscriptions/request-change', { planCode, message }),
    adminOrganization: (orgId: string): Promise<SubscriptionDetailsResponse & { audit: { id: string; action: string; actor: string; reason: string; createdAt: string }[] }> =>
      apiClient.get(`/subscriptions/admin/organizations/${orgId}`),
    adminAssign: (orgId: string, data: { planCode: string; months: number; note?: string }): Promise<unknown> =>
      apiClient.post(`/subscriptions/admin/organizations/${orgId}/assign`, data),
  },
}
