// ─────────────────────────────────────────────────────────────────────────────
// Pangat – Core Domain Types
// Aligned with upcoming NestJS entity contracts.
// All string-union enums use SCREAMING_SNAKE_CASE to match backend.
// ─────────────────────────────────────────────────────────────────────────────

// ── Restaurant ────────────────────────────────────────────────────────────────

export type UserRole = 'PLATFORM_SUPER_ADMIN' | 'SUPER_OWNER' | 'STORE_MANAGER' | 'CHEF' | 'STEWARD'

export interface Organization {
  id: string
  name: string
  ownerId?: string
  createdAt?: string
  updatedAt?: string
  outlets?: Restaurant[]
}

export interface StaffUser {
  id: string
  name: string
  email: string
  role: UserRole
  isPlatformAdmin?: boolean
  organizationId?: string
  organizationName?: string
  restaurantId?: string | null
  restaurantSlug?: string
  pinCode?: string
}

export interface Restaurant {
  id: string
  organizationId?: string
  name: string
  slug: string
  branchArea?: string
  /** UPI Virtual Payment Address, e.g. pangat.bandra@icici */
  upiVpa: string
  /** GST percentage applied at checkout, e.g. 5 */
  gstPercentage: number
  isVegOnly: boolean
  isActive?: boolean
  gstin?: string | null
  hsnSac?: string
  phone?: string
  email?: string
  kdsNewOrderAlert?: boolean
  orderReadyChime?: boolean
  outOfStockNotification?: boolean
}

// ── Table ─────────────────────────────────────────────────────────────────────

export type TableStatus = 'VACANT' | 'OCCUPIED' | 'PREPPING' | 'SERVED'

export interface Table {
  id: string
  restaurantId: string
  tableNumber: string
  qrCodeUrl: string
  status: TableStatus
}

// ── Menu ──────────────────────────────────────────────────────────────────────

export interface ModifierOption {
  name: string
  /** Additional price on top of base item price */
  price: number
}

export interface Modifier {
  id: string
  name: string
  /** SINGLE = radio group (choose one), MULTIPLE = checkbox group (choose many) */
  type: 'SINGLE' | 'MULTIPLE'
  isRequired: boolean
  options: ModifierOption[]
}

export interface MenuItem {
  id: string
  /** Foreign key → MenuCategory.id */
  categoryId: string
  name: string
  description: string
  price: number
  isVeg: boolean
  isAvailable: boolean
  /** Emoji character used in lieu of a real URL in mock data */
  imageUrl: string
  isPopular?: boolean
  modifiers: Modifier[]
}

// ── Order ─────────────────────────────────────────────────────────────────────

export interface SelectedModifier {
  name: string
  price: number
}

export interface OrderItem {
  menuItemId: string
  name: string
  /** Base price at time of order placement (snapshot) */
  price: number
  quantity: number
  selectedModifiers: SelectedModifier[]
  notes?: string
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'

export type PaymentMethod = 'UPI_INSTANT' | 'PAY_AT_COUNTER'

export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'COMPLETED'

export interface OrderFeedback {
  rating: number
  tags: string[]
  comment?: string
  submittedAt: Date | string
}

export interface CustomerReviewItem {
  id: string
  orderId?: string
  tableNumber: string
  rating: number
  tags: string[]
  comment?: string
  createdAt: string | Date
}

export interface CustomerFeedbackSummary {
  restaurantSlug: string
  restaurantName: string
  averageRating: number
  totalCount: number
  ratingBreakdown: Record<number, number>
  tagCounts: Record<string, number>
  recentReviews: CustomerReviewItem[]
}

export interface OrderQueryParams {
  restaurantSlug?: string
  status?: string
  paymentStatus?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface Order {
  id: string
  restaurantId: string
  tableNumber: string
  items: OrderItem[]
  totalAmount: number
  gstAmount: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  customerPhone?: string
  orderStatus: OrderStatus
  feedback?: OrderFeedback
  settledAt?: Date | string
  createdAt: Date | string
}

// ── Menu Category (lightweight, used for nav) ─────────────────────────────────

export interface MenuCategory {
  id: string
  name: string
  sortOrder: number
}

// ── Multi-Tenant Onboarding Types ─────────────────────────────────────────────

export interface OnboardPayload {
  // Step 1: Brand & Super Owner
  brandName: string
  ownerFullName: string
  mobileNumber: string
  email: string
  password: string

  // Step 2: Outlet Details
  outletName: string
  branchArea?: string
  slug: string
  upiVpa: string
  gstin?: string
  gstPercentage?: number

  // Step 3: Floor Batch Generator
  indoorTableCount: number
  outdoorTableCount: number

  // Step 4: Starter Menu Choice
  menuPreset: 'pune_cafe' | 'south_indian' | 'empty'

  // Step 5: Team & Roles
  teamMode: 'solo' | 'with_team'
  storeManager?: {
    name: string
    email: string
    password: string
  }
  kitchenPin?: string
}

export interface OnboardResponseData {
  organization: Organization
  superOwner: StaffUser
  outlet: Restaurant
  tables: Table[]
  menuItemsCount: number
  accessToken: string
}

// ── Lead Capture & Platform Admin Types ──────────────────────────────────────

export type LeadStatus = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'ONBOARDED'

export interface Lead {
  id: string
  name: string
  restaurantName: string
  phone: string
  city: string
  tableCount: string
  status: LeadStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface PlatformMetrics {
  totalOrganizations: number
  totalOutlets: number
  activeOutlets: number
  totalOrders: number
  systemGmv: number
  totalLeads: number
  newLeads: number
  systemHealth: {
    status: string
    database: string
    gateway: string
    uptimeSeconds: number
    timestamp: string
  }
}

export interface ProvisionPayload {
  brandName: string
  ownerFullName: string
  email: string
  mobileNumber: string
  password?: string
  outletName: string
  slug: string
  branchArea?: string
  upiVpa: string
  gstin?: string
  gstPercentage?: number
  indoorTableCount?: number
  outdoorTableCount?: number
  menuPreset?: 'pune_cafe' | 'south_indian' | 'blank'
  leadId?: string
}

export interface ProvisionResult {
  success: boolean
  message: string
  organization: {
    id: string
    name: string
  }
  outlet: {
    id: string
    name: string
    slug: string
    branchArea?: string
    upiVpa: string
    phone?: string
  }
  ownerCredentials: {
    name: string
    email: string
    temporaryPassword: string
    loginUrl: string
  }
  batchTablesCreated: number
  menuItemsSeeded: number
  qrKitLink: string
}

export interface AdminOrganizationItem {
  id: string
  name: string
  createdAt: string
  owner: {
    id: string | null
    name: string
    email: string
    phone: string
  }
  outletsCount: number
  activeOutletsCount: number
  outlets: {
    id: string
    name: string
    slug: string
    branchArea?: string
    isActive: boolean
    upiVpa: string
  }[]
  totalGmv: number
  totalOrders: number
  status: 'ACTIVE' | 'INACTIVE'
}

export interface AdminOutletItem {
  id: string
  name: string
  slug: string
  branchArea: string
  phone: string
  email: string
  upiVpa: string
  gstPercentage: number
  isActive: boolean
  organizationId: string
  organizationName: string
  tablesCount: number
  activeOrdersCount: number
  isOnline: boolean
}

export interface DetailedSystemHealth {
  status: string
  database: {
    status: string
    latencyMs: number
    client: string
  }
  websocket: {
    connectedClients: number
    activeOutletRooms: string[]
  }
  server: {
    uptimeSeconds: number
    nodeVersion: string
    memoryRssMb: number
    memoryHeapUsedMb: number
    timestamp: string
  }
}
