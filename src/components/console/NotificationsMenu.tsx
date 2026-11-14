import * as React from "react"
import { Tooltip } from "@/components/ui/tooltip"
import { Bell, CheckCheck } from "lucide-react"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { useOutsidePress } from "@/hooks/useModal"
import { cn } from "@/lib/utils"

export interface Notice {
  /** Stable id: an item stays "read" only while its id (and so its situation) is unchanged */
  id: string
  tone: "info" | "good" | "warn" | "bad"
  title: string
  body?: string
  icon: React.ElementType
  actionLabel?: string
  action?: () => void
}

const TONE: Record<Notice["tone"], string> = {
  info: "bg-sky-400/12 text-sky-300",
  good: "bg-emerald-400/12 text-emerald-300",
  warn: "bg-amber-300/12 text-amber-200",
  bad: "bg-rose-400/12 text-rose-300",
}

const READ_KEY = "pangat_notice_read"

function loadRead(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"))
  } catch {
    return new Set()
  }
}

/** Bell with an unread count and a popover list. Items are computed live by the caller. */
export function NotificationsMenu({ items, loading }: { items: Notice[]; loading?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [read, setRead] = React.useState<Set<string>>(loadRead)
  const ref = React.useRef<HTMLDivElement>(null)
  useEscapeKey(open, () => setOpen(false))

  useOutsidePress(open, ref, () => setOpen(false))

  const persist = (next: Set<string>) => {
    setRead(next)
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...next].slice(-200)))
    } catch {
      /* ignore */
    }
  }
  const unread = items.filter((i) => !read.has(i.id)).length

  return (
    <div ref={ref} className="relative">
      <Tooltip label="Notifications" disabled={open}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className={cn(
          "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-white dark:text-zinc-400",
          open && "bg-white/[0.07] text-white"
        )}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-zinc-950 ring-2 ring-[#050506]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      </Tooltip>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e12] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <p className="font-heading text-[15px] font-semibold text-white">Notifications</p>
            <button
              type="button"
              disabled={unread === 0}
              onClick={() => persist(new Set([...read, ...items.map((i) => i.id)]))}
              className="flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-white disabled:opacity-40"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5">
            {items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-500">
                  <Bell className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-medium text-zinc-200">{loading ? "Checking…" : "You’re all caught up"}</p>
                <p className="mt-1 text-xs text-zinc-500">New orders, low stock, reviews and billing alerts show up here.</p>
              </div>
            ) : (
              items.map((n) => {
                const Icon = n.icon
                const isUnread = !read.has(n.id)
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      persist(new Set([...read, n.id]))
                      setOpen(false)
                      n.action?.()
                    }}
                    className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white/[0.05]"
                  >
                    <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", TONE[n.tone])}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[13.5px] leading-snug", isUnread ? "font-medium text-white" : "text-zinc-400")}>{n.title}</span>
                      {n.body && <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">{n.body}</span>}
                      {n.actionLabel && <span className="mt-1.5 inline-block text-xs text-emerald-300">{n.actionLabel} →</span>}
                    </span>
                    {isUnread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-hidden />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
