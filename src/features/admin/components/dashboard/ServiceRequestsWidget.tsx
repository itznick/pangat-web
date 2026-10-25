// ─────────────────────────────────────────────────────────────────────────────
// ServiceRequestsWidget – Staff call / service radar
// Shows table service requests (water, bill, etc.) with dismiss actions.
// In the current build, seeded with mock requests; will connect to WebSocket.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react"
import { Bell, X, CheckCheck, Droplets, Receipt, ChefHat, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export type ServiceRequestType = "water" | "bill" | "assistance" | "extra" | "custom"

export interface ServiceRequest {
  id: string
  tableNumber: string
  type: ServiceRequestType
  message: string
  createdAt: Date
  dismissed: boolean
}

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: "sr-001",
    tableNumber: "03",
    type: "water",
    message: "Water requested at Table 03",
    createdAt: new Date(Date.now() - 2 * 60_000),
    dismissed: false,
  },
  {
    id: "sr-002",
    tableNumber: "07",
    type: "bill",
    message: "Bill requested at Table 07",
    createdAt: new Date(Date.now() - 5 * 60_000),
    dismissed: false,
  },
  {
    id: "sr-003",
    tableNumber: "01",
    type: "assistance",
    message: "Server assistance at Table 01",
    createdAt: new Date(Date.now() - 1 * 60_000),
    dismissed: false,
  },
  {
    id: "sr-004",
    tableNumber: "10",
    type: "extra",
    message: "Extra cutlery at Table 10",
    createdAt: new Date(Date.now() - 8 * 60_000),
    dismissed: false,
  },
]

const REQUEST_META: Record<ServiceRequestType, { icon: typeof Bell; color: string; bg: string; border: string }> = {
  water: {
    icon: Droplets,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  bill: {
    icon: Receipt,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  assistance: {
    icon: Bell,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  extra: {
    icon: Plus,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
  custom: {
    icon: ChefHat,
    color: "text-zinc-400",
    bg: "bg-zinc-800",
    border: "border-zinc-700",
  },
}

export function ServiceRequestsWidget() {
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS)

  const activeRequests = requests.filter((r) => !r.dismissed)

  const dismiss = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, dismissed: true } : r))
    )
  }

  const dismissAll = () => {
    setRequests((prev) => prev.map((r) => ({ ...r, dismissed: true })))
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800">
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center relative">
            <Bell className="h-3.5 w-3.5 text-amber-400" />
            {activeRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border border-zinc-900 text-[8px] font-black text-white flex items-center justify-center">
                {activeRequests.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100">Service Radar</h3>
            <p className="text-[11px] text-zinc-500">Table calls & staff requests</p>
          </div>
        </div>
        {activeRequests.length > 0 && (
          <button
            onClick={dismissAll}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700 transition-colors"
          >
            <CheckCheck className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Request list */}
      <div className="p-3 space-y-2 min-h-[120px]">
        {activeRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-2">
              <CheckCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-zinc-400">All clear!</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">No pending service requests</p>
          </div>
        ) : (
          activeRequests.map((req) => {
            const meta = REQUEST_META[req.type]
            const ReqIcon = meta.icon
            const ageMin = Math.round(
              (Date.now() - new Date(req.createdAt).getTime()) / 60_000
            )

            return (
              <div
                key={req.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  meta.bg,
                  meta.border
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    meta.bg,
                    "border",
                    meta.border
                  )}
                >
                  <ReqIcon className={cn("h-4 w-4", meta.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 leading-snug">
                    {req.message}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {ageMin === 0 ? "Just now" : `${ageMin}m ago`}
                  </p>
                </div>

                <button
                  onClick={() => dismiss(req.id)}
                  className="flex-shrink-0 w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
                  title="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
