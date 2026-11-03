import * as React from "react"
import { cn } from "@/lib/utils"

// Sidebar context
interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = React.createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  toggleMobile: () => {},
  closeMobile: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

const SidebarProvider = ({ children, defaultCollapsed = false }: SidebarProviderProps) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const toggleMobile = () => setMobileOpen((prev) => !prev)
  const closeMobile = () => setMobileOpen(false)

  // Close mobile sidebar on resize to desktop
  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
      }
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
        toggleMobile,
        closeMobile,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

const Sidebar = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { collapsed, mobileOpen, closeMobile } = useSidebar()
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in-0 duration-200"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl transition-transform duration-200 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {children}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-64",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    </>
  )
}

const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0", className)} {...props} />
)

const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 overflow-y-auto py-4", className)} {...props} />
)

const SidebarFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("border-t border-zinc-200 dark:border-zinc-800 p-4 shrink-0", className)} {...props} />
)

const SidebarGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-2 mb-4", className)} {...props} />
)

const SidebarGroupLabel = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { collapsed } = useSidebar()
  return (
    <p
      className={cn(
        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 transition-opacity",
        collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100",
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

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  tooltip?: string
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, children, tooltip, ...props }, ref) => {
    const { collapsed } = useSidebar()
    return (
      <button
        ref={ref}
        title={collapsed ? tooltip : undefined}
        data-active={isActive ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-medium transition-all duration-150 cursor-pointer select-none",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100",
          isActive
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-500/15"
            : "text-zinc-600 dark:text-zinc-400",
          collapsed ? "justify-center px-2" : "",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarTrigger = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { collapsed, setCollapsed, toggleMobile } = useSidebar()
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          toggleMobile()
        } else {
          setCollapsed(!collapsed)
        }
      }}
      className={cn(
        "h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer",
        className
      )}
      aria-label="Toggle navigation menu"
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  )
}

const SidebarInset = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden", className)} {...props} />
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
