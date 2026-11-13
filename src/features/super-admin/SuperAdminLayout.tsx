import * as React from 'react'
import { Outlet, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProvisionStore } from './useProvisionStore'
import { UserMenu, type MenuEntry } from '@/components/console/UserMenu'
import { ConsoleOverlays } from '@/components/console/ConsoleOverlays'
import { useConsoleUi } from '@/components/console/useConsoleUi'
import type { CommandItem } from '@/components/console/types'
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
  CreditCard,
  Search,
  Keyboard,
  Sparkles,
  MessageSquareText,
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

const SUPPORT_MAIL = 'mailto:hello@pangat.app?subject=Pangat%20ops%20console%20feedback'

/** G then <key> go-to shortcuts for the platform console */
const GO_KEYS: Record<string, OpsTabId> = { o: 'overview', l: 'leads', b: 'organizations', r: 'outlets', s: 'subscriptions', h: 'health' }
const GO_LABEL: Record<string, string> = { overview: 'G O', leads: 'G L', organizations: 'G B', outlets: 'G R', subscriptions: 'G S', health: 'G H' }

export function SuperAdminLayout() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const openProvisionNew = useProvisionStore((s) => s.openNew)
  const setPalette = useConsoleUi((s) => s.setPalette)
  const setShortcuts = useConsoleUi((s) => s.setShortcuts)
  const setChangelog = useConsoleUi((s) => s.setChangelog)
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

  const goTo: Record<string, () => void> = {}
  Object.entries(GO_KEYS).forEach(([k, tab]) => {
    goTo[k] = () => handleTabSelect(tab)
  })
  const menuEntries: MenuEntry[] = [
    { label: 'System health', icon: Activity, shortcut: 'G H', onSelect: () => handleTabSelect('health') },
    { label: 'Merchant portal', icon: Layers, onSelect: () => navigate('/admin/dashboard') },
    { label: 'Keyboard shortcuts', icon: Keyboard, shortcut: '?', onSelect: () => setShortcuts(true), divider: true },
    { label: 'What\u2019s new', icon: Sparkles, onSelect: () => setChangelog(true) },
    { label: 'Send feedback', icon: MessageSquareText, href: SUPPORT_MAIL, divider: true },
    { label: 'Sign out', icon: LogOut, danger: true, divider: true, onSelect: handleLogout },
  ]
  const commandItems: CommandItem[] = [
    { id: 'provision', label: 'Provision a restaurant', group: 'Actions', icon: Plus, keywords: 'new onboard create brand', run: openProvisionNew },
    ...OPS_TABS.map((t) => ({ id: t.id, label: t.label, group: 'Go to', icon: t.icon, shortcut: GO_LABEL[t.id], run: () => handleTabSelect(t.id) })),
    { id: 'merchant', label: 'Open merchant portal', group: 'Go to', icon: Layers, keywords: 'admin dashboard', run: () => navigate('/admin/dashboard') },
    { id: 'shortcuts', label: 'Keyboard shortcuts', group: 'Help', icon: Keyboard, shortcut: '?', run: () => setShortcuts(true) },
    { id: 'changelog', label: 'What\u2019s new', group: 'Help', icon: Sparkles, keywords: 'changelog updates', run: () => setChangelog(true) },
    { id: 'signout', label: 'Sign out', group: 'Account', icon: LogOut, run: handleLogout },
  ]
  const shortcutRows = [
    { keys: 'Ctrl K', label: 'Open the command palette' },
    { keys: '?', label: 'Show keyboard shortcuts' },
    ...OPS_TABS.map((t) => ({ keys: GO_LABEL[t.id], label: `Go to ${t.label}` })),
  ]

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
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:static md:z-auto shrink-0 border-r border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-[#09090b] flex flex-col justify-between transition-transform duration-200 ease-in-out md:transition-all select-none shadow-2xl md:shadow-none ${
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

        {/* Quick search / command palette */}
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => setPalette(true)}
            title="Search (Ctrl K)"
            className={`group flex w-full items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] text-[13px] text-zinc-500 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-zinc-300 ${
              sidebarCollapsed ? 'h-10 justify-center' : 'h-10 px-3'
            }`}
          >
            <Search className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">Search or jump to\u2026</span>
                <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500 group-hover:text-zinc-400">Ctrl K</kbd>
              </>
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

        {/* Sidebar Footer: account menu */}
        <div className="border-t border-zinc-200 p-2.5 dark:border-white/[0.07]">
          <UserMenu
            name={user.name}
            email={user.email}
            roleLabel="Platform super admin"
            entries={menuEntries}
            collapsed={sidebarCollapsed}
          />
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
              onClick={openProvisionNew}
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
      <ConsoleOverlays items={commandItems} goTo={goTo} shortcutRows={shortcutRows} />
    </div>
  )
}
