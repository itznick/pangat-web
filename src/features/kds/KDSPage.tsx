import { useState, useEffect, useMemo } from "react"
import { useParams } from "react-router"
import { AlertTriangle, LayoutGrid, BellRing } from "lucide-react"
import { KDSTopBar } from "./components/KDSTopBar"
import { KDSTicketCard } from "./components/KDSTicketCard"
import { OutOfStockDrawer } from "./components/OutOfStockDrawer"
import { useKdsStore } from "@/stores/useKdsStore"
import { Button } from "@/components/ui/button"

export function KDSPage() {
  const { restaurantSlug = "" } = useParams<{ restaurantSlug: string }>()
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [showChimeToast, setShowChimeToast] = useState(false)
  const [mobileStage, setMobileStage] = useState<"NEW" | "PREP" | "READY">("NEW")

  const tickets = useKdsStore((s) => s.tickets)
  const advanceTicket = useKdsStore((s) => s.advanceTicket)
  const sendBackTicket = useKdsStore((s) => s.sendBackTicket)
  const archiveTicket = useKdsStore((s) => s.archiveTicket)
  const chimeCount = useKdsStore((s) => s.chimeCount)
  const soundEnabled = useKdsStore((s) => s.soundEnabled)

  // Fetch initial live tickets from API & connect socket
  useEffect(() => {
    if (restaurantSlug) {
      useKdsStore.getState().fetchTickets(restaurantSlug)
    }
  }, [restaurantSlug])

  // Listen for chime triggers
  useEffect(() => {
    if (chimeCount > 0 && soundEnabled) {
      setShowChimeToast(true)
      const timer = setTimeout(() => setShowChimeToast(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [chimeCount, soundEnabled])

  const newTickets = useMemo(() => tickets.filter((t) => t.orderStatus === "RECEIVED"), [tickets])
  const inPrepTickets = useMemo(() => tickets.filter((t) => t.orderStatus === "PREPARING"), [tickets])
  const readyTickets = useMemo(
    () => tickets.filter((t) => t.orderStatus === "READY" || t.orderStatus === "DISPATCHED"),
    [tickets]
  )

  const columns = useMemo(() => [
    { id: "NEW" as const, label: "New Orders", count: newTickets.length, tickets: newTickets, color: "text-blue-400", dotColor: "bg-blue-500" },
    { id: "PREP" as const, label: "In Prep", count: inPrepTickets.length, tickets: inPrepTickets, color: "text-amber-400", dotColor: "bg-amber-500" },
    { id: "READY" as const, label: "Ready & Dispatched", count: readyTickets.length, tickets: readyTickets, color: "text-emerald-400", dotColor: "bg-emerald-500" },
  ], [newTickets, inPrepTickets, readyTickets])

  const activeMobileColumn = columns.find((c) => c.id === mobileStage) || columns[0]

  return (
    <div className="h-dvh flex flex-col bg-zinc-950 overflow-hidden relative">
      <KDSTopBar restaurantSlug={restaurantSlug} />

      {/* Audio alert chime visual indicator */}
      {showChimeToast && (
        <div className="absolute top-16 right-6 z-50 flex items-center gap-2.5 bg-emerald-500 text-zinc-950 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xl shadow-emerald-950/50 border border-emerald-400/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <BellRing className="h-4 w-4 animate-pulse" />
          <span>New Order Received</span>
        </div>
      )}

      {/* Sub-header with column labels + out of stock button */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 shrink-0 gap-2">
        {/* Desktop column indicators */}
        <div className="hidden md:flex items-center gap-6">
          {columns.map((col) => (
            <div key={col.label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>
                {col.label}
              </span>
              <span className="text-xs text-zinc-500 font-mono">({col.count})</span>
            </div>
          ))}
        </div>

        {/* Mobile stage-based switcher */}
        <div className="flex md:hidden items-center gap-1 p-0.5 bg-zinc-900 rounded-xl border border-zinc-800 flex-1 overflow-x-auto">
          {columns.map((col) => (
            <button
              key={col.id}
              onClick={() => setMobileStage(col.id)}
              className={`flex-1 min-w-[90px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                mobileStage === col.id
                  ? "bg-zinc-800 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
              <span>{col.label.split(" ")[0]}</span>
              <span className="text-[10px] font-mono opacity-80">({col.count})</span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOutOfStock(true)}
          className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 text-xs font-medium shadow-xs shrink-0 h-8"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Out of Stock Items</span>
          <span className="inline sm:hidden">86 Items</span>
        </Button>
      </div>

      {/* Ticket board: Desktop 3-column grid */}
      <div className="hidden md:grid flex-1 overflow-hidden grid-cols-3 gap-4 p-4">
        {columns.map((col) => (
          <div key={col.label} className="flex flex-col overflow-hidden rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
            {/* Column header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/80 shrink-0 bg-zinc-900/40">
              <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <h2 className={`text-sm font-semibold tracking-tight ${col.color}`}>{col.label}</h2>
              <span className="ml-auto text-xs font-medium text-zinc-500">
                {col.count === 0 ? "All clear" : `${col.count} ticket${col.count > 1 ? "s" : ""}`}
              </span>
            </div>

            {/* Tickets scroll area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {col.tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-700">
                  <LayoutGrid className="h-8 w-8 mb-2" />
                  <p className="text-xs font-medium">No tickets</p>
                </div>
              ) : (
                col.tickets.map((ticket) => (
                  <KDSTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onAdvance={advanceTicket}
                    onArchive={archiveTicket}
                    onSendBack={sendBackTicket}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile single-column active stage view */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden p-3">
        <div className="flex-1 flex flex-col overflow-hidden rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/80 shrink-0 bg-zinc-900/40">
            <div className={`w-2 h-2 rounded-full ${activeMobileColumn.dotColor}`} />
            <h2 className={`text-sm font-semibold tracking-tight ${activeMobileColumn.color}`}>{activeMobileColumn.label}</h2>
            <span className="ml-auto text-xs font-medium text-zinc-500">
              {activeMobileColumn.count === 0 ? "All clear" : `${activeMobileColumn.count} tickets`}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeMobileColumn.tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-700">
                <LayoutGrid className="h-8 w-8 mb-2" />
                <p className="text-xs font-medium">No tickets in this stage</p>
              </div>
            ) : (
              activeMobileColumn.tickets.map((ticket) => (
                <KDSTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onAdvance={advanceTicket}
                  onArchive={archiveTicket}
                  onSendBack={sendBackTicket}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <OutOfStockDrawer open={showOutOfStock} onClose={() => setShowOutOfStock(false)} />
    </div>
  )
}

export { KDSPage as default }
