import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useAdminStore } from "@/stores/useAdminStore"
import { api } from "@/lib/api"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Boxes,
  Plus,
  PackagePlus,
  AlertTriangle,
  XCircle,
  Search,
  SlidersHorizontal,
  RefreshCw,
  ChefHat,
  History,
  Loader2,
} from "lucide-react"
import { AddIngredientModal } from "../components/AddIngredientModal"
import { AdjustStockModal } from "../components/AdjustStockModal"
import { ReceiveStockModal } from "../components/ReceiveStockModal"
import { RecipeModal } from "../components/RecipeModal"
import { StockMovementsLedger } from "../components/StockMovementsLedger"
import type { Ingredient, MenuItem, Recipe, InventoryAlerts } from "@/types/domain"

export function AdminInventoryPage() {
  const currentOutlet = useAuthStore((s) => s.currentOutlet)
  const menuItems = useAdminStore((s) => s.menuItems)
  const fetchDashboardData = useAdminStore((s) => s.fetchDashboardData)

  const [activeTab, setActiveTab] = useState<"INGREDIENTS" | "RECIPES" | "LEDGER">("INGREDIENTS")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [alerts, setAlerts] = useState<InventoryAlerts | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null)
  const [recipeMenuItem, setRecipeMenuItem] = useState<MenuItem | null>(null)

  const restaurantId = currentOutlet?.id || ""

  const loadData = async () => {
    if (!restaurantId) return
    setLoading(true)
    try {
      const [ings, recs, alts] = await Promise.all([
        api.inventory.listIngredients(restaurantId),
        api.inventory.listRecipes(restaurantId).catch(() => []),
        api.inventory.getAlerts(restaurantId).catch(() => null),
      ])
      setIngredients(ings || [])
      setRecipes(recs || [])
      setAlerts(alts)

      if (currentOutlet?.slug) {
        fetchDashboardData(currentOutlet.slug)
      }
    } catch (err) {
      console.error("Failed to load inventory data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [restaurantId])

  // KPIs
  const totalItems = ingredients.length
  const outOfStockCount = alerts?.outOfStock?.length ?? ingredients.filter((i) => Number(i.currentStock) <= 0).length
  const lowStockCount = alerts?.lowStock?.length ?? ingredients.filter(
    (i) => Number(i.currentStock) > 0 && Number(i.currentStock) <= Number(i.minimumStock) && Number(i.minimumStock) > 0
  ).length
  const totalValuation = ingredients.reduce(
    (sum, i) => sum + Math.max(0, Number(i.currentStock)) * Number(i.costPerUnit || 0),
    0
  )

  const filteredIngredients = ingredients.filter((i) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return i.name.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Inventory & Stock</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mt-1">
            <Boxes className="w-6 h-6 text-emerald-600" />
            Kitchen Inventory & Recipe Control
          </h1>
          <p className="text-sm text-zinc-500">
            Real-time ingredient stock, dish recipe portions, supplier shipments, and audited movement history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReceiveModal(true)}
            disabled={!restaurantId || ingredients.length === 0}
            className="flex items-center gap-1.5 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <PackagePlus className="w-4 h-4 text-emerald-600" />
            Receive Delivery
          </Button>

          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            disabled={!restaurantId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Ingredient
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Active Ingredients</span>
            <Boxes className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{totalItems}</p>
          <span className="text-xs text-zinc-500">Tracked raw materials</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{lowStockCount}</p>
          <span className="text-xs text-amber-600/80">At or below reorder threshold</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Depleted / Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{outOfStockCount}</p>
          <span className="text-xs text-rose-600/80">Requires immediate purchase</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Stock Valuation</span>
            <span className="text-sm font-semibold text-emerald-600">₹</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{totalValuation.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <span className="text-xs text-zinc-500">Estimated cost of current inventory</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="flex space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("INGREDIENTS")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "INGREDIENTS"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Boxes className="w-4 h-4" />
            Ingredients & Stock Levels ({ingredients.length})
          </button>

          <button
            onClick={() => setActiveTab("RECIPES")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "RECIPES"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <ChefHat className="w-4 h-4" />
            Dish Recipes ({recipes.length})
          </button>

          <button
            onClick={() => setActiveTab("LEDGER")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "LEDGER"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <History className="w-4 h-4" />
            Audited Movement Ledger
          </button>
        </nav>
      </div>

      {/* Tab 1: Ingredients Table */}
      {activeTab === "INGREDIENTS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <Input
                placeholder="Search ingredients or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-zinc-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <p className="text-sm">Loading ingredients...</p>
              </div>
            ) : filteredIngredients.length === 0 ? (
              <div className="py-16 text-center text-zinc-500">
                <Boxes className="w-8 h-8 mx-auto text-zinc-400 mb-2 opacity-50" />
                <p className="text-sm font-medium">No ingredients found</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Add raw materials and food supplies to start recipe-based inventory deductions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-850 text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Ingredient</th>
                      <th className="py-3 px-4">Unit</th>
                      <th className="py-3 px-4 text-right">Available Stock</th>
                      <th className="py-3 px-4 text-right">Reorder Threshold</th>
                      <th className="py-3 px-4 text-right">Cost / Unit</th>
                      <th className="py-3 px-4 text-right">Est. Valuation</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredIngredients.map((ing) => {
                      const stock = Number(ing.currentStock)
                      const min = Number(ing.minimumStock)
                      const cost = Number(ing.costPerUnit || 0)
                      const value = Math.max(0, stock) * cost

                      const isOut = stock <= 0
                      const isLow = !isOut && min > 0 && stock <= min

                      return (
                        <tr
                          key={ing.id}
                          className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                            {ing.name}
                            {ing.sku && (
                              <span className="block text-[11px] font-mono font-normal text-zinc-400">
                                SKU: {ing.sku}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-zinc-500 uppercase">
                            {ing.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            <span
                              className={
                                isOut
                                  ? "text-rose-600 dark:text-rose-400"
                                  : isLow
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-zinc-900 dark:text-zinc-100"
                              }
                            >
                              {stock} {ing.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-zinc-500">
                            {min > 0 ? `${min} ${ing.unit}` : "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-zinc-600 dark:text-zinc-400">
                            ₹{cost.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-zinc-700 dark:text-zinc-300">
                            ₹{value.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isOut ? (
                              <Badge variant="outline" className="text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800">
                                Out of Stock
                              </Badge>
                            ) : isLow ? (
                              <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
                                Healthy
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAdjustingIngredient(ing)}
                              className="h-7 text-xs flex items-center gap-1"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Dish Recipes */}
      {activeTab === "RECIPES" && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <ChefHat className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Automatic Kitchen Order Deduction</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                When a diner or steward confirms an order into RECEIVED, Pangat consults these dish recipes and deducts the exact ingredients in atomic database transactions.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-850 text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Menu Dish</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Recipe Status</th>
                    <th className="py-3 px-4">Ingredients Breakdown</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {menuItems.map((item) => {
                    const recipe = recipes.find((r) => r.menuItemId === item.id)

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                          ₹{item.price}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {recipe ? (
                            <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
                              Configured (v{recipe.version})
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700">
                              No Recipe
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-md">
                          {recipe && recipe.ingredients && recipe.ingredients.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {recipe.ingredients.map((ri, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300 font-mono"
                                >
                                  {ri.ingredient?.name || "Ing"}: {ri.quantity} {ri.unit}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">No ingredients linked</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRecipeMenuItem(item)}
                            className="h-7 text-xs flex items-center gap-1"
                          >
                            <ChefHat className="w-3 h-3 text-amber-600" />
                            {recipe ? "Edit Recipe" : "Attach Recipe"}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audited Movement Ledger */}
      {activeTab === "LEDGER" && (
        <StockMovementsLedger restaurantId={restaurantId} />
      )}

      {/* Modals */}
      <AddIngredientModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        restaurantId={restaurantId}
        onIngredientAdded={(newIng) => {
          setIngredients([newIng, ...ingredients])
        }}
      />

      <AdjustStockModal
        open={!!adjustingIngredient}
        onOpenChange={(open) => !open && setAdjustingIngredient(null)}
        restaurantId={restaurantId}
        ingredient={adjustingIngredient}
        onStockAdjusted={(updated) => {
          setIngredients(ingredients.map((i) => (i.id === updated.id ? updated : i)))
        }}
      />

      <ReceiveStockModal
        open={showReceiveModal}
        onOpenChange={setShowReceiveModal}
        restaurantId={restaurantId}
        ingredients={ingredients}
        onStockReceived={(updatedList) => {
          const map = new Map(updatedList.map((u) => [u.id, u]))
          setIngredients(ingredients.map((i) => map.get(i.id) || i))
        }}
      />

      <RecipeModal
        open={!!recipeMenuItem}
        onOpenChange={(open) => !open && setRecipeMenuItem(null)}
        restaurantId={restaurantId}
        menuItem={recipeMenuItem}
        ingredients={ingredients}
        onRecipeSaved={(saved) => {
          setRecipes((prev) => {
            const filtered = prev.filter((r) => r.menuItemId !== saved.menuItemId)
            return [...filtered, saved]
          })
        }}
      />
    </div>
  )
}
