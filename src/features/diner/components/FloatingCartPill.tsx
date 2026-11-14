import { ShoppingBag, ChevronRight } from "lucide-react"
import { useCartStore } from "@/stores/useCartStore"
import { cn } from "@/lib/utils"

interface FloatingCartPillProps {
  onViewOrder: () => void
  /** Outlet GST so the pill total matches the checkout total */
  gstPercentage?: number
  serviceChargePercentage?: number
}

export function FloatingCartPill({ onViewOrder, gstPercentage = 5, serviceChargePercentage = 0 }: FloatingCartPillProps) {
  const itemCount = useCartStore((s) => s.itemCount())
  const total = useCartStore((s) => s.total(gstPercentage, serviceChargePercentage))

  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
      <button
        type="button"
        onClick={onViewOrder}
        aria-label={`Review order, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        className={cn(
          "w-full flex items-center justify-between min-h-[48px]",
          "bg-emerald-600 rounded-2xl px-4 py-3.5",
          "shadow-2xl shadow-emerald-600/40",
          "border border-emerald-500/50",
          "transition-all duration-200 active:scale-[0.98] hover:bg-emerald-500",
          "animate-in slide-in-from-bottom-4 touch-manipulation"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <span className="text-white font-bold text-sm">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            <span className="text-emerald-200 text-xs block">Tap to review order</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-white font-bold text-base">₹{Number(total || 0).toFixed(2)}</span>
          <ChevronRight className="h-4 w-4 text-emerald-200" />
        </div>
      </button>
    </div>
  )
}
