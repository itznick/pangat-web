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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
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
  TrendingUp,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AddIngredientModal } from "../components/AddIngredientModal"
import { AdjustStockModal } from "../components/AdjustStockModal"
import { ReceiveStockModal } from "../components/ReceiveStockModal"
import { RecipeModal } from "../components/RecipeModal"
import { StockMovementsLedger } from "../components/StockMovementsLedger"
import type { Ingredient, MenuItem, Recipe, InventoryAlerts } from "@/types/domain"

type InventoryTab = "INGREDIENTS" | "RECIPES" | "LEDGER"

export function AdminInventoryPage() {
  const currentOutlet = useAuthStore((s) => s.currentOutlet)
  const menuItems = useAdminStore((s) => s.menuItems)
  const fetchDashboardData = useAdminStore((s) => s.fetchDashboardData)

  const [activeTab, setActiveTab] = useState<InventoryTab>("INGREDIENTS")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [alerts, setAlerts] = useState<InventoryAlerts | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [stockFilter, setStockFilter] = useState<"ALL" | "HEALTHY" | "LOW" | "OUT">("ALL")

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
    const stock = Number(i.currentStock)
    const min = Number(i.minimumStock)

    if (stockFilter === "OUT" && stock > 0) return false
    if (stockFilter === "LOW" && (stock <= 0 || stock > min || min <= 0)) return false
    if (stockFilter === "HEALTHY" && (stock <= min && min > 0)) return false

    if (!search.trim()) return true
    const q = search.toLowerCase()
    return i.name.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q))
  })

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* ── Sticky Page Header (Matching Admin Layout) ───────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-zinc-500 dark:text-zinc-400">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-zinc-900 dark:text-zinc-100 font-medium">
                  Inventory & Stock
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            Kitchen Inventory & Recipe Control
          </h1>
        </div>

        {/* Header Quick Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold h-8 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReceiveModal(true)}
            disabled={!restaurantId || ingredients.length === 0}
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold h-8 rounded-lg"
          >
            <PackagePlus className="w-3.5 h-3.5 mr-1.5" />
            Receive Delivery
          </Button>

          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            disabled={!restaurantId}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-8 rounded-lg shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Ingredient
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* ── Metric KPI Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Boxes className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {totalItems}
              </p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                Tracked Ingredients
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Kitchen raw materials</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Reorder
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                {lowStockCount}
              </p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                Low Stock Alerts
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">At or below reorder threshold</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-rose-500" />
              </div>
              {outOfStockCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  Critical
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                {outOfStockCount}
              </p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                Depleted / Out of Stock
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Needs immediate supplier restock</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                Asset
              </span>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                ₹{totalValuation.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                Total Stock Valuation
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Estimated on-hand inventory value</p>
            </div>
          </div>
        </div>

        {/* ── Sub-Tab Switcher (Signature Pangat Pill Tabs) ───────────────────── */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("INGREDIENTS")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "INGREDIENTS"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Ingredients & Stock Levels ({ingredients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RECIPES")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "RECIPES"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Dish Recipes ({recipes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LEDGER")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "LEDGER"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audited Movement Ledger</span>
          </button>
        </div>

        {/* ── Tab 1: Ingredients & Stock Levels ──────────────────────────────── */}
        {activeTab === "INGREDIENTS" && (
          <div className="space-y-4">
            {/* Search & Stock Filter Bar */}
            <div className="flex items-center gap-3 flex-wrap justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <Input
                  placeholder="Search ingredients or SKU..."
                  className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs rounded-xl h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    { key: "ALL", label: `All (${ingredients.length})` },
                    { key: "HEALTHY", label: "Healthy" },
                    { key: "LOW", label: `Low Stock (${lowStockCount})` },
                    { key: "OUT", label: `Out of Stock (${outOfStockCount})` },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStockFilter(f.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                      stockFilter === f.key
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-200 dark:border-zinc-800/80 hover:bg-transparent">
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Ingredient</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Unit</TableHead>
                    <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Available Stock</TableHead>
                    <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Reorder Threshold</TableHead>
                    <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Cost / Unit</TableHead>
                    <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Est. Valuation</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Status</TableHead>
                    <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngredients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Package className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            No ingredients found
                          </p>
                          <p className="text-xs text-zinc-500">
                            Add raw materials to start recipe-based inventory deductions.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIngredients.map((ing) => {
                      const stock = Number(ing.currentStock)
                      const min = Number(ing.minimumStock)
                      const cost = Number(ing.costPerUnit || 0)
                      const value = Math.max(0, stock) * cost

                      const isOut = stock <= 0
                      const isLow = !isOut && min > 0 && stock <= min

                      return (
                        <TableRow
                          key={ing.id}
                          className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <TableCell>
                            <div>
                              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                {ing.name}
                              </p>
                              {ing.sku && (
                                <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                                  SKU: {ing.sku}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 px-2 py-0.5 rounded uppercase">
                              {ing.unit}
                            </span>
                          </TableCell>

                          <TableCell className="text-right font-mono font-bold">
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
                          </TableCell>

                          <TableCell className="text-right font-mono text-xs text-zinc-500">
                            {min > 0 ? `${min} ${ing.unit}` : "—"}
                          </TableCell>

                          <TableCell className="text-right font-mono text-xs text-zinc-700 dark:text-zinc-300">
                            ₹{cost.toFixed(2)}
                          </TableCell>

                          <TableCell className="text-right font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
                            ₹{value.toFixed(2)}
                          </TableCell>

                          <TableCell>
                            {isOut ? (
                              <span className="font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30 text-[11px] inline-flex items-center gap-1.5">
                                <XCircle className="h-3 w-3 text-rose-400" />
                                <span>Out of Stock</span>
                              </span>
                            ) : isLow ? (
                              <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 text-[11px] inline-flex items-center gap-1.5">
                                <AlertTriangle className="h-3 w-3 text-amber-400" />
                                <span>Low Stock</span>
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[11px] inline-flex items-center gap-1.5">
                                <span>Healthy</span>
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAdjustingIngredient(ing)}
                              className="h-7 text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
                            >
                              <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
                              <span>Adjust</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── Tab 2: Dish Recipes ────────────────────────────────────────────── */}
        {activeTab === "RECIPES" && (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
              <ChefHat className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-bold text-zinc-100 text-sm">Automatic Kitchen Order Deduction</p>
                <p className="text-zinc-400 mt-0.5">
                  When a diner or steward confirms an order into RECEIVED, Pangat consults these dish recipes and deducts ingredients in concurrency-safe database transactions.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-200 dark:border-zinc-800/80 hover:bg-transparent">
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Menu Dish</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Price</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Recipe Status</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Ingredients Breakdown</TableHead>
                    <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => {
                    const recipe = recipes.find((r) => r.menuItemId === item.id)

                    return (
                      <TableRow
                        key={item.id}
                        className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <TableCell>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                            {item.name}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono font-medium text-xs text-zinc-700 dark:text-zinc-300">
                            ₹{item.price}
                          </span>
                        </TableCell>

                        <TableCell>
                          {recipe ? (
                            <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[11px] inline-flex items-center gap-1.5">
                              <span>Active (v{recipe.version})</span>
                            </span>
                          ) : (
                            <span className="text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[11px] inline-flex items-center">
                              No Recipe
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          {recipe && recipe.ingredients && recipe.ingredients.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {recipe.ingredients.map((ri, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded text-zinc-700 dark:text-zinc-300 font-mono"
                                >
                                  {ri.ingredient?.name || "Ing"}: {ri.quantity} {ri.unit}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-500 italic">No ingredients linked</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRecipeMenuItem(item)}
                            className="h-7 text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5"
                          >
                            <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                            <span>{recipe ? "Edit Recipe" : "Attach Recipe"}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── Tab 3: Movement Ledger ────────────────────────────────────────── */}
        {activeTab === "LEDGER" && (
          <StockMovementsLedger restaurantId={restaurantId} />
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
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
