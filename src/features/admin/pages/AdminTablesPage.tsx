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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { QrCode, RefreshCw, LayoutGrid, CheckCircle2, Plus, Trash2, Loader2, AlertCircle, Printer } from "lucide-react"
import { cn, isSameTableNumber } from "@/lib/utils"
import type { TableStatus } from "@/types/domain"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableQrModal } from "../components/TableQrModal"
import { QrCodeImage } from "@/components/ui/QrCodeImage"

const STATUS_CONFIG: Record<TableStatus, { label: string; bg: string; border: string; text: string; badge: string }> = {
  VACANT: {
    label: "Vacant",
    bg: "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 shadow-sm",
    border: "border-zinc-200 dark:border-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400 font-bold",
    badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  },
  OCCUPIED: {
    label: "Occupied / Unpaid",
    bg: "bg-rose-50/70 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 shadow-sm",
    border: "border-rose-200 dark:border-rose-500/40",
    text: "text-rose-800 dark:text-rose-300 font-black",
    badge: "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40",
  },
  PREPPING: {
    label: "Prepping",
    bg: "bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 shadow-sm",
    border: "border-amber-200 dark:border-amber-500/40",
    text: "text-amber-800 dark:text-amber-300 font-black",
    badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/40",
  },
  SERVED: {
    label: "Served / Paid",
    bg: "bg-emerald-50/70 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 shadow-sm",
    border: "border-emerald-200 dark:border-emerald-500/40",
    text: "text-emerald-800 dark:text-emerald-300 font-black",
    badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40",
  },
}

export function AdminTablesPage() {
  const tables = useAdminStore((s) => s.tables)
  const activeOrders = useAdminStore((s) => s.activeOrders)
  const updateTableStatus = useAdminStore((s) => s.updateTableStatus)
  const addTable = useAdminStore((s) => s.addTable)
  const deleteTable = useAdminStore((s) => s.deleteTable)
  const fetchDashboardData = useAdminStore((s) => s.fetchDashboardData)

  const [filterStatus, setFilterStatus] = useState<TableStatus | "all">("all")
  const [notification, setNotification] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const currentOutlet = useAuthStore((s) => s.currentOutlet)
  const outletSlug = currentOutlet?.slug || "pangat"
  const outletName = currentOutlet?.name || "Pangat Dining"

  // Single Table QR Modal state
  const [selectedQrTable, setSelectedQrTable] = useState<string | null>(null)

  // Master Batch Print Table QRs state
  const [batchPrintOpen, setBatchPrintOpen] = useState(false)

  // Compute live effective status aligned with open kitchen tickets and settlements
  const effectiveTables = tables.map((t) => {
    const tableOrders = activeOrders.filter((o) => isSameTableNumber(o.tableNumber, t.tableNumber))
    const openOrders = tableOrders.filter((o) => o.orderStatus !== "COMPLETED")
    if (openOrders.length > 0) {
      const hasCooking = openOrders.some(
        (o) => o.orderStatus === "RECEIVED" || o.orderStatus === "PREPARING"
      )
      if (hasCooking) return { ...t, status: "PREPPING" as TableStatus }
      const hasUnpaid = openOrders.some((o) => o.paymentStatus === "PENDING")
      return { ...t, status: (hasUnpaid ? "OCCUPIED" : "SERVED") as TableStatus }
    }
    if (t.status === "OCCUPIED") return { ...t, status: "OCCUPIED" as TableStatus }
    return { ...t, status: "VACANT" as TableStatus }
  })

  // Add Table Modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newTableNum, setNewTableNum] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Delete Table Modal / Confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = filterStatus === "all" ? effectiveTables : effectiveTables.filter((t) => t.status === filterStatus)

  const counts = {
    all: effectiveTables.length,
    VACANT: effectiveTables.filter((t) => t.status === "VACANT").length,
    OCCUPIED: effectiveTables.filter((t) => t.status === "OCCUPIED").length,
    PREPPING: effectiveTables.filter((t) => t.status === "PREPPING").length,
    SERVED: effectiveTables.filter((t) => t.status === "SERVED").length,
  }

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleStatusChange = async (tableId: string, tableNumber: string, status: TableStatus) => {
    await updateTableStatus(tableId, status)
    showNotification(`Table ${tableNumber} updated to ${status}`)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
  }

  const handleOpenAddModal = () => {
    // Generate next table suggestion (e.g. T13 or OD05)
    const existingNums = tables
      .map((t) => t.tableNumber)
      .filter((n) => n.startsWith("T") && !n.startsWith("OD"))
      .map((n) => parseInt(n.replace("T", ""), 10))
      .filter((n) => !isNaN(n))

    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0
    const suggested = `T${String(maxNum + 1).padStart(2, "0")}`

    setNewTableNum(suggested)
    setAddError(null)
    setAddModalOpen(true)
  }

  const handleConfirmAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTableNum.trim()) return

    setIsAdding(true)
    setAddError(null)

    try {
      const created = await addTable(newTableNum.trim())
      setAddModalOpen(false)
      showNotification(`Table ${created.tableNumber} created successfully!`)
    } catch (err: any) {
      setAddError(err.response?.data?.message || err.message || "Failed to create table")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (tableId: string, tableNumber: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete Table ${tableNumber}? This will also invalidate its diner QR code.`)
    if (!confirmed) return

    setDeletingId(tableId)
    try {
      await deleteTable(tableId)
      showNotification(`Table ${tableNumber} removed`)
    } catch (err: any) {
      alert(err.message || "Failed to remove table")
    } finally {
      setDeletingId(null)
    }
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
          {notification && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {notification}
            </span>
          )}

          <Button
            size="sm"
            onClick={() => setBatchPrintOpen(true)}
            variant="outline"
            className="gap-1.5 border-emerald-600/40 text-emerald-400 hover:bg-emerald-600/10 text-xs font-bold cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Download All Table QRs (Print Kit)</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAddModal}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Table
          </Button>

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
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 capitalize cursor-pointer",
                filterStatus === status
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-950/40"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filtered.map((table) => {
            const config = STATUS_CONFIG[table.status]
            const displayName =
              table.tableNumber.startsWith("T") || table.tableNumber.startsWith("OD")
                ? table.tableNumber
                : `T${table.tableNumber}`
            const isOutdoor = displayName.toUpperCase().startsWith("OD")

            return (
              <div
                key={table.id}
                className={cn(
                  "rounded-2xl border p-4 flex flex-col justify-between gap-3.5 transition-all duration-200 relative group shadow-sm",
                  config.bg,
                  config.border
                )}
              >
                {/* Top: Table Identifier, Delete Button, and Status Badge */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className={cn("text-2xl font-black font-mono tracking-tight block leading-tight", config.text)}>
                        {displayName}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mt-0.5">
                        {isOutdoor ? "Outdoor Table" : "Indoor Table"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(table.id, displayName)}
                      disabled={deletingId === table.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 -mr-1 -mt-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete table"
                    >
                      {deletingId === table.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                      config.badge
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Middle: Prominent Full-Width QR Code Button */}
                <button
                  type="button"
                  onClick={() => setSelectedQrTable(table.tableNumber)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs group/qr"
                  title={`View, download and print QR code standee for ${displayName}`}
                >
                  <QrCode className="h-4 w-4 shrink-0 text-emerald-400 transition-transform group-hover/qr:scale-110" />
                  <span className="truncate">QR Code & Tent</span>
                </button>

                {/* Bottom: Quick status change selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Update Status
                  </label>
                  <select
                    className="text-xs bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 focus:border-emerald-500 rounded-xl px-2.5 py-1.5 text-zinc-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full shadow-inner font-medium transition-colors"
                    value={table.status}
                    onChange={(e) => handleStatusChange(table.id, displayName, e.target.value as TableStatus)}
                  >
                    <option value="VACANT">Vacant (Available)</option>
                    <option value="OCCUPIED">Occupied (Unpaid Bill)</option>
                    <option value="PREPPING">Prepping (In Kitchen)</option>
                    <option value="SERVED">Served (Bill Settled)</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
            <LayoutGrid className="h-10 w-10 text-zinc-600 mb-3" />
            <h3 className="text-sm font-bold text-zinc-300">No tables found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              {tables.length === 0
                ? "No tables configured for this outlet yet. Click 'Add Table' above to generate your first table."
                : "No tables currently match this filter. Select 'All Tables' to view the complete floor plan."}
            </p>
            {tables.length === 0 ? (
              <Button
                size="sm"
                onClick={handleOpenAddModal}
                className="mt-4 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Your First Table
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus("all")}
                className="mt-4 text-xs border-zinc-700 text-zinc-300"
              >
                Show All Tables
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Table Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md bg-zinc-900 border border-zinc-800 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-400" />
              Add Floor Table
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Create a new physical or virtual table. A unique diner QR code will be generated automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmAdd} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Table Identifier
              </label>
              <Input
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value.toUpperCase())}
                placeholder="e.g. T13, OD05, VIP1"
                className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm font-bold uppercase tracking-wider"
                autoFocus
                required
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Tip: Use <strong>T01-T99</strong> for indoor tables, or <strong>OD01-OD99</strong> for outdoor seating.
              </p>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{addError}</span>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
                className="border-zinc-700 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isAdding || !newTableNum.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Adding...
                  </>
                ) : (
                  "Create Table"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Single Table QR Code Modal */}
      {selectedQrTable && (
        <TableQrModal
          open={Boolean(selectedQrTable)}
          onClose={() => setSelectedQrTable(null)}
          tableNumber={selectedQrTable}
          outletSlug={outletSlug}
          outletName={outletName}
        />
      )}

      {/* Master Batch Table QR Print Kit Modal */}
      <Dialog open={batchPrintOpen} onOpenChange={setBatchPrintOpen}>
        <DialogContent className="max-w-3xl bg-zinc-950 border border-zinc-800 text-white p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .batch-print-area, .batch-print-area * {
                visibility: visible;
              }
              .batch-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 20px !important;
                background: white !important;
                color: black !important;
              }
              .batch-card {
                page-break-inside: avoid;
                border: 2px solid #000 !important;
                padding: 16px !important;
                text-align: center;
              }
            }
          ` }} />

          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Printer className="h-5 w-5 text-emerald-400" />
                  <span>Batch Table QR Tent Print Kit ({tables.length} Tables)</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-1">
                  Ready-to-print 4x6 acrylic stand templates for all dining tables of {outletName}.
                </DialogDescription>
              </div>

              <Button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-950"
              >
                <Printer className="w-4 h-4" />
                <span>Print All Sheets</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="batch-print-area grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {tables.map((t) => {
              const origin = typeof window !== "undefined" ? window.location.origin : "https://layerform.in"
              const qrUrl = `${origin}/r/${outletSlug}/t/${t.tableNumber}`
              return (
                <div
                  key={t.id}
                  className="batch-card bg-white text-zinc-950 rounded-2xl p-4 border border-zinc-300 shadow-md flex flex-col items-center text-center space-y-2"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    🍃 PANGAT • {outletName}
                  </p>
                  <div className="bg-zinc-900 text-white px-3 py-0.5 rounded-full text-xs font-black tracking-widest uppercase">
                    Table {t.tableNumber}
                  </div>
                  <div className="p-1 bg-white rounded-lg">
                    <QrCodeImage value={qrUrl} size={140} />
                  </div>
                  <p className="text-[10px] font-bold text-zinc-800">
                    Scan with Phone Camera to Order
                  </p>
                  <p className="text-[8px] text-zinc-500 font-mono">
                    Zero-Wait Table Ordering & Settlements
                  </p>
                </div>
              )
            })}
          </div>

          <DialogFooter className="border-t border-zinc-800 pt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Formatted for standard 4" x 6" acrylic table stands.
            </span>
            <Button
              variant="outline"
              onClick={() => setBatchPrintOpen(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
