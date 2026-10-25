import { useState, useEffect } from "react"
import { Wifi, WifiOff, Leaf, Drumstick, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore, type DietaryFilter } from "@/stores/useCartStore"

interface DinerTopBarProps {
  cafeName: string
  tableId: string
  closingTime?: string
}

export function DinerTopBar({ cafeName, tableId, closingTime = "11:00 PM" }: DinerTopBarProps) {
  const [online, setOnline] = useState(true)
  const { dietaryFilter, setDietaryFilter } = useCartStore()

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleDietaryToggle = (filter: DietaryFilter) => {
    setDietaryFilter(dietaryFilter === filter ? "ALL" : filter)
  }

  return (
    <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 space-y-2.5">
      {/* Row 1: Cafe name + Table ID + Live connectivity */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-zinc-100 tracking-tight">{cafeName}</h1>
          </div>
          <p className="text-xs text-zinc-400 font-medium">Table {tableId}</p>
        </div>

        {/* Connectivity status pill */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
            online
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          )}
        >
          {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {online ? "Live" : "Offline"}
        </div>
      </div>

      {/* Row 2: Kitchen Operating Status + Dietary Filter Pills */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Kitchen status badge */}
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <Clock className="h-3 w-3 text-emerald-400/80" />
          <span>Kitchen Open • Closes at {closingTime}</span>
        </div>

        {/* Veg / Non-Veg filters */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleDietaryToggle("VEG")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
              dietaryFilter === "VEG"
                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/40"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-emerald-600/50 hover:text-emerald-400"
            )}
          >
            <Leaf className="h-3 w-3" />
            Veg
          </button>
          <button
            onClick={() => handleDietaryToggle("NON_VEG")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
              dietaryFilter === "NON_VEG"
                ? "bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-600/40"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-rose-600/50 hover:text-rose-400"
            )}
          >
            <Drumstick className="h-3 w-3" />
            Non-Veg
          </button>
        </div>
      </div>
    </div>
  )
}
