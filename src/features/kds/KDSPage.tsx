import { useState, useEffect, useMemo, useRef } from "react"
import { playKitchenChime } from "@/lib/sound"
import { ScrollRow } from "@/components/ui/ScrollRow"
import { useParams } from "react-router"
import { AlertTriangle, LayoutGrid, BellRing, VolumeX, WifiOff } from "lucide-react"
import { KDSTopBar } from "./components/KDSTopBar"
import { KDSTicketCard } from "./components/KDSTicketCard"
import { OutOfStockDrawer } from "./components/OutOfStockDrawer"
import { useKdsStore } from "@/stores/useKdsStore"
import { Button } from "@/components/ui/button"
import { UpgradeNotice } from "@/components/UpgradeNotice"
import { useBilling } from "@/features/subscriptions/billing"
import { joinKdsRoom, onAccessRevoked, getSocket } from "@/lib/socket"
import { watchConnection, useConnectionStore } from "@/lib/connection"
import { armAudioUnlock, onAudioReadyChange, isAudioReady } from "@/lib/sound"

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
  // The API decides whether the kitchen display is available (plan, platform switch, override); it also refuses the live feed itself
  const billing = useBilling()
  const kdsLocked = billing.isLocked("KDS")
  const refreshBilling = billing.refresh

  // The server can withdraw the live kitchen feed while the screen is open: show the notice at once instead of a board that silently stops
  useEffect(() => onAccessRevoked((info) => { if (info.feature === "KDS") refreshBilling() }), [refreshBilling])
  // While locked, re-check now and then; when access is restored the board reloads and rejoins the live feed by itself
  useEffect(() => {
    if (!kdsLocked) return
    const t = setInterval(refreshBilling, 30000)
    return () => clearInterval(t)
  }, [kdsLocked, refreshBilling])
  const wasLocked = useRef(false)
  useEffect(() => {
    if (kdsLocked) { wasLocked.current = true; return }
    if (wasLocked.current && restaurantSlug) {
      wasLocked.current = false
      joinKdsRoom(restaurantSlug)
      useKdsStore.getState().fetchTickets(restaurantSlug)
    }
  }, [kdsLocked, restaurantSlug])

  // Fetch initial live tickets from API & connect socket
  useEffect(() => {
    if (restaurantSlug) {
      useKdsStore.getState().fetchTickets(restaurantSlug)
    }
  }, [restaurantSlug])

  // After ANY gap (socket reconnect, network back, tablet woke, slow safety poll) re-read the real list so no order is ever missing
  useEffect(() => {
    if (!restaurantSlug) return
    const stop = watchConnection(getSocket(), () => void useKdsStore.getState().resync(restaurantSlug))
    void useKdsStore.getState().setWakeLock(true) // keep the tablet awake; the top bar shows whether the browser actually allowed it
    return () => { stop(); void useKdsStore.getState().setWakeLock(false) }
  }, [restaurantSlug])

  // Sound: browsers keep audio locked until a tap. Show the truth and offer an explicit button; any tap also unlocks it.
  const soundEnabled = useKdsStore((s) => s.soundEnabled)
  const audioReady = useKdsStore((s) => s.audioReady)
  const enableAudio = useKdsStore((s) => s.enableAudio)
  useEffect(() => {
    useKdsStore.setState({ audioReady: isAudioReady() })
    const off = onAudioReadyChange((ready) => useKdsStore.setState({ audioReady: ready }))
    const disarm = armAudioUnlock()
    return () => { off(); disarm() }
  }, [])

  // The server withdrew the kitchen feed (seen on a refetch): show the upgrade notice instead of a board that cannot update
  const accessDenied = useKdsStore((s) => s.accessDenied)
  useEffect(() => { if (accessDenied) refreshBilling() }, [accessDenied, refreshBilling])

  const connStatus = useConnectionStore((s) => s.status)
  const lastSyncedAt = useConnectionStore((s) => s.lastSyncedAt)

  // Chime + banner when the store counts a new alert (the store already applied the sound and outlet preferences).
  // Only a change of chimeCount counts: flipping the Sound switch must not replay the last alert.
  const lastChime = useRef(chimeCount)
  useEffect(() => {
    if (chimeCount === lastChime.current) return
    lastChime.current = chimeCount
    if (chimeCount === 0) return
    playKitchenChime()
    setShowChimeToast(true)
    const timer = setTimeout(() => setShowChimeToast(false), 2500)
    return () => clearTimeout(timer)
  }, [chimeCount])

  const newTickets = useMemo(() => tickets.filter((t) => t.orderStatus === "RECEIVED"), [tickets])
  const inPrepTickets = useMemo(() => tickets.filter((t) => t.orderStatus === "PREPARING"), [tickets])
  const readyTickets = useMemo(
    () => tickets.filter((t) => t.orderStatus === "READY" || t.orderStatus === "DISPATCHED"),
    [tickets]
  )

  const columns = useMemo(() => [
    { id: "NEW" as const, label: "New Orders", short: "New", count: newTickets.length, tickets: newTickets, color: "text-blue-400", dotColor: "bg-blue-500" },
    { id: "PREP" as const, label: "In Prep", short: "Cooking", count: inPrepTickets.length, tickets: inPrepTickets, color: "text-amber-400", dotColor: "bg-amber-500" },
    { id: "READY" as const, label: "Ready & Dispatched", short: "Ready", count: readyTickets.length, tickets: readyTickets, color: "text-emerald-400", dotColor: "bg-emerald-500" },
  ], [newTickets, inPrepTickets, readyTickets])

  const activeMobileColumn = columns.find((c) => c.id === mobileStage) || columns[0]

  if (kdsLocked) {
    return (
      <div className="h-dvh flex flex-col bg-zinc-950 overflow-hidden">
        <KDSTopBar restaurantSlug={restaurantSlug} />
        <UpgradeNotice message="The kitchen display is not included in your current plan, or has been switched off for your account. Ask the restaurant owner to review the plan, or contact Pangat support." />
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col bg-zinc-950 overflow-hidden relative">
      <KDSTopBar restaurantSlug={restaurantSlug} />

      {/* Not live: say so plainly, with how stale the list may be */}
      {(connStatus === "offline" || connStatus === "reconnecting") && (
        <div role="alert" data-testid="offline-banner" className="flex items-center gap-2 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs sm:text-sm font-medium text-amber-200 shrink-0">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            {connStatus === "offline" ? "No internet." : "Lost the live connection."} New orders may not appear. Do not rely on this screen
            {lastSyncedAt ? ` (last updated ${new Date(lastSyncedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })})` : ""}. It refreshes by itself when the connection returns.
          </span>
        </div>
      )}

      {/* Sound is locked until someone taps: never pretend it is on */}
      {soundEnabled && !audioReady && (
        <div role="alert" data-testid="enable-sound-banner" className="flex flex-wrap items-center gap-3 bg-rose-500/15 border-b border-rose-500/30 px-4 py-2.5 shrink-0">
          <VolumeX className="h-4 w-4 text-rose-300 shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-rose-100 flex-1 min-w-48">Kitchen sound is OFF until you tap the button. New orders will be silent.</span>
          <Button size="sm" onClick={() => void enableAudio()} className="min-h-10 bg-rose-500 hover:bg-rose-400 text-white font-semibold" data-testid="enable-sound">
            Enable kitchen sound
          </Button>
        </div>
      )}

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
        <ScrollRow role="tablist" aria-label="Order stage" className="flex md:hidden items-center gap-1 p-0.5 bg-zinc-900 rounded-xl border border-zinc-800 flex-1">
          {columns.map((col) => (
            <button
              key={col.id}
              type="button"
              role="tab"
              aria-selected={mobileStage === col.id}
              onClick={() => setMobileStage(col.id)}
              className={`flex-1 min-w-0 min-h-10 py-1.5 px-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                mobileStage === col.id
                  ? "bg-zinc-800 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
              <span>{col.short}</span>
              <span className="text-[10px] font-mono opacity-80">({col.count})</span>
            </button>
          ))}
        </ScrollRow>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOutOfStock(true)}
          className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 text-xs font-medium shadow-xs shrink-0 h-10 sm:h-8"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Out of Stock Items</span>
          <span className="inline sm:hidden">Stock</span>
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
