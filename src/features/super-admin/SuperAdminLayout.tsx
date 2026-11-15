import '@/features/landing/landing.css'
import * as React from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProvisionStore } from './useProvisionStore'
import { usePlatformNotices } from './usePlatformNotices'
import { UserMenu, type MenuEntry } from '@/components/console/UserMenu'
import { ConsoleOverlays } from '@/components/console/ConsoleOverlays'
import { TopBar } from '@/components/console/TopBar'
import { useConsoleUi } from '@/components/console/useConsoleUi'
import type { CommandItem } from '@/components/console/types'
import { PangatLogo } from '@/components/ui/PangatLogo'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { Keyboard, Layers, LogOut, MessageSquareText, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALL_NAV, LEGACY_TABS, NAV } from './nav'
import { usePerms } from './hooks'
const ProvisionRestaurantModal = React.lazy(() => import('./components/ProvisionRestaurantModal').then((m) => ({ default: m.ProvisionRestaurantModal })))
import { Pill } from './ui/kit'

const ROLE_LABEL: Record<string, string> = { OWNER: 'Platform owner', ADMIN: 'Administrator', FINANCE: 'Finance', SUPPORT: 'Support', ANALYST: 'Read-only analyst' }
const FEEDBACK_MAIL = 'mailto:hello@pangat.app?subject=Pangat%20control%20centre%20feedback'
const SUPPORT_LINK = 'https://wa.me/919890000000?text=Hi%20Pangat%20team%2C%20I%20need%20help%20with%20the%20control%20centre.'

const SaSidebar = React.memo(function SaSidebar({ menuEntries, name, email, roleLabel }: { menuEntries: MenuEntry[]; name: string; email?: string; roleLabel: string }) {
  const { collapsed, closeMobile } = useSidebar()
  const navigate = useNavigate()
  const { can } = usePerms()
  return (
    <>
      <SidebarHeader>
        <div className="df flex min-w-0 items-center gap-2.5">
          <PangatLogo size="sm" className="shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-[15px] font-semibold tracking-tight text-white">Pangat</span>
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Control</span>
              </div>
              <p className="truncate text-[11px] text-zinc-500">Platform control centre</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((g) => {
          const items = g.items.filter((i) => can(i.perm))
          if (items.length === 0) return null
          return (
            <SidebarGroup key={g.label}>
              <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
              <SidebarMenu>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.id}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={closeMobile}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          cn(
                            'df group flex h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-[13.5px] font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-500',
                            collapsed && 'justify-center px-0',
                            isActive ? 'bg-emerald-500/12 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.22)]' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white',
                          )
                        }
                      >
                        <Icon className="h-[17px] w-[17px] shrink-0" />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          )
        })}
        <SidebarGroup>
          <SidebarGroupLabel>Portals</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <button
                onClick={() => {
                  closeMobile()
                  navigate('/admin/dashboard')
                }}
                className={cn('df flex h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-[13.5px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white', collapsed && 'justify-center px-0')}
              >
                <Layers className="h-[17px] w-[17px] shrink-0" />
                {!collapsed && <span>Merchant portal</span>}
              </button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="!p-2.5">
        <UserMenu name={name} email={email} roleLabel={roleLabel} entries={menuEntries} collapsed={collapsed} />
      </SidebarFooter>
    </>
  )
})

export function SuperAdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { can, role } = usePerms()
  const provision = useProvisionStore()
  const setShortcuts = useConsoleUi((s) => s.setShortcuts)
  const setChangelog = useConsoleUi((s) => s.setChangelog)
  const isAdmin = user?.role === 'PLATFORM_SUPER_ADMIN'
  const notices = usePlatformNotices(navigate, Boolean(isAdmin))
  const permKey = (user?.platformPermissions ?? ['*']).join('|')
  // stable identity: the go-to shortcut (G then a letter) keeps its "armed" state across re-renders
  const goTo = React.useMemo(() => {
    const m: Record<string, () => void> = {}
    ALL_NAV.filter((n) => permKey === '*' || permKey.split('|').includes(n.perm)).forEach((n) => (m[n.key] = () => navigate(n.to)))
    return m
  }, [permKey, navigate])

  const handleLogout = React.useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])
  const openMerchant = React.useCallback(() => navigate('/admin/dashboard'), [navigate])
  const openShortcuts = React.useCallback(() => setShortcuts(true), [setShortcuts])
  const openChangelog = React.useCallback(() => setChangelog(true), [setChangelog])
  const roleLabel = ROLE_LABEL[role] ?? 'Platform admin'
  const canProvision = can('restaurants.provision')
  const openNew = provision.openNew

  const visible = React.useMemo(() => ALL_NAV.filter((n) => permKey === '*' || permKey.split('|').includes(n.perm)), [permKey])
  const menuEntries = React.useMemo<MenuEntry[]>(
    () => [
      { label: 'Keyboard shortcuts', icon: Keyboard, shortcut: '?', onSelect: openShortcuts, divider: true },
      { label: 'What’s new', icon: Sparkles, onSelect: openChangelog },
      { label: 'Send feedback', icon: MessageSquareText, href: FEEDBACK_MAIL, divider: true },
      { label: 'Sign out', icon: LogOut, danger: true, divider: true, onSelect: handleLogout },
    ],
    [openShortcuts, openChangelog, handleLogout],
  )
  const commandItems = React.useMemo<CommandItem[]>(
    () => [
      ...(canProvision ? [{ id: 'provision', label: 'Provision a restaurant', group: 'Actions', icon: Plus, keywords: 'new onboard create brand', run: openNew }] : []),
      ...visible.map((n) => ({ id: n.id, label: n.label, group: 'Go to', icon: n.icon, shortcut: `G ${n.key.toUpperCase()}`, run: () => navigate(n.to) })),
      { id: 'merchant', label: 'Open merchant portal', group: 'Go to', icon: Layers, keywords: 'admin dashboard', run: openMerchant },
      { id: 'shortcuts', label: 'Keyboard shortcuts', group: 'Help', icon: Keyboard, shortcut: '?', run: openShortcuts },
      { id: 'signout', label: 'Sign out', group: 'Account', icon: LogOut, run: handleLogout },
    ],
    [canProvision, openNew, visible, navigate, openMerchant, openShortcuts, handleLogout],
  )
  const shortcutRows = React.useMemo(
    () => [
      { keys: 'Ctrl K', label: 'Open the command palette' },
      { keys: '?', label: 'Show keyboard shortcuts' },
      ...visible.map((n) => ({ keys: `G ${n.key.toUpperCase()}`, label: `Go to ${n.label}` })),
      { keys: 'Ctrl B', label: 'Show or hide the sidebar' },
    ],
    [visible],
  )
  const current = React.useMemo(
    () => ALL_NAV.filter((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))).sort((a, b) => b.to.length - a.to.length)[0],
    [location.pathname],
  )

  if (!user || !isAdmin) return <Navigate to="/login" replace />

  // Keep old /super-admin?tab=… bookmarks working
  const legacy = location.pathname === '/super-admin' ? searchParams.get('tab') : null
  if (legacy && LEGACY_TABS[legacy] && LEGACY_TABS[legacy] !== '/super-admin') return <Navigate to={LEGACY_TABS[legacy]} replace />

  return (
    <SidebarProvider>
      <Sidebar>
        <SaSidebar menuEntries={menuEntries} name={user.name} email={user.email} roleLabel={roleLabel} />
      </Sidebar>
      <SidebarInset>
        <TopBar
          trail={['Control centre', current?.label || 'Overview']}
          mobileTitle="Pangat Control"
          notices={notices.items}
          noticesLoading={notices.loading}
          feedbackHref={FEEDBACK_MAIL}
          helpHref={SUPPORT_LINK}
          actions={
            <>
              <Pill tone="neutral" className="mr-1 hidden 2xl:inline-flex">{roleLabel}</Pill>
              {can('restaurants.provision') && (
                <button
                  type="button"
                  onClick={provision.openNew}
                  className="mr-1 inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-emerald-600 px-3 text-[13px] font-semibold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Provision restaurant</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
            </>
          }
        />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
      <ConsoleOverlays items={commandItems} goTo={goTo} shortcutRows={shortcutRows} />
      {provision.isOpen && (
        <React.Suspense fallback={null}>
          <ProvisionRestaurantModal isOpen onClose={provision.close} initialLead={provision.lead} onSuccess={provision.notifyProvisioned} />
        </React.Suspense>
      )}
    </SidebarProvider>
  )
}
