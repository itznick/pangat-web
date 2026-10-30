import { useState, useCallback, useMemo } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { useKdsStore } from "@/stores/useKdsStore"
import { api } from "@/lib/api"
import { ZeroStateCard } from "../components/ZeroStateCard"
import { AddOutletModal } from "../components/AddOutletModal"
import {
  TrendingUp,
  Users,
  Timer,
  FileStack,
  ArrowUpRight,
  IndianRupee,
  Plus,
  Package,
  CheckCircle2,
  XCircle,
  X,
  Zap,
  Clock,
} from "lucide-react"
import { cn, isSameTableNumber } from "@/lib/utils"
import { TableDrawer } from "../components/dashboard/TableDrawer"
import { PaymentBreakdownWidget } from "../components/dashboard/PaymentBreakdownWidget"
import type { Table, Order, TableStatus } from "@/types/domain"

// ── Metric Card ────────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: typeof TrendingUp
  trend?: number
  accentClass: string
  bgClass: string
  iconBgClass: string
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentClass,
  bgClass,
  iconBgClass,
}: MetricCardProps) {
  return (
    <div className={cn("rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-3 shadow-xs", bgClass)}>
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBgClass)}>
          <Icon className={cn("h-5 w-5", accentClass)} />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
              trend >= 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            <ArrowUpRight className={cn("h-3 w-3", trend < 0 && "rotate-90")} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className={cn("text-2xl font-black tracking-tight", accentClass)}>{value}</p>
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{title}</p>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

// ── Quick Walk-in Dialog ───────────────────────────────────────────────────────

interface WalkInDialogProps {
  open: boolean
  onClose: () => void
}

function WalkInDialog({ open, onClose }: WalkInDialogProps) {
  const tables = useAdminStore((s) => s.tables)
  const menuItems = useAdminStore((s) => s.menuItems)
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [cart, setCart] = useState<Record<string, number>>({})

  const vacantTables = tables.filter((t) => t.status === "VACANT")

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = menuItems.find((m) => m.id === id)
      return sum + (item ? item.price * qty : 0)
    }, 0)
  }, [cart, menuItems])

  const itemCount = Object.values(cart).reduce((s, q) => s + q, 0)

  const adjustCart = (id: string, delta: number) => {
    setCart((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }
      if (next[id] === 0) delete next[id]
      return next
    })
  }

  const handleConfirm = async () => {
    const targetTable = tables.find((t) => t.id === selectedTable)
    if (!targetTable) return

    const orderItems = Object.entries(cart).map(([id, qty]) => {
      const item = menuItems.find((m) => m.id === id)!
      return {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: qty,
      }
    })

    try {
      const created = await api.orders.create(
        {
          restaurantSlug: 'pangat',
          orderType: 'DINE_IN',
          tableNumber: targetTable.tableNumber,
          paymentMethod: 'PAY_AT_COUNTER' as any,
          items: orderItems,
        },
        `idemp-walkin-${Date.now()}`
      )
      useAdminStore.getState().addOrder(created)
      useAdminStore.getState().updateTableStatus(targetTable.id, 'PREPPING')
    } catch (err) {
      console.error('Failed to place walk-in order:', err)
    }

    onClose()
    setSelectedTable("")
    setCart({})
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-zinc-900 border border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Plus className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-zinc-100">
                Quick Walk-in Order
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Select a vacant table, add items, and fire to kitchen.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Table selector */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">
              Select Table
            </label>
            <div className="grid grid-cols-6 gap-2">
              {vacantTables.length === 0 ? (
                <p className="col-span-6 text-xs text-zinc-500 text-center py-4">
                  No vacant tables available.
                </p>
              ) : (
                vacantTables.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTable(t.id)}
                    className={cn(
                      "h-10 rounded-xl border text-sm font-bold transition-all",
                      selectedTable === t.id
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/40"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                    )}
                  >
                    {t.tableNumber}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Menu quick-add */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">
              Add Items
            </label>
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {menuItems
                .filter((m) => m.isAvailable)
                .slice(0, 12)
                .map((item) => {
                  const qty = cart[item.id] ?? 0
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-zinc-800/60"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 leading-snug">{item.name}</p>
                        <p className="text-[11px] text-zinc-500">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => adjustCart(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-bold"
                            >
                              −
                            </button>
                            <span className="text-sm font-bold text-zinc-100 w-4 text-center">{qty}</span>
                          </>
                        )}
                        <button
                          onClick={() => adjustCart(item.id, 1)}
                          className={cn(
                            "w-6 h-6 rounded-lg border flex items-center justify-center text-sm font-bold transition-colors",
                            qty > 0
                              ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                          )}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Cart summary */}
          {itemCount > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-xs font-semibold text-emerald-300">
                {itemCount} item{itemCount !== 1 ? "s" : ""} in order
              </span>
              <span className="text-sm font-black text-emerald-400">₹{cartTotal}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTable || itemCount === 0}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white border border-emerald-500/50 transition-colors shadow-lg shadow-emerald-900/30 flex items-center gap-2"
          >
            <Zap className="h-3.5 w-3.5" />
            Fire to Kitchen
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Out of Stock Toggle Popover ─────────────────────────────────────────────

interface StockTogglePanelProps {
  open: boolean
  onClose: () => void
}

function StockTogglePanel({ open, onClose }: StockTogglePanelProps) {
  const menuItems = useAdminStore((s) => s.menuItems)
  const outOfStockIds = useKdsStore((s) => s.outOfStockIds)
  const toggleOutOfStock = useKdsStore((s) => s.toggleOutOfStock)
  const toggleMenuAvailability = useAdminStore((s) => s.toggleMenuAvailability)

  const handleToggle = (id: string) => {
    toggleOutOfStock(id)
    toggleMenuAvailability(id)
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute top-full right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-200",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div>
            <p className="text-xs font-bold text-zinc-100">Stock Availability</p>
            <p className="text-[11px] text-zinc-500">Mark items in/out of stock instantly</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {menuItems.map((item) => {
            const isOutOfStock = outOfStockIds.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all",
                  isOutOfStock
                    ? "bg-rose-950/30 border-rose-500/40 hover:border-rose-500/60"
                    : "bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-600"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 truncate">{item.name}</p>
                  <p className="text-[10px] text-zinc-500">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                      isOutOfStock
                        ? "text-rose-300 bg-rose-500/20 border-rose-500/30"
                        : "text-emerald-300 bg-emerald-500/20 border-emerald-500/30"
                    )}
                  >
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                  {isOutOfStock ? (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Main Dashboard Page ────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const restaurant = useAdminStore((s) => s.restaurant)
  const todaySales = useAdminStore((s) => s.todaySales)
  const tables = useAdminStore((s) => s.tables)
  const activeOrders = useAdminStore((s) => s.activeOrders)
  const outlets = useAuthStore((s) => s.outlets)

  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [showStockToggle, setShowStockToggle] = useState(false)
  const [addOutletOpen, setAddOutletOpen] = useState(false)

  // Helper: compute true live status based on real kitchen & settlement state
  const getTableEffectiveStatus = useCallback(
    (table: Table): TableStatus => {
      const ordersForTable = activeOrders.filter((o) => isSameTableNumber(o.tableNumber, table.tableNumber))
      const openOrders = ordersForTable.filter((o) => o.orderStatus !== "COMPLETED")

      if (openOrders.length > 0) {
        // If kitchen is actively preparing/received, it is PREPPING
        const isCooking = openOrders.some(
          (o) => o.orderStatus === "RECEIVED" || o.orderStatus === "PREPARING"
        )
        if (isCooking) return "PREPPING"

        // Kitchen is done (READY). If unpaid tab exists -> OCCUPIED
        const hasUnpaid = openOrders.some((o) => o.paymentStatus === "PENDING")
        if (hasUnpaid) return "OCCUPIED"

        // Food is ready/served, and bill is settled!
        return "SERVED"
      }

      // If no open orders, check if manually marked OCCUPIED (e.g. guests seated before order)
      if (table.status === "OCCUPIED") {
        return "OCCUPIED"
      }

      // No open orders and not explicitly occupied -> VACANT
      return "VACANT"
    },
    [activeOrders]
  )

  const occupiedCount = tables.filter((t) => getTableEffectiveStatus(t) !== "VACANT").length
  const vacantCount = tables.filter((t) => getTableEffectiveStatus(t) === "VACANT").length

  // Helper: get active order for a table (most recent non-completed)
  const getTableOrder = useCallback(
    (tableNumber: string): Order | undefined =>
      activeOrders.find(
        (o) => isSameTableNumber(o.tableNumber, tableNumber) && o.orderStatus !== "COMPLETED"
      ),
    [activeOrders]
  )

  const elapsedLabel = (createdAt: Date | string): string => {
    const mins = Math.round((Date.now() - new Date(createdAt).getTime()) / 60_000)
    return mins < 1 ? "<1m" : `${mins}m`
  }

  const statusColors: Record<TableStatus, string> = {
    VACANT:   "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 shadow-sm",
    OCCUPIED: "bg-rose-50 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/50 text-rose-800 dark:text-rose-300 font-bold shadow-sm",
    PREPPING: "bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold shadow-sm",
    SERVED:   "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm",
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-zinc-500 dark:text-zinc-400">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-zinc-900 dark:text-zinc-100 font-medium">Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">Live Cockpit</h1>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Live badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
          </div>

          {/* Stock Status Quick Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowStockToggle((p) => !p)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                showStockToggle
                  ? "bg-rose-600/20 border-rose-500/60 text-rose-600 dark:text-rose-300"
                  : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <Package className="h-3.5 w-3.5" />
              Stock Status
            </button>
            <StockTogglePanel
              open={showStockToggle}
              onClose={() => setShowStockToggle(false)}
            />
          </div>

          {/* Quick Walk-in Order */}
          <button
            onClick={() => setShowWalkIn(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border border-emerald-500/50 shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Quick Walk-in Order
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {!restaurant && (!outlets || outlets.length === 0) ? (
          <div className="py-6">
            <ZeroStateCard onAddOutlet={() => setAddOutletOpen(true)} />
            <AddOutletModal
              open={addOutletOpen}
              onClose={() => setAddOutletOpen(false)}
            />
          </div>
        ) : (
          <>
            {/* ── Metric Cards ──────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Gross Revenue"
            value={`₹${todaySales.totalRevenue.toLocaleString("en-IN")}`}
            subtitle="Gross volume today"
            icon={IndianRupee}
            trend={12}
            accentClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-white dark:bg-emerald-950/20 border-zinc-200 dark:border-zinc-800"
            iconBgClass="bg-emerald-500/15"
          />
          <MetricCard
            title="Total Covers"
            value={todaySales.totalCovers}
            subtitle="Guests served today"
            icon={Users}
            trend={8}
            accentClass="text-blue-600 dark:text-blue-400"
            bgClass="bg-white dark:bg-blue-950/20 border-zinc-200 dark:border-zinc-800"
            iconBgClass="bg-blue-500/15"
          />
          <MetricCard
            title="Avg. Prep Time"
            value={todaySales.avgPrepTimeMinutes > 0 ? `${todaySales.avgPrepTimeMinutes}m` : "–"}
            subtitle="Per kitchen ticket"
            icon={Timer}
            trend={todaySales.avgPrepTimeMinutes > 0 ? -5 : undefined}
            accentClass="text-amber-600 dark:text-amber-400"
            bgClass="bg-white dark:bg-amber-950/20 border-zinc-200 dark:border-zinc-800"
            iconBgClass="bg-amber-500/15"
          />
          <MetricCard
            title="Active KOTs"
            value={todaySales.activeKotCount}
            subtitle="Open kitchen tickets"
            icon={FileStack}
            accentClass="text-violet-600 dark:text-violet-400"
            bgClass="bg-white dark:bg-violet-950/20 border-zinc-200 dark:border-zinc-800"
            iconBgClass="bg-violet-500/15"
          />
        </div>

        {/* ── Split Layout ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-5 items-stretch">
          {/* ── Left Column (60%) ─────────────────────────────────────────────── */}
          <div className="flex flex-col min-w-0">
            {/* Interactive Table Heatmap */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex-1 flex flex-col shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Floor Table Heatmap</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Tap any table to view active order & actions</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-zinc-300 dark:bg-zinc-700" />
                    Vacant ({vacantCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                    Active ({occupiedCount})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2.5 flex-1 content-start">
                {tables.length === 0 ? (
                  <div className="col-span-6 py-8 text-center text-xs text-zinc-500">
                    No tables configured for this branch yet. Use Floor & Tables to generate or manage table batches.
                  </div>
                ) : (
                  tables.map((table) => {
                    const currentStatus = getTableEffectiveStatus(table)
                    const order = getTableOrder(table.tableNumber)
                    const elapsed = order ? elapsedLabel(order.createdAt) : null
                    const unbilled =
                      order && order.paymentStatus === "PENDING"
                        ? order.totalAmount
                        : null
                    const isActive = currentStatus !== "VACANT"

                    return (
                      <button
                        key={table.id}
                        onClick={() => isActive && setSelectedTable({ ...table, status: currentStatus })}
                        className={cn(
                          "rounded-xl border p-2.5 flex flex-col items-center gap-1 transition-all duration-200",
                          statusColors[currentStatus],
                          isActive
                            ? "hover:scale-105 hover:shadow-lg cursor-pointer ring-0 hover:ring-1 hover:ring-white/10"
                            : "cursor-default opacity-60"
                        )}
                        title={isActive ? `Table ${table.tableNumber} (${currentStatus}) — click to view order` : undefined}
                      >
                        <span className="text-sm font-black leading-none">
                          {table.tableNumber}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">
                          {currentStatus}
                        </span>
                      {elapsed && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Clock className="h-2.5 w-2.5 opacity-70" />
                          <span className="text-[9px] font-semibold">{elapsed}</span>
                        </div>
                      )}
                      {unbilled != null && (
                        <span className="text-[9px] font-bold opacity-90 mt-0.5">
                          ₹{Math.round(unbilled)}
                        </span>
                      )}
                    </button>
                  )
                }))}
              </div>
            </div>
          </div>

          {/* ── Right Column (40%) ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <PaymentBreakdownWidget />
          </div>
        </div>
        </>
        )}
      </div>

      {/* ── Overlays / Drawers ──────────────────────────────────────────────────── */}
      <TableDrawer
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
      />
      <WalkInDialog open={showWalkIn} onClose={() => setShowWalkIn(false)} />
    </div>
  )
}
