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
  SidebarTrigger,
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
  User,
  Plus,
  MonitorSpeaker,
  ExternalLink,
  Smartphone,
  Loader2,
  Star,
  Boxes,
  CreditCard,
} from "lucide-react"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { AddOutletModal } from "./components/AddOutletModal"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import type { Restaurant } from "@/types/domain"

const OPERATIONS_NAV = [
  { label: "Dashboard", path: "/admin/dashboard", icon: BarChart3, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Floor & Tables", path: "/admin/tables", icon: LayoutGrid, roles: ["SUPER_OWNER", "STORE_MANAGER", "STEWARD", "CASHIER"] },
  { label: "Orders & Settlements", path: "/admin/orders", icon: Receipt, roles: ["SUPER_OWNER", "STORE_MANAGER", "CASHIER"] },
] as const

const MANAGEMENT_NAV = [
  { label: "Menu & Modifiers", path: "/admin/menu", icon: UtensilsCrossed, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Inventory & Recipes", path: "/admin/inventory", icon: Boxes, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Subscription & Billing", path: "/admin/subscription", icon: CreditCard, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Feedback & Ratings", path: "/admin/feedback", icon: Star, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Settings", path: "/admin/settings", icon: Settings, roles: ["SUPER_OWNER", "STORE_MANAGER"] },
] as const

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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xs border border-emerald-400/30 text-white font-bold text-xs select-none">
            🍃
          </div>
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
          <SidebarTrigger className="ml-auto flex-shrink-0" />
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
                      <span className="truncate">{item.label}</span>
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
                      <span className="truncate">{item.label}</span>
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

      {/* Footer: User profile, theme toggle, and logout */}
      <SidebarFooter>
        <div className={cn("space-y-2", collapsed && "flex flex-col items-center")}>
          <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 text-white shadow-xs ring-1 ring-emerald-500/20">
              <User className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate leading-snug">
                  {user?.name || "Team Member"}
                </p>
                <span className="inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase tracking-wider">
                  {user?.role ? user.role.replace("_", " ") : "SUPER OWNER"}
                </span>
              </div>
            )}
            <ThemeToggle variant="ghost" className="h-8 w-8 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0" />
            {!collapsed && (
              <button
                onClick={() => {
                  logout()
                  navigate("/")
                }}
                className="h-8 w-8 p-1.5 rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
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

  const handleExitImpersonation = () => {
    sessionStorage.removeItem("pangat_impersonate_outlet")
    setImpersonatingOutlet(null)
    navigate("/super-admin", { replace: true })
  }

  if (isResolvingOutlets) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
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
        {/* Mobile Header (< 768px) with menu trigger, brand, and theme toggle */}
        <header className="sticky top-0 z-30 flex md:hidden items-center justify-between h-14 px-3.5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shrink-0 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="text-zinc-700 dark:text-zinc-200" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm select-none">🍃</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {currentOutlet?.name || "Pangat"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle variant="ghost" className="h-9 w-9 p-2 rounded-xl text-zinc-600 dark:text-zinc-400" />
          </div>
        </header>

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
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">🍃</span>
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
        <Outlet />
      </SidebarInset>

      {/* Global Add Outlet Modal */}
      <AddOutletModal
        open={addOutletOpen}
        onClose={() => setAddOutletOpen(false)}
      />
    </SidebarProvider>
  )
}
