import { X, AlertTriangle } from "lucide-react"
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { useKdsStore } from "@/stores/useKdsStore"
import { useAdminStore } from "@/stores/useAdminStore"
import { CATEGORY_NAME_MAP } from "@/data/mockData"
import { cn } from "@/lib/utils"

interface OutOfStockDrawerProps {
  open: boolean
  onClose: () => void
}

export function OutOfStockDrawer({ open, onClose }: OutOfStockDrawerProps) {
  const { outOfStockIds, toggleOutOfStock } = useKdsStore()
  const menuItems = useAdminStore((s) => s.menuItems)

  return (
    <Drawer open={open} onClose={onClose} className="max-h-[80vh]">
      <DrawerHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <DrawerTitle>86'd / Sold Out Items</DrawerTitle>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-1 px-0">
          Toggle items to mark them as unavailable across diner menus in real time.
        </p>
      </DrawerHeader>

      <DrawerContent className="overflow-y-auto max-h-[60vh] pb-8">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const is86d = outOfStockIds.has(item.id)
            const catName = CATEGORY_NAME_MAP[item.categoryId] || item.categoryId

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors",
                  is86d ? "bg-rose-950/30 border border-rose-500/20" : "hover:bg-zinc-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.imageUrl}</span>
                  <div>
                    <p className={cn("text-sm font-medium", is86d ? "text-rose-300 line-through" : "text-zinc-200")}>
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">{catName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {is86d && (
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">86'd</span>
                  )}
                  <Switch
                    checked={is86d}
                    onCheckedChange={() => toggleOutOfStock(item.id)}
                    className={is86d ? "data-[state=checked]:bg-rose-600" : ""}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
