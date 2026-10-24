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
  Building2,
  User,
} from "lucide-react"
import { useAdminStore } from "@/stores/useAdminStore"
import { useState } from "react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: BarChart3, emoji: "📊" },
  { label: "Floor & Tables", path: "/admin/tables", icon: LayoutGrid, emoji: "🪑" },
  { label: "Menu & Modifiers", path: "/admin/menu", icon: UtensilsCrossed, emoji: "🍽️" },
  { label: "Orders & Settlements", path: "/admin/orders", icon: Receipt, emoji: "🧾" },
  { label: "Settings", path: "/admin/settings", icon: Settings, emoji: "⚙️" },
] as const

const OUTLETS = [
  "The Pangat – Bandra",
  "The Pangat – Colaba",
  "The Pangat – Andheri",
]

function AdminSidebarContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { collapsed } = useSidebar()
  const restaurant = useAdminStore((s) => s.restaurant)
  const setRestaurantName = useAdminStore((s) => s.setRestaurantName)
  const [showOutletMenu, setShowOutletMenu] = useState(false)

  return (
    <>
      {/* Brand / Outlet Switcher */}
      <SidebarHeader>
        <div className="flex items-center gap-2 w-full min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">🍃</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 relative">
              <button
                onClick={() => setShowOutletMenu(!showOutletMenu)}
                className="w-full flex items-center justify-between text-left group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-100 truncate">{restaurant.name}</p>
                  <p className="text-[10px] text-zinc-500">Owner Portal</p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-zinc-500 transition-transform flex-shrink-0 ml-1",
                    showOutletMenu && "rotate-180"
                  )}
                />
              </button>
              {showOutletMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {OUTLETS.map((outlet) => (
                    <button
                      key={outlet}
                      onClick={() => {
                        setRestaurantName(outlet)
                        setShowOutletMenu(false)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs transition-colors",
                        outlet === restaurant.name
                          ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                          : "text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                      )}
                    >
                      <Building2 className="inline h-3 w-3 mr-1.5 text-zinc-500" />
                      {outlet}
                    </button>
                  ))}
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
      </SidebarContent>

      {/* Footer: user profile + logout */}
      <SidebarFooter>
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">Rohan Kamble</p>
              <p className="text-[10px] text-zinc-500">Owner</p>
            </div>
          )}
          {!collapsed && (
            <button
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </>
  )
}

export function AdminLayout() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebarContent />
      </Sidebar>
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
