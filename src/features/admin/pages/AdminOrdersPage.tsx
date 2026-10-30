import { useState, useEffect, useMemo } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { api } from "@/lib/api"
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  Archive,
  Receipt,
  Calendar,
  Printer,
  RotateCcw,
  Star,
  MessageSquare,
  ShoppingBag,
  Bike,
  Utensils,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaymentStatus, Order, OrderType } from "@/types/domain"

function formatDateTime(dateInput: Date | string | undefined): string {
  if (!dateInput) return "—"
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function formatElapsed(dateInput: Date | string): string {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return "Recently"
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 60) return `${Math.max(0, mins)}m ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  PAID: {
    label: "Settled / Paid",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Payment Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: Clock,
  },
  FAILED: {
    label: "Failed",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    icon: XCircle,
  },
  REFUND_PENDING: {
    label: "Refund Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: Clock,
  },
  PARTIALLY_REFUNDED: {
    label: "Partially Refunded",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
    icon: CheckCircle2,
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-zinc-400",
    bg: "bg-zinc-700/20 border-zinc-600 text-zinc-400",
    icon: CheckCircle2,
  },
}

export function AdminOrdersPage() {
  const activeOrders = useAdminStore((s) => s.activeOrders)
  const settleOrder = useAdminStore((s) => s.settleOrder)
  const archiveOrder = useAdminStore((s) => s.archiveOrder)
  const cancelOrder = useAdminStore((s) => s.cancelOrder)
  const processRefund = useAdminStore((s) => s.processRefund)
  const currentOutlet = useAuthStore((s) => s.currentOutlet)
  const outletSlug = currentOutlet?.slug || "pangat"

  // Sub-tab: "active" | "archived"
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")

  // Shared search & filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<OrderType | "all">("all")

  // Archived Tab Date filters
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([])
  const [loadingArchived, setLoadingArchived] = useState(false)

  // Modals state
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null)
  const [selectedFeedbackOrder, setSelectedFeedbackOrder] = useState<Order | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [refundOrder, setRefundOrder] = useState<Order | null>(null)
  const [refundAmount, setRefundAmount] = useState("")
  const [refundReason, setRefundReason] = useState("")
  const [refundMethod, setRefundMethod] = useState<'COUNTER_CASH' | 'PROVIDER_CONFIRMED'>('COUNTER_CASH')

  // Fetch Archived Orders from API
  const fetchArchivedOrders = async () => {
    setLoadingArchived(true)
    try {
      const orders = await api.orders.list(outletSlug, {
        status: "ARCHIVED",
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setArchivedOrders(orders)
    } catch (err) {
      console.warn("Failed to fetch archived orders from API:", err)
      // Fallback: use active orders filtered strictly by completed
      const fallback = activeOrders.filter(
        (o) => o.orderStatus === "COMPLETED"
      )
      setArchivedOrders(fallback)
    } finally {
      setLoadingArchived(false)
    }
  }

  useEffect(() => {
    if (activeTab === "archived") {
      fetchArchivedOrders()
    }
  }, [activeTab, outletSlug, startDate, endDate])

  // Active orders filtered: strictly exclude COMPLETED and CANCELLED
  const activeFiltered = useMemo(() => {
    return activeOrders.filter((order) => {
      if (order.orderStatus === "COMPLETED" || order.orderStatus === "CANCELLED") return false
      const matchSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        (order.tableNumber ?? "").includes(search) ||
        (order.customerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        order.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === "all" || order.paymentStatus === statusFilter
      const matchType = typeFilter === "all" || (order.orderType || "DINE_IN") === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [activeOrders, search, statusFilter, typeFilter])

  // Archived orders filtered: include COMPLETED and CANCELLED
  const archivedFiltered = useMemo(() => {
    return archivedOrders.filter((order) => {
      if (order.orderStatus !== "COMPLETED" && order.orderStatus !== "CANCELLED") return false
      const matchSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        (order.tableNumber ?? "").includes(search) ||
        (order.customerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        order.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === "all" || order.paymentStatus === statusFilter
      const matchType = typeFilter === "all" || (order.orderType || "DINE_IN") === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [archivedOrders, search, statusFilter, typeFilter])

  const currentDisplayList = activeTab === "active" ? activeFiltered : archivedFiltered

  const totalRevenue = currentDisplayList
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

  const handlePrintReceipt = () => {
    window.print()
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-950 text-zinc-100">
      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-zinc-500">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-zinc-100 font-medium">
                  Orders & Settlements
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-100 mt-1">Orders & Settlements</h1>
        </div>

        <div className="text-right">
          <p className="text-xs text-zinc-500">
            {activeTab === "active" ? "Active Shift Revenue" : "Archived Revenue"}
          </p>
          <p className="text-lg font-black text-emerald-400">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-5">
        {/* ── Sub-Tab Navigation Header ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
                activeTab === "active"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Active Orders ({activeOrders.filter((o) => o.orderStatus !== "COMPLETED").length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("archived")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
                activeTab === "archived"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived / Past Orders</span>
            </button>
          </div>

          {/* Archived Date Filters */}
          {activeTab === "archived" && (
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-500 text-[11px]">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-0 text-zinc-200 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-500 text-[11px]">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-0 text-zinc-200 text-xs focus:outline-none"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("")
                    setEndDate("")
                  }}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Clear Dates"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Search & Status Filters ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search order ID, table number, item..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Order Type Filter */}
            {(["all", "DINE_IN", "TAKEAWAY", "DELIVERY"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5",
                  typeFilter === t
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                {t === "all" ? (
                  "All Types"
                ) : t === "DINE_IN" ? (
                  <><Utensils className="h-3 w-3" /> Dine-In</>
                ) : t === "TAKEAWAY" ? (
                  <><ShoppingBag className="h-3 w-3" /> Takeaway</>
                ) : (
                  <><Bike className="h-3 w-3" /> Delivery</>
                )}
              </button>
            ))}

            <div className="w-[1px] h-5 bg-zinc-800 mx-1" />

            {/* Payment Filter */}
            {(["all", "PAID", "PENDING", "FAILED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                  statusFilter === s
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                {s === "all" ? "All Payments" : s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Orders Table ────────────────────────────────────────────────────── */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                <TableHead className="text-zinc-400">Order ID</TableHead>
                <TableHead className="text-zinc-400">Placed Date & Time</TableHead>
                <TableHead className="text-zinc-400">Fulfillment / Table</TableHead>
                <TableHead className="text-zinc-400">Items</TableHead>
                <TableHead className="text-zinc-400">Payment Method</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Settled At</TableHead>
                <TableHead className="text-zinc-400">Total (₹)</TableHead>
                <TableHead className="text-right text-zinc-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDisplayList.map((order) => {
                const payment = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.PENDING
                const PayIcon = payment.icon

                const paymentMethod = order.paymentMethod || "UPI_INSTANT"
                const settlementTime = order.settledAt
                  ? formatDateTime(order.settledAt)
                  : order.paymentStatus === "PAID"
                  ? formatDateTime(order.createdAt)
                  : "—"

                return (
                  <TableRow
                    key={order.id}
                    className="border-zinc-800/50 hover:bg-zinc-850/50 transition-colors"
                  >
                    <TableCell>
                      <span className="font-mono text-xs text-zinc-300 bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 rounded">
                        #{order.id.slice(-6)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">
                          {formatDateTime(order.createdAt)}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {formatElapsed(order.createdAt)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {order.orderType === "TAKEAWAY" ? (
                        <span className="font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 text-xs inline-flex items-center gap-1.5">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>{order.customerName || "Takeaway"}</span>
                        </span>
                      ) : order.orderType === "DELIVERY" ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30 text-xs inline-flex items-center gap-1.5 w-fit">
                            <Bike className="h-3.5 w-3.5" />
                            <span>{order.customerName || "Delivery"}</span>
                          </span>
                          {order.deliveryAddress && (
                            <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                              {order.deliveryAddress}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700 text-xs inline-flex items-center gap-1.5">
                          <Utensils className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Table {order.tableNumber || "—"}</span>
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-0.5 max-w-[200px]">
                        {order.items.map((item, i) => (
                          <span key={i} className="text-xs text-zinc-300 truncate">
                            <strong className="text-emerald-400 font-bold">{item.quantity}×</strong>{" "}
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1",
                          paymentMethod === "UPI_INSTANT"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                        )}
                      >
                        {paymentMethod === "UPI_INSTANT" ? "⚡ UPI Instant" : "🏢 Pay at Counter"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold",
                          payment.bg,
                          payment.color
                        )}
                      >
                        <PayIcon className="h-3 w-3" />
                        <span>{payment.label}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-zinc-400 font-mono tabular-nums">
                        {settlementTime}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-extrabold text-white text-sm">
                        ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.paymentStatus !== "PAID" && activeTab === "active" && (
                          <button
                            type="button"
                            onClick={() => settleOrder(order.id, "PAID")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Check className="h-3 w-3" />
                            <span>Mark Paid</span>
                          </button>
                        )}

                        {activeTab === "active" && order.orderType === "DELIVERY" && order.orderStatus === "READY" && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await api.orders.updateStatus(order.id, "DISPATCHED")
                                fetchArchivedOrders()
                              } catch (e: any) {
                                alert(e?.response?.data?.message || "Failed to dispatch order")
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                            title="Dispatch delivery order"
                          >
                            <Bike className="h-3 w-3" />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {activeTab === "active" && order.orderType === "DELIVERY" && order.orderStatus === "DISPATCHED" && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await api.orders.updateStatus(order.id, "COMPLETED")
                                fetchArchivedOrders()
                              } catch (e: any) {
                                alert(e?.response?.data?.message || "Failed to mark delivered")
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                            title="Mark delivery completed"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Delivered</span>
                          </button>
                        )}

                        {activeTab === "active" && order.orderStatus !== "COMPLETED" && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingOrder(order)
                              setCancelReason("")
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                            title="Cancel Order"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Cancel</span>
                          </button>
                        )}

                        {(order.paymentStatus === "REFUND_PENDING" || order.paymentStatus === "PARTIALLY_REFUNDED") && (
                          <button
                            type="button"
                            onClick={() => {
                              setRefundOrder(order)
                              const remaining = Math.max(0, Number(order.totalAmount || 0) - Number(order.refundAmount || 0))
                              setRefundAmount(remaining > 0 ? remaining.toString() : "")
                              setRefundReason("")
                              setRefundMethod("COUNTER_CASH")
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors cursor-pointer"
                            title="Process Refund"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Refund</span>
                          </button>
                        )}

                        {activeTab === "active" && (
                          <button
                            type="button"
                            onClick={async () => {
                              await archiveOrder(order.id)
                              fetchArchivedOrders()
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
                            title="Archive completed order"
                          >
                            <Archive className="h-3 w-3 text-zinc-400" />
                            <span>Archive</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedFeedbackOrder(order)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer",
                            order.feedback
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border-zinc-700"
                          )}
                          title="View Customer Feedback & Rating"
                        >
                          <Star
                            className={cn(
                              "h-3 w-3",
                              order.feedback ? "text-amber-400 fill-amber-400" : "text-zinc-500"
                            )}
                          />
                          <span>{order.feedback ? `${order.feedback.rating}★` : "Feedback"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
                          title="View Itemized Receipt Drawer"
                        >
                          <Receipt className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}

              {currentDisplayList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <Clock className="h-8 w-8 mb-2 text-zinc-600" />
                      <p className="text-sm font-semibold text-zinc-300">
                        {loadingArchived
                          ? "Loading archived orders..."
                          : "No orders found in this view"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                        {activeTab === "active"
                          ? "No active orders match current search filters."
                          : "No past or archived orders found for selected date filters."}
                      </p>
                      {(search || statusFilter !== "all" || startDate || endDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("")
                            setStatusFilter("all")
                            setStartDate("")
                            setEndDate("")
                          }}
                          className="mt-3 text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Expandable Itemized Receipt Drawer / Dialog ──────────────────────── */}
      <Dialog
        open={Boolean(selectedReceiptOrder)}
        onOpenChange={(open) => !open && setSelectedReceiptOrder(null)}
      >
        <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
          {selectedReceiptOrder && (
            <div className="flex flex-col max-h-[85vh]">
              {/* Receipt Header */}
              <div className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 text-center relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 mb-2">
                  <Receipt className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white">Itemized Tax Invoice</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pangat Zero-Hardware Hospitality Cockpit
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-left bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Order Token</span>
                    <span className="font-mono font-bold text-emerald-400">
                      #{selectedReceiptOrder.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Fulfillment</span>
                    <span className="font-bold text-white">
                      {selectedReceiptOrder.orderType === "TAKEAWAY"
                        ? `Takeaway (${selectedReceiptOrder.customerName || "Parcel"})`
                        : selectedReceiptOrder.orderType === "DELIVERY"
                        ? `Delivery (${selectedReceiptOrder.customerName || "Customer"})`
                        : `Table ${selectedReceiptOrder.tableNumber || "—"}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Date & Time</span>
                    <span className="text-zinc-300">
                      {formatDateTime(selectedReceiptOrder.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Payment Mode</span>
                    <span className="text-zinc-300 font-semibold">
                      {selectedReceiptOrder.paymentMethod === "PAY_AT_COUNTER"
                        ? "Counter Cash / Card"
                        : "UPI Direct"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Items Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Billed Line Items
                  </p>
                  {selectedReceiptOrder.items.map((item, idx) => {
                    const modSum = (item.selectedModifiers || []).reduce(
                      (acc, m) => acc + Number(m.price || 0),
                      0
                    )
                    const itemTotal = (Number(item.price) + modSum) * item.quantity

                    return (
                      <div
                        key={idx}
                        className="flex items-start justify-between py-1.5 border-b border-zinc-900 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                            <span className="text-emerald-400 font-bold">{item.quantity}×</span>
                            <span>{item.name}</span>
                          </div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[11px] text-zinc-500 pl-4">
                              + {item.selectedModifiers.map((m) => m.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-zinc-200 tabular-nums">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Subtotal & Taxes */}
                <div className="pt-2 border-t border-dashed border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      ₹
                      {(
                        Number(selectedReceiptOrder.totalAmount) -
                        Number(selectedReceiptOrder.gstAmount || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>GST (5%)</span>
                    <span className="tabular-nums">
                      ₹{Number(selectedReceiptOrder.gstAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-zinc-800">
                    <span>Grand Total Settled</span>
                    <span className="text-emerald-400 tabular-nums">
                      ₹{Number(selectedReceiptOrder.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Settlement Badge */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Settlement Status</span>
                  </div>
                  <span className="font-bold font-mono">
                    {selectedReceiptOrder.paymentStatus === "PAID"
                      ? "PAID & CLOSED"
                      : "PENDING"}
                  </span>
                </div>
              </div>

              {/* Receipt Footer Controls */}
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="border-zinc-800 text-zinc-400 hover:text-white text-xs cursor-pointer"
                >
                  Close
                </Button>

                <Button
                  onClick={handlePrintReceipt}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Order Customer Feedback Dialog ──────────────────────────────────── */}
      <Dialog
        open={Boolean(selectedFeedbackOrder)}
        onOpenChange={(open) => !open && setSelectedFeedbackOrder(null)}
      >
        <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
          {selectedFeedbackOrder && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="p-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Diner Feedback & Rating</h2>
                    <p className="text-xs text-zinc-400">
                      Table {selectedFeedbackOrder.tableNumber} • #{selectedFeedbackOrder.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {selectedFeedbackOrder.feedback ? (
                  <div className="space-y-4">
                    {/* Rating Stars Banner */}
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold block">
                          Customer Score
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-2xl font-black text-amber-400">
                            {selectedFeedbackOrder.feedback.rating}.0
                          </span>
                          <span className="text-xs text-zinc-500">/ 5.0</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-5 h-5",
                              star <= selectedFeedbackOrder.feedback!.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-zinc-700 fill-zinc-800"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Predefined Quick Tags */}
                    {selectedFeedbackOrder.feedback.tags && selectedFeedbackOrder.feedback.tags.length > 0 && (
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                          Highlights & Tags
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedFeedbackOrder.feedback.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                            >
                              ✨ {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Diner Comment (up to 250 characters) */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                        Diner's Review Comment
                      </label>
                      {selectedFeedbackOrder.feedback.comment ? (
                        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 italic leading-relaxed">
                          "{selectedFeedbackOrder.feedback.comment}"
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No written comment left by diner.</p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
                      <span>Submitted on</span>
                      <span>{formatDateTime(selectedFeedbackOrder.feedback.submittedAt)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 space-y-2">
                    <MessageSquare className="w-10 h-10 mx-auto text-zinc-700" />
                    <p className="text-sm font-semibold text-zinc-300">
                      No feedback submitted yet
                    </p>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                      The diner has not submitted a rating or review for Table {selectedFeedbackOrder.tableNumber} yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFeedbackOrder(null)}
                  className="border-zinc-800 text-zinc-300 hover:text-white text-xs cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Cancel Order Dialog ────────────────────────────────────────────── */}
      <Dialog open={Boolean(cancellingOrder)} onOpenChange={(open) => !open && setCancellingOrder(null)}>
        <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100 p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
            <XCircle className="w-5 h-5" />
            <span>Cancel Order #{cancellingOrder?.id.slice(-6).toUpperCase()}</span>
          </div>
          <p className="text-xs text-zinc-400">
            Cancelling this order is an audited action. If the order was already paid, a refund request will automatically be created.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Mandatory Cancellation Reason</label>
            <Input
              placeholder="e.g. Diner changed mind, kitchen stock issue"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-zinc-100 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCancellingOrder(null)} className="border-zinc-800 text-zinc-400 text-xs">
              Back
            </Button>
            <Button
              size="sm"
              disabled={!cancelReason.trim()}
              onClick={async () => {
                if (cancellingOrder && cancelReason.trim()) {
                  try {
                    await cancelOrder(cancellingOrder.id, cancelReason.trim())
                    setCancellingOrder(null)
                  } catch (e) {
                    alert((e as any)?.response?.data?.message || 'Failed to cancel order')
                  }
                }
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
            >
              Confirm Cancellation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Process Refund Dialog ──────────────────────────────────────────── */}
      <Dialog open={Boolean(refundOrder)} onOpenChange={(open) => !open && setRefundOrder(null)}>
        <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100 p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
            <RotateCcw className="w-5 h-5" />
            <span>Process Refund for Order #{refundOrder?.id.slice(-6).toUpperCase()}</span>
          </div>
          <p className="text-xs text-zinc-400">
            Total Order Amount: ₹{Number(refundOrder?.totalAmount || 0).toFixed(2)} | Already Refunded: ₹{Number(refundOrder?.refundAmount || 0).toFixed(2)}
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Refund Amount (₹)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Refund Settlement Method</label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
              >
                <option value="COUNTER_CASH">Counter Cash Refund</option>
                <option value="PROVIDER_CONFIRMED">Verified Provider Gateway Refund</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Refund Reason</label>
              <Input
                placeholder="e.g. Overcharged, cancelled by guest"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRefundOrder(null)} className="border-zinc-800 text-zinc-400 text-xs">
              Back
            </Button>
            <Button
              size="sm"
              disabled={!refundAmount || Number(refundAmount) <= 0 || !refundReason.trim()}
              onClick={async () => {
                if (refundOrder && refundAmount && refundReason.trim()) {
                  try {
                    await processRefund(refundOrder.id, {
                      refundMethod,
                      amount: Number(refundAmount),
                      reason: refundReason.trim(),
                      idempotencyKey: `refund_${refundOrder.id}_${Date.now()}`,
                    })
                    setRefundOrder(null)
                  } catch (e) {
                    alert((e as any)?.response?.data?.message || 'Failed to process refund')
                  }
                }
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Confirm Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
