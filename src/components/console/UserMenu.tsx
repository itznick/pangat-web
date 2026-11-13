import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { cn } from "@/lib/utils"

export interface MenuEntry {
  label: string
  icon: React.ElementType
  onSelect?: () => void
  href?: string
  shortcut?: string
  danger?: boolean
  /** Draw a divider above this entry */
  divider?: boolean
}

interface UserMenuProps {
  name: string
  email?: string
  roleLabel: string
  entries: MenuEntry[]
  collapsed?: boolean
}

/** Account popover anchored to the bottom of a sidebar. Opens upward, closes on outside click / Esc. */
export function UserMenu({ name, email, roleLabel, entries, collapsed }: UserMenuProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  useEscapeKey(open, () => setOpen(false))

  React.useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const initial = (name || "U").trim().charAt(0).toUpperCase()

  return (
    <div ref={ref} className="relative">
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute bottom-full z-50 mb-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e12] p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-1 zoom-in-95 duration-150",
            collapsed ? "left-0 w-64" : "inset-x-0"
          )}
        >
          <div className="px-3 pb-2 pt-2.5">
            <p className="truncate text-[13px] font-medium text-white">{name}</p>
            {email && <p className="truncate text-xs text-zinc-500">{email}</p>}
          </div>
          {entries.map((e) => {
            const Icon = e.icon
            const cls = cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors",
              e.danger ? "text-rose-300 hover:bg-rose-500/10" : "text-zinc-200 hover:bg-white/[0.07] hover:text-white"
            )
            const inner = (
              <>
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                <span className="flex-1">{e.label}</span>
                {e.shortcut && <span className="text-[11px] text-zinc-600">{e.shortcut}</span>}
              </>
            )
            return (
              <React.Fragment key={e.label}>
                {e.divider && <div className="mx-2 my-1.5 h-px bg-white/[0.07]" />}
                {e.href ? (
                  <a role="menuitem" href={e.href} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className={cls}>
                    {inner}
                  </a>
                ) : (
                  <button
                    role="menuitem"
                    type="button"
                    className={cls}
                    onClick={() => {
                      setOpen(false)
                      e.onSelect?.()
                    }}
                  >
                    {inner}
                  </button>
                )}
              </React.Fragment>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={collapsed ? name : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.06]",
          open && "bg-white/[0.06]",
          collapsed && "justify-center"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-[13px] font-semibold text-zinc-950">
          {initial}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-white">{name}</span>
              <span className="block truncate text-[11px] text-zinc-500">{roleLabel}</span>
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
          </>
        )}
      </button>
    </div>
  )
}
