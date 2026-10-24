import { useRef } from "react"
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

  return (
    <div className="sticky top-[88px] z-20 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => onChange("all")}
          className={cn(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap",
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
            onClick={() => onChange(cat.id)}
            className={cn(
              "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap",
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
