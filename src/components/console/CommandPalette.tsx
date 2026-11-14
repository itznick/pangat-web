import * as React from "react"
import { useModal } from "@/hooks/useModal"
import { CornerDownLeft, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CommandItem } from "./types"

/** Rank: label prefix > word prefix > substring > keyword hit. Returns -1 for no match. */
function score(item: CommandItem, q: string) {
  if (!q) return 0
  const label = item.label.toLowerCase()
  if (label.startsWith(q)) return 3
  if (label.split(/\s+/).some((w) => w.startsWith(q))) return 2
  if (label.includes(q)) return 1
  if (item.keywords?.toLowerCase().includes(q)) return 0.5
  return -1
}

export function CommandPalette({ open, onClose, items }: { open: boolean; onClose: () => void; items: CommandItem[] }) {
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const listRef = React.useRef<HTMLDivElement>(null)

  const modalRef = useModal(open, onClose)

  React.useEffect(() => {
    if (open) {
      setQuery("")
      setActive(0)
    }
  }, [open])

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .map((i, order) => ({ i, s: score(i, q), order }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s || a.order - b.order)
      .map((r) => r.i)
  }, [items, query])

  React.useEffect(() => setActive(0), [query])
  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active])

  if (!open) return null

  const run = (item?: CommandItem) => {
    if (!item) return
    onClose()
    // let the overlay unmount before navigating so focus/scroll-lock are released
    setTimeout(item.run, 0)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      run(results[active])
    }
  }

  let lastGroup = ""
  return (
    <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Command palette" className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[12vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose} />
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0f] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to a page or run an action…"
            className="h-14 w-full bg-transparent text-[15px] text-white outline-none placeholder:text-zinc-600"
            aria-label="Search commands"
          />
          <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500">Esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[min(56vh,420px)] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-zinc-500">Nothing matches “{query}”.</p>
          ) : (
            results.map((item, idx) => {
              const header = item.group !== lastGroup ? item.group : null
              lastGroup = item.group
              const Icon = item.icon
              return (
                <React.Fragment key={item.id}>
                  {header && <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-600 first:pt-1">{header}</p>}
                  <button
                    type="button"
                    data-idx={idx}
                    onMouseMove={() => setActive(idx)}
                    onClick={() => run(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors",
                      idx === active ? "bg-white/[0.08] text-white" : "text-zinc-300"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", idx === active ? "text-emerald-400" : "text-zinc-500")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.shortcut && (
                      <span className="flex gap-1">
                        {item.shortcut.split(" ").map((k) => (
                          <kbd key={k} className="min-w-5 rounded-md border border-white/10 px-1.5 py-0.5 text-center text-[10px] text-zinc-500">{k}</kbd>
                        ))}
                      </span>
                    )}
                  </button>
                </React.Fragment>
              )
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1.5"><kbd className="rounded border border-white/10 px-1">↑</kbd><kbd className="rounded border border-white/10 px-1">↓</kbd> Navigate</span>
          <span className="flex items-center gap-1.5"><CornerDownLeft className="h-3 w-3" /> Open</span>
        </div>
      </div>
    </div>
  )
}
