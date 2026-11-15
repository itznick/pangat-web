import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { cn } from "@/lib/utils"
import type { Restaurant } from "@/types/domain"

interface OutletSwitcherProps {
  outlets: Restaurant[]
  current: Restaurant | null
  fallbackName: string
  onSelect: (outlet: Restaurant) => void
  /** Only owners can add outlets */
  onAdd?: () => void
}

const initials = (name: string) =>
  name
    .split(/[\s–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "•"

/**
 * Outlet picker in the sidebar header. The list opens in a portal so the sidebar can never clip it,
 * supports search (for many branches) and arrow-key selection, and ends with "Add outlet".
 */
export function OutletSwitcher({ outlets, current, fallbackName, onSelect, onAdd }: OutletSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const [pos, setPos] = React.useState<{ left: number; top: number; width: number } | null>(null)
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  const close = React.useCallback(() => {
    setOpen(false)
    setQuery("")
    btnRef.current?.focus()
  }, [])
  useEscapeKey(open, close)
  // "outside" = neither the trigger nor the portaled panel
  React.useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
      setQuery("")
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open])

  const place = React.useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect()
    if (!r) return
    const width = Math.min(Math.max(r.width, 288), window.innerWidth - 16)
    setPos({ left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)), top: r.bottom + 8, width })
  }, [])

  React.useLayoutEffect(() => {
    if (!open) return
    place()
    window.addEventListener("resize", place)
    return () => window.removeEventListener("resize", place)
  }, [open, place])

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? outlets.filter((o) => `${o.name} ${o.branchArea ?? ""} ${o.slug}`.toLowerCase().includes(q)) : outlets
  }, [outlets, query])

  React.useEffect(() => {
    if (!open) return
    const i = shown.findIndex((o) => o.slug === current?.slug)
    setActive(i >= 0 ? i : 0)
  }, [open, shown, current?.slug])

  const choose = (o: Restaurant) => {
    setOpen(false)
    setQuery("")
    if (o.slug !== current?.slug) onSelect(o)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, shown.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter" && shown[active]) {
      e.preventDefault()
      choose(shown[active])
    }
  }

  const name = current?.name || fallbackName
  const area = current?.branchArea || (outlets.length > 1 ? `${outlets.length} outlets` : "Main outlet")

  return (
    <div className="min-w-0 flex-1">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Switch outlet. Current: ${name}`}
        className={cn(
          "group -m-1 flex w-[calc(100%+0.5rem)] items-center gap-2 rounded-xl p-1 text-left transition-colors hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
          open && "bg-slate-900/[0.05] dark:bg-white/[0.06]"
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{name}</span>
          <span className="block truncate text-[11px] text-zinc-500">{area}</span>
        </span>
        <ChevronsUpDown className={cn("h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-slate-700 dark:group-hover:text-zinc-300", open && "text-emerald-400")} />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Choose outlet"
            style={{ left: pos.left, top: pos.top, width: pos.width }}
            onKeyDown={onKeyDown}
            className="df fixed z-[90] overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e12] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150"
          >
            <div className="flex items-center justify-between px-4 pb-1.5 pt-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Your outlets</p>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-400">{outlets.length}</span>
            </div>

            {outlets.length > 5 && (
              <div className="px-3 pb-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search outlets…"
                    aria-label="Search outlets"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 text-[13px] text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
                  />
                </div>
              </div>
            )}

            <ul role="listbox" aria-label="Outlets" className="max-h-[min(18rem,50dvh)] overflow-y-auto px-2 pb-2">
              {shown.length === 0 ? (
                <li className="px-3 py-6 text-center text-[13px] text-zinc-500">{outlets.length === 0 ? "No outlets yet" : `No outlet matches “${query}”`}</li>
              ) : (
                shown.map((o, i) => {
                  const isCurrent = o.slug === current?.slug
                  return (
                    <li key={o.id || o.slug} role="option" aria-selected={isCurrent}>
                      <button
                        type="button"
                        onClick={() => choose(o)}
                        onMouseMove={() => setActive(i)}
                        className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors", i === active ? "bg-white/[0.07]" : "")}
                      >
                        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-semibold", isCurrent ? "bg-emerald-400/15 text-emerald-300" : "bg-white/[0.06] text-zinc-300")}>{initials(o.name)}</span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block truncate text-[13.5px]", isCurrent ? "font-semibold text-white" : "font-medium text-zinc-200")}>{o.name}</span>
                          <span className="block truncate text-xs text-zinc-500">{o.branchArea || o.slug}{o.isActive === false ? " · Inactive" : ""}</span>
                        </span>
                        {isCurrent && <Check className="h-4 w-4 shrink-0 text-emerald-400" />}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>

            {onAdd && (
              <div className="border-t border-white/[0.07] p-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onAdd()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-[13.5px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/10"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-emerald-400/40"><Plus className="h-4 w-4" /></span>
                  Add an outlet
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  )
}
