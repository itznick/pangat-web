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
  const readyTickets = useMemo(() => tickets.filter((t) => t.orderStatus === "READY"), [tickets])

  const columns = useMemo(() => [
    { label: "New Orders", count: newTickets.length, tickets: newTickets, color: "text-blue-400", dotColor: "bg-blue-500" },
    { label: "In Prep", count: inPrepTickets.length, tickets: inPrepTickets, color: "text-amber-400", dotColor: "bg-amber-500" },
    { label: "Ready for Pickup", count: readyTickets.length, tickets: readyTickets, color: "text-emerald-400", dotColor: "bg-emerald-500" },
  ], [newTickets, inPrepTickets, readyTickets])

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden relative">
      <KDSTopBar restaurantSlug={restaurantSlug} />

      {/* Audio alert chime visual indicator */}
      {showChimeToast && (
        <div className="absolute top-16 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-xl font-bold text-xs shadow-2xl shadow-emerald-500/40 animate-bounce">
          <BellRing className="h-4 w-4" />
          Kitchen Chime Triggered!
        </div>
      )}

      {/* Sub-header with column labels + out of stock button */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-zinc-900/50 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-6">
          {columns.map((col) => (
            <div key={col.label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                {col.label}
              </span>
              <span className="text-xs text-zinc-600">({col.count})</span>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOutOfStock(true)}
          className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 text-xs"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Out of Stock Items
        </Button>
      </div>

      {/* Ticket board */}
      <div className="flex-1 overflow-hidden grid grid-cols-3 gap-4 p-4">
        {columns.map((col) => (
          <div key={col.label} className="flex flex-col overflow-hidden rounded-xl bg-zinc-900/40 border border-zinc-800">
            {/* Column header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 shrink-0">
              <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <h2 className={`text-sm font-bold ${col.color}`}>{col.label}</h2>
              <span className="ml-auto text-xs font-bold text-zinc-500">
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

      <OutOfStockDrawer open={showOutOfStock} onClose={() => setShowOutOfStock(false)} />
    </div>
  )
}

export { KDSPage as default }
