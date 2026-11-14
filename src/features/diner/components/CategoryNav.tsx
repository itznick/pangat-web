import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface CategoryItem {
  id: string
  name: string
}

interface CategoryNavProps {
  categories: CategoryItem[]
  activeId: string
  onChange: (categoryId: string) => void
}

export function CategoryNav({ categories, activeId, onChange }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // Stick directly under the (variable-height) top bar instead of assuming a fixed offset
  const [top, setTop] = useState(88)
  useLayoutEffect(() => {
    const bar = document.getElementById("diner-topbar")
    if (!bar) return
    const measure = () => setTop(Math.round(bar.getBoundingClientRect().height))
    measure()
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(measure)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [])

  // Keep the selected chip visible when the row overflows horizontally
  useEffect(() => {
    const box = scrollRef.current
    const active = box?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!box || !active) return
    const a = active.getBoundingClientRect()
    const b = box.getBoundingClientRect()
    if (a.left < b.left || a.right > b.right) box.scrollTo({ left: box.scrollLeft + (a.left - b.left) - (b.width - a.width) / 2, behavior: "smooth" })
  }, [activeId])

  return (
    <div style={{ top }} className="sticky z-20 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          type="button"
          aria-pressed={activeId === "all"}
          onClick={() => onChange("all")}
          className={cn(
            "flex-shrink-0 min-h-10 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap",
            activeId === "all"
              ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/25"
              : "bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={activeId === cat.id}
            onClick={() => onChange(cat.id)}
            className={cn(
              "flex-shrink-0 min-h-10 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap",
              activeId === cat.id
                ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                : "bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
