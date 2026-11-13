import * as React from "react"
import { ChevronRight, LifeBuoy, MessageSquareText, Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationsMenu, type Notice } from "./NotificationsMenu"
import { useConsoleUi } from "./useConsoleUi"

interface TopBarProps {
  /** Trail shown after the sidebar toggle, e.g. ["Orders & Settlements"] */
  trail: string[]
  /** Short brand/outlet name shown on phones in place of the trail */
  mobileTitle?: string
  notices: Notice[]
  noticesLoading?: boolean
  feedbackHref: string
  helpHref: string
  /** Extra controls rendered before the bell (e.g. a primary action) */
  actions?: React.ReactNode
}

/** Slim application bar: sidebar toggle · breadcrumb · global search · feedback / help / notifications. */
export function TopBar({ trail, mobileTitle, notices, noticesLoading, feedbackHref, helpHref, actions }: TopBarProps) {
  const setPalette = useConsoleUi((s) => s.setPalette)
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1.5 border-b border-white/[0.07] bg-[#050506]/75 px-2.5 backdrop-blur-xl sm:px-4">
      <SidebarTrigger />

      {/* Breadcrumb (desktop) / title (phone) */}
      <nav aria-label="Breadcrumb" className="ml-1 hidden min-w-0 items-center gap-1.5 text-[14px] md:flex">
        {trail.map((t, i) => (
          <React.Fragment key={t + i}>
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-700" />}
            <span className={i === trail.length - 1 ? "truncate font-medium text-white" : "truncate text-zinc-500"}>{t}</span>
          </React.Fragment>
        ))}
      </nav>
      <p className="ml-1 min-w-0 truncate text-[14px] font-medium text-white md:hidden">{mobileTitle || trail[trail.length - 1]}</p>

      {/* Global search */}
      <button
        type="button"
        onClick={() => setPalette(true)}
        className="group mx-auto hidden h-10 w-full max-w-[400px] items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-[13px] text-zinc-500 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-zinc-300 lg:flex"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">Search everything…</span>
        <span className="flex gap-1">
          <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500">{isMac ? "⌘" : "Ctrl"}</kbd>
          <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500">K</kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1 lg:ml-0">
        <button
          type="button"
          onClick={() => setPalette(true)}
          aria-label="Search"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white lg:hidden"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
        {actions}
        <a
          href={feedbackHref}
          className="hidden h-9 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white xl:flex"
        >
          <MessageSquareText className="h-4 w-4 text-zinc-500" /> Feedback
        </a>
        <a
          href={helpHref}
          target="_blank"
          rel="noreferrer"
          className="hidden h-9 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white xl:flex"
        >
          <LifeBuoy className="h-4 w-4 text-zinc-500" /> Help
        </a>
        <NotificationsMenu items={notices} loading={noticesLoading} />
      </div>
    </header>
  )
}
