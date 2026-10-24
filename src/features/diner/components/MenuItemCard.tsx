import { useState } from "react"
import { Plus, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuItem } from "@/types/domain"

interface MenuItemCardProps {
  item: MenuItem
  isOutOfStock?: boolean
  onAdd: (item: MenuItem) => void
}

export function MenuItemCard({ item, isOutOfStock = false, onAdd }: MenuItemCardProps) {
  const [pressed, setPressed] = useState(false)
  const available = item.isAvailable && !isOutOfStock

  const handleAdd = () => {
    if (!available) return
    setPressed(true)
    onAdd(item)
    setTimeout(() => setPressed(false), 300)
  }

  return (
    <div
      className={cn(
        "flex gap-3 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 transition-all duration-200",
        !available && "opacity-50",
        available && "hover:border-zinc-700 hover:bg-zinc-800/80"
      )}
    >
      {/* Emoji thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center text-3xl border border-zinc-700">
        {item.imageUrl}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-0.5">
          {/* Veg / Non-Veg indicator */}
          <div
            className={cn(
              "mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center",
              item.isVeg ? "border-emerald-500" : "border-rose-500"
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                item.isVeg ? "bg-emerald-500" : "bg-rose-500"
              )}
            />
          </div>

          <h3 className="text-sm font-semibold text-zinc-100 leading-tight flex-1">
            {item.name}
            {item.isPopular && (
              <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                <Star className="h-2.5 w-2.5 fill-current" />
                Popular
              </span>
            )}
          </h3>
        </div>

        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-zinc-100">
            ₹{item.price}
          </span>

          {available ? (
            <button
              onClick={handleAdd}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold",
                "transition-all duration-200 active:scale-95 hover:bg-emerald-500",
                "shadow-md shadow-emerald-600/30",
                pressed && "scale-95 bg-emerald-700"
              )}
            >
              <Plus className={cn("h-3.5 w-3.5 transition-transform duration-200", pressed && "rotate-90")} />
              Add
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-500 text-xs font-medium">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
