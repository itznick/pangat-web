// ─────────────────────────────────────────────────────────────────────────────
// Pangat – Comprehensive Mock Seed Data (Authentic Indian Menu)
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
  { id: 'cat-nashta',    name: 'All Day Nashta & Meals', sortOrder: 1 },
  { id: 'cat-chaat',     name: 'Street Chaat & Starters', sortOrder: 2 },
  { id: 'cat-beverages', name: 'Chai, Coffee & Coolers',  sortOrder: 3 },
  { id: 'cat-dessert',   name: 'Mithai & Desserts',       sortOrder: 4 },
]

export const CATEGORY_NAME_MAP: Record<string, string> = Object.fromEntries(
  MOCK_CATEGORIES.map((c) => [c.id, c.name])
)

/** Ordered list of nav labels — "All" sentinel prepended. */
export const NAV_CATEGORY_IDS = ['all', ...MOCK_CATEGORIES.map((c) => c.id)]

// ── Menu Items ────────────────────────────────────────────────────────────────

export const MOCK_MENU_ITEMS: MenuItem[] = [
  // ── All Day Nashta & Meals ──────────────────────────────────────────────────
  {
    id: 'item-001',
    categoryId: 'cat-nashta',
    name: 'Puneri Misal Pav',
    description:
      'Spicy sprouted moth bean curry, crunchy farsan, diced onions, fresh coriander, 2 buttered pav & lemon wedge.',
    price: 140,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍲',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-misal-spice',
        name: 'Spice Level',
        type: 'SINGLE',
        isRequired: true,
        options: [
          { name: 'Medium Spicy',           price: 0 },
          { name: 'Kolhapuri Tikhat (Hot)', price: 0 },
          { name: 'Mild (Low Chilli)',      price: 0 },
        ],
      },
      {
        id: 'mod-misal-addons',
        name: 'Add-ons',
        type: 'MULTIPLE',
        isRequired: false,
        options: [
          { name: 'Extra Pav Pair (2 pcs)', price: 25 },
          { name: 'Extra Rassa / Kat Bowl', price: 20 },
          { name: 'Fresh Dahi / Curd Bowl', price: 20 },
        ],
      },
    ],
  },
  {
    id: 'item-002',
    categoryId: 'cat-nashta',
    name: 'Mysore Masala Dosa',
    description:
      'Crisp golden fermented crepe smeared with spicy red garlic-chilli chutney, spiced potato bhaji, fresh coconut chutney & piping hot sambar.',
    price: 160,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🥞',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-dosa-fat',
        name: 'Preparation Style',
        type: 'SINGLE',
        isRequired: true,
        options: [
          { name: 'Amul Butter',   price: 0 },
          { name: 'Desi Cow Ghee', price: 25 },
        ],
      },
      {
        id: 'mod-dosa-extras',
        name: 'Add-ons',
        type: 'MULTIPLE',
        isRequired: false,
        options: [
          { name: 'Gunpowder Podi Dusting', price: 20 },
          { name: 'Grated Amul Cheese',    price: 30 },
        ],
      },
    ],
  },
  {
    id: 'item-003',
    categoryId: 'cat-nashta',
    name: 'Kanda Poha & Cutting Chai',
    description:
      'Flattened rice tempered with mustard, roasted peanuts, green chillies and curry leaves, topped with nylon sev, served with hot cutting chai.',
    price: 110,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍛',
    modifiers: [],
  },
  {
    id: 'item-004',
    categoryId: 'cat-nashta',
    name: 'Bun Maska & Irani Chai',
    description:
      'Warm soft bakery bun generously slathered with whipped salted butter, paired with slow-brewed caramelised milky Irani chai.',
    price: 95,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🥯',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-bun-jam',
        name: 'Mixed Fruit Jam',
        type: 'SINGLE',
        isRequired: false,
        options: [
          { name: 'Add Mixed Fruit Jam', price: 15 },
          { name: 'Plain Butter Only',   price: 0 },
        ],
      },
    ],
  },
  {
    id: 'item-005',
    categoryId: 'cat-nashta',
    name: 'Paneer Bhurji & Malabar Paratha',
    description:
      'Fresh crumbly cottage cheese scrambled with tomatoes, onions, crushed ginger and fragrant kasuri methi, paired with 2 flaky Malabar parathas.',
    price: 210,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🥘',
    modifiers: [],
  },
  {
    id: 'item-006',
    categoryId: 'cat-nashta',
    name: 'Kolhapuri Keema Pav',
    description:
      'Slow-braised spiced minced mutton in fragrant hand-pounded Kolhapuri masala, fresh mint and lime, served with 2 toasted pav.',
    price: 260,
    isVeg: false,
    isAvailable: true,
    imageUrl: '🍖',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-keema-spice',
        name: 'Spice Level',
        type: 'SINGLE',
        isRequired: true,
        options: [
          { name: 'Medium Masala', price: 0 },
          { name: 'Teekha Kolhapuri (Very Hot)', price: 0 },
        ],
      },
      {
        id: 'mod-keema-egg',
        name: 'Add-ons',
        type: 'MULTIPLE',
        isRequired: false,
        options: [
          { name: 'Half-Fry Egg on Top', price: 30 },
          { name: 'Extra Pav Pair',      price: 25 },
        ],
      },
    ],
  },

  // ── Street Chaat & Starters ────────────────────────────────────────────────
  {
    id: 'item-007',
    categoryId: 'cat-chaat',
    name: 'Amritsari Paneer Tikka',
    description:
      'Thick cubes of fresh Malai paneer marinated in roasted gram flour, carom seeds and mustard oil, char-grilled in tandoor. Served with mint chutney.',
    price: 240,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍢',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-tikka-dip',
        name: 'Chutney / Dip Choice',
        type: 'SINGLE',
        isRequired: false,
        options: [
          { name: 'Classic Pudina Chutney', price: 0 },
          { name: 'Spicy Garlic Mayo Dip',  price: 20 },
        ],
      },
    ],
  },
  {
    id: 'item-008',
    categoryId: 'cat-chaat',
    name: 'Butter Chicken Kathi Roll',
    description:
      'Tender char-grilled chicken morsels tossed in velvety makhani sauce, rolled with crunchy spiced onions in a crisp handmade paratha.',
    price: 220,
    isVeg: false,
    isAvailable: true,
    imageUrl: '🌯',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-roll-egg',
        name: 'Wrap Base',
        type: 'SINGLE',
        isRequired: false,
        options: [
          { name: 'Plain Paratha',        price: 0 },
          { name: 'Single Egg Lined Paratha', price: 20 },
          { name: 'Double Egg Lined Paratha', price: 35 },
        ],
      },
    ],
  },
  {
    id: 'item-009',
    categoryId: 'cat-chaat',
    name: 'Dahi Puri Chaat',
    description:
      'Crisp golden puris filled with spiced potato cubes, chilled sweet curd, date-tamarind chutney, spicy mint pani and fine nylon sev.',
    price: 130,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🥙',
    modifiers: [],
  },
  {
    id: 'item-010',
    categoryId: 'cat-chaat',
    name: 'Vada Pav Fondue',
    description:
      'Signature Pangat creation: crispy mini spiced potato vadas on bamboo skewers, served with bubbling cheese fondue and garlic dry thecha.',
    price: 175,
    isVeg: true,
    isAvailable: false,
    imageUrl: '🧀',
    modifiers: [],
  },

  // ── Chai, Coffee & Coolers ─────────────────────────────────────────────────
  {
    id: 'item-011',
    categoryId: 'cat-beverages',
    name: 'South Indian Degree Filter Coffee',
    description:
      'Authentic Plantation AA chicory blend slow-dripped in brass filter, frothed with hot creamy milk, served in traditional brass davarah.',
    price: 80,
    isVeg: true,
    isAvailable: true,
    imageUrl: '☕',
    isPopular: true,
    modifiers: [
      {
        id: 'mod-coffee-sugar',
        name: 'Sugar Preference',
        type: 'SINGLE',
        isRequired: false,
        options: [
          { name: 'Regular Sweetness', price: 0 },
          { name: 'Less Sugar',        price: 0 },
          { name: 'NO SUGAR',          price: 0 },
        ],
      },
    ],
  },
  {
    id: 'item-012',
    categoryId: 'cat-beverages',
    name: 'Cutting Masala Chai',
    description:
      'Strong boiled CTC tea infused with crushed green cardamom, dried ginger, cloves and fresh lemongrass.',
    price: 50,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍵',
    modifiers: [
      {
        id: 'mod-chai-milk',
        name: 'Milk Choice',
        type: 'SINGLE',
        isRequired: false,
        options: [
          { name: 'Full Cream Dairy Milk', price: 0 },
          { name: 'Oat Milk (Plant-based)', price: 25 },
        ],
      },
    ],
  },
  {
    id: 'item-013',
    categoryId: 'cat-beverages',
    name: 'Kokum Jeera Cooler',
    description:
      'Refreshing Konkani wild mangosteen extract infused with roasted cumin powder, black salt, fresh mint leaves and sparkling soda.',
    price: 90,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍹',
    modifiers: [],
  },
  {
    id: 'item-014',
    categoryId: 'cat-beverages',
    name: 'Kesar Pista Lassi',
    description:
      'Hand-churned creamy thick yoghurt sweetened with desi khand, topped with Kashmiri saffron strands, chopped pistachios and cardamom dust.',
    price: 120,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🥛',
    modifiers: [],
  },

  // ── Mithai & Desserts ──────────────────────────────────────────────────────
  {
    id: 'item-015',
    categoryId: 'cat-dessert',
    name: 'Gulab Jamun with Malai Rabdi',
    description:
      'Warm soft khoya dumplings soaked in fragrant cardamom-rose syrup, served over a bed of slow-cooked saffron malai rabdi.',
    price: 130,
    isVeg: true,
    isAvailable: true,
    imageUrl: '🍨',
    isPopular: true,
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
    name: 'Puneri Misal Pav',
    price: 140,
    quantity: 1,
    selectedModifiers: [
      { name: 'Kolhapuri Tikhat (Hot)', price: 0 },
      { name: 'Extra Pav Pair (2 pcs)', price: 25 },
    ],
    notes: 'Extra rassa hot please',
  },
  {
    menuItemId: 'item-011',
    name: 'South Indian Degree Filter Coffee',
    price: 80,
    quantity: 2,
    selectedModifiers: [
      { name: 'Less Sugar', price: 0 },
    ],
  },
]

const ORDER_07_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-002',
    name: 'Mysore Masala Dosa',
    price: 160,
    quantity: 2,
    selectedModifiers: [
      { name: 'Desi Cow Ghee', price: 25 },
      { name: 'Gunpowder Podi Dusting', price: 20 },
    ],
    notes: 'Make it extra crisp',
  },
  {
    menuItemId: 'item-013',
    name: 'Kokum Jeera Cooler',
    price: 90,
    quantity: 1,
    selectedModifiers: [],
  },
]

const ORDER_02_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-006',
    name: 'Kolhapuri Keema Pav',
    price: 260,
    quantity: 1,
    selectedModifiers: [
      { name: 'Teekha Kolhapuri (Very Hot)', price: 0 },
      { name: 'Half-Fry Egg on Top',         price: 30 },
    ],
  },
  {
    menuItemId: 'item-012',
    name: 'Cutting Masala Chai',
    price: 50,
    quantity: 1,
    selectedModifiers: [{ name: 'Full Cream Dairy Milk', price: 0 }],
  },
]

const ORDER_11_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-008',
    name: 'Butter Chicken Kathi Roll',
    price: 220,
    quantity: 2,
    selectedModifiers: [{ name: 'Single Egg Lined Paratha', price: 20 }],
    notes: 'Extra onions and green chutney',
  },
  {
    menuItemId: 'item-014',
    name: 'Kesar Pista Lassi',
    price: 120,
    quantity: 2,
    selectedModifiers: [],
  },
]

const ORDER_01_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-007',
    name: 'Amritsari Paneer Tikka',
    price: 240,
    quantity: 1,
    selectedModifiers: [{ name: 'Classic Pudina Chutney', price: 0 }],
  },
  {
    menuItemId: 'item-015',
    name: 'Gulab Jamun with Malai Rabdi',
    price: 130,
    quantity: 2,
    selectedModifiers: [],
  },
]

const ORDER_09_ITEMS: Order['items'] = [
  {
    menuItemId: 'item-003',
    name: 'Kanda Poha & Cutting Chai',
    price: 110,
    quantity: 2,
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
    paymentMethod: 'PAY_AT_COUNTER',
    customerPhone: '9820098200',
    orderStatus: 'RECEIVED',
    createdAt: t(2),
  }),
  buildOrder({
    id: 'order-002',
    restaurantId: 'rest-bandra-001',
    tableNumber: '07',
    items: ORDER_07_ITEMS,
    paymentStatus: 'PAID',
    paymentMethod: 'UPI_INSTANT',
    customerPhone: '9876543210',
    orderStatus: 'PREPARING',
    createdAt: t(8),
  }),
  buildOrder({
    id: 'order-003',
    restaurantId: 'rest-bandra-001',
    tableNumber: '02',
    items: ORDER_02_ITEMS,
    paymentStatus: 'PAID',
    paymentMethod: 'UPI_INSTANT',
    orderStatus: 'READY',
    createdAt: t(15),
  }),
  buildOrder({
    id: 'order-004',
    restaurantId: 'rest-bandra-001',
    tableNumber: '11',
    items: ORDER_11_ITEMS,
    paymentStatus: 'PENDING',
    paymentMethod: 'PAY_AT_COUNTER',
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
    paymentMethod: 'UPI_INSTANT',
    orderStatus: 'COMPLETED',
    createdAt: t(85),
  }),
  buildOrder({
    id: 'order-006',
    restaurantId: 'rest-bandra-001',
    tableNumber: '09',
    items: ORDER_09_ITEMS,
    paymentStatus: 'FAILED',
    paymentMethod: 'UPI_INSTANT',
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
  totalRevenue: 28_450,
  totalCovers: 94,
  avgPrepTimeMinutes: 9,
  activeKotCount: KDS_ORDERS.length,
}
