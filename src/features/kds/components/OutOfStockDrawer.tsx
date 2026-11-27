import { useMemo, useState } from "react"
import { X, AlertTriangle, Search } from "lucide-react"
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { useKdsStore } from "@/stores/useKdsStore"
import { cn } from "@/lib/utils"

interface OutOfStockDrawerProps {
  open: boolean
  onClose: () => void
}

export function OutOfStockDrawer({ open, onClose }: OutOfStockDrawerProps) {
  const outOfStockIds = useKdsStore((s) => s.outOfStockIds)
  const toggleOutOfStock = useKdsStore((s) => s.toggleOutOfStock)
  // the kitchen's own copy of the menu: a chef who signs in straight to this screen never loads the admin app
  const menuItems = useKdsStore((s) => s.menuItems)
  const categoryNameMap = useKdsStore((s) => s.categoryNames)
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const shown = useMemo(
    // menu order is kept: a row that jumps away the moment it is toggled would be tapped by mistake
    () => menuItems.filter((i) => !q || i.name.toLowerCase().includes(q) || (categoryNameMap[i.categoryId] || "").toLowerCase().includes(q)),
    [menuItems, q, categoryNameMap],
  )

  return (
    <Drawer open={open} onClose={onClose} className="flex max-h-[85dvh] flex-col">
      <DrawerHeader className="shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <DrawerTitle className="truncate">Out of Stock / Sold Out Items</DrawerTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 px-0 text-xs text-zinc-500">
          Toggle items to mark them as unavailable across diner menus in real time.
        </p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            aria-label="Search dishes"
            className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </div>
      </DrawerHeader>

      <DrawerContent className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
        {menuItems.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-500">No dishes loaded yet. Check the connection and try again.</p>
        ) : shown.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-500">No dish matches “{query}”.</p>
        ) : (
          <div className="space-y-1">
            {shown.map((item) => {
              const is86d = outOfStockIds.has(item.id)
              const catName = categoryNameMap[item.categoryId] || ""

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex min-h-14 items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors",
                    is86d ? "border border-rose-500/20 bg-rose-950/30" : "hover:bg-zinc-800/50"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-lg">{item.imageUrl}</span>
                    <div className="min-w-0">
                      <p className={cn("truncate text-sm font-medium", is86d ? "text-rose-300 line-through" : "text-zinc-200")}>
                        {item.name}
                      </p>
                      {catName && <p className="truncate text-xs text-zinc-500">{catName}</p>}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn("text-xs font-semibold", is86d ? "text-rose-400" : "text-zinc-500")}>
                      {is86d ? "Out of Stock" : "In Stock"}
                    </span>
                    <Switch
                      checked={!is86d}
                      aria-label={`${item.name}: ${is86d ? "out of stock, switch on to make available" : "in stock, switch off to mark sold out"}`}
                      onCheckedChange={() => toggleOutOfStock(item.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
