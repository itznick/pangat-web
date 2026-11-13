import '@/features/landing/landing.css'
import { Outlet, useNavigate, useLocation, Navigate } from "react-router"
import {
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
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  LayoutGrid,
  UtensilsCrossed,
  Receipt,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  MonitorSpeaker,
  ExternalLink,
  Smartphone,
  Loader2,
  Star,
  Boxes,
  CreditCard,
  Keyboard,
  Sparkles,
  LifeBuoy,
  MessageSquareText,
} from "lucide-react"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { AddOutletModal } from "./components/AddOutletModal"
import { PangatLogo } from "@/components/ui/PangatLogo"
import { UserMenu, type MenuEntry } from "@/components/console/UserMenu"
import { TopBar } from "@/components/console/TopBar"
import { SettingsModal } from "./components/SettingsModal"
import { BillingModal } from "@/features/subscriptions/components/BillingModal"
import { useAdminNotices } from "./useAdminNotices"
import { STATUS_META, useBilling } from "@/features/subscriptions/billing"
import { ConsoleOverlays } from "@/components/console/ConsoleOverlays"
import { useConsoleUi } from "@/components/console/useConsoleUi"
import type { CommandItem } from "@/components/console/types"
import type { Restaurant } from "@/types/domain"

const OPERATIONS_NAV = [
  { label: "Dashboard", path: "/admin/dashboard", icon: BarChart3, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Floor & Tables", path: "/admin/tables", icon: LayoutGrid, roles: ["SUPER_OWNER", "STORE_MANAGER", "STEWARD", "CASHIER"] },
  { label: "Orders & Settlements", path: "/admin/orders", icon: Receipt, roles: ["SUPER_OWNER", "STORE_MANAGER", "CASHIER"] },
] as const

const MANAGEMENT_NAV = [
  { label: "Menu & Modifiers", path: "/admin/menu", icon: UtensilsCrossed, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Inventory & Recipes", path: "/admin/inventory", icon: Boxes, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Feedback & Ratings", path: "/admin/feedback", icon: Star, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
] as const

const SUPPORT_WHATSAPP = "https://wa.me/919890000000?text=Hi%20Pangat%20team%2C%20I%20need%20help%20with%20my%20portal."
const FEEDBACK_MAILTO = "mailto:hello@pangat.app?subject=Pangat%20portal%20feedback"

/** "G then X" go-to shortcuts, keyed by the second key */
const GO_KEYS: Record<string, string> = {
  d: "/admin/dashboard",
  t: "/admin/tables",
  o: "/admin/orders",
  m: "/admin/menu",
  i: "/admin/inventory",
  b: "/admin/subscription",
  f: "/admin/feedback",
  s: "/admin/settings",
}
const GO_LABEL: Record<string, string> = {
  "/admin/dashboard": "G D",
  "/admin/tables": "G T",
  "/admin/orders": "G O",
  "/admin/menu": "G M",
  "/admin/inventory": "G I",
  "/admin/subscription": "G B",
  "/admin/feedback": "G F",
  "/admin/settings": "G S",
}

function AdminSidebarContent({ onOpenAddOutlet }: { onOpenAddOutlet: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { collapsed, closeMobile } = useSidebar()

  const outlets = useAuthStore((s) => s.outlets)
  const currentOutlet = useAuthStore((s) => s.currentOutlet)
  const setCurrentOutlet = useAuthStore((s) => s.setCurrentOutlet)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const fetchDashboardData = useAdminStore((s) => s.fetchDashboardData)
  const tables = useAdminStore((s) => s.tables)
  const activeOrders = useAdminStore((s) => s.activeOrders)
  const setShortcuts = useConsoleUi((s) => s.setShortcuts)
  const setChangelog = useConsoleUi((s) => s.setChangelog)

  // Live counts shown beside the nav items they belong to
  const openOrders = activeOrders.filter((o) => o.orderStatus !== "COMPLETED" && o.orderStatus !== "CANCELLED").length
  const occupied = tables.filter((t) => t.status !== "VACANT").length
  const badgeFor = (path: string) => (path === "/admin/orders" ? openOrders : path === "/admin/tables" ? occupied : 0)

  const setSettings = useConsoleUi((s) => s.setSettings)
  const setBilling = useConsoleUi((s) => s.setBilling)
  const billing = useBilling()

  const menuEntries: MenuEntry[] = [
    { label: "Settings", icon: Settings, shortcut: "G S", onSelect: () => setSettings(true) },
    { label: "Plan & billing", icon: CreditCard, shortcut: "G B", onSelect: () => setBilling(true) },
    { label: "Keyboard shortcuts", icon: Keyboard, shortcut: "?", onSelect: () => setShortcuts(true), divider: true },
    { label: "What’s new", icon: Sparkles, onSelect: () => setChangelog(true) },
    { label: "Help & support", icon: LifeBuoy, href: SUPPORT_WHATSAPP, divider: true },
    { label: "Send feedback", icon: MessageSquareText, href: FEEDBACK_MAILTO },
    { label: "Sign out", icon: LogOut, danger: true, divider: true, onSelect: () => { logout(); navigate("/") } },
  ]

  const [showOutletMenu, setShowOutletMenu] = useState(false)

  const activeOutletName =
    currentOutlet?.name ||
    outlets[0]?.name ||
    user?.organizationName ||
    "Setup First Outlet"
  const sampleTable = tables[0]?.tableNumber || "01"
  const displayTable = sampleTable.startsWith("T") ? sampleTable : `Table ${sampleTable}`

  const handleSelectOutlet = (outlet: Restaurant) => {
    setCurrentOutlet(outlet)
    setShowOutletMenu(false)
    closeMobile()
    fetchDashboardData(outlet.slug)
  }

  const isItemVisible = (roles: readonly string[]) => {
    if (!user?.role) return true
    return (roles as readonly string[]).includes(user.role)
  }

  return (
    <>
      {/* Brand / Dynamic Outlet Switcher */}
      <SidebarHeader>
        <div className="flex items-center gap-2.5 w-full min-w-0">
          <PangatLogo size="sm" className="shrink-0" />
          {!collapsed && (
            <div className="flex-1 min-w-0 relative">
              <button
                onClick={() => setShowOutletMenu(!showOutletMenu)}
                className="w-full flex items-center justify-between text-left group cursor-pointer p-1 -m-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
                aria-expanded={showOutletMenu}
                title="Switch dining outlet"
              >
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                    {activeOutletName}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {currentOutlet?.branchArea ? currentOutlet.branchArea : "Multi-Outlet Portal"}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 transition-transform flex-shrink-0",
                    showOutletMenu && "rotate-180 text-emerald-500"
                  )}
                />
              </button>

              {/* Dynamic Dropdown with [+ Add New Outlet] */}
              {showOutletMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowOutletMenu(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80 animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="max-h-56 overflow-y-auto py-1">
                      {outlets.length === 0 ? (
                        <div className="px-3 py-3 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                          No dining outlets configured yet
                        </div>
                      ) : (
                        outlets.map((outlet) => {
                          const isSelected = outlet.slug === currentOutlet?.slug
                          return (
                            <button
                              key={outlet.id || outlet.slug}
                              onClick={() => handleSelectOutlet(outlet)}
                              className={cn(
                                "w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer",
                                isSelected
                                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 font-semibold"
                                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                              )}
                            >
                              <div className="truncate mr-2">
                                <p className="truncate font-medium">{outlet.name}</p>
                                {outlet.branchArea && (
                                  <p className="text-[10px] text-zinc-500 truncate">{outlet.branchArea}</p>
                                )}
                              </div>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>

                    {/* [+ Add New Outlet] Button */}
                    <button
                      onClick={() => {
                        setShowOutletMenu(false)
                        onOpenAddOutlet()
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer bg-zinc-50 dark:bg-zinc-950/60"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Outlet</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        {/* Group 1: Operations */}
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarMenu>
            {OPERATIONS_NAV.filter((item) => isItemVisible(item.roles)).map((item) => {
              const isActive = location.pathname === item.path
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                    onClick={() => {
                      navigate(item.path)
                      closeMobile()
                    }}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {badgeFor(item.path) > 0 && (
                          <span className="min-w-5 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums text-emerald-300">
                            {badgeFor(item.path)}
                          </span>
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Group 2: Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {MANAGEMENT_NAV.filter((item) => isItemVisible(item.roles)).map((item) => {
              const isActive = location.pathname === item.path
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                    onClick={() => {
                      navigate(item.path)
                      closeMobile()
                    }}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {badgeFor(item.path) > 0 && (
                          <span className="min-w-5 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums text-emerald-300">
                            {badgeFor(item.path)}
                          </span>
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Group 3: Live Stations */}
        <SidebarGroup>
          <SidebarGroupLabel>Live Stations</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Kitchen Display (KDS)"
                onClick={() => {
                  const slug = currentOutlet?.slug || "main"
                  window.open(`/kds/${slug}`, "_blank")
                }}
              >
                <MonitorSpeaker className="h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                {!collapsed && (
                  <span className="truncate flex items-center justify-between w-full">
                    <span>Kitchen KDS</span>
                    <ExternalLink className="h-3 w-3 opacity-60 ml-1 text-zinc-400" />
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={`Sample Diner View (${displayTable})`}
                onClick={() => {
                  const slug = currentOutlet?.slug || "main"
                  window.open(`/r/${slug}/t/${sampleTable}`, "_blank")
                }}
              >
                <Smartphone className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                {!collapsed && (
                  <span className="truncate flex items-center justify-between w-full">
                    <span>Diner View ({displayTable})</span>
                    <ExternalLink className="h-3 w-3 opacity-60 ml-1 text-zinc-400" />
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: account menu */}
      <SidebarFooter className="!p-2.5">
        {!collapsed && !billing.loading && billing.plan && (
          <button
            type="button"
            onClick={() => setBilling(true)}
            className="group mb-2 flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5 text-left transition-colors hover:border-white/15 hover:bg-white/[0.06]"
          >
            <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_META[billing.status].tone === "good" ? "bg-emerald-400" : STATUS_META[billing.status].tone === "bad" ? "bg-rose-400" : "bg-amber-300")} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium text-white">{billing.plan.name}</span>
              <span className="block truncate text-[11px] text-zinc-500">
                {STATUS_META[billing.status].label}
                {billing.daysLeft !== null && billing.status === "TRIAL" ? ` · ${billing.daysLeft}d left` : ""}
              </span>
            </span>
            <span className="text-[11px] text-zinc-500 transition-colors group-hover:text-emerald-300">Manage</span>
          </button>
        )}
        <UserMenu
          name={user?.name || "Team member"}
          email={user?.email}
          roleLabel={(user?.role || "SUPER_OWNER").replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
          entries={menuEntries}
          collapsed={collapsed}
        />
      </SidebarFooter>
    </>
  )
}

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const outlets = useAuthStore((s) => s.outlets)
  const currentOutlet = useAuthStore((s) => s.currentOutlet)
  const setCurrentOutlet = useAuthStore((s) => s.setCurrentOutlet)
  const user = useAuthStore((s) => s.user)
  const [addOutletOpen, setAddOutletOpen] = useState(false)
  const notices = useAdminNotices((to) => navigate(to))

  const isPlatformSuperAdmin = user?.role === "PLATFORM_SUPER_ADMIN"

  const [isResolvingOutlets, setIsResolvingOutlets] = useState(
    (!outlets || outlets.length === 0) && Boolean(user)
  )

  const [impersonatingOutlet, setImpersonatingOutlet] = useState<Restaurant | null>(() => {
    try {
      const stored = sessionStorage.getItem("pangat_impersonate_outlet")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [impersonationError, setImpersonationError] = useState<string | null>(null)

  // Auto-resolve outlets if empty on mount
  useEffect(() => {
    if ((!outlets || outlets.length === 0) && user) {
      setIsResolvingOutlets(true)
      const resolveOutlets = async () => {
        try {
          if (isPlatformSuperAdmin) {
            const allOutlets = await api.admin.listOutlets().catch(() => [])
            if (allOutlets && allOutlets.length > 0) {
              const formatted: Restaurant[] = allOutlets.map((o) => ({
                id: o.id,
                name: o.name,
                slug: o.slug,
                branchArea: o.branchArea || undefined,
                upiVpa: o.upiVpa || 'counter@icici',
                gstPercentage: o.gstPercentage || 5,
                isVegOnly: false,
              }))
              useAuthStore.getState().setOutlets(formatted)
              setCurrentOutlet(formatted[0])
              setImpersonatingOutlet(formatted[0])
              return
            }
          }

          const orgOutlets = await api.organizations.listOutlets().catch(() => [])
          if (orgOutlets && orgOutlets.length > 0) {
            useAuthStore.getState().setOutlets(orgOutlets)
            setCurrentOutlet(orgOutlets[0])
            return
          }

          if (user.restaurantSlug) {
            const single = await api.restaurants.get(user.restaurantSlug).catch(() => null)
            if (single && single.id) {
              useAuthStore.getState().setOutlets([single])
              setCurrentOutlet(single)
              return
            }
          }
        } finally {
          setIsResolvingOutlets(false)
        }
      }
      resolveOutlets()
    } else {
      setIsResolvingOutlets(false)
    }
  }, [user?.id, outlets?.length, isPlatformSuperAdmin])

  // Impersonation & Tenant Isolation Router Enforcement
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const impersonateSlugOrId = params.get("impersonate") || params.get("outletId")

    if (isPlatformSuperAdmin) {
      if (impersonateSlugOrId) {
        const target = outlets.find((o) => o.id === impersonateSlugOrId || o.slug === impersonateSlugOrId)
        if (target) {
          setImpersonatingOutlet(target)
          setCurrentOutlet(target)
          sessionStorage.setItem("pangat_impersonate_outlet", JSON.stringify(target))
        } else {
          api.restaurants.get(impersonateSlugOrId).then((res) => {
            if (res && res.id) {
              setImpersonatingOutlet(res)
              setCurrentOutlet(res)
              sessionStorage.setItem("pangat_impersonate_outlet", JSON.stringify(res))
            } else {
              setImpersonationError(`Could not resolve restaurant '${impersonateSlugOrId}'`)
            }
          }).catch(() => {
            setImpersonationError(`Restaurant '${impersonateSlugOrId}' not found`)
          })
        }
      }
    } else if (user?.organizationId) {
      // Merchant Owner Scoping: strictly ensure currentOutlet belongs to user's organization
      if (currentOutlet && currentOutlet.organizationId && currentOutlet.organizationId !== user.organizationId) {
        const myOutlet = outlets.find((o) => o.organizationId === user.organizationId)
        if (myOutlet) {
          setCurrentOutlet(myOutlet)
        }
      }
    }
  }, [isPlatformSuperAdmin, location.search, currentOutlet?.id, user?.organizationId, outlets])

  useEffect(() => {
    if (currentOutlet?.slug) {
      useAdminStore.getState().fetchDashboardData(currentOutlet.slug)
    }
  }, [currentOutlet?.slug])

  // RBAC Enforcement: If role is CHEF or unauthenticated, redirect safely
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user?.role === "CHEF") {
    const chefSlug = currentOutlet?.slug || user?.restaurantSlug || "pangat"
    return <Navigate to={`/kds/${chefSlug}`} replace />
  }

  const visibleNav = [...OPERATIONS_NAV, ...MANAGEMENT_NAV].filter((n) => !user?.role || (n.roles as readonly string[]).includes(user.role))
  const goTo: Record<string, () => void> = {}
  Object.entries(GO_KEYS).forEach(([k, path]) => {
    if (visibleNav.some((n) => n.path === path)) goTo[k] = () => navigate(path)
  })
  goTo.s = () => useConsoleUi.getState().setSettings(true)
  goTo.b = () => useConsoleUi.getState().setBilling(true)
  const pageTitle = visibleNav.find((n) => location.pathname.startsWith(n.path))?.label ||
    (location.pathname.startsWith("/admin/subscription") ? "Plan & billing" : location.pathname.startsWith("/admin/settings") ? "Settings" : "")
  const commandItems: CommandItem[] = [
    ...visibleNav.map((n) => ({
      id: n.path,
      label: n.label,
      group: "Go to",
      icon: n.icon,
      shortcut: GO_LABEL[n.path],
      run: () => navigate(n.path),
    })),
    {
      id: "kds",
      label: "Open kitchen display",
      group: "Stations",
      icon: MonitorSpeaker,
      keywords: "kds kitchen tickets",
      run: () => window.open(`/kds/${currentOutlet?.slug || "main"}`, "_blank"),
    },
    {
      id: "diner",
      label: "Preview guest menu",
      group: "Stations",
      icon: Smartphone,
      keywords: "diner qr customer",
      run: () => window.open(`/r/${currentOutlet?.slug || "main"}/t/${useAdminStore.getState().tables[0]?.tableNumber || "01"}`, "_blank"),
    },
    ...outlets
      .filter((o) => o.slug !== currentOutlet?.slug)
      .map((o) => ({
        id: `outlet-${o.slug}`,
        label: `Switch to ${o.name}`,
        group: "Outlets",
        icon: LayoutGrid,
        keywords: "outlet branch",
        run: () => {
          setCurrentOutlet(o)
          useAdminStore.getState().fetchDashboardData(o.slug)
        },
      })),
    { id: "settings", label: "Settings", group: "Account", icon: Settings, shortcut: "G S", keywords: "outlet gst upi alerts", run: () => useConsoleUi.getState().setSettings(true) },
    { id: "billing", label: "Plan & billing", group: "Account", icon: CreditCard, shortcut: "G B", keywords: "subscription invoice gst payment", run: () => useConsoleUi.getState().setBilling(true) },
    { id: "billing-console", label: "Open billing console", group: "Account", icon: CreditCard, keywords: "invoices plans usage", run: () => navigate("/admin/subscription") },
    { id: "add-outlet", label: "Add a new outlet", group: "Outlets", icon: Plus, keywords: "branch", run: () => setAddOutletOpen(true) },
    { id: "shortcuts", label: "Keyboard shortcuts", group: "Help", icon: Keyboard, shortcut: "?", run: () => useConsoleUi.getState().setShortcuts(true) },
    { id: "changelog", label: "What’s new", group: "Help", icon: Sparkles, keywords: "changelog updates", run: () => useConsoleUi.getState().setChangelog(true) },
    { id: "support", label: "Help & support", group: "Help", icon: LifeBuoy, keywords: "whatsapp contact", run: () => window.open(SUPPORT_WHATSAPP, "_blank") },
  ]
  const shortcutRows = [
    { keys: "Ctrl K", label: "Open the command palette" },
    { keys: "?", label: "Show keyboard shortcuts" },
    ...visibleNav.filter((n) => GO_LABEL[n.path]).map((n) => ({ keys: GO_LABEL[n.path], label: `Go to ${n.label}` })),
    { keys: "G S", label: "Open settings" },
    { keys: "G B", label: "Open plan & billing" },
    { keys: "Ctrl B", label: "Show or hide the sidebar" },
  ]

  const handleExitImpersonation = () => {
    sessionStorage.removeItem("pangat_impersonate_outlet")
    setImpersonatingOutlet(null)
    navigate("/super-admin", { replace: true })
  }

  if (isResolvingOutlets) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-zinc-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          <span>Synchronizing restaurant operations...</span>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebarContent onOpenAddOutlet={() => setAddOutletOpen(true)} />
      </Sidebar>
      <SidebarInset>
        <TopBar
          trail={["Admin", ...(pageTitle ? [pageTitle] : [])]}
          mobileTitle={currentOutlet?.name || "Pangat"}
          notices={notices.items}
          noticesLoading={notices.loading}
          feedbackHref={FEEDBACK_MAILTO}
          helpHref={SUPPORT_WHATSAPP}
        />

        {/* Impersonation Error Alert */}
        {isPlatformSuperAdmin && impersonationError && (
          <div className="bg-rose-500/15 border-b border-rose-500/30 text-rose-300 px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
            <span>{impersonationError}</span>
            <button
              type="button"
              onClick={() => {
                setImpersonationError(null)
                navigate('/super-admin')
              }}
              className="text-xs underline hover:text-white"
            >
              Return to Super Admin
            </button>
          </div>
        )}
        {/* Impersonation Banner for Super-Admin */}
        {isPlatformSuperAdmin && impersonatingOutlet && (
          <div className="sticky top-0 z-50 bg-amber-400 text-zinc-950 px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-amber-500 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-[10px] bg-black text-amber-300 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                Super-Admin Impersonation Mode
              </span>
              <span>
                Viewing as <strong>{impersonatingOutlet.name}</strong>{" "}
                <span className="opacity-75">
                  ({impersonatingOutlet.branchArea || impersonatingOutlet.slug})
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleExitImpersonation}
              className="px-3 py-1 bg-black text-white hover:bg-zinc-800 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
            >
              Exit Impersonation
            </button>
          </div>
        )}

        {/* Guided banner if brand has no outlets configured yet */}
        {(!outlets || outlets.length === 0) && !isPlatformSuperAdmin && (
          <div className="bg-emerald-500/10 dark:bg-emerald-950/60 border-b border-emerald-500/20 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2.5">
              <PangatLogo size="sm" className="shrink-0" />
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">Welcome to Pangat Hospitality!</p>
                <p className="text-[11px] text-zinc-600 dark:text-emerald-300/80">No active dining outlets configured yet. Add your first branch location to generate dynamic QR codes and accept orders.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAddOutletOpen(true)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Setup Dining Outlet Now</span>
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </SidebarInset>

      <ConsoleOverlays items={commandItems} goTo={goTo} shortcutRows={shortcutRows} />
      <SettingsModal />
      <BillingModal />

      {/* Global Add Outlet Modal */}
      <AddOutletModal
        open={addOutletOpen}
        onClose={() => setAddOutletOpen(false)}
      />
    </SidebarProvider>
  )
}
