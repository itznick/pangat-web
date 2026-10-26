import { useState, useMemo, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { Search, X, ChefHat, ArrowRight } from "lucide-react"
import { DinerTopBar } from "./components/DinerTopBar"
import { CategoryNav } from "./components/CategoryNav"
import { MenuItemCard } from "./components/MenuItemCard"
import { CustomizationDrawer } from "./components/CustomizationDrawer"
import { FloatingCartPill } from "./components/FloatingCartPill"
import { CheckoutDrawer } from "./components/CheckoutDrawer"
import { useCartStore, useOrderTrackingStore } from "@/stores/useCartStore"
import { useKdsStore } from "@/stores/useKdsStore"
import { api } from "@/lib/api"
import type {
  MenuItem,
  MenuCategory,
  Restaurant,
  SelectedModifier,
  PaymentMethod,
} from "@/types/domain"

const DEFAULT_RESTAURANT: Restaurant = {
  id: "",
  name: "",
  slug: "",
  upiVpa: "",
  gstPercentage: 5,
  isVegOnly: false,
}

export function DinerMenuPage() {
  const { restaurantSlug = "", tableId = "01" } = useParams<{
    restaurantSlug: string
    tableId: string
  }>()
  const navigate = useNavigate()

  const [activeCategoryId, setActiveCategoryId] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showCustomization, setShowCustomization] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  // Dynamic API state
  const [restaurant, setRestaurant] = useState<Restaurant>(DEFAULT_RESTAURANT)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const outOfStockIds = useKdsStore((s) => s.outOfStockIds)
  const { dietaryFilter, addItem, toOrderItems, clearCart } = useCartStore()
  const { order: activeOrder, placeOrder } = useOrderTrackingStore()

  // Load public menu from NestJS backend API
  useEffect(() => {
    setIsLoading(true)
    api.menu.getPublic(restaurantSlug)
      .then((data) => {
        if (data.restaurant) setRestaurant(data.restaurant)
        if (data.categories) setCategories(data.categories)
        if (data.items) setMenuItems(data.items)
        setIsLoading(false)
      })
      .catch((err) => {
        console.warn("API menu fetch failed; using fallback state:", err)
        setIsLoading(false)
      })
  }, [restaurantSlug])

  const categoryNameMap = useMemo(() => {
    return Object.fromEntries(categories.map((c) => [c.id, c.name]))
  }, [categories])

  // Filter items based on Category, Search Query & Dietary selection
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return menuItems.filter((item) => {
      // Category filter (only applies if not searching)
      const categoryMatch =
        q.length > 0 ||
        activeCategoryId === "all" ||
        item.categoryId === activeCategoryId

      // Dietary filter
      const dietaryMatch =
        dietaryFilter === "ALL" ||
        (dietaryFilter === "VEG" && item.isVeg) ||
        (dietaryFilter === "NON_VEG" && !item.isVeg)

      // Search matching (fuzzy/includes check across title, desc, category, modifiers)
      let searchMatch = true
      if (q.length > 0) {
        const catName = (categoryNameMap[item.categoryId] || "").toLowerCase()
        const modText = item.modifiers
          .map((m) => `${m.name} ${m.options.map((o) => o.name).join(" ")}`)
          .join(" ")
          .toLowerCase()

        searchMatch =
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          catName.includes(q) ||
          modText.includes(q)
      }

      return categoryMatch && dietaryMatch && searchMatch
    })
  }, [menuItems, activeCategoryId, dietaryFilter, searchQuery, categoryNameMap])

  // Group by category when "all" is active and not searching
  const groupedItems = useMemo(() => {
    if (activeCategoryId !== "all" || searchQuery.trim().length > 0) return null
    const groups: Record<string, MenuItem[]> = {}
    filteredItems.forEach((item) => {
      const catName = categoryNameMap[item.categoryId] || item.categoryId
      if (!groups[catName]) groups[catName] = []
      groups[catName].push(item)
    })
    return groups
  }, [filteredItems, activeCategoryId, searchQuery, categoryNameMap])

  const handleAddItem = (item: MenuItem) => {
    if (item.modifiers.length === 0) {
      addItem({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        selectedModifiers: [],
        notes: "",
        isVeg: item.isVeg,
      })
    } else {
      setSelectedItem(item)
      setShowCustomization(true)
    }
  }

  const handleConfirmCustomization = (
    selectedModifiers: SelectedModifier[],
    notes: string,
    quantity: number
  ) => {
    if (!selectedItem) return
    addItem({
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity,
      selectedModifiers,
      notes,
      isVeg: selectedItem.isVeg,
    })
    setShowCustomization(false)
    setSelectedItem(null)
  }

  const handleProceedToPay = async ({
    mobile,
    paymentMethod,
  }: {
    mobile: string
    paymentMethod: PaymentMethod
  }) => {
    const orderItems = toOrderItems()
    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    try {
      // 1. Submit order to NestJS backend API
      const placedOrder = await api.orders.create(
        {
          restaurantSlug,
          tableNumber: tableId,
          paymentMethod,
          customerPhone: mobile,
          items: orderItems,
        },
        idempotencyKey,
      )

      // 2. Set in diner tracking store (persisted to localStorage)
      placeOrder(placedOrder)

      // 3. Reset cart & navigate to live order tracking
      clearCart()
      setShowCheckout(false)
      navigate(`/r/${restaurantSlug}/order/${placedOrder.id}`)
    } catch (err: any) {
      console.error("Order placement to backend failed:", err)
      const msg = err.response?.data?.message || err.message || "Could not fire order to kitchen. Please check network connection."
      alert(`Order Failed: ${msg}`)
    }
  }

  // Active in-flight order tracker banner
  const hasInFlightOrder =
    activeOrder &&
    activeOrder.tableNumber === tableId &&
    activeOrder.orderStatus !== "COMPLETED"

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-md mx-auto relative">
        <DinerTopBar cafeName={restaurant.name} tableId={tableId} />

        {/* In-flight Active Order Reminder Banner (Session Persistence) */}
        {hasInFlightOrder && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/40 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <ChefHat className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-100">
                  Active Order #{activeOrder.id.slice(-3).toUpperCase()} in progress
                </p>
                <p className="text-[11px] text-emerald-400 capitalize">
                  Status: {activeOrder.orderStatus.toLowerCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/r/${restaurantSlug}/order/${activeOrder.id}`)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
            >
              <span>Track</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {categories.length > 0 && (
          <CategoryNav
            categories={categories}
            activeId={activeCategoryId}
            onChange={(id) => {
              setActiveCategoryId(id)
              if (searchQuery) setSearchQuery("")
            }}
          />
        )}

        {/* Instant In-Menu Search Bar */}
        <div className="px-4 pt-3 pb-1">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Misal, Dosa, Chai, Keema)..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pt-2">
              <span>Found {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"} for "{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-emerald-400 hover:underline font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Menu list */}
        <div className="px-4 py-3 pb-32 space-y-4">
          {isLoading && menuItems.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-zinc-500">Loading fresh menu from kitchen...</p>
            </div>
          ) : activeCategoryId === "all" && !searchQuery && groupedItems ? (
            Object.entries(groupedItems).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-0.5">
                  {category}
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      isOutOfStock={outOfStockIds.has(item.id)}
                      onAdd={handleAddItem}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  isOutOfStock={outOfStockIds.has(item.id)}
                  onAdd={handleAddItem}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-zinc-300 font-semibold">No dishes found</p>
              <p className="text-zinc-500 text-sm mt-1">
                {searchQuery
                  ? `No matches for "${searchQuery}". Try a different keyword.`
                  : "Try adjusting your category or veg/non-veg filter."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-zinc-800 text-xs font-semibold text-emerald-400 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Customization Drawer */}
        <CustomizationDrawer
          item={selectedItem}
          open={showCustomization}
          onClose={() => {
            setShowCustomization(false)
            setSelectedItem(null)
          }}
          onConfirm={handleConfirmCustomization}
        />

        {/* Checkout Drawer */}
        <CheckoutDrawer
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          onProceedToPay={handleProceedToPay}
        />

        {/* Floating Cart Pill */}
        <FloatingCartPill onViewOrder={() => setShowCheckout(true)} />
      </div>
    </div>
  )
}
