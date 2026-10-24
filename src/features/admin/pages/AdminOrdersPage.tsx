import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { useAdminStore } from "@/stores/useAdminStore"
import { Search, CheckCircle2, Clock, XCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaymentStatus, OrderStatus } from "@/types/domain"

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
}

function formatElapsed(date: Date): string {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 60) return `${Math.max(0, mins)}m ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  PAID: { label: "UPI Paid", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  PENDING: { label: "Payment Pending", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: Clock },
  FAILED: { label: "Failed", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", icon: XCircle },
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  RECEIVED: { label: "Received", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  PREPARING: { label: "Preparing", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  READY: { label: "Ready", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  COMPLETED: { label: "Completed", color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700" },
}

export function AdminOrdersPage() {
  const activeOrders = useAdminStore((s) => s.activeOrders)
  const settleOrder = useAdminStore((s) => s.settleOrder)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")

  const filtered = activeOrders.filter((order) => {
    const matchSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.tableNumber.includes(search) ||
      order.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === "all" || order.paymentStatus === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = filtered
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0)

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-950">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink>Admin</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Orders & Settlements</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-100 mt-1">Orders & Settlements</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Collected Revenue</p>
          <p className="text-lg font-black text-emerald-400">₹{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search order ID, table, item..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            {(["all", "PAID", "PENDING", "FAILED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all",
                  statusFilter === s
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                )}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders table */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Placed Time</TableHead>
                <TableHead>Order State</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total (₹)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const payment = PAYMENT_CONFIG[order.paymentStatus]
                const orderState = ORDER_STATUS_CONFIG[order.orderStatus]
                const PayIcon = payment.icon

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-mono text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                        #{order.id.slice(-6)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-zinc-200">Table {order.tableNumber}</span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-0.5 max-w-[200px]">
                        {order.items.map((item, i) => (
                          <span key={i} className="text-xs text-zinc-300">
                            {item.quantity}× {item.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-xs font-medium text-zinc-300">{formatTime(order.createdAt)}</p>
                        <p className="text-[10px] text-zinc-600">{formatElapsed(order.createdAt)}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold",
                        orderState.bg,
                        orderState.color
                      )}>
                        {orderState.label}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold",
                        payment.bg,
                        payment.color
                      )}>
                        <PayIcon className="h-3 w-3" />
                        {payment.label}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-zinc-100">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                    </TableCell>

                    <TableCell className="text-right">
                      {order.paymentStatus !== "PAID" ? (
                        <button
                          onClick={() => settleOrder(order.id, "PAID")}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-600 font-medium">Settled</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
