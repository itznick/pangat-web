import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Loader2, Search, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import type { StockMovement, StockMovementType } from "@/types/domain"

const MOVEMENT_CONFIG: Record<
  StockMovementType,
  { label: string; badge: string; isPositive: boolean }
> = {
  OPENING_STOCK: {
    label: "Opening Stock",
    badge: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    isPositive: true,
  },
  RECEIVED: {
    label: "Shipment Received",
    badge: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    isPositive: true,
  },
  MANUAL_ADJUSTMENT: {
    label: "Manual Adjustment",
    badge: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    isPositive: true,
  },
  ORDER_CONSUMPTION: {
    label: "Order Consumption",
    badge: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    isPositive: false,
  },
  ORDER_CANCELLATION_REVERSAL: {
    label: "Cancellation Restored",
    badge: "bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    isPositive: true,
  },
  WASTAGE: {
    label: "Wastage / Spoilage",
    badge: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    isPositive: false,
  },
}

interface Props {
  restaurantId: string
}

export function StockMovementsLedger({ restaurantId }: Props) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")

  const fetchMovements = async () => {
    setLoading(true)
    try {
      const res = await api.inventory.listMovements(restaurantId, {
        type: typeFilter === "ALL" ? undefined : (typeFilter as StockMovementType),
        limit: 50,
      })
      setMovements(res.items || [])
    } catch (err) {
      console.error("Failed to fetch stock movements ledger", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [restaurantId, typeFilter])

  const filteredMovements = movements.filter((m) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      m.ingredient?.name.toLowerCase().includes(q) ||
      m.reason.toLowerCase().includes(q) ||
      (m.referenceOrderId && m.referenceOrderId.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <Input
              placeholder="Search by ingredient, reason, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="ALL">All Movement Types</option>
            <option value="OPENING_STOCK">Opening Stock</option>
            <option value="RECEIVED">Shipment Received</option>
            <option value="ORDER_CONSUMPTION">Order Consumption</option>
            <option value="ORDER_CANCELLATION_REVERSAL">Cancellation Restored</option>
            <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
            <option value="WASTAGE">Wastage / Spoilage</option>
          </select>

          <button
            onClick={fetchMovements}
            disabled={loading}
            className="h-9 px-3 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-850 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-zinc-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-sm">Loading audited stock ledger...</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">
            No stock movements found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-850 text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Quantity Delta</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                  <th className="py-3 px-4">Audit Reason & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredMovements.map((mov) => {
                  const cfg = MOVEMENT_CONFIG[mov.type] || {
                    label: mov.type,
                    badge: "bg-zinc-100 text-zinc-800",
                    isPositive: mov.quantity > 0,
                  }
                  const qty = Number(mov.quantity)
                  const isPositive = qty > 0

                  return (
                    <tr
                      key={mov.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-xs font-mono text-zinc-500 whitespace-nowrap">
                        {new Date(mov.createdAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {mov.ingredient?.name || "Ingredient"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant="outline" className={`text-xs ${cfg.badge}`}>
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-0.5 ${
                            isPositive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {isPositive ? `+${qty}` : qty} {mov.ingredient?.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {Number(mov.balanceAfter)} {mov.ingredient?.unit}
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium truncate">
                          {mov.reason}
                        </p>
                        {mov.referenceOrderId && (
                          <p className="text-[11px] font-mono text-zinc-400">
                            Order Ref: {mov.referenceOrderId}
                          </p>
                        )}
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
  )
}
