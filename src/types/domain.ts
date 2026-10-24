// ─────────────────────────────────────────────────────────────────────────────
// Pangat – Core Domain Types
// Aligned with upcoming NestJS entity contracts.
// All string-union enums use SCREAMING_SNAKE_CASE to match backend.
// ─────────────────────────────────────────────────────────────────────────────

// ── Restaurant ────────────────────────────────────────────────────────────────

export interface Restaurant {
  id: string
  name: string
  slug: string
  /** UPI Virtual Payment Address, e.g. pangat.bandra@icici */
  upiVpa: string
  /** GST percentage applied at checkout, e.g. 5 */
  gstPercentage: number
  isVegOnly: boolean
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

export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'COMPLETED'

export interface Order {
  id: string
  restaurantId: string
  tableNumber: string
  items: OrderItem[]
  totalAmount: number
  gstAmount: number
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  createdAt: Date
}

// ── Menu Category (lightweight, used for nav) ─────────────────────────────────

export interface MenuCategory {
  id: string
  name: string
  sortOrder: number
}
