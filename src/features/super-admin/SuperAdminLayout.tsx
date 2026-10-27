import * as React from 'react'
import { Outlet, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { PangatLogo } from '@/components/ui/PangatLogo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  BarChart3,
  Inbox,
  Building2,
  Store,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  ArrowUpRight,
  Shield,
} from 'lucide-react'

export const OPS_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, emoji: '📊' },
  { id: 'leads', label: 'Inbound Leads', icon: Inbox, emoji: '📥' },
  { id: 'organizations', label: 'Organizations', icon: Building2, emoji: '🏢' },
  { id: 'outlets', label: 'Outlets & Branches', icon: Store, emoji: '🏪' },
  { id: 'health', label: 'System Health', icon: Activity, emoji: '🛠' },
] as const

export type OpsTabId = (typeof OPS_TABS)[number]['id']

export function SuperAdminLayout() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  const activeTab: OpsTabId =
    (searchParams.get('tab') as OpsTabId) || 'overview'

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isPlatformSuperAdmin = user?.role === 'PLATFORM_SUPER_ADMIN'

  if (!user || !isPlatformSuperAdmin) {
    return <Navigate to="/login" replace />
  }

  const handleTabSelect = (tabId: OpsTabId) => {
    setSearchParams({ tab: tabId })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dark min-h-screen bg-black text-zinc-100 flex font-sans selection:bg-amber-500 selection:text-zinc-950 antialiased overflow-x-hidden">
      {/* ── High-Density Enterprise Operations Sidebar ─────────────────────── */}
      <aside
        className={`relative z-30 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between transition-all duration-200 select-none ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <PangatLogo size="sm" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">Pangat</span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 uppercase">
                    Ops
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate">Platform Super-Admin</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Operations Toolkit
            </p>
          )}

          {OPS_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
                } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                title={tab.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                {!sidebarCollapsed && (
                  <span className="truncate">{tab.label}</span>
                )}
              </button>
            )
          })}

          {/* Quick jump to Merchant Dashboard (Zero impersonation) */}
          <div className="pt-4 mt-4 border-t border-zinc-800/80">
            {!sidebarCollapsed && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Portals
              </p>
            )}
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer ${
                sidebarCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Merchant Portal"
            >
              <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Merchant Portal</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Admin profile & logout */}
        <div className="p-3 border-t border-zinc-800/80 space-y-2">
          <div className={`flex items-center gap-2.5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-amber-400/90 truncate flex items-center gap-1 font-semibold">
                  <Shield className="w-2.5 h-2.5" />
                  <span>PLATFORM SUPER ADMIN</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleLogout}
              className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title="Sign out of operations console"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
            <ThemeToggle variant="ghost" className="h-7 w-7 p-1 text-zinc-400 shrink-0" />
          </div>
        </div>
      </aside>

      {/* ── Main Operations Canvas ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        {/* Top Operational Header */}
        <header className="h-14 border-b border-zinc-800 px-4 sm:px-8 flex items-center justify-between bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-mono">Platform Ops</span>
            <span className="text-zinc-600 font-mono">/</span>
            <span className="font-semibold text-white capitalize font-mono">
              {OPS_TABS.find((t) => t.id === activeTab)?.label || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/50 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Neon DB Online</span>
            </div>

            <button
              type="button"
              onClick={() => {
                const trigger = document.getElementById('super-admin-provision-trigger')
                if (trigger) trigger.click()
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Provision Restaurant</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
