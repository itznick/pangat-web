import { useState, useEffect } from "react"
import { ChefHat, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order, OrderStatus } from "@/types/domain"

interface KDSTicketCardProps {
  ticket: Order
  onAdvance: (ticketId: string) => void
  onArchive: (ticketId: string) => void
}

function useElapsedTime(createdAt: Date): string {
  const [elapsed, setElapsed] = useState("")

  useEffect(() => {
    const update = () => {
      const ms = Date.now() - new Date(createdAt).getTime()
      const secs = Math.floor(ms / 1000)
      const mins = Math.floor(secs / 60)
      const s = secs % 60
      setElapsed(`${String(mins).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [createdAt])

  return elapsed
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    border: string
    bg: string
    headerBg: string
    badgeText: string
    badgeBg: string
    actionLabel: string
    actionClass: string
    pulse: boolean
  }
> = {
  RECEIVED: {
    border: "border-blue-500/40",
    bg: "bg-blue-950/20",
    headerBg: "bg-blue-950/40",
    badgeText: "New Order",
    badgeBg: "bg-blue-500/20 border-blue-500/40 text-blue-400",
    actionLabel: "Start Prep",
    actionClass: "bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/30",
    pulse: true,
  },
  PREPARING: {
    border: "border-amber-500/40",
    bg: "bg-amber-950/20",
    headerBg: "bg-amber-950/30",
    badgeText: "In Prep",
    badgeBg: "bg-amber-500/20 border-amber-500/40 text-amber-400",
    actionLabel: "Mark Ready",
    actionClass: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30",
    pulse: false,
  },
  READY: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/20",
    headerBg: "bg-emerald-950/30",
    badgeText: "Ready for Pickup",
    badgeBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
    actionLabel: "Archive",
    actionClass: "bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-semibold",
    pulse: false,
  },
  COMPLETED: {
    border: "border-zinc-700",
    bg: "bg-zinc-900",
    headerBg: "bg-zinc-800",
    badgeText: "Completed",
    badgeBg: "bg-zinc-700 border-zinc-600 text-zinc-400",
    actionLabel: "",
    actionClass: "",
    pulse: false,
  },
}

export function KDSTicketCard({ ticket, onAdvance, onArchive }: KDSTicketCardProps) {
  const elapsed = useElapsedTime(ticket.createdAt)
  const config = STATUS_CONFIG[ticket.orderStatus]

  const isOverdue = Date.now() - new Date(ticket.createdAt).getTime() > 15 * 60 * 1000

  const handleAction = () => {
    if (ticket.orderStatus === "READY") {
      onArchive(ticket.id)
    } else {
      onAdvance(ticket.id)
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden flex flex-col transition-all duration-300",
        config.border,
        config.bg
      )}
    >
      {/* Header */}
      <div className={cn("px-4 py-3 flex items-center justify-between", config.headerBg)}>
        <div className="flex items-center gap-2">
          {config.pulse && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            </span>
          )}
          <span className="text-sm font-bold text-zinc-100">
            #{ticket.id.slice(-3).toUpperCase()}
          </span>
          <span className="text-zinc-500">·</span>
          <span className="text-sm font-bold text-zinc-200">Table {ticket.tableNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold", config.badgeBg)}>
            {config.badgeText}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className={cn(
        "flex items-center gap-1.5 px-4 py-2 text-xs font-mono border-b",
        ticket.orderStatus === "RECEIVED" ? "border-blue-500/20" :
        ticket.orderStatus === "PREPARING" ? "border-amber-500/20" :
        "border-emerald-500/20"
      )}>
        <Clock className={cn("h-3.5 w-3.5", isOverdue ? "text-rose-400" : "text-zinc-500")} />
        <span className={cn("font-bold tabular-nums", isOverdue ? "text-rose-400" : "text-zinc-400")}>
          {elapsed}
        </span>
        {isOverdue && (
          <span className="ml-1 text-rose-400 font-semibold">⚠ OVERDUE</span>
        )}
      </div>

      {/* Items */}
      <div className="px-4 py-3 flex-1 space-y-2.5">
        {ticket.items.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-zinc-100">
                {item.quantity}×
              </span>
              <span className="text-sm font-semibold text-zinc-200">{item.name}</span>
            </div>
            {item.selectedModifiers.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1 ml-6">
                {item.selectedModifiers.map((mod, mIdx) => (
                  <span
                    key={mIdx}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide",
                      mod.name.startsWith("NO") || mod.name.startsWith("no")
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    )}
                  >
                    {mod.name}
                  </span>
                ))}
              </div>
            )}
            {item.notes && (
              <div className="mt-2 ml-6 flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300 italic">"{item.notes}"</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action */}
      {ticket.orderStatus !== "COMPLETED" && (
        <div className="px-4 py-3 border-t border-zinc-800/50">
          <button
            onClick={handleAction}
            className={cn(
              "w-full py-2.5 px-4 rounded-xl text-sm transition-all duration-150 active:scale-[0.98]",
              config.actionClass
            )}
          >
            {ticket.orderStatus === "RECEIVED" && (
              <span className="flex items-center justify-center gap-2">
                <ChefHat className="h-4 w-4" />
                {config.actionLabel}
              </span>
            )}
            {ticket.orderStatus !== "RECEIVED" && config.actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}
