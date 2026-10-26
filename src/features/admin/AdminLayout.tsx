import { Outlet, useNavigate, useLocation } from "react-router"
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
} from "lucide-react"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AddOutletModal } from "./components/AddOutletModal"
import { ZeroStateCard } from "./components/ZeroStateCard"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import type { Restaurant } from "@/types/domain"

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: BarChart3, emoji: "📊", roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Floor & Tables", path: "/admin/tables", icon: LayoutGrid, emoji: "🪑", roles: ["SUPER_OWNER", "STORE_MANAGER", "STEWARD"] },
  { label: "Menu & Modifiers", path: "/admin/menu", icon: UtensilsCrossed, emoji: "🍽️", roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Orders & Settlements", path: "/admin/orders", icon: Receipt, emoji: "🧾", roles: ["SUPER_OWNER", "STORE_MANAGER"] },
  { label: "Settings", path: "/admin/settings", icon: Settings, emoji: "⚙️", roles: ["SUPER_OWNER", "STORE_MANAGER"] },
] as const

function AdminSidebarContent({ onOpenAddOutlet }: { onOpenAddOutlet: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { collapsed } = useSidebar()

  const outlets = useAuthStore((s) => s.outlets)
  const currentOutlet = useAuthStore((s) => s.currentOutlet)
  const setCurrentOutlet = useAuthStore((s) => s.setCurrentOutlet)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const fetchDashboardData = useAdminStore((s) => s.fetchDashboardData)
  const tables = useAdminStore((s) => s.tables)

  const [showOutletMenu, setShowOutletMenu] = useState(false)

  const activeOutletName = currentOutlet?.name || outlets[0]?.name || "Select Outlet"
  const sampleTable = tables[0]?.tableNumber || "01"
  const displayTable = sampleTable.startsWith("T") ? sampleTable : `Table ${sampleTable}`

  const handleSelectOutlet = (outlet: Restaurant) => {
    setCurrentOutlet(outlet)
    setShowOutletMenu(false)
    fetchDashboardData(outlet.slug)
  }

  return (
    <>
      {/* Brand / Dynamic Outlet Switcher */}
      <SidebarHeader>
        <div className="flex items-center gap-2 w-full min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">🍃</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 relative">
              <button
                onClick={() => setShowOutletMenu(!showOutletMenu)}
                className="w-full flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-100 truncate">{activeOutletName}</p>
                  <p className="text-[10px] text-zinc-500">
                    {currentOutlet?.branchArea ? currentOutlet.branchArea : "Multi-Outlet Portal"}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-zinc-500 transition-transform flex-shrink-0 ml-1",
                    showOutletMenu && "rotate-180"
                  )}
                />
              </button>

              {/* Dynamic Dropdown with [+ Add New Outlet] */}
              {showOutletMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-800 animate-in fade-in-0 duration-150">
                  <div className="max-h-56 overflow-y-auto">
                    {outlets.map((outlet) => (
                      <button
                        key={outlet.id || outlet.slug}
                        onClick={() => handleSelectOutlet(outlet)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer",
                          outlet.slug === currentOutlet?.slug
                            ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                        )}
                      >
                        <div className="truncate mr-2">
                          <p className="truncate font-medium">{outlet.name}</p>
                          {outlet.branchArea && (
                            <p className="text-[10px] text-zinc-500 truncate">{outlet.branchArea}</p>
                          )}
                        </div>
                        {outlet.slug === currentOutlet?.slug && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* [+ Add New Outlet] Button */}
                  <button
                    onClick={() => {
                      setShowOutletMenu(false)
                      onOpenAddOutlet()
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer bg-zinc-950/80"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>[+ Add New Outlet]</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <SidebarTrigger className="ml-auto flex-shrink-0" />
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                    onClick={() => navigate(item.path)}
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
                <MonitorSpeaker className="h-4 w-4 flex-shrink-0 text-amber-400" />
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
                <Smartphone className="h-4 w-4 flex-shrink-0 text-emerald-400" />
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

      {/* Footer: User profile, RBAC switcher, and logout */}
      <SidebarFooter>
        <div className={cn("space-y-2", collapsed && "flex flex-col items-center")}>
          {/* User profile row */}
          <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  {user?.name || "Team Member"}
                </p>
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                  {user?.role ? user.role.replace("_", " ") : "SUPER OWNER"}
                </p>
              </div>
            )}
            <ThemeToggle variant="ghost" className="h-7 w-7 p-1 text-zinc-400 shrink-0" />
            {!collapsed && (
              <button
                onClick={() => {
                  logout()
                  navigate("/")
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
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

  const isPlatformAdmin = Boolean(
    user?.isPlatformAdmin === true || user?.role === "PLATFORM_SUPER_ADMIN"
  )

  const [impersonatingOutlet, setImpersonatingOutlet] = useState<Restaurant | null>(() => {
    try {
      const stored = sessionStorage.getItem("pangat_impersonate_outlet")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Impersonation & Tenant Isolation Router Enforcement
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const impersonateSlugOrId = params.get("impersonate") || params.get("outletId")

    if (isPlatformAdmin) {
      if (impersonateSlugOrId) {
        // Find in outlets or fetch via API
        const target = outlets.find((o) => o.id === impersonateSlugOrId || o.slug === impersonateSlugOrId)
        if (target) {
          setImpersonatingOutlet(target)
          setCurrentOutlet(target)
          sessionStorage.setItem("pangat_impersonate_outlet", JSON.stringify(target))
        }
      } else if (!impersonatingOutlet) {
        // Direct visit by platform admin without impersonation context -> redirect to Super Admin Ops Console
        navigate("/super-admin", { replace: true })
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
  }, [isPlatformAdmin, location.search, currentOutlet?.id, user?.organizationId])

  useEffect(() => {
    if (currentOutlet?.slug) {
      useAdminStore.getState().fetchDashboardData(currentOutlet.slug)
    }
  }, [currentOutlet?.slug])

  // RBAC Enforcement: If role is CHEF, lock immediately to KDS screen
  useEffect(() => {
    if (user?.role === "CHEF" && currentOutlet?.slug) {
      navigate(`/kds/${currentOutlet.slug}`, { replace: true })
    }
  }, [user?.role, currentOutlet?.slug, navigate])

  const handleExitImpersonation = () => {
    sessionStorage.removeItem("pangat_impersonate_outlet")
    setImpersonatingOutlet(null)
    navigate("/super-admin", { replace: true })
  }

  // Guided Zero-State check: If merchant has 0 outlets and is not super admin
  if (!isPlatformAdmin && (!outlets || outlets.length === 0)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <ZeroStateCard onAddOutlet={() => setAddOutletOpen(true)} />
        <AddOutletModal
          open={addOutletOpen}
          onClose={() => setAddOutletOpen(false)}
        />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebarContent onOpenAddOutlet={() => setAddOutletOpen(true)} />
      </Sidebar>
      <SidebarInset>
        {/* Impersonation Banner for Super-Admin */}
        {isPlatformAdmin && impersonatingOutlet && (
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
