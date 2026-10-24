import { useState, useEffect } from "react"
import { Wifi, WifiOff, Leaf, Drumstick } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore, type DietaryFilter } from "@/stores/useCartStore"

interface DinerTopBarProps {
  cafeName: string
  tableId: string
}

export function DinerTopBar({ cafeName, tableId }: DinerTopBarProps) {
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
    <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
      {/* Row 1: Cafe name + connectivity */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-base font-bold text-zinc-100 tracking-tight">{cafeName}</h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">Table {tableId}</p>
        </div>
        {/* Connectivity pill */}
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

      {/* Row 2: Dietary toggle pills */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium">Filter:</span>
        <button
          onClick={() => handleDietaryToggle("VEG")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
            dietaryFilter === "VEG"
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-transparent border-zinc-700 text-zinc-400 hover:border-emerald-600/50 hover:text-emerald-400"
          )}
        >
          <Leaf className="h-3 w-3" />
          Veg
        </button>
        <button
          onClick={() => handleDietaryToggle("NON_VEG")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
            dietaryFilter === "NON_VEG"
              ? "bg-rose-600 border-rose-600 text-white"
              : "bg-transparent border-zinc-700 text-zinc-400 hover:border-rose-600/50 hover:text-rose-400"
          )}
        >
          <Drumstick className="h-3 w-3" />
          Non-Veg
        </button>
      </div>
    </div>
  )
}
