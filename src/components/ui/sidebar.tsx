import * as React from "react"
import { cn } from "@/lib/utils"

// Sidebar context
interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
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
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="flex h-screen overflow-hidden bg-zinc-950">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

const Sidebar = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { collapsed } = useSidebar()
  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-zinc-900 border-r border-zinc-800 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center px-4 py-4 border-b border-zinc-800 shrink-0", className)} {...props} />
)

const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 overflow-y-auto py-4", className)} {...props} />
)

const SidebarFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("border-t border-zinc-800 p-4 shrink-0", className)} {...props} />
)

const SidebarGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-2 mb-4", className)} {...props} />
)

const SidebarGroupLabel = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { collapsed } = useSidebar()
  return (
    <p
      className={cn(
        "px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 transition-opacity",
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
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
          "hover:bg-zinc-800 hover:text-zinc-100",
          isActive
            ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/25 hover:text-emerald-300"
            : "text-zinc-400",
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
  const { collapsed, setCollapsed } = useSidebar()
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className={cn(
        "h-8 w-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors",
        className
      )}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {collapsed ? (
          <>
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </>
        ) : (
          <>
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="15" y2="6" />
            <line x1="3" y1="18" x2="15" y2="18" />
          </>
        )}
      </svg>
    </button>
  )
}

const SidebarInset = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 flex flex-col min-w-0 overflow-hidden", className)} {...props} />
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
