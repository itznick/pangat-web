// ─────────────────────────────────────────────────────────────────────────────
// TableDrawer – Slide-in right panel for a selected table's live order detail
// Shows items, payment status, and Settle / Clear actions.
// ─────────────────────────────────────────────────────────────────────────────

import { X, CheckCircle2, Trash2, IndianRupee, Clock, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminStore } from "@/stores/useAdminStore"
import type { Table, Order } from "@/types/domain"

interface TableDrawerProps {
  table: Table | null
  onClose: () => void
}

export function TableDrawer({ table, onClose }: TableDrawerProps) {
  const activeOrders = useAdminStore((s) => s.activeOrders)
  const settleOrder = useAdminStore((s) => s.settleOrder)
  const updateTableStatus = useAdminStore((s) => s.updateTableStatus)

  const tableOrders: Order[] = table
    ? activeOrders.filter(
        (o) =>
          o.tableNumber === table.tableNumber &&
          o.orderStatus !== "COMPLETED"
      )
    : []

  const totalUnbilled = tableOrders
    .filter((o) => o.paymentStatus === "PENDING")
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const handleSettle = (orderId: string) => {
    settleOrder(orderId, "PAID")
    // If no more pending orders, mark table SERVED
    const remaining = tableOrders.filter(
      (o) => o.id !== orderId && o.paymentStatus === "PENDING"
    )
    if (remaining.length === 0 && table) {
      updateTableStatus(table.id, "SERVED")
    }
  }

  const handleClearTable = () => {
    if (!table) return
    tableOrders.forEach((o) => settleOrder(o.id, "PAID"))
    updateTableStatus(table.id, "VACANT")
    onClose()
  }

  const isOpen = Boolean(table)

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Right-side panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[420px] max-w-full flex flex-col bg-zinc-900 border-l border-zinc-800 shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border",
                table?.status === "OCCUPIED"
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                  : table?.status === "PREPPING"
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : table?.status === "SERVED"
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400"
              )}
            >
              {table?.tableNumber ?? "–"}
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Table {table?.tableNumber} – Live View
              </h3>
              <p className="text-xs text-zinc-400 capitalize">
                Status:{" "}
                <span className="font-semibold text-zinc-300">
                  {table?.status?.toLowerCase() ?? "–"}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {tableOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3">
                <Hash className="h-6 w-6 text-zinc-600" />
              </div>
              <p className="text-sm font-semibold text-zinc-400">No active orders</p>
              <p className="text-xs text-zinc-600 mt-1">
                This table has no open kitchen tickets.
              </p>
            </div>
          ) : (
            tableOrders.map((order) => {
              const isPending = order.paymentStatus === "PENDING"
              return (
                <div
                  key={order.id}
                  className="bg-zinc-800/50 rounded-2xl border border-zinc-700/80 overflow-hidden"
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/60 bg-zinc-800/40">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-200">
                        Order #{order.id.slice(-4).toUpperCase()}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                          order.orderStatus === "READY"
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : order.orderStatus === "PREPARING"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            : "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        )}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {Math.round(
                          (Date.now() - new Date(order.createdAt).getTime()) / 60000
                        )}m ago
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-4 py-3 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="mt-0.5 flex-shrink-0">
                            {/* We don't have isVeg on OrderItem — use a neutral icon */}
                            <IndianRupee className="h-3 w-3 text-zinc-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-200 leading-snug">
                              {item.quantity}× {item.name}
                            </p>
                            {item.selectedModifiers.length > 0 && (
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                {item.selectedModifiers.map((m) => m.name).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-zinc-300 flex-shrink-0">
                          ₹
                          {(
                            (item.price +
                              item.selectedModifiers.reduce((s, m) => s + m.price, 0)) *
                            item.quantity
                          ).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order footer */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-700/60 bg-zinc-900/40">
                    <div>
                      <p className="text-xs text-zinc-500">Total</p>
                      <p className="text-base font-black text-zinc-100">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                            {order.paymentMethod === "PAY_AT_COUNTER"
                              ? "Pay at Counter"
                              : "Unpaid"}
                          </span>
                          <button
                            onClick={() => handleSettle(order.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-900/40"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Settle
                          </button>
                        </>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Settled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Actions */}
        {tableOrders.length > 0 && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-zinc-800 space-y-2.5 bg-zinc-950/50">
            {totalUnbilled > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
                <span className="text-xs font-semibold text-amber-300">
                  Unbilled Balance
                </span>
                <span className="text-base font-black text-amber-400">
                  ₹{totalUnbilled.toFixed(2)}
                </span>
              </div>
            )}
            <button
              onClick={handleClearTable}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-semibold text-sm transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear Table & Mark Vacant
            </button>
          </div>
        )}
      </div>
    </>
  )
}

