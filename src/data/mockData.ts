// ─────────────────────────────────────────────────────────────────────────────
// Pangat – Comprehensive Mock Seed Data
// All types aligned with src/types/domain.ts for NestJS parity.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Restaurant,
  Table,
  MenuCategory,
  MenuItem,
  Order,
} from '@/types/domain'

// ── Restaurant ────────────────────────────────────────────────────────────────

export const MOCK_RESTAURANT: Restaurant = {
  id: 'rest-bandra-001',
  name: 'The Pangat',
  slug: 'pangat',
  upiVpa: 'pangat.bandra@icici',
  gstPercentage: 5,
  isVegOnly: false,
}

// ── Menu Categories ───────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: MenuCategory[] = [
  { id: 'cat-breakfast', name: 'All Day Breakfast', sortOrder: 1 },
  { id: 'cat-espresso',  name: 'Espresso & Brews',  sortOrder: 2 },
  { id: 'cat-breads',    name: 'Artisanal Breads',  sortOrder: 3 },
  { id: 'cat-beverages', name: 'Beverages',          sortOrder: 4 },
]

export const CATEGORY_NAME_MAP: Record<string, string> = Object.fromEntries(
  MOCK_CATEGORIES.map((c) => [c.id, c.name])
)

/** Ordered list of nav labels — "All" sentinel prepended. */
export const NAV_CATEGORY_IDS = ['all', ...MOCK_CATEGORIES.map((c) => c.id)]

// ── Menu Items ────────────────────────────────────────────────────────────────

export const MOCK_MENU_ITEMS: MenuItem[] = [
  // ── All Day Breakfast ──────────────────────────────────────────────────────
  {
    id: 'item-001',
    categoryId: 'cat-breakfast',
    name: 'Avocado Toast',
    description:
      'Smashed avocado on housemade sourdough, microgreens, chilli flakes, EVOO drizzle.',
    price: 220,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🥑',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-bread',
        name: 'Bread Choice',
        type: 'SINGLE',
        isRequired: true,
        options: [
          { name: 'Sourdough',   price: 0 },
          { name: 'Multigrain',  price: 0 },
          { name: 'Dark Rye',    price: 20 },
        ],
      },
      {
        id: 'mod-addons-avo',
        name: 'Add-ons',
        type: 'MULTIPLE',
        isRequired: false,
        options: [
          { name: 'Poached Egg',    price: 40 },
          { name: 'Turkey Bacon',   price: 60 },
          { name: 'Crumbled Feta',  price: 35 },
        ],
      },
    ],
  },
  {
    id: 'item-002',
    categoryId: 'cat-breakfast',
    name: 'Eggs Benedict',
    description:
      'Two poached eggs, Canadian ham, hollandaise on toasted English muffin.',
    price: 290,
    isVeg: false,
    isAvailable: true,
    imageUrl: '🍳',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-egg-style',
        name: 'Egg Style',
        type: 'SINGLE',
        isRequired: true,
        options: [
          { name: 'Poached',     price: 0 },
          { name: 'Soft Boiled', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'item-003',
    categoryId: 'cat-breakfast',
    name: 'Acai Smoothie Bowl',
    description:
      'Organic acai, banana, mixed berries, granola, coconut flakes, honey drizzle.',
    price: 260,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🫐',
    modifiers: [],
  },
  {
    id: 'item-004',
    categoryId: 'cat-breakfast',
    name: 'Masala Omelette',
    description:
      'Three eggs, onion, tomato, green chilli, coriander, served with pav.',
    price: 160,
    isVeg: false,
    isAvailable: true,
    imageUrl: '🍳',
    modifiers: [
      {
        id: 'mod-ome-extras',
        name: 'Extras',
        type: 'MULTIPLE',
        isRequired: false,
        options: [
          { name: 'Cheese Stuffed', price: 30 },
          { name: 'Mushrooms',      price: 25 },
        ],
      },
    ],
  },
  // ── Espresso & Brews ───────────────────────────────────────────────────────
  {
    id: 'item-005',
    categoryId: 'cat-espresso',
    name: 'Single Origin Pour-Over',
    description:
      'Ethiopia Yirgacheffe, light roast — floral, citrus, bergamot notes.',
    price: 180,
    isVeg: true,
    isAvailable: true,
    imageUrl: '☕',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-milk-pour',
        name: 'Milk Option',
        type: 'SINGLE',
        isRequired: false,
        options: [
          { name: 'Black (No Milk)',    price: 0  },
          { name: 'Oat Milk',          price: 30 },
          { name: 'Almond Milk',       price: 30 },
          { name: 'Full Cream Milk',   price: 0  },
        ],
      },
    ],
  },
  {
    id: 'item-006',
    categoryId: 'cat-espresso',
    name: 'Classic Flat White',
    description:
      'Double ristretto, micro-foamed whole milk, silky textured in a 5 oz cup.',
    price: 200,
    isVeg: true,
    isAvailable: true,
    imageUrl: '☕',
    modifiers: [
      {
        id: 'mod-fw-shot',
        name: 'Strength',
        type: 'SINGLE',
        isRequired: false,
        options: [
          { name: 'Single Shot', price: 0  },
          { name: 'Double Shot', price: 0  },
          { name: 'Triple Shot', price: 30 },
        ],
      },
      {
        id: 'mod-fw-sugar',
        name: 'Sugar',
        type: 'SINGLE',
        isRequired: false,
        options: [
          { name: 'NO SUGAR',    price: 0 },
          { name: 'Half Sugar',  price: 0 },
          { name: 'Full Sugar',  price: 0 },
        ],
      },
    ],
  },
  {
    id: 'item-007',
    categoryId: 'cat-espresso',
    name: 'Cold Brew Nitro',
    description:
      '18-hour cold steeped, nitrogen-infused, creamy cascading draft. Served chilled.',
    price: 220,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🥛',
    modifiers: [],
  },
  // ── Artisanal Breads ───────────────────────────────────────────────────────
  {
    id: 'item-008',
    categoryId: 'cat-breads',
    name: 'Sourdough Tartine',
    description:
      'Naturally leavened sourdough, cultured butter, house-made jam, served warm.',
    price: 140,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍞',
    modifiers: [
      {
        id: 'mod-spread',
        name: 'Spread',
        type: 'SINGLE',
        isRequired: true,
        options: [
          { name: 'Cultured Butter',         price: 0  },
          { name: 'Whipped Cream Cheese',    price: 20 },
          { name: 'Roasted Garlic Hummus',   price: 15 },
        ],
      },
    ],
  },
  {
    id: 'item-009',
    categoryId: 'cat-breads',
    name: 'Focaccia Margherita',
    description:
      'Rosemary focaccia, fresh tomatoes, mozzarella, torn basil, EVOO.',
    price: 190,
    isVeg: true,
    isAvailable: false,
    imageUrl: '🧆',
    modifiers: [],
  },
  // ── Beverages ──────────────────────────────────────────────────────────────
  {
    id: 'item-010',
    categoryId: 'cat-beverages',
    name: 'Watermelon Mint Cooler',
    description:
      'Fresh watermelon juice, crushed mint, lime, Himalayan pink salt rim.',
    price: 120,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍉',
    modifiers: [],
  },
  {
    id: 'item-011',
    categoryId: 'cat-beverages',
    name: 'Masala Chai Latte',
    description:
      'Full-leaf Assam tea, whole spices, steamed milk. Jaggery sweetened.',
    price: 110,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍵',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-chai-milk',
        name: 'Milk',
        type: 'SINGLE',
        isRequired: false,
        options: [
          { name: 'Full Cream', price: 0  },
          { name: 'Oat Milk',   price: 30 },
        ],
      },
    ],
  },
  {
    id: 'item-012',
    categoryId: 'cat-beverages',
    name: 'Sparkling Lemonade',
    description:
      'Hand-squeezed lemons, elderflower cordial, sparkling water, fresh basil.',
    price: 130,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍋',
    modifiers: [],
  },
]

// ── Tables ────────────────────────────────────────────────────────────────────

export const MOCK_TABLES: Table[] = [
  { id: 't01', restaurantId: 'rest-bandra-001', tableNumber: '01', qrCodeUrl: '/qr/t01.png', status: 'OCCUPIED'  },
  { id: 't02', restaurantId: 'rest-bandra-001', tableNumber: '02', qrCodeUrl: '/qr/t02.png', status: 'SERVED'    },
  { id: 't03', restaurantId: 'rest-bandra-001', tableNumber: '03', qrCodeUrl: '/qr/t03.png', status: 'VACANT'    },
  { id: 't04', restaurantId: 'rest-bandra-001', tableNumber: '04', qrCodeUrl: '/qr/t04.png', status: 'OCCUPIED'  },
  { id: 't05', restaurantId: 'rest-bandra-001', tableNumber: '05', qrCodeUrl: '/qr/t05.png', status: 'VACANT'    },
  { id: 't06', restaurantId: 'rest-bandra-001', tableNumber: '06', qrCodeUrl: '/qr/t06.png', status: 'PREPPING'  },
  { id: 't07', restaurantId: 'rest-bandra-001', tableNumber: '07', qrCodeUrl: '/qr/t07.png', status: 'OCCUPIED'  },
  { id: 't08', restaurantId: 'rest-bandra-001', tableNumber: '08', qrCodeUrl: '/qr/t08.png', status: 'VACANT'    },
  { id: 't09', restaurantId: 'rest-bandra-001', tableNumber: '09', qrCodeUrl: '/qr/t09.png', status: 'SERVED'    },
  { id: 't10', restaurantId: 'rest-bandra-001', tableNumber: '10', qrCodeUrl: '/qr/t10.png', status: 'OCCUPIED'  },
  { id: 't11', restaurantId: 'rest-bandra-001', tableNumber: '11', qrCodeUrl: '/qr/t11.png', status: 'PREPPING'  },
  { id: 't12', restaurantId: 'rest-bandra-001', tableNumber: '12', qrCodeUrl: '/qr/t12.png', status: 'VACANT'    },
]

// ── Helper: compute order totals ──────────────────────────────────────────────

function calcOrderTotals(
  items: Order['items'],
  gstPct: number
): { totalAmount: number; gstAmount: number } {
  const subtotal = items.reduce(
    (sum, i) =>
      sum +
      (i.price + i.selectedModifiers.reduce((s, m) => s + m.price, 0)) * i.quantity,
    0
  )
  const gstAmount = Math.round(subtotal * (gstPct / 100) * 100) / 100
  return { totalAmount: Math.round((subtotal + gstAmount) * 100) / 100, gstAmount }
}

// ── Orders (KDS + Admin seed) ─────────────────────────────────────────────────

const t = (minAgo: number) => new Date(Date.now() - minAgo * 60_000)

const ORDER_04_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-001',
    name: 'Avocado Toast',
    price: 220,
    quantity: 1,
    selectedModifiers: [
      { name: 'Sourdough',    price: 0  },
      { name: 'Poached Egg', price: 40 },
    ],
    notes: 'Extra crispy please',
  },
  {
    menuItemId: 'item-006',
    name: 'Classic Flat White',
    price: 200,
    quantity: 2,
    selectedModifiers: [
      { name: 'Oat Milk',  price: 30 },
      { name: 'NO SUGAR',  price: 0  },
    ],
  },
]

const ORDER_07_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-002',
    name: 'Eggs Benedict',
    price: 290,
    quantity: 2,
    selectedModifiers: [{ name: 'Poached', price: 0 }],
    notes: 'One with hollandaise on the side',
  },
  {
    menuItemId: 'item-010',
    name: 'Watermelon Mint Cooler',
    price: 120,
    quantity: 1,
    selectedModifiers: [],
  },
]

const ORDER_02_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-005',
    name: 'Single Origin Pour-Over',
    price: 180,
    quantity: 1,
    selectedModifiers: [{ name: 'Black (No Milk)', price: 0 }],
  },
  {
    menuItemId: 'item-008',
    name: 'Sourdough Tartine',
    price: 140,
    quantity: 1,
    selectedModifiers: [{ name: 'Cultured Butter', price: 0 }],
  },
]

const ORDER_11_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-011',
    name: 'Masala Chai Latte',
    price: 110,
    quantity: 3,
    selectedModifiers: [{ name: 'Oat Milk', price: 30 }],
    notes: 'One extra strong, one less sweet',
  },
  {
    menuItemId: 'item-003',
    name: 'Acai Smoothie Bowl',
    price: 260,
    quantity: 1,
    selectedModifiers: [],
  },
]

const ORDER_01_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-004',
    name: 'Masala Omelette',
    price: 160,
    quantity: 1,
    selectedModifiers: [{ name: 'Cheese Stuffed', price: 30 }],
  },
  {
    menuItemId: 'item-007',
    name: 'Cold Brew Nitro',
    price: 220,
    quantity: 1,
    selectedModifiers: [],
  },
]

const ORDER_09_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-009',
    name: 'Focaccia Margherita',
    price: 190,
    quantity: 1,
    selectedModifiers: [],
  },
  {
    menuItemId: 'item-012',
    name: 'Sparkling Lemonade',
    price: 130,
    quantity: 1,
    selectedModifiers: [],
  },
]

function buildOrder(
  partial: Omit<Order, 'totalAmount' | 'gstAmount'>
): Order {
  const { totalAmount, gstAmount } = calcOrderTotals(
    partial.items,
    MOCK_RESTAURANT.gstPercentage
  )
  return { ...partial, totalAmount, gstAmount }
}

export const MOCK_ORDERS: Order[] = [
  buildOrder({
    id: 'order-001',
    restaurantId: 'rest-bandra-001',
    tableNumber: '04',
    items: ORDER_04_ITEMS,
    paymentStatus: 'PENDING',
    orderStatus: 'RECEIVED',
    createdAt: t(2),
  }),
  buildOrder({
    id: 'order-002',
    restaurantId: 'rest-bandra-001',
    tableNumber: '07',
    items: ORDER_07_ITEMS,
    paymentStatus: 'PENDING',
    orderStatus: 'PREPARING',
    createdAt: t(8),
  }),
  buildOrder({
    id: 'order-003',
    restaurantId: 'rest-bandra-001',
    tableNumber: '02',
    items: ORDER_02_ITEMS,
    paymentStatus: 'PENDING',
    orderStatus: 'READY',
    createdAt: t(15),
  }),
  buildOrder({
    id: 'order-004',
    restaurantId: 'rest-bandra-001',
    tableNumber: '11',
    items: ORDER_11_ITEMS,
    paymentStatus: 'PENDING',
    orderStatus: 'RECEIVED',
    createdAt: t(1),
  }),
  // Completed / paid orders visible in admin ledger
  buildOrder({
    id: 'order-005',
    restaurantId: 'rest-bandra-001',
    tableNumber: '01',
    items: ORDER_01_ITEMS,
    paymentStatus: 'PAID',
    orderStatus: 'COMPLETED',
    createdAt: t(85),
  }),
  buildOrder({
    id: 'order-006',
    restaurantId: 'rest-bandra-001',
    tableNumber: '09',
    items: ORDER_09_ITEMS,
    paymentStatus: 'FAILED',
    orderStatus: 'COMPLETED',
    createdAt: t(120),
  }),
]

/** In-flight orders visible on the KDS (not yet COMPLETED) */
export const KDS_ORDERS = MOCK_ORDERS.filter(
  (o) => o.orderStatus !== 'COMPLETED'
)

/** All orders for the admin ledger */
export const ADMIN_ORDERS = MOCK_ORDERS

/** Today's aggregated sales metrics */
export const MOCK_SALES_SUMMARY = {
  totalRevenue: 24_850,
  totalCovers: 87,
  avgPrepTimeMinutes: 11,
  activeKotCount: KDS_ORDERS.length,
}
