import * as React from 'react'
import { Outlet, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { PangatLogo } from '@/components/ui/PangatLogo'
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
  CreditCard,
} from 'lucide-react'

export const OPS_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, emoji: '📊' },
  { id: 'leads', label: 'Inbound Leads', icon: Inbox, emoji: '📥' },
  { id: 'organizations', label: 'Organizations', icon: Building2, emoji: '🏢' },
  { id: 'outlets', label: 'Outlets & Branches', icon: Store, emoji: '🏪' },
  { id: 'subscriptions', label: 'SaaS Subscriptions', icon: CreditCard, emoji: '💳' },
  { id: 'health', label: 'System Health', icon: Activity, emoji: '🛠' },
] as const

export type OpsTabId = (typeof OPS_TABS)[number]['id']

export function SuperAdminLayout() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false)
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
    setMobileDrawerOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-[#050506] text-zinc-900 dark:text-zinc-100 flex font-sans selection:bg-emerald-400 selection:text-zinc-950 antialiased overflow-x-hidden relative">
      {/* ── Mobile Drawer Backdrop ────────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in-0 duration-200"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── High-Density Enterprise Operations Sidebar ─────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:static md:z-30 shrink-0 border-r border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-[#09090b] flex flex-col justify-between transition-transform duration-200 ease-in-out md:transition-all select-none shadow-2xl md:shadow-none ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <PangatLogo size="sm" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white">Pangat</span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/25 uppercase tracking-wider">
                    Ops
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Platform Super-Admin</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
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
            <p className="px-3 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-600">
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
                className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-zinc-900/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-[3px] before:rounded-full before:bg-emerald-400 before:content-['']"
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
                } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                title={tab.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-400'}`} />
                {!sidebarCollapsed && (
                  <span className="truncate">{tab.label}</span>
                )}
              </button>
            )
          })}

          {/* Quick jump to Merchant Dashboard (Zero impersonation) */}
          <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-white/[0.07]">
            {!sidebarCollapsed && (
              <p className="px-3 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-600">
                Portals
              </p>
            )}
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer ${
                sidebarCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Merchant Portal"
            >
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
        <div className="p-3 border-t border-zinc-200 dark:border-white/[0.07] space-y-2">
          <div className={`flex items-center gap-2.5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user.name}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400/90 truncate flex items-center gap-1 font-semibold">
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
              className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title="Sign out of operations console"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Operations Canvas ─────────────────────────────────────────── */}
      <div className="console-glow flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-[#050506]">
        {/* Top Operational Header */}
        <header className="sticky top-0 z-20 h-14 border-b border-zinc-200 dark:border-white/[0.07] px-3.5 sm:px-8 flex items-center justify-between bg-white/90 dark:bg-[#050506]/70 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center -ml-1 mr-1"
              aria-label="Open operations menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-zinc-500 hidden sm:inline">Platform Ops</span>
            <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">/</span>
            <span className="font-semibold text-zinc-900 dark:text-white text-[13px]">
              {OPS_TABS.find((t) => t.id === activeTab)?.label || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xs:inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Platform live</span>
            </div>

            <button
              type="button"
              onClick={() => {
                const trigger = document.getElementById('super-admin-provision-trigger')
                if (trigger) trigger.click()
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20 transition-colors cursor-pointer min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Provision Restaurant</span>
              <span className="sm:hidden">Provision</span>
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
