import { CheckCircle2, Clock, ChefHat, Plus, Hash, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useOrderTrackingStore } from "@/stores/useCartStore"
import type { OrderStatus } from "@/types/domain"
import { useNavigate } from "react-router"

interface OrderTrackingViewProps {
  restaurantSlug: string
  tableId: string
}

const TRACKING_STEPS: { key: OrderStatus; label: string; icon: typeof Clock; description: string }[] = [
  { key: "RECEIVED", label: "Received", icon: CheckCircle2, description: "Your order has been received by the kitchen" },
  { key: "PREPARING", label: "In Kitchen", icon: ChefHat, description: "Chef is actively preparing your dishes" },
  { key: "READY", label: "Ready!", icon: CheckCircle2, description: "Your order is plated and ready to serve" },
]

export function OrderTrackingView({ restaurantSlug, tableId }: OrderTrackingViewProps) {
  const order = useOrderTrackingStore((s) => s.order)
  const advanceStatus = useOrderTrackingStore((s) => s.advanceStatus)
  const navigate = useNavigate()

  const currentStatus = order?.orderStatus ?? "RECEIVED"
  const currentStep = TRACKING_STEPS.findIndex((s) => s.key === currentStatus)
  const effectiveIndex = currentStep === -1 && currentStatus === "COMPLETED" ? 2 : Math.max(0, currentStep)
  const tokenId = order ? order.id.slice(-3).toUpperCase() : "04"

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <h1 className="text-base font-bold text-zinc-100">Live Order Tracker</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Table {tableId}</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Token */}
        <div className="text-center py-6 bg-zinc-900 rounded-2xl border border-zinc-800">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/20 border border-emerald-600/30 mb-3">
            <Hash className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-sm">Order Token</span>
          </div>
          <div className="text-5xl font-black text-zinc-100 tracking-tight">#{tokenId}</div>
          <p className="text-xs text-zinc-500 mt-2">Show this to your server</p>
        </div>

        {/* Step Tracker */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-zinc-300">Live Order Progress</h3>
            <button
              onClick={advanceStatus}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
              title="Simulate status advance (Received -> Preparing -> Ready)"
            >
              <PlayCircle className="h-3.5 w-3.5 text-emerald-400" />
              Simulate Progress
            </button>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-zinc-800" />
            <div
              className="absolute left-5 top-8 w-0.5 bg-emerald-600 transition-all duration-700"
              style={{ height: `${(effectiveIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
            />

            <div className="space-y-6">
              {TRACKING_STEPS.map((step, idx) => {
                const StepIcon = step.icon
                const isCompleted = idx < effectiveIndex || currentStatus === "COMPLETED"
                const isActive = idx === effectiveIndex && currentStatus !== "COMPLETED"
                const isPending = idx > effectiveIndex

                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-500 z-10",
                        isCompleted && "border-emerald-600 bg-emerald-600",
                        isActive && "border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/30 animate-pulse",
                        isPending && "border-zinc-700 bg-zinc-900"
                      )}
                    >
                      <StepIcon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isCompleted && "text-white",
                          isActive && "text-emerald-400",
                          isPending && "text-zinc-600"
                        )}
                      />
                    </div>
                    <div className="pt-1.5">
                      <p
                        className={cn(
                          "text-sm font-bold transition-colors",
                          (isCompleted || isActive) ? "text-zinc-100" : "text-zinc-600"
                        )}
                      >
                        {step.label}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-0.5 transition-colors",
                          isActive ? "text-emerald-400" : "text-zinc-600"
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order summary */}
        {order && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <span className="text-zinc-300">
                      {item.quantity}× {item.name}
                    </span>
                    {item.selectedModifiers.length > 0 && (
                      <p className="text-[11px] text-zinc-500">
                        {item.selectedModifiers.map((m) => m.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="text-zinc-300 font-medium">
                    ₹{((item.price + item.selectedModifiers.reduce((s, m) => s + m.price, 0)) * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 mt-3 pt-3 flex justify-between">
              <span className="text-sm font-bold text-zinc-200">Total Paid</span>
              <span className="text-sm font-bold text-emerald-400">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Add more items CTA */}
        <Button
          onClick={() => navigate(`/r/${restaurantSlug}/t/${tableId}`)}
          variant="outline"
          className="w-full h-12 rounded-xl border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add More Items to Table {tableId}
        </Button>
      </div>
    </div>
  )
}
