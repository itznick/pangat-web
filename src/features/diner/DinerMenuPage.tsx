import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router"
import { DinerTopBar } from "./components/DinerTopBar"
import { CategoryNav } from "./components/CategoryNav"
import { MenuItemCard } from "./components/MenuItemCard"
import { CustomizationDrawer } from "./components/CustomizationDrawer"
import { FloatingCartPill } from "./components/FloatingCartPill"
import { CheckoutDrawer } from "./components/CheckoutDrawer"
import { useCartStore, useOrderTrackingStore } from "@/stores/useCartStore"
import { useAdminStore } from "@/stores/useAdminStore"
import { useKdsStore } from "@/stores/useKdsStore"
import { MOCK_CATEGORIES, CATEGORY_NAME_MAP } from "@/data/mockData"
import type { MenuItem, SelectedModifier, Order } from "@/types/domain"

export function DinerMenuPage() {
  const { restaurantSlug = "pangat", tableId = "04" } = useParams<{
    restaurantSlug: string
    tableId: string
  }>()
  const navigate = useNavigate()

  const [activeCategoryId, setActiveCategoryId] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showCustomization, setShowCustomization] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  // Global stores
  const restaurant = useAdminStore((s) => s.restaurant)
  const menuItems = useAdminStore((s) => s.menuItems)
  const outOfStockIds = useKdsStore((s) => s.outOfStockIds)
  const { dietaryFilter, addItem, total, gstAmount, toOrderItems, clearCart } = useCartStore()
  const { placeOrder } = useOrderTrackingStore()

  // Filter items based on Category & Dietary selection
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const categoryMatch =
        activeCategoryId === "all" || item.categoryId === activeCategoryId

      const dietaryMatch =
        dietaryFilter === "ALL" ||
        (dietaryFilter === "VEG" && item.isVeg) ||
        (dietaryFilter === "NON_VEG" && !item.isVeg)

      return categoryMatch && dietaryMatch
    })
  }, [menuItems, activeCategoryId, dietaryFilter])

  // Group by category when "all" is active
  const groupedItems = useMemo(() => {
    if (activeCategoryId !== "all") return null
    const groups: Record<string, MenuItem[]> = {}
    filteredItems.forEach((item) => {
      const catName = CATEGORY_NAME_MAP[item.categoryId] || item.categoryId
      if (!groups[catName]) groups[catName] = []
      groups[catName].push(item)
    })
    return groups
  }, [filteredItems, activeCategoryId])

  const handleAddItem = (item: MenuItem) => {
    if (item.modifiers.length === 0) {
      // Direct add
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

  const handleProceedToPay = (_mobile: string) => {
    const orderId = `ORD-${Math.floor(Math.random() * 9000 + 1000)}`
    const orderItems = toOrderItems()
    const gstPct = restaurant.gstPercentage || 5
    const totalVal = total(gstPct)
    const gstVal = gstAmount(gstPct)

    const newOrder: Order = {
      id: orderId,
      restaurantId: restaurant.id,
      tableNumber: tableId,
      items: orderItems,
      totalAmount: totalVal,
      gstAmount: gstVal,
      paymentStatus: "PAID",
      orderStatus: "RECEIVED",
      createdAt: new Date(),
    }

    // 1. Set in diner tracking store
    placeOrder(newOrder)

    // 2. Dispatch live to KDS queue
    useKdsStore.getState().addTicket(newOrder)

    // 3. Update Admin live orders & table state
    useAdminStore.getState().addOrder(newOrder)
    const matchedTable = useAdminStore.getState().tableByNumber(tableId)
    if (matchedTable) {
      useAdminStore.getState().updateTableStatus(matchedTable.id, "PREPPING")
    }

    // 4. Reset cart & navigate
    clearCart()
    setShowCheckout(false)
    navigate(`/r/${restaurantSlug}/order/${orderId}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-md mx-auto relative">
        <DinerTopBar cafeName={restaurant.name} tableId={tableId} />
        <CategoryNav
          categories={MOCK_CATEGORIES}
          activeId={activeCategoryId}
          onChange={setActiveCategoryId}
        />

        {/* Menu list */}
        <div className="px-4 py-4 pb-32 space-y-4">
          {activeCategoryId === "all" && groupedItems ? (
            Object.entries(groupedItems).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 px-0.5">
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

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-zinc-400 font-medium">No items found</p>
              <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters</p>
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
