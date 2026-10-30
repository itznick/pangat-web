import { useState } from "react"
import { ChefHat, AlertCircle, Clock, Undo2, Bike, ShoppingBag, Utensils, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order, OrderStatus } from "@/types/domain"
import { useTicketTimer } from "@/hooks/useTicketTimer"

interface KDSTicketCardProps {
  ticket: Order
  onAdvance: (ticketId: string) => void
  onArchive: (ticketId: string) => void
  onSendBack?: (ticketId: string, targetStatus: OrderStatus, reason: string) => void
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
    badgeText: "Ready",
    badgeBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
    actionLabel: "Archive",
    actionClass: "bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-semibold",
    pulse: false,
  },
  DISPATCHED: {
    border: "border-purple-500/40",
    bg: "bg-purple-950/20",
    headerBg: "bg-purple-950/30",
    badgeText: "Out for Delivery",
    badgeBg: "bg-purple-500/20 border-purple-500/40 text-purple-400",
    actionLabel: "Mark Delivered",
    actionClass: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30",
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
  CANCELLED: {
    border: "border-rose-900/40",
    bg: "bg-rose-950/20",
    headerBg: "bg-rose-950/40",
    badgeText: "Cancelled",
    badgeBg: "bg-rose-500/20 border-rose-500/40 text-rose-400",
    actionLabel: "",
    actionClass: "",
    pulse: false,
  },
}

export function KDSTicketCard({ ticket, onAdvance, onArchive, onSendBack }: KDSTicketCardProps) {
  const timer = useTicketTimer(ticket.createdAt)
  const config = STATUS_CONFIG[ticket.orderStatus] || STATUS_CONFIG.RECEIVED
  const [showSendBackModal, setShowSendBackModal] = useState(false)
  const [sendBackReason, setSendBackReason] = useState("")

  const isDelivery = ticket.orderType === "DELIVERY"
  const isTakeaway = ticket.orderType === "TAKEAWAY"

  const handleAction = () => {
    if (ticket.orderStatus === "READY") {
      if (isDelivery) {
        onAdvance(ticket.id) // READY -> DISPATCHED
      } else {
        onArchive(ticket.id) // READY -> COMPLETED
      }
    } else {
      onAdvance(ticket.id)
    }
  }

  const handleSendBackConfirm = () => {
    if (!sendBackReason.trim()) return
    let target: OrderStatus = "RECEIVED"
    if (ticket.orderStatus === "READY") {
      target = "PREPARING"
    } else if (ticket.orderStatus === "DISPATCHED") {
      target = "READY"
    }
    onSendBack?.(ticket.id, target, sendBackReason.trim())
    setShowSendBackModal(false)
    setSendBackReason("")
  }

  const canSendBack =
    (ticket.orderStatus === "PREPARING" ||
      ticket.orderStatus === "READY" ||
      ticket.orderStatus === "DISPATCHED") &&
    !!onSendBack

  // Dynamic Ready label based on type
  const readyBadgeText = isDelivery
    ? "Ready to Dispatch"
    : isTakeaway
    ? "Ready for Pickup"
    : "Ready to Serve"

  const readyActionLabel = isDelivery ? "Dispatch Order" : isTakeaway ? "Hand Over" : "Archive"

  const currentActionLabel =
    ticket.orderStatus === "READY" ? readyActionLabel : config.actionLabel

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
          {ticket.orderType === "TAKEAWAY" ? (
            <span className="text-xs font-bold text-amber-300 inline-flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5" />
              {ticket.customerName || "Parcel"}
            </span>
          ) : ticket.orderType === "DELIVERY" ? (
            <span className="text-xs font-bold text-purple-300 inline-flex items-center gap-1">
              <Bike className="h-3.5 w-3.5" />
              {ticket.customerName || "Delivery"}
            </span>
          ) : (
            <span className="text-sm font-bold text-zinc-200 inline-flex items-center gap-1">
              <Utensils className="h-3.5 w-3.5 text-zinc-400" />
              Table {ticket.tableNumber || "—"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold",
              config.badgeBg
            )}
          >
            {ticket.orderStatus === "READY" ? readyBadgeText : config.badgeText}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 text-xs font-mono border-b",
          ticket.orderStatus === "RECEIVED"
            ? "border-blue-500/20"
            : ticket.orderStatus === "PREPARING"
            ? "border-amber-500/20"
            : ticket.orderStatus === "DISPATCHED"
            ? "border-purple-500/20"
            : "border-emerald-500/20"
        )}
      >
        <div className="flex items-center gap-1.5">
          <Clock className={cn("h-3.5 w-3.5", timer.isOverdue ? "text-rose-400" : "text-zinc-500")} />
          <span className="text-[11px] font-sans text-zinc-500 font-medium">Elapsed:</span>
          <span className={cn("tabular-nums transition-colors", timer.colorClass)}>
            {timer.formattedTime}
          </span>
        </div>
        {timer.isOverdue && (
          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-[10px] animate-pulse">
            ⚠️ OVERDUE
          </span>
        )}
      </div>

      {/* Delivery details if applicable */}
      {ticket.orderType === "DELIVERY" && ticket.deliveryAddress && (
        <div className="px-4 py-2 bg-purple-950/20 border-b border-purple-500/20 text-xs text-purple-200 flex items-start gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{ticket.deliveryAddress}</p>
            {ticket.deliveryInstructions && (
              <p className="text-[11px] text-purple-300/80 italic">{ticket.deliveryInstructions}</p>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="px-4 py-3 flex-1 space-y-2.5">
        {ticket.items.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-zinc-100">{item.quantity}×</span>
              <span className="text-sm font-semibold text-zinc-200">{item.name}</span>
            </div>
            {item.selectedModifiers && item.selectedModifiers.length > 0 && (
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

      {/* Send Back Reason Popover */}
      {showSendBackModal && (
        <div className="px-4 py-3 border-t border-rose-500/30 bg-rose-950/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
            <Undo2 className="h-3.5 w-3.5" />
            Send back to{" "}
            {ticket.orderStatus === "DISPATCHED"
              ? "Ready"
              : ticket.orderStatus === "READY"
              ? "In Prep"
              : "New Order"}
          </div>
          <input
            type="text"
            placeholder="Mandatory reason (e.g. remake item, rider delay)"
            value={sendBackReason}
            onChange={(e) => setSendBackReason(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowSendBackModal(false)}
              className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSendBackConfirm}
              disabled={!sendBackReason.trim()}
              className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Action */}
      {ticket.orderStatus !== "COMPLETED" && ticket.orderStatus !== "CANCELLED" && (
        <div className="px-4 py-3 border-t border-zinc-800/50 flex gap-2">
          {canSendBack && !showSendBackModal && (
            <button
              type="button"
              onClick={() => setShowSendBackModal(true)}
              className="p-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors flex items-center justify-center"
              title="Send back ticket"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleAction}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-xl text-sm transition-all duration-150 active:scale-[0.98]",
              ticket.orderStatus === "READY" && isDelivery
                ? "bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30"
                : config.actionClass
            )}
          >
            {ticket.orderStatus === "RECEIVED" && (
              <span className="flex items-center justify-center gap-2">
                <ChefHat className="h-4 w-4" />
                {currentActionLabel}
              </span>
            )}
            {ticket.orderStatus !== "RECEIVED" && currentActionLabel}
          </button>
        </div>
      )}
    </div>
  )
}
