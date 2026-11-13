import '@/features/landing/landing.css'
import * as React from 'react'
import { Outlet, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProvisionStore } from './useProvisionStore'
import { usePlatformNotices } from './usePlatformNotices'
import { UserMenu, type MenuEntry } from '@/components/console/UserMenu'
import { ConsoleOverlays } from '@/components/console/ConsoleOverlays'
import { TopBar } from '@/components/console/TopBar'
import { useConsoleUi } from '@/components/console/useConsoleUi'
import type { CommandItem } from '@/components/console/types'
import { PangatLogo } from '@/components/ui/PangatLogo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  BarChart3,
  Inbox,
  Building2,
  Store,
  Activity,
  LogOut,
  Plus,
  Layers,
  ArrowUpRight,
  CreditCard,
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

const FEEDBACK_MAIL = 'mailto:hello@pangat.app?subject=Pangat%20ops%20console%20feedback'
const SUPPORT_LINK = 'https://wa.me/919890000000?text=Hi%20Pangat%20team%2C%20I%20need%20help%20with%20the%20ops%20console.'

/** G then <key> go-to shortcuts for the platform console */
const GO_KEYS: Record<string, OpsTabId> = { o: 'overview', l: 'leads', b: 'organizations', r: 'outlets', s: 'subscriptions', h: 'health' }
const GO_LABEL: Record<string, string> = { overview: 'G O', leads: 'G L', organizations: 'G B', outlets: 'G R', subscriptions: 'G S', health: 'G H' }

function OpsSidebar({
  activeTab,
  onSelect,
  menuEntries,
  name,
  email,
}: {
  activeTab: OpsTabId
  onSelect: (t: OpsTabId) => void
  menuEntries: MenuEntry[]
  name: string
  email?: string
}) {
  const { collapsed, closeMobile } = useSidebar()
  const navigate = useNavigate()
  return (
    <>
      <SidebarHeader>
        <div className="flex min-w-0 items-center gap-2.5">
          <PangatLogo size="sm" className="shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-[15px] font-semibold tracking-tight text-white">Pangat</span>
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Ops</span>
              </div>
              <p className="truncate text-[11px] text-zinc-500">Platform console</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarMenu>
            {OPS_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <SidebarMenuItem key={tab.id}>
                  <SidebarMenuButton
                    isActive={activeTab === tab.id}
                    tooltip={tab.label}
                    onClick={() => {
                      onSelect(tab.id)
                      closeMobile()
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="flex-1 truncate text-left">{tab.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Portals</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Merchant portal"
                onClick={() => {
                  closeMobile()
                  navigate('/admin/dashboard')
                }}
              >
                <Layers className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="flex w-full items-center justify-between">
                    <span>Merchant portal</span>
                    <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="!p-2.5">
        <UserMenu name={name} email={email} roleLabel="Platform super admin" entries={menuEntries} collapsed={collapsed} />
      </SidebarFooter>
    </>
  )
}

export function SuperAdminLayout() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const openProvisionNew = useProvisionStore((s) => s.openNew)
  const setShortcuts = useConsoleUi((s) => s.setShortcuts)
  const setChangelog = useConsoleUi((s) => s.setChangelog)
  const [mounted, setMounted] = React.useState(false)

  const rawTab = searchParams.get('tab')
  const activeTab: OpsTabId = OPS_TABS.some((t) => t.id === rawTab) ? (rawTab as OpsTabId) : 'overview'
  const handleTabSelect = React.useCallback((tabId: OpsTabId) => setSearchParams({ tab: tabId }), [setSearchParams])
  const notices = usePlatformNotices(React.useCallback((t) => handleTabSelect(t), [handleTabSelect]))

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!user || user.role !== 'PLATFORM_SUPER_ADMIN') {
    return <Navigate to="/login" replace />
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
    { label: 'What’s new', icon: Sparkles, onSelect: () => setChangelog(true) },
    { label: 'Send feedback', icon: MessageSquareText, href: FEEDBACK_MAIL, divider: true },
    { label: 'Sign out', icon: LogOut, danger: true, divider: true, onSelect: handleLogout },
  ]
  const commandItems: CommandItem[] = [
    { id: 'provision', label: 'Provision a restaurant', group: 'Actions', icon: Plus, keywords: 'new onboard create brand', run: openProvisionNew },
    ...OPS_TABS.map((t) => ({ id: t.id, label: t.label, group: 'Go to', icon: t.icon, shortcut: GO_LABEL[t.id], run: () => handleTabSelect(t.id) })),
    { id: 'merchant', label: 'Open merchant portal', group: 'Go to', icon: Layers, keywords: 'admin dashboard', run: () => navigate('/admin/dashboard') },
    { id: 'shortcuts', label: 'Keyboard shortcuts', group: 'Help', icon: Keyboard, shortcut: '?', run: () => setShortcuts(true) },
    { id: 'changelog', label: 'What’s new', group: 'Help', icon: Sparkles, keywords: 'changelog updates', run: () => setChangelog(true) },
    { id: 'signout', label: 'Sign out', group: 'Account', icon: LogOut, run: handleLogout },
  ]
  const shortcutRows = [
    { keys: 'Ctrl K', label: 'Open the command palette' },
    { keys: '?', label: 'Show keyboard shortcuts' },
    ...OPS_TABS.map((t) => ({ keys: GO_LABEL[t.id], label: `Go to ${t.label}` })),
    { keys: 'Ctrl B', label: 'Show or hide the sidebar' },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <OpsSidebar activeTab={activeTab} onSelect={handleTabSelect} menuEntries={menuEntries} name={user.name} email={user.email} />
      </Sidebar>

      <SidebarInset>
        <TopBar
          trail={['Platform', OPS_TABS.find((t) => t.id === activeTab)?.label || 'Overview']}
          mobileTitle="Pangat Ops"
          notices={notices.items}
          noticesLoading={notices.loading}
          feedbackHref={FEEDBACK_MAIL}
          helpHref={SUPPORT_LINK}
          actions={
            <button
              type="button"
              onClick={openProvisionNew}
              className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-[13px] font-semibold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Provision restaurant</span>
              <span className="sm:hidden">New</span>
            </button>
          }
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </SidebarInset>

      <ConsoleOverlays items={commandItems} goTo={goTo} shortcutRows={shortcutRows} />
    </SidebarProvider>
  )
}
