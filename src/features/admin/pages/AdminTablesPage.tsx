import { useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAdminStore } from "@/stores/useAdminStore"
import { QrCode, RefreshCw, LayoutGrid, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TableStatus } from "@/types/domain"
import { Button } from "@/components/ui/button"

const STATUS_CONFIG: Record<TableStatus, { label: string; bg: string; border: string; text: string; badge: string }> = {
  VACANT: {
    label: "Vacant",
    bg: "bg-zinc-900 hover:bg-zinc-850",
    border: "border-zinc-800",
    text: "text-zinc-400",
    badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
  OCCUPIED: {
    label: "Occupied / Unpaid",
    bg: "bg-rose-950/20 hover:bg-rose-950/30",
    border: "border-rose-500/40",
    text: "text-rose-300",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  },
  PREPPING: {
    label: "Prepping",
    bg: "bg-amber-950/20 hover:bg-amber-950/30",
    border: "border-amber-500/40",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  SERVED: {
    label: "Served / Paid",
    bg: "bg-emerald-950/20 hover:bg-emerald-950/30",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
}

export function AdminTablesPage() {
  const tables = useAdminStore((s) => s.tables)
  const updateTableStatus = useAdminStore((s) => s.updateTableStatus)
  const fetchDashboardData = useAdminStore((s) => s.fetchDashboardData)
  const [filterStatus, setFilterStatus] = useState<TableStatus | "all">("all")
  const [lastUpdatedTable, setLastUpdatedTable] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filtered = filterStatus === "all" ? tables : tables.filter((t) => t.status === filterStatus)

  const counts = {
    all: tables.length,
    VACANT: tables.filter((t) => t.status === "VACANT").length,
    OCCUPIED: tables.filter((t) => t.status === "OCCUPIED").length,
    PREPPING: tables.filter((t) => t.status === "PREPPING").length,
    SERVED: tables.filter((t) => t.status === "SERVED").length,
  }

  const handleStatusChange = async (tableId: string, tableNumber: string, status: TableStatus) => {
    await updateTableStatus(tableId, status)
    setLastUpdatedTable(`Table T${tableNumber} is now ${status}`)
    setTimeout(() => setLastUpdatedTable(null), 3000)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-950">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink>Admin</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Floor & Tables</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-100 mt-1">Floor & Table Management</h1>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdatedTable && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {lastUpdatedTable}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Refresh Floor
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-5">
        {/* Status filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "VACANT", "OCCUPIED", "PREPPING", "SERVED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 capitalize",
                filterStatus === status
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              )}
            >
              {status === "all" ? "All Tables" : STATUS_CONFIG[status].label}
              <span className="ml-1.5 text-[10px] opacity-70">
                ({counts[status]})
              </span>
            </button>
          ))}
        </div>

        {/* Table grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {filtered.map((table) => {
            const config = STATUS_CONFIG[table.status]

            return (
              <div
                key={table.id}
                className={cn(
                  "rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.02]",
                  config.bg,
                  config.border
                )}
              >
                {/* Table number */}
                <div className="flex items-center justify-between">
                  <span className={cn("text-2xl font-black", config.text)}>
                    T{table.tableNumber}
                  </span>
                  <div className="flex items-center gap-1 text-zinc-600" title="QR Code active">
                    <QrCode className="h-4 w-4" />
                  </div>
                </div>

                {/* Status badge */}
                <span className={cn(
                  "self-start px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide",
                  config.badge
                )}>
                  {config.label}
                </span>

                {/* Quick status change selector */}
                <select
                  className="text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, table.tableNumber, e.target.value as TableStatus)}
                >
                  <option value="VACANT">Vacant (Gray)</option>
                  <option value="OCCUPIED">Occupied (Rose)</option>
                  <option value="PREPPING">Prepping (Amber)</option>
                  <option value="SERVED">Served (Green)</option>
                </select>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
            <LayoutGrid className="h-10 w-10 text-zinc-600 mb-3" />
            <h3 className="text-sm font-bold text-zinc-300">No tables matching this status</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Currently no tables are marked with this filter. Select "All Tables" to view the complete floor plan.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="mt-4 text-xs border-zinc-700 text-zinc-300"
            >
              Show All Tables
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
