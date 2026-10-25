// ─────────────────────────────────────────────────────────────────────────────
// KitchenSlaWidget – Flags tickets breaching the 15-minute SLA or waiting
// for cook acknowledgment. Uses live useKdsStore data.
// ─────────────────────────────────────────────────────────────────────────────

import { AlertTriangle, Clock, ChefHat, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useKdsStore } from "@/stores/useKdsStore"

const SLA_THRESHOLD_MS = 15 * 60 * 1000 // 15 minutes

export function KitchenSlaWidget() {
  const tickets = useKdsStore((s) => s.tickets)

  const now = Date.now()

  const alerts = tickets
    .map((t) => {
      const ageMs = now - new Date(t.createdAt).getTime()
      const ageMin = Math.floor(ageMs / 60_000)
      const isSlaBreached = ageMs > SLA_THRESHOLD_MS
      const isAwaitingAck = t.orderStatus === "RECEIVED"
      return { ...t, ageMin, isSlaBreached, isAwaitingAck }
    })
    .filter((t) => t.isSlaBreached || t.isAwaitingAck)
    .sort((a, b) => b.ageMin - a.ageMin)

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col">
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100">Kitchen SLA Alerts</h3>
            <p className="text-[11px] text-zinc-500">Tickets over 15 min or unacknowledged</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Alert List */}
      <div className="flex-1 p-3 space-y-2 min-h-[120px]">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
              <ChefHat className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-zinc-400">All tickets within SLA</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Kitchen is running smoothly</p>
          </div>
        ) : (
          alerts.map((ticket) => (
            <div
              key={ticket.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                ticket.isSlaBreached && ticket.ageMin > 25
                  ? "bg-rose-950/30 border-rose-500/50"
                  : ticket.isSlaBreached
                  ? "bg-amber-950/25 border-amber-500/40"
                  : "bg-zinc-800/60 border-zinc-700/60"
              )}
            >
              {/* Status indicator */}
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border text-xs font-black",
                  ticket.isSlaBreached && ticket.ageMin > 25
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : ticket.isSlaBreached
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-zinc-700 border-zinc-600 text-zinc-300"
                )}
              >
                {ticket.tableNumber}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-zinc-200">
                    Table {ticket.tableNumber}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold border",
                      ticket.orderStatus === "RECEIVED"
                        ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                        : "bg-amber-500/20 border-amber-500/30 text-amber-300"
                    )}
                  >
                    {ticket.orderStatus}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3 text-zinc-500 flex-shrink-0" />
                  <p className="text-[11px] text-zinc-400">
                    {ticket.isAwaitingAck && !ticket.isSlaBreached
                      ? "Awaiting cook acknowledgment"
                      : `Overdue by ${ticket.ageMin - 15}m — ${ticket.ageMin}m elapsed`}
                  </p>
                </div>
              </div>

              <ArrowRight className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
