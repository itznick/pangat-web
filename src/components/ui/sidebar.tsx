import * as React from "react"
import { Tooltip } from "@/components/ui/tooltip"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { useFocusTrap, useScrollLock } from "@/hooks/useModal"

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar system
//  • Desktop: persistent rail that collapses to icons (state remembered).
//  • Mobile (<768px): off-canvas drawer, always shown expanded.
//  • Ctrl/⌘ B toggles whichever applies.
// Only ONE copy of the sidebar contents is ever mounted.
// ─────────────────────────────────────────────────────────────────────────────

const COLLAPSE_KEY = "pangat_sidebar_collapsed"
const MOBILE_QUERY = "(max-width: 767px)"

interface SidebarContextType {
  /** True only when the desktop rail is collapsed. The mobile drawer is never "collapsed". */
  collapsed: boolean
  isMobile: boolean
  mobileOpen: boolean
  setCollapsed: (v: boolean) => void
  setMobileOpen: (v: boolean) => void
  /** Toggles the drawer on mobile, the rail on desktop */
  toggle: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = React.createContext<SidebarContextType>({
  collapsed: false,
  isMobile: false,
  mobileOpen: false,
  setCollapsed: () => {},
  setMobileOpen: () => {},
  toggle: () => {},
  toggleMobile: () => {},
  closeMobile: () => {},
})

// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {
  return React.useContext(SidebarContext)
}

function useIsMobile() {
  const [m, setM] = React.useState(() => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches)
  React.useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return m
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

const SidebarProvider = ({ children, defaultCollapsed = false }: SidebarProviderProps) => {
  const isMobile = useIsMobile()
  const [collapsedRaw, setCollapsedRaw] = React.useState(() => {
    try {
      const v = localStorage.getItem(COLLAPSE_KEY)
      // No saved choice: tablets / small laptops start with the slim rail so content gets the room
      return v === null ? defaultCollapsed || window.innerWidth < 1100 : v === "1"
    } catch {
      return defaultCollapsed
    }
  })
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const setCollapsed = React.useCallback((v: boolean) => {
    setCollapsedRaw(v)
    try {
      localStorage.setItem(COLLAPSE_KEY, v ? "1" : "0")
    } catch {
      /* storage unavailable: still works for this session */
    }
  }, [])

  // Leaving mobile width must not leave the drawer "open"
  React.useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  // Lock page scroll while the drawer is open
  useScrollLock(isMobile && mobileOpen)

  useEscapeKey(isMobile && mobileOpen, () => setMobileOpen(false))

  const toggle = React.useCallback(() => {
    if (isMobile) setMobileOpen((o) => !o)
    else setCollapsed(!collapsedRaw)
  }, [isMobile, collapsedRaw, setCollapsed])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])

  const value = React.useMemo<SidebarContextType>(
    () => ({
      collapsed: !isMobile && collapsedRaw,
      isMobile,
      mobileOpen,
      setCollapsed,
      setMobileOpen,
      toggle,
      toggleMobile: () => setMobileOpen((o) => !o),
      closeMobile: () => setMobileOpen(false),
    }),
    [isMobile, collapsedRaw, mobileOpen, setCollapsed, toggle]
  )

  return (
    <SidebarContext.Provider value={value}>
      <div className="flex h-dvh overflow-hidden bg-zinc-50 dark:bg-[#050506] text-zinc-900 dark:text-zinc-100">{children}</div>
    </SidebarContext.Provider>
  )
}

const Sidebar = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { collapsed, isMobile, mobileOpen, closeMobile } = useSidebar()
  const mobileRef = React.useRef<HTMLElement>(null)
  useFocusTrap(isMobile && mobileOpen, mobileRef)

  if (isMobile) {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={closeMobile}
          aria-hidden="true"
        />
        <aside
          ref={mobileRef}
          aria-label="Navigation"
          aria-hidden={!mobileOpen}
          inert={!mobileOpen}
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-full w-[19rem] max-w-[86vw] flex-col border-r border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-white/[0.07] dark:bg-[#09090b]",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {children}
        </aside>
      </>
    )
  }

  return (
    <aside
      aria-label="Navigation"
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        "relative z-30 flex h-full shrink-0 flex-col border-r border-zinc-200 bg-white transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-white/[0.07] dark:bg-[#09090b]",
        // collapsed rail must not clip popovers (account menu) that open beside it
        collapsed ? "w-[68px] overflow-visible" : "w-64 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { collapsed } = useSidebar()
  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-b border-zinc-200 py-4 dark:border-white/[0.07]",
        collapsed ? "justify-center px-2" : "px-4",
        className
      )}
      {...props}
    />
  )
}

const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 overflow-y-auto overflow-x-hidden py-3", className)} {...props} />
)

const SidebarFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("shrink-0 border-t border-zinc-200 p-3 dark:border-white/[0.07]", className)} {...props} />
)

const SidebarGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-3 px-2.5", className)} {...props} />
)

const SidebarGroupLabel = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { collapsed } = useSidebar()
  // Collapsed: a hairline replaces the label so groups stay visually separated
  if (collapsed) return <div className="mx-3 mb-2 mt-1 h-px bg-zinc-200 dark:bg-white/[0.07]" aria-hidden />
  return (
    <p
      className={cn(
        "mb-1 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-600",
        className
      )}
      {...props}
    />
  )
}

const SidebarMenu = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn("space-y-0.5", className)} {...props} />
)

const SidebarMenuItem = ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li className={cn("", className)} {...props} />
)

interface SidebarMenuButtonProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "onClick"> {
  isActive?: boolean
  tooltip?: string
  /** When set, renders a real link (right-click / middle-click / open in new tab all work) */
  href?: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

/** True for a plain left click, i.e. not "open in new tab/window" gestures. */
const isPlainClick = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

const SidebarMenuButton = React.forwardRef<HTMLElement, SidebarMenuButtonProps>(
  ({ className, isActive, children, tooltip, href, onClick, target, ...props }, ref) => {
    const { collapsed } = useSidebar()
    const cls = cn(
      "group/nav relative flex min-h-[44px] w-full cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
      "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.05] dark:hover:text-white",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
      isActive
        ? "bg-zinc-900/[0.06] font-semibold text-zinc-900 before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-[3px] before:rounded-full before:bg-emerald-400 before:content-[''] dark:bg-white/[0.08] dark:text-white [&_svg]:text-emerald-500 dark:[&_svg]:text-emerald-400"
        : "text-zinc-600 dark:text-zinc-400",
      collapsed && "justify-center px-0",
      className
    )
    const wrap = (node: React.ReactElement) =>
      collapsed && tooltip ? (
        <Tooltip label={tooltip} side="right" className="flex w-full">
          {node}
        </Tooltip>
      ) : (
        node
      )
    const common = {
      "aria-label": collapsed ? tooltip : undefined,
      "aria-current": isActive ? ("page" as const) : undefined,
      "data-active": isActive ? "true" : undefined,
      className: cls,
    }
    if (href) {
      return wrap(
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={target === "_blank" ? "noreferrer" : undefined}
          {...common}
          {...props}
          onClick={(e) => {
            if (target === "_blank") {
              onClick?.(e)
              return
            }
            if (!isPlainClick(e)) return
            e.preventDefault()
            onClick?.(e)
          }}
        >
          {children}
        </a>
      )
    }
    return wrap(
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" {...common} onClick={onClick}>
        {children}
      </button>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

/** Panel icon that opens/closes the sidebar. Lives in the top bar. */
const SidebarTrigger = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { toggle, collapsed, isMobile, mobileOpen } = useSidebar()
  const expanded = isMobile ? mobileOpen : !collapsed
  return (
    <Tooltip label={expanded ? "Close sidebar" : "Open sidebar"} hint="Ctrl B" side="bottom">
    <button
      type="button"
      onClick={toggle}
      aria-label={expanded ? "Close sidebar" : "Open sidebar"}
      aria-expanded={expanded}
      className={cn(
        "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-white",
        className
      )}
      {...props}
    >
      <PanelLeft className="h-[18px] w-[18px]" />
    </button>
    </Tooltip>
  )
}

const SidebarInset = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("console-glow flex min-w-0 flex-1 flex-col overflow-hidden", className)} {...props} />
)

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
}
